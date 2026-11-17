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
  HardDrive,
} from "lucide-react";

const FEATURE_LABELS: Record<string, string> = {
  writing: "AI Writing",
  matching: "Job Matcher",
  analysis: "CV Analyzer",
  career: "Career Assistant",
};

function formatOperationName(op: string): string {
  return op
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

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
  const [importMessage, setImportMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
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
          setImportMessage({
            type: "error",
            text: "This file does not look like a valid ClayCV JSON backup. Your current CV was not changed.",
          });
          return;
        }
        importCVData(parsed);
        setImportMessage({
          type: "success",
          text: `Restored CV backup: "${parsed.title || "Imported CV"}"`,
        });
      } catch {
        setImportMessage({
          type: "error",
          text: "Could not read this JSON file. Please check the file and try again.",
        });
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* 1. My CVs */}
      <div className="clay-card p-4 sm:p-6 space-y-3.5 sm:space-y-4">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div className="flex items-start gap-2.5 min-w-0 flex-1">
            <div className="w-9 h-9 rounded-[12px] bg-[#EFEAFF] text-[#6C5BD8] flex items-center justify-center shrink-0 mt-0.5">
              <FolderKanban className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-[#292735]">
                My CVs ({profiles.length})
              </h2>
              <p className="hidden sm:block text-xs text-[#595566] leading-relaxed">
                Keep tailored CVs for different roles or languages saved safely
                in your browser.
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => duplicateProfile(cvData.id)}
            className="shrink-0"
          >
            <CopyPlus className="w-3.5 h-3.5" />
            <span>Duplicate CV</span>
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="flex-1">
            <Input
              aria-label="New CV name"
              placeholder="New CV name (e.g. Frontend Engineer - ID)"
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
            className="shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create New CV</span>
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
                      <span className="px-2 py-0.5 rounded-full bg-[#EFEAFF] text-[#6C5BD8] text-[10px] font-bold shrink-0">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#595566] mt-0.5">
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
                      Open
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
                      className="min-h-[40px] min-w-[40px] flex items-center justify-center text-[#595566] hover:text-[#B91C1C] rounded-[10px] hover:bg-[#FEECEB] cursor-pointer transition-colors"
                      title="Delete CV"
                      aria-label={`Delete CV ${prof.title}`}
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
      <div className="clay-card p-4 sm:p-6 space-y-3.5 sm:space-y-4">
        <div className="flex items-start gap-2.5">
          <div className="w-9 h-9 rounded-[12px] bg-[#EFEAFF] text-[#6C5BD8] flex items-center justify-center shrink-0 mt-0.5">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-[#292735]">
              CV Version History ({versionHistory.length})
            </h3>
            <p className="hidden sm:block text-xs text-[#595566] leading-relaxed">
              Save checkpoints before big edits so you can return to an earlier
              version anytime.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="flex-1">
            <Input
              aria-label="Version snapshot label"
              placeholder="Checkpoint note (e.g. Before tailoring for product role)"
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
            className="shrink-0"
          >
            <CheckCircle2 className="w-4 h-4 text-[#6C5BD8]" />
            <span>Save Snapshot</span>
          </Button>
        </div>

        {versionHistory.length === 0 ? (
          <p className="text-xs text-[#595566] italic">
            No saved checkpoints yet. Click &ldquo;Save Snapshot&rdquo; to create
            a restore point.
          </p>
        ) : (
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {versionHistory.map((ver) => (
              <div
                key={ver.id}
                className="p-3 rounded-[14px] bg-[#FAF8F5] border border-[rgba(70,65,90,0.08)] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div>
                  <p className="font-bold text-[#292735]">{ver.label}</p>
                  <p className="text-xs text-[#595566]">
                    {new Date(ver.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 self-end sm:self-center">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => restoreVersionSnapshot(ver.id)}
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restore</span>
                  </Button>
                  <button
                    type="button"
                    onClick={() => deleteVersionSnapshot(ver.id)}
                    className="min-h-[38px] min-w-[38px] flex items-center justify-center text-[#595566] hover:text-[#B91C1C] rounded-[10px] hover:bg-[#FEECEB] cursor-pointer transition-colors"
                    title="Delete snapshot"
                    aria-label={`Delete snapshot ${ver.label}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Backup & Import CV */}
      <div className="clay-card p-4 sm:p-6 space-y-3">
        <h3 className="text-sm sm:text-base font-bold text-[#292735]">
          Backup & Import CV
        </h3>
        <p className="hidden sm:block text-xs text-[#595566] leading-relaxed">
          Download a backup copy of your active CV or import one you saved
          earlier.
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
            <Download className="w-4 h-4 text-[#6C5BD8]" />
            <span>Export Backup (.json)</span>
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-4 h-4 text-[#6C5BD8]" />
            <span>Import CV (.json)</span>
          </Button>
        </div>

        {importMessage && (
          <div
            role={importMessage.type === "error" ? "alert" : "status"}
            className={`text-xs font-medium px-3.5 py-2.5 rounded-[12px] border ${
              importMessage.type === "error"
                ? "bg-[#FEECEB] text-[#B91C1C] border-red-200"
                : "bg-[#E6F6ED] text-[#227248] border-emerald-200"
            }`}
          >
            {importMessage.text}
          </div>
        )}
      </div>

      {/* 4. Storage Summary */}
      <div className="clay-card p-4 sm:p-6 space-y-3">
        <div className="flex items-start gap-2.5">
          <div className="w-9 h-9 rounded-[12px] bg-[#E6F6ED] text-[#227248] flex items-center justify-center shrink-0 mt-0.5">
            <HardDrive className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-[#292735]">
              Stored in Your Browser
            </h3>
            <p className="hidden sm:block text-xs text-[#595566] leading-relaxed">
              Your CVs, saved checkpoints, and uploaded certificates are stored
              privately on your device without an account.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-[14px] bg-[#FAF8F5] border border-[rgba(70,65,90,0.08)]">
            <p className="font-bold text-[#292735]">Saved CVs & History</p>
            <p className="text-[#595566] mt-0.5">
              {profiles.length} CV{profiles.length === 1 ? "" : "s"} •{" "}
              {versionHistory.length} snapshot
              {versionHistory.length === 1 ? "" : "s"}
            </p>
          </div>
          <div className="p-3 rounded-[14px] bg-[#FAF8F5] border border-[rgba(70,65,90,0.08)]">
            <p className="font-bold text-[#292735]">Uploaded Certificates</p>
            <p className="text-[#595566] mt-0.5">
              Stored in browser file storage on this device
            </p>
          </div>
        </div>
      </div>

      {/* 5. Recent AI Activity */}
      <div
        data-testid="ai-primary-card"
        className="clay-card p-4 sm:p-6 space-y-3"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2.5">
            <div className="w-9 h-9 rounded-[12px] bg-[#EFEAFF] text-[#6C5BD8] flex items-center justify-center shrink-0 mt-0.5">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#292735]">
                Recent AI Activity ({aiUsageHistory.length})
              </h3>
              <p className="hidden sm:block text-xs text-[#595566]">
                A private log of AI actions run in this browser.
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
          <p className="text-xs text-[#595566] italic">
            No AI actions have been run yet.
          </p>
        ) : (
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {aiUsageHistory.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-[12px] bg-[#FAF8F5] text-xs flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <span className="font-bold text-[#292735]">
                    {FEATURE_LABELS[item.feature] || "AI Tool"}
                  </span>
                  <span className="text-[#595566]">
                    {" "}
                    • {formatOperationName(item.operation)}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                      item.status === "success"
                        ? "bg-[#E6F6ED] text-[#227248]"
                        : "bg-[#FEECEB] text-[#B91C1C]"
                    }`}
                  >
                    {item.status === "success" ? "Done" : "Failed"}
                  </span>
                  <span className="text-xs text-[#595566]">
                    {new Date(item.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Compact Privacy Status Bar below cards */}
      <AIPrivacyConsentBanner compact />

      <Dialog
        isOpen={Boolean(pendingDeleteProfile)}
        onClose={() => setPendingDeleteProfile(null)}
        title="Delete CV?"
        description={
          pendingDeleteProfile
            ? `Are you sure you want to permanently delete "${pendingDeleteProfile.title}" from this browser? This action cannot be undone.`
            : ""
        }
        confirmLabel="Delete CV"
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
