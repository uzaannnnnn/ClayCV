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
import { AIUsageRecord } from "@/lib/ai/types/ai.types";
import {
  DEFAULT_CV_DATA,
  SAMPLE_CV_DATA,
  DEFAULT_SECTION_ORDER,
} from "@/lib/constants";
import { generateId } from "@/lib/utils";
import { deleteCertificateFile } from "@/lib/storage/indexed-db";

export type WorkspaceTab =
  | "builder"
  | "writing"
  | "matcher"
  | "analyzer"
  | "career"
  | "platform";

export interface CVVersionSnapshot {
  id: string;
  cvId: string;
  label: string;
  createdAt: string;
  snapshot: CVData;
}

interface CVStoreState {
  cvData: CVData;
  profiles: CVData[];
  versionHistory: CVVersionSnapshot[];
  aiUsageHistory: AIUsageRecord[];
  aiConsentAccepted: boolean;
  aiConsentTimestamp: string | null;
  isConsentModalOpen: boolean;
  consentModalDismissed: boolean;
  activeWorkspace: WorkspaceTab;
  saveStatus: SaveStatus;
  activeSection: string;
  hasHydrated: boolean;

  // Core Actions
  setHasHydrated: (hydrated: boolean) => void;
  setActiveWorkspace: (workspace: WorkspaceTab) => void;
  setAIConsent: (accepted: boolean) => void;
  openConsentModal: () => void;
  closeConsentModal: () => void;
  recordAIUsage: (entry: Omit<AIUsageRecord, "id" | "timestamp">) => void;
  clearAIUsageHistory: () => void;

  // Multi-Profile & Version Actions (Phase 5)
  createProfile: (title?: string) => void;
  duplicateProfile: (sourceId?: string) => void;
  switchProfile: (profileId: string) => void;
  deleteProfile: (profileId: string) => void;
  saveVersionSnapshot: (label?: string) => void;
  restoreVersionSnapshot: (versionId: string) => void;
  deleteVersionSnapshot: (versionId: string) => void;
  importCVData: (imported: CVData) => void;

