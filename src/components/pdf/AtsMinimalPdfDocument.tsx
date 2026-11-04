import React from "react";
import { Document, Page, Text, View, StyleSheet, Link } from "@react-pdf/renderer";
import { CVData, SectionKey } from "@/types/cv";
import {
  getDocumentLabels,
  formatThesisAndGrade,
  formatDegreeMajorAndGpa,
} from "@/lib/i18n/cv-labels";
import {
  formatDateRange,
  formatCertificationDates,
} from "@/lib/dates/date-utils";
import { normalizeUrl, cleanDisplayUrl } from "@/lib/utils";
import { PdfExternalLinkIcon } from "./PdfExternalLinkIcon";

const styles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 36,
    paddingLeft: 34,
    paddingRight: 34,
    fontSize: 9,
    fontFamily: "Helvetica",
    color: "#000000",
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: "#000000",
    paddingBottom: 6,
    marginBottom: 9,
  },
  fullName: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: "#000000",
    letterSpacing: -0.2,
    marginBottom: 2,
  },
  jobTitle: {
    fontSize: 9.5,
    fontFamily: "Helvetica",
    color: "#000000",
    marginBottom: 4,
  },
  contactRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    fontSize: 8,
    color: "#000000",
  },
  link: {
    color: "#000000",
    textDecoration: "none",
  },
  section: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#000000",
    textTransform: "uppercase",
    letterSpacing: 1,
    borderBottomWidth: 0.8,
    borderBottomColor: "#000000",
    paddingBottom: 2,
    marginBottom: 4,
  },
  summaryText: {
    fontSize: 8.5,
    color: "#000000",
    lineHeight: 1.35,
  },
  itemBlock: {
    marginBottom: 5,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 1.5,
  },
  itemTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#000000",
    flex: 1,
    paddingRight: 10,
  },
  itemMeta: {
    fontSize: 8,
    color: "#000000",
  },
  itemDate: {
    fontSize: 8,
    color: "#000000",
    textAlign: "right",
    flexShrink: 0,
  },
  itemLocation: {
    fontSize: 8,
    color: "#333333",
    marginBottom: 1,
  },
  itemThesis: {
    fontSize: 8,
    color: "#333333",
    fontFamily: "Helvetica-Oblique",
    marginBottom: 1,
  },
  itemDescription: {
    fontSize: 8.5,
    color: "#000000",
    lineHeight: 1.3,
  },
  skillsText: {
    fontSize: 8.5,
    color: "#000000",
    lineHeight: 1.35,
  },
  certTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingRight: 10,
    flexWrap: "wrap",
  },
  certTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#000000",
  },
  iconLink: {
    marginLeft: 4,
    textDecoration: "none",
  },
  bold: {
    fontFamily: "Helvetica-Bold",
  },
});

