"use client";

import React, { useMemo } from "react";
import { CVLanguage } from "@/types/cv";
import { getMonthOptions, YEAR_OPTIONS } from "@/lib/dates/date-utils";
import { Combobox, Select, SelectOption } from "@/components/ui/select";

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
  const monthOptions = useMemo<SelectOption[]>(
    () =>
      getMonthOptions(language).map((opt) => ({
        value: String(opt.value),
        label: opt.label,
      })),
    [language]
  );

  const yearOptions = useMemo<SelectOption[]>(
    () =>
      YEAR_OPTIONS.map((y) => ({
        value: String(y),
        label: String(y),
      })),
    []
  );

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-[#595566]">
          {label}
        </label>
      )}

      <div className="grid grid-cols-2 gap-2">
        <Select
          id={`${idPrefix}-month`}
          value={monthValue !== null ? String(monthValue) : ""}
          onChange={(val) => {
            onChangeMonth(val ? parseInt(val, 10) : null);
          }}
          options={monthOptions}
          placeholder="Month"
          clearable
          clearLabel="Clear month"
          disabled={disabled}
          ariaLabel={`${label || "Date"} month`}
          minMenuWidth={168}
          hasError={Boolean(error)}
        />

        <Combobox
          id={`${idPrefix}-year`}
          value={yearValue !== null ? String(yearValue) : ""}
          onChange={(val) => {
            onChangeYear(val ? parseInt(val, 10) : null);
          }}
          options={yearOptions}
          placeholder="Year"
          searchPlaceholder="Filter year..."
          emptyText="No matching year"
          clearable
          clearLabel="Clear year"
          disabled={disabled}
          ariaLabel={`${label || "Date"} year`}
          minMenuWidth={156}
          hasError={Boolean(error)}
        />
      </div>

      {error && (
        <p role="alert" className="text-xs text-[#B91C1C] font-medium">
          {error}
        </p>
      )}
    </div>
  );
}
