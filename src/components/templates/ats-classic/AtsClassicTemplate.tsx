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

export function AtsClassicTemplate({ data }: TemplateProps) {
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

  // Filter valid entries
  const validExperience = experience.filter(
    (e) => e.company.trim() || e.position.trim()
  );
  const validEducation = education.filter(
    (e) => e.institution.trim() || e.degree.trim() || e.fieldOfStudy.trim()
  );
  const validSkills = skills.filter((s) => s.name.trim());
  const validProjects = projects.filter((p) => p.name.trim());
  const validCertifications = certifications.filter((c) => c.name.trim());

  // Render Section by Key
  const renderSection = (key: SectionKey) => {
    switch (key) {
      case "summary":
        if (!personalInfo.summary.trim()) return null;
        return (
          <section key="summary" className="mb-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-black border-b border-gray-400 pb-0.5 mb-1.5 font-serif">
              {labels.sections.summary}
            </h2>
            <p className="text-xs text-gray-800 font-sans leading-relaxed whitespace-pre-line text-justify">
              {personalInfo.summary}
            </p>
          </section>
        );

      case "experience":
        if (validExperience.length === 0) return null;
        return (
          <section key="experience" className="mb-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-black border-b border-gray-400 pb-0.5 mb-2 font-serif">
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
                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between font-sans">
                      <div className="font-bold text-xs sm:text-sm text-black">
                        {item.position || "Position"}
                        {item.company && (
                          <span className="font-normal italic text-gray-800">
                            {" "}
                            — {item.company}
                          </span>
                        )}
                        <span className="text-[11px] font-normal text-gray-600">
                          {" "}
                          ({empTypeLabel} • {workModeLabel})
                        </span>
                      </div>
                      {dateStr && (
                        <div className="text-[11px] text-gray-600 font-medium shrink-0">
                          {dateStr}
                        </div>
                      )}
                    </div>

                    {item.location && (
                      <p className="text-[11px] text-gray-600 italic font-sans -mt-0.5">
                        {item.location}
                      </p>
                    )}

                    {item.description && (
                      <p className="text-xs text-gray-800 font-sans leading-relaxed whitespace-pre-line text-justify pt-0.5">
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
            <h2 className="text-xs font-bold uppercase tracking-wider text-black border-b border-gray-400 pb-0.5 mb-2 font-serif">
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
                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between font-sans">
                      <div className="font-bold text-xs sm:text-sm text-black">
                        {item.institution}
                      </div>
                      {dateStr && (
                        <div className="text-[11px] text-gray-600 shrink-0 font-medium ml-2">
                          {dateStr}
                        </div>
                      )}
                    </div>

                    {degreeMajorAndGpa && (
                      <p className="text-xs text-gray-800 italic font-sans">
                        {degreeMajorAndGpa}
                      </p>
                    )}

                    {/* Thesis Title and Defense Grade displayed together */}
                    {thesisAndGrade && (
                      <p className="text-[11px] text-gray-700 italic font-sans">
                        {thesisAndGrade}
                      </p>
                    )}

                    {item.description && (
                      <p className="text-xs text-gray-800 font-sans pt-0.5 whitespace-pre-line text-justify">
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
            <h2 className="text-xs font-bold uppercase tracking-wider text-black border-b border-gray-400 pb-0.5 mb-1.5 font-serif">
              {labels.sections.skills}
            </h2>
            <p className="text-xs text-gray-800 font-sans leading-relaxed">
              {validSkills.map((s, idx) => (
                <span key={s.id}>
                  <span className="font-medium text-black">{s.name}</span>
                  {idx < validSkills.length - 1 && "  •  "}
                </span>
              ))}
            </p>
          </section>
        );

      case "projects":
        if (validProjects.length === 0) return null;
        return (
          <section key="projects" className="mb-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-black border-b border-gray-400 pb-0.5 mb-2 font-serif">
              {labels.sections.projects}
            </h2>
            <div className="space-y-2.5">
              {validProjects.map((project) => (
                <div key={project.id} className="space-y-0.5">
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between font-sans">
                    <div className="font-bold text-xs sm:text-sm text-black">
                      {project.name}
                      {project.technologies && (
                        <span className="font-normal text-gray-600 text-xs">
                          {" "}
                          [{project.technologies}]
                        </span>
                      )}
                    </div>
                    {project.url && (
                      <a
                        href={normalizeUrl(project.url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-gray-800 hover:text-black font-sans shrink-0 ml-2"
                      >
                        {cleanDisplayUrl(project.url)}
                      </a>
                    )}
                  </div>
                  {project.description && (
                    <p className="text-xs text-gray-800 font-sans leading-relaxed pt-0.5 whitespace-pre-line text-justify">
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
            <h2 className="text-xs font-bold uppercase tracking-wider text-black border-b border-gray-400 pb-0.5 mb-2 font-serif">
              {labels.sections.certifications}
            </h2>
            <div className="space-y-2.5">
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
                  <div key={cert.id} className="space-y-0.5 font-sans">
                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                      <div className="font-bold text-xs text-black">
                        <span>{cert.name}</span>
                        {cert.issuingOrganization && (
                          <span className="font-normal italic text-gray-800">
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
                            className="inline-flex items-center ml-1 text-gray-600 hover:text-black transition-colors align-baseline"
                          >
                            <ExternalLink className="w-3.5 h-3.5 inline" />
                          </a>
                        )}
                      </div>
                      {certDates && (
                        <div className="text-[11px] text-gray-600 shrink-0 font-medium ml-2">
                          {certDates}
                        </div>
                      )}
                    </div>

                    {cert.credentialId && (
                      <div className="text-[11px] text-gray-700">
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
      className="cv-document bg-white text-[#111827] font-serif leading-relaxed box-border mx-auto"
    >
      {/* Centered Traditional Resume Header */}
      <header className="text-center border-b-2 border-black pb-3.5 mb-4">
        <h1 className="text-2xl sm:text-3xl font-bold uppercase tracking-widest text-black">
          {personalInfo.fullName || "YOUR NAME"}
        </h1>

        {personalInfo.jobTitle && (
          <p className="text-sm font-semibold tracking-wide italic text-gray-800 mt-1">
            {personalInfo.jobTitle}
          </p>
        )}

        {/* Contact Links Strip */}
        <div className="mt-2 text-xs text-gray-700 font-sans flex flex-wrap justify-center items-center gap-x-3 gap-y-1">
          {personalInfo.email && (
            <a
              href={`mailto:${personalInfo.email}`}
              className="text-gray-700 hover:text-black transition-colors"
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
                className="text-gray-700 hover:text-black transition-colors"
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
                className="text-gray-700 hover:text-black transition-colors"
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
                className="text-gray-700 hover:text-black transition-colors"
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
