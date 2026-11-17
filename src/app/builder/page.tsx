"use client";

import React, { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { createPortal } from "react-dom";
import { useSearchParams } from "next/navigation";
import { useCVStore, WorkspaceTab } from "@/store/cv-store";
import { BuilderHeader } from "@/components/builder/BuilderHeader";
import {
  MobileWorkspaceTrigger,
  WorkspaceSidebar,
} from "@/components/builder/WorkspaceSidebar";
import { CVEditor } from "@/components/editor/CVEditor";
import {
  DynamicIslandPreviewToggle,
  LivePreview,
} from "@/components/preview/LivePreview";
import { AIWritingWorkspace } from "@/components/ai/AIWritingWorkspace";
import { JobMatcherWorkspace } from "@/components/ai/JobMatcherWorkspace";
import { ATSAnalyzerWorkspace } from "@/components/ai/ATSAnalyzerWorkspace";
import { CareerAssistantWorkspace } from "@/components/ai/CareerAssistantWorkspace";
import { PlatformManagerWorkspace } from "@/components/ai/PlatformManagerWorkspace";
import { AIPrivacyConsentModal } from "@/components/ai/AIPrivacyConsentBanner";
import { CVLanguage, TemplateType } from "@/types/cv";
import { cn } from "@/lib/utils";

type OverlayPhase = "closed" | "opening" | "open" | "closing";

const OVERLAY_EXIT_DURATION_MS = 400;
const DRAWER_EXIT_DURATION_MS = 300;

function BuilderContent() {
  const searchParams = useSearchParams();
  const {
    hasHydrated,
    aiConsentAccepted,
    consentModalDismissed,
    isConsentModalOpen,
    openConsentModal,
    setTemplate,
    setLanguage,
    activeWorkspace,
    setActiveWorkspace,
  } = useCVStore();

  const [previewPhase, setPreviewPhase] = useState<OverlayPhase>("closed");
  const toggleButtonRef = useRef<HTMLButtonElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const animTimerRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  const [drawerPhase, setDrawerPhase] = useState<OverlayPhase>("closed");
  const mobileMenuTriggerRef = useRef<HTMLButtonElement | null>(null);
  const mobileDrawerCloseRef = useRef<HTMLButtonElement | null>(null);
  const drawerTimerRef = useRef<number | null>(null);
  const drawerRafRef = useRef<number | null>(null);

  const clearTransitionHandles = useCallback(() => {
    if (animTimerRef.current !== null) {
      window.clearTimeout(animTimerRef.current);
      animTimerRef.current = null;
    }
    if (rafRef.current !== null) {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const clearDrawerHandles = useCallback(() => {
    if (drawerTimerRef.current !== null) {
      window.clearTimeout(drawerTimerRef.current);
      drawerTimerRef.current = null;
    }
    if (drawerRafRef.current !== null) {
      window.cancelAnimationFrame(drawerRafRef.current);
      drawerRafRef.current = null;
    }
  }, []);

  const openPreview = useCallback(() => {
    if (previewPhase === "open" || previewPhase === "opening") {
      return;
    }
    clearTransitionHandles();

    if (previewPhase === "closing") {
      setPreviewPhase("open");
      rafRef.current = window.requestAnimationFrame(() => {
        closeButtonRef.current?.focus({ preventScroll: true });
      });
      return;
    }

    setPreviewPhase("opening");
    rafRef.current = window.requestAnimationFrame(() => {
      rafRef.current = window.requestAnimationFrame(() => {
        setPreviewPhase("open");
        closeButtonRef.current?.focus({ preventScroll: true });
      });
    });
  }, [previewPhase, clearTransitionHandles]);

  const closePreview = useCallback(() => {
    if (previewPhase === "closed" || previewPhase === "closing") {
      return;
    }
    clearTransitionHandles();
    setPreviewPhase("closing");

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const exitMs = prefersReducedMotion ? 20 : OVERLAY_EXIT_DURATION_MS;

    animTimerRef.current = window.setTimeout(() => {
      animTimerRef.current = null;
      setPreviewPhase("closed");
      toggleButtonRef.current?.focus({ preventScroll: true });
    }, exitMs);
  }, [previewPhase, clearTransitionHandles]);

  const openDrawer = useCallback(() => {
    if (drawerPhase === "open" || drawerPhase === "opening") {
      return;
    }
    clearDrawerHandles();

    if (drawerPhase === "closing") {
      setDrawerPhase("open");
      drawerRafRef.current = window.requestAnimationFrame(() => {
        mobileDrawerCloseRef.current?.focus({ preventScroll: true });
      });
      return;
    }

    setDrawerPhase("opening");
    drawerRafRef.current = window.requestAnimationFrame(() => {
      drawerRafRef.current = window.requestAnimationFrame(() => {
        setDrawerPhase("open");
        mobileDrawerCloseRef.current?.focus({ preventScroll: true });
      });
    });
  }, [drawerPhase, clearDrawerHandles]);

  const closeDrawer = useCallback(() => {
    if (drawerPhase === "closed" || drawerPhase === "closing") {
      return;
    }
    clearDrawerHandles();
    setDrawerPhase("closing");

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const exitMs = prefersReducedMotion ? 20 : DRAWER_EXIT_DURATION_MS;

    drawerTimerRef.current = window.setTimeout(() => {
      drawerTimerRef.current = null;
      setDrawerPhase("closed");
      mobileMenuTriggerRef.current?.focus({ preventScroll: true });
    }, exitMs);
  }, [drawerPhase, clearDrawerHandles]);

  const handleSelectWorkspace = useCallback(
    (workspace: WorkspaceTab) => {
      setActiveWorkspace(workspace);
      if (drawerPhase === "open" || drawerPhase === "opening") {
        closeDrawer();
      }
    },
    [setActiveWorkspace, drawerPhase, closeDrawer]
  );

  useEffect(() => {
    return () => {
      clearTransitionHandles();
      clearDrawerHandles();
    };
  }, [clearTransitionHandles, clearDrawerHandles]);

  useEffect(() => {
    const isPreviewActive =
      previewPhase === "open" || previewPhase === "opening";
    const isDrawerActive =
      drawerPhase === "open" || drawerPhase === "opening";
    if (!isPreviewActive && !isDrawerActive) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || isConsentModalOpen) return;
      if (isPreviewActive) {
        event.preventDefault();
        closePreview();
      } else if (isDrawerActive) {
        event.preventDefault();
        closeDrawer();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    previewPhase,
    drawerPhase,
    isConsentModalOpen,
    closePreview,
    closeDrawer,
  ]);

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

  const isPreviewRendered = previewPhase !== "closed";
  const isPreviewTransitioning =
    previewPhase === "opening" || previewPhase === "closing";
  const isDrawerRendered = drawerPhase !== "closed";

  return (
    <div className="min-h-dvh flex flex-col bg-[#F4F1EB]">
      <BuilderHeader />
      <AIPrivacyConsentModal />

      {/* Main Builder Shell: Persistent Left Vertical Sidebar + Workspace Content */}
      <div className="flex-1 w-full max-w-[1600px] mx-auto px-3.5 sm:px-6 pt-3 md:pt-6 pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] lg:pb-6 flex flex-col md:flex-row items-stretch md:items-start gap-3 md:gap-5 lg:gap-7">
        {/* Persistent Left Vertical Sidebar (Tablet & Desktop) */}
        <aside
          data-testid="workspace-sidebar"
          aria-label="ClayCV Workspace Sidebar"
          className="hidden md:block w-[184px] lg:w-[248px] shrink-0 sticky top-[116px] lg:top-[84px] z-20"
        >
          <WorkspaceSidebar
            activeWorkspace={activeWorkspace}
            onSelectWorkspace={handleSelectWorkspace}
            variant="rail"
          />
        </aside>

        {/* Mobile Drawer Trigger (< 768px) */}
        <MobileWorkspaceTrigger
          activeWorkspace={activeWorkspace}
          isOpen={isDrawerRendered}
          onOpen={openDrawer}
          buttonRef={mobileMenuTriggerRef}
        />

        {/* Workspace Content Column (reserves right gutter on lg+ for vertical preview toggle) */}
        <main className="flex-1 min-w-0 flex justify-center lg:pr-20">
          <div className="w-full max-w-[820px]">{renderActiveWorkspace()}</div>
        </main>
      </div>

      {/* Floating Right-Side Vertical Dynamic Island Preview Toggle */}
      <DynamicIslandPreviewToggle
        isOpen={isPreviewRendered}
        isTransitioning={isPreviewTransitioning}
        onOpen={openPreview}
        buttonRef={toggleButtonRef}
      />

      {/* Mobile Left Slide-Out Workspace Drawer Portal (< 768px) */}
      {isDrawerRendered &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            id="claycv-mobile-sidebar"
            data-testid="mobile-sidebar-drawer"
            data-state={drawerPhase}
            role="dialog"
            aria-modal="true"
            aria-label="Workspace navigation"
            className="fixed inset-0 z-50 overflow-hidden md:hidden"
          >
            <div
              onClick={closeDrawer}
              aria-hidden="true"
              className={cn(
                "absolute inset-0 bg-[#292735]/20 backdrop-blur-[2px] transition-opacity duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                drawerPhase === "open" ? "opacity-100" : "opacity-0"
              )}
            />
            <div
              data-testid="mobile-sidebar-panel"
              style={{
                transform:
                  drawerPhase === "open"
                    ? "translate3d(0%, 0, 0)"
                    : "translate3d(-105%, 0, 0)",
                opacity: drawerPhase === "open" ? 1 : 0,
              }}
              className="absolute inset-y-2 left-2 w-[min(84vw,280px)] clay-panel bg-[#F7F5F0] border border-[rgba(108,91,216,0.2)] shadow-[12px_0_32px_rgba(41,39,53,0.18)] p-4 overflow-y-auto transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-[transform,opacity]"
            >
              <WorkspaceSidebar
                activeWorkspace={activeWorkspace}
                onSelectWorkspace={handleSelectWorkspace}
                variant="drawer"
                onCloseDrawer={closeDrawer}
                closeButtonRef={mobileDrawerCloseRef}
              />
            </div>
          </div>,
          document.body
        )}

      {/* Top-Layer Dynamic Island Live Preview Portal Overlay */}
      {isPreviewRendered &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            id="claycv-live-preview-overlay"
            data-testid="live-preview-overlay"
            data-state={previewPhase}
            role="dialog"
            aria-modal="false"
            aria-label="Live A4 CV Preview"
            className="fixed inset-0 z-50 overflow-hidden pointer-events-auto"
          >
            {/* Subtle Backdrop Separation */}
            <div
              onClick={closePreview}
              aria-hidden="true"
              className={cn(
                "absolute inset-0 bg-[#292735]/20 backdrop-blur-[2px] transition-opacity duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
                previewPhase === "open" ? "opacity-100" : "opacity-0"
              )}
            />

            {/* Sliding Right-Side Claymorphic Preview Panel */}
            <div
              data-testid="live-preview-panel"
              style={{
                transform:
                  previewPhase === "open"
                    ? "translate3d(0%, 0, 0)"
                    : "translate3d(105%, 0, 0)",
                opacity: previewPhase === "open" ? 1 : 0,
              }}
              className="absolute inset-2 sm:inset-auto sm:top-3 sm:bottom-3 sm:right-3 sm:w-[min(92vw,700px)] lg:w-[min(56vw,760px)] clay-panel bg-[#F4F1EB] border border-[rgba(108,91,216,0.22)] shadow-[-16px_0_40px_rgba(41,39,53,0.18),-4px_-4px_16px_rgba(255,255,255,0.9)] flex flex-col p-3 sm:p-5 overflow-hidden transition-[transform,opacity] duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-[transform,opacity]"
            >
              <LivePreview
                onClose={closePreview}
                closeButtonRef={closeButtonRef}
              />
            </div>
          </div>,
          document.body
        )}
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
