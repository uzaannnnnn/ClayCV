import { z } from "zod";
import {
  MatchingRequestInput,
  MatchingResponseData,
  geminiMatchingRawSchema,
  matchingResponseSchema,
} from "@/lib/ai/schemas/matching.schema";
import { buildMatchingPrompts } from "@/lib/ai/prompts/matching/matching.prompts";
import { generateStructuredContent } from "@/lib/ai/gemini-client";
import { minimizeCVData, sanitizeUserText } from "@/lib/ai/utils/sanitize-input";
import { MinimizedCVContext } from "@/lib/ai/types/ai.types";
import { CVData } from "@/types/cv";

const STOP_WORDS = new Set([
  "the", "and", "for", "with", "that", "this", "from", "your", "will", "have",
  "are", "you", "our", "who", "what", "where", "when", "why", "how", "able",
  "work", "working", "team", "role", "join", "looking", "experience", "years",
  "year", "strong", "good", "great", "excellent", "skills", "skill", "ability",
  "must", "should", "plus", "preferred", "required", "requirements", "using",
  "used", "build", "building", "develop", "developing", "dan", "yang", "untuk",
  "dengan", "dalam", "pada", "dari", "atau", "akan", "dapat", "kami", "anda",
]);

/**
 * Extracts significant technical and domain tokens from a job description
 * and deterministically checks how many appear in the candidate's CV text.
 */
export function calculateDeterministicKeywordScore(
  jobDescription: string,
  cvContext: MinimizedCVContext,
  matchedCountFromAnalysis: number,
  missingCountFromAnalysis: number
): number {
  const cvCorpus = [
    cvContext.personalInfo.jobTitle || "",
    cvContext.personalInfo.summary || "",
    ...cvContext.skills,
    ...cvContext.experience.map((e) => `${e.position} ${e.company} ${e.description}`),
    ...cvContext.projects.map((p) => `${p.name} ${p.technologies} ${p.description}`),
    ...cvContext.education.map((ed) => `${ed.degree} ${ed.fieldOfStudy} ${ed.description || ""}`),
    ...cvContext.certifications.map((c) => `${c.name} ${c.issuingOrganization}`),
  ]
    .join(" ")
    .toLowerCase();

  // Extract unique significant tokens from JD (3+ characters, non-stopwords)
  const jdTokens = Array.from(
    new Set(
      jobDescription
        .toLowerCase()
        .replace(/[^a-z0-9+#.\-/]/g, " ")
        .split(/\s+/)
        .map((t) => t.replace(/^[.\-/]+|[.\-/]+$/g, ""))
        .filter((t) => t.length >= 3 && !STOP_WORDS.has(t) && !/^\d+$/.test(t))
    )
  );

  const tokenOverlapRatio =
    jdTokens.length > 0
      ? jdTokens.filter((token) => cvCorpus.includes(token)).length / jdTokens.length
      : 0;

  const totalEvaluatedKeywords = matchedCountFromAnalysis + missingCountFromAnalysis;
  const structuredKeywordRatio =
    totalEvaluatedKeywords > 0
      ? matchedCountFromAnalysis / totalEvaluatedKeywords
      : tokenOverlapRatio;

  // Combine 60% structured keyword coverage + 40% lexical token overlap
  const rawScore = Math.round(
    (structuredKeywordRatio * 0.6 + Math.min(1, tokenOverlapRatio * 1.6) * 0.4) * 100
  );

  return Math.max(0, Math.min(100, rawScore));
}

/**
 * Documented Match Score Methodology:
 * - 50% Deterministic Keyword & Requirement Coverage
 * - 30% Semantic Alignment Score (Gemini evaluation of responsibilities & domain depth)
 * - 20% Experience & Education Fit Score
 */
export function computeOverallMatchScore(params: {
  deterministicKeywordScore: number;
  semanticAlignmentScore: number;
  experienceEducationScore: number;
}): {
  overallScore: number;
  methodologyNote: string;
} {
  const det = Math.max(0, Math.min(100, Math.round(params.deterministicKeywordScore)));
  const sem = Math.max(0, Math.min(100, Math.round(params.semanticAlignmentScore)));
  const exp = Math.max(0, Math.min(100, Math.round(params.experienceEducationScore)));

  const overallScore = Math.round(det * 0.5 + sem * 0.3 + exp * 0.2);

  return {
    overallScore,
    methodologyNote:
      "Estimated score calculated using 50% deterministic keyword/requirement matching, 30% semantic responsibility alignment, and 20% experience & education fit. This score is an informational estimate and does not guarantee ATS acceptance or job eligibility.",
  };
}

export async function executeJobMatching(
  input: MatchingRequestInput,
  env: NodeJS.ProcessEnv = process.env
): Promise<{ result: MatchingResponseData; model: string }> {
  const cvContext = minimizeCVData(input.cvData as Partial<CVData>, {
    includeContact: false,
    includeSummary: true,
    includeExperience: true,
    includeEducation: true,
    includeSkills: true,
    includeProjects: true,
    includeCertifications: true,
  });

  const cleanJobTitle = sanitizeUserText(input.jobTitle, 200);
  const cleanCompanyName = sanitizeUserText(input.companyName, 200);
  const cleanJobDescription = sanitizeUserText(input.jobDescription, 15000);

  const { systemInstruction, prompt } = buildMatchingPrompts({
    jobTitle: cleanJobTitle,
    companyName: cleanCompanyName,
    jobDescription: cleanJobDescription,
    cvContext,
  });

  const jsonSchema = z.toJSONSchema(geminiMatchingRawSchema) as Record<
    string,
    unknown
  >;

  const { data: rawMatch, model } = await generateStructuredContent({
    systemInstruction,
    prompt,
    schema: geminiMatchingRawSchema,
    jsonSchema,
    temperature: 0.2,
    env,
  });

  const deterministicScore = calculateDeterministicKeywordScore(
    cleanJobDescription,
    cvContext,
    rawMatch.matched_keywords.length,
    rawMatch.missing_keywords.length
  );

  const { overallScore, methodologyNote } = computeOverallMatchScore({
    deterministicKeywordScore: deterministicScore,
    semanticAlignmentScore: rawMatch.semantic_alignment_score,
    experienceEducationScore: rawMatch.experience_education_score,
  });

  const fullResult: MatchingResponseData = matchingResponseSchema.parse({
    ...rawMatch,
    score_breakdown: {
      deterministic_keyword_score: deterministicScore,
      semantic_alignment_score: Math.round(rawMatch.semantic_alignment_score),
      experience_education_score: Math.round(rawMatch.experience_education_score),
      overall_score: overallScore,
      methodology_note: methodologyNote,
    },
  });

  return { result: fullResult, model };
}

