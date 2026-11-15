import { AIServiceError, MinimizedCVContext } from "@/lib/ai/types/ai.types";
import { AI_LIMITS } from "@/lib/ai/gemini-config";
import { CVData } from "@/types/cv";

/**
 * Strips control characters, normalizes whitespace, enforces character limits,
 * and neutralizes delimiter tags used to isolate untrusted user content.
 */
export function sanitizeUserText(
  input: string | undefined | null,
  maxLength: number = AI_LIMITS.MAX_TEXT_INPUT_CHARS
): string {
  if (!input || typeof input !== "string") return "";

  // Remove null bytes and non-printable control characters except newline/tab
  let cleaned = input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");

  // Escape XML-like delimiter boundaries used in our system prompts so user input cannot break out
  cleaned = cleaned
    .replace(/<\/?untrusted_user_data>/gi, "[filtered_tag]")
    .replace(/<\/?system_instruction>/gi, "[filtered_tag]");

  cleaned = cleaned.trim();

  if (cleaned.length > maxLength) {
    throw new AIServiceError(
      "INPUT_TOO_LARGE",
      `Input exceeds maximum allowed length of ${maxLength.toLocaleString()} characters.`,
      413
    );
  }

  return cleaned;
}

/**
 * Detects obvious prompt injection attempts for logging/warning purposes while still
 * isolating all user content inside <untrusted_user_data> tags.
 */
export function hasPromptInjectionIndicators(text: string): boolean {
  if (!text) return false;
  const patterns = [
    /ignore\s+(all\s+)?(previous|prior|above|system)\s+instructions/i,
    /disregard\s+(all\s+)?(previous|prior|system)\s+(instructions|rules|prompts)/i,
    /you\s+are\s+now\s+(a|an)\s+/i,
    /reveal\s+(your\s+)?(system\s+prompt|api\s+key|instructions)/i,
    /override\s+system\s+prompt/i,
  ];
  return patterns.some((re) => re.test(text));
}

/**
 * Wraps untrusted user-supplied text inside explicit boundary tags.
 */
export function wrapUntrustedData(label: string, content: string): string {
  const safeLabel = label.replace(/[^a-zA-Z0-9_-]/g, "_");
  const safeContent = sanitizeUserText(content, AI_LIMITS.MAX_JOB_DESCRIPTION_CHARS);
  return `<untrusted_user_data field="${safeLabel}">\n${safeContent}\n</untrusted_user_data>`;
}

function formatMonthYear(month: number | null | undefined, year: number | null | undefined): string {
  if (!year) return "";
  if (!month) return `${year}`;
  return `${String(month).padStart(2, "0")}/${year}`;
}

/**
 * Produces a sanitized, data-minimized CV snapshot.
 * Strictly strips all IndexedDB attachment fields (attachmentId, attachmentName, attachmentSize, attachmentType)
 * and optionally includes only the requested sections for data minimization.
 */
