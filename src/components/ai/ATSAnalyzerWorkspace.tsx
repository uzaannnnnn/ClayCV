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
} from "lucide-react";

export function ATSAnalyzerWorkspace() {
  const {
    cvData,
    aiConsentAccepted,
    updatePersonalInfo,
    updateExperience,
    updateProject,
    addSkill,
  } = useCVStore();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<AnalysisResponseData | null>(null);
  const [pendingFix, setPendingFix] = useState<ATSFinding | null>(null);
  const [appliedFixes, setAppliedFixes] = useState<Set<string>>(new Set());

  // Instant deterministic baseline audit
  const deterministicBaseline = useMemo(
    () => runDeterministicATSAudit(cvData),
    [cvData]
  );

  const handleRunFullAnalysis = async () => {
    if (!aiConsentAccepted) {
      setError(
        "Please accept the Google Gemini Privacy Consent above before running AI Content Analysis."
      );
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const res = await callAnalysisAI(
        {
          consentAccepted: true,
          cvData: cvData as unknown as Record<string, unknown>,
        },
        cvData.language
      );
      setAiResult(res.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to run AI CV analysis."
      );
    } finally {
      setIsLoading(false);
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

  return (
    <div className="space-y-5 pb-12">
      <AIPrivacyConsentBanner compact />

      {/* Top Analyzer Header Card */}
      <div className="clay-card p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#8B7CF6]" />
              <h2 className="text-base font-bold text-[#292735]">
                ATS & CV Quality Analyzer
              </h2>
            </div>
            <p className="text-xs text-[#777482]">
              Combines deterministic structural checks across 7 ATS dimensions
              with Google Gemini qualitative writing analysis.
            </p>
          </div>

          <Button
            type="button"
            variant="primary"
            size="md"
            disabled={!aiConsentAccepted || isLoading}
            isLoading={isLoading}
            onClick={handleRunFullAnalysis}
          >
            <Sparkles className="w-4 h-4 mr-1.5" />
            <span>
              {isLoading
                ? "Analyzing CV structure & writing quality..."
                : "Run Full Gemini ATS Audit"}
            </span>
          </Button>
        </div>

        {!aiConsentAccepted && (
          <p className="text-[11px] font-medium text-[#6C5BD8]">
            Grant privacy consent above to enable Full Gemini ATS Audit. Local deterministic checks remain active.
          </p>
        )}

        {/* Score Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-4 rounded-[16px] bg-white border border-[#8B7CF6]/25 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase text-[#8B7CF6] block">
                Overall ATS Estimate
              </span>
              <span className="text-xs text-[#777482]">
                {aiResult ? "Combined Score" : "Structural Baseline"}
              </span>
            </div>
            <span className="text-2xl font-extrabold text-[#292735]">
              {aiResult ? aiResult.overall_score : deterministicBaseline.score}
              /100
            </span>
          </div>

          <div className="p-4 rounded-[16px] bg-[#FAF8F5] border border-[rgba(70,65,90,0.08)] flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase text-[#777482] block">
                Deterministic Checks
              </span>
              <span className="text-xs text-[#777482]">
                Fields, Dates & Structure
              </span>
            </div>
            <span className="text-xl font-bold text-[#292735]">
              {deterministicBaseline.score}/100
            </span>
          </div>

          <div className="p-4 rounded-[16px] bg-[#FAF8F5] border border-[rgba(70,65,90,0.08)] flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase text-[#777482] block">
                Gemini Content Score
              </span>
              <span className="text-xs text-[#777482]">
                Clarity, Verbs & Impact
              </span>
            </div>
            <span className="text-xl font-bold text-[#8B7CF6]">
              {aiResult ? `${aiResult.ai_quality_score}/100` : "Run AI Audit"}
            </span>
          </div>
        </div>

        <p className="text-[11px] text-[#777482] flex items-start gap-1.5">
          <Info className="w-3.5 h-3.5 text-[#8B7CF6] shrink-0 mt-0.5" />
          <span>
            {aiResult?.methodology_explanation ||
              "ATS scores are informational estimates based on standard parsing rules and cannot guarantee acceptance by all ATS platforms."}
          </span>
        </p>
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
            onClick={handleRunFullAnalysis}
          >
            Retry
          </Button>
        </div>
      )}

      {/* Category Breakdown */}
      <div className="clay-card-sm p-4 sm:p-5 bg-white space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#292735]">
          Section & Formatting Breakdown
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {activeCategories.map((cat, idx) => (
            <div
              key={idx}
              className="p-3 rounded-[12px] bg-[#FAF8F5] border border-[rgba(70,65,90,0.06)] flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#292735] truncate">
                  {cat.name}
                </p>
                <p className="text-[11px] text-[#777482] truncate">
                  {cat.summary}
                </p>
              </div>
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-bold shrink-0 ${
                  cat.status === "good"
                    ? "bg-emerald-50 text-emerald-700"
                    : cat.status === "needs_improvement"
                    ? "bg-amber-50 text-amber-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {cat.score}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Critical Issues */}
      {criticalList.length > 0 && (
        <div className="clay-card-sm p-4 sm:p-5 bg-white space-y-3 border border-red-200">
          <h3 className="text-xs font-bold uppercase tracking-wider text-red-600 flex items-center gap-1.5">
            <XCircle className="w-4 h-4" />
            <span>Critical Issues ({criticalList.length})</span>
          </h3>
          <div className="space-y-2.5">
            {criticalList.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-[12px] bg-red-50/50 border border-red-100 text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-[#292735]">
                    {item.category}: {item.description}
                  </span>
                  {item.suggested_fix && item.fixable_section && (
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      disabled={appliedFixes.has(item.id)}
                      onClick={() => setPendingFix(item)}
                    >
                      <Wrench className="w-3 h-3 mr-1" />
                      <span>
                        {appliedFixes.has(item.id) ? "Fixed" : "Fix with AI"}
                      </span>
                    </Button>
                  )}
                </div>
                <p className="text-[#777482]">
                  <strong>Reason:</strong> {item.reason}
                </p>
                <p className="text-[#292735]">
                  <strong>Action:</strong> {item.recommended_action}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Needs Improvement */}
      {improvementList.length > 0 && (
        <div className="clay-card-sm p-4 sm:p-5 bg-white space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4" />
            <span>Needs Improvement ({improvementList.length})</span>
          </h3>
          <div className="space-y-2.5">
            {improvementList.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-[12px] bg-[#FAF8F5] border border-amber-100 text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-[#292735]">
                    {item.category}: {item.description}
                  </span>
                  {item.suggested_fix && item.fixable_section && (
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      disabled={appliedFixes.has(item.id)}
                      onClick={() => setPendingFix(item)}
                    >
                      <Wrench className="w-3 h-3 mr-1" />
                      <span>
                        {appliedFixes.has(item.id) ? "Fixed" : "Fix with AI"}
                      </span>
                    </Button>
                  )}
                </div>
                <p className="text-[#777482]">
                  <strong>Reason:</strong> {item.reason}
                </p>
                <p className="text-[#292735]">
                  <strong>Recommended Action:</strong> {item.recommended_action}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Good Practices */}
      <div className="clay-card-sm p-4 sm:p-5 bg-white space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4" />
          <span>Good Practices Verified ({goodList.length})</span>
        </h3>
        <div className="space-y-2">
          {goodList.map((item) => (
            <div
              key={item.id}
              className="p-3 rounded-[12px] bg-emerald-50/40 border border-emerald-100 text-xs space-y-0.5"
            >
              <p className="font-bold text-[#292735]">
                {item.category}: {item.description}
              </p>
              <p className="text-[#777482]">{item.reason}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Fix with AI Approval Dialog */}
      <Dialog
        isOpen={Boolean(pendingFix)}
        onClose={() => setPendingFix(null)}
        title={`Approve AI Fix for ${pendingFix?.category || "CV"}?`}
        description="Review the AI-suggested improvement below before applying it to your CV."
        confirmLabel="Approve & Apply Fix"
        cancelLabel="Cancel"
        onConfirm={() => {
          if (pendingFix) applyFindingFix(pendingFix);
        }}
      >
        {pendingFix?.suggested_fix && (
          <div className="p-3.5 rounded-[12px] bg-[#FAF8F5] border border-[#8B7CF6]/30 text-xs text-[#292735] whitespace-pre-line">
            {pendingFix.suggested_fix}
          </div>
        )}
      </Dialog>
    </div>
  );
}

