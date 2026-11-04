import React from "react";
import { CVData, SectionKey } from "@/types/cv";
import {
  getDocumentLabels,
  formatThesisAndGrade,
  formatDegreeMajorAndGpa,
} from "@/lib/i18n/cv-labels";
import { formatDateRange, formatMonthYear } from "@/lib/dates/date-utils";
import { normalizeUrl, cleanDisplayUrl } from "@/lib/utils";
import { ExternalLink } from "lucide-react";

export interface TemplateProps {
  data: CVData;
}

export function AtsModernTemplate({ data }: TemplateProps) {
  const {
    personalInfo,
    experience,
    education,
    skills,
    projects,
    certifications,
    language,
    sectionOrder,
  } = data;

  const labels = getDocumentLabels(language);

  const validExperience = experience.filter(
    (e) => e.company.trim() || e.position.trim()
  );
  const validEducation = education.filter(
    (e) => e.institution.trim() || e.degree.trim() || e.fieldOfStudy.trim()
  );
  const validSkills = skills.filter((s) => s.name.trim());
  const validProjects = projects.filter((p) => p.name.trim());
  const validCertifications = certifications.filter((c) => c.name.trim());

  const renderSection = (key: SectionKey) => {
    switch (key) {
      case "summary":
        if (!personalInfo.summary.trim()) return null;
        return (
          <section key="summary" className="mb-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#8B7CF6] border-b border-[#8B7CF6]/30 pb-1 mb-1.5 font-sans">
              {labels.sections.summary}
            </h2>
            <p className="text-xs text-[#374151] leading-relaxed whitespace-pre-line">
              {personalInfo.summary}
            </p>
          </section>
        );

      case "experience":
        if (validExperience.length === 0) return null;
        return (
          <section key="experience" className="mb-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#8B7CF6] border-b border-[#8B7CF6]/30 pb-1 mb-2 font-sans">
              {labels.sections.experience}
            </h2>
            <div className="space-y-3.5">
              {validExperience.map((item) => {
                const dateStr = formatDateRange(
                  item.startMonth,
                  item.startYear,
                  item.endMonth,
                  item.endYear,
                  item.current,
                  language
                );
                const empTypeLabel = labels.employmentTypes[item.employmentType];
                const workModeLabel = labels.workModes[item.workMode];

                return (
                  <div key={item.id} className="space-y-0.5">
                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                      <div className="font-bold text-xs sm:text-sm text-[#111827]">
                        {item.position}{" "}
                        {item.company && (
                          <span className="font-semibold text-[#8B7CF6]">
                            • {item.company}
                          </span>
                        )}
                        <span className="text-[11px] font-normal text-[#6B7280]">
                          {" "}
                          ({empTypeLabel} • {workModeLabel})
                        </span>
                      </div>
                      {dateStr && (
                        <div className="text-[11px] text-[#6B7280] font-medium shrink-0">
                          {dateStr}
                        </div>
                      )}
                    </div>

                    {item.location && (
                      <p className="text-[11px] text-[#6B7280] italic">
                        {item.location}
                      </p>
                    )}

                    {item.description && (
                      <p className="text-xs text-[#374151] leading-relaxed whitespace-pre-line pt-0.5">
                        {item.description}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        );

      case "education":
        if (validEducation.length === 0) return null;
        return (
          <section key="education" className="mb-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#8B7CF6] border-b border-[#8B7CF6]/30 pb-1 mb-2 font-sans">
              {labels.sections.education}
            </h2>
            <div className="space-y-3">
              {validEducation.map((item) => {
                const dateStr = formatDateRange(
                  item.startMonth,
                  item.startYear,
                  item.endMonth,
                  item.endYear,
                  item.current,
                  language
                );
                const degreeMajorAndGpa = formatDegreeMajorAndGpa(
                  item.degree,
                  item.fieldOfStudy,
                  item.gpa,
                  language
                );
                const thesisAndGrade = formatThesisAndGrade(
                  item.thesisTitle,
                  item.defenseGrade,
                  language
                );

                return (
                  <div key={item.id} className="space-y-0.5">
                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                      <div className="font-bold text-xs sm:text-sm text-[#111827]">
                        {item.institution}
                      </div>
                      {dateStr && (
                        <div className="text-[11px] text-[#6B7280] font-medium shrink-0 ml-2">
                          {dateStr}
                        </div>
                      )}
                    </div>

                    {degreeMajorAndGpa && (
                      <p className="text-xs text-[#4B5563] font-medium">
                        {degreeMajorAndGpa}
                      </p>
                    )}

                    {/* Thesis Title and Defense Grade displayed together */}
                    {thesisAndGrade && (
                      <p className="text-[11px] text-[#4B5563] italic">
                        {thesisAndGrade}
                      </p>
                    )}

                    {item.description && (
                      <p className="text-xs text-[#374151] pt-0.5 whitespace-pre-line">
                        {item.description}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        );

      case "skills":
        if (validSkills.length === 0) return null;
        return (
          <section key="skills" className="mb-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#8B7CF6] border-b border-[#8B7CF6]/30 pb-1 mb-2 font-sans">
              {labels.sections.skills}
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {validSkills.map((s) => (
                <span
                  key={s.id}
                  className="px-2.5 py-0.5 rounded-[4px] bg-[#F3F4F6] text-[#1F2937] text-xs font-medium"
                >
                  {s.name}
                </span>
              ))}
            </div>
          </section>
        );

      case "projects":
        if (validProjects.length === 0) return null;
        return (
          <section key="projects" className="mb-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#8B7CF6] border-b border-[#8B7CF6]/30 pb-1 mb-2 font-sans">
              {labels.sections.projects}
            </h2>
            <div className="space-y-2.5">
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
                        href={normalizeUrl(project.url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-[#8B7CF6] font-medium shrink-0 ml-2 hover:text-[#7C6AF4] transition-colors"
                      >
                        {cleanDisplayUrl(project.url)}
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
        );

      case "certifications":
        if (validCertifications.length === 0) return null;
        return (
          <section key="certifications" className="mb-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#8B7CF6] border-b border-[#8B7CF6]/30 pb-1 mb-2 font-sans">
              {labels.sections.certifications}
            </h2>
            <div className="space-y-2.5">
              {validCertifications.map((cert) => {
                const issueDateStr = formatMonthYear(
                  cert.issueMonth,
                  cert.issueYear,
                  language,
                  true
                );
                const expiryDateStr = cert.noExpiry
                  ? labels.noExpiry
                  : formatMonthYear(
                      cert.expiryMonth,
                      cert.expiryYear,
                      language,
                      true
                    );

                return (
                  <div key={cert.id} className="space-y-0.5">
                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                      <div className="font-bold text-xs sm:text-sm text-[#111827] flex items-center gap-1.5 flex-wrap">
                        <span>{cert.name}</span>
                        {cert.issuingOrganization && (
                          <span className="font-medium text-[#6B7280]">
                            • {cert.issuingOrganization}
                          </span>
                        )}
                        {cert.credentialUrl && (
                          <a
                            href={normalizeUrl(cert.credentialUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={labels.openCertificateLink}
                            aria-label={labels.openCertificateLink}
                            className="inline-flex items-center text-[#8B7CF6] hover:text-[#7C6AF4] transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                      <div className="text-[11px] text-[#6B7280] font-medium shrink-0">
                        {issueDateStr && (
                          <span>
                            {labels.issued}: {issueDateStr}
                          </span>
                        )}
                        {expiryDateStr && (
                          <span>
                            {" "}
                            • {labels.expires}: {expiryDateStr}
                          </span>
                        )}
                      </div>
                    </div>

                    {cert.credentialId && (
                      <div className="text-[11px] text-[#4B5563]">
                        <span className="font-semibold text-[#111827]">
                          {labels.credentialId}:
                        </span>{" "}
                        {cert.credentialId}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        );

      default:
        return null;
    }
  };

  return (
    <div
      style={{ width: "210mm", minHeight: "297mm", padding: "14mm 12mm" }}
      className="cv-document bg-white text-[#1E1E24] font-sans leading-relaxed box-border mx-auto"
    >
      {/* Header */}
      <header className="border-b-2 border-[#8B7CF6] pb-3.5 mb-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
          {personalInfo.fullName || "Your Name"}
        </h1>

        {personalInfo.jobTitle && (
          <p className="text-sm font-semibold text-[#8B7CF6] mt-0.5">
            {personalInfo.jobTitle}
          </p>
        )}

        {/* Contact Links Strip */}
        <div className="mt-2 text-xs text-[#4B5563] flex flex-wrap items-center gap-x-3 gap-y-1">
          {personalInfo.email && (
            <a
              href={`mailto:${personalInfo.email}`}
              className="text-[#4B5563] hover:text-[#111827] transition-colors"
            >
              {personalInfo.email}
            </a>
          )}
          {personalInfo.phone && <span>• {personalInfo.phone}</span>}
          {personalInfo.location && <span>• {personalInfo.location}</span>}
          {personalInfo.website && (
            <span>
              •{" "}
              <a
                href={normalizeUrl(personalInfo.website)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#8B7CF6] hover:text-[#7C6AF4] transition-colors"
              >
                {cleanDisplayUrl(personalInfo.website)}
              </a>
            </span>
          )}
          {personalInfo.linkedin && (
            <span>
              •{" "}
              <a
                href={normalizeUrl(personalInfo.linkedin)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#8B7CF6] hover:text-[#7C6AF4] transition-colors"
              >
                {cleanDisplayUrl(personalInfo.linkedin)}
              </a>
            </span>
          )}
          {personalInfo.github && (
            <span>
              •{" "}
              <a
                href={normalizeUrl(personalInfo.github)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#8B7CF6] hover:text-[#7C6AF4] transition-colors"
              >
                {cleanDisplayUrl(personalInfo.github)}
              </a>
            </span>
          )}
        </div>
      </header>

      {/* Dynamic Sections Ordered by User Preference */}
      <main className="space-y-1">
        {sectionOrder.map((sectionKey) => renderSection(sectionKey))}
      </main>
    </div>
  );
}
