import { z } from "zod";

const optionalUrl = z
  .string()
  .trim()
  .refine(
    (val) => {
      if (!val) return true;
      try {
        const url = val.startsWith("http://") || val.startsWith("https://") ? val : `https://${val}`;
        new URL(url);
        return true;
      } catch {
        return false;
      }
    },
    { message: "Please enter a valid URL (e.g. linkedin.com/in/username)" }
  );

export const personalInfoSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required"),
  jobTitle: z.string().trim().optional().default(""),
  email: z
    .string()
    .trim()
    .refine((val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
      message: "Please enter a valid email address",
    })
    .default(""),
  phone: z.string().trim().optional().default(""),
  location: z.string().trim().optional().default(""),
  website: optionalUrl.default(""),
  linkedin: optionalUrl.default(""),
  github: optionalUrl.default(""),
  summary: z.string().trim().optional().default(""),
});

export const educationItemSchema = z.object({
  id: z.string(),
  institution: z.string().trim().min(1, "Institution name is required"),
  degree: z.string().trim().optional().default(""),
  fieldOfStudy: z.string().trim().optional().default(""),
  startDate: z.string().trim().optional().default(""),
  endDate: z.string().trim().optional().default(""),
  description: z.string().trim().optional().default(""),
});

export const experienceItemSchema = z.object({
  id: z.string(),
  company: z.string().trim().min(1, "Company name is required"),
  position: z.string().trim().min(1, "Position is required"),
  location: z.string().trim().optional().default(""),
  startDate: z.string().trim().optional().default(""),
  endDate: z.string().trim().optional().default(""),
  current: z.boolean().default(false),
  description: z.string().trim().optional().default(""),
});

export const skillItemSchema = z.object({
  id: z.string(),
  name: z.string().trim().min(1, "Skill name cannot be empty"),
  level: z.string().optional(),
});

export const projectItemSchema = z.object({
  id: z.string(),
  name: z.string().trim().min(1, "Project name is required"),
  technologies: z.string().trim().optional().default(""),
  url: optionalUrl.default(""),
  description: z.string().trim().optional().default(""),
});

export type PersonalInfoFormValues = z.infer<typeof personalInfoSchema>;