  // Existing CV Builder Actions (100% preserved)
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

function syncActiveProfile(profiles: CVData[], updatedCV: CVData): CVData[] {
  const exists = profiles.some((p) => p.id === updatedCV.id);
  if (!exists) {
    return [...profiles, updatedCV];
  }
  return profiles.map((p) => (p.id === updatedCV.id ? updatedCV : p));
}

export const useCVStore = create<CVStoreState>()(
  persist(
    (set, get) => {
      const commitCVUpdate = (updater: (current: CVData) => CVData) => {
        set((state) => {
          const nextCV = updater(state.cvData);
          return {
            saveStatus: "saving",
            cvData: nextCV,
            profiles: syncActiveProfile(state.profiles, nextCV),
          };
        });
        setTimeout(() => set({ saveStatus: "saved" }), 350);
      };

      return {
        cvData: DEFAULT_CV_DATA,
        profiles: [DEFAULT_CV_DATA],
        versionHistory: [],
        aiUsageHistory: [],
        aiConsentAccepted: false,
        aiConsentTimestamp: null,
        isConsentModalOpen: false,
        consentModalDismissed: false,
        activeWorkspace: "builder",
        saveStatus: "saved",
        activeSection: "personal",
        hasHydrated: false,

        setHasHydrated: (hydrated) => set({ hasHydrated: hydrated }),
        setActiveWorkspace: (workspace) => set({ activeWorkspace: workspace }),

        setAIConsent: (accepted) =>
          set((state) => ({
            aiConsentAccepted: accepted,
            aiConsentTimestamp: accepted ? new Date().toISOString() : null,
            isConsentModalOpen: accepted ? false : state.isConsentModalOpen,
            consentModalDismissed: accepted ? false : state.consentModalDismissed,
          })),

        openConsentModal: () => set({ isConsentModalOpen: true }),

        closeConsentModal: () =>
          set({
            isConsentModalOpen: false,
            consentModalDismissed: true,
          }),

        recordAIUsage: (entry) =>
          set((state) => ({
            aiUsageHistory: [
              {
                ...entry,
                id: generateId(),
                timestamp: new Date().toISOString(),
              },
              ...state.aiUsageHistory,
            ].slice(0, 100),
          })),

        clearAIUsageHistory: () => set({ aiUsageHistory: [] }),

        createProfile: (title) => {
          const newProfile: CVData = {
            ...DEFAULT_CV_DATA,
            id: generateId(),
            title: title?.trim() || `New Resume (${get().profiles.length + 1})`,
            sectionOrder: [...DEFAULT_SECTION_ORDER],
            updatedAt: new Date().toISOString(),
          };
          set((state) => ({
            saveStatus: "saving",
            cvData: newProfile,
            profiles: [...state.profiles, newProfile],
          }));
          setTimeout(() => set({ saveStatus: "saved" }), 350);
        },

        duplicateProfile: (sourceId) => {
          const state = get();
          const source =
            state.profiles.find((p) => p.id === sourceId) || state.cvData;
          const duplicated: CVData = {
            ...JSON.parse(JSON.stringify(source)),
            id: generateId(),
            title: `${source.title} (Copy)`,
            updatedAt: new Date().toISOString(),
          };
          set((s) => ({
            saveStatus: "saving",
            cvData: duplicated,
            profiles: [...s.profiles, duplicated],
          }));
          setTimeout(() => set({ saveStatus: "saved" }), 350);
        },

        switchProfile: (profileId) => {
          const target = get().profiles.find((p) => p.id === profileId);
          if (!target) return;
          set({
            cvData: target,
            saveStatus: "saved",
          });
        },

        deleteProfile: (profileId) => {
          const state = get();
          if (state.profiles.length <= 1) return;
          const remaining = state.profiles.filter((p) => p.id !== profileId);
          const nextActive =
            state.cvData.id === profileId ? remaining[0] : state.cvData;
          set({
            profiles: remaining,
            cvData: nextActive,
            versionHistory: state.versionHistory.filter(
              (v) => v.cvId !== profileId
            ),
          });
        },

        saveVersionSnapshot: (label) => {
          const current = get().cvData;
          const snapshotEntry: CVVersionSnapshot = {
            id: generateId(),
            cvId: current.id,
            label:
              label?.trim() ||
              `${current.title} (${new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })})`,
            createdAt: new Date().toISOString(),
            snapshot: JSON.parse(JSON.stringify(current)),
          };
          set((state) => ({
            versionHistory: [snapshotEntry, ...state.versionHistory].slice(
              0,
              40
            ),
          }));
        },

        restoreVersionSnapshot: (versionId) => {
          const entry = get().versionHistory.find((v) => v.id === versionId);
          if (!entry) return;
          const restored: CVData = {
            ...JSON.parse(JSON.stringify(entry.snapshot)),
            updatedAt: new Date().toISOString(),
          };
          set((state) => ({
            saveStatus: "saving",
            cvData: restored,
            profiles: syncActiveProfile(state.profiles, restored),
          }));
          setTimeout(() => set({ saveStatus: "saved" }), 350);
        },

        deleteVersionSnapshot: (versionId) =>
          set((state) => ({
            versionHistory: state.versionHistory.filter(
              (v) => v.id !== versionId
            ),
          })),

        importCVData: (imported) => {
          if (
            !imported ||
            typeof imported !== "object" ||
            Array.isArray(imported) ||
            !imported.personalInfo ||
            typeof imported.personalInfo !== "object"
          ) {
            return;
          }
          const sanitizedImport: CVData = {
            ...DEFAULT_CV_DATA,
            ...imported,
            id: typeof imported.id === "string" && imported.id ? imported.id : generateId(),
            title:
              typeof imported.title === "string" && imported.title.trim()
                ? imported.title.trim()
                : "Imported CV",
            language: imported.language === "id" ? "id" : "en",
            template:
              imported.template === "classic" ||
              imported.template === "modern" ||
              imported.template === "minimal"
                ? imported.template
                : "modern",
            personalInfo: {
              ...DEFAULT_CV_DATA.personalInfo,
              ...imported.personalInfo,
            },
            experience: Array.isArray(imported.experience)
              ? imported.experience
              : [],
            education: Array.isArray(imported.education)
              ? imported.education
              : [],
            skills: Array.isArray(imported.skills) ? imported.skills : [],
            projects: Array.isArray(imported.projects) ? imported.projects : [],
            certifications: Array.isArray(imported.certifications)
              ? imported.certifications
              : [],
            sectionOrder:
              Array.isArray(imported.sectionOrder) &&
              imported.sectionOrder.length > 0
                ? imported.sectionOrder
                : [...DEFAULT_SECTION_ORDER],
            updatedAt: new Date().toISOString(),
          };
          set((state) => ({
            saveStatus: "saving",
            cvData: sanitizedImport,
            profiles: syncActiveProfile(state.profiles, sanitizedImport),
          }));
          setTimeout(() => set({ saveStatus: "saved" }), 350);
        },

        setTitle: (title) =>
          commitCVUpdate((cv) => ({
            ...cv,
            title,
            updatedAt: new Date().toISOString(),
          })),

        setLanguage: (language) =>
          commitCVUpdate((cv) => ({
            ...cv,
            language,
            updatedAt: new Date().toISOString(),
          })),

        setTemplate: (template) =>
          commitCVUpdate((cv) => ({
            ...cv,
            template,
            updatedAt: new Date().toISOString(),
          })),

        setSaveStatus: (status) => set({ saveStatus: status }),
        setActiveSection: (section) => set({ activeSection: section }),

        setSectionOrder: (order) =>
          commitCVUpdate((cv) => ({
            ...cv,
            sectionOrder: order,
            updatedAt: new Date().toISOString(),
          })),

        moveSection: (key, direction) => {
          const currentOrder = [...get().cvData.sectionOrder];
          const index = currentOrder.indexOf(key);
          if (index === -1) return;

          const targetIndex = direction === "up" ? index - 1 : index + 1;
          if (targetIndex < 0 || targetIndex >= currentOrder.length) return;

          const temp = currentOrder[index];
          currentOrder[index] = currentOrder[targetIndex];
          currentOrder[targetIndex] = temp;

          commitCVUpdate((cv) => ({
            ...cv,
            sectionOrder: currentOrder,
            updatedAt: new Date().toISOString(),
          }));
        },

        updatePersonalInfo: (data) =>
          commitCVUpdate((cv) => ({
            ...cv,
            personalInfo: {
              ...cv.personalInfo,
              ...data,
            },
            updatedAt: new Date().toISOString(),
          })),

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

          commitCVUpdate((cv) => ({
            ...cv,
            experience: [...cv.experience, newItem],
            updatedAt: new Date().toISOString(),
          }));
        },

        updateExperience: (id, item) =>
          commitCVUpdate((cv) => ({
            ...cv,
            experience: cv.experience.map((exp) =>
              exp.id === id ? { ...exp, ...item } : exp
            ),
            updatedAt: new Date().toISOString(),
          })),

        removeExperience: (id) =>
          commitCVUpdate((cv) => ({
            ...cv,
            experience: cv.experience.filter((exp) => exp.id !== id),
            updatedAt: new Date().toISOString(),
          })),

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

          commitCVUpdate((cv) => ({
            ...cv,
            education: [...cv.education, newItem],
            updatedAt: new Date().toISOString(),
          }));
        },

        updateEducation: (id, item) =>
          commitCVUpdate((cv) => ({
            ...cv,
            education: cv.education.map((edu) =>
              edu.id === id ? { ...edu, ...item } : edu
            ),
            updatedAt: new Date().toISOString(),
          })),

        removeEducation: (id) =>
          commitCVUpdate((cv) => ({
            ...cv,
            education: cv.education.filter((edu) => edu.id !== id),
            updatedAt: new Date().toISOString(),
          })),

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

          commitCVUpdate((cv) => ({
            ...cv,
            skills: [...cv.skills, newSkill],
            updatedAt: new Date().toISOString(),
          }));
        },

        removeSkill: (id) =>
          commitCVUpdate((cv) => ({
            ...cv,
            skills: cv.skills.filter((skill) => skill.id !== id),
            updatedAt: new Date().toISOString(),
          })),

        addProject: (item) => {
          const newItem: ProjectItem = {
            id: generateId(),
            name: item?.name || "",
            description: item?.description || "",
            technologies: item?.technologies || "",
            url: item?.url || "",
          };

          commitCVUpdate((cv) => ({
            ...cv,
            projects: [...cv.projects, newItem],
            updatedAt: new Date().toISOString(),
          }));
        },

        updateProject: (id, item) =>
          commitCVUpdate((cv) => ({
            ...cv,
            projects: cv.projects.map((proj) =>
              proj.id === id ? { ...proj, ...item } : proj
            ),
            updatedAt: new Date().toISOString(),
          })),

        removeProject: (id) =>
          commitCVUpdate((cv) => ({
            ...cv,
            projects: cv.projects.filter((proj) => proj.id !== id),
            updatedAt: new Date().toISOString(),
          })),

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

          commitCVUpdate((cv) => ({
            ...cv,
            certifications: [...cv.certifications, newItem],
            updatedAt: new Date().toISOString(),
          }));
        },

