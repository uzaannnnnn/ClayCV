"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useCVStore } from "@/store/cv-store";
import { BuilderHeader } from "@/components/builder/BuilderHeader";
import { CVEditor } from "@/components/editor/CVEditor";
import { LivePreview } from "@/components/preview/LivePreview";
import { CVLanguage, TemplateType } from "@/types/cv";
import { Edit3, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

function BuilderContent() {
  const searchParams = useSearchParams();
  const { setTemplate, setLanguage } = useCVStore();
  const [activeMobileTab, setActiveMobileTab] = useState<"edit" | "preview">(
    "edit"
  );

  // Read URL query parameters for template and language
  useEffect(() => {
    const t = searchParams.get("template");
    if (t === "classic" || t === "modern" || t === "minimal") {
      setTemplate(t as TemplateType);
    }
    const l = searchParams.get("lang");
    if (l === "en" || l === "id") {
      setLanguage(l as CVLanguage);
    }
  }, [searchParams, setTemplate, setLanguage]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F1EB]">
      <BuilderHeader />

      {/* Mobile Tab Switcher (< 1024px) */}
      <div className="lg:hidden sticky top-[57px] z-30 bg-[#F4F1EB]/95 backdrop-blur-sm border-b border-[rgba(70,65,90,0.08)] px-4 py-2.5">
        <div className="grid grid-cols-2 gap-2 p-1 bg-[#EAE6DE]/80 rounded-[16px] shadow-inner max-w-sm mx-auto">
          <button
            type="button"
            onClick={() => setActiveMobileTab("edit")}
            className={cn(
              "flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-[12px] transition-all cursor-pointer select-none",
              activeMobileTab === "edit"
                ? "bg-white text-[#8B7CF6] shadow-[-2px_-2px_5px_rgba(255,255,255,0.9),2px_2px_5px_rgba(163,157,147,0.2)]"
                : "text-[#777482] hover:text-[#292735]"
            )}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Information</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMobileTab("preview")}
            className={cn(
              "flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-[12px] transition-all cursor-pointer select-none",
              activeMobileTab === "preview"
                ? "bg-white text-[#8B7CF6] shadow-[-2px_-2px_5px_rgba(255,255,255,0.9),2px_2px_5px_rgba(163,157,147,0.2)]"
                : "text-[#777482] hover:text-[#292735]"
            )}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Live A4 Preview</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Desktop Two-Column Layout */}
        <div className="hidden lg:grid lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Form Editor & Section Ordering (45%) */}
          <div className="lg:col-span-5 xl:col-span-5 h-full overflow-y-auto pr-1">
            <CVEditor />
          </div>

          {/* Right Column: Sticky Live A4 Preview (55%) */}
          <div className="lg:col-span-7 xl:col-span-7 sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pl-1">
            <LivePreview />
          </div>
        </div>

        {/* Mobile / Tablet Tabbed View */}
        <div className="lg:hidden">
          {activeMobileTab === "edit" ? (
            <div className="animate-in fade-in duration-150">
              <CVEditor />
            </div>
          ) : (
            <div className="animate-in fade-in duration-150">
              <LivePreview />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function BuilderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F4F1EB] text-sm text-[#777482]">
          Loading ClayCV Builder...
        </div>
      }
    >
      <BuilderContent />
    </Suspense>
  );
}