export function minimizeCVData(
  cv: Partial<CVData>,
  options: {
    includeContact?: boolean;
    includeSummary?: boolean;
    includeExperience?: boolean;
    includeEducation?: boolean;
    includeSkills?: boolean;
    includeProjects?: boolean;
    includeCertifications?: boolean;
  } = {
    includeContact: false,
    includeSummary: true,
    includeExperience: true,
    includeEducation: true,
    includeSkills: true,
    includeProjects: true,
    includeCertifications: true,
  }
): MinimizedCVContext {
  const p =
    cv && typeof cv.personalInfo === "object" && cv.personalInfo !== null
      ? cv.personalInfo
      : undefined;
  const experienceList = Array.isArray(cv?.experience) ? cv.experience : [];
  const educationList = Array.isArray(cv?.education) ? cv.education : [];
  const skillsList = Array.isArray(cv?.skills) ? cv.skills : [];
  const projectsList = Array.isArray(cv?.projects) ? cv.projects : [];
  const certificationsList = Array.isArray(cv?.certifications) ? cv.certifications : [];

  return {
    language: cv?.language === "id" ? "id" : "en",
    personalInfo: {
      ...(options.includeContact && p?.fullName
        ? { fullName: sanitizeUserText(p.fullName, 200) }
        : {}),
      ...(p?.jobTitle ? { jobTitle: sanitizeUserText(p.jobTitle, 200) } : {}),
      ...(options.includeContact && p?.email
        ? { email: sanitizeUserText(p.email, 200) }
        : {}),
      ...(options.includeContact && p?.phone
        ? { phone: sanitizeUserText(p.phone, 100) }
        : {}),
      ...(options.includeContact && p?.location
        ? { location: sanitizeUserText(p.location, 200) }
        : {}),
      ...(options.includeContact && p?.website
        ? { website: sanitizeUserText(p.website, 300) }
        : {}),
      ...(options.includeContact && p?.linkedin
        ? { linkedin: sanitizeUserText(p.linkedin, 300) }
        : {}),
      ...(options.includeContact && p?.github
        ? { github: sanitizeUserText(p.github, 300) }
        : {}),
      ...(options.includeSummary && p?.summary
        ? { summary: sanitizeUserText(p.summary, 3000) }
        : {}),
    },
    experience: options.includeExperience
      ? experienceList
          .filter((exp) => exp && typeof exp === "object")
          .slice(0, 20)
          .map((exp) => ({
            id: sanitizeUserText(exp.id, 100),
            company: sanitizeUserText(exp.company, 200),
            position: sanitizeUserText(exp.position, 200),
            location: sanitizeUserText(exp.location, 200),
            employmentType: exp.employmentType,
            workMode: exp.workMode,
            startDate: formatMonthYear(exp.startMonth, exp.startYear),
            endDate: exp.current
              ? "Present"
              : formatMonthYear(exp.endMonth, exp.endYear),
            current: Boolean(exp.current),
            description: sanitizeUserText(exp.description, 4000),
          }))
      : [],
    education: options.includeEducation
      ? educationList
          .filter((edu) => edu && typeof edu === "object")
          .slice(0, 15)
          .map((edu) => ({
            id: sanitizeUserText(edu.id, 100),
            institution: sanitizeUserText(edu.institution, 200),
            degree: sanitizeUserText(edu.degree, 200),
            fieldOfStudy: sanitizeUserText(edu.fieldOfStudy, 200),
            startDate: formatMonthYear(edu.startMonth, edu.startYear),
            endDate: edu.current
              ? "Present"
              : formatMonthYear(edu.endMonth, edu.endYear),
            current: Boolean(edu.current),
            gpa: sanitizeUserText(edu.gpa, 50),
            thesisTitle: sanitizeUserText(edu.thesisTitle, 300),
            defenseGrade: sanitizeUserText(edu.defenseGrade, 50),
            description: sanitizeUserText(edu.description, 2000),
          }))
      : [],
    skills: options.includeSkills
      ? skillsList
          .filter((s) => s && typeof s === "object")
          .slice(0, 80)
          .map((s) => sanitizeUserText(s.name, 100))
          .filter(Boolean)
      : [],
    projects: options.includeProjects
      ? projectsList
          .filter((proj) => proj && typeof proj === "object")
          .slice(0, 20)
          .map((proj) => ({
            id: sanitizeUserText(proj.id, 100),
            name: sanitizeUserText(proj.name, 200),
            technologies: sanitizeUserText(proj.technologies, 400),
            url: sanitizeUserText(proj.url, 300),
            description: sanitizeUserText(proj.description, 3000),
          }))
      : [],
    certifications: options.includeCertifications
      ? certificationsList
          .filter((cert) => cert && typeof cert === "object")
          .slice(0, 20)
          .map((cert) => ({
            // Note: attachmentId, attachmentName, attachmentSize, attachmentType are strictly excluded
            id: sanitizeUserText(cert.id, 100),
            name: sanitizeUserText(cert.name, 200),
            issuingOrganization: sanitizeUserText(cert.issuingOrganization, 200),
            issueDate: formatMonthYear(cert.issueMonth, cert.issueYear),
            expiryDate: cert.noExpiry
              ? "No Expiry"
              : formatMonthYear(cert.expiryMonth, cert.expiryYear),
            noExpiry: Boolean(cert.noExpiry),
            credentialId: sanitizeUserText(cert.credentialId, 150),
            credentialUrl: sanitizeUserText(cert.credentialUrl, 300),
          }))
      : [],
  };
}

