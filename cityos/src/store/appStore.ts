import { create } from "zustand";

type Theme = "light" | "dark" | "system";

interface AppState {
  theme: Theme;
  isSidebarOpen: boolean;
  isCopilotOpen: boolean;
  isOffline: boolean;
  // Actions
  setTheme: (theme: Theme) => void;
  toggleSidebar: () => void;
  openCopilot: () => void;
  closeCopilot: () => void;
  setOffline: (offline: boolean) => void;
}

export const useAppStore = create<AppState>()((set) => ({
  theme: "light",
  isSidebarOpen: false,
  isCopilotOpen: false,
  isOffline: false,

  setTheme: (theme) => set({ theme }),
  toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),
  openCopilot: () => set({ isCopilotOpen: true }),
  closeCopilot: () => set({ isCopilotOpen: false }),
  setOffline: (isOffline) => set({ isOffline }),
}));
