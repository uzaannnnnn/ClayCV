"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface ScrollIndicatorMetrics {
  isOverflowing: boolean;
  thumbWidthPct: number;
  thumbOffsetPct: number;
}

const DEFAULT_METRICS: ScrollIndicatorMetrics = {
  isOverflowing: false,
  thumbWidthPct: 100,
  thumbOffsetPct: 0,
};

/**
 * Computes proportional thumb width and offset percentages for a horizontal scroll track.
 */
export function computeScrollIndicator(
  scrollLeft: number,
  scrollWidth: number,
  clientWidth: number
): ScrollIndicatorMetrics {
  if (clientWidth <= 0 || scrollWidth <= clientWidth + 1) {
    return DEFAULT_METRICS;
  }

  const rawWidthPct = (clientWidth / scrollWidth) * 100;
  const thumbWidthPct = Math.min(100, Math.max(18, Number(rawWidthPct.toFixed(2))));
  const maxScroll = scrollWidth - clientWidth;
  const ratio = maxScroll > 0 ? Math.min(1, Math.max(0, scrollLeft / maxScroll)) : 0;
  const thumbOffsetPct = Number((ratio * (100 - thumbWidthPct)).toFixed(2));

  return {
    isOverflowing: true,
    thumbWidthPct,
    thumbOffsetPct,
  };
}

interface HorizontalScrollTabsProps {
  children: React.ReactNode;
  className?: string;
  trackClassName?: string;
  role?: string;
  ariaLabel?: string;
}

/**
 * Horizontally scrollable tab container that displays a proportional clay scroll indicator
 * only when content overflows the viewport width.
 */
export function HorizontalScrollTabs({
  children,
  className,
  trackClassName,
  role = "tablist",
  ariaLabel,
}: HorizontalScrollTabsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [metrics, setMetrics] = useState<ScrollIndicatorMetrics>(DEFAULT_METRICS);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let rafId = 0;
    const syncMetrics = () => {
      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }
      rafId = window.requestAnimationFrame(() => {
        setMetrics(computeScrollIndicator(el.scrollLeft, el.scrollWidth, el.clientWidth));
      });
    };

    syncMetrics();
    el.addEventListener("scroll", syncMetrics, { passive: true });
    window.addEventListener("resize", syncMetrics);

    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(syncMetrics);
      observer.observe(el);
    }

    return () => {
      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }
      el.removeEventListener("scroll", syncMetrics);
      window.removeEventListener("resize", syncMetrics);
      observer?.disconnect();
    };
  }, []);

  return (
    <div className="w-full">
      <div
        ref={scrollRef}
        role={role}
        aria-label={ariaLabel}
        className={cn("flex overflow-x-auto no-scrollbar", className)}
      >
        {children}
      </div>
      {metrics.isOverflowing && (
        <div
          aria-hidden="true"
          data-testid="horizontal-scroll-indicator"
          className={cn(
            "relative mt-2 h-1.5 w-full rounded-full bg-[#EAE6DE] shadow-[inset_0_1px_2px_rgba(70,65,90,0.08)] overflow-hidden",
            trackClassName
          )}
        >
          <div
            data-testid="horizontal-scroll-thumb"
            className="absolute inset-y-0 rounded-full bg-gradient-to-r from-[#8B7CF6] to-[#6C5BD8] shadow-[0_1px_3px_rgba(108,91,216,0.28)]"
            style={{
              width: `${metrics.thumbWidthPct}%`,
              left: `${metrics.thumbOffsetPct}%`,
            }}
          />
        </div>
      )}
    </div>
  );
}
