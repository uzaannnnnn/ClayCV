import { CVData } from "@/types/cv";

export const DEFAULT_CV_DATA: CVData = {
  id: "default-cv",
  title: "My Resume",
  template: "modern",
  personalInfo: {
    fullName: "",
    jobTitle: "",
    email: "",
    phone: "",
    location: "",
    website: "",
    linkedin: "",
    github: "",
    summary: "",
  },
  education: [],
  experience: [],
  skills: [],
  projects: [],
  updatedAt: "2026-01-01T00:00:00.000Z",
};

export const SAMPLE_CV_DATA: CVData = {
  id: "sample-cv",
  title: "Alex Morgan - Resume",
  template: "modern",
  personalInfo: {
    fullName: "Alex Morgan",
    jobTitle: "Senior Product Designer & Frontend Engineer",
    email: "alex.morgan@example.com",
    phone: "+1 (555) 234-5678",
    location: "San Francisco, CA",
    website: "https://alexmorgan.design",
    linkedin: "https://linkedin.com/in/alexmorgan",
    github: "https://github.com/alexmorgan",
    summary:
      "Passionate Senior Product Designer & Frontend Engineer with 7+ years of experience crafting accessible, scalable design systems and high-performing web applications. Proven track record of bridging the gap between product strategy, tactile UX design, and modern front-end engineering.",
  },
  education: [
    {
      id: "edu-1",
      institution: "University of California, Berkeley",
      degree: "Bachelor of Science",
      fieldOfStudy: "Computer Science & Human-Computer Interaction",
      startDate: "2015",
      endDate: "2019",
      description: "Dean's Honor List. Led the Student Design & Engineering Innovation Lab.",
    },
  ],
  experience: [
    {
      id: "exp-1",
      company: "Starlight Digital Systems",
      position: "Lead UI/UX Engineer",
      location: "San Francisco, CA",
      startDate: "2022",
      endDate: "",
      current: true,
      description:
        "Architected an enterprise-wide design system used across 14 product squads, reducing feature time-to-market by 35%. Mentored junior engineers and collaborated closely with product managers on user research and conversion metrics.",
    },
    {
      id: "exp-2",
      company: "Nordic Labs",
      position: "Frontend Developer & Interaction Designer",
      location: "Seattle, WA",
      startDate: "2019",
      endDate: "2022",
      current: false,
      description:
        "Engineered real-time collaboration dashboards using React, Next.js, and TypeScript. Improved core web vitals and overall accessibility scoring to 98% WCAG compliance.",
    },
  ],
  skills: [
    { id: "skill-1", name: "TypeScript", level: "Expert" },
    { id: "skill-2", name: "React / Next.js", level: "Expert" },
    { id: "skill-3", name: "Design Systems", level: "Expert" },
    { id: "skill-4", name: "Tailwind CSS", level: "Advanced" },
    { id: "skill-5", name: "Figma & Prototyping", level: "Advanced" },
    { id: "skill-6", name: "UI/UX Architecture", level: "Advanced" },
    { id: "skill-7", name: "Accessibility (WCAG)", level: "Advanced" },
    { id: "skill-8", name: "State Management", level: "Proficient" },
  ],
  projects: [
    {
      id: "proj-1",
      name: "ClayUI Design Kit",
      technologies: "React, Tailwind CSS, TypeScript",
      url: "https://github.com/alexmorgan/clayui",
      description:
        "An open-source library providing tactile claymorphic UI primitives with seamless accessibility and smooth 60fps micro-interactions.",
    },
    {
      id: "proj-2",
      name: "Pulse Analytics",
      technologies: "Next.js, Recharts, Turbopack",
      url: "https://pulse.analytics.dev",
      description:
        "A lightweight analytics dashboard delivering privacy-focused visitor analytics with zero cookie overhead and instant rendering.",
    },
  ],
  updatedAt: "2026-01-01T00:00:00.000Z",
};
