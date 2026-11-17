"use client";

import React, { useState } from "react";
import { useCVStore } from "@/store/cv-store";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AIPrivacyConsentBannerProps {
  compact?: boolean;
  enabledOverride?: boolean;
}

export function AIPrivacyConsentBanner({
  compact = false,
  enabledOverride,
}: AIPrivacyConsentBannerProps) {
  const { aiConsentAccepted, setAIConsent, openConsentModal } = useCVStore();
  const isEnabled = enabledOverride ?? aiConsentAccepted;

  if (isEnabled) {
    return (
      <div
        data-testid="ai-privacy-disclosure"
        className={cn(
          "flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-[16px] border border-[#2F7A57]/20 bg-[#E6F6ED]/65 text-xs text-[#292735]",
          compact ? "px-3.5 py-2.5" : "px-4 py-3"
        )}
      >
        <div className="flex items-start sm:items-center gap-2 min-w-0">
          <CheckCircle2 className="w-4 h-4 text-[#227248] shrink-0 mt-0.5 sm:mt-0" />
          <span className="leading-snug text-[#292735]">
            <strong>AI features enabled.</strong> Only necessary CV fields are
            sent to Google Gemini when you run an AI tool.
          </span>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-start sm:self-center">
          <button
            type="button"
            onClick={openConsentModal}
            className="text-xs font-semibold text-[#595566] hover:text-[#292735] underline underline-offset-2 cursor-pointer py-1"
          >
            Privacy Details
          </button>
          <button
            type="button"
            onClick={() => setAIConsent(false)}
            className="text-xs font-semibold text-[#B91C1C] hover:text-[#991B1B] underline underline-offset-2 cursor-pointer py-1"
          >
            Withdraw Consent
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      data-testid="ai-privacy-disclosure"
      className="clay-card p-3.5 sm:px-4 sm:py-3.5 bg-[#FAF8F5] border border-[#8B7CF6]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
    >
      <div className="flex items-start gap-3 min-w-0">
        <div className="w-9 h-9 rounded-[12px] bg-[#EFEAFF] text-[#6C5BD8] flex items-center justify-center shrink-0 mt-0.5">
          <ShieldAlert className="w-4 h-4" />
        </div>
        <div className="space-y-0.5 min-w-0">
          <p className="text-xs sm:text-sm font-bold text-[#292735]">
            Privacy notice required for AI tools
          </p>
          <p className="text-xs text-[#595566] leading-relaxed">
            Your CV stays in your browser. Please review and agree to our privacy
            notice before running Google Gemini AI features.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 shrink-0 sm:justify-end">
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
  );
}

export function AIPrivacyConsentModal({
  forceOpen = false,
}: {
  forceOpen?: boolean;
}) {
  const {
    isConsentModalOpen,
    aiConsentAccepted,
    aiConsentTimestamp,
    setAIConsent,
    closeConsentModal,
  } = useCVStore();

  const [showDetails, setShowDetails] = useState(false);

  const handleClose = () => {
    setShowDetails(false);
    closeConsentModal();
  };

  return (
    <Dialog
      isOpen={forceOpen || isConsentModalOpen}
      onClose={handleClose}
      title={showDetails ? "Privacy Details" : "AI Privacy Notice"}
      description={
        showDetails
          ? "How ClayCV handles your CV data with Google Gemini."
          : "When you use an AI feature, only the CV information needed for that task is sent to Google Gemini."
      }
      maxWidthClassName={showDetails ? "max-w-lg" : "max-w-md"}
      footer={
        showDetails ? (
          <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-2 pt-2 border-t border-[rgba(70,65,90,0.08)]">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setShowDetails(false)}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Button>
            {aiConsentAccepted ? (
              <Button type="button" variant="primary" size="sm" onClick={handleClose}>
                Done
              </Button>
            ) : (
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => {
                  setAIConsent(true);
                  setShowDetails(false);
                }}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Agree & Continue</span>
              </Button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-2 pt-2 border-t border-[rgba(70,65,90,0.08)]">
            {aiConsentAccepted ? (
              <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-center justify-between sm:justify-start gap-2">
                  <button
                    type="button"
                    onClick={() => setShowDetails(true)}
                    className="min-h-[38px] px-2.5 text-xs font-semibold text-[#595566] hover:text-[#292735] underline underline-offset-2 cursor-pointer"
                  >
                    Privacy Details
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAIConsent(false);
                      handleClose();
                    }}
                    className="min-h-[38px] px-2.5 text-xs font-semibold text-[#B91C1C] hover:text-[#991B1B] underline underline-offset-2 cursor-pointer"
                  >
                    Withdraw Consent
                  </button>
                </div>
                <Button type="button" variant="primary" size="sm" onClick={handleClose}>
                  Done
                </Button>
              </div>
            ) : (
              <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-center justify-between sm:justify-start gap-2">
                  <button
                    type="button"
                    onClick={() => setShowDetails(true)}
                    className="min-h-[38px] px-2.5 text-xs font-semibold text-[#6C5BD8] hover:text-[#5746C2] underline underline-offset-2 cursor-pointer"
                  >
                    Privacy Details
                  </button>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="min-h-[38px] px-2.5 text-xs font-semibold text-[#595566] hover:text-[#292735] cursor-pointer"
                  >
                    Not Now
                  </button>
                </div>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setAIConsent(true);
                    setShowDetails(false);
                  }}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Agree & Continue</span>
                </Button>
              </div>
            )}
          </div>
        )
      }
    >
      {showDetails ? (
        <div className="space-y-3">
          <ul className="space-y-2">
            <li className="flex items-start gap-2.5 p-2.5 rounded-[14px] bg-[#FAF8F5] border border-[rgba(70,65,90,0.08)]">
              <div className="w-7 h-7 rounded-[9px] bg-[#EFEAFF] text-[#6C5BD8] flex items-center justify-center shrink-0">
                <Lock className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs sm:text-sm font-medium text-[#292735] leading-snug pt-0.5">
                Only necessary CV information is shared.
              </span>
            </li>

            <li className="flex items-start gap-2.5 p-2.5 rounded-[14px] bg-[#FAF8F5] border border-[rgba(70,65,90,0.08)]">
              <div className="w-7 h-7 rounded-[9px] bg-[#E6F6ED] text-[#227248] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs sm:text-sm font-medium text-[#292735] leading-snug pt-0.5">
                Your uploaded certificates and attachments are not sent.
              </span>
            </li>

            <li className="flex items-start gap-2.5 p-2.5 rounded-[14px] bg-[#FAF8F5] border border-[rgba(70,65,90,0.08)]">
              <div className="w-7 h-7 rounded-[9px] bg-[#EBF3FC] text-[#2B6CB0] flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs sm:text-sm font-medium text-[#292735] leading-snug pt-0.5">
                AI will not change your CV without your confirmation.
              </span>
            </li>
          </ul>

          <div className="rounded-[14px] border border-[rgba(70,65,90,0.1)] bg-[#F7F5F0] p-3.5 space-y-2 text-xs text-[#595566] leading-relaxed">
            <p>
              <strong className="text-[#292735]">What is sent and why:</strong>{" "}
              Only the CV text fields and job context required for the AI tool
              you click (writing improvements, job matching, ATS review, or
              career guidance) are sent through our server route to the Google
              Gemini API to create your result.
            </p>
            <p>
              <strong className="text-[#292735]">Google Gemini processing:</strong>{" "}
              Requests are processed by Google under the Google Gemini API Terms.
              Google&apos;s Free Tier and Paid Tier apply different
              data-retention and product-improvement policies.
            </p>
            <p>
              <strong className="text-[#292735]">What stays in your browser:</strong>{" "}
              All CV profiles, saved history snapshots, JSON backups, and
              uploaded PDF or image certificate files stay in your browser
              storage and are never uploaded to AI endpoints.
            </p>
            <p>
              <strong className="text-[#292735]">Full user control:</strong>{" "}
              AI output always appears in a preview card first so you decide what
              to apply. You can withdraw consent at any time.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-2 text-xs text-[#595566]">
          <div className="flex items-center gap-2 rounded-[12px] bg-[#FAF8F5] border border-[rgba(70,65,90,0.08)] px-3 py-2">
            <ShieldCheck className="w-4 h-4 text-[#227248] shrink-0" />
            <span>Local CVs &amp; uploaded certificates stay in your browser.</span>
          </div>
          {aiConsentAccepted && aiConsentTimestamp && (
            <p className="text-xs text-[#227248] font-medium px-0.5">
              Consent active ({new Date(aiConsentTimestamp).toLocaleDateString()}).
            </p>
          )}
        </div>
      )}
    </Dialog>
  );
}
