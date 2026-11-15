"use client";

import React from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useCVStore } from "@/store/cv-store";
import { SectionKey } from "@/types/cv";
import {
  GripVertical,
  ChevronUp,
  ChevronDown,
  RotateCcw,
  FileText,
  Briefcase,
  GraduationCap,
  Wrench,
  FolderGit2,
  Award,
} from "lucide-react";
import { DEFAULT_SECTION_ORDER } from "@/lib/constants";

interface SortableItemProps {
  id: SectionKey;
  label: string;
  sublabel: string;
  icon: React.ElementType;
  index: number;
  total: number;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

function SortableItem({
  id,
  label,
  sublabel,
  icon: Icon,
  index,
  total,
  onMoveUp,
  onMoveDown,
}: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`clay-card-sm p-3.5 bg-white flex items-center justify-between gap-3 border border-[rgba(70,65,90,0.08)] select-none ${
        isDragging ? "opacity-60 ring-2 ring-[#8B7CF6] shadow-lg z-20" : ""
      }`}
    >
      {/* Drag handle & Section title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="text-[#595566] hover:text-[#292735] p-1.5 rounded cursor-grab active:cursor-grabbing focus:outline-none"
          title="Drag to reorder"
          aria-label={`Drag handle for ${label}`}
        >
          <GripVertical className="w-4 h-4" />
        </button>

        <div className="w-8 h-8 rounded-[10px] bg-[#FAF8F5] text-[#6C5BD8] flex items-center justify-center shrink-0 shadow-sm border border-[rgba(70,65,90,0.06)]">
          <Icon className="w-4 h-4" />
        </div>

        <div className="min-w-0">
          <p className="text-xs sm:text-sm font-bold text-[#292735] truncate">
            <span className="text-[#6C5BD8] mr-1.5 font-mono text-xs">
              0{index + 1}.
            </span>
            {label}
          </p>
          <p className="text-xs text-[#595566] truncate">{sublabel}</p>
        </div>
      </div>

      {/* Move Up / Down Buttons */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          type="button"
          disabled={index === 0}
          onClick={onMoveUp}
          className="min-h-[38px] min-w-[38px] flex items-center justify-center text-[#595566] hover:text-[#292735] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#FAF8F5] rounded-[10px] transition-colors cursor-pointer"
          title="Move section up"
          aria-label={`Move ${label} up`}
        >
          <ChevronUp className="w-4 h-4" />
        </button>
        <button
          type="button"
          disabled={index === total - 1}
          onClick={onMoveDown}
          className="min-h-[38px] min-w-[38px] flex items-center justify-center text-[#595566] hover:text-[#292735] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#FAF8F5] rounded-[10px] transition-colors cursor-pointer"
          title="Move section down"
          aria-label={`Move ${label} down`}
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export function SectionOrderManager() {
  const { cvData, setSectionOrder, moveSection } = useCVStore();
  const { sectionOrder } = cvData;

  const sectionMetadata: Record<
    SectionKey,
    { label: string; sublabel: string; icon: React.ElementType }
  > = {
    summary: {
      label: "Professional Summary",
      sublabel: "Career overview & core strengths",
      icon: FileText,
    },
    experience: {
      label: "Work Experience",
      sublabel: "Employment history & roles",
      icon: Briefcase,
    },
    education: {
      label: "Education",
      sublabel: "Degrees & academic history",
      icon: GraduationCap,
    },
    skills: {
      label: "Skills & Competencies",
      sublabel: "Technical abilities & toolset",
      icon: Wrench,
    },
    projects: {
      label: "Projects",
      sublabel: "Apps, open-source & client deliverables",
      icon: FolderGit2,
    },
    certifications: {
      label: "Certifications",
      sublabel: "Licenses, credentials & attachments",
      icon: Award,
    },
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sectionOrder.indexOf(active.id as SectionKey);
    const newIndex = sectionOrder.indexOf(over.id as SectionKey);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newOrder = arrayMove(sectionOrder, oldIndex, newIndex);
      setSectionOrder(newOrder);
    }
  };

  const handleResetOrder = () => {
    setSectionOrder([...DEFAULT_SECTION_ORDER]);
  };

  return (
    <div className="space-y-4 pt-2">
      <div className="flex items-center justify-between pb-1">
        <p className="text-xs text-[#595566]">
          Drag sections or use the arrows to reorder. Personal details remain fixed at the top as the document header.
        </p>
        <button
          type="button"
          onClick={handleResetOrder}
          className="inline-flex items-center gap-1 text-xs font-bold text-[#6C5BD8] hover:underline cursor-pointer shrink-0 ml-2 py-1"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset Order</span>
        </button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sectionOrder}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2.5">
            {sectionOrder.map((key, idx) => {
              const meta = sectionMetadata[key];
              if (!meta) return null;
              return (
                <SortableItem
                  key={key}
                  id={key}
                  label={meta.label}
                  sublabel={meta.sublabel}
                  icon={meta.icon}
                  index={idx}
                  total={sectionOrder.length}
                  onMoveUp={() => moveSection(key, "up")}
                  onMoveDown={() => moveSection(key, "down")}
                />
              );
            })}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
