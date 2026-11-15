import { CVLanguage } from "@/types/cv";

export type AIErrorCode =
  | "MISSING_API_KEY"
  | "INVALID_API_KEY"
  | "MODEL_UNAVAILABLE"
  | "VALIDATION_ERROR"
  | "INPUT_TOO_LARGE"
  | "RATE_LIMITED"
  | "DUPLICATE_REQUEST"
  | "TIMEOUT"
  | "PARSE_ERROR"
  | "EMPTY_RESPONSE"
  | "CONSENT_REQUIRED"
  | "PROVIDER_ERROR";

export class AIServiceError extends Error {
  public readonly code: AIErrorCode;
  public readonly statusCode: number;
  public readonly userMessage: string;

  constructor(
    code: AIErrorCode,
    userMessage: string,
    statusCode: number = 500
  ) {
    super(userMessage);
    this.name = "AIServiceError";
    this.code = code;
    this.statusCode = statusCode;
    this.userMessage = userMessage;
  }
}

export type WritingOperation =
  | "professional_summary"
  | "experience_improve"
  | "achievement_generator"
  | "project_description"
  | "skills_suggestions"
  | "grammar_tone"
  | "translation";

export type WritingStyle =
  | "professional"
  | "concise"
  | "achievement_oriented";

export type CareerOperation =
  | "cover_letter"
  | "interview_questions"
  | "interview_answer"
  | "linkedin_summary"
  | "job_recommendations";

export interface AIUsageRecord {
  id: string;
  timestamp: string;
  feature: "writing" | "matching" | "analysis" | "career";
  operation: string;
  model: string;
  language: CVLanguage;
  status: "success" | "error";
}

export interface MinimizedCVContext {
  language: CVLanguage;
  personalInfo: {
    fullName?: string;
    jobTitle?: string;
    email?: string;
    phone?: string;
    location?: string;
    website?: string;
    linkedin?: string;
    github?: string;
    summary?: string;
  };
  experience: Array<{
    id: string;
    company: string;
    position: string;
    location?: string;
    employmentType?: string;
    workMode?: string;
    startDate?: string;
    endDate?: string;
    current?: boolean;
    description: string;
  }>;
  education: Array<{
    id: string;
    institution: string;
    degree: string;
    fieldOfStudy: string;
    startDate?: string;
    endDate?: string;
    current?: boolean;
    gpa?: string;
    thesisTitle?: string;
    defenseGrade?: string;
    description?: string;
  }>;
  skills: string[];
  projects: Array<{
    id: string;
    name: string;
    technologies: string;
    url?: string;
    description: string;
  }>;
  certifications: Array<{
    id: string;
    name: string;
    issuingOrganization: string;
    issueDate?: string;
    expiryDate?: string;
    noExpiry?: boolean;
    credentialId?: string;
    credentialUrl?: string;
  }>;
}

