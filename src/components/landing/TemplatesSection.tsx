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
          100% ATS-Compliant Standards
        </h2>
        <p className="text-3xl sm:text-4xl font-extrabold text-[#292735] tracking-tight">
          Three Dedicated ATS Templates
        </p>
        <p className="text-sm sm:text-base text-[#777482]">
          Single-column text-first layouts engineered to parse cleanly in any
          Applicant Tracking System while maintaining immaculate typography.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Template 1: ATS Modern */}
        <div className="clay-card p-6 flex flex-col justify-between bg-[#FAF8F5]">
          <div>
            <div className="flex items-center justify-between mb-3">
              <Badge variant="purple">Contemporary</Badge>
              <span className="text-[11px] font-semibold text-[#8B7CF6]">Tech & Digital</span>
            </div>

            <h3 className="text-xl font-bold text-[#292735] mb-2">
              ATS Modern
            </h3>

            <p className="text-xs text-[#777482] mb-5 leading-relaxed">
              Modern sans-serif typography, subtle purple accent dividing rules, and generous whitespace.
            </p>

            {/* Document Preview Snapshot */}
            <div className="cv-paper rounded-[4px] p-4 border border-[rgba(0,0,0,0.08)] bg-white text-xs mb-5 select-none shadow-sm">
              <div className="border-b-2 border-[#8B7CF6] pb-2 mb-2">
                <p className="text-sm font-bold text-[#111827]">
                  JORDAN BENNETT
                </p>
                <p className="text-[#8B7CF6] font-semibold text-[11px]">
                  Software Architect
                </p>
                <p className="text-[9px] text-[#6B7280] mt-0.5">
                  jordan@example.com • New York, NY
                </p>
              </div>

              <div className="mb-2">
                <p className="text-[9px] font-bold text-[#8B7CF6] uppercase tracking-wider mb-0.5">
                  Work Experience
                </p>
                <p className="text-[10px] font-semibold text-[#111827]">
                  Lead Architect • Apex Cloud
                </p>
                <p className="text-[9px] text-[#4B5563]">
                  Modernized core event pipelines, cutting latency by 45%.
                </p>
              </div>

              <div>
                <p className="text-[9px] font-bold text-[#8B7CF6] uppercase tracking-wider mb-0.5">
                  Skills & Competencies
                </p>
                <p className="text-[9px] text-[#4B5563]">
                  TypeScript • Distributed Systems • Next.js
                </p>
              </div>
            </div>

            <ul className="space-y-1.5 mb-5 text-[11px] text-[#555555]">
              <li className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#8B7CF6]" />
                <span>Single-column linear parsing</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#8B7CF6]" />
                <span>Subtle brand color milestones</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#8B7CF6]" />
                <span>Clickable PDF link annotations</span>
              </li>
            </ul>
          </div>

          <Link href="/builder?template=modern" className="w-full">
            <Button variant="primary" size="sm" className="w-full">
              <span>Use ATS Modern</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>

        {/* Template 2: ATS Classic */}
        <div className="clay-card p-6 flex flex-col justify-between bg-[#FAF8F5]">
          <div>
            <div className="flex items-center justify-between mb-3">
              <Badge variant="default" className="bg-[#EAE6DE]">Formal</Badge>
              <span className="text-[11px] font-semibold text-[#292735]">Corporate & Law</span>
            </div>

            <h3 className="text-xl font-bold text-[#292735] mb-2">
              ATS Classic
            </h3>

            <p className="text-xs text-[#777482] mb-5 leading-relaxed">
              Traditional serif typography, centered formal header, horizontal rules, and strict grayscale.
            </p>

            {/* Document Preview Snapshot */}
            <div className="cv-paper rounded-[4px] p-4 border border-[rgba(0,0,0,0.08)] bg-white text-xs mb-5 select-none shadow-sm">
              <div className="text-center border-b-2 border-black pb-2 mb-2 font-serif">
                <p className="text-sm font-bold tracking-widest uppercase text-black">
                  ELEANOR VANCE
                </p>
                <p className="text-[10px] text-gray-800 italic">
                  Financial Analyst
                </p>
                <p className="text-[9px] text-gray-600 font-sans mt-0.5">
                  eleanor.vance@example.com | Boston, MA
                </p>
              </div>

              <div className="mb-2">
                <p className="text-[9px] font-bold uppercase tracking-wider text-black border-b border-gray-400 pb-0.5 mb-0.5 font-serif">
                  Work Experience
                </p>
                <p className="text-[10px] font-semibold text-black font-sans">
                  Vanguard Partners — Senior Analyst
                </p>
                <p className="text-[9px] text-gray-700 font-sans">
                  Led quantitative portfolio risk models for $400M funds.
                </p>
              </div>

              <div>
                <p className="text-[9px] font-bold uppercase tracking-wider text-black border-b border-gray-400 pb-0.5 mb-0.5 font-serif">
                  Education
                </p>
                <p className="text-[9px] text-gray-700 font-sans">
                  Columbia University • M.S. in Applied Economics
                </p>
              </div>
            </div>

            <ul className="space-y-1.5 mb-5 text-[11px] text-[#555555]">
              <li className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#292735]" />
                <span>High-contrast monochrome print</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#292735]" />
                <span>Centered executive header style</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#292735]" />
                <span>100% universal ATS extraction</span>
              </li>
            </ul>
          </div>

          <Link href="/builder?template=classic" className="w-full">
            <Button variant="secondary" size="sm" className="w-full">
              <span>Use ATS Classic</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>

        {/* Template 3: ATS Minimal */}
        <div className="clay-card p-6 flex flex-col justify-between bg-[#FAF8F5]">
          <div>
            <div className="flex items-center justify-between mb-3">
              <Badge variant="mint">Compact</Badge>
              <span className="text-[11px] font-semibold text-[#227248]">Entry & Executive</span>
            </div>

            <h3 className="text-xl font-bold text-[#292735] mb-2">
              ATS Minimal
            </h3>

            <p className="text-xs text-[#777482] mb-5 leading-relaxed">
              Extremely compact, efficient black-and-white spacing, with high information density.
            </p>

            {/* Document Preview Snapshot */}
            <div className="cv-paper rounded-[4px] p-4 border border-[rgba(0,0,0,0.08)] bg-white text-xs mb-5 select-none shadow-sm">
              <div className="border-b border-black pb-1.5 mb-2 font-sans">
                <p className="text-sm font-bold text-black">
                  MARCUS CHEN
                </p>
                <p className="text-[10px] text-black">
                  Systems Developer
                </p>
                <p className="text-[9px] text-black mt-0.5">
                  m.chen@example.com • Austin, TX
                </p>
              </div>

              <div className="mb-2 font-sans">
                <p className="text-[9px] font-bold uppercase tracking-widest text-black border-b border-black pb-0.5 mb-0.5">
                  Experience
                </p>
                <p className="text-[10px] font-bold text-black">
                  DevOps Engineer — CloudScale [Full-time, Remote]
                </p>
                <p className="text-[9px] text-black">
                  Automated CI/CD pipelines across 60+ microservices.
                </p>
              </div>

              <div className="font-sans">
                <p className="text-[9px] font-bold uppercase tracking-widest text-black border-b border-black pb-0.5 mb-0.5">
                  Skills
                </p>
                <p className="text-[9px] text-black">
                  Docker • Kubernetes • Go • AWS Cloud
                </p>
              </div>
            </div>

            <ul className="space-y-1.5 mb-5 text-[11px] text-[#555555]">
              <li className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#292735]" />
                <span>Zero decorative distractions</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#292735]" />
                <span>Maximum information density</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#292735]" />
                <span>Crisp single-column hierarchy</span>
              </li>
            </ul>
          </div>

          <Link href="/builder?template=minimal" className="w-full">
            <Button variant="secondary" size="sm" className="w-full">
              <span>Use ATS Minimal</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
