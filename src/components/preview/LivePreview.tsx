"use client";

import React, { useState } from "react";
import { useCVStore } from "@/store/cv-store";
import { ModernTemplate } from "@/components/templates/ModernTemplate";
import { ClassicTemplate } from "@/components/templates/ClassicTemplate";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

export function LivePreview() {
  const { cvData, setTemplate } = useCVStore();
  const [scale, setScale] = useState(1);

  const handleZoomIn = () => setScale((s) => Math.min(s + 0.1, 1.3));
  const handleZoomOut = () => setScale((s) => Math.max(s - 0.1, 0.7));
  const handleResetZoom = () => setScale(1);

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Preview Action Bar (Template Toggle & Zoom Controls) */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        {/* Template Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-[#EAE6DE]/70 rounded-[16px] shadow-inner">
          <button
            type="button"
            onClick={() => setTemplate("modern")}
            className={cn(
              "px-3.5 py-1.5 text-xs font-semibold rounded-[12px] transition-all cursor-pointer",
              cvData.template === "modern"
                ? "bg-white text-[#8B7CF6] shadow-[-2px_-2px_5px_rgba(255,255,255,0.9),2px_2px_5px_rgba(163,157,147,0.2)]"
                : "text-[#777482] hover:text-[#292735]"
            )}
          >
            Modern
          </button>
          <button
            type="button"
            onClick={() => setTemplate("classic")}
            className={cn(
              "px-3.5 py-1.5 text-xs font-semibold rounded-[12px] transition-all cursor-pointer",
              cvData.template === "classic"
                ? "bg-white text-[#292735] shadow-[-2px_-2px_5px_rgba(255,255,255,0.9),2px_2px_5px_rgba(163,157,147,0.2)]"
                : "text-[#777482] hover:text-[#292735]"
            )}
          >
            Classic
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="hidden sm:flex items-center gap-1 bg-[#FAF8F5] p-1 rounded-[14px] border border-[rgba(70,65,90,0.08)] shadow-sm text-xs text-[#777482]">
          <button
            type="button"
            onClick={handleZoomOut}
            className="p-1.5 hover:text-[#292735] rounded-[10px] hover:bg-[#EAE6DE]/60 transition-colors"
            title="Zoom out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="px-2 font-mono text-[11px] font-medium min-w-[42px] text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            type="button"
            onClick={handleZoomIn}
            className="p-1.5 hover:text-[#292735] rounded-[10px] hover:bg-[#EAE6DE]/60 transition-colors"
            title="Zoom in"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          {scale !== 1 && (
            <button
              type="button"
              onClick={handleResetZoom}
              className="p-1.5 hover:text-[#292735] rounded-[10px] hover:bg-[#EAE6DE]/60 transition-colors ml-0.5"
              title="Reset zoom"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Sheet Container */}
      <div className="flex-1 overflow-x-auto overflow-y-visible pb-12 flex justify-center items-start">
        <div
          style={{
            transform: `scale(${scale})`,
            transformOrigin: "top center",
            transition: "transform 0.15s ease-out",
          }}
          className="w-full max-w-[800px] shrink-0"
        >
          <div className="cv-paper rounded-[12px] border border-[rgba(0,0,0,0.08)] min-h-[1050px] shadow-lg">
            {cvData.template === "classic" ? (
              <ClassicTemplate data={cvData} />
            ) : (
              <ModernTemplate data={cvData} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
