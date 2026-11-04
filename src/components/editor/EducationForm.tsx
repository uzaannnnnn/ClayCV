"use client";

import React from "react";
import { useCVStore } from "@/store/cv-store";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MonthYearSelect } from "@/components/ui/month-year-select";
import { Plus, Trash2, GraduationCap } from "lucide-react";
import { validateDateRange } from "@/lib/dates/date-utils";

export function EducationForm() {
  const { cvData, addEducation, updateEducation, removeEducation } =
    useCVStore();
  const { education, language } = cvData;

  return (
    <div className="space-y-5 pt-2">
      {education.length === 0 ? (
        <div className="text-center py-6 px-4 border border-dashed border-[rgba(70,65,90,0.15)] rounded-[18px] bg-[#FAF8F5]">
          <GraduationCap className="w-8 h-8 text-[#A29FAC] mx-auto mb-2" />
          <p className="text-sm font-semibold text-[#292735]">
            No education records added
          </p>
          <p className="text-xs text-[#777482] mt-0.5 mb-4">
            Add degrees, universities, or academic institutions attended.
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
          {education.map((item, idx) => {
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
                    EDUCATION #{idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeEducation(item.id)}
                    className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 transition-colors px-2 py-1 rounded-[8px] hover:bg-red-50 cursor-pointer"
                    title="Remove this education entry"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                </div>

                {/* Institution */}
                <Input
                  label="Institution / University *"
                  placeholder="e.g. Stanford University, UC Berkeley"
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

                {/* Dates (Month/Year Dropdowns) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <MonthYearSelect
                    label="Start Date"
                    monthValue={item.startMonth}
                    yearValue={item.startYear}
                    onChangeMonth={(m) =>
                      updateEducation(item.id, { startMonth: m })
                    }
                    onChangeYear={(y) =>
                      updateEducation(item.id, { startYear: y })
                    }
                    language={language}
                    idPrefix={`edu-start-${item.id}`}
                  />

                  <MonthYearSelect
                    label="End Date"
                    monthValue={item.current ? null : item.endMonth}
                    yearValue={item.current ? null : item.endYear}
                    onChangeMonth={(m) =>
                      updateEducation(item.id, { endMonth: m })
                    }
                    onChangeYear={(y) =>
                      updateEducation(item.id, { endYear: y })
                    }
                    disabled={item.current}
                    language={language}
                    idPrefix={`edu-end-${item.id}`}
                  />
                </div>

                {dateError && (
                  <p className="text-xs text-red-500 font-medium">{dateError}</p>
                )}

                {/* Currently Studying Checkbox */}
                <div className="flex items-center gap-2 pt-0.5">
                  <input
                    type="checkbox"
                    id={`current-edu-${item.id}`}
                    checked={item.current}
                    onChange={(e) =>
                      updateEducation(item.id, {
                        current: e.target.checked,
                        endMonth: e.target.checked ? null : item.endMonth,
                        endYear: e.target.checked ? null : item.endYear,
                      })
                    }
                    className="w-4 h-4 rounded text-[#8B7CF6] focus:ring-[#8B7CF6] cursor-pointer"
                  />
                  <label
                    htmlFor={`current-edu-${item.id}`}
                    className="text-xs font-medium text-[#292735] cursor-pointer select-none"
                  >
                    I am currently studying here
                  </label>
                </div>

                {/* Optional Academic Fields */}
                <div className="pt-2 border-t border-gray-100 space-y-3">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#777482]">
                    Optional Academic Details (Only rendered when filled)
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <Input
                      label="GPA"
                      placeholder="e.g. 3.88 / 4.00"
                      value={item.gpa}
                      onChange={(e) =>
                        updateEducation(item.id, { gpa: e.target.value })
                      }
                    />
                    <Input
                      label="DEFENSE GRADE"
                      placeholder="e.g. A or 94/100"
                      value={item.defenseGrade}
                      onChange={(e) =>
                        updateEducation(item.id, {
                          defenseGrade: e.target.value,
                        })
                      }
                    />
                    <div className="sm:col-span-1">
                      <Input
                        label="THESIS TITLE"
                        placeholder="e.g. Distributed Consensus"
                        value={item.thesisTitle}
                        onChange={(e) =>
                          updateEducation(item.id, {
                            thesisTitle: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Description */}
                <Textarea
                  label="Description & Honors (Optional)"
                  rows={2}
                  placeholder="e.g. Graduated Magna Cum Laude, President of Computing Society."
                  value={item.description}
                  onChange={(e) =>
                    updateEducation(item.id, { description: e.target.value })
                  }
                />
              </div>
            );
          })}

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
