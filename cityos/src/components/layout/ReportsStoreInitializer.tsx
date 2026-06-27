"use client";

import { useEffect } from "react";
import { useReportsStore } from "@/store/reportsStore";
import { mockReports } from "@/lib/mock/reports";

export function ReportsStoreInitializer() {
  const setReports = useReportsStore((s) => s.setReports);
  const reports = useReportsStore((s) => s.reports);

  useEffect(() => {
    if (Object.keys(reports).length === 0) {
      setReports(mockReports);
    }
  }, [reports, setReports]);

  return null;
}
