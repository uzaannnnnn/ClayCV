"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Calendar, Globe2, ShieldCheck } from "lucide-react";

export function Features() {
  const features = [
    {
      title: "ATS-First Architecture",
      description:
        "Every template is engineered with single-column linear text hierarchies, standard headings, and selectable text that Applicant Tracking Systems can easily parse.",
      icon: CheckCircle2,
      accentBg: "bg-[#E8E3FF]",
      accentColor: "text-[#6C5BD8]",
      badgeText: "100% ATS Ready",
    },
    {
      title: "Structured Date Dropdowns",
      description:
        "Say goodbye to inconsistent date formats. Month and year dropdown selectors ensure perfectly standardized chronology across work and education records.",
      icon: Calendar,
      accentBg: "bg-[#D8E8F8]",
      accentColor: "text-[#2B6CB0]",
      badgeText: "Zero Date Errors",
    },
    {
      title: "English & Indonesian CV",
      description:
        "Seamlessly switch your CV document language between English and Bahasa Indonesia with automatic translation of sections, dates, and employment types.",
      icon: Globe2,
      accentBg: "bg-[#FFD6C2]",
      accentColor: "text-[#C05621]",
      badgeText: "Bilingual Output",
    },
    {
      title: "Stored in Your Browser",
      description:
        "Your CV data and certificate files stay privately in your browser. No accounts, no cloud sync, and zero tracking of your personal history.",
      icon: ShieldCheck,
      accentBg: "bg-[#D7EDE1]",
      accentColor: "text-[#227248]",
      badgeText: "Private & Local",
    },
  ];

  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-widest text-[#6C5BD8]">
          Engineered for Simplicity & Compliance
        </h2>
        <p className="text-3xl sm:text-4xl font-extrabold text-[#292735] tracking-tight">
          Everything You Need for Your Next Role
        </p>
        <p className="text-sm sm:text-base text-[#595566]">
          Built from the ground up to respect your time, privacy, and career goals.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, idx) => {
          const Icon = feature.icon;
          return (
            <Card
              key={idx}
              variant="interactive"
              className="flex flex-col justify-between h-full bg-[#FAF8F5]"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div
                    className={`w-12 h-12 rounded-[16px] ${feature.accentBg} ${feature.accentColor} flex items-center justify-center shadow-[-2px_-2px_6px_rgba(255,255,255,0.9),2px_2px_6px_rgba(163,157,147,0.15)]`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${feature.accentBg} ${feature.accentColor}`}
                  >
                    {feature.badgeText}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-[#292735] mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-[#595566] leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
