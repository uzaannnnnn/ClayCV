import { z } from "zod";
import { AIServiceError } from "@/lib/ai/types/ai.types";

/**
 * Validates parsed JSON against an application Zod schema.
 * Rejects incomplete or non-conforming model outputs.
 */
export function validateGeminiResponse<T>(
  data: unknown,
  schema: z.ZodType<T>
): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const issueSummary = result.error.issues
      .slice(0, 3)
      .map((i) => `${i.path.join(".") || "root"}: ${i.message}`)
      .join("; ");

    throw new AIServiceError(
      "VALIDATION_ERROR",
      `AI response did not match the expected structure (${issueSummary}). Please try again.`,
      502
    );
  }

  return result.data;
}

