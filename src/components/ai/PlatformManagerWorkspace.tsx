"use client";

import React, { useState, useRef } from "react";
import { useCVStore } from "@/store/cv-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { AIPrivacyConsentBanner } from "./AIPrivacyConsentBanner";
import { CVData } from "@/types/cv";
import {
  FolderKanban,
  CopyPlus,
  History,
  Download,
  Upload,
  Activity,
  Trash2,
  CheckCircle2,
  RotateCcw,
  Plus,
} from "lucide-react";

export function PlatformManagerWorkspace() {
  const {
    cvData,
    profiles,
    versionHistory,
    aiUsageHistory,
    createProfile,
    duplicateProfile,
    switchProfile,
    deleteProfile,
    saveVersionSnapshot,
    restoreVersionSnapshot,
    deleteVersionSnapshot,
    importCVData,
    clearAIUsageHistory,
  } = useCVStore();

  const [newProfileTitle, setNewProfileTitle] = useState("");
  const [snapshotLabel, setSnapshotLabel] = useState("");
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [pendingDeleteProfile, setPendingDeleteProfile] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleExportJSON = () => {
    const jsonString = JSON.stringify(cvData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${(cvData.title || "claycv-backup")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as CVData;
        if (
          !parsed ||
          typeof parsed !== "object" ||
          Array.isArray(parsed) ||
          !parsed.personalInfo ||
          typeof parsed.personalInfo !== "object" ||
          typeof parsed.personalInfo.fullName !== "string"
        ) {
          setImportMessage(
            "Error: Invalid ClayCV JSON backup file (missing required personalInfo fields)."
          );
          return;
        }
        importCVData(parsed);
        setImportMessage(
          `Successfully restored CV backup: "${parsed.title || "Imported CV"}"`
        );
      } catch {
        setImportMessage("Error: Could not parse JSON file.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Full Privacy Notice & Consent Control */}
      <AIPrivacyConsentBanner />

      {/* 1. Multiple CV Profiles */}
      <div className="clay-card p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-[#8B7CF6]" />
            <div>
              <h3 className="text-base font-bold text-[#292735]">
                Multiple CV Profiles ({profiles.length})
              </h3>
              <p className="text-xs text-[#777482]">
                Maintain tailored CVs for different roles or languages locally
                in your browser.
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => duplicateProfile(cvData.id)}
          >
            <CopyPlus className="w-3.5 h-3.5 mr-1.5" />
            <span>Duplicate Active CV</span>
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="flex-1">
            <Input
              placeholder="New CV Profile Title (e.g. Frontend Engineer - ID)"
              value={newProfileTitle}
              onChange={(e) => setNewProfileTitle(e.target.value)}
            />
          </div>
          <Button
            type="button"
            variant="primary"
            onClick={() => {
              createProfile(newProfileTitle);
              setNewProfileTitle("");
            }}
          >
            <Plus className="w-4 h-4 mr-1" />
            <span>Create New Profile</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {profiles.map((prof) => {
            const isActive = prof.id === cvData.id;
            return (
              <div
                key={prof.id}
                className={`p-3.5 rounded-[16px] border flex items-center justify-between gap-2 transition-all ${
                  isActive
                    ? "bg-white border-[#8B7CF6] shadow-sm"
                    : "bg-[#FAF8F5] border-[rgba(70,65,90,0.08)]"
                }`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold text-[#292735] truncate">
                      {prof.title}
                    </p>
                    {isActive && (
                      <span className="px-2 py-0.5 rounded-full bg-[#EFEAFF] text-[#6C5BD8] text-[10px] font-bold">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#777482]">
                    {prof.language.toUpperCase()} • {prof.template} • Updated{" "}
                    {new Date(prof.updatedAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {!isActive && (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => switchProfile(prof.id)}
                    >
                      Switch
                    </Button>
                  )}
                  {profiles.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        setPendingDeleteProfile({
                          id: prof.id,
                          title: prof.title,
                        })
                      }
                      className="p-1.5 text-[#777482] hover:text-red-600 rounded-[8px] hover:bg-red-50 cursor-pointer"
                      title="Delete profile"
                      aria-label={`Delete profile ${prof.title}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. CV Version History */}
      <div className="clay-card p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-[#8B7CF6]" />
          <div>
            <h3 className="text-base font-bold text-[#292735]">
              CV Version History ({versionHistory.length})
            </h3>
            <p className="text-xs text-[#777482]">
              Save snapshots before making major edits or applying AI
              recommendations, and restore anytime.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="flex-1">
            <Input
              placeholder="Snapshot note (e.g. Before tailoring for Stripe role)"
              value={snapshotLabel}
              onChange={(e) => setSnapshotLabel(e.target.value)}
            />
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              saveVersionSnapshot(snapshotLabel);
              setSnapshotLabel("");
            }}
          >
            <CheckCircle2 className="w-4 h-4 mr-1.5 text-[#8B7CF6]" />
            <span>Save Snapshot</span>
          </Button>
        </div>

        {versionHistory.length === 0 ? (
          <p className="text-xs text-[#777482] italic">
            No snapshots saved yet. Click &ldquo;Save Snapshot&rdquo; to create
            a restore point.
          </p>
        ) : (
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {versionHistory.map((ver) => (
              <div
                key={ver.id}
                className="p-3 rounded-[14px] bg-[#FAF8F5] border border-[rgba(70,65,90,0.08)] flex items-center justify-between gap-2 text-xs"
              >
                <div>
                  <p className="font-bold text-[#292735]">{ver.label}</p>
                  <p className="text-[11px] text-[#777482]">
                    {new Date(ver.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => restoreVersionSnapshot(ver.id)}
                  >
                    <RotateCcw className="w-3.5 h-3.5 mr-1" />
                    <span>Restore</span>
                  </Button>
                  <button
                    type="button"
                    onClick={() => deleteVersionSnapshot(ver.id)}
                    className="p-1.5 text-[#777482] hover:text-red-600 rounded-[8px] cursor-pointer"
                    title="Delete snapshot"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. JSON Backup & Restore */}
      <div className="clay-card p-5 sm:p-6 space-y-3">
        <h3 className="text-base font-bold text-[#292735]">
          Local JSON Backup & Restore
        </h3>
        <p className="text-xs text-[#777482]">
          Export your CV data to a portable JSON file or restore from an
          existing backup.
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={handleImportJSON}
        />

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleExportJSON}
          >
            <Download className="w-4 h-4 mr-1.5 text-[#8B7CF6]" />
            <span>Export Active CV (.json)</span>
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-4 h-4 mr-1.5 text-[#8B7CF6]" />
            <span>Import Backup (.json)</span>
          </Button>
        </div>

        {importMessage && (
          <p className="text-xs font-semibold text-[#6C5BD8] pt-1">
            {importMessage}
          </p>
        )}
      </div>

      {/* 4. AI Usage History & Management */}
      <div className="clay-card p-5 sm:p-6 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#8B7CF6]" />
            <div>
              <h3 className="text-base font-bold text-[#292735]">
                AI Usage History ({aiUsageHistory.length})
              </h3>
              <p className="text-xs text-[#777482]">
                Local log of your explicit Google Gemini API requests.
              </p>
            </div>
          </div>
          {aiUsageHistory.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearAIUsageHistory}
            >
              Clear Log
            </Button>
          )}
        </div>

        {aiUsageHistory.length === 0 ? (
          <p className="text-xs text-[#777482] italic">
            No AI operations executed in this session yet.
          </p>
        ) : (
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {aiUsageHistory.map((item) => (
              <div
                key={item.id}
                className="p-2.5 rounded-[12px] bg-[#FAF8F5] text-xs flex items-center justify-between gap-2"
              >
                <div>
                  <span className="font-bold text-[#292735] uppercase">
                    [{item.feature}]
                  </span>{" "}
                  <span>{item.operation.replace(/_/g, " ")}</span>
                  <span className="text-[11px] text-[#777482] ml-2">
                    ({item.model})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      item.status === "success"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    {item.status}
                  </span>
                  <span className="text-[10px] text-[#777482]">
                    {new Date(item.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog
        isOpen={Boolean(pendingDeleteProfile)}
        onClose={() => setPendingDeleteProfile(null)}
        title="Delete CV Profile"
        description={
          pendingDeleteProfile
            ? `Are you sure you want to permanently delete "${pendingDeleteProfile.title}" from local storage? This action cannot be undone.`
            : ""
        }
        confirmLabel="Delete Profile"
        cancelLabel="Cancel"
        isDestructive
        onConfirm={() => {
          if (pendingDeleteProfile) {
            deleteProfile(pendingDeleteProfile.id);
          }
        }}
      />
    </div>
  );
}

