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
    thesisTitle: "Thesis Title",
    defenseGrade: "Defense Grade",
    gpa: "GPA",
    credentialId: "Credential ID",
    credentialUrl: "Credential URL",
    noExpiry: "No Expiration",
    expires: "Expires",
    issued: "Issued",
    viewCredential: "View Credential",
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
  },
};

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
