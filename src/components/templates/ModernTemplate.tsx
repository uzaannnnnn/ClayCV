import React from "react";
import { CVData } from "@/types/cv";
import { Mail, Phone, MapPin, Globe } from "lucide-react";

function LinkedinIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="14"
      height="14"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function GithubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="14"
      height="14"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
    </svg>
  );
}

export interface TemplateProps {
  data: CVData;
}

export function ModernTemplate({ data }: TemplateProps) {
  const { personalInfo, education, experience, skills, projects } = data;

  // Filter out empty items
  const validEducation = education.filter(
    (e) => e.institution.trim() || e.degree.trim() || e.fieldOfStudy.trim()
  );
  const validExperience = experience.filter(
    (e) => e.company.trim() || e.position.trim()
  );
  const validSkills = skills.filter((s) => s.name.trim());
  const validProjects = projects.filter((p) => p.name.trim());

  const hasContactInfo =
    personalInfo.email ||
    personalInfo.phone ||
    personalInfo.location ||
    personalInfo.website ||
    personalInfo.linkedin ||
    personalInfo.github;

  return (
    <div className="w-full bg-white text-[#1E1E24] p-8 sm:p-10 font-sans leading-relaxed">
      {/* Header */}
      <header className="border-b-2 border-[#8B7CF6] pb-4 mb-5">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
          {personalInfo.fullName || "Your Name"}
        </h1>
        {personalInfo.jobTitle && (
          <p className="text-sm sm:text-base font-semibold text-[#8B7CF6] mt-0.5">
            {personalInfo.jobTitle}
          </p>
        )}

        {/* Contact Strip */}
        {hasContactInfo && (
          <div className="mt-2.5 flex flex-wrap gap-y-1.5 gap-x-4 text-xs text-[#4B5563]">
            {personalInfo.email && (
              <span className="inline-flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#8B7CF6] shrink-0" />
                <a
                  href={`mailto:${personalInfo.email}`}
                  className="hover:underline text-[#4B5563]"
                >
                  {personalInfo.email}
                </a>
              </span>
            )}
            {personalInfo.phone && (
              <span className="inline-flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#8B7CF6] shrink-0" />
                <span>{personalInfo.phone}</span>
              </span>
            )}
            {personalInfo.location && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#8B7CF6] shrink-0" />
                <span>{personalInfo.location}</span>
              </span>
            )}
            {personalInfo.website && (
              <span className="inline-flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-[#8B7CF6] shrink-0" />
                <a
                  href={personalInfo.website.startsWith("http") ? personalInfo.website : `https://${personalInfo.website}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:underline text-[#4B5563]"
                >
                  {personalInfo.website.replace(/^https?:\/\//, "")}
                </a>
              </span>
            )}
            {personalInfo.linkedin && (
              <span className="inline-flex items-center gap-1.5">
                <LinkedinIcon className="w-3.5 h-3.5 text-[#8B7CF6] shrink-0" />
                <a
                  href={personalInfo.linkedin.startsWith("http") ? personalInfo.linkedin : `https://${personalInfo.linkedin}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:underline text-[#4B5563]"
                >
                  {personalInfo.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, "in/")}
                </a>
              </span>
            )}
            {personalInfo.github && (
              <span className="inline-flex items-center gap-1.5">
                <GithubIcon className="w-3.5 h-3.5 text-[#8B7CF6] shrink-0" />
                <a
                  href={personalInfo.github.startsWith("http") ? personalInfo.github : `https://${personalInfo.github}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:underline text-[#4B5563]"
                >
                  {personalInfo.github.replace(/^https?:\/\/(www\.)?github\.com\//, "github/")}
                </a>
              </span>
            )}
          </div>
        )}
      </header>

      {/* Summary */}
      {personalInfo.summary && (
        <section className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#8B7CF6] mb-1.5">
            Professional Summary
          </h2>
          <p className="text-xs sm:text-sm text-[#374151] whitespace-pre-line leading-relaxed">
            {personalInfo.summary}
          </p>
        </section>
      )}

      {/* Experience */}
      {validExperience.length > 0 && (
        <section className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#8B7CF6] mb-2 border-b border-gray-100 pb-1">
            Work Experience
          </h2>
          <div className="space-y-4">
            {validExperience.map((item) => (
              <div key={item.id} className="space-y-1">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-0.5">
                  <div className="font-bold text-xs sm:text-sm text-[#111827]">
                    {item.position}{" "}
                    {item.company && (
                      <span className="font-semibold text-[#8B7CF6]">
                        • {item.company}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-[#6B7280] font-medium shrink-0">
                    {item.startDate && (
                      <span>
                        {item.startDate} —{" "}
                        {item.current ? "Present" : item.endDate || "Present"}
                      </span>
                    )}
                  </div>
                </div>

                {item.location && (
                  <p className="text-[11px] text-[#6B7280] italic">
                    {item.location}
                  </p>
                )}

                {item.description && (
                  <p className="text-xs text-[#374151] whitespace-pre-line leading-relaxed pt-0.5">
                    {item.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {validEducation.length > 0 && (
        <section className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#8B7CF6] mb-2 border-b border-gray-100 pb-1">
            Education
          </h2>
          <div className="space-y-3">
            {validEducation.map((item) => (
              <div key={item.id} className="space-y-0.5">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-0.5">
                  <div className="font-bold text-xs sm:text-sm text-[#111827]">
                    {item.institution}
                  </div>
                  <div className="text-[11px] text-[#6B7280] font-medium shrink-0">
                    {item.startDate && (
                      <span>
                        {item.startDate} — {item.endDate || "Present"}
                      </span>
                    )}
                  </div>
                </div>
                {(item.degree || item.fieldOfStudy) && (
                  <p className="text-xs text-[#4B5563] font-medium">
                    {item.degree}
                    {item.degree && item.fieldOfStudy ? " in " : ""}
                    {item.fieldOfStudy}
                  </p>
                )}
                {item.description && (
                  <p className="text-xs text-[#374151] pt-0.5 whitespace-pre-line">
                    {item.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills */}
      {validSkills.length > 0 && (
        <section className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#8B7CF6] mb-2 border-b border-gray-100 pb-1">
            Skills & Competencies
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {validSkills.map((skill) => (
              <span
                key={skill.id}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[6px] bg-[#F3F4F6] text-[#1F2937] text-xs font-medium"
              >
                <span>{skill.name}</span>
                {skill.level && (
                  <span className="text-[10px] text-[#8B7CF6] font-semibold">
                    ({skill.level})
                  </span>
                )}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {validProjects.length > 0 && (
        <section className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#8B7CF6] mb-2 border-b border-gray-100 pb-1">
            Projects
          </h2>
          <div className="space-y-3">
            {validProjects.map((project) => (
              <div key={project.id} className="space-y-0.5">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                  <div className="font-bold text-xs sm:text-sm text-[#111827]">
                    {project.name}{" "}
                    {project.technologies && (
                      <span className="text-xs font-normal text-[#6B7280]">
                        • {project.technologies}
                      </span>
                    )}
                  </div>
                  {project.url && (
                    <a
                      href={project.url.startsWith("http") ? project.url : `https://${project.url}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-[#8B7CF6] hover:underline truncate max-w-xs"
                    >
                      {project.url.replace(/^https?:\/\//, "")}
                    </a>
                  )}
                </div>
                {project.description && (
                  <p className="text-xs text-[#374151] pt-0.5 whitespace-pre-line leading-relaxed">
                    {project.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
