import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  CVData,
  EducationItem,
  ExperienceItem,
  PersonalInfo,
  ProjectItem,
  SaveStatus,
  SkillItem,
  TemplateType,
} from "@/types/cv";
import { DEFAULT_CV_DATA, SAMPLE_CV_DATA } from "@/lib/constants";
import { generateId } from "@/lib/utils";

interface CVStoreState {
  cvData: CVData;
  saveStatus: SaveStatus;
  activeSection: string;
  hasHydrated: boolean;

  // Actions
  setHasHydrated: (hydrated: boolean) => void;
  setTitle: (title: string) => void;
  setTemplate: (template: TemplateType) => void;
  setSaveStatus: (status: SaveStatus) => void;
  setActiveSection: (section: string) => void;

  updatePersonalInfo: (data: Partial<PersonalInfo>) => void;

  addEducation: (item?: Partial<EducationItem>) => void;
  updateEducation: (id: string, item: Partial<EducationItem>) => void;
  removeEducation: (id: string) => void;

  addExperience: (item?: Partial<ExperienceItem>) => void;
  updateExperience: (id: string, item: Partial<ExperienceItem>) => void;
  removeExperience: (id: string) => void;

  addSkill: (skill: { name: string; level?: string }) => void;
  removeSkill: (id: string) => void;

  addProject: (item?: Partial<ProjectItem>) => void;
  updateProject: (id: string, item: Partial<ProjectItem>) => void;
  removeProject: (id: string) => void;

  resetCV: () => void;
  loadSampleData: () => void;
}

