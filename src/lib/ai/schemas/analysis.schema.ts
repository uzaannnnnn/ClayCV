import { z } from "zod";

export const analysisRequestSchema = z.object({
  consentAccepted: z.literal(true, {
    message: "Explicit user privacy consent is required before sending data to Gemini.",
  }),
  cvData: z.record(z.string(), z.unknown()),
});

export type AnalysisRequestInput = z.infer<typeof analysisRequestSchema>;

export const atsFindingSchema = z.object({
  id: z.string().min(1),
  category: z.string().min(1),
  severity: z.enum(["critical", "needs_improvement", "good"]),
  description: z.string().min(1),
  reason: z.string().min(1),
  recommended_action: z.string().min(1),
  fixable_section: z
    .enum(["summary", "experience", "projects", "skills"])
    .optional(),
  fixable_item_id: z.string().optional(),
  suggested_fix: z.string().optional(),
});

export type ATSFinding = z.infer<typeof atsFindingSchema>;

export const atsCategoryScoreSchema = z.object({
  name: z.string().min(1),
  score: z.number().min(0).max(100),
  status: z.enum(["good", "needs_improvement", "critical"]),
  summary: z.string().min(1),
});

export const geminiAnalysisRawSchema = z.object({
  ai_quality_score: z.number().min(0).max(100),
  categories: z.array(atsCategoryScoreSchema).default([]),
  critical_issues: z.array(atsFindingSchema).default([]),
  improvements: z.array(atsFindingSchema).default([]),
  good_practices: z.array(atsFindingSchema).default([]),
  recommendations: z
    .array(
      z.object({
        title: z.string().min(1),
        section: z.string().min(1),
        action: z.string().min(1),
        suggested_text: z.string().optional(),
      })
    )
    .default([]),
});

export const analysisResponseSchema = z.object({
  overall_score: z.number().min(0).max(100),
  deterministic_score: z.number().min(0).max(100),
  ai_quality_score: z.number().min(0).max(100),
  methodology_explanation: z.string().min(1),
  categories: z.array(atsCategoryScoreSchema),
  critical_issues: z.array(atsFindingSchema),
  improvements: z.array(atsFindingSchema),
  good_practices: z.array(atsFindingSchema),
  recommendations: z.array(
    z.object({
      title: z.string().min(1),
      section: z.string().min(1),
      action: z.string().min(1),
      suggested_text: z.string().optional(),
    })
  ),
});

export type AnalysisResponseData = z.infer<typeof analysisResponseSchema>;

