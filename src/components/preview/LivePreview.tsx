"use client";

import React, { useState } from "react";
import { useCVStore } from "@/store/cv-store";
import { AtsClassicTemplate } from "@/components/templates/ats-classic/AtsClassicTemplate";
import { AtsModernTemplate } from "@/components/templates/ats-modern/AtsModernTemplate";
import { AtsMinimalTemplate } from "@/components/templates/ats-minimal/AtsMinimalTemplate";
import { TemplateType } from "@/types/cv";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

export function LivePreview() {
  const { cvData, setTemplate } = useCVStore();
  const [scale, setScale] = useState(0.85); // 0.85 fits standard desktop screens comfortably

  const handleZoomIn = () => setScale((s) => Math.min(Number((s + 0.1).toFixed(2)), 1.3));
  const handleZoomOut = () => setScale((s) => Math.max(Number((s - 0.1).toFixed(2)), 0.5));
  const handleResetZoom = () => setScale(0.85);

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

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Action Bar: Template Switcher & Zoom Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 px-1">
        {/* Template Switcher */}
        <div className="flex items-center gap-1 p-1 bg-[#EAE6DE]/80 rounded-[16px] shadow-inner">
          {templates.map((tpl) => {
            const isSelected = cvData.template === tpl.id;
            return (
              <button
                key={tpl.id}
                type="button"
                onClick={() => setTemplate(tpl.id)}
                className={cn(
                  "px-3 py-1.5 text-xs font-bold rounded-[12px] transition-all cursor-pointer select-none",
                  isSelected
                    ? "bg-white text-[#8B7CF6] shadow-[-2px_-2px_5px_rgba(255,255,255,0.9),2px_2px_5px_rgba(163,157,147,0.2)]"
                    : "text-[#777482] hover:text-[#292735]"
                )}
              >
                {tpl.label}
              </button>
            );
          })}
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1 bg-[#FAF8F5] p-1 rounded-[14px] border border-[rgba(70,65,90,0.08)] shadow-sm text-xs text-[#777482]">
          <button
            type="button"
            onClick={handleZoomOut}
            className="p-1.5 hover:text-[#292735] rounded-[10px] hover:bg-[#EAE6DE]/60 transition-colors cursor-pointer"
            title="Zoom out"
            aria-label="Zoom out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="px-1.5 font-mono text-[11px] font-semibold min-w-[38px] text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            type="button"
            onClick={handleZoomIn}
            className="p-1.5 hover:text-[#292735] rounded-[10px] hover:bg-[#EAE6DE]/60 transition-colors cursor-pointer"
            title="Zoom in"
            aria-label="Zoom in"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          {scale !== 0.85 && (
            <button
              type="button"
              onClick={handleResetZoom}
              className="p-1.5 hover:text-[#292735] rounded-[10px] hover:bg-[#EAE6DE]/60 transition-colors ml-0.5 cursor-pointer"
              title="Reset zoom to 85%"
              aria-label="Reset zoom"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* A4 Container with Physical Dimensions and Transform Scaling */}
      <div className="flex-1 overflow-x-auto overflow-y-visible pb-16 flex justify-center items-start">
        <div
          style={{
            transform: `scale(${scale})`,
            transformOrigin: "top center",
            transition: "transform 0.15s ease-out",
          }}
          className="shrink-0"
        >
          {/* Exact Physical A4 Document Wrapper: 210mm x min 297mm */}
          <div className="cv-paper rounded-[2px] shadow-2xl border border-[rgba(0,0,0,0.12)]">
            {renderTemplate()}
          </div>
        </div>
      </div>
    </div>
  );
}
