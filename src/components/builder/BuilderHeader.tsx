"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useCVStore } from "@/store/cv-store";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Select, computeDropdownPosition } from "@/components/ui/select";
import { downloadCvPdf } from "@/lib/pdf/download";
import { CVLanguage, TemplateType } from "@/types/cv";
import {
  ArrowLeft,
  Download,
  RotateCcw,
  CheckCircle,
  Loader2,
  AlertCircle,
  Sparkles,
  Globe,
  LayoutTemplate,
  MoreHorizontal,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

const MOBILE_TEMPLATE_CHOICES: Array<{ id: TemplateType; label: string }> = [
  { id: "modern", label: "ATS Modern" },
  { id: "classic", label: "ATS Classic" },
  { id: "minimal", label: "ATS Minimal" },
];

export function BuilderHeader() {
  const {
    cvData,
    saveStatus,
    setTitle,
    setLanguage,
    setTemplate,
    resetCV,
    loadSampleData,
  } = useCVStore();

  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [isSampleDialogOpen, setIsSampleDialogOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

  const computeMobileMenuPos = () => {
    const btn = document.getElementById("mobile-header-more-btn");
    if (!btn || typeof window === "undefined") return null;
    const rect = btn.getBoundingClientRect();
    const desiredWidth = Math.min(236, window.innerWidth - 20);
    const pos = computeDropdownPosition(
      {
        top: rect.top,
        bottom: rect.bottom,
        left: rect.right - desiredWidth,
        right: rect.right,
        width: desiredWidth,
        height: rect.height,
      },
      { width: window.innerWidth, height: window.innerHeight },
      { minMenuWidth: desiredWidth }
    );
    return {
      top: pos.top ?? rect.bottom + 6,
      left: pos.left,
      width: pos.width,
    };
  };

  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      const triggerEl = document.getElementById("mobile-header-more-btn");
      const menuEl = document.getElementById("mobile-header-more-menu");
      if (triggerEl?.contains(target) || menuEl?.contains(target)) {
        return;
      }
      setIsMobileMenuOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setIsMobileMenuOpen(false);
        document.getElementById("mobile-header-more-btn")?.focus();
      }
    };

    const handleViewportChange = () => {
      if (window.innerWidth >= 640) {
        setIsMobileMenuOpen(false);
        return;
      }
      const nextPos = computeMobileMenuPos();
      if (nextPos) setMenuPosition(nextPos);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown, {
      passive: true,
    });
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleViewportChange);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleViewportChange);
    };
  }, [isMobileMenuOpen]);

  const toggleMobileMenu = () => {
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
      return;
    }
    const nextPos = computeMobileMenuPos();
    if (nextPos) setMenuPosition(nextPos);
    setIsMobileMenuOpen(true);
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    setDownloadError("");
    try {
      await downloadCvPdf(cvData);
    } catch (err) {
      console.error("PDF generation error:", err);
      setDownloadError("Failed to generate PDF. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#F4F1EB]/90 border-b border-[rgba(70,65,90,0.06)] px-3.5 sm:px-6 pt-[max(0.55rem,env(safe-area-inset-top,0px))] pb-2.5 sm:py-2.5 transition-all">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-2 sm:gap-2.5 lg:gap-3">
          {/* Left: Back Link, Document Title & Compact Save Status */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Link
              href="/"
              className="w-10 h-10 rounded-[12px] bg-[#FAF8F5] border border-[rgba(70,65,90,0.08)] flex items-center justify-center text-[#595566] hover:text-[#292735] hover:bg-white transition-all shadow-sm shrink-0"
              title="Return to Home"
              aria-label="Return to Home"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            </Link>

            <div className="flex items-center gap-2 min-w-0 flex-1 lg:flex-initial">
              <input
                type="text"
                value={cvData.title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Resume Title"
                aria-label="CV document title"
                className="font-bold text-sm sm:text-lg text-[#292735] bg-transparent border-b border-transparent hover:border-[#8B7CF6]/40 focus:border-[#6C5BD8] focus:outline-none transition-colors px-1 py-0.5 w-full min-w-0 sm:max-w-[220px]"
                title="Click to rename document"
              />

              {/* Autosave Indicator (icon-compact on < 640px, full text on sm+) */}
              <div
                aria-label={
                  saveStatus === "saving"
                    ? "Saving CV"
                    : saveStatus === "saved"
                    ? "CV saved"
                    : "Error saving CV"
                }
                className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-full bg-[#EAE6DE]/75 text-[11px] font-medium text-[#595566] shrink-0"
              >
                {saveStatus === "saving" && (
                  <>
                    <Loader2 className="w-3.5 h-3.5 sm:w-3 sm:h-3 text-[#8B7CF6] animate-spin" aria-hidden="true" />
                    <span className="hidden sm:inline">Saving...</span>
                  </>
                )}
                {saveStatus === "saved" && (
                  <>
                    <CheckCircle className="w-3.5 h-3.5 sm:w-3 sm:h-3 text-emerald-600" aria-hidden="true" />
                    <span className="hidden sm:inline text-emerald-700">Saved</span>
                  </>
                )}
                {saveStatus === "error" && (
                  <>
                    <AlertCircle className="w-3.5 h-3.5 sm:w-3 sm:h-3 text-red-500" aria-hidden="true" />
                    <span className="hidden sm:inline text-red-600">Error saving</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right: Language Selector, Desktop Secondary Actions, Mobile More Menu & Download PDF */}
          <div className="flex items-center justify-between sm:justify-end flex-wrap sm:flex-nowrap gap-2 sm:gap-2.5 w-full sm:w-auto lg:self-auto">
            {/* CV Document Language Selector */}
            <Select
              id="builder-cv-language"
              variant="header"
              value={cvData.language}
              onChange={(val) => setLanguage(val as CVLanguage)}
              triggerIcon={<Globe className="w-3.5 h-3.5 text-[#8B7CF6]" aria-hidden="true" />}
              ariaLabel="CV Document Language"
              title="CV Document Language (Affects only resume output, not website UI)"
              minMenuWidth={210}
              options={[
                { value: "en", label: "CV: English" },
                { value: "id", label: "CV: Bahasa Indonesia" },
              ]}
            />

            {/* Tablet & Desktop Secondary Controls (sm+) */}
            <div className="hidden sm:flex items-center gap-2.5">
              <Select
                id="builder-ats-template"
                variant="header"
                value={cvData.template}
                onChange={(val) => setTemplate(val as TemplateType)}
                triggerIcon={
                  <LayoutTemplate className="w-3.5 h-3.5 text-[#8B7CF6]" aria-hidden="true" />
                }
                ariaLabel="ATS Template"
                title="ATS Template"
                minMenuWidth={168}
                options={[
                  { value: "modern", label: "ATS Modern" },
                  { value: "classic", label: "ATS Classic" },
                  { value: "minimal", label: "ATS Minimal" },
                ]}
              />

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsSampleDialogOpen(true)}
                className="text-xs text-[#595566] hover:text-[#6C5BD8]"
                title="Fill with sample data for demonstration"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#8B7CF6]" />
                <span>Load Sample</span>
              </Button>

              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => setIsResetDialogOpen(true)}
                className="text-xs"
                title="Clear all fields"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </Button>
            </div>

            {/* Mobile Primary + More Actions Group */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                id="mobile-header-more-btn"
                type="button"
                data-testid="mobile-header-actions-trigger"
                aria-label="More resume actions"
                aria-haspopup="menu"
                aria-expanded={isMobileMenuOpen}
                onClick={toggleMobileMenu}
                className={cn(
                  "sm:hidden w-10 h-[38px] rounded-[14px] bg-[#FAF8F5] border border-[rgba(70,65,90,0.1)] flex items-center justify-center text-[#595566] hover:text-[#292735] hover:bg-white shadow-[-3px_-3px_8px_rgba(255,255,255,0.9),3px_3px_8px_rgba(163,157,147,0.16)] transition-all cursor-pointer shrink-0",
                  isMobileMenuOpen && "border-[#8B7CF6] text-[#6C5BD8] bg-white"
                )}
                title="Template, sample data & reset"
              >
                <MoreHorizontal className="w-4 h-4" aria-hidden="true" />
              </button>

              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleDownload}
                isLoading={isDownloading}
                className="shadow-md min-h-[38px]"
              >
                <Download className="w-4 h-4" />
                <span>{isDownloading ? "Downloading..." : "Download PDF"}</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Download Error Banner */}
        {downloadError && (
          <div className="mt-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-[10px] px-3 py-1.5 max-w-7xl mx-auto flex items-center justify-between">
            <span>{downloadError}</span>
            <button
              onClick={() => setDownloadError("")}
              className="font-bold underline ml-2 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}
      </header>

      {/* Mobile Header Overflow Menu Portal (< 640px) */}
      {isMobileMenuOpen &&
        menuPosition &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            id="mobile-header-more-menu"
            data-testid="mobile-header-actions-menu"
            role="menu"
            aria-label="More resume actions"
            style={{
              position: "fixed",
              top: `${menuPosition.top}px`,
              left: `${menuPosition.left}px`,
              width: `${menuPosition.width}px`,
              zIndex: 80,
            }}
            className="clay-select-menu p-2 space-y-1.5"
          >
            <div className="px-2 pt-1 pb-0.5 text-[10px] font-bold uppercase tracking-wider text-[#595566]">
              ATS Template
            </div>
            <div className="space-y-0.5">
              {MOBILE_TEMPLATE_CHOICES.map((tpl) => {
                const isSelected = cvData.template === tpl.id;
                return (
                  <button
                    key={tpl.id}
                    type="button"
                    role="menuitemradio"
                    aria-checked={isSelected}
                    onClick={() => {
                      setTemplate(tpl.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={cn(
                      "w-full min-h-[40px] px-2.5 py-1.5 rounded-[11px] text-xs font-medium flex items-center justify-between text-left transition-colors cursor-pointer",
                      isSelected
                        ? "bg-[#E8E3FF] text-[#5342B8] font-bold"
                        : "text-[#292735] hover:bg-[#EFECE6]"
                    )}
                  >
                    <span>{tpl.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#5342B8]" aria-hidden="true" />}
                  </button>
                );
              })}
            </div>

            <div className="border-t border-[rgba(70,65,90,0.08)] pt-1.5 space-y-1">
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsSampleDialogOpen(true);
                }}
                className="w-full min-h-[40px] px-2.5 py-1.5 rounded-[11px] text-xs font-semibold text-[#292735] hover:bg-[#EFECE6] flex items-center gap-2 text-left cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#6C5BD8]" aria-hidden="true" />
                <span>Load Sample Resume</span>
              </button>

              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsResetDialogOpen(true);
                }}
                className="w-full min-h-[40px] px-2.5 py-1.5 rounded-[11px] text-xs font-semibold text-[#B91C1C] hover:bg-[#FEECEB] flex items-center gap-2 text-left cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Reset CV</span>
              </button>
            </div>
          </div>,
          document.body
        )}

      {/* Confirmation Dialog: Reset CV */}
      <Dialog
        isOpen={isResetDialogOpen}
        onClose={() => setIsResetDialogOpen(false)}
        title="Reset CV Content?"
        description="Are you sure you want to clear this CV? All personal details, work history, education, skills, projects, and certifications will be permanently removed. This action cannot be undone."
        confirmLabel="Yes, Clear Everything"
        cancelLabel="Cancel"
        isDestructive={true}
        onConfirm={resetCV}
      />

      {/* Confirmation Dialog: Load Sample Data */}
      <Dialog
        isOpen={isSampleDialogOpen}
        onClose={() => setIsSampleDialogOpen(false)}
        title="Load Sample Resume?"
        description="This will populate the builder with an example Senior Software Engineer resume to help you test templates, Indonesian/English language switching, and section reordering."
        confirmLabel="Load Example"
        cancelLabel="Cancel"
        isDestructive={false}
        onConfirm={loadSampleData}
      />
    </>
  );
}
