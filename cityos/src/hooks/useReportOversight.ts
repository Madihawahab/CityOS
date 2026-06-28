"use client";

import { useMemo, useState } from "react";
import { useReportsStore } from "@/store/reportsStore";
import type { Report, IssueSeverity } from "@/types";

export function useReportOversight() {
  const reports = useReportsStore((s) => s.reports);
  const setReport = useReportsStore((s) => s.setReport);

  const [activeTab, setActiveTab] = useState<"all" | "critical" | "high" | "medium" | "low">("all");
  const [selectedDept, setSelectedDept] = useState("All Departments");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  // Filtered reports list
  const filteredReports = useMemo(() => {
    const list = Object.values(reports);

    return list.filter((r) => {
      // 1. Tab severity filter
      if (activeTab !== "all" && r.severity !== activeTab) {
        return false;
      }

      // 2. Department filter
      if (selectedDept !== "All Departments") {
        if (!r.departmentAssigned || !r.departmentAssigned.includes(selectedDept)) {
          return false;
        }
      }

      // 3. Search query (title, address, ID)
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        const matchTitle = r.title.toLowerCase().includes(query);
        const matchAddress = r.location.address.toLowerCase().includes(query);
        const matchId = r.reportId.toLowerCase().includes(query);
        if (!matchTitle && !matchAddress && !matchId) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [reports, activeTab, selectedDept, searchQuery]);

  // Selected report details
  const selectedReport = useMemo(() => {
    if (selectedReportId) {
      return reports[selectedReportId];
    }
    // Default to the first filtered report if none selected
    if (filteredReports.length > 0) {
      return filteredReports[0];
    }
    return null;
  }, [reports, selectedReportId, filteredReports]);

  // Admin Actions
  const assignDepartment = (reportId: string, department: string) => {
    const report = reports[reportId];
    if (report) {
      const updated: Report = {
        ...report,
        departmentAssigned: department,
        status: "assigned", // Transition status to assigned
        updatedAt: new Date(),
      };
      setReport(updated);
    }
  };

  const escalateReport = (reportId: string, severity: IssueSeverity) => {
    const report = reports[reportId];
    if (report) {
      const updated: Report = {
        ...report,
        severity,
        priority: severity, // Keep both in sync
        updatedAt: new Date(),
      };
      setReport(updated);
    }
  };

  // Tab counts
  const tabCounts = useMemo(() => {
    const list = Object.values(reports);
    return {
      all: list.length,
      critical: list.filter((r) => r.severity === "critical").length,
      high: list.filter((r) => r.severity === "high").length,
      medium: list.filter((r) => r.severity === "medium").length,
      low: list.filter((r) => r.severity === "low").length,
    };
  }, [reports]);

  return {
    filteredReports,
    selectedReport,
    activeTab,
    setActiveTab,
    selectedDept,
    setSelectedDept,
    searchQuery,
    setSearchQuery,
    selectedReportId,
    setSelectedReportId,
    assignDepartment,
    escalateReport,
    tabCounts,
  };
}
