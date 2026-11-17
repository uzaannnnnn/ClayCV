"use client";

import React, { useState } from "react";
import { ChevronDown, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SectionCardProps {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  badge?: string | number | null;
  defaultOpen?: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
  children: React.ReactNode;
}

export function SectionCard({
  id,
  title,
  description,
  icon: Icon,
  badge,
  defaultOpen = false,
  isOpen: controlledIsOpen,
  onToggle,
  children,
}: SectionCardProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalOpen;

  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    } else {
      setInternalOpen(!internalOpen);
    }
  };

  return (
    <div
      id={id}
      className={cn("cv-section", isOpen && "is-open cv-section-open")}
    >
      {/* Header Button */}
      <button
        type="button"
        onClick={handleToggle}
        className="cv-section-trigger w-full px-3.5 sm:px-5 py-3 sm:py-4 flex items-center justify-between text-left cursor-pointer select-none"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
          <div
            className={cn(
              "w-9 h-9 sm:w-10 sm:h-10 rounded-[12px] sm:rounded-[14px] flex items-center justify-center transition-all shrink-0",
              isOpen
                ? "bg-gradient-to-br from-[#8372F3] to-[#6C5BD8] text-white shadow-[-2px_-2px_6px_rgba(255,255,255,0.9),2px_3px_8px_rgba(108,91,216,0.3)]"
                : "bg-[#EFECE6] text-[#595566] shadow-[-2px_-2px_5px_rgba(255,255,255,0.85),2px_2px_5px_rgba(163,157,147,0.18)]"
            )}
          >
            <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-[#292735] truncate">
                {title}
              </h3>
              {badge !== undefined && badge !== null && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E8E3FF] text-[#6C5BD8] shrink-0">
                  {badge}
                </span>
              )}
            </div>
            <p className="hidden sm:block text-xs text-[#595566] truncate">{description}</p>
          </div>
        </div>

        <div
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center text-[#595566] transition-transform duration-200 shrink-0 ml-2",
            isOpen ? "rotate-180 bg-[#FAF8F5]" : "rotate-0"
          )}
        >
          <ChevronDown className="w-4 h-4" />
        </div>
      </button>

      {/* Accordion Content */}
      {isOpen && (
        <div className="cv-section-content px-3.5 sm:px-5 pb-4 sm:pb-6 pt-1.5 sm:pt-2 animate-in fade-in duration-150">
          <div className="cv-section-content-inner">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}
