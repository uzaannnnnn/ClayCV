"use client";

import React from "react";
import { useCVStore } from "@/store/cv-store";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Lock, CheckCircle2, Info } from "lucide-react";

interface AIPrivacyConsentBannerProps {
  compact?: boolean;
}

export function AIPrivacyConsentBanner({
  compact = false,
}: AIPrivacyConsentBannerProps) {
  const { aiConsentAccepted, aiConsentTimestamp, setAIConsent } = useCVStore();

  if (aiConsentAccepted && compact) {
    return (
      <div className="flex items-center justify-between gap-3 px-3.5 py-2 rounded-[14px] bg-[#EFEAFF]/70 border border-[#8B7CF6]/20 text-xs text-[#292735]">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#6C5BD8] shrink-0" />
          <span>
            <strong>Google Gemini AI Consent Active</strong> — Only minimal
            fields required for your selected action are sent server-side.
            Certificate files are never uploaded.
          </span>
        </div>
        <button
          type="button"
          onClick={() => setAIConsent(false)}
          className="text-[11px] font-semibold text-[#777482] hover:text-red-600 underline shrink-0 cursor-pointer"
        >
          Revoke Consent
        </button>
      </div>
    );
  }

  return (
    <div className="clay-card p-5 sm:p-6 bg-[#FAF8F5] border border-[#8B7CF6]/30 space-y-4">
      <div className="flex items-start gap-3.5">
        <div className="w-10 h-10 rounded-[14px] bg-[#EFEAFF] text-[#6C5BD8] flex items-center justify-center shrink-0 shadow-sm">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="text-sm sm:text-base font-bold text-[#292735]">
              Privacy Notice & Google Gemini AI Consent
            </h3>
            <span className="clay-badge-purple px-2.5 py-0.5 text-[11px] font-bold">
              Server-Side Protected
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#777482] leading-relaxed">
            ClayCV is a local-first application — your CV stays in your browser
            until you explicitly trigger an AI action. When used, only the
            minimized CV text required for your selected action is transmitted
            through our Next.js server route to the{" "}
            <strong className="text-[#292735]">Google Gemini API</strong> and
            processed by Google&apos;s service under Google&apos;s applicable
            Gemini API Terms and data-handling policies (note: Google&apos;s
            Free Tier and Paid Tier have different data-retention and
            model-improvement policies).
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs text-[#292735] bg-white/80 p-3.5 rounded-[16px] border border-[rgba(70,65,90,0.08)]">
        <div className="flex items-start gap-2">
          <Lock className="w-4 h-4 text-[#8B7CF6] shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Data Minimization</p>
            <p className="text-[#777482] text-[11px]">
              Only the fields needed for the specific AI operation are sent.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-[#8B7CF6] shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">No Attachments Sent</p>
            <p className="text-[#777482] text-[11px]">
              IndexedDB certificate files and local storage blobs are never
              transmitted.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-[#8B7CF6] shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Explicit Approval</p>
            <p className="text-[#777482] text-[11px]">
              AI never overwrites your CV without your explicit confirmation.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <p className="text-[11px] text-[#777482]">
          {aiConsentAccepted && aiConsentTimestamp
            ? `Consent granted at ${new Date(aiConsentTimestamp).toLocaleString()}.`
            : "Please grant explicit consent to enable Google Gemini AI features."}
        </p>
        <div className="flex items-center gap-2.5">
          {aiConsentAccepted ? (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setAIConsent(false)}
            >
              Revoke Consent
            </Button>
          ) : (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => setAIConsent(true)}
            >
              <CheckCircle2 className="w-4 h-4 mr-1.5" />
              <span>I Understand & Grant Consent</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

