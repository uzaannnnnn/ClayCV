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
    in: "dalam",
    thesisTitle: "Judul Skripsi",
    defenseGrade: "Nilai Sidang",
    gpa: "IPK",
    credentialId: "ID Kredensial",
    credentialUrl: "URL Kredensial",
    noExpiry: "Tanpa Kedaluwarsa",
    expires: "Kedaluwarsa",
    issued: "Diterbitkan",
    viewCredential: "Lihat Kredensial",
    openCertificateLink: "Buka tautan verifikasi sertifikat",
  },
};

/**
 * Format optional thesis title and defense grade together compactly.
 * Examples:
 * - Both: Thesis: "Distributed Systems", Grade: A
 * - Thesis only: Thesis: "Distributed Systems"
 * - Grade only: Grade: A
 * - Neither: null
 */
export function formatThesisAndGrade(
  thesisTitle?: string,
  defenseGrade?: string,
  language: CVLanguage = "en"
): string | null {
  const labels = getDocumentLabels(language);
  const parts: string[] = [];

  const trimmedThesis = thesisTitle?.trim();
  const trimmedGrade = defenseGrade?.trim();

  if (trimmedThesis) {
    parts.push(`${labels.thesisTitle}: "${trimmedThesis}"`);
  }
  if (trimmedGrade) {
    parts.push(`${labels.defenseGrade}: ${trimmedGrade}`);
  }

  return parts.length > 0 ? parts.join(", ") : null;
}

/**
 * Formats Degree, Field of Study, and GPA into a single line.
 * Rule: GPA must appear beside the field of study/major, separated by a comma.
 *
 * Examples:
 * - Bachelor of Science in Computer Science, GPA: 3.88/4.00
 * - Bachelor of Science, GPA: 3.88/4.00
 * - Computer Science, GPA: 3.88/4.00
 * - GPA: 3.88/4.00
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

  // 2. Format GPA if present
  let formattedGpa = "";
  if (trimmedGpa) {
    const lower = trimmedGpa.toLowerCase();
    if (lower.startsWith("gpa:") || lower.startsWith("ipk:")) {
      formattedGpa = trimmedGpa;
    } else {
      formattedGpa = `${labels.gpa}: ${trimmedGpa}`;
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
