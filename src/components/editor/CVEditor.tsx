"use client";

import React, { useState } from "react";
import { useCVStore } from "@/store/cv-store";
import { SectionCard } from "./SectionCard";
import { PersonalInfoForm } from "./PersonalInfoForm";
import { SummaryForm } from "./SummaryForm";
import { ExperienceForm } from "./ExperienceForm";
import { EducationForm } from "./EducationForm";
import { SkillsForm } from "./SkillsForm";
import { ProjectsForm } from "./ProjectsForm";
import { CertificationsForm } from "./CertificationsForm";
import { SectionOrderManager } from "./SectionOrderManager";
import {
  User,
  FileText,
  Briefcase,
  GraduationCap,
  Wrench,
  FolderGit2,
  Award,
  ArrowDownUp,
  ShieldCheck,
} from "lucide-react";

export function CVEditor() {
  const { cvData } = useCVStore();
  const { personalInfo, experience, education, skills, projects, certifications } =
    cvData;

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    personal: true,
    summary: true,
    experience: true,
    education: false,
    skills: false,
    projects: false,
    certifications: false,
    order: false,
  });

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const personalCompletion = personalInfo.fullName ? "Ready" : "Required";
  const experienceCount = experience.length;
  const educationCount = education.length;
  const skillsCount = skills.length;
  const projectsCount = projects.length;
  const certsCount = certifications.length;

  return (
    <div className="space-y-4 pb-12">
      {/* 1. Personal Information */}
      <SectionCard
        id="personal-section"
        title="1. Personal Information"
        description="Name, job title, and contact coordinates"
        icon={User}
        badge={personalCompletion}
        isOpen={openSections.personal}
        onToggle={() => toggleSection("personal")}
      >
        <PersonalInfoForm />
      </SectionCard>

      {/* 2. Professional Summary */}
      <SectionCard
        id="summary-section"
        title="2. Professional Summary"
        description="Core background, strengths, and career highlights"
        icon={FileText}
        badge={personalInfo.summary ? "Added" : null}
        isOpen={openSections.summary}
        onToggle={() => toggleSection("summary")}
      >
        <SummaryForm />
      </SectionCard>

      {/* 3. Work Experience */}
      <SectionCard
        id="experience-section"
        title="3. Work Experience"
        description="Roles, employment types, work mode & dates"
        icon={Briefcase}
        badge={experienceCount > 0 ? `${experienceCount} roles` : null}
        isOpen={openSections.experience}
        onToggle={() => toggleSection("experience")}
      >
        <ExperienceForm />
      </SectionCard>

      {/* 4. Education */}
      <SectionCard
        id="education-section"
        title="4. Education"
        description="Institutions, degrees, thesis & GPA"
        icon={GraduationCap}
        badge={educationCount > 0 ? `${educationCount} schools` : null}
        isOpen={openSections.education}
        onToggle={() => toggleSection("education")}
      >
        <EducationForm />
      </SectionCard>

      {/* 5. Skills */}
      <SectionCard
        id="skills-section"
        title="5. Skills & Competencies"
        description="Technical toolset and capabilities (pure text)"
        icon={Wrench}
        badge={skillsCount > 0 ? `${skillsCount} skills` : null}
        isOpen={openSections.skills}
        onToggle={() => toggleSection("skills")}
      >
        <SkillsForm />
      </SectionCard>

      {/* 6. Projects */}
      <SectionCard
        id="projects-section"
        title="6. Projects"
        description="Open source, client work, and personal apps"
        icon={FolderGit2}
        badge={projectsCount > 0 ? `${projectsCount} projects` : null}
        isOpen={openSections.projects}
        onToggle={() => toggleSection("projects")}
      >
        <ProjectsForm />
      </SectionCard>

      {/* 7. Certifications */}
      <SectionCard
        id="certifications-section"
        title="7. Certifications"
        description="Credentials, issue dates, and file attachments"
        icon={Award}
        badge={certsCount > 0 ? `${certsCount} certs` : null}
        isOpen={openSections.certifications}
        onToggle={() => toggleSection("certifications")}
      >
        <CertificationsForm />
      </SectionCard>

      {/* 8. Section Ordering */}
      <SectionCard
        id="ordering-section"
        title="8. Customize Section Order"
        description="Drag or use arrows to rearrange sections on your CV"
        icon={ArrowDownUp}
        badge="Customizable"
        isOpen={openSections.order}
        onToggle={() => toggleSection("order")}
      >
        <SectionOrderManager />
      </SectionCard>

      {/* Privacy guarantee note in editor */}
      <div className="clay-card-sm p-4 bg-[#FAF8F5] flex items-center gap-3 text-xs text-[#777482] mt-6">
        <ShieldCheck className="w-5 h-5 text-[#8B7CF6] shrink-0" />
        <p>
          Your CV and certificate files are stored locally in this browser.
          Minimized CV text is only sent to the Google Gemini API when you
          explicitly grant consent and trigger an AI feature.
        </p>
      </div>
    </div>
  );
}
