"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type DropdownPlacement = "bottom" | "top";

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  keywords?: string;
}

export interface SelectGroupOption {
  label: string;
  options: SelectOption[];
}

export interface DropdownTriggerRect {
  top: number;
  bottom: number;
  left: number;
  right: number;
  width: number;
  height: number;
}

export interface DropdownViewport {
  width: number;
  height: number;
}

export interface DropdownPosition {
  placement: DropdownPlacement;
  left: number;
  width: number;
  maxHeight: number;
  top?: number;
  bottom?: number;
}

const VIEWPORT_MARGIN = 10;
const TRIGGER_GAP = 6;
const DEFAULT_MAX_HEIGHT = 264;
const CLOSE_ANIMATION_MS = 180;

/**
 * Computes fixed viewport coordinates and vertical flip placement for a portal
 * dropdown menu so menus never clip against overflow-hidden cards or extend
 * outside narrow mobile viewports.
 */
export function computeDropdownPosition(
  triggerRect: DropdownTriggerRect,
  viewport: DropdownViewport,
  options?: {
    minMenuWidth?: number;
    preferredMaxHeight?: number;
  }
): DropdownPosition {
  const preferredMaxHeight = options?.preferredMaxHeight ?? DEFAULT_MAX_HEIGHT;
  const maxAllowedWidth = Math.max(120, viewport.width - VIEWPORT_MARGIN * 2);
  const desiredWidth = Math.max(triggerRect.width, options?.minMenuWidth ?? 0);
  const width = Math.min(desiredWidth, maxAllowedWidth);

  const clampedLeft = Math.min(
    Math.max(VIEWPORT_MARGIN, triggerRect.left),
    Math.max(VIEWPORT_MARGIN, viewport.width - width - VIEWPORT_MARGIN)
  );

  const spaceBelow = Math.max(
    0,
    viewport.height - triggerRect.bottom - VIEWPORT_MARGIN - TRIGGER_GAP
  );
  const spaceAbove = Math.max(
    0,
    triggerRect.top - VIEWPORT_MARGIN - TRIGGER_GAP
  );

  const flipThreshold = Math.min(180, preferredMaxHeight);
  const shouldFlipUp = spaceBelow < flipThreshold && spaceAbove > spaceBelow;
  const placement: DropdownPlacement = shouldFlipUp ? "top" : "bottom";
  const availableSpace = placement === "top" ? spaceAbove : spaceBelow;
  const maxHeight = Math.max(112, Math.min(preferredMaxHeight, availableSpace));

  if (placement === "top") {
    return {
      placement,
      left: clampedLeft,
      width,
      maxHeight,
      bottom: Math.max(
        VIEWPORT_MARGIN,
        viewport.height - triggerRect.top + TRIGGER_GAP
      ),
    };
  }

  return {
    placement,
    left: clampedLeft,
    width,
    maxHeight,
    top: Math.max(VIEWPORT_MARGIN, triggerRect.bottom + TRIGGER_GAP),
  };
}

