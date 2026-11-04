"use client";

import React from "react";
import { useCVStore } from "@/store/cv-store";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Briefcase } from "lucide-react";

export function ExperienceForm() {
  const { cvData, addExperience, updateExperience, removeExperience } =
    useCVStore();
  const { experience } = cvData;

  return (
    <div className="space-y-5 pt-2">
      {experience.length === 0 ? (
        <div className="text-center py-6 px-4 border border-dashed border-[rgba(70,65,90,0.15)] rounded-[18px] bg-[#FAF8F5]">
          <Briefcase className="w-8 h-8 text-[#A29FAC] mx-auto mb-2" />
          <p className="text-sm font-semibold text-[#292735]">
            No experience records added
          </p>
          <p className="text-xs text-[#777482] mt-0.5 mb-4">
            Highlight your current and previous job roles, achievements, and impact.
          </p>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => addExperience()}
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add First Job Experience
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {experience.map((item, idx) => (
            <div
              key={item.id}
              className="clay-card-sm p-4 sm:p-5 bg-white relative space-y-3.5 border border-[rgba(70,65,90,0.08)]"
            >
              {/* Item Header */}
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <span className="text-xs font-bold text-[#8B7CF6]">
                  ROLE #{idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeExperience(item.id)}
                  className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 transition-colors px-2 py-1 rounded-[8px] hover:bg-red-50"
                  title="Remove this role"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              </div>

              {/* Company & Position */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <Input
                  label="Company Name *"
                  placeholder="e.g. Stripe, Acme Corp"
                  value={item.company}
                  onChange={(e) =>
                    updateExperience(item.id, { company: e.target.value })
                  }
                />
                <Input
                  label="Job Position *"
                  placeholder="e.g. Lead Frontend Engineer"
                  value={item.position}
                  onChange={(e) =>
                    updateExperience(item.id, { position: e.target.value })
                  }
                />
              </div>

              {/* Location & Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 items-end">
                <Input
                  label="Location"
                  placeholder="e.g. New York, NY or Remote"
                  value={item.location}
                  onChange={(e) =>
                    updateExperience(item.id, { location: e.target.value })
                  }
                />
                <Input
                  label="Start Date"
                  placeholder="e.g. Jan 2021 or 2021"
                  value={item.startDate}
                  onChange={(e) =>
                    updateExperience(item.id, { startDate: e.target.value })
                  }
                />
                <Input
                  label="End Date"
                  placeholder={item.current ? "Present" : "e.g. Dec 2023"}
                  value={item.current ? "" : item.endDate}
                  disabled={item.current}
                  onChange={(e) =>
                    updateExperience(item.id, { endDate: e.target.value })
                  }
                />
              </div>

              {/* Current Role Checkbox */}
              <div className="flex items-center gap-2 pt-0.5">
                <input
                  type="checkbox"
                  id={`current-${item.id}`}
                  checked={item.current}
                  onChange={(e) =>
                    updateExperience(item.id, {
                      current: e.target.checked,
                      endDate: e.target.checked ? "" : item.endDate,
                    })
                  }
                  className="w-4 h-4 rounded text-[#8B7CF6] focus:ring-[#8B7CF6] cursor-pointer"
                />
                <label
                  htmlFor={`current-${item.id}`}
                  className="text-xs font-medium text-[#292735] cursor-pointer select-none"
                >
                  I am currently working in this role
                </label>
              </div>

              {/* Description */}
              <Textarea
                label="Role Description & Accomplishments"
                rows={3}
                placeholder="• Architected and shipped scalable features...&#10;• Led sprint planning and cross-functional teams...&#10;• Increased performance metrics by 40%."
                value={item.description}
                onChange={(e) =>
                  updateExperience(item.id, { description: e.target.value })
                }
              />
            </div>
          ))}

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => addExperience()}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Another Experience
          </Button>
        </div>
      )}
    </div>
  );
}
