"use client";

import { useMemo } from "react";
import { useReportsStore } from "@/store/reportsStore";
import { useAuthStore } from "@/store/authStore";
import type { Report } from "@/types";

interface UseFilteredReportsFilters {
  status: string; // "all" | "active" | "verification_pending" | "resolved" | "anonymous" | "supported" | "following"
  searchQuery: string;
  sortBy?: "newest" | "oldest" | "priority" | "updated" | "supported";
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

    let filtered = baseList.filter((report) => {
      // Filter by Status Group
      if (filters.status !== "all") {
        if (filters.status === "active") {
          const activeStatuses = ["submitted", "ai_processing", "ai_verified", "assigned", "in_progress", "work_started", "evidence_uploaded", "ai_verifying_repair"];
          if (!activeStatuses.includes(report.status)) return false;
        } else if (filters.status === "verification_pending") {
          if (report.status !== "citizen_verification_pending") return false;
        } else if (filters.status === "resolved") {
          if (report.status !== "resolved" && report.status !== "closed") return false;
        } else if (filters.status === "anonymous") {
          if (!report.anonymousReport) return false;
        } else if (filters.status === "supported") {
          if ((report.communitySupport || 0) === 0) return false;
        } else if (filters.status === "following") {
          // Mock following logic - assume reports they support they are following for now
          if ((report.communitySupport || 0) === 0) return false;
        } else if (report.status !== filters.status) { // fallback
          return false;
        }
      }

      // Filter by Search Query
      if (filters.searchQuery.trim() !== "") {
        const query = filters.searchQuery.toLowerCase();
        const matchTitle = report.title.toLowerCase().includes(query);
        const matchDesc = report.description.toLowerCase().includes(query);
        const matchAddress = report.location.address.toLowerCase().includes(query);
        const matchId = report.reportId.toLowerCase().includes(query);
        const matchCategory = report.issueCategory.toLowerCase().includes(query);
        const matchDepartment = report.departmentAssigned?.toLowerCase().includes(query) ?? false;
        const matchWard = report.location.ward?.toLowerCase().includes(query) ?? false;
        
        if (!matchTitle && !matchDesc && !matchAddress && !matchId && !matchCategory && !matchDepartment && !matchWard) {
          return false;
        }
      }

      return true;
    });

    // Sorting
    if (filters.sortBy) {
      filtered = filtered.sort((a, b) => {
        switch (filters.sortBy) {
          case "newest":
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          case "oldest":
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          case "priority": {
            const severityRank: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };
            const rankA = severityRank[a.severity || "medium"] || 0;
            const rankB = severityRank[b.severity || "medium"] || 0;
            if (rankA !== rankB) return rankB - rankA;
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          }
          case "updated":
            return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
          case "supported":
            return (b.communitySupport || 0) - (a.communitySupport || 0);
          default:
            return 0;
        }
      });
    }

    return filtered;
  }, [reports, user, filters.status, filters.searchQuery, filters.sortBy]);
}
