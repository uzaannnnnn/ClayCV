import { CVLanguage, EmploymentType, SectionKey, WorkMode } from "@/types/cv";

export interface DocumentLabels {
  sections: Record<SectionKey, string>;
  employmentTypes: Record<EmploymentType, string>;
  workModes: Record<WorkMode, string>;
  present: string;
  in: string; // e.g. "Bachelor of Science in Computer Science" -> "in" / "dalam"
  thesisTitle: string;
  defenseGrade: string;
  gpa: string;
  credentialId: string;
  credentialUrl: string;
  noExpiry: string;
  expires: string;
  issued: string;
  viewCredential: string;
  openCertificateLink: string;
}

export const CV_LABELS: Record<CVLanguage, DocumentLabels> = {
  en: {
    sections: {
      summary: "Professional Summary",
      experience: "Work Experience",
      education: "Education",
      skills: "Skills & Competencies",
      projects: "Projects",
      certifications: "Certifications",
    },
    employmentTypes: {
      internship: "Internship",
      "full-time": "Full-time",
      "part-time": "Part-time",
      freelance: "Freelance",
    },
    workModes: {
      onsite: "Onsite",
      remote: "Remote",
    },
    present: "Present",
    in: "in",
    thesisTitle: "Thesis",
    defenseGrade: "Defense Grade",
    gpa: "GPA",
    credentialId: "Credential ID",
    credentialUrl: "Credential URL",
    noExpiry: "No Expiration",
    expires: "Expires",
    issued: "Issued",
    viewCredential: "View Credential",
    openCertificateLink: "Open certificate verification link",
  },
  id: {
    sections: {
      summary: "Ringkasan Profesional",
      experience: "Pengalaman Kerja",
      education: "Pendidikan",
      skills: "Keahlian",
      projects: "Proyek",
      certifications: "Sertifikasi",
    },
    employmentTypes: {
      internship: "Magang",
      "full-time": "Penuh Waktu",
      "part-time": "Paruh Waktu",
      freelance: "Freelance",
    },
    workModes: {
      onsite: "Di Kantor",
      remote: "Jarak Jauh",
    },
    present: "Sekarang",
    in: "in",
    thesisTitle: "Judul Skripsi",
    defenseGrade: "Nilai Sidang",
    gpa: "IPK",
    credentialId: "ID Kredensial",
    credentialUrl: "URL Kredensial",
    noExpiry: "Tanpa Kedaluwarsa",
    expires: "Kadaluwarsa",
    issued: "Diterbitkan",
    viewCredential: "Lihat Kredensial",
    openCertificateLink: "Buka tautan verifikasi sertifikat",
  },
};

/**
 * Format optional thesis title and defense grade without 'Thesis:' / 'Judul Skripsi:' prefixes.
 *
 * Rules:
 * - Remove "Thesis:" and "Judul Skripsi:" completely.
 * - Display thesis title directly with quotation marks: "Thesis Title"
 * - Display "Grade:" followed by defense grade: Grade: A+
 * - Separate thesis title and grade using a comma.
 * - If only thesis exists: "Thesis Title"
 * - If only grade exists: Grade: A+
 * - If both empty: null
 *
 * Examples:
 * - "Optimizing Distributed Event Propagation in Reactive Web Applications", Grade: A+
 * - "Thesis Title"
 * - Grade: A+
 */
export function formatThesisAndGrade(
  thesisTitle?: string,
  defenseGrade?: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _language: CVLanguage = "en"
): string | null {
  const trimmedThesis = thesisTitle?.trim();
  const trimmedGrade = defenseGrade?.trim();

  let formattedThesis = "";
  if (trimmedThesis) {
    let clean = trimmedThesis.replace(/^(thesis|judul skripsi)\s*:\s*/i, "").trim();
    if (
      (clean.startsWith('"') && clean.endsWith('"')) ||
      (clean.startsWith('“') && clean.endsWith('”'))
    ) {
      clean = clean.slice(1, -1).trim();
    }
    if (clean) {
      formattedThesis = `"${clean}"`;
    }
  }

  let formattedGrade = "";
  if (trimmedGrade) {
    const clean = trimmedGrade
      .replace(/^(grade|nilai sidang|defense grade)\s*:\s*/i, "")
      .trim();
    if (clean) {
      formattedGrade = `Grade: ${clean}`;
    }
  }

  if (formattedThesis && formattedGrade) {
    return `${formattedThesis}, ${formattedGrade}`;
  }
  if (formattedThesis) {
    return formattedThesis;
  }
  if (formattedGrade) {
    return formattedGrade;
  }
  return null;
}

/**
 * Formats Degree, Field of Study, and GPA into a single line without GPA/IPK labels.
 *
 * Rules:
 * - Remove "GPA:" and "IPK:" completely.
 * - Display only the numeric GPA value directly after degree/major, separated by a comma.
 * - If GPA empty, display only degree/major without an additional comma.
 *
 * Examples:
 * - Bachelor of Science in Computer Science, 3.85/4.00
 * - Bachelor degree in Computer Science, 3.88/4.00
 * - Bachelor of Science in Computer Science (when GPA empty)
 */
export function formatDegreeMajorAndGpa(
  degree?: string,
  fieldOfStudy?: string,
  gpa?: string,
  language: CVLanguage = "en"
): string | null {
  const labels = getDocumentLabels(language);
  const trimmedDegree = degree?.trim();
  const trimmedMajor = fieldOfStudy?.trim();
  const trimmedGpa = gpa?.trim();

  // 1. Build Degree + Major
  let degreeMajor = "";
  if (trimmedDegree && trimmedMajor) {
    degreeMajor = `${trimmedDegree} ${labels.in} ${trimmedMajor}`;
  } else if (trimmedDegree) {
    degreeMajor = trimmedDegree;
  } else if (trimmedMajor) {
    degreeMajor = trimmedMajor;
  }

  // 2. Format GPA if present (strip any GPA: or IPK: label, normalize spaces around slash)
  let formattedGpa = "";
  if (trimmedGpa) {
    let clean = trimmedGpa.replace(/^(gpa|ipk)\s*:\s*/i, "").trim();
    clean = clean.replace(/\s*\/\s*/g, "/");
    if (clean) {
      formattedGpa = clean;
    }
  }

  // 3. Combine degreeMajor and formattedGpa
  if (degreeMajor && formattedGpa) {
    return `${degreeMajor}, ${formattedGpa}`;
  }
  if (degreeMajor) {
    return degreeMajor;
  }
  if (formattedGpa) {
    return formattedGpa;
  }
  return null;
}

export const MONTH_NAMES: Record<CVLanguage, { full: string[]; short: string[] }> = {
  en: {
    full: [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ],
    short: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
  },
  id: {
    full: [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ],
    short: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "Mei",
      "Jun",
      "Jul",
      "Agu",
      "Sep",
      "Okt",
      "Nov",
      "Des",
    ],
  },
};

export function getDocumentLabels(lang: CVLanguage): DocumentLabels {
  return CV_LABELS[lang] || CV_LABELS.en;
}

export { formatCertificationDates } from "@/lib/dates/date-utils";
