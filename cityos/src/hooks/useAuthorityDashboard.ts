"use client";

import { useState, useMemo, useEffect } from "react";
import { useReportsStore } from "@/store/reportsStore";
import { useAuthStore } from "@/store/authStore";
import { mockDepartments } from "@/lib/mock/departments";
import type { MapMarkerData } from "@/types";

export function useAuthorityDashboard() {
  const reports = useReportsStore((s) => s.reports);
  const user = useAuthStore((s) => s.user);

  // Default selected department to the user's department, fallback to BWSSB Water Works
  const [selectedDepartment, setSelectedDepartment] = useState<string>("BWSSB Water Works");

  useEffect(() => {
    if (user?.department) {
      // In users.ts, Ramesh Kumar is BWSSB Water Works
      const timer = setTimeout(() => {
        setSelectedDepartment(user.department || "BWSSB Water Works");
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [user]);

  // Filter tab for Today's Work Queue ("all" | "high" | "medium" | "low")
  const [activeTab, setActiveTab] = useState<string>("all");

  const reportsList = useMemo(() => Object.values(reports), [reports]);

  // Filter reports belonging to the selected department
  const deptReports = useMemo(() => {
    return reportsList.filter(
      (r) => r.departmentAssigned?.toLowerCase().includes(selectedDepartment.toLowerCase()) || 
             r.issueCategory === (selectedDepartment.toLowerCase().includes("water") ? "water" : 
                                 selectedDepartment.toLowerCase().includes("road") ? "roads" : 
                                 selectedDepartment.toLowerCase().includes("electricity") ? "electricity" : 
                                 selectedDepartment.toLowerCase().includes("sanitation") ? "sanitation" : "other")
    );
  }, [reportsList, selectedDepartment]);

  // Compute KPIs dynamically
  const kpis = useMemo(() => {
    const assignedToday = deptReports.filter((r) => r.status !== "resolved" && r.status !== "closed").length;
    const inProgress = deptReports.filter((r) => r.status === "in_progress" || r.status === "work_started").length;
    const completedToday = deptReports.filter((r) => r.status === "resolved" || r.status === "closed").length;

    // Get average resolution time from mockDepartments or fallback to 18
    const deptInfo = mockDepartments.find(
      (d) => d.departmentName.toLowerCase() === selectedDepartment.toLowerCase()
    );
    const avgResolutionTime = deptInfo ? deptInfo.averageResolutionTime : 18;

    return {
      assignedToday,
      inProgress,
      completedToday,
      avgResolutionTime,
    };
  }, [deptReports, selectedDepartment]);

  // Filtered reports list for Work Queue based on active tab (severity)
  const filteredReports = useMemo(() => {
    return deptReports.filter((r) => {
      if (activeTab === "all") return true;
      if (activeTab === "high") return r.severity === "high" || r.severity === "critical";
      return r.severity === activeTab;
    });
  }, [deptReports, activeTab]);

  // Map markers for the selected department
  const mapMarkers = useMemo(() => {
    return deptReports.map((r): MapMarkerData => ({
      reportId: r.reportId,
      latitude: r.location.latitude,
      longitude: r.location.longitude,
      category: r.issueCategory,
      severity: r.severity,
      title: r.title,
      status: r.status,
    }));
  }, [deptReports]);

  return {
    selectedDepartment,
    setSelectedDepartment,
    activeTab,
    setActiveTab,
    kpis,
    filteredReports,
    mapMarkers,
  };
}
