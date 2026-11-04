import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { CVData } from "@/types/cv";

const styles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 36,
    paddingLeft: 42,
    paddingRight: 42,
    fontSize: 9.5,
    fontFamily: "Times-Roman",
    color: "#111827",
    lineHeight: 1.45,
  },
  header: {
    textAlign: "center",
    borderBottomWidth: 1.5,
    borderBottomColor: "#000000",
    paddingBottom: 8,
    marginBottom: 12,
  },
  fullName: {
    fontSize: 20,
    fontFamily: "Times-Bold",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: "#000000",
    textAlign: "center",
  },
  jobTitle: {
    fontSize: 10.5,
    fontFamily: "Times-Italic",
    color: "#374151",
    marginTop: 2,
    textAlign: "center",
  },
  contactText: {
    fontSize: 8.5,
    fontFamily: "Helvetica",
    color: "#4B5563",
    marginTop: 5,
    textAlign: "center",
  },
  section: {
    marginBottom: 11,
  },
  sectionTitle: {
    fontSize: 9.5,
    fontFamily: "Times-Bold",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    borderBottomWidth: 0.75,
    borderBottomColor: "#9CA3AF",
    paddingBottom: 2,
    marginBottom: 6,
    color: "#000000",
  },
  summaryText: {
    fontSize: 9,
    fontFamily: "Helvetica",
    color: "#1F2937",
    lineHeight: 1.45,
  },
  itemBlock: {
    marginBottom: 7,
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
    color: "#000000",
  },
  itemDate: {
    fontSize: 8.5,
    fontFamily: "Helvetica",
    color: "#4B5563",
  },
  itemSubtitle: {
    fontSize: 8.5,
    fontFamily: "Times-Italic",
    color: "#374151",
    marginBottom: 2,
  },
  itemDescription: {
    fontSize: 8.5,
    fontFamily: "Helvetica",
    color: "#1F2937",
    lineHeight: 1.4,
  },
  skillsText: {
    fontSize: 8.5,
    fontFamily: "Helvetica",
    color: "#1F2937",
    lineHeight: 1.4,
  },
  bold: {
    fontFamily: "Helvetica-Bold",
  },
});

export function ClassicPdfDocument({ data }: { data: CVData }) {
  const { personalInfo, education, experience, skills, projects } = data;

  const validEducation = education.filter(
    (e) => e.institution.trim() || e.degree.trim() || e.fieldOfStudy.trim()
  );
  const validExperience = experience.filter(
    (e) => e.company.trim() || e.position.trim()
  );
  const validSkills = skills.filter((s) => s.name.trim());
  const validProjects = projects.filter((p) => p.name.trim());

  const contactList: string[] = [];
  if (personalInfo.email) contactList.push(personalInfo.email);
  if (personalInfo.phone) contactList.push(personalInfo.phone);
  if (personalInfo.location) contactList.push(personalInfo.location);
  if (personalInfo.website)
    contactList.push(personalInfo.website.replace(/^https?:\/\//, ""));
  if (personalInfo.linkedin)
    contactList.push(
      personalInfo.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, "linkedin.com/in/")
    );
  if (personalInfo.github)
    contactList.push(
      personalInfo.github.replace(/^https?:\/\/(www\.)?github\.com\//, "github.com/")
    );

  return (
    <Document title={`${data.title || "CV"} - ClayCV`}>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.fullName}>{personalInfo.fullName || "YOUR NAME"}</Text>
          {personalInfo.jobTitle ? (
            <Text style={styles.jobTitle}>{personalInfo.jobTitle}</Text>
          ) : null}
          {contactList.length > 0 ? (
            <Text style={styles.contactText}>{contactList.join("   |   ")}</Text>
          ) : null}
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
            <Text style={styles.sectionTitle}>Professional Experience</Text>
            {validExperience.map((item) => (
              <View key={item.id} style={styles.itemBlock} wrap={false}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle}>
                    {item.company}
                    {item.position ? ` — ${item.position}` : ""}
                  </Text>
                  <Text style={styles.itemDate}>
                    {item.startDate ? (
                      `${item.startDate} – ${item.current ? "Present" : item.endDate || "Present"}`
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
                    {item.startDate ? `${item.startDate} – ${item.endDate || "Present"}` : ""}
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
            <Text style={styles.sectionTitle}>Skills & Qualifications</Text>
            <Text style={styles.skillsText}>
              {validSkills.map((s, idx) => (
                <Text key={s.id}>
                  <Text style={styles.bold}>{s.name}</Text>
                  {s.level ? ` (${s.level})` : ""}
                  {idx < validSkills.length - 1 ? "  •  " : ""}
                </Text>
              ))}
            </Text>
          </View>
        ) : null}

        {/* Projects */}
        {validProjects.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notable Projects</Text>
            {validProjects.map((project) => (
              <View key={project.id} style={styles.itemBlock} wrap={false}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle}>
                    {project.name}{" "}
                    {project.technologies ? `[${project.technologies}]` : ""}
                  </Text>
                  {project.url ? (
                    <Text style={styles.itemDate}>
                      {project.url.replace(/^https?:\/\//, "")}
                    </Text>
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