        updateCertification: (id, item) =>
          commitCVUpdate((cv) => ({
            ...cv,
            certifications: cv.certifications.map((cert) =>
              cert.id === id ? { ...cert, ...item } : cert
            ),
            updatedAt: new Date().toISOString(),
          })),

        removeCertification: (id) => {
          const certToRemove = get().cvData.certifications.find(
            (c) => c.id === id
          );
          if (certToRemove?.attachmentId) {
            deleteCertificateFile(certToRemove.attachmentId);
          }

          commitCVUpdate((cv) => ({
            ...cv,
            certifications: cv.certifications.filter((cert) => cert.id !== id),
            updatedAt: new Date().toISOString(),
          }));
        },

        resetCV: () => {
          const currentId = get().cvData.id || generateId();
          const currentCerts = get().cvData.certifications;
          currentCerts.forEach((c) => {
            if (c.attachmentId) deleteCertificateFile(c.attachmentId);
          });

          const freshCV: CVData = {
            ...DEFAULT_CV_DATA,
            id: currentId,
            sectionOrder: [...DEFAULT_SECTION_ORDER],
            updatedAt: new Date().toISOString(),
          };

          set((state) => ({
            saveStatus: "saving",
            cvData: freshCV,
            profiles: syncActiveProfile(state.profiles, freshCV),
          }));
          setTimeout(() => set({ saveStatus: "saved" }), 350);
        },

