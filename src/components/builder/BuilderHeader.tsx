"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useCVStore } from "@/store/cv-store";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { downloadCvPdf } from "@/lib/pdf/download";
import {
  ArrowLeft,
  Download,
  RotateCcw,
  CheckCircle,
  Loader2,
  AlertCircle,
  Sparkles,
} from "lucide-react";

export function BuilderHeader() {
  const { cvData, saveStatus, setTitle, resetCV, loadSampleData } =
    useCVStore();

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
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#F4F1EB]/90 border-b border-[rgba(70,65,90,0.06)] px-4 sm:px-6 py-3 transition-all">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Left: Back Link & Document Title */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="w-9 h-9 rounded-[12px] bg-[#FAF8F5] border border-[rgba(70,65,90,0.08)] flex items-center justify-center text-[#777482] hover:text-[#292735] hover:bg-white transition-all shadow-sm shrink-0"
              title="Return to Home"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>

            {/* Document Title (Editable) */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={cvData.title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Resume Document Title"
                className="font-bold text-base sm:text-lg text-[#292735] bg-transparent border-b border-transparent hover:border-[#8B7CF6]/40 focus:border-[#8B7CF6] focus:outline-none transition-colors px-1 py-0.5 max-w-[200px] sm:max-w-[280px]"
                title="Click to rename document"
              />

              {/* Autosave Indicator */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EAE6DE]/70 text-[11px] font-medium text-[#777482] shrink-0">
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

          {/* Right: Actions (Load Sample, Reset, Download PDF) */}
          <div className="flex items-center gap-2.5 self-end md:self-auto">
            {/* Load Sample Data Button */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsSampleDialogOpen(true)}
              className="text-xs text-[#777482] hover:text-[#8B7CF6]"
              title="Fill with sample data for demonstration"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1 text-[#8B7CF6]" />
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
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
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
              <Download className="w-4 h-4 mr-1.5" />
              <span>Download PDF</span>
            </Button>
          </div>
        </div>

        {/* Download Error Banner */}
        {downloadError && (
          <div className="mt-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-[10px] px-3 py-1.5 max-w-7xl mx-auto flex items-center justify-between">
            <span>{downloadError}</span>
            <button
              onClick={() => setDownloadError("")}
              className="font-bold underline ml-2"
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
        description="Are you sure you want to clear this CV? All personal details, work history, education, skills, and projects will be permanently removed. This action cannot be undone."
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
        description="This will populate the builder with an example Senior Product Designer resume to help you explore templates and formatting. Any unsaved current data will be replaced."
        confirmLabel="Load Example"
        cancelLabel="Cancel"
        isDestructive={false}
        onConfirm={loadSampleData}
      />
    </>
  );
}
