"use client";

import React from "react";
import { useCVStore } from "@/store/cv-store";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, GraduationCap } from "lucide-react";

export function EducationForm() {
  const { cvData, addEducation, updateEducation, removeEducation } =
    useCVStore();
  const { education } = cvData;

  return (
    <div className="space-y-5 pt-2">
      {education.length === 0 ? (
        <div className="text-center py-6 px-4 border border-dashed border-[rgba(70,65,90,0.15)] rounded-[18px] bg-[#FAF8F5]">
          <GraduationCap className="w-8 h-8 text-[#A29FAC] mx-auto mb-2" />
          <p className="text-sm font-semibold text-[#292735]">
            No education records added
          </p>
          <p className="text-xs text-[#777482] mt-0.5 mb-4">
            Add degrees, certifications, or academic institutions attended.
          </p>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => addEducation()}
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Education
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {education.map((item, idx) => (
            <div
              key={item.id}
              className="clay-card-sm p-4 sm:p-5 bg-white relative space-y-3.5 border border-[rgba(70,65,90,0.08)]"
            >
              {/* Item Header */}
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <span className="text-xs font-bold text-[#8B7CF6]">
                  EDUCATION #{idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeEducation(item.id)}
                  className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 transition-colors px-2 py-1 rounded-[8px] hover:bg-red-50"
                  title="Remove this education entry"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              </div>

              {/* Institution */}
              <Input
                label="Institution / University *"
                placeholder="e.g. Stanford University or MIT"
                value={item.institution}
                onChange={(e) =>
                  updateEducation(item.id, { institution: e.target.value })
                }
              />

              {/* Degree & Field of Study */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <Input
                  label="Degree"
                  placeholder="e.g. Bachelor of Science"
                  value={item.degree}
                  onChange={(e) =>
                    updateEducation(item.id, { degree: e.target.value })
                  }
                />
                <Input
                  label="Field of Study"
                  placeholder="e.g. Computer Science"
                  value={item.fieldOfStudy}
                  onChange={(e) =>
                    updateEducation(item.id, { fieldOfStudy: e.target.value })
                  }
                />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <Input
                  label="Start Year / Date"
                  placeholder="e.g. 2016"
                  value={item.startDate}
                  onChange={(e) =>
                    updateEducation(item.id, { startDate: e.target.value })
                  }
                />
                <Input
                  label="End Year / Date"
                  placeholder="e.g. 2020 or Present"
                  value={item.endDate}
                  onChange={(e) =>
                    updateEducation(item.id, { endDate: e.target.value })
                  }
                />
              </div>

              {/* Description */}
              <Textarea
                label="Description & Honors (Optional)"
                rows={2}
                placeholder="e.g. Graduated Magna Cum Laude, GPA 3.9/4.0. Capstone on Distributed Consensus."
                value={item.description}
                onChange={(e) =>
                  updateEducation(item.id, { description: e.target.value })
                }
              />
            </div>
          ))}

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => addEducation()}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Another Education
          </Button>
        </div>
      )}
    </div>
  );
}
