"use client";

import React, { useState } from "react";
import { useCVStore } from "@/store/cv-store";
import { Input } from "@/components/ui/input";

export function PersonalInfoForm() {
  const { cvData, updatePersonalInfo } = useCVStore();
  const { personalInfo } = cvData;

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateEmail = (val: string) => {
    if (!val) return "";
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
    return isValid ? "" : "Please enter a valid email address";
  };

  const validateUrl = (val: string) => {
    if (!val) return "";
    try {
      const url = val.startsWith("http://") || val.startsWith("https://") ? val : `https://${val}`;
      new URL(url);
      return "";
    } catch {
      return "Please enter a valid URL";
    }
  };

  const handleChange = (
    field: keyof typeof personalInfo,
    value: string
  ) => {
    let err = "";
    if (field === "fullName" && !value.trim()) {
      err = "Full name is required";
    } else if (field === "email") {
      err = validateEmail(value.trim());
    } else if (["website", "linkedin", "github"].includes(field)) {
      err = validateUrl(value.trim());
    }

    setErrors((prev) => ({ ...prev, [field]: err }));
    updatePersonalInfo({ [field]: value });
  };

  return (
    <div className="space-y-4 pt-2">
      {/* Name and Title */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Full Name *"
          placeholder="e.g. Alex Morgan"
          value={personalInfo.fullName}
          onChange={(e) => handleChange("fullName", e.target.value)}
          error={errors.fullName}
          required
        />
        <Input
          label="Professional Title"
          placeholder="e.g. Senior Software Engineer"
          value={personalInfo.jobTitle}
          onChange={(e) => handleChange("jobTitle", e.target.value)}
        />
      </div>

      {/* Email and Phone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Email Address"
          type="email"
          placeholder="e.g. alex@example.com"
          value={personalInfo.email}
          onChange={(e) => handleChange("email", e.target.value)}
          error={errors.email}
        />
        <Input
          label="Phone Number"
          type="tel"
          placeholder="e.g. +1 (555) 234-5678"
          value={personalInfo.phone}
          onChange={(e) => handleChange("phone", e.target.value)}
        />
      </div>

      {/* Location and Website */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Location"
          placeholder="e.g. San Francisco, CA or Jakarta, Indonesia"
          value={personalInfo.location}
          onChange={(e) => handleChange("location", e.target.value)}
        />
        <Input
          label="Portfolio / Website"
          placeholder="e.g. https://alexmorgan.dev"
          value={personalInfo.website}
          onChange={(e) => handleChange("website", e.target.value)}
          error={errors.website}
        />
      </div>

      {/* Social Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="LinkedIn Profile"
          placeholder="e.g. linkedin.com/in/alexmorgan"
          value={personalInfo.linkedin}
          onChange={(e) => handleChange("linkedin", e.target.value)}
          error={errors.linkedin}
        />
        <Input
          label="GitHub Profile"
          placeholder="e.g. github.com/alexmorgan"
          value={personalInfo.github}
          onChange={(e) => handleChange("github", e.target.value)}
          error={errors.github}
        />
      </div>
    </div>
  );
}
