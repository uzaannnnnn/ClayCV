import { z } from "zod";
import {
  CareerRequestInput,
  CareerResponseData,
  careerOperationSchema,
  careerResponseSchema,
  interviewQuestionItemSchema,
  jobRecommendationItemSchema,
  linkedinVariantSchema,
  starAnswerSchema,
} from "@/lib/ai/schemas/career.schema";
import { buildCareerPrompts } from "@/lib/ai/prompts/career/career.prompts";
import { generateStructuredContent } from "@/lib/ai/gemini-client";
import { minimizeCVData } from "@/lib/ai/utils/sanitize-input";
import { CVData } from "@/types/cv";

function buildOperationJsonSchema(
  operation: CareerRequestInput["operation"]
): Record<string, unknown> {
  const baseFields = {
    operation: careerOperationSchema,
    language: z.enum(["en", "id"]),
    content: z.string(),
    warnings: z.array(z.string()),
  };

  switch (operation) {
    case "cover_letter":
      return z.toJSONSchema(z.object(baseFields)) as Record<string, unknown>;
    case "interview_questions":
      return z.toJSONSchema(
        z.object({
          ...baseFields,
          interview_questions: z.array(interviewQuestionItemSchema).min(1),
        })
      ) as Record<string, unknown>;
    case "interview_answer":
      return z.toJSONSchema(
        z.object({
          ...baseFields,
          star_answer: starAnswerSchema,
        })
      ) as Record<string, unknown>;
    case "linkedin_summary":
      return z.toJSONSchema(
        z.object({
          ...baseFields,
          linkedin_variants: z.array(linkedinVariantSchema).min(1),
        })
      ) as Record<string, unknown>;
    case "job_recommendations":
      return z.toJSONSchema(
        z.object({
          ...baseFields,
          job_recommendations: z.array(jobRecommendationItemSchema).min(1),
        })
      ) as Record<string, unknown>;
  }
}

export async function executeCareerAssistant(
  input: CareerRequestInput,
  env: NodeJS.ProcessEnv = process.env
): Promise<{ result: CareerResponseData; model: string }> {
  const rawCv = input.cvData as Partial<CVData>;
  const cvContext = minimizeCVData(rawCv, {
    includeContact: input.operation === "cover_letter",
    includeSummary: true,
    includeExperience: true,
    includeEducation: true,
    includeSkills: true,
    includeProjects: true,
    includeCertifications: true,
  });

  const { systemInstruction, prompt } = buildCareerPrompts(input, cvContext);

  const jsonSchema = buildOperationJsonSchema(input.operation);

  const { data, model } = await generateStructuredContent({
    systemInstruction,
    prompt,
    schema: careerResponseSchema,
    jsonSchema,
    temperature: 0.35,
    env,
  });

  return { result: data, model };
}

