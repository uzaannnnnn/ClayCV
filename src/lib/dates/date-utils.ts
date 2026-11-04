import { CVLanguage } from "@/types/cv";
import { MONTH_NAMES, getDocumentLabels } from "@/lib/i18n/cv-labels";

const CURRENT_YEAR = new Date().getFullYear();
export const MIN_YEAR = CURRENT_YEAR - 60;
export const MAX_YEAR = CURRENT_YEAR + 15;

export const YEAR_OPTIONS: number[] = Array.from(
  { length: MAX_YEAR - MIN_YEAR + 1 },
  (_, i) => MAX_YEAR - i
);

export function getMonthOptions(lang: CVLanguage) {
  const months = MONTH_NAMES[lang]?.full || MONTH_NAMES.en.full;
  return months.map((name, idx) => ({
    value: idx + 1,
    label: name,
  }));
}

export function formatMonthYear(
  month: number | null,
  year: number | null,
  lang: CVLanguage = "en",
  useShort: boolean = true
): string {
  if (!year) return "";
  if (!month || month < 1 || month > 12) return String(year);

  const monthList = useShort
    ? MONTH_NAMES[lang]?.short || MONTH_NAMES.en.short
    : MONTH_NAMES[lang]?.full || MONTH_NAMES.en.full;

  const monthName = monthList[month - 1] || "";
  return `${monthName} ${year}`;
}

export function formatDateRange(
  startMonth: number | null,
  startYear: number | null,
  endMonth: number | null,
  endYear: number | null,
  current: boolean,
  lang: CVLanguage = "en"
): string {
  const labels = getDocumentLabels(lang);
  const startStr = formatMonthYear(startMonth, startYear, lang, true);

  if (current) {
    return startStr ? `${startStr} — ${labels.present}` : labels.present;
  }

  const endStr = formatMonthYear(endMonth, endYear, lang, true);

  if (startStr && endStr) {
    return `${startStr} — ${endStr}`;
  }
  if (startStr) {
    return startStr;
  }
  if (endStr) {
    return endStr;
  }
  return "";
}

export function validateDateRange(
  startMonth: number | null,
  startYear: number | null,
  endMonth: number | null,
  endYear: number | null,
  current: boolean
): string | null {
  // Check partial selection
  if ((startMonth && !startYear) || (!startMonth && startYear)) {
    return "Please select both start month and year";
  }

  if (!current) {
    if ((endMonth && !endYear) || (!endMonth && endYear)) {
      return "Please select both end month and year";
    }

    if (startYear && endYear) {
      if (startYear > endYear) {
        return "Start date cannot be after end date";
      }
      if (startYear === endYear && startMonth && endMonth && startMonth > endMonth) {
        return "Start month cannot be after end month";
      }
    }
  }

  return null;
}
