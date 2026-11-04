"use client";

import React from "react";
import { useCVStore } from "@/store/cv-store";
import { Textarea } from "@/components/ui/textarea";

export function SummaryForm() {
  const { cvData, updatePersonalInfo } = useCVStore();
  const { summary } = cvData.personalInfo;

  return (
    <div className="pt-2">
      <Textarea
        label="Professional Summary"
        rows={4}
        placeholder="Brief 2-4 sentence summary of your background, core strengths, and career highlights..."
        value={summary}
        onChange={(e) => updatePersonalInfo({ summary: e.target.value })}
        helperText="A concise overview emphasizing years of experience, core domains, and key impact."
      />
    </div>
  );
}
