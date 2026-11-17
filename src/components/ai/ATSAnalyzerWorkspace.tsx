"use client";

import React, { useState, useMemo } from "react";
import { useCVStore } from "@/store/cv-store";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { AIPrivacyConsentBanner } from "./AIPrivacyConsentBanner";
import { callAnalysisAI } from "@/lib/ai/client-api";
import { runDeterministicATSAudit } from "@/lib/ai/services/analysis.service";
import {
  AnalysisResponseData,
  ATSFinding,
} from "@/lib/ai/schemas/analysis.schema";
import {
  ShieldCheck,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Wrench,
  Info,
  AlertCircle,
  FileWarning,
  ShieldAlert,
} from "lucide-react";

export function ATSAnalyzerWorkspace() {
  const {
    cvData,
    aiConsentAccepted,
    setAIConsent,
    openConsentModal,
    setActiveWorkspace,
    updatePersonalInfo,
    updateExperience,
    updateProject,
    addSkill,
  } = useCVStore();

  const [loadingSource, setLoadingSource] = useState<"header" | "retry" | null>(
    null
  );
  const isLoading = loadingSource !== null;
  const [error, setError] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<AnalysisResponseData | null>(null);
  const [pendingFix, setPendingFix] = useState<ATSFinding | null>(null);
  const [appliedFixes, setAppliedFixes] = useState<Set<string>>(new Set());

  const deterministicBaseline = useMemo(
    () => runDeterministicATSAudit(cvData),
    [cvData]
  );

  const isCVMostlyEmpty = useMemo(
    () =>
      !cvData.personalInfo.fullName.trim() &&
      cvData.experience.length === 0 &&
      cvData.education.length === 0,
    [cvData]
  );

  const handleRunFullAnalysis = async (
    source: "header" | "retry" = "header"
  ) => {
    if (!aiConsentAccepted) {
      openConsentModal();
      return;
    }

    if (source === "header") {
      setError(null);
    }
    setLoadingSource(source);

    try {
      const res = await callAnalysisAI(
        {
          consentAccepted: true,
          cvData: cvData as unknown as Record<string, unknown>,
        },
        cvData.language
      );
      setAiResult(res.data);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not complete the AI review right now. Please try again."
      );
    } finally {
      setLoadingSource(null);
    }
  };

  const applyFindingFix = (finding: ATSFinding) => {
    if (!finding.suggested_fix) return;
    if (finding.fixable_section === "summary") {
      updatePersonalInfo({ summary: finding.suggested_fix });
    } else if (finding.fixable_section === "experience") {
      const target =
        cvData.experience.find((e) => e.id === finding.fixable_item_id) ||
        cvData.experience[0];
      if (target) {
        updateExperience(target.id, { description: finding.suggested_fix });
      }
    } else if (finding.fixable_section === "projects") {
      const target =
        cvData.projects.find((p) => p.id === finding.fixable_item_id) ||
        cvData.projects[0];
      if (target) {
        updateProject(target.id, { description: finding.suggested_fix });
      }
    } else if (finding.fixable_section === "skills") {
      finding.suggested_fix
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .forEach((s) => addSkill(s));
    }

    setAppliedFixes((prev) => new Set(prev).add(finding.id));
    setPendingFix(null);
  };

  const activeCategories =
    aiResult?.categories || deterministicBaseline.categoryScores;
  const criticalList =
    aiResult?.critical_issues || deterministicBaseline.criticalIssues;
  const improvementList =
    aiResult?.improvements || deterministicBaseline.improvements;
  const goodList =
    aiResult?.good_practices || deterministicBaseline.goodPractices;

  const overallScore = aiResult
    ? aiResult.overall_score
    : deterministicBaseline.score;

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Top Analyzer Header + Score Overview */}
      <section
        data-testid="ai-primary-card"
        className="clay-card p-4 sm:p-6 space-y-4 sm:space-y-5"
      >
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3.5 sm:gap-4">
          <div className="flex items-start gap-2.5 sm:gap-3 min-w-0 flex-1">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-[12px] sm:rounded-[14px] bg-[#EFEAFF] text-[#6C5BD8] flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="space-y-1 min-w-0">
              <h2 className="text-sm sm:text-lg font-bold text-[#292735] leading-snug">
                ATS & CV Quality Analyzer
              </h2>
              <p className="hidden sm:block text-xs sm:text-sm text-[#595566] leading-relaxed">
                Check how clearly your CV reads for hiring systems and
                recruiters, then run an AI review for writing feedback.
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="primary"
            size="md"
            disabled={!aiConsentAccepted || isLoading}
            isLoading={loadingSource === "header"}
            onClick={() => handleRunFullAnalysis("header")}
            className="w-full sm:w-auto shrink-0"
          >
            <Sparkles className="w-4 h-4" />
            <span>
              {loadingSource === "header" ? "Reviewing CV..." : "Run AI Review"}
            </span>
          </Button>
        </div>

        {/* Privacy Notice Callout when consent not granted */}
        {!aiConsentAccepted && (
          <div className="rounded-[18px] p-4 bg-[#FAF8F5] border border-[#8B7CF6]/30 flex flex-col gap-3">
            <div className="flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-[#6C5BD8] shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm text-[#292735] leading-relaxed">
                Your CV can still be checked without AI. Agree to our privacy
                notice to get a deeper AI review.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={openConsentModal}
              >
                Review Privacy Notice
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => setAIConsent(true)}
              >
                Agree & Continue
              </Button>
            </div>
          </div>
        )}

        {/* Helpful Empty CV Notice */}
        {isCVMostlyEmpty && (
          <div className="rounded-[18px] p-4 bg-[#FFF8EB] border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <FileWarning className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <p className="text-xs text-[#292735] leading-relaxed">
                Your CV looks mostly empty right now. Add your contact details,
                work experience, and skills in the CV Editor for a clearer score.
              </p>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setActiveWorkspace("builder")}
              className="shrink-0"
            >
              Open CV Builder
            </Button>
          </div>
        )}

        {/* Score Cards: prominent overall score + compact 2-up subscores on mobile */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3.5">
          {/* Card 1: Overall ATS Score */}
          <div className="col-span-2 sm:col-span-1 p-3.5 sm:p-4 rounded-[18px] sm:rounded-[20px] bg-white border border-[#8B7CF6]/30 shadow-xs flex sm:flex-col items-center sm:items-stretch justify-between gap-2">
            <div className="space-y-0.5 sm:space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#6C5BD8] block">
                Overall ATS Score
              </span>
              <p className="text-xs text-[#595566] leading-snug sm:hidden">
                {aiResult ? "Basic + AI review" : "Basic CV checks"}
              </p>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#292735] tracking-tight">
              {overallScore}/100
            </div>
            <p className="hidden sm:block text-xs text-[#595566] leading-snug">
              {aiResult
                ? "Combined basic checks and AI writing review"
                : "Based on basic CV checks"}
            </p>
          </div>

          {/* Card 2: Basic CV Checks */}
          <div className="p-3 sm:p-4 rounded-[18px] sm:rounded-[20px] bg-[#FAF8F5] border border-[rgba(70,65,90,0.08)] flex flex-col justify-between gap-1.5 sm:gap-2">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#595566]">
              Basic CV Checks
            </span>
            <div className="text-xl sm:text-3xl font-extrabold text-[#292735] tracking-tight">
              {deterministicBaseline.score}/100
            </div>
            <p className="hidden sm:block text-xs text-[#595566] leading-snug">
              Contact details, dates, sections, and layout
            </p>
          </div>

          {/* Card 3: AI Writing Review */}
          <div className="p-3 sm:p-4 rounded-[18px] sm:rounded-[20px] bg-[#FAF8F5] border border-[rgba(70,65,90,0.08)] flex flex-col justify-between gap-1.5 sm:gap-2">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#595566]">
              AI Writing Review
            </span>
            <div
              className={
                aiResult
                  ? "text-xl sm:text-3xl font-extrabold text-[#6C5BD8] tracking-tight"
                  : "text-base sm:text-xl font-extrabold text-[#595566] tracking-tight"
              }
            >
              {aiResult ? `${aiResult.ai_quality_score}/100` : "Not run yet"}
            </div>
            <p className="hidden sm:block text-xs text-[#595566] leading-snug">
              {aiResult
                ? "Clarity, action verbs, and measurable impact"
                : aiConsentAccepted
                ? "Click Run AI Review above"
                : "Agree to privacy notice to unlock"}
            </p>
          </div>
        </div>

        {/* Helpful Scope Note */}
        <p className="text-xs text-[#595566] flex items-start gap-2 leading-relaxed pt-1">
          <Info className="w-4 h-4 text-[#6C5BD8] shrink-0 mt-0.5" />
          <span>
            {aiResult?.methodology_explanation ||
              "ATS scores are helpful guidance based on standard resume formatting rules and do not guarantee interview decisions."}
          </span>
        </p>
      </section>

      {/* Recoverable AI Request Error */}
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
            onClick={() => handleRunFullAnalysis("retry")}
            className="shrink-0 self-end sm:self-center"
          >
            <span>{loadingSource === "retry" ? "Retrying..." : "Try Again"}</span>
          </Button>
        </div>
      )}

      {/* Section & Formatting Breakdown */}
      <section className="clay-card-sm p-4 sm:p-5 bg-white space-y-3.5">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#292735]">
            Section & Formatting Breakdown
          </h3>
          <span className="text-xs font-semibold text-[#595566]">
            {aiResult ? "Basic + AI Review" : "Basic CV Checks"}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {activeCategories.map((cat, idx) => (
            <div
              key={`${cat.name}-${idx}`}
              className="p-3.5 rounded-[14px] bg-[#FAF8F5] border border-[rgba(70,65,90,0.08)] flex flex-col justify-between gap-2"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs font-bold text-[#292735] leading-snug">
                  {cat.name}
                </p>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold shrink-0 ${
                    cat.status === "good"
                      ? "bg-[#E6F6ED] text-[#227248]"
                      : cat.status === "needs_improvement"
                      ? "bg-[#FFF4E5] text-[#9A5B13]"
                      : "bg-[#FEECEB] text-[#B91C1C]"
                  }`}
                >
                  {cat.score}%
                </span>
              </div>
              <p className="text-xs text-[#595566] leading-relaxed">
                {cat.summary}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* AI Writing Recommendations */}
      {aiResult && aiResult.recommendations.length > 0 && (
        <section className="clay-card-sm p-4 sm:p-5 bg-white space-y-3.5 border border-[#8B7CF6]/20">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#6C5BD8] flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" />
            <span>
              AI Writing Suggestions ({aiResult.recommendations.length})
            </span>
          </h3>
          <div className="space-y-2.5">
            {aiResult.recommendations.map((rec, idx) => (
              <div
                key={`${rec.title}-${idx}`}
                className="p-3.5 rounded-[14px] bg-[#FAF8F5] border border-[#8B7CF6]/15 text-xs space-y-1.5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-bold text-[#292735]">{rec.title}</span>
                  <span className="clay-badge-purple px-2.5 py-0.5 text-[11px] font-semibold">
                    {rec.section}
                  </span>
                </div>
                <p className="text-[#595566] leading-relaxed">{rec.action}</p>
                {rec.suggested_text && (
                  <p className="p-2.5 rounded-[10px] bg-white border border-[rgba(70,65,90,0.08)] text-[#292735] whitespace-pre-line">
                    {rec.suggested_text}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Critical Issues */}
      {criticalList.length > 0 && (
        <section className="clay-card-sm p-4 sm:p-5 bg-white space-y-3 border border-red-200">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#B91C1C] flex items-center gap-1.5">
            <XCircle className="w-4 h-4" />
            <span>Critical Issues ({criticalList.length})</span>
          </h3>
          <div className="space-y-2.5">
            {criticalList.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-[14px] bg-[#FFF5F5] border border-red-100 text-xs space-y-2"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <span className="font-bold text-[#292735] leading-snug">
                    {item.category}: {item.description}
                  </span>
                  {item.suggested_fix && item.fixable_section && (
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      disabled={appliedFixes.has(item.id)}
                      onClick={() => setPendingFix(item)}
                      className="shrink-0 self-start"
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      <span>
                        {appliedFixes.has(item.id) ? "Applied" : "Fix with AI"}
                      </span>
                    </Button>
                  )}
                </div>
                <p className="text-[#595566] leading-relaxed">
                  <strong className="text-[#292735]">Why this matters:</strong>{" "}
                  {item.reason}
                </p>
                <p className="text-[#292735] leading-relaxed">
                  <strong>Next step:</strong> {item.recommended_action}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Needs Improvement */}
      {improvementList.length > 0 && (
        <section className="clay-card-sm p-4 sm:p-5 bg-white space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#9A5B13] flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4" />
            <span>Needs Improvement ({improvementList.length})</span>
          </h3>
          <div className="space-y-2.5">
            {improvementList.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-[14px] bg-[#FAF8F5] border border-amber-200/70 text-xs space-y-2"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <span className="font-bold text-[#292735] leading-snug">
                    {item.category}: {item.description}
                  </span>
                  {item.suggested_fix && item.fixable_section && (
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      disabled={appliedFixes.has(item.id)}
                      onClick={() => setPendingFix(item)}
                      className="shrink-0 self-start"
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      <span>
                        {appliedFixes.has(item.id) ? "Applied" : "Fix with AI"}
                      </span>
                    </Button>
                  )}
                </div>
                <p className="text-[#595566] leading-relaxed">
                  <strong className="text-[#292735]">Why this matters:</strong>{" "}
                  {item.reason}
                </p>
                <p className="text-[#292735] leading-relaxed">
                  <strong>Suggested step:</strong> {item.recommended_action}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Good Practices */}
      <section className="clay-card-sm p-4 sm:p-5 bg-white space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#227248] flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4" />
          <span>Working Well ({goodList.length})</span>
        </h3>
        <div className="space-y-2">
          {goodList.map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-[14px] bg-[#F2FBF6] border border-emerald-200/60 text-xs space-y-1"
            >
              <p className="font-bold text-[#292735]">
                {item.category}: {item.description}
              </p>
              <p className="text-[#595566] leading-relaxed">{item.reason}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Compact active consent status bar at the bottom of workspace content */}
      {aiConsentAccepted && <AIPrivacyConsentBanner compact />}

      {/* Fix with AI Approval Dialog */}
      <Dialog
        isOpen={Boolean(pendingFix)}
        onClose={() => setPendingFix(null)}
        title={`Apply AI Suggestion for ${pendingFix?.category || "CV"}?`}
        description="Review the suggested text below before updating your CV."
        confirmLabel="Apply Suggestion"
        cancelLabel="Cancel"
        onConfirm={() => {
          if (pendingFix) applyFindingFix(pendingFix);
        }}
      >
        {pendingFix?.suggested_fix && (
          <div className="p-3.5 rounded-[14px] bg-[#FAF8F5] border border-[#8B7CF6]/30 text-xs text-[#292735] whitespace-pre-line leading-relaxed">
            {pendingFix.suggested_fix}
          </div>
        )}
      </Dialog>
    </div>
  );
}
