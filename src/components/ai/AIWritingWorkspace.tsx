"use client";

import React, { useState } from "react";
import { useCVStore } from "@/store/cv-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AIPrivacyConsentBanner } from "./AIPrivacyConsentBanner";
import { AIResultCard } from "./AIResultCard";
import { callWritingAI } from "@/lib/ai/client-api";
import {
  WritingOperation,
  WritingStyle,
} from "@/lib/ai/types/ai.types";
import { WritingResponseData } from "@/lib/ai/schemas/writing.schema";
import {
  Sparkles,
  FileText,
  Briefcase,
  Trophy,
  FolderGit2,
  Wrench,
  SpellCheck,
  Languages,
  AlertCircle,
  Plus,
  Check,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";

const WRITING_TABS: Array<{
  id: WritingOperation;
  label: string;
  icon: React.ElementType;
  loadingText: string;
}> = [
  {
    id: "professional_summary",
    label: "Summary",
    icon: FileText,
    loadingText: "Generating your professional summary...",
  },
  {
    id: "experience_improve",
    label: "Experience",
    icon: Briefcase,
    loadingText: "Improving your work experience description...",
  },
  {
    id: "achievement_generator",
    label: "Achievements",
    icon: Trophy,
    loadingText: "Crafting truthful achievement statements...",
  },
  {
    id: "project_description",
    label: "Projects",
    icon: FolderGit2,
    loadingText: "Generating project descriptions...",
  },
  {
    id: "skills_suggestions",
    label: "Skills",
    icon: Wrench,
    loadingText: "Analyzing your CV to suggest relevant skills...",
  },
  {
    id: "grammar_tone",
    label: "Grammar & Tone",
    icon: SpellCheck,
    loadingText: "Refining grammar, clarity, and professional tone...",
  },
  {
    id: "translation",
    label: "Translate",
    icon: Languages,
    loadingText: "Translating CV content while preserving technical terms...",
  },
];

export function AIWritingWorkspace() {
  const {
    cvData,
    aiConsentAccepted,
    openConsentModal,
    updatePersonalInfo,
    updateExperience,
    updateProject,
    addSkill,
  } = useCVStore();

  const [activeTab, setActiveTab] = useState<WritingOperation>(
    "professional_summary"
  );
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const isLoading = activeAction !== null;
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<WritingResponseData | null>(null);

  // Summary inputs
  const [targetPosition, setTargetPosition] = useState(
    cvData.personalInfo.jobTitle || ""
  );
  const [yearsOfExp, setYearsOfExp] = useState("");
  const [careerObjectives, setCareerObjectives] = useState("");

  // Experience inputs
  const [selectedExpId, setSelectedExpId] = useState<string>(
    cvData.experience[0]?.id || ""
  );
  const [expStyle, setExpStyle] = useState<WritingStyle>("professional");
  const [expInstructions, setExpInstructions] = useState("");

  // Achievement inputs
  const [achRole, setAchRole] = useState(cvData.personalInfo.jobTitle || "");
  const [achTask, setAchTask] = useState("");
  const [achProblem, setAchProblem] = useState("");
  const [achTech, setAchTech] = useState("");
  const [achContribution, setAchContribution] = useState("");
  const [achOutcome, setAchOutcome] = useState("");

  // Project inputs
  const [selectedProjId, setSelectedProjId] = useState<string>(
    cvData.projects[0]?.id || ""
  );
  const [projObjective, setProjObjective] = useState("");
  const [projFeatures, setProjFeatures] = useState("");
  const [projResponsibilities, setProjResponsibilities] = useState("");
  const [projImplementation, setProjImplementation] = useState("");

  // Grammar & Translation inputs
  const [customTextSource, setCustomTextSource] = useState<string>("summary");
  const [customText, setCustomText] = useState<string>(
    cvData.personalInfo.summary || ""
  );
  const [grammarInstructions, setGrammarInstructions] = useState("");
  const [translationTargetLang, setTranslationTargetLang] = useState<
    "en" | "id"
  >(cvData.language === "en" ? "id" : "en");

  const activeExpItem =
    cvData.experience.find((e) => e.id === selectedExpId) ||
    cvData.experience[0];
  const activeProjItem =
    cvData.projects.find((p) => p.id === selectedProjId) || cvData.projects[0];

  const handleTabChange = (tab: WritingOperation) => {
    setActiveTab(tab);
    setResponse(null);
    setError(null);
  };

  const handleLoadSourceText = (sourceKey: string) => {
    setCustomTextSource(sourceKey);
    if (sourceKey === "summary") {
      setCustomText(cvData.personalInfo.summary || "");
    } else if (sourceKey.startsWith("exp:")) {
      const id = sourceKey.replace("exp:", "");
      const found = cvData.experience.find((e) => e.id === id);
      setCustomText(found?.description || "");
    } else if (sourceKey.startsWith("proj:")) {
      const id = sourceKey.replace("proj:", "");
      const found = cvData.projects.find((p) => p.id === id);
      setCustomText(found?.description || "");
    }
  };

  const handleExecute = async (source: string = "generate") => {
    if (!aiConsentAccepted) {
      openConsentModal();
      return;
    }

    if (source === "generate") {
      setError(null);
    }
    setActiveAction(source);

    try {
      if (activeTab === "professional_summary") {
        const res = await callWritingAI({
          consentAccepted: true,
          operation: "professional_summary",
          language: cvData.language,
          summaryContext: {
            targetPosition:
              targetPosition.trim() || cvData.personalInfo.jobTitle,
            yearsOfExperience: yearsOfExp.trim(),
            careerObjectives: careerObjectives.trim(),
            currentSummary: cvData.personalInfo.summary,
            experienceHighlights: cvData.experience.map(
              (e) => `${e.position} at ${e.company}: ${e.description}`
            ),
            educationHighlights: cvData.education.map(
              (ed) => `${ed.degree} in ${ed.fieldOfStudy} at ${ed.institution}`
            ),
            skills: cvData.skills.map((s) => s.name),
            projects: cvData.projects.map(
              (p) => `${p.name} (${p.technologies}): ${p.description}`
            ),
          },
        });
        setResponse(res.data);
      } else if (activeTab === "experience_improve") {
        if (!activeExpItem) {
          throw new Error(
            "Please add at least one Work Experience entry in the CV Builder first."
          );
        }
        if (!activeExpItem.description.trim() && !expInstructions.trim()) {
          throw new Error(
            "Please enter a draft description or instructions for this role."
          );
        }
        const res = await callWritingAI({
          consentAccepted: true,
          operation: "experience_improve",
          language: cvData.language,
          style: expStyle,
          experienceContext: {
            company: activeExpItem.company,
            position: activeExpItem.position,
            employmentType: activeExpItem.employmentType,
            description:
              activeExpItem.description.trim() || expInstructions.trim(),
            userInstructions: expInstructions.trim(),
          },
        });
        setResponse(res.data);
      } else if (activeTab === "achievement_generator") {
        if (!achTask.trim()) {
          throw new Error(
            "Please describe the task performed so Gemini can formulate accurate achievements."
          );
        }
        const res = await callWritingAI({
          consentAccepted: true,
          operation: "achievement_generator",
          language: cvData.language,
          achievementContext: {
            roleOrTitle: achRole.trim(),
            taskPerformed: achTask.trim(),
            problemSolved: achProblem.trim(),
            technologyUsed: achTech.trim(),
            userContribution: achContribution.trim(),
            actualOutcome: achOutcome.trim(),
          },
        });
        setResponse(res.data);
      } else if (activeTab === "project_description") {
        const pName = activeProjItem?.name || "Project";
        const res = await callWritingAI({
          consentAccepted: true,
          operation: "project_description",
          language: cvData.language,
          projectContext: {
            name: pName,
            technologies: activeProjItem?.technologies || "",
            currentDescription: activeProjItem?.description || "",
            objective: projObjective.trim(),
            mainFeatures: projFeatures.trim(),
            userResponsibilities: projResponsibilities.trim(),
            technicalImplementation: projImplementation.trim(),
          },
        });
        setResponse(res.data);
      } else if (activeTab === "skills_suggestions") {
        const res = await callWritingAI({
          consentAccepted: true,
          operation: "skills_suggestions",
          language: cvData.language,
          skillsContext: {
            jobTitle: cvData.personalInfo.jobTitle,
            existingSkills: cvData.skills.map((s) => s.name),
            experienceSummaries: cvData.experience.map(
              (e) => `${e.position} at ${e.company}: ${e.description}`
            ),
            projectSummaries: cvData.projects.map(
              (p) => `${p.name} (${p.technologies}): ${p.description}`
            ),
            educationSummaries: cvData.education.map(
              (ed) => `${ed.degree} in ${ed.fieldOfStudy}`
            ),
          },
        });
        setResponse(res.data);
      } else if (activeTab === "grammar_tone") {
        if (!customText.trim()) {
          throw new Error("Please enter or select CV text to improve.");
        }
        const res = await callWritingAI({
          consentAccepted: true,
          operation: "grammar_tone",
          language: cvData.language,
          textContext: {
            text: customText.trim(),
            fieldLabel: customTextSource,
            instructions: grammarInstructions.trim(),
          },
        });
        setResponse(res.data);
      } else if (activeTab === "translation") {
        if (!customText.trim()) {
          throw new Error("Please enter or select CV text to translate.");
        }
        const res = await callWritingAI({
          consentAccepted: true,
          operation: "translation",
          language: cvData.language,
          targetLanguage: translationTargetLang,
          textContext: {
            text: customText.trim(),
            fieldLabel: customTextSource,
          },
        });
        setResponse(res.data);
      }
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate AI content."
      );
    } finally {
      setActiveAction(null);
    }
  };

  const applyResultToTarget = (content: string) => {
    if (activeTab === "professional_summary") {
      updatePersonalInfo({ summary: content });
    } else if (activeTab === "experience_improve" && activeExpItem) {
      updateExperience(activeExpItem.id, { description: content });
    } else if (activeTab === "achievement_generator" && activeExpItem) {
      const currentDesc = activeExpItem.description.trim();
      const combined = currentDesc ? `${currentDesc}\n${content}` : content;
      updateExperience(activeExpItem.id, { description: combined });
    } else if (activeTab === "project_description" && activeProjItem) {
      updateProject(activeProjItem.id, { description: content });
    } else if (activeTab === "grammar_tone" || activeTab === "translation") {
      if (customTextSource === "summary") {
        updatePersonalInfo({ summary: content });
      } else if (customTextSource.startsWith("exp:")) {
        const id = customTextSource.replace("exp:", "");
        updateExperience(id, { description: content });
      } else if (customTextSource.startsWith("proj:")) {
        const id = customTextSource.replace("proj:", "");
        updateProject(id, { description: content });
      }
      setCustomText(content);
    }
  };

  const getTargetFieldMeta = (): {
    fieldName: string;
    hasExisting: boolean;
  } => {
    if (activeTab === "professional_summary") {
      return {
        fieldName: "Professional Summary",
        hasExisting: Boolean(cvData.personalInfo.summary.trim()),
      };
    }
    if (activeTab === "experience_improve") {
      return {
        fieldName: activeExpItem
          ? `${activeExpItem.position || "Role"} Description`
          : "Experience Description",
        hasExisting: Boolean(activeExpItem?.description.trim()),
      };
    }
    if (activeTab === "achievement_generator") {
      return {
        fieldName: activeExpItem
          ? `${activeExpItem.position || "Role"} Bullet List`
          : "Experience Description",
        hasExisting: false, // Appends bullet
      };
    }
    if (activeTab === "project_description") {
      return {
        fieldName: activeProjItem
          ? `${activeProjItem.name || "Project"} Description`
          : "Project Description",
        hasExisting: Boolean(activeProjItem?.description.trim()),
      };
    }
    return {
      fieldName:
        customTextSource === "summary"
          ? "Professional Summary"
          : "Selected Section",
      hasExisting: Boolean(customText.trim()),
    };
  };

  const activeTabInfo =
    WRITING_TABS.find((t) => t.id === activeTab) || WRITING_TABS[0];
  const targetMeta = getTargetFieldMeta();

  return (
    <div className="space-y-5 pb-12">
      <AIPrivacyConsentBanner compact />

      {/* Sub-Navigation Pills */}
      <div className="clay-card p-3 sm:p-4 bg-[#FAF8F5]">
        <div className="flex items-center justify-between mb-2.5 px-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#6C5BD8]" />
            <h2 className="text-sm font-bold text-[#292735]">
              AI Writing Assistant
            </h2>
          </div>
          <span className="text-xs font-semibold text-[#595566]">
            CV Language:{" "}
            <strong className="text-[#6C5BD8]">
              {cvData.language === "id" ? "Bahasa Indonesia" : "English"}
            </strong>
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {WRITING_TABS.map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={cn(
                  "min-h-[38px] flex items-center gap-1.5 px-3 py-1.5 rounded-[12px] text-xs font-bold transition-all cursor-pointer",
                  isSelected
                    ? "bg-[#6C5BD8] text-white shadow-sm"
                    : "bg-white/85 text-[#595566] hover:text-[#292735] hover:bg-white"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Operation Form Card */}
      <div className="clay-card p-5 sm:p-6 space-y-4">
        {activeTab === "professional_summary" && (
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-bold text-[#292735]">
                Professional Summary Generator
              </h3>
              <p className="text-xs text-[#595566] mt-0.5">
                Generates Short, Professional, and Detailed summaries from your
                actual CV experience, education, and skills without inventing
                qualifications or years of experience.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Input
                label="Target or Current Job Title"
                placeholder="e.g. Senior Frontend Engineer"
                value={targetPosition}
                onChange={(e) => setTargetPosition(e.target.value)}
              />
              <Input
                label="Years of Experience (Optional)"
                placeholder="e.g. 5+ years"
                value={yearsOfExp}
                onChange={(e) => setYearsOfExp(e.target.value)}
              />
            </div>
            <Textarea
              label="Career Objectives / Specific Focus (Optional)"
              rows={2}
              placeholder="e.g. Focusing on distributed web architectures and design systems..."
              value={careerObjectives}
              onChange={(e) => setCareerObjectives(e.target.value)}
            />
          </div>
        )}

        {activeTab === "experience_improve" && (
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-bold text-[#292735]">
                Work Experience Writer
              </h3>
              <p className="text-xs text-[#595566] mt-0.5">
                Rewrites descriptions into strong action-verb bullet points in
                Professional, Concise, and Achievement-Oriented styles without
                fabricating metrics.
              </p>
            </div>

            {cvData.experience.length === 0 ? (
              <div className="p-4 rounded-[14px] bg-[#FAF8F5] border border-dashed border-[rgba(70,65,90,0.2)] text-xs text-[#595566]">
                No Work Experience entries found. Add a role in the CV Builder
                tab first, or load sample data to test.
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#595566] mb-1.5">
                      Select Work Experience Entry
                    </label>
                    <select
                      value={activeExpItem?.id || ""}
                      onChange={(e) => setSelectedExpId(e.target.value)}
                      className="clay-input w-full h-11 px-3.5 text-xs font-semibold text-[#292735]"
                    >
                      {cvData.experience.map((exp, idx) => (
                        <option key={exp.id} value={exp.id}>
                          #{idx + 1}: {exp.position || "Untitled"} at{" "}
                          {exp.company || "Company"}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#595566] mb-1.5">
                      Preferred Writing Style
                    </label>
                    <select
                      value={expStyle}
                      onChange={(e) =>
                        setExpStyle(e.target.value as WritingStyle)
                      }
                      className="clay-input w-full h-11 px-3.5 text-xs font-semibold text-[#292735]"
                    >
                      <option value="professional">1. Professional</option>
                      <option value="concise">2. Concise</option>
                      <option value="achievement_oriented">
                        3. Achievement-Oriented
                      </option>
                    </select>
                  </div>
                </div>

                {activeExpItem && (
                  <Textarea
                    label="Current Role Description (Editable)"
                    rows={3}
                    value={activeExpItem.description}
                    onChange={(e) =>
                      updateExperience(activeExpItem.id, {
                        description: e.target.value,
                      })
                    }
                  />
                )}

                <Input
                  label="Additional Instructions (Optional)"
                  placeholder="e.g. Emphasize TypeScript migration and cross-team collaboration"
                  value={expInstructions}
                  onChange={(e) => setExpInstructions(e.target.value)}
                />
              </>
            )}
          </div>
        )}

        {activeTab === "achievement_generator" && (
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-bold text-[#292735]">
                Achievement Statement Generator
              </h3>
              <p className="text-xs text-[#595566] mt-0.5">
                Describe what you worked on and any real outcomes. AI will
                craft clear achievement bullets without inventing results.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Input
                label="Role / Position"
                placeholder="e.g. Backend Engineer"
                value={achRole}
                onChange={(e) => setAchRole(e.target.value)}
              />
              <Input
                label="Technologies Used"
                placeholder="e.g. Node.js, PostgreSQL, Redis"
                value={achTech}
                onChange={(e) => setAchTech(e.target.value)}
              />
            </div>

            <Textarea
              label="Task Performed *"
              rows={2}
              placeholder="What did you build, lead, or improve?"
              value={achTask}
              onChange={(e) => setAchTask(e.target.value)}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Textarea
                label="Problem Solved (Optional)"
                rows={2}
                placeholder="What bottleneck or challenge existed?"
                value={achProblem}
                onChange={(e) => setAchProblem(e.target.value)}
              />
              <Textarea
                label="Actual Outcome / Measurable Result (Optional)"
                rows={2}
                placeholder="Only include real results you achieved"
                value={achOutcome}
                onChange={(e) => setAchOutcome(e.target.value)}
              />
            </div>

            <Input
              label="Your Specific Contribution (Optional)"
              placeholder="e.g. Designed schema and implemented caching layer"
              value={achContribution}
              onChange={(e) => setAchContribution(e.target.value)}
            />
          </div>
        )}

        {activeTab === "project_description" && (
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-bold text-[#292735]">
                Project Description Generator
              </h3>
              <p className="text-xs text-[#595566] mt-0.5">
                Generates Short, Detailed, and Bullet-Point project descriptions
                from your project details.
              </p>
            </div>

            {cvData.projects.length > 0 && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#595566] mb-1.5">
                  Target Project Entry
                </label>
                <select
                  value={activeProjItem?.id || ""}
                  onChange={(e) => setSelectedProjId(e.target.value)}
                  className="clay-input w-full h-11 px-3.5 text-xs font-semibold text-[#292735]"
                >
                  {cvData.projects.map((p, idx) => (
                    <option key={p.id} value={p.id}>
                      #{idx + 1}: {p.name || "Untitled Project"} (
                      {p.technologies || "No tech listed"})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Input
                label="Project Objective"
                placeholder="What problem does this project solve?"
                value={projObjective}
                onChange={(e) => setProjObjective(e.target.value)}
              />
              <Input
                label="Main Features"
                placeholder="e.g. Real-time sync, A4 PDF export"
                value={projFeatures}
                onChange={(e) => setProjFeatures(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Input
                label="Your Responsibilities"
                placeholder="e.g. Sole creator, frontend architecture"
                value={projResponsibilities}
                onChange={(e) => setProjResponsibilities(e.target.value)}
              />
              <Input
                label="Technical Implementation"
                placeholder="e.g. Next.js App Router, Zustand local persistence"
                value={projImplementation}
                onChange={(e) => setProjImplementation(e.target.value)}
              />
            </div>
          </div>
        )}

        {activeTab === "skills_suggestions" && (
          <div className="space-y-3">
            <div>
              <h3 className="text-base font-bold text-[#292735]">
                AI Skills Recommendations
              </h3>
              <p className="text-xs text-[#595566] mt-0.5">
                Analyzes your work experience, projects, and education to
                suggest relevant Technical Skills, Programming Languages,
                Frameworks, Tools, and Soft Skills. Suggestions are never added
                automatically.
              </p>
            </div>
            <div className="p-3.5 rounded-[14px] bg-[#FAF8F5] text-xs text-[#595566] flex items-center justify-between">
              <span>
                Currently listed skills in CV:{" "}
                <strong className="text-[#292735]">
                  {cvData.skills.length}
                </strong>
              </span>
              <span>
                Target Role:{" "}
                <strong className="text-[#292735]">
                  {cvData.personalInfo.jobTitle || "General"}
                </strong>
              </span>
            </div>
          </div>
        )}

        {(activeTab === "grammar_tone" || activeTab === "translation") && (
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-bold text-[#292735]">
                {activeTab === "grammar_tone"
                  ? "Grammar, Clarity & Professional Tone Improver"
                  : "Bilingual CV Translator (English ↔ Bahasa Indonesia)"}
              </h3>
              <p className="text-xs text-[#595566] mt-0.5">
                {activeTab === "grammar_tone"
                  ? "Fixes grammar, removes redundancy, and elevates tone while preserving your exact factual meaning."
                  : "Translates your selected CV section while preserving company names, proper nouns, programming languages, and technical terms."}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#595566] mb-1.5">
                  Select CV Field to Load
                </label>
                <select
                  value={customTextSource}
                  onChange={(e) => handleLoadSourceText(e.target.value)}
                  className="clay-input w-full h-11 px-3.5 text-xs font-semibold text-[#292735]"
                >
                  <option value="summary">Professional Summary</option>
                  {cvData.experience.map((e, i) => (
                    <option key={e.id} value={`exp:${e.id}`}>
                      Experience #{i + 1}: {e.position || e.company}
                    </option>
                  ))}
                  {cvData.projects.map((p, i) => (
                    <option key={p.id} value={`proj:${p.id}`}>
                      Project #{i + 1}: {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {activeTab === "translation" ? (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#595566] mb-1.5">
                    Target Translation Language
                  </label>
                  <select
                    value={translationTargetLang}
                    onChange={(e) =>
                      setTranslationTargetLang(e.target.value as "en" | "id")
                    }
                    className="clay-input w-full h-11 px-3.5 text-xs font-semibold text-[#292735]"
                  >
                    <option value="id">
                      English → Bahasa Indonesia (Formal CV)
                    </option>
                    <option value="en">
                      Bahasa Indonesia → English (Formal CV)
                    </option>
                  </select>
                </div>
              ) : (
                <Input
                  label="Focus Instructions (Optional)"
                  placeholder="e.g. Make more concise and action-oriented"
                  value={grammarInstructions}
                  onChange={(e) => setGrammarInstructions(e.target.value)}
                />
              )}
            </div>

            <Textarea
              label="Source Text"
              rows={4}
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Select a field above or paste your CV text here..."
            />
          </div>
        )}

        {/* Primary Action Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-gray-100">
          <span className="text-xs text-[#595566]">
            {!aiConsentAccepted ? (
              <span className="text-[#6C5BD8] font-medium">
                Please agree to the privacy notice above to use AI writing tools.
              </span>
            ) : isLoading ? (
              activeTabInfo.loadingText
            ) : (
              "Powered by Google Gemini AI"
            )}
          </span>
          <Button
            type="button"
            variant="primary"
            size="md"
            disabled={!aiConsentAccepted || isLoading}
            isLoading={activeAction === "generate"}
            onClick={() => handleExecute("generate")}
            className="w-full sm:w-auto shrink-0"
          >
            <Sparkles className="w-4 h-4" />
            <span>
              {activeAction === "generate"
                ? "Generating..."
                : "Generate with AI"}
            </span>
          </Button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div
          role="alert"
          className="clay-card-sm p-4 bg-red-50/90 border border-red-200 text-red-800 text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        >
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            isLoading={activeAction === "retry"}
            disabled={!aiConsentAccepted || isLoading}
            onClick={() => handleExecute("retry")}
            className="shrink-0 self-end sm:self-center"
          >
            <span>{activeAction === "retry" ? "Retrying..." : "Try Again"}</span>
          </Button>
        </div>
      )}

      {/* Results Display */}
      {response && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Missing Information / Warnings */}
          {(response.missing_information.length > 0 ||
            response.warnings.length > 0) && (
            <div className="clay-card-sm p-4 bg-[#FAF8F5] border border-[#8B7CF6]/25 space-y-2 text-xs">
              {response.missing_information.length > 0 && (
                <div>
                  <p className="font-bold text-[#292735] flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-[#6C5BD8]" />
                    <span>Helpful Context You Can Add:</span>
                  </p>
                  <ul className="list-disc list-inside text-[#595566] mt-1 space-y-0.5">
                    {response.missing_information.map((m, i) => (
                      <li key={i}>{m}</li>
                    ))}
                  </ul>
                </div>
              )}
              {response.warnings.map((w, i) => (
                <p key={i} className="text-[#595566] italic">
                  Note: {w}
                </p>
              ))}
            </div>
          )}

          {/* Categorized Skills Suggestions */}
          {response.operation === "skills_suggestions" &&
            response.suggested_skills &&
            response.suggested_skills.length > 0 && (
              <div className="space-y-3">
                {response.suggested_skills.map((group, idx) => (
                  <div
                    key={idx}
                    className="clay-card-sm p-4 sm:p-5 bg-white space-y-3"
                  >
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-[#6C5BD8]">
                        {group.category} (Suggestions)
                      </span>
                      <p className="text-xs text-[#595566] mt-0.5">
                        {group.reason}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {group.skills.map((skillName) => {
                        const alreadyInCV = cvData.skills.some(
                          (s) =>
                            s.name.toLowerCase() === skillName.toLowerCase()
                        );
                        return (
                          <button
                            key={skillName}
                            type="button"
                            disabled={alreadyInCV}
                            onClick={() => addSkill(skillName)}
                            className={cn(
                              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[12px] text-xs font-semibold border transition-all cursor-pointer",
                              alreadyInCV
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 cursor-default"
                                : "bg-[#FAF8F5] text-[#292735] border-[rgba(70,65,90,0.12)] hover:border-[#8B7CF6] hover:bg-[#EFEAFF]/40"
                            )}
                          >
                            {alreadyInCV ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span>{skillName} (Added)</span>
                              </>
                            ) : (
                              <>
                                <Plus className="w-3.5 h-3.5 text-[#8B7CF6]" />
                                <span>Add &ldquo;{skillName}&rdquo;</span>
                              </>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

          {/* Generated Content Cards */}
          {response.operation !== "skills_suggestions" &&
            response.results.map((item, idx) => (
              <AIResultCard
                key={idx}
                title={item.title}
                subtitle={
                  item.style ? `Style: ${item.style.replace("_", " ")}` : undefined
                }
                content={item.content}
                hasExistingContent={targetMeta.hasExisting}
                targetFieldName={targetMeta.fieldName}
                isLoading={isLoading}
                isRegenerating={activeAction === `regenerate-${idx}`}
                regenerateDisabled={!aiConsentAccepted}
                onApply={(text) => applyResultToTarget(text)}
                onRegenerate={() => handleExecute(`regenerate-${idx}`)}
                onCancel={() => setResponse(null)}
              />
            ))}
        </div>
      )}
    </div>
  );
}

