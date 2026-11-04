import React from "react";
import { CVData } from "@/types/cv";

export interface TemplateProps {
  data: CVData;
}

export function ClassicTemplate({ data }: TemplateProps) {
  const { personalInfo, education, experience, skills, projects } = data;

  const validEducation = education.filter(
    (e) => e.institution.trim() || e.degree.trim() || e.fieldOfStudy.trim()
  );
  const validExperience = experience.filter(
    (e) => e.company.trim() || e.position.trim()
  );
  const validSkills = skills.filter((s) => s.name.trim());
  const validProjects = projects.filter((p) => p.name.trim());

  const contactItems: string[] = [];
  if (personalInfo.email) contactItems.push(personalInfo.email);
  if (personalInfo.phone) contactItems.push(personalInfo.phone);
  if (personalInfo.location) contactItems.push(personalInfo.location);
  if (personalInfo.website)
    contactItems.push(personalInfo.website.replace(/^https?:\/\//, ""));
  if (personalInfo.linkedin)
    contactItems.push(
      personalInfo.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, "linkedin.com/in/")
    );
  if (personalInfo.github)
    contactItems.push(
      personalInfo.github.replace(/^https?:\/\/(www\.)?github\.com\//, "github.com/")
    );

  return (
    <div className="w-full bg-white text-[#111827] p-8 sm:p-10 font-serif leading-relaxed">
      {/* Centered Traditional Header */}
      <header className="text-center border-b-2 border-black pb-4 mb-5">
        <h1 className="text-2xl sm:text-3xl font-bold uppercase tracking-widest text-black">
          {personalInfo.fullName || "YOUR NAME"}
        </h1>

        {personalInfo.jobTitle && (
          <p className="text-sm font-semibold tracking-wide italic text-gray-800 mt-1">
            {personalInfo.jobTitle}
          </p>
        )}

        {contactItems.length > 0 && (
          <p className="text-xs text-gray-700 mt-2 tracking-normal font-sans">
            {contactItems.join("  |  ")}
          </p>
        )}
      </header>

      {/* Summary */}
      {personalInfo.summary && (
        <section className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-black border-b border-gray-400 pb-0.5 mb-2 font-serif">
            Professional Summary
          </h2>
          <p className="text-xs sm:text-sm text-gray-800 font-sans leading-relaxed whitespace-pre-line text-justify">
            {personalInfo.summary}
          </p>
        </section>
      )}

      {/* Experience */}
      {validExperience.length > 0 && (
        <section className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-black border-b border-gray-400 pb-0.5 mb-2 font-serif">
            Professional Experience
          </h2>
          <div className="space-y-4">
            {validExperience.map((item) => (
              <div key={item.id} className="space-y-1">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between font-sans">
                  <div className="font-bold text-xs sm:text-sm text-black">
                    {item.company}
                    {item.position && (
                      <span className="font-normal italic text-gray-800">
                        {" "}
                        — {item.position}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-gray-600 font-medium shrink-0">
                    {item.startDate && (
                      <span>
                        {item.startDate} –{" "}
                        {item.current ? "Present" : item.endDate || "Present"}
                      </span>
                    )}
                  </div>
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
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {validEducation.length > 0 && (
        <section className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-black border-b border-gray-400 pb-0.5 mb-2 font-serif">
            Education
          </h2>
          <div className="space-y-3">
            {validEducation.map((item) => (
              <div key={item.id} className="space-y-0.5">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between font-sans">
                  <div className="font-bold text-xs sm:text-sm text-black">
                    {item.institution}
                  </div>
                  <div className="text-[11px] text-gray-600 shrink-0 font-medium">
                    {item.startDate && (
                      <span>
                        {item.startDate} – {item.endDate || "Present"}
                      </span>
                    )}
                  </div>
                </div>
                {(item.degree || item.fieldOfStudy) && (
                  <p className="text-xs text-gray-800 italic font-sans">
                    {item.degree}
                    {item.degree && item.fieldOfStudy ? " in " : ""}
                    {item.fieldOfStudy}
                  </p>
                )}
                {item.description && (
                  <p className="text-xs text-gray-800 font-sans pt-0.5 whitespace-pre-line text-justify">
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
          <h2 className="text-xs font-bold uppercase tracking-wider text-black border-b border-gray-400 pb-0.5 mb-2 font-serif">
            Skills & Qualifications
          </h2>
          <p className="text-xs text-gray-800 font-sans leading-relaxed">
            {validSkills.map((s, idx) => (
              <span key={s.id}>
                <span className="font-medium text-black">{s.name}</span>
                {s.level && (
                  <span className="text-gray-500 text-[11px]"> ({s.level})</span>
                )}
                {idx < validSkills.length - 1 && " • "}
              </span>
            ))}
          </p>
        </section>
      )}

      {/* Projects */}
      {validProjects.length > 0 && (
        <section className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-black border-b border-gray-400 pb-0.5 mb-2 font-serif">
            Notable Projects
          </h2>
          <div className="space-y-3">
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
                    <span className="text-[11px] text-gray-700 italic font-sans">
                      {project.url.replace(/^https?:\/\//, "")}
                    </span>
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
      )}
    </div>
  );
}
