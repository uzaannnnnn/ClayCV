"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import {
  Check,
  Copy,
  RefreshCw,
  ArrowRightCircle,
  Replace,
  X,
} from "lucide-react";

export interface AIResultCardProps {
  title: string;
  subtitle?: string;
  content: string;
  hasExistingContent: boolean;
  targetFieldName: string;
  isLoading?: boolean;
  regenerateDisabled?: boolean;
  onApply: (content: string) => void;
  onRegenerate?: () => void;
  onCancel?: () => void;
}

export function AIResultCard({
  title,
  subtitle,
  content,
  hasExistingContent,
  targetFieldName,
  isLoading = false,
  regenerateDisabled = false,
  onApply,
  onRegenerate,
  onCancel,
}: AIResultCardProps) {
  const [copied, setCopied] = useState(false);
  const [confirmReplaceOpen, setConfirmReplaceOpen] = useState(false);
  const [applied, setApplied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Fallback
    }
  };

  const handleApplyOrReplace = () => {
    if (hasExistingContent) {
      setConfirmReplaceOpen(true);
    } else {
      onApply(content);
      setApplied(true);
      setTimeout(() => setApplied(false), 2000);
    }
  };

  return (
    <>
      <div className="clay-card-sm p-4 sm:p-5 bg-white border border-[rgba(70,65,90,0.1)] space-y-3.5 transition-all">
        <div className="flex items-center justify-between gap-2 border-b border-gray-100 pb-2.5">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#8B7CF6]">
              {title}
            </span>
            {subtitle && (
              <p className="text-[11px] text-[#777482] mt-0.5">{subtitle}</p>
            )}
          </div>
          {applied && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold">
              <Check className="w-3 h-3" />
              Applied to {targetFieldName}
            </span>
          )}
        </div>

        <div className="text-xs sm:text-sm text-[#292735] whitespace-pre-line leading-relaxed bg-[#FAF8F5] p-3.5 rounded-[14px] border border-[rgba(70,65,90,0.06)]">
          {content}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex items-center flex-wrap gap-2">
            <Button
              type="button"
              variant="primary"
              size="sm"
              disabled={isLoading}
              onClick={handleApplyOrReplace}
            >
              {hasExistingContent ? (
                <>
                  <Replace className="w-3.5 h-3.5 mr-1" />
                  <span>Replace {targetFieldName}</span>
                </>
              ) : (
                <>
                  <ArrowRightCircle className="w-3.5 h-3.5 mr-1" />
                  <span>Apply to {targetFieldName}</span>
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleCopy}
            >
              {copied ? (
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

            {onRegenerate && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={isLoading || regenerateDisabled}
                onClick={onRegenerate}
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1" />
                <span>Regenerate</span>
              </Button>
            )}
          </div>

          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="text-[#777482] hover:text-red-600"
            >
              <X className="w-3.5 h-3.5 mr-1" />
              <span>Cancel</span>
            </Button>
          )}
        </div>
      </div>

      <Dialog
        isOpen={confirmReplaceOpen}
        onClose={() => setConfirmReplaceOpen(false)}
        title={`Replace Existing ${targetFieldName}?`}
        description={`Your ${targetFieldName} already contains content. Do you want to replace it with this AI-generated version? You can also save a Version Snapshot first if you wish.`}
        confirmLabel="Yes, Replace Content"
        cancelLabel="Keep Existing"
        isDestructive={false}
        onConfirm={() => {
          onApply(content);
          setApplied(true);
          setTimeout(() => setApplied(false), 2000);
        }}
      />
    </>
  );
}