        loadSampleData: () => {
          const currentId = get().cvData.id || generateId();
          const sampleCV: CVData = {
            ...SAMPLE_CV_DATA,
            id: currentId,
            sectionOrder: [...DEFAULT_SECTION_ORDER],
            updatedAt: new Date().toISOString(),
          };

          set((state) => ({
            saveStatus: "saving",
            cvData: sampleCV,
            profiles: syncActiveProfile(state.profiles, sampleCV),
          }));
          setTimeout(() => set({ saveStatus: "saved" }), 350);
        },
      };
    },
    {
      name: "claycv-storage",
      version: 3,
      partialize: (state) => ({
        cvData: state.cvData,
        profiles: state.profiles,
        versionHistory: state.versionHistory,
        aiUsageHistory: state.aiUsageHistory,
        aiConsentAccepted: state.aiConsentAccepted,
        aiConsentTimestamp: state.aiConsentTimestamp,
        activeWorkspace: state.activeWorkspace,
        activeSection: state.activeSection,
      }),
      storage: createJSONStorage(() => {
        if (
          typeof window !== "undefined" &&
          window.localStorage &&
          typeof window.localStorage.setItem === "function"
        ) {
          return window.localStorage;
        }
        const mem = new Map<string, string>();
        return {
          getItem: (key: string) => mem.get(key) ?? null,
          setItem: (key: string, value: string) => {
            mem.set(key, value);
          },
          removeItem: (key: string) => {
            mem.delete(key);
          },
        };
      }),
      migrate: (persistedState: unknown) => {
        if (!persistedState || typeof persistedState !== "object") {
          return persistedState;
        }
        const stateObj = persistedState as Record<string, unknown>;
        if (!stateObj.cvData || typeof stateObj.cvData !== "object") {
          return persistedState;
        }
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

        // Migrate v2 -> v3 fields
        if (!Array.isArray(stateObj.profiles) || stateObj.profiles.length === 0) {
          stateObj.profiles = [cvData];
        }
        if (!Array.isArray(stateObj.versionHistory)) {
          stateObj.versionHistory = [];
        }
        if (!Array.isArray(stateObj.aiUsageHistory)) {
          stateObj.aiUsageHistory = [];
        }
        if (typeof stateObj.aiConsentAccepted !== "boolean") {
          stateObj.aiConsentAccepted = false;
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
