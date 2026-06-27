import { create } from "zustand";
import type { Report, FilterState } from "@/types";

interface ReportsState {
  // Cache
  reports: Record<string, Report>;
  // Filters
  activeFilters: FilterState;
  // Actions
  setReport: (report: Report) => void;
  setReports: (reports: Report[]) => void;
  updateFilters: (filters: Partial<FilterState>) => void;
  clearFilters: () => void;
  getReportById: (id: string) => Report | undefined;
}

export const useReportsStore = create<ReportsState>()((set, get) => ({
  reports: {},
  activeFilters: {},

  setReport: (report) =>
    set((state) => ({
      reports: { ...state.reports, [report.reportId]: report },
    })),

  setReports: (reports) => {
    const mapped: Record<string, Report> = {};
    reports.forEach((r) => { mapped[r.reportId] = r; });
    set({ reports: mapped });
  },

  updateFilters: (filters) =>
    set((state) => ({
      activeFilters: { ...state.activeFilters, ...filters },
    })),

  clearFilters: () => set({ activeFilters: {} }),

  getReportById: (id) => get().reports[id],
}));
