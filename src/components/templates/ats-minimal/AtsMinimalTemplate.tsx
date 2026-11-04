import React from "react";
import { CVData, SectionKey } from "@/types/cv";
import {
  getDocumentLabels,
  formatThesisAndGrade,
  formatDegreeMajorAndGpa,
} from "@/lib/i18n/cv-labels";
import {
  formatDateRange,
  formatCertificationDates,
} from "@/lib/dates/date-utils";
import { normalizeUrl, cleanDisplayUrl } from "@/lib/utils";
import { ExternalLink } from "lucide-react";

export interface TemplateProps {
  data: CVData;
}

export function AtsMinimalTemplate({ data }: TemplateProps) {
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
          <section key="summary" className="mb-3.5">
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-black border-b border-black pb-0.5 mb-1 font-sans">
              {labels.sections.summary}
            </h2>
            <p className="text-xs text-black leading-relaxed whitespace-pre-line">
              {personalInfo.summary}
            </p>
          </section>
        );

      case "experience":
        if (validExperience.length === 0) return null;
        return (
          <section key="experience" className="mb-3.5">
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-black border-b border-black pb-0.5 mb-1.5 font-sans">
              {labels.sections.experience}
            </h2>
            <div className="space-y-3">
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
                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between text-xs">
                      <div className="font-bold text-black">
                        {item.position}{" "}
                        {item.company && (
                          <span className="font-normal text-black">
                            — {item.company}
                          </span>
                        )}
                        <span className="text-[10px] text-gray-700">
                          {" "}
                          [{empTypeLabel}, {workModeLabel}]
                        </span>
                      </div>
                      {dateStr && (
                        <div className="text-[11px] text-black shrink-0">
                          {dateStr}
                        </div>
                      )}
                    </div>

                    {item.location && (
                      <p className="text-[10px] text-gray-700 italic">
                        {item.location}
                      </p>
                    )}

                    {item.description && (
                      <p className="text-xs text-black leading-relaxed whitespace-pre-line pt-0.5">
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
          <section key="education" className="mb-3.5">
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-black border-b border-black pb-0.5 mb-1.5 font-sans">
              {labels.sections.education}
            </h2>
            <div className="space-y-2.5">
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
                  <div key={item.id} className="space-y-0.5 text-xs">
                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                      <div className="font-bold text-black">
                        {item.institution}
                      </div>
                      {dateStr && (
                        <div className="text-[11px] text-black shrink-0 ml-2">
                          {dateStr}
                        </div>
                      )}
                    </div>

                    {degreeMajorAndGpa && (
                      <p className="text-xs text-black">
                        {degreeMajorAndGpa}
                      </p>
                    )}

                    {/* Thesis Title and Defense Grade displayed together */}
                    {thesisAndGrade && (
                      <p className="text-[10px] text-gray-800 italic">
                        {thesisAndGrade}
                      </p>
                    )}

                    {item.description && (
                      <p className="text-xs text-black pt-0.5 whitespace-pre-line">
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
          <section key="skills" className="mb-3.5">
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-black border-b border-black pb-0.5 mb-1 font-sans">
              {labels.sections.skills}
            </h2>
            <p className="text-xs text-black leading-relaxed">
              {validSkills.map((s, idx) => (
                <span key={s.id}>
                  <span>{s.name}</span>
                  {idx < validSkills.length - 1 && "  •  "}
                </span>
              ))}
            </p>
          </section>
        );

      case "projects":
        if (validProjects.length === 0) return null;
        return (
          <section key="projects" className="mb-3.5">
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-black border-b border-black pb-0.5 mb-1.5 font-sans">
              {labels.sections.projects}
            </h2>
            <div className="space-y-2">
              {validProjects.map((project) => (
                <div key={project.id} className="space-y-0.5 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between">
                    <div className="font-bold text-black">
                      {project.name}{" "}
                      {project.technologies && (
                        <span className="font-normal text-gray-700">
                          [{project.technologies}]
                        </span>
                      )}
                    </div>
                    {project.url && (
                      <a
                        href={normalizeUrl(project.url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-black font-mono shrink-0 ml-2 hover:opacity-75 transition-opacity"
                      >
                        {cleanDisplayUrl(project.url)}
                      </a>
                    )}
                  </div>
                  {project.description && (
                    <p className="text-xs text-black pt-0.5 whitespace-pre-line leading-relaxed">
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
          <section key="certifications" className="mb-3.5">
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-black border-b border-black pb-0.5 mb-1.5 font-sans">
              {labels.sections.certifications}
            </h2>
            <div className="space-y-2 text-xs">
              {validCertifications.map((cert) => {
                const certDates = formatCertificationDates(
                  cert.issueMonth,
                  cert.issueYear,
                  cert.expiryMonth,
                  cert.expiryYear,
                  cert.noExpiry,
                  language
                );

                return (
                  <div key={cert.id} className="space-y-0.5">
                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                      <div className="font-bold text-black">
                        <span>{cert.name}</span>
                        {cert.issuingOrganization && (
                          <span className="font-normal">
                            {" "}
                            — {cert.issuingOrganization}
                          </span>
                        )}
                        {cert.credentialUrl && (
                          <a
                            href={normalizeUrl(cert.credentialUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={labels.openCertificateLink}
                            aria-label={labels.openCertificateLink}
                            className="inline-flex items-center ml-1 text-gray-700 hover:text-black transition-colors align-baseline"
                          >
                            <ExternalLink className="w-3 h-3 inline" />
                          </a>
                        )}
                      </div>
                      {certDates && (
                        <div className="text-[11px] text-black shrink-0 ml-2">
                          {certDates}
                        </div>
                      )}
                    </div>

                    {cert.credentialId && (
                      <div className="text-[10px] text-gray-800">
                        <span className="font-semibold">
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
      className="cv-document bg-white text-black font-sans leading-snug box-border mx-auto"
    >
      {/* Header */}
      <header className="border-b border-black pb-2.5 mb-3.5">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-black">
          {personalInfo.fullName || "YOUR NAME"}
        </h1>

        {personalInfo.jobTitle && (
          <p className="text-xs font-medium text-black mt-0.5">
            {personalInfo.jobTitle}
          </p>
        )}

        {/* Contact Links Strip */}
        <div className="mt-1.5 text-[11px] text-black flex flex-wrap items-center gap-x-3 gap-y-1">
          {personalInfo.email && (
            <a
              href={`mailto:${personalInfo.email}`}
              className="text-black hover:opacity-75 transition-opacity"
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
                className="text-black hover:opacity-75 transition-opacity"
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
                className="text-black hover:opacity-75 transition-opacity"
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
                className="text-black hover:opacity-75 transition-opacity"
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
