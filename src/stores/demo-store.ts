import { create } from "zustand";
import { mockRepository } from "@/mocks/repository/mock-repository";

interface DemoState {
  isSimulatedLive: boolean;
  updateCadenceSeconds: number;
  lastSimulatedCheckAt: string;
  hasNewTimelineEvents: boolean;
  newTimelineEventsCount: number;
  isPerformingAction: boolean;
  isProbingLive: boolean;
  
  // Actions
  setIsSimulatedLive: (active: boolean) => void;
  setUpdateCadenceSeconds: (seconds: number) => void;
  setHasNewTimelineEvents: (val: boolean, count?: number) => void;
  clearNewTimelineEvents: () => void;
  
  simulateOutage: (websiteId?: string) => Promise<void>;
  simulateRecovery: (websiteIdOrIncidentId?: string) => Promise<void>;
  probeLiveWebsites: () => Promise<void>;
  resetDemoData: () => Promise<void>;
}

export const useDemoStore = create<DemoState>((set) => ({
  isSimulatedLive: true,
  updateCadenceSeconds: 30,
  lastSimulatedCheckAt: new Date().toISOString(),
  hasNewTimelineEvents: false,
  newTimelineEventsCount: 0,
  isPerformingAction: false,
  isProbingLive: false,

  setIsSimulatedLive: (active) => set({ isSimulatedLive: active }),
  setUpdateCadenceSeconds: (seconds) => set({ updateCadenceSeconds: seconds }),
  setHasNewTimelineEvents: (val, count = 1) =>
    set((state) => ({
      hasNewTimelineEvents: val,
      newTimelineEventsCount: val ? state.newTimelineEventsCount + count : 0,
    })),
  clearNewTimelineEvents: () => set({ hasNewTimelineEvents: false, newTimelineEventsCount: 0 }),

  probeLiveWebsites: async () => {
    set({ isProbingLive: true });
    try {
      await mockRepository.probeAllWebsites();
      set({ lastSimulatedCheckAt: new Date().toISOString() });
    } finally {
      set({ isProbingLive: false });
    }
  },

  simulateOutage: async (websiteId?: string) => {
    set({ isPerformingAction: true });
    try {
      await mockRepository.simulateOutage(websiteId);
      set((state) => ({
        lastSimulatedCheckAt: new Date().toISOString(),
        hasNewTimelineEvents: true,
        newTimelineEventsCount: state.newTimelineEventsCount + 2,
      }));
    } finally {
      set({ isPerformingAction: false });
    }
  },

  simulateRecovery: async (websiteIdOrIncidentId?: string) => {
    set({ isPerformingAction: true });
    try {
      await mockRepository.simulateRecovery(websiteIdOrIncidentId);
      set((state) => ({
        lastSimulatedCheckAt: new Date().toISOString(),
        hasNewTimelineEvents: true,
        newTimelineEventsCount: state.newTimelineEventsCount + 2,
      }));
    } finally {
      set({ isPerformingAction: false });
    }
  },

  resetDemoData: async () => {
    set({ isPerformingAction: true });
    try {
      mockRepository.resetDemoData();
      set({
        lastSimulatedCheckAt: new Date().toISOString(),
        hasNewTimelineEvents: false,
        newTimelineEventsCount: 0,
      });
    } finally {
      set({ isPerformingAction: false });
    }
  },
}));
