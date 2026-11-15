import { z } from "zod";
import {
  WritingRequestInput,
  WritingResponseData,
  writingResponseSchema,
} from "@/lib/ai/schemas/writing.schema";
import { buildWritingPrompts } from "@/lib/ai/prompts/writing/writing.prompts";
import { generateStructuredContent } from "@/lib/ai/gemini-client";
import { hasPromptInjectionIndicators } from "@/lib/ai/utils/sanitize-input";

export async function executeWritingAssistant(
  input: WritingRequestInput,
  env: NodeJS.ProcessEnv = process.env
): Promise<{ result: WritingResponseData; model: string }> {
  const { systemInstruction, prompt } = buildWritingPrompts(input);

  const jsonSchema = z.toJSONSchema(writingResponseSchema) as Record<
    string,
    unknown
  >;

  const { data, model } = await generateStructuredContent({
    systemInstruction,
    prompt,
    schema: writingResponseSchema,
    jsonSchema,
    temperature: 0.3,
    env,
  });

  const warnings = [...(data.warnings || [])];
  if (hasPromptInjectionIndicators(prompt)) {
    warnings.push(
      "Potential instruction-like patterns in input were isolated and treated strictly as plain text."
    );
  }

  return {
    result: {
      ...data,
      warnings,
    },
    model,
  };
}