export function AtsMinimalPdfDocument({ data }: { data: CVData }) {
  const {
    personalInfo,
    experience,
    education,
    skills,
    projects,
    certifications,
    language,
    sectionOrder,
  } = data;

  const labels = getDocumentLabels(language);

  const validExperience = experience.filter(
    (e) => e.company.trim() || e.position.trim()
  );
  const validEducation = education.filter(
    (e) => e.institution.trim() || e.degree.trim() || e.fieldOfStudy.trim()
  );
  const validSkills = skills.filter((s) => s.name.trim());
  const validProjects = projects.filter((p) => p.name.trim());
  const validCertifications = certifications.filter((c) => c.name.trim());

  const renderSection = (key: SectionKey) => {
    switch (key) {
      case "summary":
        if (!personalInfo.summary.trim()) return null;
        return (
          <View key="summary" style={styles.section} wrap={false}>
            <Text style={styles.sectionTitle}>{labels.sections.summary}</Text>
            <Text style={styles.summaryText}>{personalInfo.summary}</Text>
          </View>
        );

      case "experience":
        if (validExperience.length === 0) return null;
        return (
          <View key="experience" style={styles.section}>
            <Text style={styles.sectionTitle}>{labels.sections.experience}</Text>
            {validExperience.map((item) => {
              const dateStr = formatDateRange(
                item.startMonth,
                item.startYear,
                item.endMonth,
                item.endYear,
                item.current,
                language
              );
              const empTypeLabel = labels.employmentTypes[item.employmentType];
              const workModeLabel = labels.workModes[item.workMode];

              return (
                <View key={item.id} style={styles.itemBlock} wrap={false}>
                  <View style={styles.itemHeader}>
                    <Text style={styles.itemTitle}>
                      {item.position}{" "}
                      {item.company ? `— ${item.company}` : ""}{" "}
                      <Text style={styles.itemMeta}>
                        [{empTypeLabel}, {workModeLabel}]
                      </Text>
                    </Text>
                    {dateStr ? (
                      <Text style={styles.itemDate}>{dateStr}</Text>
                    ) : null}
                  </View>
                  {item.location ? (
                    <Text style={styles.itemLocation}>{item.location}</Text>
                  ) : null}
                  {item.description ? (
                    <Text style={styles.itemDescription}>
                      {item.description}
                    </Text>
                  ) : null}
                </View>
              );
            })}
          </View>
        );

      case "education":
        if (validEducation.length === 0) return null;
        return (
          <View key="education" style={styles.section}>
            <Text style={styles.sectionTitle}>{labels.sections.education}</Text>
            {validEducation.map((item) => {
              const dateStr = formatDateRange(
                item.startMonth,
                item.startYear,
                item.endMonth,
                item.endYear,
                item.current,
                language
              );
              const degreeMajorAndGpa = formatDegreeMajorAndGpa(
                item.degree,
                item.fieldOfStudy,
                item.gpa,
                language
              );
              const thesisAndGrade = formatThesisAndGrade(
                item.thesisTitle,
                item.defenseGrade,
                language
              );

              return (
                <View key={item.id} style={styles.itemBlock} wrap={false}>
                  <View style={styles.itemHeader}>
                    <Text style={styles.itemTitle}>{item.institution}</Text>
                    {dateStr ? (
                      <Text style={styles.itemDate}>{dateStr}</Text>
                    ) : null}
                  </View>
                  {degreeMajorAndGpa ? (
                    <Text style={styles.itemLocation}>{degreeMajorAndGpa}</Text>
                  ) : null}

                  {/* Thesis Title and Defense Grade displayed together */}
                  {thesisAndGrade ? (
                    <Text style={styles.itemThesis}>{thesisAndGrade}</Text>
                  ) : null}

                  {item.description ? (
                    <Text style={styles.itemDescription}>
                      {item.description}
                    </Text>
                  ) : null}
                </View>
              );
            })}
          </View>
        );

      case "skills":
        if (validSkills.length === 0) return null;
        return (
          <View key="skills" style={styles.section} wrap={false}>
            <Text style={styles.sectionTitle}>{labels.sections.skills}</Text>
            <Text style={styles.skillsText}>
              {validSkills.map((s, idx) => (
                <Text key={s.id}>
                  <Text>{s.name}</Text>
                  {idx < validSkills.length - 1 ? "  •  " : ""}
                </Text>
              ))}
            </Text>
          </View>
        );

      case "projects":
        if (validProjects.length === 0) return null;
        return (
          <View key="projects" style={styles.section}>
            <Text style={styles.sectionTitle}>{labels.sections.projects}</Text>
            {validProjects.map((project) => (
              <View key={project.id} style={styles.itemBlock} wrap={false}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle}>
                    {project.name}{" "}
                    {project.technologies ? (
                      <Text style={styles.itemMeta}>
                        [{project.technologies}]
                      </Text>
                    ) : null}
                  </Text>
                  {project.url ? (
                    <Link
                      style={styles.link}
                      src={normalizeUrl(project.url)}
                    >
                      <Text>{cleanDisplayUrl(project.url)}</Text>
                    </Link>
                  ) : null}
                </View>
                {project.description ? (
                  <Text style={styles.itemDescription}>
                    {project.description}
                  </Text>
                ) : null}
              </View>
            ))}
          </View>
        );

      case "certifications":
        if (validCertifications.length === 0) return null;
        return (
          <View key="certifications" style={styles.section}>
            <Text style={styles.sectionTitle}>
              {labels.sections.certifications}
            </Text>
            {validCertifications.map((cert) => {
              const certDates = formatCertificationDates(
                cert.issueMonth,
                cert.issueYear,
                cert.expiryMonth,
                cert.expiryYear,
                cert.noExpiry,
                language
              );

              return (
                <View key={cert.id} style={styles.itemBlock} wrap={false}>
                  <View style={styles.itemHeader}>
                    <View style={styles.certTitleRow}>
                      <Text style={styles.certTitle}>
                        {cert.name}{" "}
                        {cert.issuingOrganization ? (
                          <Text style={styles.itemMeta}>
                            — {cert.issuingOrganization}
                          </Text>
                        ) : null}
                      </Text>
                      {cert.credentialUrl ? (
                        <Link
                          style={styles.iconLink}
                          src={normalizeUrl(cert.credentialUrl)}
                        >
                          <PdfExternalLinkIcon color="#000000" size={7} />
                        </Link>
                      ) : null}
                    </View>
                    {certDates ? (
                      <Text style={styles.itemDate}>{certDates}</Text>
                    ) : null}
                  </View>
                  {cert.credentialId ? (
                    <Text style={styles.itemMeta}>
                      <Text style={styles.bold}>{labels.credentialId}: </Text>
                      {cert.credentialId}
                    </Text>
                  ) : null}
                </View>
              );
            })}
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <Document title={`${data.title || "CV"} - ClayCV`}>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.fullName}>
            {personalInfo.fullName || "YOUR NAME"}
          </Text>
          {personalInfo.jobTitle ? (
            <Text style={styles.jobTitle}>{personalInfo.jobTitle}</Text>
          ) : null}

          <View style={styles.contactRow}>
            {personalInfo.email ? (
              <Link
                style={styles.link}
                src={`mailto:${personalInfo.email}`}
              >
                <Text>{personalInfo.email}</Text>
              </Link>
            ) : null}
            {personalInfo.phone ? (
              <Text>• {personalInfo.phone}</Text>
            ) : null}
            {personalInfo.location ? (
              <Text>• {personalInfo.location}</Text>
            ) : null}
            {personalInfo.website ? (
              <Text>
                •{" "}
                <Link
                  style={styles.link}
                  src={normalizeUrl(personalInfo.website)}
                >
                  <Text>{cleanDisplayUrl(personalInfo.website)}</Text>
                </Link>
              </Text>
            ) : null}
            {personalInfo.linkedin ? (
              <Text>
                •{" "}
                <Link
                  style={styles.link}
                  src={normalizeUrl(personalInfo.linkedin)}
                >
                  <Text>{cleanDisplayUrl(personalInfo.linkedin)}</Text>
                </Link>
              </Text>
            ) : null}
            {personalInfo.github ? (
              <Text>
                •{" "}
                <Link
                  style={styles.link}
                  src={normalizeUrl(personalInfo.github)}
                >
                  <Text>{cleanDisplayUrl(personalInfo.github)}</Text>
                </Link>
              </Text>
            ) : null}
          </View>
        </View>

        {/* Ordered Sections */}
        {sectionOrder.map((key) => renderSection(key))}
      </Page>
    </Document>
  );
}
