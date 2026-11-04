export type CVLanguage = "en" | "id";

export type TemplateType = "classic" | "modern" | "minimal";

export type EmploymentType =
  | "internship"
  | "full-time"
  | "part-time"
  | "freelance";

export type WorkMode = "onsite" | "remote";

export type SectionKey =
  | "summary"
  | "experience"
  | "education"
  | "skills"
  | "projects"
  | "certifications";

export interface PersonalInfo {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  linkedin: string;
  github: string;
  summary: string;
}

export interface ExperienceItem {
  id: string;
  company: string;
  position: string;
  location: string;
  employmentType: EmploymentType;
  workMode: WorkMode;
  startMonth: number | null;
  startYear: number | null;
  endMonth: number | null;
  endYear: number | null;
  current: boolean;
  description: string;
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startMonth: number | null;
  startYear: number | null;
  endMonth: number | null;
  endYear: number | null;
  current: boolean;
  description: string;
  thesisTitle: string;
  defenseGrade: string;
  gpa: string;
}

export interface SkillItem {
  id: string;
  name: string;
}

export interface ProjectItem {
  id: string;
  name: string;
  description: string;
  technologies: string;
  url: string;
}

export interface CertificationItem {
  id: string;
  name: string;
  issuingOrganization: string;
  issueMonth: number | null;
  issueYear: number | null;
  expiryMonth: number | null;
  expiryYear: number | null;
  noExpiry: boolean;
  credentialId: string;
  credentialUrl: string;
  attachmentId?: string;
  attachmentName?: string;
  attachmentSize?: number;
  attachmentType?: string;
}

export interface CVData {
  id: string;
  title: string;
  language: CVLanguage;
  template: TemplateType;
  sectionOrder: SectionKey[];
  personalInfo: PersonalInfo;
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: SkillItem[];
  projects: ProjectItem[];
  certifications: CertificationItem[];
  updatedAt: string;
}

export type SaveStatus = "saved" | "saving" | "error";
