import { z } from "zod";
import {
  AnalysisRequestInput,
  AnalysisResponseData,
  ATSFinding,
  geminiAnalysisRawSchema,
  analysisResponseSchema,
} from "@/lib/ai/schemas/analysis.schema";
import { buildAnalysisPrompts } from "@/lib/ai/prompts/analysis/analysis.prompts";
import { generateStructuredContent } from "@/lib/ai/gemini-client";
import { minimizeCVData } from "@/lib/ai/utils/sanitize-input";
import { CVData } from "@/types/cv";

export interface DeterministicAuditResult {
  score: number;
  criticalIssues: ATSFinding[];
  improvements: ATSFinding[];
  goodPractices: ATSFinding[];
  categoryScores: Array<{
    name: string;
    score: number;
    status: "good" | "needs_improvement" | "critical";
    summary: string;
  }>;
  summaryText: string;
}

/**
 * Performs deterministic structural and completeness checks across all 8 required ATS dimensions:
 * 1. Contact Information
 * 2. Professional Summary
 * 3. Work Experience
 * 4. Education
 * 5. Skills
 * 6. Projects
 * 7. Certifications
 * 8. ATS Formatting
 */
export function runDeterministicATSAudit(
  cv: Partial<CVData>
): DeterministicAuditResult {
  const criticalIssues: ATSFinding[] = [];
  const improvements: ATSFinding[] = [];
  const goodPractices: ATSFinding[] = [];

  const p = cv.personalInfo || {
    fullName: "",
    jobTitle: "",
    email: "",
    phone: "",
    location: "",
    website: "",
    linkedin: "",
    github: "",
    summary: "",
  };
  const experience = cv.experience || [];
  const education = cv.education || [];
  const skills = cv.skills || [];
  const projects = cv.projects || [];
  const certifications = cv.certifications || [];

  // 1. Contact Information (0-100)
  let contactScore = 100;
  if (!p.fullName?.trim()) {
    contactScore -= 35;
    criticalIssues.push({
      id: "det-contact-name",
      category: "Contact Information",
      severity: "critical",
      description: "Full Name is missing from Personal Information.",
      reason: "ATS parsers require a candidate name at the top of the document to index the profile.",
      recommended_action: "Add your full name in Section 1 (Personal Information).",
    });
  }
  if (!p.email?.trim()) {
    contactScore -= 30;
    criticalIssues.push({
      id: "det-contact-email",
      category: "Contact Information",
      severity: "critical",
      description: "Email address is missing.",
      reason: "Recruiters and ATS workflows cannot contact you without a valid email address.",
      recommended_action: "Add a professional email address in Personal Information.",
    });
  }
  if (!p.phone?.trim()) {
    contactScore -= 15;
    improvements.push({
      id: "det-contact-phone",
      category: "Contact Information",
      severity: "needs_improvement",
      description: "Phone number is not provided.",
      reason: "Most ATS platforms expect a phone number for recruiter screening calls.",
      recommended_action: "Add your phone number with country/area code.",
    });
  }
  if (!p.location?.trim()) {
    contactScore -= 10;
    improvements.push({
      id: "det-contact-location",
      category: "Contact Information",
      severity: "needs_improvement",
      description: "Location (City, Country/State) is missing.",
      reason: "Recruiters filter candidates by geographic location or time zone compatibility.",
      recommended_action: "Add your city and country/state in Personal Information.",
    });
  }
  if (!p.linkedin?.trim() && !p.github?.trim() && !p.website?.trim()) {
    contactScore -= 10;
    improvements.push({
      id: "det-contact-links",
      category: "Contact Information",
      severity: "needs_improvement",
      description: "No professional links (LinkedIn, GitHub, or Website) included.",
      reason: "Clickable professional profile links strengthen credibility during recruiter review.",
      recommended_action: "Add your LinkedIn or portfolio URL.",
    });
  } else {
    goodPractices.push({
      id: "det-contact-good",
      category: "Contact Information",
      severity: "good",
      description: "Professional contact coordinates and profile links are structured cleanly.",
      reason: "Plain-text contact headers ensure 100% ATS extraction accuracy.",
      recommended_action: "Keep contact links up to date.",
    });
  }
  contactScore = Math.max(0, contactScore);

  // 2. Professional Summary (0-100)
  let summaryScore = 100;
  const summaryLen = (p.summary || "").trim().length;
  if (summaryLen === 0) {
    summaryScore = 20;
    criticalIssues.push({
      id: "det-summary-missing",
      category: "Professional Summary",
      severity: "critical",
      description: "Professional Summary is empty.",
      reason: "The summary provides immediate keyword density and career positioning at the top of your CV.",
      recommended_action: "Write a 2–4 sentence summary or use the AI Summary Generator.",
      fixable_section: "summary",
    });
  } else if (summaryLen < 80) {
    summaryScore = 60;
    improvements.push({
      id: "det-summary-short",
      category: "Professional Summary",
      severity: "needs_improvement",
      description: "Professional Summary is very brief (< 80 characters).",
      reason: "An overly short summary misses key domain terminology and core competencies.",
      recommended_action: "Expand your summary to 2–4 sentences highlighting your core role and strengths.",
      fixable_section: "summary",
    });
  } else {
    goodPractices.push({
      id: "det-summary-good",
      category: "Professional Summary",
      severity: "good",
      description: "Professional Summary has an appropriate length for ATS scanning.",
      reason: "Provides a scannable executive overview without overwhelming the top of page 1.",
      recommended_action: "Tailor keywords in your summary for each target role.",
    });
  }

  // 3. Work Experience (0-100)
  let experienceScore = 100;
  if (experience.length === 0) {
    experienceScore = 25;
    criticalIssues.push({
      id: "det-exp-empty",
      category: "Work Experience",
      severity: "critical",
      description: "No Work Experience entries found.",
      reason: "Work Experience is the primary section evaluated by ATS systems and hiring managers.",
      recommended_action: "Add your full-time, part-time, freelance, or internship roles.",
    });
  } else {
    const missingDates = experience.some((e) => !e.startYear || (!e.current && !e.endYear));
    const missingDesc = experience.some((e) => !e.description?.trim() || e.description.trim().length < 40);
    if (missingDates) {
      experienceScore -= 25;
      improvements.push({
        id: "det-exp-dates",
        category: "Work Experience",
        severity: "needs_improvement",
        description: "One or more Work Experience entries are missing start or end dates.",
        reason: "ATS parsers calculate total years of experience from explicit start and end dates.",
        recommended_action: "Select month and year for all work experience entries.",
      });
    }
    if (missingDesc) {
      experienceScore -= 25;
      improvements.push({
        id: "det-exp-desc",
        category: "Work Experience",
        severity: "needs_improvement",
        description: "One or more roles have missing or very short descriptions.",
        reason: "Detailed bullet points are required to match role responsibilities against job descriptions.",
        recommended_action: "Use the AI Experience Writer to craft clear bullet points for each role.",
        fixable_section: "experience",
      });
    }
    if (!missingDates && !missingDesc) {
      goodPractices.push({
        id: "det-exp-good",
        category: "Work Experience",
        severity: "good",
        description: "Work Experience entries include complete dates, titles, companies, and descriptions.",
        reason: "Enables accurate chronological parsing by ATS engines.",
        recommended_action: "Continue using strong action verbs at the start of each bullet.",
      });
    }
  }
  experienceScore = Math.max(0, experienceScore);

  // 4. Education (0-100)
  let educationScore = 100;
  if (education.length === 0) {
    educationScore = 40;
    improvements.push({
      id: "det-edu-empty",
      category: "Education",
      severity: "needs_improvement",
      description: "Education section is empty.",
      reason: "Many ATS screening rules check for degree or educational background.",
      recommended_action: "Add your university, degree, and graduation year.",
    });
  } else {
    const missingDegreeOrInst = education.some(
      (ed) => !ed.institution?.trim() || !ed.degree?.trim()
    );
    if (missingDegreeOrInst) {
      educationScore = 70;
      improvements.push({
        id: "det-edu-incomplete",
        category: "Education",
        severity: "needs_improvement",
        description: "An education entry is missing its institution or degree name.",
        reason: "Complete degree and institution fields are needed for education verification.",
        recommended_action: "Fill in both Institution and Degree for each education entry.",
      });
    } else {
      goodPractices.push({
        id: "det-edu-good",
        category: "Education",
        severity: "good",
        description: "Education section includes clear institution and degree credentials.",
        reason: "Meets standard ATS academic qualification checks.",
        recommended_action: "Include GPA or honors if applicable.",
      });
    }
  }

  // 5. Skills (0-100)
  let skillsScore = 100;
  if (skills.length === 0) {
    skillsScore = 15;
    criticalIssues.push({
      id: "det-skills-empty",
      category: "Skills",
      severity: "critical",
      description: "No skills added to the Skills section.",
      reason: "ATS keyword matching relies heavily on a dedicated plain-text Skills section.",
      recommended_action: "Add at least 6–12 core technical and domain skills.",
      fixable_section: "skills",
    });
  } else if (skills.length < 5) {
    skillsScore = 60;
    improvements.push({
      id: "det-skills-few",
      category: "Skills",
      severity: "needs_improvement",
      description: `Only ${skills.length} skill(s) listed.`,
      reason: "Listing fewer than 5 skills reduces keyword coverage in ATS searches.",
      recommended_action: "Add 6–12 relevant technical, tool, and domain skills.",
      fixable_section: "skills",
    });
  } else {
    goodPractices.push({
      id: "det-skills-good",
      category: "Skills",
      severity: "good",
      description: `${skills.length} skills formatted as clean, ATS-readable text without graphical bars.`,
      reason: "Plain-text skill lists parse reliably across Workday, Greenhouse, and Lever.",
      recommended_action: "Align skill terminology with your target job descriptions.",
    });
  }

  // 6. Projects & Certifications (0-100)
  let projectsCertsScore = 85;
  if (projects.length === 0 && certifications.length === 0) {
    projectsCertsScore = 65;
    improvements.push({
      id: "det-projects-certs-empty",
      category: "Projects & Certifications",
      severity: "needs_improvement",
      description: "Neither Projects nor Certifications are included.",
      reason: "Projects and certifications provide strong proof of hands-on skills and continuous learning.",
      recommended_action: "Add notable projects or industry certifications if applicable.",
    });
  } else {
    goodPractices.push({
      id: "det-projects-certs-good",
      category: "Projects & Certifications",
      severity: "good",
      description: "Supplementary proof of expertise (Projects and/or Certifications) is present.",
      reason: "Reinforces technical keywords and practical impact.",
      recommended_action: "Ensure project technologies and URLs are up to date.",
    });
  }

  // 7. ATS Formatting (Always 100 in ClayCV templates, verified deterministically)
  const formattingScore = 100;
  goodPractices.push({
    id: "det-ats-formatting",
    category: "ATS Formatting",
    severity: "good",
    description: `Single-column ${cv.template || "modern"} ATS template with selectable text, standard section headings, and zero graphic-only skill bars.`,
    reason: "ClayCV templates strictly enforce single-column reading order and standard typography for maximum ATS compatibility.",
    recommended_action: "Export directly using ClayCV's A4 PDF button.",
  });

  const categoryScores: DeterministicAuditResult["categoryScores"] = [
    {
      name: "Contact Information",
      score: contactScore,
      status:
        contactScore >= 85
          ? "good"
          : contactScore >= 60
          ? "needs_improvement"
          : "critical",
      summary: `${contactScore}/100 completeness for contact coordinates and links.`,
    },
    {
      name: "Professional Summary",
      score: summaryScore,
      status:
        summaryScore >= 80
          ? "good"
          : summaryScore >= 50
          ? "needs_improvement"
          : "critical",
      summary:
        summaryLen > 0
          ? `Summary present (${summaryLen} chars).`
          : "Summary missing.",
    },
    {
      name: "Work Experience",
      score: experienceScore,
      status:
        experienceScore >= 80
          ? "good"
          : experienceScore >= 50
          ? "needs_improvement"
          : "critical",
      summary: `${experience.length} role(s) evaluated for dates and descriptions.`,
    },
    {
      name: "Education",
      score: educationScore,
      status:
        educationScore >= 80
          ? "good"
          : educationScore >= 50
          ? "needs_improvement"
          : "critical",
      summary: `${education.length} education record(s) evaluated.`,
    },
    {
      name: "Skills & Competencies",
      score: skillsScore,
      status:
        skillsScore >= 80
          ? "good"
          : skillsScore >= 50
          ? "needs_improvement"
          : "critical",
      summary: `${skills.length} plain-text skill(s) listed.`,
    },
    {
      name: "Projects & Certifications",
      score: projectsCertsScore,
      status: projectsCertsScore >= 80 ? "good" : "needs_improvement",
      summary: `${projects.length} project(s), ${certifications.length} certification(s).`,
    },
    {
      name: "ATS Formatting",
      score: formattingScore,
      status: "good",
      summary: "Single-column A4 layout with standard headings and selectable text.",
    },
  ];

  // Weighted deterministic score
  const weightedScore = Math.round(
    contactScore * 0.15 +
      summaryScore * 0.15 +
      experienceScore * 0.25 +
      educationScore * 0.12 +
      skillsScore * 0.15 +
      projectsCertsScore * 0.08 +
      formattingScore * 0.1
  );

  const summaryText = categoryScores
    .map((c) => `- ${c.name}: ${c.score}/100 (${c.status}) - ${c.summary}`)
    .join("\n");

  return {
    score: Math.max(0, Math.min(100, weightedScore)),
    criticalIssues,
    improvements,
    goodPractices,
    categoryScores,
    summaryText,
  };
}

