"use client";

import React, { useState } from "react";
import { useCVStore } from "@/store/cv-store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, X, Wrench, Sparkles } from "lucide-react";

export function SkillsForm() {
  const { cvData, addSkill, removeSkill, setActiveWorkspace } = useCVStore();
  const { skills } = cvData;

  const [skillInput, setSkillInput] = useState("");
  const [error, setError] = useState("");

  const handleAddSkill = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = skillInput.trim();
    if (!trimmed) {
      setError("Please enter a skill name");
      return;
    }

    const isDuplicate = skills.some(
      (s) => s.name.trim().toLowerCase() === trimmed.toLowerCase()
    );
    if (isDuplicate) {
      setError(`"${trimmed}" is already added`);
      return;
    }

    addSkill(trimmed);
    setSkillInput("");
    setError("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddSkill();
    }
  };

  return (
    <div className="space-y-5 pt-2">
      {/* Skill Input Row */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-end gap-3">
          <div className="w-full sm:flex-1">
            <Input
              label="Skill Name"
              placeholder="e.g. TypeScript, React, System Architecture, Docker"
              value={skillInput}
              onChange={(e) => {
                setSkillInput(e.target.value);
                if (error) setError("");
              }}
              onKeyDown={handleKeyDown}
              error={error}
              helperText="Press Enter or click Add to append."
            />
          </div>

          <Button
            type="button"
            variant="primary"
            onClick={() => handleAddSkill()}
            className="w-full sm:w-auto shrink-0 h-11"
          >
            <Plus className="w-4 h-4 mr-1" />
            <span>Add Skill</span>
          </Button>
        </div>
      </div>

      {/* Skills Pill List */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#777482]">
            Added Skills ({skills.length})
          </label>
          <button
            type="button"
            onClick={() => setActiveWorkspace("writing")}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#8B7CF6] hover:text-[#6C5BD8] cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Get AI Skill Suggestions</span>
          </button>
        </div>

        {skills.length === 0 ? (
          <div className="text-center py-6 border border-dashed border-[rgba(70,65,90,0.15)] rounded-[18px] bg-[#FAF8F5]">
            <Wrench className="w-7 h-7 text-[#A29FAC] mx-auto mb-1.5" />
            <p className="text-xs text-[#777482]">
              No skills added yet. Type a skill above and press Add or Enter.
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 p-3.5 bg-white/80 rounded-[18px] border border-[rgba(70,65,90,0.08)]">
            {skills.map((skill) => (
              <span
                key={skill.id}
                className="clay-badge group inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white text-[#292735] hover:border-[#8B7CF6]/40 transition-colors shadow-sm"
              >
                <span>{skill.name}</span>
                <button
                  type="button"
                  onClick={() => removeSkill(skill.id)}
                  className="text-[#777482] hover:text-red-500 rounded-full p-0.5 transition-colors focus:outline-none cursor-pointer"
                  aria-label={`Remove ${skill.name}`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
