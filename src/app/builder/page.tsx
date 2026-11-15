"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useCVStore, WorkspaceTab } from "@/store/cv-store";
import { BuilderHeader } from "@/components/builder/BuilderHeader";
import { CVEditor } from "@/components/editor/CVEditor";
import { LivePreview } from "@/components/preview/LivePreview";
import { AIWritingWorkspace } from "@/components/ai/AIWritingWorkspace";
import { JobMatcherWorkspace } from "@/components/ai/JobMatcherWorkspace";
import { ATSAnalyzerWorkspace } from "@/components/ai/ATSAnalyzerWorkspace";
import { CareerAssistantWorkspace } from "@/components/ai/CareerAssistantWorkspace";
import { PlatformManagerWorkspace } from "@/components/ai/PlatformManagerWorkspace";
import { AIPrivacyConsentModal } from "@/components/ai/AIPrivacyConsentBanner";
import { CVLanguage, TemplateType } from "@/types/cv";
import {
  Edit3,
  Eye,
  Sparkles,
  Target,
  ShieldCheck,
  Briefcase,
  FolderKanban,
} from "lucide-react";
import { cn } from "@/lib/utils";

const WORKSPACE_NAV_ITEMS: Array<{
  id: WorkspaceTab;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
}> = [
  {
    id: "builder",
    label: "CV Builder",
    shortLabel: "Builder",
    icon: Edit3,
  },
  {
    id: "writing",
    label: "AI Writing Assistant",
    shortLabel: "AI Writer",
    icon: Sparkles,
  },
  {
    id: "matcher",
    label: "Job Matcher",
    shortLabel: "Matcher",
    icon: Target,
  },
  {
    id: "analyzer",
    label: "CV Analyzer",
    shortLabel: "Analyzer",
    icon: ShieldCheck,
  },
  {
    id: "career",
    label: "Career Assistant",
    shortLabel: "Career",
    icon: Briefcase,
  },
  {
    id: "platform",
    label: "Profiles & Storage",
    shortLabel: "Profiles",
    icon: FolderKanban,
  },
];

function BuilderContent() {
  const searchParams = useSearchParams();
  const {
    hasHydrated,
    aiConsentAccepted,
    consentModalDismissed,
    openConsentModal,
    setTemplate,
    setLanguage,
    activeWorkspace,
    setActiveWorkspace,
  } = useCVStore();
  const [activeMobileTab, setActiveMobileTab] = useState<"edit" | "preview">(
    "edit"
  );

  useEffect(() => {
    if (
      hasHydrated &&
      !aiConsentAccepted &&
      !consentModalDismissed &&
      (activeWorkspace === "writing" ||
        activeWorkspace === "matcher" ||
        activeWorkspace === "career")
    ) {
      openConsentModal();
    }
  }, [
    hasHydrated,
    aiConsentAccepted,
    consentModalDismissed,
    activeWorkspace,
    openConsentModal,
  ]);

  // Read URL query parameters for template, language, and optional workspace tab
  useEffect(() => {
    const t = searchParams.get("template");
    if (t === "classic" || t === "modern" || t === "minimal") {
      setTemplate(t as TemplateType);
    }
    const l = searchParams.get("lang");
    if (l === "en" || l === "id") {
      setLanguage(l as CVLanguage);
    }
    const ws = searchParams.get("tab");
    if (
      ws === "builder" ||
      ws === "writing" ||
      ws === "matcher" ||
      ws === "analyzer" ||
      ws === "career" ||
      ws === "platform"
    ) {
      setActiveWorkspace(ws);
    }
  }, [searchParams, setTemplate, setLanguage, setActiveWorkspace]);

  const renderActiveWorkspace = () => {
    switch (activeWorkspace) {
      case "writing":
        return <AIWritingWorkspace />;
      case "matcher":
        return <JobMatcherWorkspace />;
      case "analyzer":
        return <ATSAnalyzerWorkspace />;
      case "career":
        return <CareerAssistantWorkspace />;
      case "platform":
        return <PlatformManagerWorkspace />;
      case "builder":
      default:
        return <CVEditor />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F1EB]">
      <BuilderHeader />
      <AIPrivacyConsentModal />

      {/* Integrated ClayCV AI Workspace Navigation Bar */}
      <nav
        aria-label="ClayCV Workspace Navigation"
        className="sticky top-[57px] z-30 bg-[#F4F1EB]/95 backdrop-blur-sm border-b border-[rgba(70,65,90,0.08)] px-4 sm:px-6 py-2.5"
      >
        <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5">
          {/* Primary Workspace Modules */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 no-scrollbar">
            {WORKSPACE_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isSelected = activeWorkspace === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveWorkspace(item.id);
                    setActiveMobileTab("edit");
                  }}
                  className={cn(
                    "min-h-[40px] flex items-center gap-1.5 px-3.5 py-2 rounded-[14px] text-xs font-bold whitespace-nowrap transition-all cursor-pointer select-none",
                    isSelected
                      ? "bg-white text-[#6C5BD8] shadow-[-2px_-2px_6px_rgba(255,255,255,0.95),2px_2px_6px_rgba(163,157,147,0.22)] border border-[#8B7CF6]/30"
                      : "text-[#595566] hover:text-[#292735] hover:bg-white/70"
                  )}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden md:inline">{item.label}</span>
                  <span className="md:hidden">{item.shortLabel}</span>
                </button>
              );
            })}
          </div>

          {/* Mobile Edit / Live Preview Switcher (< 1024px) */}
          <div className="lg:hidden shrink-0 grid grid-cols-2 gap-1.5 p-1 bg-[#EAE6DE]/80 rounded-[14px] shadow-inner">
            <button
              type="button"
              onClick={() => setActiveMobileTab("edit")}
              className={cn(
                "min-h-[40px] flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold whitespace-nowrap rounded-[10px] transition-all cursor-pointer select-none",
                activeMobileTab === "edit"
                  ? "bg-white text-[#6C5BD8] shadow-sm"
                  : "text-[#595566] hover:text-[#292735]"
              )}
            >
              <Edit3 className="w-3.5 h-3.5 shrink-0" />
              <span>Workspace</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveMobileTab("preview")}
              className={cn(
                "min-h-[40px] flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold whitespace-nowrap rounded-[10px] transition-all cursor-pointer select-none",
                activeMobileTab === "preview"
                  ? "bg-white text-[#6C5BD8] shadow-sm"
                  : "text-[#595566] hover:text-[#292735]"
              )}
            >
              <Eye className="w-3.5 h-3.5 shrink-0" />
              <span>Live A4 Preview</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Desktop Two-Column Layout */}
        <div className="hidden lg:grid lg:grid-cols-12 gap-7 items-start">
          {/* Left Column: Active Workspace (CV Editor or AI Modules) */}
          <div className="lg:col-span-6 2xl:col-span-5">
            {renderActiveWorkspace()}
          </div>

          {/* Right Column: Sticky Live A4 Preview */}
          <div className="lg:col-span-6 2xl:col-span-7 sticky top-28 max-h-[calc(100vh-7.5rem)] overflow-y-auto pl-1">
            <LivePreview />
          </div>
        </div>

        {/* Mobile / Tablet Tabbed View */}
        <div className="lg:hidden">
          {activeMobileTab === "edit" ? (
            <div className="animate-in fade-in duration-150 p-1 sm:p-2">
              {renderActiveWorkspace()}
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
        <div className="min-h-screen flex items-center justify-center bg-[#F4F1EB] text-sm text-[#595566]">
          Loading ClayCV Platform...
        </div>
      }
    >
      <BuilderContent />
    </Suspense>
  );
}
