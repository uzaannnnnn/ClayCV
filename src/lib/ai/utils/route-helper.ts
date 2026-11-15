import { NextResponse } from "next/server";
import { z } from "zod";
import { AI_LIMITS } from "@/lib/ai/gemini-config";
import { AIServiceError } from "@/lib/ai/types/ai.types";
import { checkRateLimitAndDedup } from "@/lib/ai/utils/rate-limit";

function hashSignature(text: string): string {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16);
}

export async function handleAIRouteRequest<TInput, TResult>(
  request: Request,
  routeName: string,
  schema: z.ZodType<TInput>,
  handler: (input: TInput) => Promise<{ result: TResult; model: string }>
): Promise<NextResponse> {
  try {
    const rawBody = await request.text();

    if (!rawBody || !rawBody.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Request body cannot be empty.",
          },
        },
        { status: 400 }
      );
    }

    if (Buffer.byteLength(rawBody, "utf8") > AI_LIMITS.MAX_CV_PAYLOAD_BYTES) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INPUT_TOO_LARGE",
            message: "Request payload exceeds maximum allowed size.",
          },
        },
        { status: 413 }
      );
    }

    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid JSON in request body.",
          },
        },
        { status: 400 }
      );
    }

    // Check explicit privacy consent before anything else
    if (
      typeof parsedJson === "object" &&
      parsedJson !== null &&
      (parsedJson as Record<string, unknown>).consentAccepted !== true
    ) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "CONSENT_REQUIRED",
            message:
              "Explicit user consent is required before transmitting CV data to Google Gemini API.",
          },
        },
        { status: 403 }
      );
    }

    const validation = schema.safeParse(parsedJson);
    if (!validation.success) {
      const firstIssue = validation.error.issues[0];
      const msg = firstIssue
        ? `${firstIssue.path.join(".") || "input"}: ${firstIssue.message}`
        : "Invalid request parameters.";
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: msg,
          },
        },
        { status: 400 }
      );
    }

    // Rate limiting and duplicate request prevention
    const forwardedFor = request.headers.get("x-forwarded-for");
    const clientIp =
      forwardedFor?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "local-client";
    const signature = `${routeName}:${hashSignature(rawBody)}`;

    checkRateLimitAndDedup(clientIp, signature);

    const { result, model } = await handler(validation.data);

    return NextResponse.json(
      {
        success: true,
        data: result,
        model,
      },
      { status: 200 }
    );
  } catch (err) {
    if (err instanceof AIServiceError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: err.code,
            message: err.userMessage,
          },
        },
        { status: err.statusCode }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "PROVIDER_ERROR",
          message: "An unexpected error occurred while processing the AI request.",
        },
      },
      { status: 500 }
    );
  }
}

