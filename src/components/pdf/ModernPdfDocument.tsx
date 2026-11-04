import React from "react";
import { Document, Page, Text, View, StyleSheet, Link } from "@react-pdf/renderer";
import { CVData } from "@/types/cv";

const styles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 36,
    paddingLeft: 40,
    paddingRight: 40,
    fontSize: 9.5,
    fontFamily: "Helvetica",
    color: "#1E1E24",
    lineHeight: 1.45,
  },
  header: {
    borderBottomWidth: 2,
    borderBottomColor: "#8B7CF6",
    paddingBottom: 10,
    marginBottom: 12,
  },
  fullName: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: "#111827",
    letterSpacing: -0.3,
  },
  jobTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#8B7CF6",
    marginTop: 2,
  },
  contactRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 6,
    gap: 8,
  },
  contactItem: {
    fontSize: 8.5,
    color: "#4B5563",
  },
  link: {
    color: "#4B5563",
    textDecoration: "none",
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 9.5,
    fontFamily: "Helvetica-Bold",
    color: "#8B7CF6",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    borderBottomWidth: 0.5,
    borderBottomColor: "#E5E7EB",
    paddingBottom: 3,
    marginBottom: 6,
  },
  summaryText: {
    fontSize: 9,
    color: "#374151",
    lineHeight: 1.45,
  },
  itemBlock: {
    marginBottom: 8,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 1,
  },
  itemTitle: {
    fontSize: 9.5,
    fontFamily: "Helvetica-Bold",
    color: "#111827",
  },
  companyHighlight: {
    fontFamily: "Helvetica-Bold",
    color: "#8B7CF6",
  },
  itemDate: {
    fontSize: 8.5,
    color: "#6B7280",
    fontFamily: "Helvetica",
  },
  itemSubtitle: {
    fontSize: 8.5,
    color: "#4B5563",
    marginBottom: 2,
  },
  itemDescription: {
    fontSize: 8.5,
    color: "#374151",
    lineHeight: 1.4,
  },
  skillsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  skillBadge: {
    backgroundColor: "#F3F4F6",
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 3,
    fontSize: 8.5,
    color: "#1F2937",
    marginRight: 4,
    marginBottom: 4,
  },
  skillLevel: {
    color: "#8B7CF6",
    fontFamily: "Helvetica-Bold",
    fontSize: 7.5,
  },
  projectLink: {
    fontSize: 8.5,
    color: "#8B7CF6",
    textDecoration: "none",
  },
});