function getReducedMotionPreference(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

interface RegisteredOptionMeta {
  value: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface SelectContextValue {
  selectId: string;
  listboxId: string;
  portalId: string;
  searchInputId: string;
  errorId: string;
  descriptionId: string;
  value: string;
  selectedLabel: string | null;
  selectedIcon: React.ReactNode | null;
  placeholder: string;
  disabled: boolean;
  hasError: boolean;
  isOpen: boolean;
  isMounted: boolean;
  menuState: "open" | "closed";
  variant: "field" | "header";
  size: "sm" | "md";
  searchable: boolean;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  searchPlaceholder: string;
  highlightedValue: string | null;
  setHighlightedValue: (val: string | null) => void;
  position: DropdownPosition | null;
  closeMenu: (restoreFocus?: boolean) => void;
  toggleMenu: () => void;
  selectValue: (val: string) => void;
  handleDefaultTriggerKeyDown: (
    e: React.KeyboardEvent<HTMLButtonElement>
  ) => void;
  handleSearchInputKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  registerOption: (opt: RegisteredOptionMeta) => () => void;
}

const SelectContext = createContext<SelectContextValue | null>(null);

function useSelectContext(componentName: string): SelectContextValue {
  const ctx = useContext(SelectContext);
  if (!ctx) {
    throw new Error(`${componentName} must be rendered inside <Select>.`);
  }
  return ctx;
}

export interface SelectProps {
  label?: string;
  labelClassName?: string;
  containerClassName?: string;
  description?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onValueChange?: (value: string) => void;
  options?: SelectOption[];
  groups?: SelectGroupOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
  menuClassName?: string;
  error?: string;
  hasError?: boolean;
  id?: string;
  ariaLabel?: string;
  title?: string;
  variant?: "field" | "header";
  size?: "sm" | "md";
  triggerIcon?: React.ReactNode;
  searchable?: boolean;
  searchPlaceholder?: string;
  emptyText?: string;
  clearable?: boolean;
  clearLabel?: string;
  minMenuWidth?: number;
  maxMenuHeight?: number;
  renderOption?: (option: SelectOption, isSelected: boolean) => React.ReactNode;
  children?: React.ReactNode;
}

export function Select({
  label,
  labelClassName,
  containerClassName,
  description,
  value: controlledValue,
  defaultValue = "",
  onChange,
  onValueChange,
  options,
  groups,
  placeholder = "Select...",
  disabled = false,
  className,
  triggerClassName,
  menuClassName,
  error,
  hasError: hasErrorProp = false,
  id,
  ariaLabel,
  title,
  variant = "field",
  size = "md",
  triggerIcon,
  searchable = false,
  searchPlaceholder = "Search options...",
  emptyText = "No matching options",
  clearable = false,
  clearLabel = "Clear selection",
  minMenuWidth,
  maxMenuHeight = DEFAULT_MAX_HEIGHT,
  renderOption,
  children,
}: SelectProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const value = controlledValue !== undefined ? controlledValue : internalValue;

  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [menuState, setMenuState] = useState<"open" | "closed">("closed");
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightedValue, setHighlightedValue] = useState<string | null>(null);
  const [position, setPosition] = useState<DropdownPosition | null>(null);
  const [registeredList, setRegisteredList] = useState<RegisteredOptionMeta[]>(
    []
  );

  const generatedId = useId();
  const selectId = id || generatedId;
  const listboxId = `${selectId}-listbox`;
  const portalId = `${selectId}-portal`;
  const searchInputId = `${selectId}-search`;
  const errorId = `${selectId}-error`;
  const descriptionId = `${selectId}-description`;

  const resolvedGroups = useMemo<SelectGroupOption[]>(() => {
    if (groups && groups.length > 0) return groups;
    if (options && options.length > 0) {
      return [{ label: "", options }];
    }
    return [];
  }, [groups, options]);

  const dataOptions = useMemo<SelectOption[]>(() => {
    return resolvedGroups.flatMap((group) => group.options);
  }, [resolvedGroups]);

  const filteredGroups = useMemo<SelectGroupOption[]>(() => {
    const q = searchQuery.trim().toLowerCase();
    const baseGroups =
      clearable && value !== "" && !q
        ? [
            {
              label: "",
              options: [
                {
                  value: "",
                  label: clearLabel,
                } as SelectOption,
              ],
            },
            ...resolvedGroups,
          ]
        : resolvedGroups;

    if (!q) return baseGroups;

    return baseGroups
      .map((group) => ({
        ...group,
        options: group.options.filter((opt) => {
          const haystack = `${opt.label} ${opt.description || ""} ${
            opt.keywords || ""
          } ${opt.value}`.toLowerCase();
          return haystack.includes(q);
        }),
      }))
      .filter((group) => group.options.length > 0);
  }, [clearLabel, clearable, resolvedGroups, searchQuery, value]);

  const enabledValues = useMemo<string[]>(() => {
    if (children) {
      return registeredList
        .filter((item) => !item.disabled)
        .map((item) => item.value);
    }
    return filteredGroups.flatMap((group) =>
      group.options.filter((opt) => !opt.disabled).map((opt) => opt.value)
    );
  }, [children, filteredGroups, registeredList]);

  const activeHighlight =
    highlightedValue !== null && enabledValues.includes(highlightedValue)
      ? highlightedValue
      : enabledValues[0] ?? null;

  const registerOption = useCallback((opt: RegisteredOptionMeta) => {
    setRegisteredList((prev) => {
      const existingIdx = prev.findIndex((item) => item.value === opt.value);
      if (existingIdx !== -1) {
        const current = prev[existingIdx];
        if (
          current.label === opt.label &&
          current.disabled === opt.disabled
        ) {
          return prev;
        }
        const next = [...prev];
        next[existingIdx] = opt;
        return next;
      }
      return [...prev, opt];
    });

    return () => {
      setRegisteredList((prev) =>
        prev.filter((item) => item.value !== opt.value)
      );
    };
  }, []);

  const selectedFromData = useMemo(() => {
    return dataOptions.find((opt) => opt.value === value) || null;
  }, [dataOptions, value]);

  const registeredSelected = useMemo(() => {
    return registeredList.find((item) => item.value === value) || null;
  }, [registeredList, value]);

  const selectedLabel =
    selectedFromData?.label ??
    (value !== "" ? registeredSelected?.label ?? null : null);
  const selectedIcon =
    selectedFromData?.icon ??
    (value !== "" ? registeredSelected?.icon ?? null : null);

  const updatePosition = useCallback(() => {
    if (typeof document === "undefined" || typeof window === "undefined") {
      return;
    }
    const triggerEl = document.getElementById(selectId);
    if (!triggerEl) return;
    const rect = triggerEl.getBoundingClientRect();
    setPosition(
      computeDropdownPosition(
        {
          top: rect.top,
          bottom: rect.bottom,
          left: rect.left,
          right: rect.right,
          width: rect.width,
          height: rect.height,
        },
        {
          width: window.innerWidth,
          height: window.innerHeight,
        },
        {
          minMenuWidth,
          preferredMaxHeight: maxMenuHeight,
        }
      )
    );
  }, [maxMenuHeight, minMenuWidth, selectId]);

  // Manage enter/exit transition timers without passing ref access into render
  useEffect(() => {
    if (isOpen) {
      let raf2 = 0;
      const raf1 = window.requestAnimationFrame(() => {
        raf2 = window.requestAnimationFrame(() => {
          setMenuState("open");
          if (
            searchable &&
            window.matchMedia?.("(pointer: fine)")?.matches
          ) {
            document.getElementById(searchInputId)?.focus();
          }
        });
      });
      return () => {
        window.cancelAnimationFrame(raf1);
        if (raf2) window.cancelAnimationFrame(raf2);
      };
    }

    if (!isMounted) return;

    const finish = () => {
      setIsMounted(false);
      setSearchQuery("");
      setHighlightedValue(null);
    };

    if (getReducedMotionPreference()) {
      const immediateTimer = window.setTimeout(finish, 0);
      return () => window.clearTimeout(immediateTimer);
    }

    const closeTimer = window.setTimeout(finish, CLOSE_ANIMATION_MS);
    return () => window.clearTimeout(closeTimer);
  }, [isMounted, isOpen, searchInputId, searchable]);

  const closeMenu = useCallback(
    (restoreFocus = false) => {
      setIsOpen(false);
      setMenuState("closed");
      if (restoreFocus && typeof document !== "undefined") {
        document.getElementById(selectId)?.focus();
      }
    },
    [selectId]
  );

  const openMenu = useCallback(
    (initialHighlight: "selected" | "first" | "last" = "selected") => {
      if (disabled) return;
      updatePosition();
      setIsOpen(true);
      setIsMounted(true);
      setMenuState("closed");

      if (initialHighlight === "selected" && value !== "") {
        setHighlightedValue(value);
      } else if (initialHighlight === "last") {
        setHighlightedValue(enabledValues[enabledValues.length - 1] ?? null);
      } else {
        setHighlightedValue(enabledValues[0] ?? (value || null));
      }
    },
    [disabled, enabledValues, updatePosition, value]
  );

  const toggleMenu = useCallback(() => {
    if (isOpen) {
      closeMenu(false);
    } else {
      openMenu("selected");
    }
  }, [closeMenu, isOpen, openMenu]);

  const selectValue = useCallback(
    (nextVal: string) => {
      if (controlledValue === undefined) {
        setInternalValue(nextVal);
      }
      onChange?.(nextVal);
      onValueChange?.(nextVal);
      closeMenu(true);
    },
    [closeMenu, controlledValue, onChange, onValueChange]
  );

  useEffect(() => {
    if (!isMounted) return;

    const handleReposition = () => updatePosition();
    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, true);

    return () => {
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition, true);
    };
  }, [isMounted, updatePosition]);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      const triggerEl = document.getElementById(selectId);
      const portalEl = document.getElementById(portalId);
      if (triggerEl?.contains(target) || portalEl?.contains(target)) {
        return;
      }
      closeMenu(false);
    };

    const handleCaptureKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        closeMenu(true);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown, {
      passive: true,
    });
    window.addEventListener("keydown", handleCaptureKeyDown, true);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      window.removeEventListener("keydown", handleCaptureKeyDown, true);
    };
  }, [closeMenu, isOpen, portalId, selectId]);

  const moveHighlight = useCallback(
    (direction: "next" | "prev" | "first" | "last") => {
      if (enabledValues.length === 0) return;

      if (direction === "first") {
        setHighlightedValue(enabledValues[0]);
        return;
      }
      if (direction === "last") {
        setHighlightedValue(enabledValues[enabledValues.length - 1]);
        return;
      }

      const currentIdx = activeHighlight
        ? enabledValues.indexOf(activeHighlight)
        : enabledValues.indexOf(value);

      if (direction === "next") {
        const nextIdx =
          currentIdx >= 0 && currentIdx < enabledValues.length - 1
            ? currentIdx + 1
            : 0;
        setHighlightedValue(enabledValues[nextIdx]);
      } else {
        const prevIdx =
          currentIdx > 0 ? currentIdx - 1 : enabledValues.length - 1;
        setHighlightedValue(enabledValues[prevIdx]);
      }
    },
    [activeHighlight, enabledValues, value]
  );

  const typeaheadStateRef = useRef<{ buffer: string; timer: number | null }>({
    buffer: "",
    timer: null,
  });

  const handleDefaultTriggerKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (disabled) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (!isOpen) {
          openMenu(value ? "selected" : "first");
        } else {
          moveHighlight("next");
        }
        return;
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        if (!isOpen) {
          openMenu(value ? "selected" : "last");
        } else {
          moveHighlight("prev");
        }
        return;
      }

      if (e.key === "Home" && isOpen) {
        e.preventDefault();
        moveHighlight("first");
        return;
      }

      if (e.key === "End" && isOpen) {
        e.preventDefault();
        moveHighlight("last");
        return;
      }

      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (!isOpen) {
          openMenu("selected");
        } else if (activeHighlight !== null) {
          selectValue(activeHighlight);
        } else {
          closeMenu(true);
        }
        return;
      }

      if (e.key === "Tab" && isOpen) {
        closeMenu(false);
        return;
      }

      if (
        !searchable &&
        e.key.length === 1 &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.altKey
      ) {
        const nextBuffer = (
          typeaheadStateRef.current.buffer + e.key
        ).toLowerCase();
        typeaheadStateRef.current.buffer = nextBuffer;
        if (typeaheadStateRef.current.timer !== null) {
          window.clearTimeout(typeaheadStateRef.current.timer);
        }
        typeaheadStateRef.current.timer = window.setTimeout(() => {
          typeaheadStateRef.current.buffer = "";
        }, 500);

        const match = dataOptions.find(
          (opt) =>
            !opt.disabled && opt.label.toLowerCase().startsWith(nextBuffer)
        );
        if (match) {
          if (isOpen) {
            setHighlightedValue(match.value);
          } else {
            if (controlledValue === undefined) {
              setInternalValue(match.value);
            }
            onChange?.(match.value);
            onValueChange?.(match.value);
          }
        }
      }
    },
    [
      activeHighlight,
      closeMenu,
      controlledValue,
      dataOptions,
      disabled,
      isOpen,
      moveHighlight,
      onChange,
      onValueChange,
      openMenu,
      searchable,
      selectValue,
      value,
    ]
  );

  const handleSearchInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        moveHighlight("next");
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        moveHighlight("prev");
      } else if (e.key === "Enter" && activeHighlight !== null) {
        e.preventDefault();
        selectValue(activeHighlight);
      } else if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        closeMenu(true);
      }
    },
    [activeHighlight, closeMenu, moveHighlight, selectValue]
  );

  const contextValue = useMemo<SelectContextValue>(
    () => ({
      selectId,
      listboxId,
      portalId,
      searchInputId,
      errorId,
      descriptionId,
      value,
      selectedLabel,
      selectedIcon,
      placeholder,
      disabled,
      hasError: Boolean(error) || hasErrorProp,
      isOpen,
      isMounted,
      menuState,
      variant,
      size,
      searchable,
      searchQuery,
      setSearchQuery,
      searchPlaceholder,
      highlightedValue: activeHighlight,
      setHighlightedValue,
      position,
      closeMenu,
      toggleMenu,
      selectValue,
      handleDefaultTriggerKeyDown,
      handleSearchInputKeyDown,
      registerOption,
    }),
    [
      activeHighlight,
      closeMenu,
      descriptionId,
      disabled,
      error,
      errorId,
      handleDefaultTriggerKeyDown,
      handleSearchInputKeyDown,
      hasErrorProp,
      isMounted,
      isOpen,
      listboxId,
      menuState,
      placeholder,
      portalId,
      position,
      registerOption,
      searchInputId,
      searchPlaceholder,
      searchQuery,
      searchable,
      selectId,
      selectValue,
      selectedIcon,
      selectedLabel,
      size,
      toggleMenu,
      value,
      variant,
    ]
  );

  if (children) {
    return (
      <SelectContext.Provider value={contextValue}>
        <div
          className={cn(
            "relative",
            variant === "field" && "w-full space-y-1.5",
            containerClassName
          )}
        >
          {label && (
            <label
              htmlFor={selectId}
              className={cn(
                "block text-xs font-semibold uppercase tracking-wider text-[#595566]",
                labelClassName
              )}
            >
              {label}
            </label>
          )}
          {children}
          {description && !error && (
            <p id={descriptionId} className="text-xs text-[#595566] leading-snug">
              {description}
            </p>
          )}
          {error && (
            <p id={errorId} role="alert" className="text-xs text-[#B91C1C] font-medium">
              {error}
            </p>
          )}
        </div>
      </SelectContext.Provider>
    );
  }

  return (
    <SelectContext.Provider value={contextValue}>
      <div
        className={cn(
          "relative",
          variant === "field" ? "w-full space-y-1.5" : "inline-block",
          containerClassName
        )}
      >
        {label && (
          <label
            htmlFor={selectId}
            className={cn(
              "block text-xs font-semibold uppercase tracking-wider text-[#595566]",
              labelClassName
            )}
          >
            {label}
          </label>
        )}

        <SelectTrigger
          icon={triggerIcon}
          ariaLabel={ariaLabel}
          title={title}
          className={cn(triggerClassName, className)}
        />

        <SelectContent className={menuClassName}>
          {filteredGroups.length === 0 ? (
            <div className="px-3 py-4 text-center text-xs text-[#595566]">
              {emptyText}
            </div>
          ) : (
            filteredGroups.map((group, idx) => (
              <SelectGroup key={group.label || `group-${idx}`}>
                {group.label && <SelectLabel>{group.label}</SelectLabel>}
                {group.options.map((opt) => (
                  <SelectItem
                    key={opt.value || "__empty"}
                    value={opt.value}
                    label={opt.label}
                    description={opt.description}
                    icon={opt.icon}
                    disabled={opt.disabled}
                  >
                    {renderOption
                      ? renderOption(opt, opt.value === value)
                      : undefined}
                  </SelectItem>
                ))}
              </SelectGroup>
            ))
          )}
        </SelectContent>

        {description && !error && (
          <p id={descriptionId} className="text-xs text-[#595566] leading-snug">
            {description}
          </p>
        )}
        {error && (
          <p id={errorId} role="alert" className="text-xs text-[#B91C1C] font-medium">
            {error}
          </p>
        )}
      </div>
    </SelectContext.Provider>
  );
}

