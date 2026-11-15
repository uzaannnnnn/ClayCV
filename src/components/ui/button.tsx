"use client";

import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "destructive" | "ghost" | "outline";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
  loadingText?: string;
}

function isIconElement(node: React.ReactElement): boolean {
  if (node.type === React.Fragment) return false;
  if (typeof node.type === "string") {
    return node.type === "svg";
  }
  return true;
}

function renderLoadingChildren(children: React.ReactNode): React.ReactNode {
  return React.Children.map(children, (child) => {
    if (child === null || child === undefined || typeof child === "boolean") {
      return null;
    }
    if (typeof child === "string" || typeof child === "number") {
      return <span className="truncate">{child}</span>;
    }
    if (React.isValidElement(child)) {
      if (child.type === React.Fragment) {
        const props = child.props as { children?: React.ReactNode };
        return renderLoadingChildren(props.children);
      }
      if (isIconElement(child)) {
        return null;
      }
      return child;
    }
    return child;
  });
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      children,
      variant = "primary",
      size = "md",
      isLoading = false,
      loadingText,
      disabled,
      ...props
    },
    ref
  ) => {
    const loading = Boolean(isLoading);

    const baseStyles =
      "inline-flex items-center justify-center whitespace-nowrap font-semibold leading-none text-center select-none cursor-pointer shrink-0 transition-all duration-150 [&_svg]:pointer-events-none [&_svg]:shrink-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C5BD8] focus-visible:ring-offset-2";

    const variantStyles = {
      primary: "clay-btn-primary",
      secondary: "clay-btn-secondary",
      destructive: "clay-btn-destructive",
      ghost:
        "hover:bg-[#EAE6DE]/60 text-[#292735] rounded-[16px] transition-colors active:bg-[#EAE6DE]",
      outline:
        "border border-[rgba(70,65,90,0.18)] bg-transparent hover:bg-[#FAF8F5] text-[#292735] rounded-[16px] transition-all",
    };

    const sizeStyles = {
      sm: "h-9 min-h-[36px] px-3.5 py-1.5 text-xs gap-1.5",
      md: "h-11 min-h-[44px] px-5 py-2.5 text-sm gap-2",
      lg: "h-12 min-h-[48px] px-7 py-3 text-base gap-2.5",
      icon: "h-10 w-10 min-h-[40px] min-w-[40px] p-0 text-sm rounded-[14px] shrink-0",
    };

    return (
      <button
        ref={ref}
        disabled={Boolean(disabled || loading)}
        aria-busy={loading || undefined}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {loading ? (
          <>
            <svg
              className="animate-spin h-4 w-4 shrink-0 text-current"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              ></path>
            </svg>
            {loadingText !== undefined ? (
              <span className="truncate">{loadingText}</span>
            ) : (
              renderLoadingChildren(children)
            )}
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
