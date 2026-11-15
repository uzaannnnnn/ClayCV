import { z } from "zod";

export const matchingRequestSchema = z.object({
  consentAccepted: z.literal(true, {
    message: "Explicit user privacy consent is required before sending data to Gemini.",
  }),
  jobTitle: z.string().max(200).optional(),
  companyName: z.string().max(200).optional(),
  jobDescription: z
    .string()
    .trim()
    .min(20, "Please provide a job description of at least 20 characters.")
    .max(15000, "Job description exceeds 15,000 characters."),
  cvData: z.record(z.string(), z.unknown()),
});

export type MatchingRequestInput = z.infer<typeof matchingRequestSchema>;

export const matchedKeywordSchema = z.object({
  keyword: z.string().min(1),
  category: z.string().default("General"),
  presence: z.enum(["explicit", "inferred"]),
  evidence: z.string().min(1),
  reason: z.string().min(1),
});

export const missingKeywordSchema = z.object({
  keyword: z.string().min(1),
  category: z.string().default("General"),
  importance: z.enum(["required", "preferred"]).default("required"),
  reason: z.string().min(1),
});

export const partialMatchSchema = z.object({
  requirement: z.string().min(1),
  cv_evidence: z.string().min(1),
  gap: z.string().min(1),
  reason: z.string().min(1),
});

export const matchRecommendationSchema = z.object({
  id: z.string().min(1),
  target_section: z.enum(["summary", "experience", "projects", "skills"]),
  target_item_id: z.string().optional(),
  current_content: z.string(),
  suggested_content: z.string().min(1),
  reason: z.string().min(1),
});

export const geminiMatchingRawSchema = z.object({
  overall_assessment: z.string().min(1),
  semantic_alignment_score: z.number().min(0).max(100),
  experience_education_score: z.number().min(0).max(100),
  matched_keywords: z.array(matchedKeywordSchema).default([]),
  missing_keywords: z.array(missingKeywordSchema).default([]),
  partial_matches: z.array(partialMatchSchema).default([]),
  relevant_sections: z
    .array(
      z.object({
        section: z.string().min(1),
        assessment: z.string().min(1),
      })
    )
    .default([]),
  skill_gaps: z
    .array(
      z.object({
        skill: z.string().min(1),
        category: z.string().default("Technical"),
        recommendation: z.string().min(1),
      })
    )
    .default([]),
  recommendations: z.array(matchRecommendationSchema).default([]),
});

export const matchingResponseSchema = geminiMatchingRawSchema.extend({
  score_breakdown: z.object({
    deterministic_keyword_score: z.number().min(0).max(100),
    semantic_alignment_score: z.number().min(0).max(100),
    experience_education_score: z.number().min(0).max(100),
    overall_score: z.number().min(0).max(100),
    methodology_note: z.string().min(1),
  }),
});

export type MatchingResponseData = z.infer<typeof matchingResponseSchema>;
