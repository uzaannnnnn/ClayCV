"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight } from "lucide-react";

export function FinalCTA() {
  return (
    <section className="py-8 sm:py-14 md:py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <div className="clay-panel p-6 sm:p-14 text-center bg-gradient-to-b from-[#FAF8F5] to-[#F4F1EB] relative overflow-hidden">
        {/* Soft background accents */}
        <div className="hidden sm:block absolute top-0 right-1/4 w-48 h-48 rounded-full bg-[#E8E3FF]/40 blur-2xl -z-10 pointer-events-none" />
        <div className="hidden sm:block absolute bottom-0 left-1/4 w-48 h-48 rounded-full bg-[#FFD6C2]/30 blur-2xl -z-10 pointer-events-none" />

        <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
          <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8E3FF] text-xs font-bold text-[#6C5BD8]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Instant & Private</span>
          </div>

          <h2 className="text-2xl sm:text-5xl font-extrabold text-[#292735] tracking-tight">
            Ready to Build Your Next CV?
          </h2>

          <p className="hidden sm:block text-base sm:text-lg text-[#595566] leading-relaxed">
            No sign-up wall and no credit card required. Open the builder and
            download your recruiter-ready PDF in seconds.
          </p>

          <div className="pt-1 sm:pt-2 flex justify-center">
            <Link href="/builder">
              <Button variant="primary" size="lg" className="px-8 shadow-xl">
                <span>Start Building for Free</span>
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