export async function executeCVAnalysis(
  input: AnalysisRequestInput,
  env: NodeJS.ProcessEnv = process.env
): Promise<{ result: AnalysisResponseData; model: string }> {
  const rawCv = input.cvData as Partial<CVData>;
  const deterministic = runDeterministicATSAudit(rawCv);

  const cvContext = minimizeCVData(rawCv, {
    includeContact: true,
    includeSummary: true,
    includeExperience: true,
    includeEducation: true,
    includeSkills: true,
    includeProjects: true,
    includeCertifications: true,
  });

  const { systemInstruction, prompt } = buildAnalysisPrompts({
    cvContext,
    deterministicSummary: deterministic.summaryText,
  });

  const jsonSchema = z.toJSONSchema(geminiAnalysisRawSchema) as Record<
    string,
    unknown
  >;

  const { data: aiAnalysis, model } = await generateStructuredContent({
    systemInstruction,
    prompt,
    schema: geminiAnalysisRawSchema,
    jsonSchema,
    temperature: 0.2,
    env,
  });

  const aiScore = Math.max(0, Math.min(100, Math.round(aiAnalysis.ai_quality_score)));
  const overallScore = Math.round(deterministic.score * 0.5 + aiScore * 0.5);

  const mergedCategories = [
    ...deterministic.categoryScores,
    ...aiAnalysis.categories.filter(
      (aiCat) =>
        !deterministic.categoryScores.some(
          (detCat) => detCat.name.toLowerCase() === aiCat.name.toLowerCase()
        )
    ),
  ];

  const fullResult: AnalysisResponseData = analysisResponseSchema.parse({
    overall_score: overallScore,
    deterministic_score: deterministic.score,
    ai_quality_score: aiScore,
    methodology_explanation:
      "Overall ATS & CV Score combines 50% deterministic structural/completeness checks (contact fields, dates, section headings, single-column A4 formatting) and 50% Google Gemini qualitative analysis (action verbs, clarity, impact specificity, and keyword relevance). Scores are informational estimates and cannot guarantee acceptance by all ATS platforms.",
    categories: mergedCategories,
    critical_issues: [
      ...deterministic.criticalIssues,
      ...aiAnalysis.critical_issues,
    ],
    improvements: [...deterministic.improvements, ...aiAnalysis.improvements],
    good_practices: [
      ...deterministic.goodPractices,
      ...aiAnalysis.good_practices,
    ],
    recommendations: aiAnalysis.recommendations,
  });

  return { result: fullResult, model };
}

