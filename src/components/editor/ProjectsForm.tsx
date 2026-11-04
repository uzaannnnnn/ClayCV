"use client";

import React from "react";
import { useCVStore } from "@/store/cv-store";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, FolderGit2 } from "lucide-react";

export function ProjectsForm() {
  const { cvData, addProject, updateProject, removeProject } = useCVStore();
  const { projects } = cvData;

  const validateUrl = (val: string) => {
    if (!val) return "";
    try {
      const url = val.startsWith("http://") || val.startsWith("https://") ? val : `https://${val}`;
      new URL(url);
      return "";
    } catch {
      return "Please enter a valid URL";
    }
  };

  return (
    <div className="space-y-5 pt-2">
      {projects.length === 0 ? (
        <div className="text-center py-6 px-4 border border-dashed border-[rgba(70,65,90,0.15)] rounded-[18px] bg-[#FAF8F5]">
          <FolderGit2 className="w-8 h-8 text-[#A29FAC] mx-auto mb-2" />
          <p className="text-sm font-semibold text-[#292735]">
            No projects added
          </p>
          <p className="text-xs text-[#777482] mt-0.5 mb-4">
            Showcase personal open-source projects, apps, client deliverables, or case studies.
          </p>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => addProject()}
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add First Project
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map((item, idx) => (
            <div
              key={item.id}
              className="clay-card-sm p-4 sm:p-5 bg-white relative space-y-3.5 border border-[rgba(70,65,90,0.08)]"
            >
              {/* Item Header */}
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <span className="text-xs font-bold text-[#8B7CF6]">
                  PROJECT #{idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeProject(item.id)}
                  className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 transition-colors px-2 py-1 rounded-[8px] hover:bg-red-50 cursor-pointer"
                  title="Remove this project"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              </div>

              {/* Project Name & Tech */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <Input
                  label="Project Name *"
                  placeholder="e.g. ClayCV, Distributed Analytics"
                  value={item.name}
                  onChange={(e) =>
                    updateProject(item.id, { name: e.target.value })
                  }
                />
                <Input
                  label="Technologies Used"
                  placeholder="e.g. Next.js, TypeScript, Tailwind"
                  value={item.technologies}
                  onChange={(e) =>
                    updateProject(item.id, { technologies: e.target.value })
                  }
                />
              </div>

              {/* URL */}
              <Input
                label="Project Link / Repo URL (Clickable in PDF)"
                placeholder="e.g. https://github.com/username/project"
                value={item.url}
                onChange={(e) =>
                  updateProject(item.id, { url: e.target.value })
                }
                error={validateUrl(item.url)}
              />

              {/* Description */}
              <Textarea
                label="Project Description"
                rows={2}
                placeholder="Briefly describe the problem solved, architecture choices, and impact..."
                value={item.description}
                onChange={(e) =>
                  updateProject(item.id, { description: e.target.value })
                }
              />
            </div>
          ))}

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => addProject()}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Another Project
          </Button>
        </div>
      )}
    </div>
  );
}
