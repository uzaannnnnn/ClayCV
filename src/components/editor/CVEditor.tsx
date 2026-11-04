"use client";

import React, { useState } from "react";
import { useCVStore } from "@/store/cv-store";
import { SectionCard } from "./SectionCard";
import { PersonalInfoForm } from "./PersonalInfoForm";
import { ExperienceForm } from "./ExperienceForm";
import { EducationForm } from "./EducationForm";
import { SkillsForm } from "./SkillsForm";
import { ProjectsForm } from "./ProjectsForm";
import {
  User,
  Briefcase,
  GraduationCap,
  Sparkles,
  FolderGit2,
  ShieldCheck,
} from "lucide-react";

export function CVEditor() {
  const { cvData } = useCVStore();
  const { personalInfo, experience, education, skills, projects } = cvData;

  // Track accordion open state (default personal info open)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    personal: true,
    experience: true,
    education: false,
    skills: false,
    projects: false,
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

  return (
    <div className="space-y-4 pb-12">
      {/* 1. Personal Information */}
      <SectionCard
        id="personal-section"
        title="Personal Information"
        description="Name, job title, contact details & summary"
        icon={User}
        badge={personalCompletion}
        isOpen={openSections.personal}
        onToggle={() => toggleSection("personal")}
      >
        <PersonalInfoForm />
      </SectionCard>

      {/* 2. Work Experience */}
      <SectionCard
        id="experience-section"
        title="Work Experience"
        description="Past & present positions, company impact"
        icon={Briefcase}
        badge={experienceCount > 0 ? `${experienceCount} roles` : null}
        isOpen={openSections.experience}
        onToggle={() => toggleSection("experience")}
      >
        <ExperienceForm />
      </SectionCard>

      {/* 3. Education */}
      <SectionCard
        id="education-section"
        title="Education"
        description="Universities, degrees, fields of study"
        icon={GraduationCap}
        badge={educationCount > 0 ? `${educationCount} schools` : null}
        isOpen={openSections.education}
        onToggle={() => toggleSection("education")}
      >
        <EducationForm />
      </SectionCard>

      {/* 4. Skills */}
      <SectionCard
        id="skills-section"
        title="Skills & Competencies"
        description="Tools, languages, and core specializations"
        icon={Sparkles}
        badge={skillsCount > 0 ? `${skillsCount} skills` : null}
        isOpen={openSections.skills}
        onToggle={() => toggleSection("skills")}
      >
        <SkillsForm />
      </SectionCard>

      {/* 5. Projects */}
      <SectionCard
        id="projects-section"
        title="Key Projects"
        description="Open source, client work, and personal apps"
        icon={FolderGit2}
        badge={projectsCount > 0 ? `${projectsCount} projects` : null}
        isOpen={openSections.projects}
        onToggle={() => toggleSection("projects")}
      >
        <ProjectsForm />
      </SectionCard>

      {/* Privacy guarantee note in editor */}
      <div className="clay-card-sm p-4 bg-[#FAF8F5] flex items-center gap-3 text-xs text-[#777482] mt-6">
        <ShieldCheck className="w-5 h-5 text-[#8B7CF6] shrink-0" />
        <p>
          Your CV is stored locally in this browser. We do not upload your
          personal information to a server.
        </p>
      </div>
    </div>
  );
}
