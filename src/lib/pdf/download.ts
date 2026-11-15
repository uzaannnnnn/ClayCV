import { CVData } from "@/types/cv";
import { sanitizeFilename } from "@/lib/utils";

export async function downloadCvPdf(data: CVData): Promise<void> {
  const { pdf } = await import("@react-pdf/renderer");
  const { AtsClassicPdfDocument } = await import(
    "@/components/pdf/AtsClassicPdfDocument"
  );
  const { AtsModernPdfDocument } = await import(
    "@/components/pdf/AtsModernPdfDocument"
  );
  const { AtsMinimalPdfDocument } = await import(
    "@/components/pdf/AtsMinimalPdfDocument"
  );

  let docElement;
  switch (data.template) {
    case "classic":
      docElement = AtsClassicPdfDocument({ data });
      break;
    case "minimal":
      docElement = AtsMinimalPdfDocument({ data });
      break;
    case "modern":
    default:
      docElement = AtsModernPdfDocument({ data });
      break;
  }

  // Generate PDF Blob
  const blob = await pdf(docElement).toBlob();

  // Determine sanitized filename: firstname-lastname-cv.pdf
  const namePart = data.personalInfo.fullName.trim();
  let baseFilename = "resume";
  if (namePart) {
    baseFilename = sanitizeFilename(namePart);
  } else if (data.title && data.title !== "My Resume") {
    baseFilename = sanitizeFilename(data.title);
  }
  const filename = `${baseFilename}-cv.pdf`;

  // Trigger download
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);

  // Clean up object URL
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
}

export async function downloadCoverLetterPdf(params: {
  fullName: string;
  email?: string;
  phone?: string;
  location?: string;
  jobTitle?: string;
  companyName?: string;
  content: string;
}): Promise<void> {
  const { pdf } = await import("@react-pdf/renderer");
  const { CoverLetterPdfDocument } = await import(
    "@/components/pdf/CoverLetterPdfDocument"
  );

  const docElement = CoverLetterPdfDocument(params);
  const blob = await pdf(docElement).toBlob();

  const base = sanitizeFilename(params.fullName || params.jobTitle || "cover-letter");
  const filename = `${base}-cover-letter.pdf`;

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
}
