"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useCVStore } from "@/store/cv-store";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
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
} from "lucide-react";

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

  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [isSampleDialogOpen, setIsSampleDialogOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      setDownloadError("");
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
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#F4F1EB]/90 border-b border-[rgba(70,65,90,0.06)] px-4 sm:px-6 py-2.5 transition-all">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Left: Back Link, Document Title & Autosave */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="w-10 h-10 rounded-[12px] bg-[#FAF8F5] border border-[rgba(70,65,90,0.08)] flex items-center justify-center text-[#595566] hover:text-[#292735] hover:bg-white transition-all shadow-sm shrink-0"
              title="Return to Home"
              aria-label="Return to Home"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>

            {/* Document Title (Editable) */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={cvData.title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Resume Title"
                aria-label="CV document title"
                className="font-bold text-base sm:text-lg text-[#292735] bg-transparent border-b border-transparent hover:border-[#8B7CF6]/40 focus:border-[#6C5BD8] focus:outline-none transition-colors px-1 py-0.5 max-w-[160px] sm:max-w-[240px]"
                title="Click to rename document"
              />

              {/* Autosave Indicator */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EAE6DE]/70 text-[11px] font-medium text-[#595566] shrink-0">
                {saveStatus === "saving" && (
                  <>
                    <Loader2 className="w-3 h-3 text-[#8B7CF6] animate-spin" />
                    <span>Saving...</span>
                  </>
                )}
                {saveStatus === "saved" && (
                  <>
                    <CheckCircle className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-700">Saved</span>
                  </>
                )}
                {saveStatus === "error" && (
                  <>
                    <AlertCircle className="w-3 h-3 text-red-500" />
                    <span className="text-red-600">Error saving</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right: Language Selector, Template Selector & Action Buttons */}
          <div className="flex items-center flex-wrap gap-2.5 self-end md:self-auto">
            {/* CV Document Language Selector */}
            <div className="flex items-center gap-1 bg-[#FAF8F5] px-2 py-1 rounded-[14px] border border-[rgba(70,65,90,0.08)] shadow-sm">
              <Globe className="w-3.5 h-3.5 text-[#8B7CF6] shrink-0" />
              <select
                value={cvData.language}
                onChange={(e) => setLanguage(e.target.value as CVLanguage)}
                className="bg-transparent text-xs font-semibold text-[#292735] focus:outline-none cursor-pointer pr-1"
                title="CV Document Language (Affects only resume output, not website UI)"
                aria-label="CV Document Language"
              >
                <option value="en">CV: English</option>
                <option value="id">CV: Bahasa Indonesia</option>
              </select>
            </div>

            {/* Template Selector Dropdown */}
            <div className="hidden sm:flex items-center gap-1 bg-[#FAF8F5] px-2 py-1 rounded-[14px] border border-[rgba(70,65,90,0.08)] shadow-sm">
              <LayoutTemplate className="w-3.5 h-3.5 text-[#8B7CF6] shrink-0" />
              <select
                value={cvData.template}
                onChange={(e) => setTemplate(e.target.value as TemplateType)}
                className="bg-transparent text-xs font-semibold text-[#292735] focus:outline-none cursor-pointer pr-1"
                title="ATS Template"
                aria-label="ATS Template"
              >
                <option value="modern">ATS Modern</option>
                <option value="classic">ATS Classic</option>
                <option value="minimal">ATS Minimal</option>
              </select>
            </div>

            {/* Load Sample Data Button */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsSampleDialogOpen(true)}
              className="text-xs text-[#595566] hover:text-[#6C5BD8]"
              title="Fill with sample data for demonstration"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#8B7CF6]" />
              <span className="hidden sm:inline">Load Sample</span>
            </Button>

            {/* Reset CV Button */}
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

            {/* Download PDF Button */}
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleDownload}
              isLoading={isDownloading}
              className="shadow-md"
            >
              <Download className="w-4 h-4" />
              <span>{isDownloading ? "Downloading..." : "Download PDF"}</span>
            </Button>
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
