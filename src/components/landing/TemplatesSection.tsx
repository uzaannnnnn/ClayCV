"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Check } from "lucide-react";

export function TemplatesSection() {
  return (
    <section id="templates" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-widest text-[#8B7CF6]">
          Curated Design Standards
        </h2>
        <p className="text-3xl sm:text-4xl font-extrabold text-[#292735] tracking-tight">
          Two Professional Templates
        </p>
        <p className="text-sm sm:text-base text-[#777482]">
          Expertly formatted to satisfy corporate ATS software while presenting
          a refined typography hierarchy.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Template 1: Modern */}
        <div className="clay-card p-6 sm:p-8 flex flex-col justify-between bg-[#FAF8F5]">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <Badge variant="purple" className="mb-2">
                  Contemporary
                </Badge>
                <h3 className="text-2xl font-bold text-[#292735]">
                  Modern Template
                </h3>
              </div>
              <span className="text-xs font-medium text-[#777482]">
                Recommended for Tech & Creative
              </span>
            </div>

            <p className="text-sm text-[#777482] mb-6">
              Features subtle purple section dividing rules, crisp sans-serif
              typography, compact skill pills, and clear visual hierarchy.
            </p>

            {/* Document Preview Snapshot */}
            <div className="cv-paper rounded-[12px] p-6 border border-[rgba(0,0,0,0.06)] bg-white text-xs mb-6 select-none shadow-sm">
              <div className="border-b border-[#8B7CF6]/40 pb-3 mb-3">
                <p className="text-base font-bold text-[#1A1A1A]">
                  JORDAN BENNETT
                </p>
                <p className="text-[#8B7CF6] font-medium text-xs">
                  Full Stack Software Architect
                </p>
                <p className="text-[10px] text-[#666666] mt-1">
                  jordan@example.com • +1 555-0192 • New York, NY
                </p>
              </div>

              <div className="mb-3">
                <p className="text-[10px] font-bold text-[#8B7CF6] uppercase tracking-wider mb-1">
                  Experience
                </p>
                <div className="flex justify-between font-semibold text-[#1A1A1A] text-[11px]">
                  <span>Senior Engineer • Apex Cloud</span>
                  <span className="text-[10px] text-[#777482]">
                    2021 – Present
                  </span>
                </div>
                <p className="text-[10px] text-[#555555] mt-0.5">
                  Led migration of core microservices to edge architecture,
                  slashing latency by 45%.
                </p>
              </div>

              <div>
                <p className="text-[10px] font-bold text-[#8B7CF6] uppercase tracking-wider mb-1">
                  Education & Skills
                </p>
                <p className="text-[10px] text-[#444444]">
                  B.S. in Computer Science • TypeScript, Next.js, Cloud
                  Architecture, GraphQL
                </p>
              </div>
            </div>

            <ul className="space-y-2 mb-6 text-xs text-[#555555]">
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#8B7CF6]" />
                <span>Single-column format optimal for ATS parsing</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#8B7CF6]" />
                <span>Modern colored accents highlighting key milestones</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#8B7CF6]" />
                <span>Clean tag cloud for competencies & tools</span>
              </li>
            </ul>
          </div>

          <Link href="/builder?template=modern" className="w-full">
            <Button variant="primary" className="w-full">
              <span>Use Modern Template</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {/* Template 2: Classic */}
        <div className="clay-card p-6 sm:p-8 flex flex-col justify-between bg-[#FAF8F5]">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <Badge variant="default" className="mb-2 bg-[#EAE6DE]">
                  Traditional
                </Badge>
                <h3 className="text-2xl font-bold text-[#292735]">
                  Classic Template
                </h3>
              </div>
              <span className="text-xs font-medium text-[#777482]">
                Recommended for Finance, Law & Academia
              </span>
            </div>

            <p className="text-sm text-[#777482] mb-6">
              Emphasizes formal black and charcoal tones, horizontal divider
              lines, structured headers, and standard resume conventions.
            </p>

            {/* Document Preview Snapshot */}
            <div className="cv-paper rounded-[12px] p-6 border border-[rgba(0,0,0,0.06)] bg-white text-xs mb-6 select-none shadow-sm">
              <div className="text-center border-b-2 border-black pb-3 mb-3">
                <p className="text-base font-bold tracking-widest uppercase text-black font-serif">
                  ELEANOR VANCE
                </p>
                <p className="text-[11px] text-[#333333] font-serif italic">
                  Financial Analyst & Risk Consultant
                </p>
                <p className="text-[10px] text-[#555555] mt-1 font-serif">
                  eleanor.vance@example.com | (212) 555-0143 | Boston, MA
                </p>
              </div>

              <div className="mb-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-black border-b border-gray-300 pb-0.5 mb-1 font-serif">
                  Professional Experience
                </p>
                <div className="flex justify-between font-semibold text-black text-[11px]">
                  <span>Vanguard Capital Partners — Senior Analyst</span>
                  <span className="text-[10px] text-gray-600">2020 – 2024</span>
                </div>
                <p className="text-[10px] text-[#444444] mt-0.5">
                  Spearheaded quantitative risk assessments for $400M in
                  portfolio allocations.
                </p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-black border-b border-gray-300 pb-0.5 mb-1 font-serif">
                  Education & Credentials
                </p>
                <p className="text-[10px] text-[#444444]">
                  M.S. in Applied Economics, Columbia University • CFA Charterholder
                </p>
              </div>
            </div>

            <ul className="space-y-2 mb-6 text-xs text-[#555555]">
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#292735]" />
                <span>Strict black & grayscale high-contrast print design</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#292735]" />
                <span>Centered formal resume header format</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#292735]" />
                <span>Universal compatibility across all ATS parsers</span>
              </li>
            </ul>
          </div>

          <Link href="/builder?template=classic" className="w-full">
            <Button variant="secondary" className="w-full">
              <span>Use Classic Template</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
