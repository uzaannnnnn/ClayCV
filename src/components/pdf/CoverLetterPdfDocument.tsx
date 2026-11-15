import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    paddingTop: 48,
    paddingBottom: 48,
    paddingHorizontal: 52,
    fontFamily: "Helvetica",
    fontSize: 10.5,
    lineHeight: 1.55,
    color: "#1A1A1A",
    backgroundColor: "#FFFFFF",
  },
  header: {
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  name: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: "#111827",
    marginBottom: 4,
  },
  metaLine: {
    fontSize: 9.5,
    color: "#4B5563",
  },
  roleTarget: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#374151",
    marginBottom: 14,
  },
  paragraph: {
    marginBottom: 11,
    textAlign: "left",
  },
});

export interface CoverLetterPdfProps {
  fullName: string;
  email?: string;
  phone?: string;
  location?: string;
  jobTitle?: string;
  companyName?: string;
  content: string;
}

export function CoverLetterPdfDocument({
  fullName,
  email,
  phone,
  location,
  jobTitle,
  companyName,
  content,
}: CoverLetterPdfProps) {
  const contactParts = [email, phone, location].filter(Boolean).join("  •  ");
  const paragraphs = content
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <Document title={`${fullName || "Candidate"} - Cover Letter`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.name}>{fullName || "Cover Letter"}</Text>
          {contactParts ? (
            <Text style={styles.metaLine}>{contactParts}</Text>
          ) : null}
        </View>

        {jobTitle || companyName ? (
          <Text style={styles.roleTarget}>
            {[
              jobTitle ? `Re: ${jobTitle}` : "",
              companyName ? `at ${companyName}` : "",
            ]
              .filter(Boolean)
              .join(" ")}
          </Text>
        ) : null}

        {paragraphs.map((para, idx) => (
          <Text key={idx} style={styles.paragraph}>
            {para}
          </Text>
        ))}
      </Page>
    </Document>
  );
}