export interface SelectTriggerProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  icon?: React.ReactNode;
  ariaLabel?: string;
  children?: React.ReactNode;
}

export function SelectTrigger({
  icon,
  ariaLabel,
  className,
  onKeyDown,
  children,
  ...rest
}: SelectTriggerProps) {
  const ctx = useSelectContext("SelectTrigger");
  const displayIcon = icon ?? ctx.selectedIcon;
  const activeDescendantId =
    ctx.isOpen && ctx.highlightedValue !== null
      ? `${ctx.selectId}-opt-${encodeURIComponent(ctx.highlightedValue)}`
      : undefined;

  return (
    <button
      id={ctx.selectId}
      type="button"
      role="combobox"
      disabled={ctx.disabled}
      onClick={ctx.toggleMenu}
      onKeyDown={(e) => {
        onKeyDown?.(e);
        if (!e.defaultPrevented) {
          ctx.handleDefaultTriggerKeyDown(e);
        }
      }}
      aria-haspopup="listbox"
      aria-expanded={ctx.isOpen}
      aria-controls={ctx.listboxId}
      aria-activedescendant={activeDescendantId}
      aria-invalid={ctx.hasError || undefined}
      aria-describedby={ctx.hasError ? ctx.errorId : undefined}
      aria-label={ariaLabel}
      className={cn(
        "group w-full flex items-center justify-between gap-2 text-left select-none transition-all duration-150 focus-visible:outline-2 focus-visible:outline-[#6C5BD8] focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
        ctx.variant === "header"
          ? cn(
              "min-h-[38px] px-3 py-1.5 rounded-[14px] bg-[#FAF8F5] border border-[rgba(70,65,90,0.1)] text-xs font-semibold text-[#292735] shadow-[-3px_-3px_8px_rgba(255,255,255,0.9),3px_3px_8px_rgba(163,157,147,0.16)] hover:bg-white hover:border-[rgba(108,91,216,0.3)]",
              ctx.isOpen &&
                "bg-white border-[#8B7CF6] ring-2 ring-[#8B7CF6]/20 shadow-[-4px_-4px_10px_rgba(255,255,255,0.95),4px_5px_12px_rgba(108,91,216,0.16)]"
            )
          : cn(
              "clay-input px-3.5 py-2 font-medium hover:bg-[#F5F2EC]",
              ctx.size === "sm"
                ? "min-h-[40px] text-xs"
                : "min-h-[44px] text-xs sm:text-sm",
              ctx.isOpen &&
                "!border-[#8B7CF6] !bg-[#FAF8F5] ring-2 ring-[#8B7CF6]/20"
            ),
        ctx.hasError &&
          "!border-[#B91C1C]/70 focus-visible:outline-[#B91C1C] ring-2 ring-[#B91C1C]/15",
        className
      )}
      {...rest}
    >
      <span className="flex items-center gap-2 min-w-0 flex-1">
        {displayIcon && (
          <span className="shrink-0 flex items-center text-[#6C5BD8]">
            {displayIcon}
          </span>
        )}
        {children || <SelectValue />}
      </span>
      <ChevronDown
        aria-hidden="true"
        className={cn(
          "w-4 h-4 shrink-0 transition-transform duration-200",
          ctx.isOpen
            ? "rotate-180 text-[#5342B8]"
            : "text-[#595566] group-hover:text-[#292735]"
        )}
      />
    </button>
  );
}

