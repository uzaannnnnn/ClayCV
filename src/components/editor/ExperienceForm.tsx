"use client";

import React from "react";
import { useCVStore } from "@/store/cv-store";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MonthYearSelect } from "@/components/ui/month-year-select";
import { CVLanguage, EmploymentType, WorkMode } from "@/types/cv";
import { Plus, Trash2, Briefcase, Sparkles } from "lucide-react";
import { validateDateRange } from "@/lib/dates/date-utils";

const FIELD_LABEL_CLASS =
  "block text-[11px] font-bold uppercase tracking-wider text-[#777482] truncate whitespace-nowrap";

const EMPLOYMENT_TYPE_OPTIONS: Record<
  CVLanguage,
  { value: EmploymentType; label: string }[]
> = {
  en: [
    { value: "internship", label: "Internship" },
    { value: "full-time", label: "Full-time" },
    { value: "part-time", label: "Part-time" },
    { value: "freelance", label: "Freelance" },
  ],
  id: [
    { value: "internship", label: "Magang" },
    { value: "full-time", label: "Penuh Waktu" },
    { value: "part-time", label: "Paruh Waktu" },
    { value: "freelance", label: "Freelance" },
  ],
};

const WORK_MODE_OPTIONS: Record<
  CVLanguage,
  { value: WorkMode; label: string }[]
> = {
  en: [
    { value: "onsite", label: "Onsite" },
    { value: "remote", label: "Remote" },
  ],
  id: [
    { value: "onsite", label: "Di Kantor" },
    { value: "remote", label: "Jarak Jauh" },
  ],
};

export function ExperienceForm() {
  const {
    cvData,
    addExperience,
    updateExperience,
    removeExperience,
    setActiveWorkspace,
  } = useCVStore();
  const { experience, language } = cvData;

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
          {experience.map((item, idx) => {
            const dateError = validateDateRange(
              item.startMonth,
              item.startYear,
              item.endMonth,
              item.endYear,
              item.current
            );

            return (
              <div
                key={item.id}
                className="clay-card-sm p-4 sm:p-5 bg-white relative space-y-4 border border-[rgba(70,65,90,0.08)]"
              >
                {/* Item Header */}
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <span className="text-xs font-bold text-[#8B7CF6]">
                    ROLE #{idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeExperience(item.id)}
                    className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 transition-colors px-2 py-1 rounded-[8px] hover:bg-red-50 cursor-pointer"
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

                {/* Location, Employment Type & Work Mode */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-4 items-start">
                  <Input
                    label="Location"
                    labelClassName={FIELD_LABEL_CLASS}
                    placeholder="e.g. San Francisco, CA"
                    value={item.location}
                    onChange={(e) =>
                      updateExperience(item.id, { location: e.target.value })
                    }
                  />

                  {/* Employment Type */}
                  <Select
                    label="Employment Type"
                    labelClassName={FIELD_LABEL_CLASS}
                    value={item.employmentType}
                    onChange={(val) =>
                      updateExperience(item.id, {
                        employmentType: val as EmploymentType,
                      })
                    }
                    options={EMPLOYMENT_TYPE_OPTIONS[language]}
                  />

                  {/* Work Arrangement */}
                  <div className="sm:col-span-2 md:col-span-1">
                    <Select
                      label="Work Arrangement"
                      labelClassName={FIELD_LABEL_CLASS}
                      value={item.workMode}
                      onChange={(val) =>
                        updateExperience(item.id, {
                          workMode: val as WorkMode,
                        })
                      }
                      options={WORK_MODE_OPTIONS[language]}
                    />
                  </div>
                </div>

                {/* Dates (Month/Year Dropdowns) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <MonthYearSelect
                    label="Start Date"
                    monthValue={item.startMonth}
                    yearValue={item.startYear}
                    onChangeMonth={(m) =>
                      updateExperience(item.id, { startMonth: m })
                    }
                    onChangeYear={(y) =>
                      updateExperience(item.id, { startYear: y })
                    }
                    language={language}
                    idPrefix={`exp-start-${item.id}`}
                  />

                  <MonthYearSelect
                    label="End Date"
                    monthValue={item.current ? null : item.endMonth}
                    yearValue={item.current ? null : item.endYear}
                    onChangeMonth={(m) =>
                      updateExperience(item.id, { endMonth: m })
                    }
                    onChangeYear={(y) =>
                      updateExperience(item.id, { endYear: y })
                    }
                    disabled={item.current}
                    language={language}
                    idPrefix={`exp-end-${item.id}`}
                  />
                </div>

                {dateError && (
                  <p className="text-xs text-red-500 font-medium">{dateError}</p>
                )}

                {/* Current Role Checkbox */}
                <div className="flex items-center gap-2 pt-0.5">
                  <input
                    type="checkbox"
                    id={`current-${item.id}`}
                    checked={item.current}
                    onChange={(e) =>
                      updateExperience(item.id, {
                        current: e.target.checked,
                        endMonth: e.target.checked ? null : item.endMonth,
                        endYear: e.target.checked ? null : item.endYear,
                      })
                    }
                    className="w-4 h-4 rounded text-[#8B7CF6] focus:ring-[#8B7CF6] cursor-pointer"
                  />
                  <label
                    htmlFor={`current-${item.id}`}
                    className="text-xs font-medium text-[#292735] cursor-pointer select-none"
                  >
                    I am currently working in this role (Present / Sekarang)
                  </label>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => setActiveWorkspace("writing")}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#8B7CF6] hover:text-[#6C5BD8] cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Improve with Gemini AI</span>
                    </button>
                  </div>
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
              </div>
            );
          })}

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
