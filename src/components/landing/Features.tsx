"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Edit3, Eye, LayoutTemplate, Download } from "lucide-react";

export function Features() {
  const features = [
    {
      title: "Easy CV Builder",
      description:
        "Intuitive form modules for personal details, work history, education, skills, and projects with real-time feedback.",
      icon: Edit3,
      accentBg: "bg-[#E8E3FF]",
      accentColor: "text-[#6C5BD8]",
      badgeText: "Tactile UX",
    },
    {
      title: "Live Preview",
      description:
        "Every stroke immediately renders your CV document in real-time. What you see is precisely what goes into your final document.",
      icon: Eye,
      accentBg: "bg-[#D8E8F8]",
      accentColor: "text-[#2B6CB0]",
      badgeText: "Zero Delay",
    },
    {
      title: "Professional Templates",
      description:
        "Choose between Modern and Classic templates engineered to pass Applicant Tracking Systems (ATS) with pristine typography.",
      icon: LayoutTemplate,
      accentBg: "bg-[#FFD6C2]",
      accentColor: "text-[#C05621]",
      badgeText: "ATS-Ready",
    },
    {
      title: "Instant PDF Download",
      description:
        "Generate clean, vectorized A4 PDF files directly in your browser without waiting for server queues or watermarks.",
      icon: Download,
      accentBg: "bg-[#D7EDE1]",
      accentColor: "text-[#227248]",
      badgeText: "100% Client-Side",
    },
  ];

  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-widest text-[#8B7CF6]">
          Engineered for Simplicity
        </h2>
        <p className="text-3xl sm:text-4xl font-extrabold text-[#292735] tracking-tight">
          Everything You Need, Nothing You Don&apos;t
        </p>
        <p className="text-sm sm:text-base text-[#777482]">
          Built from the ground up to respect your time and privacy. No logins, no
          tracking, and no unnecessary friction.
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
                <p className="text-sm text-[#777482] leading-relaxed">
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
