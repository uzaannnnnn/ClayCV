"use client";

import React from "react";
import { CVLanguage } from "@/types/cv";
import { getMonthOptions, YEAR_OPTIONS } from "@/lib/dates/date-utils";
import { cn } from "@/lib/utils";

export interface MonthYearSelectProps {
  label?: string;
  monthValue: number | null;
  yearValue: number | null;
  onChangeMonth: (month: number | null) => void;
  onChangeYear: (year: number | null) => void;
  disabled?: boolean;
  language?: CVLanguage;
  error?: string | null;
  idPrefix?: string;
}

export function MonthYearSelect({
  label,
  monthValue,
  yearValue,
  onChangeMonth,
  onChangeYear,
  disabled = false,
  language = "en",
  error,
  idPrefix = "my-select",
}: MonthYearSelectProps) {
  const monthOptions = getMonthOptions(language);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-[#595566]">
          {label}
        </label>
      )}

      <div className="grid grid-cols-2 gap-2">
        {/* Month Dropdown */}
        <div>
          <select
            id={`${idPrefix}-month`}
            disabled={disabled}
            value={monthValue ?? ""}
            onChange={(e) => {
              const val = e.target.value ? parseInt(e.target.value, 10) : null;
              onChangeMonth(val);
            }}
            aria-label={`${label || "Date"} month`}
            className={cn(
              "clay-input w-full px-3 py-2 text-xs sm:text-sm font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
              error && "border-red-400"
            )}
          >
            <option value="">Month</option>
            {monthOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Year Dropdown */}
        <div>
          <select
            id={`${idPrefix}-year`}
            disabled={disabled}
            value={yearValue ?? ""}
            onChange={(e) => {
              const val = e.target.value ? parseInt(e.target.value, 10) : null;
              onChangeYear(val);
            }}
            aria-label={`${label || "Date"} year`}
            className={cn(
              "clay-input w-full px-3 py-2 text-xs sm:text-sm font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
              error && "border-red-400"
            )}
          >
            <option value="">Year</option>
            {YEAR_OPTIONS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
}