export const useCVStore = create<CVStoreState>()(
  persist(
    (set, get) => ({
      cvData: DEFAULT_CV_DATA,
      saveStatus: "saved",
      activeSection: "personal",
      hasHydrated: false,

      setHasHydrated: (hydrated) => set({ hasHydrated: hydrated }),

      setTitle: (title) => {
        set((state) => ({
          saveStatus: "saving",
          cvData: {
            ...state.cvData,
            title,
            updatedAt: new Date().toISOString(),
          },
        }));
        setTimeout(() => set({ saveStatus: "saved" }), 400);
      },

      setTemplate: (template) => {
        set((state) => ({
          saveStatus: "saving",
          cvData: {
            ...state.cvData,
            template,
            updatedAt: new Date().toISOString(),
          },
        }));
        setTimeout(() => set({ saveStatus: "saved" }), 400);
      },

      setSaveStatus: (status) => set({ saveStatus: status }),
      setActiveSection: (section) => set({ activeSection: section }),

      updatePersonalInfo: (data) => {
        set((state) => ({
          saveStatus: "saving",
          cvData: {
            ...state.cvData,
            personalInfo: {
              ...state.cvData.personalInfo,
              ...data,
            },
            updatedAt: new Date().toISOString(),
          },
        }));
        setTimeout(() => set({ saveStatus: "saved" }), 400);
      },

      addEducation: (item) => {
        const newItem: EducationItem = {
          id: generateId(),
          institution: item?.institution || "",
          degree: item?.degree || "",
          fieldOfStudy: item?.fieldOfStudy || "",
          startDate: item?.startDate || "",
          endDate: item?.endDate || "",
          description: item?.description || "",
        };

        set((state) => ({
          saveStatus: "saving",
          cvData: {
            ...state.cvData,
            education: [...state.cvData.education, newItem],
            updatedAt: new Date().toISOString(),
          },
        }));
        setTimeout(() => set({ saveStatus: "saved" }), 400);
      },

      updateEducation: (id, item) => {
        set((state) => ({
          saveStatus: "saving",
          cvData: {
            ...state.cvData,
            education: state.cvData.education.map((edu) =>
              edu.id === id ? { ...edu, ...item } : edu
            ),
            updatedAt: new Date().toISOString(),
          },
        }));
        setTimeout(() => set({ saveStatus: "saved" }), 400);
      },

      removeEducation: (id) => {
        set((state) => ({
          saveStatus: "saving",
          cvData: {
            ...state.cvData,
            education: state.cvData.education.filter((edu) => edu.id !== id),
            updatedAt: new Date().toISOString(),
          },
        }));
        setTimeout(() => set({ saveStatus: "saved" }), 400);
      },

      addExperience: (item) => {
        const newItem: ExperienceItem = {
          id: generateId(),
          company: item?.company || "",
          position: item?.position || "",
          location: item?.location || "",
          startDate: item?.startDate || "",
          endDate: item?.endDate || "",
          current: item?.current ?? false,
          description: item?.description || "",
        };

        set((state) => ({
          saveStatus: "saving",
          cvData: {
            ...state.cvData,
            experience: [...state.cvData.experience, newItem],
            updatedAt: new Date().toISOString(),
          },
        }));
        setTimeout(() => set({ saveStatus: "saved" }), 400);
      },

      updateExperience: (id, item) => {
        set((state) => ({
          saveStatus: "saving",
          cvData: {
            ...state.cvData,
            experience: state.cvData.experience.map((exp) =>
              exp.id === id ? { ...exp, ...item } : exp
            ),
            updatedAt: new Date().toISOString(),
          },
        }));
        setTimeout(() => set({ saveStatus: "saved" }), 400);
      },

      removeExperience: (id) => {
        set((state) => ({
          saveStatus: "saving",
          cvData: {
            ...state.cvData,
            experience: state.cvData.experience.filter((exp) => exp.id !== id),
            updatedAt: new Date().toISOString(),
          },
        }));
        setTimeout(() => set({ saveStatus: "saved" }), 400);
      },

      addSkill: (skill) => {
        if (!skill.name.trim()) return;
        const currentSkills = get().cvData.skills;
        // Prevent duplicate skill names case-insensitively
        const isDuplicate = currentSkills.some(
          (s) => s.name.trim().toLowerCase() === skill.name.trim().toLowerCase()
        );
        if (isDuplicate) return;

        const newSkill: SkillItem = {
          id: generateId(),
          name: skill.name.trim(),
          level: skill.level,
        };

        set((state) => ({
          saveStatus: "saving",
          cvData: {
            ...state.cvData,
            skills: [...state.cvData.skills, newSkill],
            updatedAt: new Date().toISOString(),
          },
        }));
        setTimeout(() => set({ saveStatus: "saved" }), 400);
      },

      removeSkill: (id) => {
        set((state) => ({
          saveStatus: "saving",
          cvData: {
            ...state.cvData,
            skills: state.cvData.skills.filter((skill) => skill.id !== id),
            updatedAt: new Date().toISOString(),
          },
        }));
        setTimeout(() => set({ saveStatus: "saved" }), 400);
      },

      addProject: (item) => {
        const newItem: ProjectItem = {
          id: generateId(),
          name: item?.name || "",
          description: item?.description || "",
          technologies: item?.technologies || "",
          url: item?.url || "",
        };

        set((state) => ({
          saveStatus: "saving",
          cvData: {
            ...state.cvData,
            projects: [...state.cvData.projects, newItem],
            updatedAt: new Date().toISOString(),
          },
        }));
        setTimeout(() => set({ saveStatus: "saved" }), 400);
      },

      updateProject: (id, item) => {
        set((state) => ({
          saveStatus: "saving",
          cvData: {
            ...state.cvData,
            projects: state.cvData.projects.map((proj) =>
              proj.id === id ? { ...proj, ...item } : proj
            ),
            updatedAt: new Date().toISOString(),
          },
        }));
        setTimeout(() => set({ saveStatus: "saved" }), 400);
      },

      removeProject: (id) => {
        set((state) => ({
          saveStatus: "saving",
          cvData: {
            ...state.cvData,
            projects: state.cvData.projects.filter((proj) => proj.id !== id),
            updatedAt: new Date().toISOString(),
          },
        }));
        setTimeout(() => set({ saveStatus: "saved" }), 400);
      },

      resetCV: () => {
        const freshId = generateId();
        set({
          saveStatus: "saving",
          cvData: {
            ...DEFAULT_CV_DATA,
            id: freshId,
            updatedAt: new Date().toISOString(),
          },
        });
        setTimeout(() => set({ saveStatus: "saved" }), 400);
      },

      loadSampleData: () => {
        set({
          saveStatus: "saving",
          cvData: {
            ...SAMPLE_CV_DATA,
            id: generateId(),
            updatedAt: new Date().toISOString(),
          },
        });
        setTimeout(() => set({ saveStatus: "saved" }), 400);
      },
    }),
    {
      name: "claycv-storage",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHasHydrated(true);
        }
      },
    }
  )
);
