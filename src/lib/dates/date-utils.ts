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

/**
 * Formats certification issue date and expiration date metadata.
 *
 * Rules:
 * - Issue date exists + noExpiry is true → show issue date only: `${issued}: ${issueDate}`
 * - Issue date exists + valid expiration date → show both dates: `${issued}: ${issueDate} • ${expires}: ${expiryDate}`
 * - Issue date exists + expiration date is empty and noExpiry is false → show issue date only: `${issued}: ${issueDate}`
 * - Issue date is empty + valid expiration date → show expiration date only: `${expires}: ${expiryDate}`
 * - Both dates are empty → hide the entire date metadata row: returns null.
 * - When noExpiry is true, NEVER output placeholder expiration values.
 *
 * Examples (ID):
 * - Diterbitkan: Nov 2021
 * - Diterbitkan: Nov 2021 • Kadaluwarsa: Nov 2024
 * - Kadaluwarsa: Nov 2024
 *
 * Examples (EN):
 * - Issued: Nov 2021
 * - Issued: Nov 2021 • Expires: Nov 2024
 * - Expires: Nov 2024
 */
export function formatCertificationDates(
  issueMonth: number | null | undefined,
  issueYear: number | null | undefined,
  expiryMonth: number | null | undefined,
  expiryYear: number | null | undefined,
  noExpiry: boolean = false,
  language: CVLanguage = "en"
): string | null {
  const labels = getDocumentLabels(language);
  const issueDateStr = formatMonthYear(
    issueMonth ?? null,
    issueYear ?? null,
    language,
    true
  );

  const expiryDateStr =
    !noExpiry && expiryYear
      ? formatMonthYear(expiryMonth ?? null, expiryYear, language, true)
      : "";

  const parts: string[] = [];
  if (issueDateStr) {
    parts.push(`${labels.issued}: ${issueDateStr}`);
  }
  if (expiryDateStr) {
    parts.push(`${labels.expires}: ${expiryDateStr}`);
  }

  return parts.length > 0 ? parts.join(" • ") : null;
}
