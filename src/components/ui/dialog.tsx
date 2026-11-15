"use client";

import React, { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  isDestructive?: boolean;
  maxWidthClassName?: string;
  footer?: React.ReactNode;
  hideFooter?: boolean;
}

export function Dialog({
  isOpen,
  onClose,
  title,
  description,
  children,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  isDestructive = false,
  maxWidthClassName = "max-w-md",
  footer,
  hideFooter = false,
}: DialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        e.preventDefault();
        onClose();
      }
    };

    if (isOpen) {
      previousFocusRef.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
      requestAnimationFrame(() => {
        panelRef.current?.focus();
      });
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
      if (isOpen && previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#292735]/45 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        className={cn(
          "clay-panel relative z-10 w-full max-h-[90dvh] overflow-y-auto p-6 sm:p-7 focus:outline-none",
          maxWidthClassName
        )}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 min-h-[40px] min-w-[40px] flex items-center justify-center text-[#595566] hover:text-[#292735] rounded-full hover:bg-[#EAE6DE]/80 transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <h2
          id={titleId}
          className="text-lg sm:text-xl font-bold text-[#292735] pr-10 leading-snug"
        >
          {title}
        </h2>

        {description && (
          <p
            id={descriptionId}
            className="mt-2 text-sm text-[#595566] leading-relaxed"
          >
            {description}
          </p>
        )}

        {children && <div className="mt-4">{children}</div>}

        {!hideFooter && (
          footer ? (
            <div className="mt-6">{footer}</div>
          ) : (
            <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5">
              <Button type="button" variant="secondary" onClick={onClose}>
                {cancelLabel}
              </Button>
              {onConfirm && (
                <Button
                  type="button"
                  variant={isDestructive ? "destructive" : "primary"}
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                >
                  {confirmLabel}
                </Button>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
}
