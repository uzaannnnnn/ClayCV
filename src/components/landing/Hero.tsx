"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  CheckCircle2,
  FileCheck2,
} from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32 px-4 sm:px-6 lg:px-8">
      {/* Decorative soft 3D clay spheres */}
      <div className="absolute top-10 left-1/2 -translate-x-[420px] w-64 h-64 rounded-full bg-[#E8E3FF]/50 blur-3xl -z-10 pointer-events-none" />
      <div className="absolute top-48 right-10 w-72 h-72 rounded-full bg-[#FFD6C2]/40 blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-80 h-80 rounded-full bg-[#D7EDE1]/40 blur-3xl -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Value Proposition & CTAs */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full clay-card-sm bg-[#FAF8F5] text-xs font-semibold text-[#8B7CF6]">
              <Sparkles className="w-4 h-4 text-[#8B7CF6]" />
              <span>Zero friction • 100% Client-Side • No Account Required</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#292735] tracking-tight leading-[1.12]">
              Your Next Opportunity Starts With a{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8B7CF6] via-[#A99CFF] to-[#6C5BD8]">
                Better CV.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-[#777482] max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Create a professional, beautifully designed CV in minutes. No
              account, no hassle, just your next opportunity.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link href="/builder" className="w-full sm:w-auto">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full sm:w-auto group shadow-lg"
                >
                  <span>Create My CV</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <a href="#templates" className="w-full sm:w-auto">
                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  <span>Explore Templates</span>
                </Button>
              </a>
            </div>

            {/* Micro guarantees */}
            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs font-medium text-[#777482]">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#8B7CF6]" />
                <span>Instant PDF Download</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#8B7CF6]" />
                <span>Private Local Storage</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-[#8B7CF6]" />
                <span>Real-Time Preview</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual - Layered Clay Frame with Live Document Preview */}
          <div className="lg:col-span-6 relative flex justify-center">
            {/* Clay Frame Container */}
            <div className="clay-hero relative w-full max-w-lg p-5 sm:p-7 bg-[#FAF8F5] border border-[rgba(70,65,90,0.08)] transform hover:scale-[1.01] transition-transform duration-300">
              {/* Floating Clay Accents */}
              <div className="absolute -top-4 -right-4 bg-[#FFD6C2] text-[#C05621] px-3.5 py-1.5 rounded-[14px] text-xs font-bold shadow-[-3px_-3px_8px_rgba(255,255,255,0.9),3px_4px_10px_rgba(192,86,33,0.2)] flex items-center gap-1.5 z-20">
                <Sparkles className="w-3.5 h-3.5" />
                <span>ATS-Friendly</span>
              </div>

              <div className="absolute -bottom-4 -left-4 bg-[#D7EDE1] text-[#227248] px-3.5 py-1.5 rounded-[14px] text-xs font-bold shadow-[-3px_-3px_8px_rgba(255,255,255,0.9),3px_4px_10px_rgba(34,114,72,0.2)] flex items-center gap-1.5 z-20">
                <FileCheck2 className="w-3.5 h-3.5" />
                <span>Vector PDF Ready</span>
              </div>

              {/* Document Window Preview Header */}
              <div className="flex items-center justify-between pb-3.5 border-b border-[rgba(70,65,90,0.07)] mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#FFD6C2] shadow-inner" />
                  <div className="w-3 h-3 rounded-full bg-[#F8E9BD] shadow-inner" />
                  <div className="w-3 h-3 rounded-full bg-[#D7EDE1] shadow-inner" />
                  <span className="text-xs font-medium text-[#777482] ml-2">
                    alex-morgan-cv.pdf
                  </span>
                </div>
                <Badge variant="purple" className="text-[11px] font-semibold">
                  Modern Template
                </Badge>
              </div>

              {/* Realistic CV Document Preview (Clean ATS Resume Paper) */}
              <div className="cv-paper rounded-[12px] p-6 text-left border border-[rgba(0,0,0,0.06)] bg-white text-[#1A1A1A] text-xs leading-relaxed">
                {/* Header */}
                <div className="border-b border-[#8B7CF6]/30 pb-3">
                  <h3 className="text-lg font-bold text-[#1A1A1A] tracking-tight">
                    Alex Morgan
                  </h3>
                  <p className="text-[#8B7CF6] font-medium text-xs">
                    Senior Product Designer & Frontend Engineer
                  </p>
                  <div className="mt-1 flex flex-wrap gap-x-3 text-[10px] text-[#555555]">
                    <span>alex.morgan@example.com</span>
                    <span>•</span>
                    <span>+1 (555) 234-5678</span>
                    <span>•</span>
                    <span>San Francisco, CA</span>
                  </div>
                </div>

                {/* Summary */}
                <div className="mt-3">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#8B7CF6] mb-1">
                    Professional Summary
                  </h4>
                  <p className="text-[11px] text-[#444444]">
                    Strategic product designer and frontend engineer with 7+
                    years of experience building accessible design systems and
                    high-converting web applications.
                  </p>
                </div>

                {/* Experience */}
                <div className="mt-3">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#8B7CF6] mb-1">
                    Experience
                  </h4>
                  <div className="space-y-1.5">
                    <div>
                      <div className="flex justify-between items-baseline font-semibold text-[#1A1A1A]">
                        <span>Lead UI/UX Engineer • Starlight Systems</span>
                        <span className="text-[10px] text-[#777482]">
                          2022 – Present
                        </span>
                      </div>
                      <p className="text-[10px] text-[#555555]">
                        Architected enterprise design systems, reducing feature
                        delivery time by 35%.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Skills */}
                <div className="mt-3">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#8B7CF6] mb-1">
                    Key Competencies
                  </h4>
                  <div className="flex flex-wrap gap-1 text-[10px]">
                    <span className="bg-[#F4F1EB] px-2 py-0.5 rounded text-[#333333]">
                      React / Next.js
                    </span>
                    <span className="bg-[#F4F1EB] px-2 py-0.5 rounded text-[#333333]">
                      TypeScript
                    </span>
                    <span className="bg-[#F4F1EB] px-2 py-0.5 rounded text-[#333333]">
                      Design Systems
                    </span>
                    <span className="bg-[#F4F1EB] px-2 py-0.5 rounded text-[#333333]">
                      Tailwind CSS
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
