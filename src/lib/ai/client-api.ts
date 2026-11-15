import {
  WritingRequestInput,
  WritingResponseData,
} from "@/lib/ai/schemas/writing.schema";
import {
  MatchingRequestInput,
  MatchingResponseData,
} from "@/lib/ai/schemas/matching.schema";
import {
  AnalysisRequestInput,
  AnalysisResponseData,
} from "@/lib/ai/schemas/analysis.schema";
import {
  CareerRequestInput,
  CareerResponseData,
} from "@/lib/ai/schemas/career.schema";
import { DEFAULT_GEMINI_MODEL } from "@/lib/ai/gemini-config";
import { useCVStore } from "@/store/cv-store";
import { CVLanguage } from "@/types/cv";

const inFlightRequests = new Set<string>();

interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
  model?: string;
  error?: {
    code: string;
    message: string;
  };
}

async function postAI<TReq, TRes>(
  endpoint: string,
  feature: "writing" | "matching" | "analysis" | "career",
  operation: string,
  language: CVLanguage,
  payload: TReq
): Promise<{ data: TRes; model: string }> {
  const store = useCVStore.getState();
  const payloadConsent = (payload as { consentAccepted?: boolean })
    ?.consentAccepted;
  if (!store.aiConsentAccepted || payloadConsent !== true) {
    throw new Error(
      "Explicit user privacy consent is required before sending CV data to Google Gemini API."
    );
  }

  const lockKey = `${endpoint}:${operation}`;
  if (inFlightRequests.has(lockKey)) {
    throw new Error("A request for this AI action is already in progress.");
  }

  inFlightRequests.add(lockKey);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const json = (await response.json()) as ApiEnvelope<TRes>;

    if (!response.ok || !json.success || !json.data) {
      const errMsg =
        json.error?.message ||
        `AI request failed with status ${response.status}.`;
      store.recordAIUsage({
        feature,
        operation,
        model: json.model || DEFAULT_GEMINI_MODEL,
        language,
        status: "error",
      });
      throw new Error(errMsg);
    }

    store.recordAIUsage({
      feature,
      operation,
      model: json.model || DEFAULT_GEMINI_MODEL,
      language,
      status: "success",
    });

    return {
      data: json.data,
      model: json.model || DEFAULT_GEMINI_MODEL,
    };
  } finally {
    inFlightRequests.delete(lockKey);
  }
}

export function callWritingAI(input: WritingRequestInput) {
  return postAI<WritingRequestInput, WritingResponseData>(
    "/api/ai/writing",
    "writing",
    input.operation,
    input.language,
    input
  );
}

export function callMatchingAI(
  input: MatchingRequestInput,
  language: CVLanguage
) {
  return postAI<MatchingRequestInput, MatchingResponseData>(
    "/api/ai/matching",
    "matching",
    "job_description_match",
    language,
    input
  );
}

export function callAnalysisAI(
  input: AnalysisRequestInput,
  language: CVLanguage
) {
  return postAI<AnalysisRequestInput, AnalysisResponseData>(
    "/api/ai/analysis",
    "analysis",
    "ats_cv_audit",
    language,
    input
  );
}

export function callCareerAI(input: CareerRequestInput) {
  return postAI<CareerRequestInput, CareerResponseData>(
    "/api/ai/career",
    "career",
    input.operation,
    input.language,
    input
  );
}

