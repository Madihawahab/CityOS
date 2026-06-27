"use client";

import { useMemo } from "react";
import { useReportsStore } from "@/store/reportsStore";
import { useAuthStore } from "@/store/authStore";

interface UseFilteredReportsFilters {
  status: string; // "all" | "submitted" | "in_progress" | "resolved" | "anonymous"
  searchQuery: string;
}

export function useFilteredReports(filters: UseFilteredReportsFilters) {
  const reports = useReportsStore((s) => s.reports);
  const user = useAuthStore((s) => s.user);

  return useMemo(() => {
    const reportsList = Object.values(reports);
    const userReports = reportsList.filter(
      (r) => r.citizenId === (user?.userId ?? "demo-citizen-1")
    );
    
    // Use user-specific reports or fallback to all reports for demo completeness
    const baseList = userReports.length > 0 ? userReports : reportsList;

    return baseList.filter((report) => {
      // Filter by Status / Anonymous mode
      if (filters.status !== "all") {
        if (filters.status === "anonymous") {
          if (!report.anonymousReport) return false;
        } else if (filters.status === "in_progress") {
          if (report.status !== "in_progress" && report.status !== "work_started") return false;
        } else if (filters.status === "resolved") {
          if (report.status !== "resolved" && report.status !== "closed") return false;
        } else if (report.status !== filters.status) {
          return false;
        }
      }

      // Filter by Search Query
      if (filters.searchQuery.trim() !== "") {
        const query = filters.searchQuery.toLowerCase();
        const matchTitle = report.title.toLowerCase().includes(query);
        const matchDesc = report.description.toLowerCase().includes(query);
        const matchAddress = report.location.address.toLowerCase().includes(query);
        if (!matchTitle && !matchDesc && !matchAddress) {
          return false;
        }
      }

      return true;
    });
  }, [reports, user, filters.status, filters.searchQuery]);
}
