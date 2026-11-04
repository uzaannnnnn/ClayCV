import React from "react";
import { renderToFile } from "@react-pdf/renderer";
import { SAMPLE_CV_DATA } from "../src/lib/constants";
import { AtsClassicPdfDocument } from "../src/components/pdf/AtsClassicPdfDocument";
import { AtsModernPdfDocument } from "../src/components/pdf/AtsModernPdfDocument";
import { AtsMinimalPdfDocument } from "../src/components/pdf/AtsMinimalPdfDocument";
import fs from "fs";

async function main() {
  const outputDir = "/tmp/cv-v3-tests";
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const enData = { ...SAMPLE_CV_DATA, language: "en" as const };
  const idData = {
    ...SAMPLE_CV_DATA,
    language: "id" as const,
    personalInfo: {
      ...SAMPLE_CV_DATA.personalInfo,
      fullName: "Alex Morgan, S.Kom.",
      jobTitle: "Senior Full-Stack Engineer & Cloud Architect",
      summary:
        "Senior Software Engineer dengan pengalaman lebih dari 8 tahun dalam merancang dan mengembangkan sistem terdistribusi berskala besar. Mahir dalam TypeScript, Next.js, arsitektur microservices, dan infrastruktur cloud.",
    },
    education: [
      {
        id: "edu-1",
        institution: "Universitas Indonesia",
        degree: "Sarjana Ilmu Komputer",
        fieldOfStudy: "Teknik Informatika",
        startMonth: 8,
        startYear: 2012,
        endMonth: 6,
        endYear: 2016,
        current: false,
        gpa: "3.88 / 4.00",
        thesisTitle: "Optimasi Propagasi Event Terdistribusi dalam Aplikasi Web Reaktif",
        defenseGrade: "A",
        description: "Lulus dengan predikat Cum Laude. Asisten Dosen untuk Sistem Operasi.",
      },
    ],
  };

  const tests = [
    { name: "classic-en", doc: <AtsClassicPdfDocument data={enData} /> },
    { name: "classic-id", doc: <AtsClassicPdfDocument data={idData} /> },
    { name: "modern-en", doc: <AtsModernPdfDocument data={enData} /> },
    { name: "modern-id", doc: <AtsModernPdfDocument data={idData} /> },
    { name: "minimal-en", doc: <AtsMinimalPdfDocument data={enData} /> },
    { name: "minimal-id", doc: <AtsMinimalPdfDocument data={idData} /> },
  ];

  for (const t of tests) {
    const pdfPath = `${outputDir}/${t.name}.pdf`;
    console.log(`Rendering ${t.name} -> ${pdfPath}`);
    await renderToFile(t.doc, pdfPath);
  }

  console.log("All 6 test PDFs rendered successfully!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
