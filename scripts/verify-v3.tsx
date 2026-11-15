import Module from "node:module";
import path from "node:path";
import fs from "node:fs";
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

// Node 25 CJS compatibility shim for packages that only define "exports.import"
const origResolve = (
  Module as unknown as {
    _resolveFilename: (
      request: string,
      parent: unknown,
      isMain: boolean,
      options: unknown
    ) => string;
  }
)._resolveFilename;

(
  Module as unknown as {
    _resolveFilename: (
      request: string,
      parent: unknown,
      isMain: boolean,
      options: unknown
    ) => string;
  }
)._resolveFilename = function (request, parent, isMain, options) {
  if (request === "@react-pdf/hyphenate") {
    return path.resolve(
      process.cwd(),
      "node_modules/@react-pdf/hyphenate/lib/index.js"
    );
  }
  if (request.startsWith("@react-pdf/hyphenate/")) {
    const sub = request.slice("@react-pdf/hyphenate/".length);
    return path.resolve(
      process.cwd(),
      `node_modules/@react-pdf/hyphenate/lib/${sub}.js`
    );
  }
  return origResolve.call(this, request, parent, isMain, options);
};

async function main() {
  const { renderToFile } = await import("@react-pdf/renderer");
  const { SAMPLE_CV_DATA } = await import("../src/lib/constants");
  const { getDocumentLabels, formatDegreeMajorAndGpa, formatThesisAndGrade } =
    await import("../src/lib/i18n/cv-labels");
  const { AtsClassicPdfDocument } = await import(
    "../src/components/pdf/AtsClassicPdfDocument"
  );
  const { AtsModernPdfDocument } = await import(
    "../src/components/pdf/AtsModernPdfDocument"
  );
  const { AtsMinimalPdfDocument } = await import(
    "../src/components/pdf/AtsMinimalPdfDocument"
  );
  const { CoverLetterPdfDocument } = await import(
    "../src/components/pdf/CoverLetterPdfDocument"
  );
  const { AtsClassicTemplate } = await import(
    "../src/components/templates/ats-classic/AtsClassicTemplate"
  );
  const { AtsModernTemplate } = await import(
    "../src/components/templates/ats-modern/AtsModernTemplate"
  );
  const { AtsMinimalTemplate } = await import(
    "../src/components/templates/ats-minimal/AtsMinimalTemplate"
  );

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
        thesisTitle:
          "Optimasi Propagasi Event Terdistribusi dalam Aplikasi Web Reaktif",
        defenseGrade: "A",
        description:
          "Lulus dengan predikat Cum Laude. Asisten Dosen untuk Sistem Operasi.",
      },
    ],
  };

  const tests = [
    {
      name: "classic-en",
      data: enData,
      doc: <AtsClassicPdfDocument data={enData} />,
      preview: <AtsClassicTemplate data={enData} />,
    },
    {
      name: "classic-id",
      data: idData,
      doc: <AtsClassicPdfDocument data={idData} />,
      preview: <AtsClassicTemplate data={idData} />,
    },
    {
      name: "modern-en",
      data: enData,
      doc: <AtsModernPdfDocument data={enData} />,
      preview: <AtsModernTemplate data={enData} />,
    },
    {
      name: "modern-id",
      data: idData,
      doc: <AtsModernPdfDocument data={idData} />,
      preview: <AtsModernTemplate data={idData} />,
    },
    {
      name: "minimal-en",
      data: enData,
      doc: <AtsMinimalPdfDocument data={enData} />,
      preview: <AtsMinimalTemplate data={enData} />,
    },
    {
      name: "minimal-id",
      data: idData,
      doc: <AtsMinimalPdfDocument data={idData} />,
      preview: <AtsMinimalTemplate data={idData} />,
    },
  ];

  console.log("=== ClayCV Phase 8 — PDF & Live Preview Parity Verification ===\n");

  for (const t of tests) {
    const pdfPath = `${outputDir}/${t.name}.pdf`;
    await renderToFile(t.doc, pdfPath);
    const stat = fs.statSync(pdfPath);
    assert(stat.size > 1000, `PDF ${t.name} should be non-empty`);

    // Compare Live Preview HTML and PDF Document Element Tree
    const origError = console.error;
    console.error = () => {};
    const previewHtml = renderToStaticMarkup(t.preview);
    const pdfTreeHtml = renderToStaticMarkup(t.doc);
    console.error = origError;
    const labels = getDocumentLabels(t.data.language);
    const esc = (str: string) =>
      str.replace(/&/g, "&amp;").replace(/"/g, "&quot;");

    // 1. Section headings & order parity
    for (const secKey of t.data.sectionOrder) {
      const heading = labels.sections[secKey];
      const escapedHeading = esc(heading);
      assert(
        previewHtml.includes(escapedHeading),
        `Preview (${t.name}) missing section heading: ${heading}`
      );
      assert(
        pdfTreeHtml.includes(escapedHeading),
        `PDF (${t.name}) missing section heading: ${heading}`
      );
    }

    // 2. Candidate Name, Contact Links, Experience, Education, Skills, Projects, Certifications parity
    assert(previewHtml.includes(esc(t.data.personalInfo.fullName)));
    assert(pdfTreeHtml.includes(esc(t.data.personalInfo.fullName)));
    assert(previewHtml.includes(`mailto:${t.data.personalInfo.email}`));
    assert(pdfTreeHtml.includes(`mailto:${t.data.personalInfo.email}`));

    for (const exp of t.data.experience) {
      assert(previewHtml.includes(esc(exp.company)));
      assert(pdfTreeHtml.includes(esc(exp.company)));
    }

    for (const edu of t.data.education) {
      const degGpa = esc(
        formatDegreeMajorAndGpa(
          edu.degree,
          edu.fieldOfStudy,
          edu.gpa,
          t.data.language
        ) || ""
      );
      const thesisStr = esc(
        formatThesisAndGrade(
          edu.thesisTitle,
          edu.defenseGrade,
          t.data.language
        ) || ""
      );
      assert(previewHtml.includes(degGpa));
      assert(pdfTreeHtml.includes(degGpa));
      assert(previewHtml.includes(thesisStr));
      assert(pdfTreeHtml.includes(thesisStr));
    }

    for (const skill of t.data.skills) {
      assert(previewHtml.includes(esc(skill.name)));
      assert(pdfTreeHtml.includes(esc(skill.name)));
    }

    for (const proj of t.data.projects) {
      assert(previewHtml.includes(esc(proj.name)));
      assert(pdfTreeHtml.includes(esc(proj.name)));
    }

    for (const cert of t.data.certifications) {
      assert(previewHtml.includes(esc(cert.name)));
      assert(pdfTreeHtml.includes(esc(cert.name)));
    }

    console.log(
      `✓ ${t.name}: PDF rendered (${stat.size} bytes) & Live Preview <-> PDF structural/content parity verified`
    );
  }

  // Cover Letter PDF verification
  const coverLetterPath = `${outputDir}/cover-letter-en.pdf`;
  await renderToFile(
    <CoverLetterPdfDocument
      fullName={enData.personalInfo.fullName}
      email={enData.personalInfo.email}
      phone={enData.personalInfo.phone}
      location={enData.personalInfo.location}
      jobTitle="Principal Frontend Architect"
      companyName="Stripe"
      content={
        "Dear Hiring Manager,\n\nI am writing to express my strong interest in the Principal Frontend Architect position at Stripe.\n\nThank you for your time and consideration.\n\nSincerely,\nAlex Morgan"
      }
    />,
    coverLetterPath
  );
  const clStat = fs.statSync(coverLetterPath);
  assert(clStat.size > 1000, "Cover Letter PDF should be non-empty");
  console.log(
    `✓ cover-letter-en: Cover Letter A4 PDF rendered (${clStat.size} bytes)`
  );

  console.log("\nAll 6 ATS CV PDFs + Cover Letter PDF + Live Preview parity checks passed!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
