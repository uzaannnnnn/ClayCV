"use client";

import React, { useState, useRef, useEffect, useId } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  label?: string;
  labelClassName?: string;
  containerClassName?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  error?: string;
  id?: string;
  ariaLabel?: string;
}

export function Select({
  label,
  labelClassName,
  containerClassName,
  value,
  onChange,
  options,
  placeholder = "Select...",
  disabled = false,
  className,
  error,
  id,
  ariaLabel,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const generatedId = useId();
  const selectId = id || generatedId;

  // Find the selected option
  const selectedOption = options.find((opt) => opt.value === value);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === "Escape") {
      setIsOpen(false);
      triggerRef.current?.focus();
    } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else {
        const currentIndex = options.findIndex((opt) => opt.value === value);
        if (e.key === "ArrowDown") {
          const nextIndex =
            currentIndex < options.length - 1 ? currentIndex + 1 : 0;
          onChange(options[nextIndex].value);
        } else {
          const prevIndex =
            currentIndex > 0 ? currentIndex - 1 : options.length - 1;
          onChange(options[prevIndex].value);
        }
      }
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setIsOpen(!isOpen);
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn("w-full space-y-1.5 relative", containerClassName)}
    >
      {label && (
        <label
          htmlFor={selectId}
          className={cn(
            "block text-xs font-semibold uppercase tracking-wider text-[#595566]",
            labelClassName
          )}
        >
          {label}
        </label>
      )}

      <div className="relative">
        <button
          ref={triggerRef}
          id={selectId}
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-label={ariaLabel || label}
          className={cn(
            "clay-input w-full h-[42px] px-3.5 py-2 text-xs sm:text-sm font-medium flex items-center justify-between text-left cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed select-none",
            isOpen && "border-[#8B7CF6] bg-[#FAF8F5] ring-2 ring-[#8B7CF6]/20",
            error && "border-red-400 focus:border-red-500",
            className
          )}
        >
          <span
            className={cn(
              "truncate flex-1 mr-2",
              selectedOption ? "text-[#292735]" : "text-[#6D697A]"
            )}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown
            className={cn(
              "w-4 h-4 text-[#595566] transition-transform duration-200 shrink-0",
              isOpen && "rotate-180 text-[#6C5BD8]"
            )}
          />
        </button>

        {isOpen && (
          <div
            role="listbox"
            tabIndex={-1}
            className="absolute left-0 right-0 top-[calc(100%+4px)] z-50 bg-[#FAF8F5] border border-[rgba(70,65,90,0.1)] rounded-[14px] p-1.5 shadow-[-4px_-4px_12px_rgba(255,255,255,0.95),6px_8px_20px_rgba(163,157,147,0.25)] animate-in fade-in duration-100 max-h-60 overflow-y-auto"
          >
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <div
                  key={opt.value}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                    triggerRef.current?.focus();
                  }}
                  className={cn(
                    "w-full px-3 py-2 text-xs sm:text-sm font-medium rounded-[10px] flex items-center justify-between cursor-pointer transition-colors text-left",
                    isSelected
                      ? "bg-[#E8E3FF] text-[#6C5BD8] font-bold shadow-sm"
                      : "text-[#292735] hover:bg-[#EFECE6]"
                  )}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-[#6C5BD8] shrink-0 ml-2" />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
}
