"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Shield } from "lucide-react";

export function Footer() {
  const yearRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (yearRef.current) {
      yearRef.current.textContent = String(new Date().getFullYear());
    }
  }, []);

  return (
    <footer className="border-t border-[rgba(70,65,90,0.08)] bg-[#EAE6DE]/50 py-12 px-4 sm:px-6 lg:px-8 mt-12">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Brand */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <Link href="/" className="flex items-center gap-2.5 mb-2 group">
            <div className="w-8 h-8 rounded-[10px] flex items-center justify-center shadow-sm overflow-hidden group-hover:scale-105 transition-transform">
              <Image
                src="/claycv-logo.png"
                alt="ClayCV Logo"
                width={32}
                height={32}
                className="w-full h-full object-contain"
              />
            </div>
            <span className="font-extrabold text-lg tracking-tight text-[#292735]">
              Clay<span className="text-[#8B7CF6]">CV</span>
            </span>
          </Link>
          <p className="text-xs text-[#777482] max-w-sm">
            A tactile, claymorphism-inspired web resume builder designed for
            frictionless career growth.
          </p>
        </div>

        {/* Privacy Note Statement (Strictly required) */}
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-[16px] clay-card-sm bg-[#FAF8F5] max-w-md text-xs text-[#555555]">
          <Shield className="w-5 h-5 text-[#8B7CF6] shrink-0" />
          <p>
            Your CV is stored locally in this browser. We do not upload your
            personal information to a server.
          </p>
        </div>

        {/* Copyright */}
        <div className="text-xs text-[#777482] text-center md:text-right">
          <p>
            © <span ref={yearRef}>2026</span> ClayCV. All rights reserved.
          </p>
          <p className="mt-0.5 text-[11px] text-[#A29FAC]">
            Client-Side Architecture
          </p>
        </div>
      </div>
    </footer>
  );
}
