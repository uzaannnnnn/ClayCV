"use client";

import React, { useState } from "react";
import { useCVStore } from "@/store/cv-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog } from "@/components/ui/dialog";
import { AIPrivacyConsentBanner } from "./AIPrivacyConsentBanner";
import { callMatchingAI } from "@/lib/ai/client-api";
import {
  MatchingResponseData,
  matchRecommendationSchema,
} from "@/lib/ai/schemas/matching.schema";
import { z } from "zod";
import {
  Target,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRightCircle,
  AlertCircle,
  Info,
} from "lucide-react";

type MatchRec = z.infer<typeof matchRecommendationSchema>;

export function JobMatcherWorkspace() {
  const {
    cvData,
    aiConsentAccepted,
    openConsentModal,
    updatePersonalInfo,
    updateExperience,
    updateProject,
    addSkill,
  } = useCVStore();

  const [jobTitle, setJobTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [loadingSource, setLoadingSource] = useState<"analyze" | "retry" | null>(
    null
  );
  const isLoading = loadingSource !== null;
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MatchingResponseData | null>(null);
  const [dismissedRecs, setDismissedRecs] = useState<Set<string>>(new Set());
  const [appliedRecs, setAppliedRecs] = useState<Set<string>>(new Set());
  const [pendingRec, setPendingRec] = useState<MatchRec | null>(null);

  const handleAnalyzeMatch = async (
    source: "analyze" | "retry" = "analyze"
  ) => {
    if (!aiConsentAccepted) {
      openConsentModal();
      return;
    }
    if (jobDescription.trim().length < 20) {
      setError(
        "Please paste a complete job description (at least 20 characters)."
      );
      return;
    }

    if (source === "analyze") {
      setError(null);
    }
    setLoadingSource(source);
    setDismissedRecs(new Set());
    setAppliedRecs(new Set());

    try {
      const res = await callMatchingAI(
        {
          consentAccepted: true,
          jobTitle: jobTitle.trim(),
          companyName: companyName.trim(),
          jobDescription: jobDescription.trim(),
          cvData: cvData as unknown as Record<string, unknown>,
        },
        cvData.language
      );
      setResult(res.data);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not analyze the job match right now. Please try again."
      );
    } finally {
      setLoadingSource(null);
    }
  };

  const commitRecommendation = (rec: MatchRec) => {
    if (rec.target_section === "summary") {
      updatePersonalInfo({ summary: rec.suggested_content });
    } else if (rec.target_section === "experience") {
      const targetExp =
        cvData.experience.find((e) => e.id === rec.target_item_id) ||
        cvData.experience[0];
      if (targetExp) {
        updateExperience(targetExp.id, { description: rec.suggested_content });
      }
    } else if (rec.target_section === "projects") {
      const targetProj =
        cvData.projects.find((p) => p.id === rec.target_item_id) ||
        cvData.projects[0];
      if (targetProj) {
        updateProject(targetProj.id, { description: rec.suggested_content });
      }
    } else if (rec.target_section === "skills") {
      rec.suggested_content
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .forEach((s) => addSkill(s));
    }

    setAppliedRecs((prev) => new Set(prev).add(rec.id));
    setPendingRec(null);
  };

  return (
    <div className="space-y-5 pb-12">
      <AIPrivacyConsentBanner compact />

      <div className="clay-card p-5 sm:p-6 space-y-4">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div className="flex items-start gap-2.5 min-w-0 flex-1">
            <div className="w-9 h-9 rounded-[12px] bg-[#EFEAFF] text-[#6C5BD8] flex items-center justify-center shrink-0 mt-0.5">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#292735]">
                Job Description Matcher
              </h2>
              <p className="text-xs text-[#595566] leading-relaxed">
                Compare your active CV ({cvData.title}) against a target role
                for skills, keywords, and experience fit.
              </p>
            </div>
          </div>
          <span className="clay-badge-purple px-3 py-1 text-xs font-bold shrink-0">
            Active CV: {cvData.title}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <Input
            label="Target Job Title (Optional)"
            placeholder="e.g. Senior Full-Stack Engineer"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
          />
          <Input
            label="Company Name (Optional)"
            placeholder="e.g. Stripe, Atlassian"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />
        </div>

        <Textarea
          label="Job Description *"
          rows={5}
          placeholder="Paste the job requirements, responsibilities, and qualifications here..."
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-gray-100">
          <span className="text-xs text-[#595566]">
            {!aiConsentAccepted ? (
              <span className="text-[#6C5BD8] font-medium">
                Please agree to the privacy notice above to analyze job matches.
              </span>
            ) : (
              "Keyword match scan + AI role alignment"
            )}
          </span>
          <Button
            type="button"
            variant="primary"
            size="md"
            disabled={!aiConsentAccepted || isLoading}
            isLoading={loadingSource === "analyze"}
            onClick={() => handleAnalyzeMatch("analyze")}
            className="w-full sm:w-auto shrink-0"
          >
            <Sparkles className="w-4 h-4" />
            <span>
              {loadingSource === "analyze"
                ? "Analyzing Match..."
                : "Analyze Job Match"}
            </span>
          </Button>
        </div>
      </div>

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
            isLoading={loadingSource === "retry"}
            disabled={!aiConsentAccepted || isLoading}
            onClick={() => handleAnalyzeMatch("retry")}
            className="shrink-0 self-end sm:self-center"
          >
            <span>{loadingSource === "retry" ? "Retrying..." : "Try Again"}</span>
          </Button>
        </div>
      )}

      {result && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Score Overview Card */}
          <div className="clay-card p-5 sm:p-6 bg-white space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-[#6C5BD8]">
                  Estimated Job Alignment Score
                </span>
                <h3 className="text-sm text-[#292735] leading-relaxed">
                  {result.overall_assessment}
                </h3>
              </div>
              <div className="flex items-center gap-3 shrink-0 bg-[#FAF8F5] px-4 py-3 rounded-[18px] border border-[#8B7CF6]/25">
                <div className="text-3xl font-extrabold text-[#6C5BD8]">
                  {result.score_breakdown.overall_score}%
                </div>
                <div className="text-xs text-[#595566] leading-tight">
                  <div className="font-bold text-[#292735]">Match Score</div>
                  <div>Guidance only</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-[14px] bg-[#FAF8F5] flex flex-col justify-between gap-1">
                <span className="text-[#595566] font-medium">
                  Keyword Match (50%)
                </span>
                <strong className="text-lg text-[#292735]">
                  {result.score_breakdown.deterministic_keyword_score}%
                </strong>
              </div>
              <div className="p-3.5 rounded-[14px] bg-[#FAF8F5] flex flex-col justify-between gap-1">
                <span className="text-[#595566] font-medium">
                  Role Relevance (30%)
                </span>
                <strong className="text-lg text-[#292735]">
                  {result.score_breakdown.semantic_alignment_score}%
                </strong>
              </div>
              <div className="p-3.5 rounded-[14px] bg-[#FAF8F5] flex flex-col justify-between gap-1">
                <span className="text-[#595566] font-medium">
                  Experience & Education (20%)
                </span>
                <strong className="text-lg text-[#292735]">
                  {result.score_breakdown.experience_education_score}%
                </strong>
              </div>
            </div>

            <p className="text-xs text-[#595566] flex items-start gap-1.5 leading-relaxed">
              <Info className="w-4 h-4 text-[#6C5BD8] shrink-0 mt-0.5" />
              <span>{result.score_breakdown.methodology_note}</span>
            </p>
          </div>

          {/* Matched vs Missing Keywords */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="clay-card-sm p-4 sm:p-5 bg-white space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#227248] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  Matched Keywords ({result.matched_keywords.length})
                </span>
              </h4>
              {result.matched_keywords.length === 0 ? (
                <p className="text-xs text-[#595566]">
                  No direct keyword matches identified yet.
                </p>
              ) : (
                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                  {result.matched_keywords.map((mk, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-[12px] bg-[#FAF8F5] text-xs space-y-1 border border-emerald-200/60"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-[#292735]">
                          {mk.keyword}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E6F6ED] text-[#227248]">
                          {mk.presence === "explicit"
                            ? "In your CV"
                            : "Inferred"}
                        </span>
                      </div>
                      <p className="text-xs text-[#595566]">
                        <strong className="text-[#292735]">Evidence:</strong>{" "}
                        {mk.evidence}
                      </p>
                      <p className="text-xs text-[#595566]">
                        <strong className="text-[#292735]">Why it fits:</strong>{" "}
                        {mk.reason}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="clay-card-sm p-4 sm:p-5 bg-white space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#9A5B13] flex items-center gap-1.5">
                <XCircle className="w-4 h-4" />
                <span>
                  Missing Keywords ({result.missing_keywords.length})
                </span>
              </h4>
              {result.missing_keywords.length === 0 ? (
                <p className="text-xs text-[#595566]">
                  No key missing keywords found.
                </p>
              ) : (
                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                  {result.missing_keywords.map((msk, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-[12px] bg-[#FAF8F5] text-xs space-y-1 border border-amber-200/70"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-[#292735]">
                          {msk.keyword}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FFF4E5] text-[#9A5B13] uppercase">
                          {msk.importance} • Missing
                        </span>
                      </div>
                      <p className="text-xs text-[#595566]">{msk.reason}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Partial Matches */}
          {result.partial_matches.length > 0 && (
            <div className="clay-card-sm p-4 sm:p-5 bg-white space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#6C5BD8] flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>
                  Partially Matched Requirements ({result.partial_matches.length})
                </span>
              </h4>
              <div className="space-y-2.5">
                {result.partial_matches.map((pm, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-[12px] bg-[#FAF8F5] text-xs space-y-1"
                  >
                    <p className="font-bold text-[#292735]">{pm.requirement}</p>
                    <p className="text-[#595566]">
                      <strong className="text-[#292735]">In your CV:</strong>{" "}
                      {pm.cv_evidence}
                    </p>
                    <p className="text-[#595566]">
                      <strong className="text-[#292735]">Gap:</strong> {pm.gap} (
                      {pm.reason})
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actionable Recommendations */}
          {result.recommendations.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#292735] px-1">
                Suggested CV Updates (You Choose What to Apply)
              </h4>
              {result.recommendations
                .filter((r) => !dismissedRecs.has(r.id))
                .map((rec) => {
                  const isApplied = appliedRecs.has(rec.id);
                  return (
                    <div
                      key={rec.id}
                      className="clay-card-sm p-4 sm:p-5 bg-white space-y-3 border border-[rgba(70,65,90,0.1)]"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="clay-badge-purple px-2.5 py-0.5 text-[11px] font-bold uppercase">
                          Section: {rec.target_section}
                        </span>
                        {isApplied && (
                          <span className="text-xs font-bold text-[#227248]">
                            ✓ Applied to CV
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-[#595566]">
                        <strong className="text-[#292735]">Why suggested:</strong>{" "}
                        {rec.reason}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="p-3 rounded-[12px] bg-[#FAF8F5] border border-gray-200">
                          <span className="block text-[10px] font-bold uppercase text-[#595566] mb-1">
                            Current Text
                          </span>
                          <p className="text-[#292735] whitespace-pre-line">
                            {rec.current_content || "(Currently empty)"}
                          </p>
                        </div>
                        <div className="p-3 rounded-[12px] bg-[#EFEAFF]/40 border border-[#8B7CF6]/30">
                          <span className="block text-[10px] font-bold uppercase text-[#6C5BD8] mb-1">
                            Suggested Text
                          </span>
                          <p className="text-[#292735] whitespace-pre-line">
                            {rec.suggested_content}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setDismissedRecs((prev) => new Set(prev).add(rec.id))
                          }
                        >
                          Dismiss
                        </Button>
                        <Button
                          type="button"
                          variant="primary"
                          size="sm"
                          disabled={isApplied}
                          onClick={() => setPendingRec(rec)}
                        >
                          <ArrowRightCircle className="w-3.5 h-3.5" />
                          <span>
                            {isApplied ? "Applied" : "Apply Update"}
                          </span>
                        </Button>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      <Dialog
        isOpen={Boolean(pendingRec)}
        onClose={() => setPendingRec(null)}
        title="Apply Suggested Update?"
        description={
          pendingRec
            ? `This will update your ${pendingRec.target_section} section with the suggested text. Other CV sections will stay unchanged.`
            : ""
        }
        confirmLabel="Apply Update"
        cancelLabel="Cancel"
        onConfirm={() => {
          if (pendingRec) commitRecommendation(pendingRec);
        }}
      />
    </div>
  );
}
