"use client";

import { useMemo } from "react";
import { useReportsStore } from "@/store/reportsStore";
import type { MapMarkerData, IssueCategory, IssueSeverity, ReportStatus } from "@/types";

interface UseMapMarkersFilters {
  category?: IssueCategory | "all";
  severity?: IssueSeverity | "all";
  status?: ReportStatus | "all";
  searchQuery?: string;
}

export function useMapMarkers(filters: UseMapMarkersFilters) {
  const reports = useReportsStore((s) => s.reports);

  return useMemo(() => {
    const reportsList = Object.values(reports);

    return reportsList
      .filter((report) => {
        // Filter by Category
        if (filters.category && filters.category !== "all" && report.issueCategory !== filters.category) {
          return false;
        }
        // Filter by Severity
        if (filters.severity && filters.severity !== "all" && report.severity !== filters.severity) {
          return false;
        }
        // Filter by Status
        if (filters.status && filters.status !== "all" && report.status !== filters.status) {
          return false;
        }
        // Filter by Search Query
        if (filters.searchQuery && filters.searchQuery.trim() !== "") {
          const query = filters.searchQuery.toLowerCase();
          const matchTitle = report.title.toLowerCase().includes(query);
          const matchDesc = report.description.toLowerCase().includes(query);
          const matchAddress = report.location.address.toLowerCase().includes(query);
          if (!matchTitle && !matchDesc && !matchAddress) {
            return false;
          }
        }
        return true;
      })
      .map((report): MapMarkerData => ({
        reportId: report.reportId,
        latitude: report.location.latitude,
        longitude: report.location.longitude,
        category: report.issueCategory,
        severity: report.severity,
        title: report.title,
        status: report.status,
      }));
  }, [reports, filters.category, filters.severity, filters.status, filters.searchQuery]);
}
