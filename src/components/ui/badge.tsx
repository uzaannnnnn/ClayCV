import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "purple" | "peach" | "mint" | "blue" | "pink";
}

export function Badge({
  className,
  variant = "default",
  children,
  ...props
}: BadgeProps) {
  const variantStyles = {
    default: "clay-badge text-[#292735]",
    purple: "clay-badge-purple",
    peach: "bg-[#FFE8DE] text-[#C05621] border border-[rgba(255,214,194,0.6)] shadow-sm",
    mint: "bg-[#E6F6ED] text-[#227248] border border-[rgba(215,237,225,0.6)] shadow-sm",
    blue: "bg-[#EBF3FC] text-[#2B6CB0] border border-[rgba(216,232,248,0.6)] shadow-sm",
    pink: "bg-[#FDF0F6] text-[#B83280] border border-[rgba(244,215,229,0.6)] shadow-sm",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-[12px] select-none",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
