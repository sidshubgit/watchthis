import { create } from "zustand";

interface UiState {
  isRecordTaskOpen: boolean;
  isAddWebsiteOpen: boolean;
  preselectedWebsiteId: string | null;
  preselectedIncidentId: string | null;
  isMobileNavOpen: boolean;
  density: "compact" | "comfortable";
  toastMessage: { text: string; type: "success" | "error" | "info" } | null;

  openRecordTask: (options?: { websiteId?: string; incidentId?: string }) => void;
  closeRecordTask: () => void;
  openAddWebsite: () => void;
  closeAddWebsite: () => void;
  setIsMobileNavOpen: (open: boolean) => void;
  setDensity: (density: "compact" | "comfortable") => void;
  showToast: (text: string, type?: "success" | "error" | "info") => void;
  clearToast: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  isRecordTaskOpen: false,
  isAddWebsiteOpen: false,
  preselectedWebsiteId: null,
  preselectedIncidentId: null,
  isMobileNavOpen: false,
  density: "comfortable",
  toastMessage: null,

  openRecordTask: (options) =>
    set({
      isRecordTaskOpen: true,
      preselectedWebsiteId: options?.websiteId ?? null,
      preselectedIncidentId: options?.incidentId ?? null,
    }),
  closeRecordTask: () =>
    set({
      isRecordTaskOpen: false,
      preselectedWebsiteId: null,
      preselectedIncidentId: null,
    }),
  openAddWebsite: () => set({ isAddWebsiteOpen: true }),
  closeAddWebsite: () => set({ isAddWebsiteOpen: false }),
  setIsMobileNavOpen: (open) => set({ isMobileNavOpen: open }),
  setDensity: (density) => set({ density }),
  showToast: (text, type = "success") => set({ toastMessage: { text, type } }),
  clearToast: () => set({ toastMessage: null }),
}));
