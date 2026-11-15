import { z } from "zod";

export const careerOperationSchema = z.enum([
  "cover_letter",
  "interview_questions",
  "interview_answer",
  "linkedin_summary",
  "job_recommendations",
]);

export const careerRequestSchema = z.object({
  consentAccepted: z.literal(true, {
    message: "Explicit user privacy consent is required before sending data to Gemini.",
  }),
  operation: careerOperationSchema,
  language: z.enum(["en", "id"]).default("en"),
  cvData: z.record(z.string(), z.unknown()),

  // Optional operation-specific fields
  targetJobTitle: z.string().max(200).optional(),
  companyName: z.string().max(200).optional(),
  jobDescription: z.string().max(15000).optional(),

  // For interview_answer (STAR assistant)
  interviewQuestion: z.string().max(1000).optional(),
  userDraftOrNotes: z.string().max(3000).optional(),
});

export type CareerRequestInput = z.infer<typeof careerRequestSchema>;

export const interviewQuestionItemSchema = z.object({
  category: z.enum([
    "General",
    "Behavioral",
    "Technical",
    "Experience-Based",
  ]),
  question: z.string().min(1),
  why_asked: z.string().min(1),
  preparation_tip: z.string().min(1),
});

export const starAnswerSchema = z.object({
  situation: z.string().min(1),
  task: z.string().min(1),
  action: z.string().min(1),
  result: z.string().min(1),
  full_answer: z.string().min(1),
  missing_context_questions: z.array(z.string()).default([]),
});

export const linkedinVariantSchema = z.object({
  title: z.string().min(1),
  headline: z.string().min(1),
  about: z.string().min(1),
});

export const jobRecommendationItemSchema = z.object({
  role_title: z.string().min(1),
  fit_level: z.enum(["Strong Fit", "Moderate Fit", "Growth Target"]),
  reasoning: z.string().min(1),
  matching_qualifications: z.array(z.string()).default([]),
  skills_to_develop: z.array(z.string()).default([]),
});

export const careerResponseSchema = z.object({
  operation: careerOperationSchema,
  language: z.enum(["en", "id"]),
  content: z.string().default(""),
  interview_questions: z.array(interviewQuestionItemSchema).optional().default([]),
  star_answer: starAnswerSchema.optional(),
  linkedin_variants: z.array(linkedinVariantSchema).optional().default([]),
  job_recommendations: z.array(jobRecommendationItemSchema).optional().default([]),
  warnings: z.array(z.string()).default([]),
});

export type CareerResponseData = z.infer<typeof careerResponseSchema>;
