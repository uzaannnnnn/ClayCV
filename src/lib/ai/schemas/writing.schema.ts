import { z } from "zod";

export const writingOperationSchema = z.enum([
  "professional_summary",
  "experience_improve",
  "achievement_generator",
  "project_description",
  "skills_suggestions",
  "grammar_tone",
  "translation",
]);

export const writingStyleSchema = z.enum([
  "professional",
  "concise",
  "achievement_oriented",
]);

export const writingRequestSchema = z.object({
  consentAccepted: z.literal(true, {
    message: "Explicit user privacy consent is required before sending data to Gemini.",
  }),
  operation: writingOperationSchema,
  language: z.enum(["en", "id"]).default("en"),
  targetLanguage: z.enum(["en", "id"]).optional(),
  style: writingStyleSchema.optional(),

  // Context payloads (data-minimized per operation)
  summaryContext: z
    .object({
      targetPosition: z.string().max(200).optional(),
      yearsOfExperience: z.string().max(100).optional(),
      careerObjectives: z.string().max(1000).optional(),
      currentSummary: z.string().max(3000).optional(),
      experienceHighlights: z.array(z.string().max(1000)).max(15).optional(),
      educationHighlights: z.array(z.string().max(500)).max(10).optional(),
      skills: z.array(z.string().max(100)).max(80).optional(),
      projects: z.array(z.string().max(500)).max(15).optional(),
    })
    .optional(),

  experienceContext: z
    .object({
      company: z.string().max(200).optional(),
      position: z.string().max(200).optional(),
      employmentType: z.string().max(100).optional(),
      description: z.string().max(5000),
      userInstructions: z.string().max(1000).optional(),
    })
    .optional(),

  achievementContext: z
    .object({
      roleOrTitle: z.string().max(200).optional(),
      taskPerformed: z.string().max(1500),
      problemSolved: z.string().max(1500).optional(),
      technologyUsed: z.string().max(500).optional(),
      userContribution: z.string().max(1500).optional(),
      actualOutcome: z.string().max(1500).optional(),
    })
    .optional(),

  projectContext: z
    .object({
      name: z.string().max(200),
      objective: z.string().max(1500).optional(),
      technologies: z.string().max(500).optional(),
      mainFeatures: z.string().max(1500).optional(),
      userResponsibilities: z.string().max(1500).optional(),
      technicalImplementation: z.string().max(1500).optional(),
      currentDescription: z.string().max(3000).optional(),
    })
    .optional(),

  skillsContext: z
    .object({
      jobTitle: z.string().max(200).optional(),
      existingSkills: z.array(z.string().max(100)).max(80),
      experienceSummaries: z.array(z.string().max(1000)).max(15).optional(),
      projectSummaries: z.array(z.string().max(1000)).max(15).optional(),
      educationSummaries: z.array(z.string().max(500)).max(10).optional(),
    })
    .optional(),

  textContext: z
    .object({
      text: z.string().min(1).max(8000),
      fieldLabel: z.string().max(150).optional(),
      instructions: z.string().max(500).optional(),
    })
    .optional(),
});

export type WritingRequestInput = z.infer<typeof writingRequestSchema>;

export const writingResultItemSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  style: z.string().optional(),
});

export const skillCategorySuggestionSchema = z.object({
  category: z.string().min(1),
  skills: z.array(z.string().min(1)),
  reason: z.string().min(1),
});

export const writingResponseSchema = z.object({
  operation: writingOperationSchema,
  language: z.enum(["en", "id"]),
  results: z.array(writingResultItemSchema).min(1),
  suggested_skills: z.array(skillCategorySuggestionSchema).optional().default([]),
  warnings: z.array(z.string()).default([]),
  missing_information: z.array(z.string()).default([]),
});

export type WritingResponseData = z.infer<typeof writingResponseSchema>;
