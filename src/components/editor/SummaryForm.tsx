"use client";

import React from "react";
import { useCVStore } from "@/store/cv-store";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export function SummaryForm() {
  const { cvData, updatePersonalInfo, setActiveWorkspace } = useCVStore();
  const { summary } = cvData.personalInfo;

  return (
    <div className="pt-2 space-y-2.5">
      <div className="flex items-center justify-end">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setActiveWorkspace("writing")}
          className="text-xs text-[#6C5BD8] hover:text-[#5546BE] px-3"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Improve with AI</span>
        </Button>
      </div>
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
