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
    updatePersonalInfo,
    updateExperience,
    updateProject,
    addSkill,
  } = useCVStore();

  const [jobTitle, setJobTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MatchingResponseData | null>(null);
  const [dismissedRecs, setDismissedRecs] = useState<Set<string>>(new Set());
  const [appliedRecs, setAppliedRecs] = useState<Set<string>>(new Set());
  const [pendingRec, setPendingRec] = useState<MatchRec | null>(null);

  const handleAnalyzeMatch = async () => {
    if (!aiConsentAccepted) {
      setError(
        "Please grant Google Gemini Privacy Consent above before analyzing job alignment."
      );
      return;
    }
    if (jobDescription.trim().length < 20) {
      setError(
        "Please paste a complete job description (at least 20 characters)."
      );
      return;
    }

    setError(null);
    setIsLoading(true);
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
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to analyze job description match."
      );
    } finally {
      setIsLoading(false);
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
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-[#8B7CF6]" />
            <div>
              <h2 className="text-base font-bold text-[#292735]">
                AI Job Description Matcher
              </h2>
              <p className="text-xs text-[#777482]">
                Compare your active CV ({cvData.title}) against a target job
                posting for keyword, skill, and responsibility alignment.
              </p>
            </div>
          </div>
          <span className="clay-badge-purple px-3 py-1 text-xs font-bold">
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
            placeholder="e.g. Vercel, Stripe"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />
        </div>

        <Textarea
          label="Job Description *"
          rows={5}
          placeholder="Paste the full job requirements, responsibilities, and qualifications here..."
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
        />

        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <span className="text-[11px] text-[#777482]">
            {!aiConsentAccepted ? (
              <span className="text-[#6C5BD8] font-medium">
                Grant privacy consent above to enable AI job matching.
              </span>
            ) : (
              "Deterministic keyword scoring + Gemini semantic analysis"
            )}
          </span>
          <Button
            type="button"
            variant="primary"
            size="md"
            disabled={!aiConsentAccepted || isLoading}
            isLoading={isLoading}
            onClick={handleAnalyzeMatch}
          >
            <Sparkles className="w-4 h-4 mr-1.5" />
            <span>
              {isLoading
                ? "Analyzing your CV against the job description..."
                : "Analyze Job Match"}
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
            onClick={handleAnalyzeMatch}
          >
            Retry
          </Button>
        </div>
      )}

      {result && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Score Overview Card */}
          <div className="clay-card p-5 sm:p-6 bg-white space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-[#8B7CF6]">
                  Estimated Job Alignment Score
                </span>
                <h3 className="text-sm text-[#292735] leading-relaxed">
                  {result.overall_assessment}
                </h3>
              </div>
              <div className="flex items-center gap-3 shrink-0 bg-[#FAF8F5] px-4 py-3 rounded-[18px] border border-[#8B7CF6]/25">
                <div className="text-3xl font-extrabold text-[#8B7CF6]">
                  {result.score_breakdown.overall_score}%
                </div>
                <div className="text-[11px] text-[#777482] leading-tight">
                  <div className="font-bold text-[#292735]">Match Estimate</div>
                  <div>Not a hiring guarantee</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-[14px] bg-[#FAF8F5]">
                <span className="text-[#777482] block">
                  Deterministic Keywords (50%)
                </span>
                <strong className="text-base text-[#292735]">
                  {result.score_breakdown.deterministic_keyword_score}%
                </strong>
              </div>
              <div className="p-3 rounded-[14px] bg-[#FAF8F5]">
                <span className="text-[#777482] block">
                  Semantic Responsibilities (30%)
                </span>
                <strong className="text-base text-[#292735]">
                  {result.score_breakdown.semantic_alignment_score}%
                </strong>
              </div>
              <div className="p-3 rounded-[14px] bg-[#FAF8F5]">
                <span className="text-[#777482] block">
                  Experience & Education (20%)
                </span>
                <strong className="text-base text-[#292735]">
                  {result.score_breakdown.experience_education_score}%
                </strong>
              </div>
            </div>

            <p className="text-[11px] text-[#777482] flex items-start gap-1.5">
              <Info className="w-3.5 h-3.5 text-[#8B7CF6] shrink-0 mt-0.5" />
              <span>{result.score_breakdown.methodology_note}</span>
            </p>
          </div>

          {/* Matched vs Missing Keywords */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="clay-card-sm p-4 sm:p-5 bg-white space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  Matched Keywords ({result.matched_keywords.length})
                </span>
              </h4>
              {result.matched_keywords.length === 0 ? (
                <p className="text-xs text-[#777482]">
                  No direct keyword matches identified yet.
                </p>
              ) : (
                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                  {result.matched_keywords.map((mk, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-[12px] bg-[#FAF8F5] text-xs space-y-1 border border-emerald-100"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-[#292735]">
                          {mk.keyword}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                          {mk.presence === "explicit"
                            ? "Explicitly in CV"
                            : "Reasonably Inferred"}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#777482]">
                        <strong>Evidence:</strong> {mk.evidence}
                      </p>
                      <p className="text-[11px] text-[#777482]">
                        <strong>Reason:</strong> {mk.reason}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="clay-card-sm p-4 sm:p-5 bg-white space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
                <XCircle className="w-4 h-4" />
                <span>
                  Missing Keywords ({result.missing_keywords.length})
                </span>
              </h4>
              {result.missing_keywords.length === 0 ? (
                <p className="text-xs text-[#777482]">
                  No critical missing keywords found!
                </p>
              ) : (
                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                  {result.missing_keywords.map((msk, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-[12px] bg-[#FAF8F5] text-xs space-y-1 border border-amber-100"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-[#292735]">
                          {msk.keyword}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 uppercase">
                          {msk.importance} • Not in CV
                        </span>
                      </div>
                      <p className="text-[11px] text-[#777482]">{msk.reason}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Partial Matches */}
          {result.partial_matches.length > 0 && (
            <div className="clay-card-sm p-4 sm:p-5 bg-white space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#8B7CF6] flex items-center gap-1.5">
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
                    <p className="text-[#777482]">
                      <strong>CV Evidence:</strong> {pm.cv_evidence}
                    </p>
                    <p className="text-[#777482]">
                      <strong>Gap:</strong> {pm.gap} ({pm.reason})
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
                Tailored CV Recommendations (Requires Your Approval)
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
                          Target Section: {rec.target_section}
                        </span>
                        {isApplied && (
                          <span className="text-xs font-bold text-emerald-600">
                            ✓ Applied to CV
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-[#777482]">
                        <strong>Why suggested:</strong> {rec.reason}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="p-3 rounded-[12px] bg-[#FAF8F5] border border-gray-200">
                          <span className="block text-[10px] font-bold uppercase text-[#777482] mb-1">
                            Current Content
                          </span>
                          <p className="text-[#292735] whitespace-pre-line">
                            {rec.current_content || "(Currently empty)"}
                          </p>
                        </div>
                        <div className="p-3 rounded-[12px] bg-[#EFEAFF]/40 border border-[#8B7CF6]/30">
                          <span className="block text-[10px] font-bold uppercase text-[#6C5BD8] mb-1">
                            Suggested Content
                          </span>
                          <p className="text-[#292735] whitespace-pre-line">
                            {rec.suggested_content}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setDismissedRecs((prev) => new Set(prev).add(rec.id))
                          }
                        >
                          Reject Suggestion
                        </Button>
                        <Button
                          type="button"
                          variant="primary"
                          size="sm"
                          disabled={isApplied}
                          onClick={() => setPendingRec(rec)}
                        >
                          <ArrowRightCircle className="w-3.5 h-3.5 mr-1" />
                          <span>
                            {isApplied ? "Applied" : "Approve & Apply"}
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
        title="Apply Recommendation to CV?"
        description={
          pendingRec
            ? `This will update your ${pendingRec.target_section} section with the suggested text. Other CV sections will remain untouched.`
            : ""
        }
        confirmLabel="Approve & Update Field"
        cancelLabel="Cancel"
        onConfirm={() => {
          if (pendingRec) commitRecommendation(pendingRec);
        }}
      />
    </div>
  );
}

