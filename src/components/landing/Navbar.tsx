"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, FileText } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#F4F1EB]/85 border-b border-[rgba(70,65,90,0.06)] px-4 sm:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo with Clay Tactile Pill */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-[#A99CFF] to-[#8B7CF6] flex items-center justify-center text-white shadow-[-3px_-3px_8px_rgba(255,255,255,0.8),3px_3px_8px_rgba(139,124,246,0.35)] group-hover:scale-105 transition-transform">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xl tracking-tight text-[#292735]">
              Clay<span className="text-[#8B7CF6]">CV</span>
            </span>
            <span className="text-[10px] -mt-1 font-semibold text-[#777482] uppercase tracking-wider">
              Tactile Resume Builder
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#777482]">
          <a
            href="#features"
            className="hover:text-[#292735] transition-colors py-1"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            className="hover:text-[#292735] transition-colors py-1"
          >
            How It Works
          </a>
          <a
            href="#templates"
            className="hover:text-[#292735] transition-colors py-1"
          >
            Templates
          </a>
        </nav>

        {/* Start Building CTA */}
        <div className="flex items-center gap-3">
          <Link href="/builder">
            <Button variant="primary" size="sm" className="hidden sm:inline-flex">
              <Sparkles className="w-4 h-4" />
              <span>Start Building</span>
            </Button>
            <Button variant="primary" size="sm" className="sm:hidden">
              <span>Build CV</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
