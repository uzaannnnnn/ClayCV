"use client";

import React, { useState } from "react";
import { useCVStore } from "@/store/cv-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AIPrivacyConsentBanner } from "./AIPrivacyConsentBanner";
import { callCareerAI } from "@/lib/ai/client-api";
import { CareerOperation } from "@/lib/ai/types/ai.types";
import { CareerResponseData } from "@/lib/ai/schemas/career.schema";
import { downloadCoverLetterPdf } from "@/lib/pdf/download";
import {
  Briefcase,
  Mail,
  HelpCircle,
  MessageSquare,
  UserCheck,
  Compass,
  Sparkles,
  Download,
  Copy,
  Check,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const CAREER_TABS: Array<{
  id: CareerOperation;
  label: string;
  icon: React.ElementType;
  loadingText: string;
}> = [
  {
    id: "cover_letter",
    label: "Cover Letter",
    icon: Mail,
    loadingText: "Writing your tailored cover letter...",
  },
  {
    id: "interview_questions",
    label: "Interview Qs",
    icon: HelpCircle,
    loadingText: "Generating role-specific interview questions...",
  },
  {
    id: "interview_answer",
    label: "STAR Answer Coach",
    icon: MessageSquare,
    loadingText: "Structuring your STAR interview answer...",
  },
  {
    id: "linkedin_summary",
    label: "LinkedIn About",
    icon: UserCheck,
    loadingText: "Generating your LinkedIn Headline & About sections...",
  },
  {
    id: "job_recommendations",
    label: "Role Recommendations",
    icon: Compass,
    loadingText: "Analyzing your CV for relevant career opportunities...",
  },
];

export function CareerAssistantWorkspace() {
  const { cvData, aiConsentAccepted } = useCVStore();

  const [activeTab, setActiveTab] = useState<CareerOperation>("cover_letter");
  const [targetJobTitle, setTargetJobTitle] = useState(
    cvData.personalInfo.jobTitle || ""
  );
  const [companyName, setCompanyName] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [interviewQuestion, setInterviewQuestion] = useState("");
  const [userDraftOrNotes, setUserDraftOrNotes] = useState("");
  const [editableCoverLetter, setEditableCoverLetter] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CareerResponseData | null>(null);

  const handleCopy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1800);
    } catch {
      // ignore
    }
  };

  const handleExecute = async () => {
    if (!aiConsentAccepted) {
      setError(
        "Please accept the Google Gemini Privacy Consent above before using the Career Assistant."
      );
      return;
    }

    if (activeTab === "interview_answer" && !interviewQuestion.trim()) {
      setError("Please enter or select an interview question to practice.");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const res = await callCareerAI({
        consentAccepted: true,
        operation: activeTab,
        language: cvData.language,
        cvData: cvData as unknown as Record<string, unknown>,
        targetJobTitle: targetJobTitle.trim(),
        companyName: companyName.trim(),
        jobDescription: jobDescription.trim(),
        interviewQuestion: interviewQuestion.trim(),
        userDraftOrNotes: userDraftOrNotes.trim(),
      });
      setResult(res.data);
      if (activeTab === "cover_letter") {
        setEditableCoverLetter(res.data.content);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to run Career Assistant operation."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadCoverLetter = async () => {
    if (!editableCoverLetter.trim()) return;
    try {
      setIsDownloadingPdf(true);
      await downloadCoverLetterPdf({
        fullName: cvData.personalInfo.fullName,
        email: cvData.personalInfo.email,
        phone: cvData.personalInfo.phone,
        location: cvData.personalInfo.location,
        jobTitle: targetJobTitle.trim(),
        companyName: companyName.trim(),
        content: editableCoverLetter,
      });
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const activeTabInfo =
    CAREER_TABS.find((t) => t.id === activeTab) || CAREER_TABS[0];

  return (
    <div className="space-y-5 pb-12">
      <AIPrivacyConsentBanner compact />

      {/* Sub-Navigation */}
      <div className="clay-card p-3 sm:p-4 bg-[#FAF8F5]">
        <div className="flex items-center justify-between mb-2.5 px-1">
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-[#8B7CF6]" />
            <h2 className="text-sm font-bold text-[#292735]">
              AI Career Assistant
            </h2>
          </div>
          <span className="text-[11px] font-semibold text-[#777482]">
            Language:{" "}
            <strong className="text-[#8B7CF6]">
              {cvData.language === "id" ? "Bahasa Indonesia" : "English"}
            </strong>
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {CAREER_TABS.map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  setResult(null);
                  setError(null);
                }}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded-[12px] text-xs font-bold transition-all cursor-pointer",
                  isSelected
                    ? "bg-[#8B7CF6] text-white shadow-sm"
                    : "bg-white/80 text-[#777482] hover:text-[#292735] hover:bg-white"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Input Card */}
      <div className="clay-card p-5 sm:p-6 space-y-4">
        {(activeTab === "cover_letter" ||
          activeTab === "interview_questions") && (
          <>
            <div>
              <h3 className="text-base font-bold text-[#292735]">
                {activeTab === "cover_letter"
                  ? "Tailored Cover Letter Generator"
                  : "Role & CV Interview Question Generator"}
              </h3>
              <p className="text-xs text-[#777482] mt-0.5">
                {activeTab === "cover_letter"
                  ? "Generates an editable, truthful cover letter aligned with your CV and target role, ready to copy or export as an A4 PDF."
                  : "Generates General, Behavioral, Technical, and Experience-Based questions tailored to your CV."}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Input
                label="Target Job Title"
                placeholder="e.g. Senior Frontend Engineer"
                value={targetJobTitle}
                onChange={(e) => setTargetJobTitle(e.target.value)}
              />
              <Input
                label="Company Name"
                placeholder="e.g. Stripe, GoTo, Traveloka"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>

            <Textarea
              label="Target Job Description (Recommended)"
              rows={4}
              placeholder="Paste the job description to tailor your cover letter or interview questions..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
          </>
        )}

        {activeTab === "interview_answer" && (
          <>
            <div>
              <h3 className="text-base font-bold text-[#292735]">
                STAR Interview Answer Coach
              </h3>
              <p className="text-xs text-[#777482] mt-0.5">
                Structures your real CV experience into Situation, Task, Action,
                and Result (STAR) format without inventing personal stories.
              </p>
            </div>

            <Input
              label="Interview Question *"
              placeholder="e.g. Tell me about a time you improved system scalability or resolved a difficult technical challenge."
              value={interviewQuestion}
              onChange={(e) => setInterviewQuestion(e.target.value)}
            />

            <Textarea
              label="Your Key Notes / Specific Experience to Highlight (Optional)"
              rows={3}
              placeholder="Mention which role or project you want to reference and any real outcomes..."
              value={userDraftOrNotes}
              onChange={(e) => setUserDraftOrNotes(e.target.value)}
            />
          </>
        )}

        {activeTab === "linkedin_summary" && (
          <>
            <div>
              <h3 className="text-base font-bold text-[#292735]">
                LinkedIn Headline & About Section Generator
              </h3>
              <p className="text-xs text-[#777482] mt-0.5">
                Creates 3 professional LinkedIn About & Headline variations in{" "}
                {cvData.language === "id" ? "Bahasa Indonesia" : "English"}{" "}
                using your actual CV background.
              </p>
            </div>

            <Input
              label="Target Positioning / Headline Focus (Optional)"
              placeholder="e.g. Full-Stack Engineering & Cloud Architecture"
              value={targetJobTitle}
              onChange={(e) => setTargetJobTitle(e.target.value)}
            />
          </>
        )}

        {activeTab === "job_recommendations" && (
          <div>
            <h3 className="text-base font-bold text-[#292735]">
              Career Path & Job Position Recommendations
            </h3>
            <p className="text-xs text-[#777482] mt-0.5">
              Analyzes your skills, education, work experience, and projects to
              recommend matching job titles, explain why they fit, and highlight
              growth skills.
            </p>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <span className="text-[11px] text-[#777482]">
            {!aiConsentAccepted ? (
              <span className="text-[#6C5BD8] font-medium">
                Grant privacy consent above to enable AI Career Assistant generation.
              </span>
            ) : (
              `Grounded strictly in your active CV (${cvData.title})`
            )}
          </span>
          <Button
            type="button"
            variant="primary"
            size="md"
            disabled={!aiConsentAccepted || isLoading}
            isLoading={isLoading}
            onClick={handleExecute}
          >
            <Sparkles className="w-4 h-4 mr-1.5" />
            <span>
              {isLoading ? activeTabInfo.loadingText : "Generate with Gemini"}
            </span>
          </Button>
        </div>
      </div>

      {error && (
        <div className="clay-card-sm p-4 bg-red-50/90 border border-red-200 text-red-700 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={!aiConsentAccepted || isLoading}
            onClick={handleExecute}
          >
            Retry
          </Button>
        </div>
      )}

      {/* Results Area */}
      {result && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Cover Letter Output */}
          {result.operation === "cover_letter" && (
            <div className="clay-card p-5 sm:p-6 bg-white space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#8B7CF6]">
                    Editable Cover Letter
                  </span>
                  <p className="text-[11px] text-[#777482]">
                    Review and customize before copying or downloading as A4
                    PDF.
                  </p>
                </div>

                <div className="flex items-center flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      handleCopy(editableCoverLetter, "cover-letter")
                    }
                  >
                    {copiedKey === "cover-letter" ? (
                      <>
                        <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 mr-1" />
                        <span>Copy</span>
                      </>
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleExecute}
                    disabled={!aiConsentAccepted || isLoading}
                  >
                    <RefreshCw className="w-3.5 h-3.5 mr-1" />
                    <span>Regenerate</span>
                  </Button>

                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    isLoading={isDownloadingPdf}
                    onClick={handleDownloadCoverLetter}
                  >
                    <Download className="w-3.5 h-3.5 mr-1" />
                    <span>Download PDF</span>
                  </Button>
                </div>
              </div>

              <Textarea
                label="Cover Letter Document Content"
                rows={14}
                value={editableCoverLetter}
                onChange={(e) => setEditableCoverLetter(e.target.value)}
              />
            </div>
          )}

          {/* Interview Questions Output */}
          {result.operation === "interview_questions" &&
            result.interview_questions && (
              <div className="space-y-3">
                {result.interview_questions.map((q, idx) => (
                  <div
                    key={idx}
                    className="clay-card-sm p-4 sm:p-5 bg-white space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="clay-badge-purple px-2.5 py-0.5 text-[11px] font-bold">
                        {q.category} Question
                      </span>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setInterviewQuestion(q.question);
                          setActiveTab("interview_answer");
                        }}
                      >
                        Practice in STAR Coach
                      </Button>
                    </div>
                    <p className="text-sm font-bold text-[#292735]">
                      Q{idx + 1}: {q.question}
                    </p>
                    <p className="text-xs text-[#777482]">
                      <strong>Why interviewers ask this:</strong> {q.why_asked}
                    </p>
                    <p className="text-xs text-[#292735] bg-[#FAF8F5] p-2.5 rounded-[10px]">
                      <strong>Preparation Tip:</strong> {q.preparation_tip}
                    </p>
                  </div>
                ))}
              </div>
            )}

          {/* STAR Answer Output */}
          {result.operation === "interview_answer" && result.star_answer && (
            <div className="clay-card p-5 sm:p-6 bg-white space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#8B7CF6]">
                  Structured STAR Answer
                </span>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    handleCopy(
                      result.star_answer?.full_answer || "",
                      "star-full"
                    )
                  }
                >
                  {copiedKey === "star-full" ? "Copied" : "Copy Answer"}
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-[14px] bg-[#FAF8F5]">
                  <span className="font-bold text-[#8B7CF6] block mb-1">
                    S — Situation
                  </span>
                  <p className="text-[#292735]">
                    {result.star_answer.situation}
                  </p>
                </div>
                <div className="p-3.5 rounded-[14px] bg-[#FAF8F5]">
                  <span className="font-bold text-[#8B7CF6] block mb-1">
                    T — Task
                  </span>
                  <p className="text-[#292735]">{result.star_answer.task}</p>
                </div>
                <div className="p-3.5 rounded-[14px] bg-[#FAF8F5]">
                  <span className="font-bold text-[#8B7CF6] block mb-1">
                    A — Action
                  </span>
                  <p className="text-[#292735]">{result.star_answer.action}</p>
                </div>
                <div className="p-3.5 rounded-[14px] bg-[#FAF8F5]">
                  <span className="font-bold text-[#8B7CF6] block mb-1">
                    R — Result
                  </span>
                  <p className="text-[#292735]">{result.star_answer.result}</p>
                </div>
              </div>

              <div className="p-4 rounded-[14px] bg-[#EFEAFF]/40 border border-[#8B7CF6]/25 text-xs sm:text-sm text-[#292735] whitespace-pre-line">
                {result.star_answer.full_answer}
              </div>

              {result.star_answer.missing_context_questions.length > 0 && (
                <div className="p-3.5 rounded-[12px] bg-amber-50/70 border border-amber-200 text-xs space-y-1">
                  <p className="font-bold text-amber-900">
                    Details You Can Add to Personalize Further:
                  </p>
                  <ul className="list-disc list-inside text-amber-800 space-y-0.5">
                    {result.star_answer.missing_context_questions.map(
                      (mq, i) => (
                        <li key={i}>{mq}</li>
                      )
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* LinkedIn Variants */}
          {result.operation === "linkedin_summary" &&
            result.linkedin_variants && (
              <div className="space-y-3.5">
                {result.linkedin_variants.map((variant, idx) => (
                  <div
                    key={idx}
                    className="clay-card-sm p-4 sm:p-5 bg-white space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#8B7CF6]">
                        {variant.title}
                      </span>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() =>
                          handleCopy(
                            `${variant.headline}\n\n${variant.about}`,
                            `li-${idx}`
                          )
                        }
                      >
                        {copiedKey === `li-${idx}`
                          ? "Copied"
                          : "Copy Headline & About"}
                      </Button>
                    </div>
                    <div className="p-3 rounded-[12px] bg-[#FAF8F5] text-xs">
                      <span className="text-[10px] font-bold uppercase text-[#777482] block">
                        Suggested Headline
                      </span>
                      <p className="font-semibold text-[#292735] mt-0.5">
                        {variant.headline}
                      </p>
                    </div>
                    <div className="p-3.5 rounded-[12px] bg-[#FAF8F5] text-xs whitespace-pre-line text-[#292735] leading-relaxed">
                      {variant.about}
                    </div>
                  </div>
                ))}
              </div>
            )}

          {/* Job Recommendations */}
          {result.operation === "job_recommendations" &&
            result.job_recommendations && (
              <div className="space-y-3.5">
                {result.job_recommendations.map((job, idx) => (
                  <div
                    key={idx}
                    className="clay-card-sm p-4 sm:p-5 bg-white space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-sm font-bold text-[#292735]">
                        {job.role_title}
                      </h4>
                      <span
                        className={cn(
                          "px-2.5 py-0.5 rounded-full text-[11px] font-bold",
                          job.fit_level === "Strong Fit"
                            ? "bg-emerald-50 text-emerald-700"
                            : job.fit_level === "Moderate Fit"
                            ? "bg-[#EFEAFF] text-[#6C5BD8]"
                            : "bg-amber-50 text-amber-700"
                        )}
                      >
                        {job.fit_level}
                      </span>
                    </div>
                    <p className="text-xs text-[#777482]">{job.reasoning}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-[12px] bg-[#FAF8F5]">
                        <span className="font-bold text-emerald-700 block mb-1">
                          Matching Qualifications in Your CV
                        </span>
                        <ul className="list-disc list-inside text-[#292735] space-y-0.5">
                          {job.matching_qualifications.map((q, i) => (
                            <li key={i}>{q}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="p-3 rounded-[12px] bg-[#FAF8F5]">
                        <span className="font-bold text-amber-700 block mb-1">
                          Skills to Highlight or Develop
                        </span>
                        <ul className="list-disc list-inside text-[#292735] space-y-0.5">
                          {job.skills_to_develop.map((s, i) => (
                            <li key={i}>{s}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
        </div>
      )}
    </div>
  );
}
