import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  CertificationItem,
  CVData,
  CVLanguage,
  EducationItem,
  ExperienceItem,
  PersonalInfo,
  ProjectItem,
  SaveStatus,
  SectionKey,
  SkillItem,
  TemplateType,
} from "@/types/cv";
import { DEFAULT_CV_DATA, SAMPLE_CV_DATA, DEFAULT_SECTION_ORDER } from "@/lib/constants";
import { generateId } from "@/lib/utils";
import { deleteCertificateFile } from "@/lib/storage/indexed-db";

interface CVStoreState {
  cvData: CVData;
  saveStatus: SaveStatus;
  activeSection: string;
  hasHydrated: boolean;

  // Actions
  setHasHydrated: (hydrated: boolean) => void;
  setTitle: (title: string) => void;
  setLanguage: (language: CVLanguage) => void;
  setTemplate: (template: TemplateType) => void;
  setSaveStatus: (status: SaveStatus) => void;
  setActiveSection: (section: string) => void;

  setSectionOrder: (order: SectionKey[]) => void;
  moveSection: (key: SectionKey, direction: "up" | "down") => void;

  updatePersonalInfo: (data: Partial<PersonalInfo>) => void;

  addExperience: (item?: Partial<ExperienceItem>) => void;
  updateExperience: (id: string, item: Partial<ExperienceItem>) => void;
  removeExperience: (id: string) => void;

  addEducation: (item?: Partial<EducationItem>) => void;
  updateEducation: (id: string, item: Partial<EducationItem>) => void;
  removeEducation: (id: string) => void;

  addSkill: (name: string) => void;
  removeSkill: (id: string) => void;

  addProject: (item?: Partial<ProjectItem>) => void;
  updateProject: (id: string, item: Partial<ProjectItem>) => void;
  removeProject: (id: string) => void;

