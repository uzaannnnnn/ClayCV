"use client";

import React, { useEffect, useRef, useState } from "react";
import { useCVStore } from "@/store/cv-store";
import { AtsClassicTemplate } from "@/components/templates/ats-classic/AtsClassicTemplate";
import { AtsModernTemplate } from "@/components/templates/ats-modern/AtsModernTemplate";
import { AtsMinimalTemplate } from "@/components/templates/ats-minimal/AtsMinimalTemplate";
import { TemplateType } from "@/types/cv";
import { ChevronLeft, ChevronRight, Eye, X } from "lucide-react";
import { cn } from "@/lib/utils";

/** Exact CSS pixel dimensions for ISO 216 A4 (210mm x 297mm) at 96 DPI. */
export const A4_WIDTH_PX = 793.7008;
export const A4_HEIGHT_PX = 1122.5197;

export interface LivePreviewProps {
  onClose?: () => void;
  closeButtonRef?: React.RefObject<HTMLButtonElement | null>;
}

export interface DynamicIslandPreviewToggleProps {
  isOpen: boolean;
  isTransitioning: boolean;
  onOpen: () => void;
  buttonRef?: React.RefObject<HTMLButtonElement | null>;
}

/**
 * Floating Dynamic Island toggle anchored on the right side of the CV Builder.
 * Hidden automatically while the preview overlay is open or transitioning.
 */
export function DynamicIslandPreviewToggle({
  isOpen,
  isTransitioning,
  onOpen,
  buttonRef,
}: DynamicIslandPreviewToggleProps) {
  const hidden = isOpen || isTransitioning;

  return (
    <div
      className={cn(
        "fixed right-3.5 sm:right-5 bottom-5 sm:bottom-6 lg:top-1/2 lg:bottom-auto lg:-translate-y-1/2 z-40 transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
        hidden
          ? "opacity-0 translate-x-8 pointer-events-none"
          : "opacity-100 translate-x-0 pointer-events-auto"
      )}
    >
      <button
        ref={buttonRef}
        type="button"
        data-testid="live-preview-toggle"
        aria-label="Open Live A4 Preview"
        aria-expanded={isOpen}
        aria-controls="claycv-live-preview-overlay"
        disabled={hidden}
        tabIndex={hidden ? -1 : 0}
        onClick={onOpen}
        className="min-w-[56px] min-h-[72px] px-2.5 py-2.5 rounded-[24px] bg-[#FAF8F5] border border-[#8B7CF6]/35 shadow-[-6px_-6px_16px_rgba(255,255,255,0.92),6px_8px_22px_rgba(108,91,216,0.22)] hover:shadow-[-8px_-8px_20px_rgba(255,255,255,0.98),8px_10px_26px_rgba(108,91,216,0.30)] hover:-translate-x-0.5 active:translate-y-[1px] active:scale-[0.98] transition-all duration-200 flex flex-col items-center justify-center gap-1.5 select-none cursor-pointer"
      >
        <span className="w-9 h-9 rounded-full clay-btn-primary flex items-center justify-center text-white shadow-sm shrink-0">
          <Eye className="w-4 h-4 shrink-0" aria-hidden="true" />
        </span>
        <span className="text-[11px] font-bold tracking-tight text-[#595566] leading-none whitespace-nowrap">
          Preview
        </span>
      </button>
    </div>
  );
}

/**
 * Full-page fit-to-viewport A4 preview canvas with zero internal scrolling,
 * dynamic scale recalculation, template switching, and multi-page inspection.
 */
