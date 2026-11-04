export type TemplateType = "modern" | "classic";

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

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface ExperienceItem {
  id: string;
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface SkillItem {
  id: string;
  name: string;
  level?: string;
}

export interface ProjectItem {
  id: string;
  name: string;
  description: string;
  technologies: string;
  url: string;
}

export interface CVData {
  id: string;
  title: string;
  template: TemplateType;
  personalInfo: PersonalInfo;
  education: EducationItem[];
  experience: ExperienceItem[];
  skills: SkillItem[];
  projects: ProjectItem[];
  updatedAt: string;
}

export type SaveStatus = "saved" | "saving" | "error";
