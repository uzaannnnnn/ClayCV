"use client";

import React from "react";
import { PenTool, Palette, DownloadCloud } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      step: "01",
      title: "Fill in your information",
      description:
        "Input your experience, education, key skills, and project highlights with structured, error-checked clay form fields.",
      icon: PenTool,
      badgeColor: "bg-[#E8E3FF] text-[#6C5BD8]",
    },
    {
      step: "02",
      title: "Choose your favorite template",
      description:
        "Toggle seamlessly between the Modern and Classic templates. Your data is preserved instantly across layout switches.",
      icon: Palette,
      badgeColor: "bg-[#FFD6C2] text-[#C05621]",
    },
    {
      step: "03",
      title: "Download your CV",
      description:
        "Click Download PDF to export an authentic, vectorized A4 resume ready to send to recruiters and hiring managers.",
      icon: DownloadCloud,
      badgeColor: "bg-[#D7EDE1] text-[#227248]",
    },
  ];

  return (
    <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-[#EAE6DE]/40">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#6C5BD8]">
            Fast 3-Step Journey
          </h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-[#292735] tracking-tight">
            How ClayCV Works
          </p>
          <p className="text-sm sm:text-base text-[#595566]">
            From zero to an executive-ready resume in under five minutes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="clay-card p-7 flex flex-col justify-between relative bg-[#FAF8F5] group hover:scale-[1.02] transition-transform"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span
                      className={`text-xs font-black px-3 py-1 rounded-[12px] ${item.badgeColor}`}
                    >
                      STEP {item.step}
                    </span>
                    <div className="w-10 h-10 rounded-[14px] bg-[#FAF8F5] shadow-[-2px_-2px_5px_rgba(255,255,255,0.9),2px_2px_5px_rgba(163,157,147,0.2)] flex items-center justify-center text-[#292735]">
                      <Icon className="w-5 h-5 text-[#8B7CF6]" />
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-[#292735] mb-3">
                    {item.title}
                  </h3>
                  <p className="text-sm text-[#595566] leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