export function ModernPdfDocument({ data }: { data: CVData }) {
  const { personalInfo, education, experience, skills, projects } = data;

  const validEducation = education.filter(
    (e) => e.institution.trim() || e.degree.trim() || e.fieldOfStudy.trim()
  );
  const validExperience = experience.filter(
    (e) => e.company.trim() || e.position.trim()
  );
  const validSkills = skills.filter((s) => s.name.trim());
  const validProjects = projects.filter((p) => p.name.trim());

  return (
    <Document title={`${data.title || "CV"} - ClayCV`}>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.fullName}>{personalInfo.fullName || "Your Name"}</Text>
          {personalInfo.jobTitle ? (
            <Text style={styles.jobTitle}>{personalInfo.jobTitle}</Text>
          ) : null}

          <View style={styles.contactRow}>
            {personalInfo.email ? (
              <Text style={styles.contactItem}>{personalInfo.email}</Text>
            ) : null}
            {personalInfo.phone ? (
              <Text style={styles.contactItem}>{personalInfo.phone}</Text>
            ) : null}
            {personalInfo.location ? (
              <Text style={styles.contactItem}>{personalInfo.location}</Text>
            ) : null}
            {personalInfo.website ? (
              <Link
                style={styles.link}
                src={personalInfo.website.startsWith("http") ? personalInfo.website : `https://${personalInfo.website}`}
              >
                <Text style={styles.contactItem}>
                  {personalInfo.website.replace(/^https?:\/\//, "")}
                </Text>
              </Link>
            ) : null}
            {personalInfo.linkedin ? (
              <Link
                style={styles.link}
                src={personalInfo.linkedin.startsWith("http") ? personalInfo.linkedin : `https://${personalInfo.linkedin}`}
              >
                <Text style={styles.contactItem}>
                  {personalInfo.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, "in/")}
                </Text>
              </Link>
            ) : null}
            {personalInfo.github ? (
              <Link
                style={styles.link}
                src={personalInfo.github.startsWith("http") ? personalInfo.github : `https://${personalInfo.github}`}
              >
                <Text style={styles.contactItem}>
                  {personalInfo.github.replace(/^https?:\/\/(www\.)?github\.com\//, "github/")}
                </Text>
              </Link>
            ) : null}
          </View>
        </View>

        {/* Summary */}
        {personalInfo.summary ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Professional Summary</Text>
            <Text style={styles.summaryText}>{personalInfo.summary}</Text>
          </View>
        ) : null}

        {/* Experience */}
        {validExperience.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Work Experience</Text>
            {validExperience.map((item) => (
              <View key={item.id} style={styles.itemBlock} wrap={false}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle}>
                    {item.position}{" "}
                    {item.company ? (
                      <Text style={styles.companyHighlight}>• {item.company}</Text>
                    ) : null}
                  </Text>
                  <Text style={styles.itemDate}>
                    {item.startDate ? (
                      `${item.startDate} — ${item.current ? "Present" : item.endDate || "Present"}`
                    ) : ""}
                  </Text>
                </View>
                {item.location ? (
                  <Text style={styles.itemSubtitle}>{item.location}</Text>
                ) : null}
                {item.description ? (
                  <Text style={styles.itemDescription}>{item.description}</Text>
                ) : null}
              </View>
            ))}
          </View>
        ) : null}

        {/* Education */}
        {validEducation.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            {validEducation.map((item) => (
              <View key={item.id} style={styles.itemBlock} wrap={false}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle}>{item.institution}</Text>
                  <Text style={styles.itemDate}>
                    {item.startDate ? `${item.startDate} — ${item.endDate || "Present"}` : ""}
                  </Text>
                </View>
                {item.degree || item.fieldOfStudy ? (
                  <Text style={styles.itemSubtitle}>
                    {item.degree}
                    {item.degree && item.fieldOfStudy ? " in " : ""}
                    {item.fieldOfStudy}
                  </Text>
                ) : null}
                {item.description ? (
                  <Text style={styles.itemDescription}>{item.description}</Text>
                ) : null}
              </View>
            ))}
          </View>
        ) : null}

        {/* Skills */}
        {validSkills.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills & Competencies</Text>
            <View style={styles.skillsWrap}>
              {validSkills.map((s) => (
                <View key={s.id} style={styles.skillBadge}>
                  <Text>
                    {s.name}
                    {s.level ? ` (${s.level})` : ""}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {/* Projects */}
        {validProjects.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Projects</Text>
            {validProjects.map((project) => (
              <View key={project.id} style={styles.itemBlock} wrap={false}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle}>
                    {project.name}{" "}
                    {project.technologies ? (
                      <Text style={styles.itemSubtitle}>• {project.technologies}</Text>
                    ) : null}
                  </Text>
                  {project.url ? (
                    <Link
                      style={styles.projectLink}
                      src={project.url.startsWith("http") ? project.url : `https://${project.url}`}
                    >
                      <Text style={styles.projectLink}>
                        {project.url.replace(/^https?:\/\//, "")}
                      </Text>
                    </Link>
                  ) : null}
                </View>
                {project.description ? (
                  <Text style={styles.itemDescription}>{project.description}</Text>
                ) : null}
              </View>
            ))}
          </View>
        ) : null}
      </Page>
    </Document>
  );
}
