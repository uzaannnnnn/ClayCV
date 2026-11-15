import { AIServiceError } from "@/lib/ai/types/ai.types";

/**
 * Safely extracts and parses JSON from a Gemini model response string.
 * Handles both pure JSON and markdown-fenced JSON blocks if returned.
 */
export function parseGeminiJson(rawText: string): unknown {
  if (!rawText || typeof rawText !== "string") {
    throw new AIServiceError(
      "EMPTY_RESPONSE",
      "Received empty output from Gemini model.",
      502
    );
  }

  let trimmed = rawText.trim();

  // Strip optional markdown code fences if present
  const fenceMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  if (fenceMatch && fenceMatch[1]) {
    trimmed = fenceMatch[1].trim();
  }

  try {
    return JSON.parse(trimmed);
  } catch {
    // Attempt to locate the first '{' and last '}' if there was leading/trailing commentary
    const firstBrace = trimmed.indexOf("{");
    const lastBrace = trimmed.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      const candidate = trimmed.slice(firstBrace, lastBrace + 1);
      try {
        return JSON.parse(candidate);
      } catch {
        // Fall through to PARSE_ERROR
      }
    }

    throw new AIServiceError(
      "PARSE_ERROR",
      "Google Gemini returned malformed JSON that could not be parsed. Please retry.",
      502
    );
  }
}