  addCertification: (item?: Partial<CertificationItem>) => void;
  updateCertification: (id: string, item: Partial<CertificationItem>) => void;
  removeCertification: (id: string) => void;

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
        setTimeout(() => set({ saveStatus: "saved" }), 350);
      },

      setLanguage: (language) => {
        set((state) => ({
          saveStatus: "saving",
          cvData: {
            ...state.cvData,
            language,
            updatedAt: new Date().toISOString(),
          },
        }));
        setTimeout(() => set({ saveStatus: "saved" }), 350);
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
        setTimeout(() => set({ saveStatus: "saved" }), 350);
      },

      setSaveStatus: (status) => set({ saveStatus: status }),
      setActiveSection: (section) => set({ activeSection: section }),

      setSectionOrder: (order) => {
        set((state) => ({
          saveStatus: "saving",
          cvData: {
            ...state.cvData,
            sectionOrder: order,
            updatedAt: new Date().toISOString(),
          },
        }));
        setTimeout(() => set({ saveStatus: "saved" }), 350);
      },

      moveSection: (key, direction) => {
        const currentOrder = [...get().cvData.sectionOrder];
        const index = currentOrder.indexOf(key);
        if (index === -1) return;

        const targetIndex = direction === "up" ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= currentOrder.length) return;

        const temp = currentOrder[index];
        currentOrder[index] = currentOrder[targetIndex];
        currentOrder[targetIndex] = temp;

        set((state) => ({
          saveStatus: "saving",
          cvData: {
            ...state.cvData,
            sectionOrder: currentOrder,
            updatedAt: new Date().toISOString(),
          },
        }));
        setTimeout(() => set({ saveStatus: "saved" }), 350);
      },

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
        setTimeout(() => set({ saveStatus: "saved" }), 350);
      },

      addExperience: (item) => {
        const newItem: ExperienceItem = {
          id: generateId(),
          company: item?.company || "",
          position: item?.position || "",
          location: item?.location || "",
          employmentType: item?.employmentType || "full-time",
          workMode: item?.workMode || "onsite",
          startMonth: item?.startMonth ?? null,
          startYear: item?.startYear ?? null,
          endMonth: item?.endMonth ?? null,
          endYear: item?.endYear ?? null,
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
        setTimeout(() => set({ saveStatus: "saved" }), 350);
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
        setTimeout(() => set({ saveStatus: "saved" }), 350);
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
        setTimeout(() => set({ saveStatus: "saved" }), 350);
      },

      addEducation: (item) => {
        const newItem: EducationItem = {
          id: generateId(),
          institution: item?.institution || "",
          degree: item?.degree || "",
          fieldOfStudy: item?.fieldOfStudy || "",
          startMonth: item?.startMonth ?? null,
          startYear: item?.startYear ?? null,
          endMonth: item?.endMonth ?? null,
          endYear: item?.endYear ?? null,
          current: item?.current ?? false,
          description: item?.description || "",
          thesisTitle: item?.thesisTitle || "",
          defenseGrade: item?.defenseGrade || "",
          gpa: item?.gpa || "",
        };

        set((state) => ({
          saveStatus: "saving",
          cvData: {
            ...state.cvData,
            education: [...state.cvData.education, newItem],
            updatedAt: new Date().toISOString(),
          },
        }));
        setTimeout(() => set({ saveStatus: "saved" }), 350);
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
        setTimeout(() => set({ saveStatus: "saved" }), 350);
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
        setTimeout(() => set({ saveStatus: "saved" }), 350);
      },

      addSkill: (name) => {
        const trimmed = name.trim();
        if (!trimmed) return;
        const currentSkills = get().cvData.skills;
        const isDuplicate = currentSkills.some(
          (s) => s.name.trim().toLowerCase() === trimmed.toLowerCase()
        );
        if (isDuplicate) return;

        const newSkill: SkillItem = {
          id: generateId(),
          name: trimmed,
        };

        set((state) => ({
          saveStatus: "saving",
          cvData: {
            ...state.cvData,
            skills: [...state.cvData.skills, newSkill],
            updatedAt: new Date().toISOString(),
          },
        }));
        setTimeout(() => set({ saveStatus: "saved" }), 350);
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
        setTimeout(() => set({ saveStatus: "saved" }), 350);
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
        setTimeout(() => set({ saveStatus: "saved" }), 350);
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
        setTimeout(() => set({ saveStatus: "saved" }), 350);
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
        setTimeout(() => set({ saveStatus: "saved" }), 350);
      },

      addCertification: (item) => {
        const newItem: CertificationItem = {
          id: generateId(),
          name: item?.name || "",
          issuingOrganization: item?.issuingOrganization || "",
          issueMonth: item?.issueMonth ?? null,
          issueYear: item?.issueYear ?? null,
          expiryMonth: item?.expiryMonth ?? null,
          expiryYear: item?.expiryYear ?? null,
          noExpiry: item?.noExpiry ?? false,
          credentialId: item?.credentialId || "",
          credentialUrl: item?.credentialUrl || "",
          attachmentId: item?.attachmentId,
          attachmentName: item?.attachmentName,
          attachmentSize: item?.attachmentSize,
          attachmentType: item?.attachmentType,
        };

        set((state) => ({
          saveStatus: "saving",
          cvData: {
            ...state.cvData,
            certifications: [...state.cvData.certifications, newItem],
            updatedAt: new Date().toISOString(),
          },
        }));
        setTimeout(() => set({ saveStatus: "saved" }), 350);
      },

      updateCertification: (id, item) => {
        set((state) => ({
          saveStatus: "saving",
          cvData: {
            ...state.cvData,
            certifications: state.cvData.certifications.map((cert) =>
              cert.id === id ? { ...cert, ...item } : cert
            ),
            updatedAt: new Date().toISOString(),
          },
        }));
        setTimeout(() => set({ saveStatus: "saved" }), 350);
      },

      removeCertification: (id) => {
        const certToRemove = get().cvData.certifications.find((c) => c.id === id);
        if (certToRemove?.attachmentId) {
          deleteCertificateFile(certToRemove.attachmentId);
        }

        set((state) => ({
          saveStatus: "saving",
          cvData: {
            ...state.cvData,
            certifications: state.cvData.certifications.filter((cert) => cert.id !== id),
            updatedAt: new Date().toISOString(),
          },
        }));
        setTimeout(() => set({ saveStatus: "saved" }), 350);
      },

      resetCV: () => {
        const freshId = generateId();
        // Clean up any IndexedDB attachments
        const currentCerts = get().cvData.certifications;
        currentCerts.forEach((c) => {
          if (c.attachmentId) deleteCertificateFile(c.attachmentId);
        });

        set({
          saveStatus: "saving",
          cvData: {
            ...DEFAULT_CV_DATA,
            id: freshId,
            sectionOrder: [...DEFAULT_SECTION_ORDER],
            updatedAt: new Date().toISOString(),
          },
        });
        setTimeout(() => set({ saveStatus: "saved" }), 350);
      },

      loadSampleData: () => {
        set({
          saveStatus: "saving",
          cvData: {
            ...SAMPLE_CV_DATA,
            id: generateId(),
            sectionOrder: [...DEFAULT_SECTION_ORDER],
            updatedAt: new Date().toISOString(),
          },
        });
        setTimeout(() => set({ saveStatus: "saved" }), 350);
      },
    }),
    {
      name: "claycv-storage",
      version: 2,
      storage: createJSONStorage(() => localStorage),
      migrate: (persistedState: unknown) => {
        // Safe migration from v1 to v2: ensure sectionOrder and language exist
        if (!persistedState || typeof persistedState !== "object") return persistedState;
        const stateObj = persistedState as Record<string, unknown>;
        if (!stateObj.cvData || typeof stateObj.cvData !== "object") return persistedState;
        const cvData = stateObj.cvData as Record<string, unknown>;

        if (!cvData.sectionOrder || !Array.isArray(cvData.sectionOrder)) {
          cvData.sectionOrder = [...DEFAULT_SECTION_ORDER];
        }
        if (!cvData.language) {
          cvData.language = "en";
        }
        if (!cvData.certifications) {
          cvData.certifications = [];
        }
        if (
          cvData.template !== "classic" &&
          cvData.template !== "modern" &&
          cvData.template !== "minimal"
        ) {
          cvData.template = "modern";
        }
        return persistedState;
      },
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHasHydrated(true);
        }
      },
    }
  )
);
