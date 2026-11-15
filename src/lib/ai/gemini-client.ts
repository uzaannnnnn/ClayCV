import { GoogleGenAI } from "@google/genai";
import { getGeminiConfig, GeminiConfig } from "@/lib/ai/gemini-config";
import { AIServiceError } from "@/lib/ai/types/ai.types";
import { parseGeminiJson } from "@/lib/ai/utils/parse-response";
import { validateGeminiResponse } from "@/lib/ai/utils/validate-response";
import { z } from "zod";

let cachedClient: GoogleGenAI | null = null;
let cachedApiKey: string | null = null;

export interface GenerateStructuredOptions<T> {
  systemInstruction: string;
  prompt: string;
  schema: z.ZodType<T>;
  jsonSchema?: Record<string, unknown>;
  temperature?: number;
  env?: NodeJS.ProcessEnv;
}

export type MockGeneratorFn = (params: {
  model: string;
  systemInstruction: string;
  prompt: string;
  jsonSchema?: Record<string, unknown>;
}) => Promise<string> | string;

let mockGenerator: MockGeneratorFn | null = null;

/**
 * Allows automated tests to inject mocked Gemini responses without requiring a live API key.
 */
export function setMockGeminiGenerator(fn: MockGeneratorFn | null): void {
  mockGenerator = fn;
}

/**
 * Returns a singleton server-side GoogleGenAI client instance.
 * Strictly prohibits browser execution.
 */
export function getGeminiClient(
  env: NodeJS.ProcessEnv = process.env
): { client: GoogleGenAI; config: GeminiConfig } {
  if (typeof window !== "undefined") {
    throw new AIServiceError(
      "MISSING_API_KEY",
      "Gemini client must only be initialized on the server.",
      500
    );
  }

  const config = getGeminiConfig(env);

  if (!cachedClient || cachedApiKey !== config.apiKey) {
    cachedClient = new GoogleGenAI({ apiKey: config.apiKey });
    cachedApiKey = config.apiKey;
  }

  return { client: cachedClient, config };
}

/**
 * Executes a structured JSON generation call against Google Gemini API (`generateContent`),
 * parses the output, and validates it with the provided Zod schema.
 */
export async function generateStructuredContent<T>(
  options: GenerateStructuredOptions<T>
): Promise<{ data: T; model: string }> {
  const {
    systemInstruction,
    prompt,
    schema,
    jsonSchema,
    temperature = 0.25,
    env = process.env,
  } = options;

  const { client, config } = getGeminiClient(env);

  let rawText: string | undefined;

  if (mockGenerator) {
    try {
      rawText = await mockGenerator({
        model: config.model,
        systemInstruction,
        prompt,
        jsonSchema,
      });
    } catch (err) {
      throw mapGeminiError(err, config.model);
    }
  } else {
    const supportsThinkingBudget =
      config.model.startsWith("gemini-3") && !config.model.includes("lite");

    let lastErr: unknown;
    for (let attempt = 1; attempt <= 2; attempt++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), config.timeoutMs);

      try {
        const response = await client.models.generateContent({
          model: config.model,
          contents: prompt,
          config: {
            systemInstruction,
            responseMimeType: "application/json",
            ...(jsonSchema ? { responseJsonSchema: jsonSchema } : {}),
            ...(supportsThinkingBudget
              ? { thinkingConfig: { thinkingBudget: 0 } }
              : {}),
            maxOutputTokens: config.maxOutputTokens,
            temperature,
            abortSignal: controller.signal,
          },
        });

        rawText = response?.text;
        lastErr = null;
        break;
      } catch (err) {
        lastErr = err;
        const msg = String((err as { message?: string })?.message || "");
        const status = (err as { status?: number })?.status || 0;
        const isTransient503 =
          status === 503 || /high demand|overloaded|unavailable/i.test(msg);
        if (attempt < 2 && isTransient503) {
          await new Promise((r) => setTimeout(r, 1500));
          continue;
        }
        throw mapGeminiError(err, config.model);
      } finally {
        clearTimeout(timeoutId);
      }
    }
    if (lastErr) {
      throw mapGeminiError(lastErr, config.model);
    }
  }

  if (!rawText || typeof rawText !== "string" || !rawText.trim()) {
    throw new AIServiceError(
      "EMPTY_RESPONSE",
      "Google Gemini returned an empty response. Please try again.",
      502
    );
  }

  const parsed = parseGeminiJson(rawText);
  const validated = validateGeminiResponse(parsed, schema);

  return {
    data: validated,
    model: config.model,
  };
}

/**
 * Safely maps provider and network errors into user-safe AIServiceError instances.
 * Never leaks API keys or raw stack traces.
 */
export function mapGeminiError(err: unknown, configuredModel: string): AIServiceError {
  if (err instanceof AIServiceError) {
    return err;
  }

  const errorObj = err as {
    name?: string;
    message?: string;
    status?: number;
    statusCode?: number;
  };

  const rawMessage = String(errorObj?.message || "");
  const status = errorObj?.status || errorObj?.statusCode || 0;

  if (
    errorObj?.name === "AbortError" ||
    /timeout|aborted|deadline/i.test(rawMessage)
  ) {
    return new AIServiceError(
      "TIMEOUT",
      "The request to Google Gemini timed out (45s limit). This can happen during back-to-back Free Tier requests or high upstream latency—please wait a few seconds and click Retry.",
      504
    );
  }

  if (
    status === 401 ||
    status === 403 ||
    /api[_\s-]?key[_\s-]?invalid|permission_denied|unauthenticated/i.test(rawMessage)
  ) {
    return new AIServiceError(
      "INVALID_API_KEY",
      "The configured Google Gemini API key is invalid or unauthorized. Please verify GEMINI_API_KEY in your server environment.",
      401
    );
  }

  if (
    status === 404 ||
    /not found|model.*not.*supported|is not found for api version|no longer available/i.test(
      rawMessage
    )
  ) {
    return new AIServiceError(
      "MODEL_UNAVAILABLE",
      `The configured Gemini model (${configuredModel}) is currently unavailable or not supported by your API tier. You can configure GEMINI_MODEL in your environment variables.`,
      503
    );
  }

  if (
    status === 503 ||
    /high demand|overloaded|temporarily unavailable|service unavailable/i.test(
      rawMessage
    )
  ) {
    return new AIServiceError(
      "MODEL_UNAVAILABLE",
      `The configured Gemini model (${configuredModel}) is currently experiencing high demand. Please retry in a moment or configure GEMINI_MODEL in your environment variables.`,
      503
    );
  }

  if (
    status === 429 ||
    /quota|rate[_\s-]?limit|resource_exhausted|too many requests/i.test(rawMessage)
  ) {
    return new AIServiceError(
      "RATE_LIMITED",
      "Google Gemini API rate limit or quota reached. Please wait a moment before trying again.",
      429
    );
  }

  return new AIServiceError(
    "PROVIDER_ERROR",
    "Unable to complete AI operation with Google Gemini API. Please try again shortly.",
    502
  );
}

