"use client";

import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  labelClassName?: string;
  containerClassName?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = "text",
      label,
      labelClassName,
      containerClassName,
      error,
      helperText,
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;

    return (
      <div className={cn("w-full space-y-1.5", containerClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              "block text-xs font-semibold uppercase tracking-wider text-[#595566]",
              labelClassName
            )}
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          type={type}
          ref={ref}
          className={cn(
            "clay-input w-full h-[42px] px-3.5 py-2.5 text-xs sm:text-sm placeholder:text-[#6D697A]",
            error && "border-red-400 focus:border-red-500",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
        {helperText && !error && (
          <p className="text-xs text-[#595566]">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
