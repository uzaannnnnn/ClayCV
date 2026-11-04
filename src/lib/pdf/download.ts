import { CVData } from "@/types/cv";
import { sanitizeFilename } from "@/lib/utils";

export async function downloadCvPdf(data: CVData): Promise<void> {
  const { pdf } = await import("@react-pdf/renderer");
  const { ModernPdfDocument } = await import("@/components/pdf/ModernPdfDocument");
  const { ClassicPdfDocument } = await import("@/components/pdf/ClassicPdfDocument");

  const DocumentComponent =
    data.template === "classic" ? ClassicPdfDocument : ModernPdfDocument;

  const docElement = DocumentComponent({ data });

  // Generate PDF Blob
  const blob = await pdf(docElement).toBlob();

  // Determine sanitized filename: firstname-lastname-cv.pdf
  const namePart = data.personalInfo.fullName.trim();
  let baseFilename = "cv";
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