export function SelectValue({ placeholder }: { placeholder?: string }) {
  const ctx = useSelectContext("SelectValue");
  const displayValue =
    ctx.selectedLabel ?? (ctx.value !== "" ? ctx.value : null);
  const fallback = placeholder ?? ctx.placeholder;

  return (
    <span
      className={cn(
        "truncate block min-w-0",
        displayValue !== null ? "text-[#292735]" : "text-[#595566]"
      )}
    >
      {displayValue !== null ? displayValue : fallback}
    </span>
  );
}

export interface SelectContentProps {
  children: React.ReactNode;
  className?: string;
}

export function SelectContent({ children, className }: SelectContentProps) {
  const ctx = useSelectContext("SelectContent");

  if (!ctx.isMounted || typeof document === "undefined" || !ctx.position) {
    return null;
  }

  const pos = ctx.position;

  const portalNode = (
    <div
      id={ctx.portalId}
      data-testid="select-menu-portal"
      data-state={ctx.menuState}
      data-placement={pos.placement}
      style={{
        position: "fixed",
        left: `${pos.left}px`,
        width: `${pos.width}px`,
        top: pos.top !== undefined ? `${pos.top}px` : undefined,
        bottom: pos.bottom !== undefined ? `${pos.bottom}px` : undefined,
        zIndex: 80,
      }}
      className={cn(
        "clay-select-menu overflow-hidden flex flex-col",
        ctx.menuState === "closed" && "pointer-events-none",
        className
      )}
    >
      {ctx.searchable && (
        <div className="p-1.5 pb-1 border-b border-[rgba(70,65,90,0.08)] bg-[#FAF8F5]">
          <div className="relative flex items-center">
            <Search
              aria-hidden="true"
              className="w-3.5 h-3.5 text-[#595566] absolute left-2.5 pointer-events-none"
            />
            <input
              id={ctx.searchInputId}
              type="text"
              role="searchbox"
              aria-label={ctx.searchPlaceholder}
              placeholder={ctx.searchPlaceholder}
              value={ctx.searchQuery}
              onChange={(e) => ctx.setSearchQuery(e.target.value)}
              onKeyDown={ctx.handleSearchInputKeyDown}
              className="w-full h-8 pl-8 pr-7 text-xs font-medium text-[#292735] placeholder:text-[#595566] bg-[#EFECE6] rounded-[10px] border border-[rgba(70,65,90,0.1)] focus:outline-none focus:border-[#8B7CF6] focus:bg-white"
            />
            {ctx.searchQuery && (
              <button
                type="button"
                aria-label="Clear filter"
                onClick={() => {
                  ctx.setSearchQuery("");
                  document.getElementById(ctx.searchInputId)?.focus();
                }}
                className="absolute right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[#595566] hover:text-[#292735] hover:bg-[#EAE6DE] cursor-pointer"
              >
                <X className="w-3 h-3" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      )}

      <div
        id={ctx.listboxId}
        role="listbox"
        tabIndex={-1}
        aria-labelledby={ctx.selectId}
        style={{
          maxHeight: `${Math.max(96, pos.maxHeight - (ctx.searchable ? 46 : 0))}px`,
        }}
        className="p-1.5 overflow-y-auto overscroll-contain space-y-0.5"
      >
        {children}
      </div>
    </div>
  );

  return createPortal(portalNode, document.body);
}

export interface SelectGroupProps {
  children: React.ReactNode;
  className?: string;
}

export function SelectGroup({ children, className }: SelectGroupProps) {
  return (
    <div
      role="group"
      className={cn("space-y-0.5 py-0.5 first:pt-0 last:pb-0", className)}
    >
      {children}
    </div>
  );
}

export interface SelectLabelProps {
  children: React.ReactNode;
  className?: string;
}

export function SelectLabel({ children, className }: SelectLabelProps) {
  return (
    <div
      className={cn(
        "px-2.5 pt-2 pb-1 text-[11px] font-bold uppercase tracking-wider text-[#595566] select-none",
        className
      )}
    >
      {children}
    </div>
  );
}

export interface SelectItemProps {
  value: string;
  label?: string;
  description?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export function SelectItem({
  value: itemValue,
  label,
  description,
  icon,
  disabled = false,
  children,
  className,
}: SelectItemProps) {
  const ctx = useSelectContext("SelectItem");
  const itemRef = useRef<HTMLDivElement>(null);
  const resolvedLabel =
    label || (typeof children === "string" ? children : itemValue);

  useEffect(() => {
    return ctx.registerOption({
      value: itemValue,
      label: resolvedLabel,
      icon,
      disabled,
    });
  }, [ctx, disabled, icon, itemValue, resolvedLabel]);

  const isSelected = ctx.value === itemValue;
  const isHighlighted = ctx.highlightedValue === itemValue;
  const isClearOption = itemValue === "";

  useEffect(() => {
    if (isHighlighted && itemRef.current?.scrollIntoView) {
      itemRef.current.scrollIntoView({ block: "nearest" });
    }
  }, [isHighlighted]);

  const optionId = `${ctx.selectId}-opt-${encodeURIComponent(itemValue)}`;

  return (
    <div
      ref={itemRef}
      id={optionId}
      role="option"
      aria-selected={isSelected}
      aria-disabled={disabled || undefined}
      onMouseEnter={() => {
        if (!disabled) ctx.setHighlightedValue(itemValue);
      }}
      onClick={() => {
        if (!disabled) {
          ctx.selectValue(itemValue);
        }
      }}
      className={cn(
        "w-full min-h-[38px] px-3 py-2 text-xs sm:text-sm rounded-[11px] flex items-center justify-between gap-2 text-left transition-colors duration-100 select-none",
        disabled
          ? "opacity-45 cursor-not-allowed text-[#595566]"
          : "cursor-pointer",
        isSelected
          ? "bg-[#E8E3FF] text-[#5342B8] font-bold shadow-[-1px_-1px_3px_rgba(255,255,255,0.75),1px_2px_5px_rgba(108,91,216,0.14)]"
          : isHighlighted && !disabled
          ? "bg-[#EFECE6] text-[#292735] font-medium"
          : isClearOption
          ? "text-[#595566] font-medium hover:bg-[#EFECE6]"
          : "text-[#292735] font-medium hover:bg-[#EFECE6]",
        className
      )}
    >
      {children ? (
        <div className="min-w-0 flex-1">{children}</div>
      ) : (
        <div className="flex items-start gap-2 min-w-0 flex-1">
          {icon && (
            <span className="shrink-0 mt-0.5 text-[#5342B8]">{icon}</span>
          )}
          <div className="min-w-0 flex-1">
            <span className="block leading-snug break-words">
              {resolvedLabel}
            </span>
            {description && (
              <span className="block text-[11px] font-normal text-[#595566] leading-snug mt-0.5 break-words">
                {description}
              </span>
            )}
          </div>
        </div>
      )}

      {isSelected && (
        <Check
          aria-hidden="true"
          className="w-3.5 h-3.5 text-[#5342B8] shrink-0"
        />
      )}
    </div>
  );
}

export type ComboboxProps = Omit<SelectProps, "searchable">;

/**
 * Searchable Select variant for larger datasets (e.g. years, long experience/project lists).
 */
export function Combobox(props: ComboboxProps) {
  return <Select {...props} searchable />;
}
