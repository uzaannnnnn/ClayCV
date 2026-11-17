"use client";

import React from "react";
import Image from "next/image";
import { WorkspaceTab } from "@/store/cv-store";
import {
  Briefcase,
  ChevronRight,
  Edit3,
  FolderKanban,
  Menu,
  ShieldCheck,
  Sparkles,
  Target,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface WorkspaceNavItem {
  id: WorkspaceTab;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
}

export const WORKSPACE_NAV_ITEMS: WorkspaceNavItem[] = [
  {
    id: "builder",
    label: "CV Builder",
    shortLabel: "Builder",
    icon: Edit3,
  },
  {
    id: "writing",
    label: "AI Writing Assistant",
    shortLabel: "AI Writer",
    icon: Sparkles,
  },
  {
    id: "matcher",
    label: "Job Matcher",
    shortLabel: "Matcher",
    icon: Target,
  },
  {
    id: "analyzer",
    label: "CV Analyzer",
    shortLabel: "Analyzer",
    icon: ShieldCheck,
  },
  {
    id: "career",
    label: "Career Assistant",
    shortLabel: "Career",
    icon: Briefcase,
  },
  {
    id: "platform",
    label: "Profiles & Storage",
    shortLabel: "Profiles",
    icon: FolderKanban,
  },
];

export interface WorkspaceSidebarProps {
  activeWorkspace: WorkspaceTab;
  onSelectWorkspace: (workspace: WorkspaceTab) => void;
  variant?: "rail" | "drawer";
  onCloseDrawer?: () => void;
  closeButtonRef?: React.RefObject<HTMLButtonElement | null>;
}

/**
 * Refined Claymorphism vertical sidebar housing ClayCV brand identity and
 * all 6 primary workspace sections. Renders both the persistent desktop/tablet
 * sidebar rail and the mobile slide-out navigation drawer.
 */
export function WorkspaceSidebar({
  activeWorkspace,
  onSelectWorkspace,
  variant = "rail",
  onCloseDrawer,
  closeButtonRef,
}: WorkspaceSidebarProps) {
  const isDrawer = variant === "drawer";

  return (
    <div
      className={cn(
        "flex flex-col bg-[#F7F5F0]",
        isDrawer
          ? "h-full gap-4"
          : "clay-card p-3 lg:p-4 gap-3.5"
      )}
    >
      {/* Sidebar Brand Header */}
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-[rgba(70,65,90,0.08)]">
        <div
          data-testid={isDrawer ? "drawer-sidebar-brand" : "workspace-nav-brand"}
          className="flex items-center gap-2.5 min-w-0"
        >
          <div className="w-8 h-8 rounded-[10px] overflow-hidden shadow-[-2px_-2px_6px_rgba(255,255,255,0.9),2px_2px_6px_rgba(139,124,246,0.28)] shrink-0 bg-white">
            <Image
              src="/claycv-logo.png"
              alt="ClayCV Logo"
              width={32}
              height={32}
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-extrabold text-sm tracking-tight text-[#292735] leading-tight">
              Clay<span className="text-[#6C5BD8]">CV</span>
            </span>
            <span className="text-[11px] font-semibold text-[#595566] leading-tight truncate">
              Workspace
            </span>
          </div>
        </div>

        {isDrawer && onCloseDrawer && (
          <button
            ref={closeButtonRef}
            type="button"
            data-testid="mobile-sidebar-close"
            onClick={onCloseDrawer}
            aria-label="Close workspace navigation"
            className="min-h-[44px] min-w-[44px] rounded-[12px] clay-btn-secondary flex items-center justify-center text-[#595566] hover:text-[#292735] shrink-0 cursor-pointer"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Vertical Stack of 6 Primary Sections */}
      <nav
        aria-label="Workspace sections"
        data-testid={isDrawer ? "mobile-drawer-section-nav" : "workspace-section-nav"}
        className="flex flex-col gap-1.5"
      >
        {WORKSPACE_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isSelected = activeWorkspace === item.id;
          return (
            <button
              key={item.id}
              type="button"
              data-workspace-id={item.id}
              aria-current={isSelected ? "page" : undefined}
              onClick={() => onSelectWorkspace(item.id)}
              className={cn(
                "w-full min-h-[44px] flex items-center gap-2.5 px-2.5 lg:px-3 py-2 rounded-[14px] text-xs font-bold text-left transition-all cursor-pointer select-none",
                isSelected
                  ? "bg-white text-[#6C5BD8] shadow-[-2px_-2px_6px_rgba(255,255,255,0.95),2px_3px_8px_rgba(163,157,147,0.22)] border border-[#8B7CF6]/30"
                  : "text-[#595566] hover:text-[#292735] hover:bg-white/70 border border-transparent"
              )}
            >
              <span
                className={cn(
                  "w-7 h-7 rounded-[10px] flex items-center justify-center shrink-0 transition-colors",
                  isSelected
                    ? "bg-[#EFEAFF] text-[#6C5BD8]"
                    : "bg-[#EAE6DE]/75 text-[#595566]"
                )}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              </span>

              {isDrawer ? (
                <span className="truncate">{item.label}</span>
              ) : (
                <>
                  <span className="hidden lg:inline truncate">{item.label}</span>
                  <span className="lg:hidden truncate">{item.shortLabel}</span>
                </>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

export interface MobileWorkspaceTriggerProps {
  activeWorkspace: WorkspaceTab;
  isOpen: boolean;
  onOpen: () => void;
  buttonRef?: React.RefObject<HTMLButtonElement | null>;
}

/**
 * Compact mobile-only menu button below the document header that opens
 * the left slide-out workspace navigation drawer without crowding mobile screens.
 */
export function MobileWorkspaceTrigger({
  activeWorkspace,
  isOpen,
  onOpen,
  buttonRef,
}: MobileWorkspaceTriggerProps) {
  const activeItem =
    WORKSPACE_NAV_ITEMS.find((item) => item.id === activeWorkspace) ||
    WORKSPACE_NAV_ITEMS[0];
  const ActiveIcon = activeItem.icon;

  return (
    <div className="md:hidden w-full">
      <button
        ref={buttonRef}
        type="button"
        data-testid="mobile-sidebar-trigger"
        aria-label="Open workspace navigation"
        aria-expanded={isOpen}
        aria-controls="claycv-mobile-sidebar"
        onClick={onOpen}
        className="w-full min-h-[44px] clay-card-sm px-3.5 py-2 bg-[#FAF8F5] flex items-center justify-between gap-2 text-xs font-bold text-[#292735] hover:bg-white transition-all cursor-pointer select-none"
      >
        <span className="flex items-center gap-2">
          <Menu className="w-4 h-4 text-[#6C5BD8] shrink-0" aria-hidden="true" />
          <span>Sections</span>
        </span>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EFEAFF] text-[#6C5BD8] border border-[#8B7CF6]/20 text-[11px] font-bold">
          <ActiveIcon className="w-3 h-3 shrink-0" aria-hidden="true" />
          <span>{activeItem.label}</span>
          <ChevronRight className="w-3 h-3 shrink-0" aria-hidden="true" />
        </span>
      </button>
    </div>
  );
}
