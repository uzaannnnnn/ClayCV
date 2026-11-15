import { AIServiceError } from "@/lib/ai/types/ai.types";

/**
 * Default Gemini model verified for live structured-output generation.
 */
export const DEFAULT_GEMINI_MODEL = "gemini-3.5-flash";

/**
 * Operational limits for cost, safety, and latency control.
 */
export const AI_LIMITS = {
  MAX_TEXT_INPUT_CHARS: 12000,
  MAX_JOB_DESCRIPTION_CHARS: 15000,
  MAX_CV_PAYLOAD_BYTES: 65000,
  REQUEST_TIMEOUT_MS: 45000,
  MAX_OUTPUT_TOKENS: 4096,
  RATE_LIMIT_WINDOW_MS: 60_000,
  RATE_LIMIT_MAX_REQUESTS: 15,
  DEDUP_WINDOW_MS: 3_000,
} as const;

const PLACEHOLDER_KEYS = new Set([
  "",
  "your_gemini_api_key_here",
  "YOUR_ACTUAL_API_KEY",
  "replace_with_your_key",
  "test_key",
]);

/**
 * Returns the configured Gemini model identifier.
 * Uses GEMINI_MODEL environment variable if set and non-empty; otherwise defaults to DEFAULT_GEMINI_MODEL (gemini-3.5-flash).
 */
export function getGeminiModel(env: NodeJS.ProcessEnv = process.env): string {
  const configured = env.GEMINI_MODEL?.trim();
  if (configured && configured.length > 0) {
    return configured;
  }
  return DEFAULT_GEMINI_MODEL;
}

/**
 * Validates and retrieves the server-side GEMINI_API_KEY.
 * Never logs or echoes the key value.
 */
export function getGeminiApiKey(env: NodeJS.ProcessEnv = process.env): string {
  if (typeof window !== "undefined") {
    throw new AIServiceError(
      "MISSING_API_KEY",
      "Gemini configuration cannot be accessed in browser context.",
      500
    );
  }

  if (env.NEXT_PUBLIC_GEMINI_API_KEY) {
    throw new AIServiceError(
      "INVALID_API_KEY",
      "Security violation: NEXT_PUBLIC_GEMINI_API_KEY must not be used. Configure GEMINI_API_KEY as a server-only variable.",
      500
    );
  }

  const key = env.GEMINI_API_KEY?.trim() ?? "";
  if (!key || PLACEHOLDER_KEYS.has(key)) {
    throw new AIServiceError(
      "MISSING_API_KEY",
      "Google Gemini API key is not configured. Please set GEMINI_API_KEY in .env.local (or Vercel Environment Variables) with a valid key.",
      503
    );
  }

  return key;
}

export interface GeminiConfig {
  apiKey: string;
  model: string;
  timeoutMs: number;
  maxOutputTokens: number;
}

export function getGeminiConfig(
  env: NodeJS.ProcessEnv = process.env
): GeminiConfig {
  return {
    apiKey: getGeminiApiKey(env),
    model: getGeminiModel(env),
    timeoutMs: AI_LIMITS.REQUEST_TIMEOUT_MS,
    maxOutputTokens: AI_LIMITS.MAX_OUTPUT_TOKENS,
  };
}