export function LivePreview({ onClose, closeButtonRef }: LivePreviewProps) {
  const { cvData, setTemplate } = useCVStore();
  const stageRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(0.55);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const stageEl = stageRef.current;
    if (!stageEl) return;

    const updateScale = () => {
      const style = window.getComputedStyle(stageEl);
      const padX =
        parseFloat(style.paddingLeft || "0") +
        parseFloat(style.paddingRight || "0");
      const padY =
        parseFloat(style.paddingTop || "0") +
        parseFloat(style.paddingBottom || "0");
      const availWidth = Math.max(160, stageEl.clientWidth - padX);
      const availHeight = Math.max(220, stageEl.clientHeight - padY);
      const rawScale = Math.min(
        availWidth / A4_WIDTH_PX,
        availHeight / A4_HEIGHT_PX
      );
      const clamped = Math.min(1.15, Math.max(0.22, rawScale));
      const nextScale = Math.floor(clamped * 10000) / 10000;
      setScale(nextScale);
    };

    updateScale();
    const rafId = window.requestAnimationFrame(updateScale);

    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(updateScale);
      observer.observe(stageEl);
    }
    window.addEventListener("resize", updateScale);

    return () => {
      window.cancelAnimationFrame(rafId);
      observer?.disconnect();
      window.removeEventListener("resize", updateScale);
    };
  }, []);

  useEffect(() => {
    const contentEl = contentRef.current;
    if (!contentEl) return;

    const updatePagination = () => {
      const measuredHeight = contentEl.scrollHeight;
      const pages = Math.max(1, Math.ceil((measuredHeight - 6) / A4_HEIGHT_PX));
      setTotalPages(pages);
    };

    updatePagination();
    const rafId = window.requestAnimationFrame(updatePagination);

    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(updatePagination);
      observer.observe(contentEl);
    }

    return () => {
      window.cancelAnimationFrame(rafId);
      observer?.disconnect();
    };
  }, [cvData, scale]);

  const safePage = Math.min(currentPage, totalPages);

  const templates: { id: TemplateType; label: string }[] = [
    { id: "modern", label: "ATS Modern" },
    { id: "classic", label: "ATS Classic" },
    { id: "minimal", label: "ATS Minimal" },
  ];

  const renderTemplate = () => {
    switch (cvData.template) {
      case "classic":
        return <AtsClassicTemplate data={cvData} />;
      case "minimal":
        return <AtsMinimalTemplate data={cvData} />;
      case "modern":
      default:
        return <AtsModernTemplate data={cvData} />;
    }
  };

  const scaledWidthPx = Math.floor(A4_WIDTH_PX * scale);
  const scaledHeightPx = Math.floor(A4_HEIGHT_PX * scale);

  return (
    <div className="flex flex-col h-full min-h-0 gap-2.5 sm:gap-3">
      {/* Overlay Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-0.5 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EFEAFF] text-[#6C5BD8] border border-[#8B7CF6]/25 text-[11px] font-bold whitespace-nowrap">
            <Eye className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>A4 Live Preview</span>
          </span>
          <span className="px-2 py-1 rounded-[10px] bg-[#FAF8F5] border border-[rgba(70,65,90,0.08)] font-mono text-[11px] font-semibold text-[#595566] whitespace-nowrap">
            {Math.round(scale * 100)}%
          </span>
        </div>

        {/* Dedicated Close Control */}
        {onClose && (
          <button
            ref={closeButtonRef}
            type="button"
            data-testid="live-preview-close"
            onClick={onClose}
            aria-label="Close Live A4 Preview"
            className="min-h-[44px] px-3.5 py-2 rounded-[14px] clay-btn-secondary inline-flex items-center justify-center gap-1.5 text-xs font-bold text-[#292735] hover:text-[#6C5BD8] whitespace-nowrap shrink-0 cursor-pointer"
          >
            <X className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Close</span>
          </button>
        )}
      </div>

      {/* Template Switcher & Multi-Page Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-0.5 shrink-0">
        <div
          role="group"
          aria-label="CV Template Selector"
          className="flex flex-wrap items-center gap-1 p-1 bg-[#EAE6DE]/85 rounded-[14px] shadow-inner"
        >
          {templates.map((tpl) => {
            const isSelected = cvData.template === tpl.id;
            return (
              <button
                key={tpl.id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => setTemplate(tpl.id)}
                className={cn(
                  "min-h-[36px] sm:min-h-[38px] px-2.5 sm:px-3 py-1.5 text-xs font-bold rounded-[11px] transition-all cursor-pointer select-none whitespace-nowrap",
                  isSelected
                    ? "bg-white text-[#6C5BD8] shadow-[-2px_-2px_5px_rgba(255,255,255,0.9),2px_2px_5px_rgba(163,157,147,0.2)]"
                    : "text-[#595566] hover:text-[#292735]"
                )}
              >
                {tpl.label}
              </button>
            );
          })}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center gap-1 bg-[#FAF8F5] p-1 rounded-[12px] border border-[rgba(70,65,90,0.08)] shadow-sm text-xs text-[#595566]">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
              aria-label="Previous A4 page"
              className="min-h-[34px] min-w-[34px] flex items-center justify-center rounded-[9px] hover:bg-[#EAE6DE]/60 disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" aria-hidden="true" />
            </button>
            <span className="px-1.5 font-mono text-[11px] font-semibold text-[#292735] whitespace-nowrap">
              {safePage} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() =>
                setCurrentPage((p) => Math.min(totalPages, p + 1))
              }
              disabled={safePage >= totalPages}
              aria-label="Next A4 page"
              className="min-h-[34px] min-w-[34px] flex items-center justify-center rounded-[9px] hover:bg-[#EAE6DE]/60 disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>

      {/* No-Scroll Fit-to-Viewport A4 Stage */}
      <div
        ref={stageRef}
        data-testid="live-preview-stage"
        className="flex-1 min-h-0 w-full overflow-hidden flex items-center justify-center p-1 sm:p-2 select-none"
      >
        <div
          data-testid="live-preview-a4-box"
          style={{
            width: `${scaledWidthPx}px`,
            height: `${scaledHeightPx}px`,
          }}
          className="relative overflow-hidden rounded-[4px] shadow-[0_14px_34px_rgba(41,39,53,0.16),0_4px_12px_rgba(41,39,53,0.08)] border border-[rgba(70,65,90,0.14)] bg-white shrink-0"
        >
          <div
            style={{
              width: `${A4_WIDTH_PX}px`,
              height: `${A4_HEIGHT_PX}px`,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
            }}
            className="overflow-hidden bg-white"
          >
            <div
              ref={contentRef}
              style={{
                transform:
                  totalPages > 1
                    ? `translateY(-${(safePage - 1) * A4_HEIGHT_PX}px)`
                    : undefined,
              }}
              className="cv-paper cv-document"
            >
              {renderTemplate()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
