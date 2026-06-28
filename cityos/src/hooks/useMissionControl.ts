"use client";

import { useMemo } from "react";
import { useReportsStore } from "@/store/reportsStore";

export interface AIEngineStatus {
  id: string;
  name: string;
  emoji: string;
  status: "processing" | "active" | "idle" | "error";
  processedCount: number;
  confidence: number; // percentage: 0-100
  description: string;
}

export function useMissionControl() {
  const reports = useReportsStore((s) => s.reports);

  return useMemo(() => {
    const list = Object.values(reports);
    const totalReports = list.length || 20;

    // Calculate actual average trust score from store
    const totalTrust = list.reduce((acc, r) => acc + (r.trustScore || 85), 0);
    const avgTrustScore = totalReports > 0 ? Math.round(totalTrust / totalReports) : 94;

    // Calculate actual average AI confidence from store
    const totalConfidence = list.reduce((acc, r) => acc + ((r.aiConfidence || 0.9) * 100), 0);
    const avgConfidence = totalReports > 0 ? Math.round(totalConfidence / totalReports) : 95;

    // Count of reports processed by Decision Intelligence (assigned/in progress/resolved)
    const decisionCount = list.filter((r) => 
      ["assigned", "in_progress", "work_started", "evidence_uploaded", "resolved", "closed"].includes(r.status)
    ).length;

    // Count of reports verified by Resolution Intelligence (evidence uploaded/resolved/closed)
    const resolutionCount = list.filter((r) => 
      ["evidence_uploaded", "resolved", "closed"].includes(r.status)
    ).length;

    // Count duplicates merged
    const duplicateCount = list.reduce((acc, r) => acc + (r.mergedReportIds?.length || 0), 0);

    const engines: AIEngineStatus[] = [
      {
        id: "report_intelligence",
        name: "Report Intelligence",
        emoji: "🧠",
        status: "processing",
        processedCount: totalReports,
        confidence: avgConfidence,
        description: "Analyzing incoming reports and extracting key insights.",
      },
      {
        id: "trust_engine",
        name: "Trust Engine",
        emoji: "🛡️",
        status: "processing",
        processedCount: totalReports,
        confidence: avgTrustScore,
        description: "Verifying authenticity, detecting spam and duplicates.",
      },
      {
        id: "decision_intelligence",
        name: "Decision Intelligence",
        emoji: "⚖️",
        status: "processing",
        processedCount: decisionCount || 15,
        confidence: 93,
        description: "Prioritizing issues based on impact, urgency and risk.",
      },
      {
        id: "resolution_intelligence",
        name: "Resolution Intelligence",
        emoji: "🎯",
        status: "processing",
        processedCount: resolutionCount || 8,
        confidence: 94,
        description: "Recommending best actions and predicting resolution time.",
      },
      {
        id: "civic_intelligence",
        name: "Civic Intelligence",
        emoji: "📊",
        status: "active",
        processedCount: 128, // Simulating long-term projections
        confidence: 95,
        description: "Predicting future issues and infrastructure risks.",
      },
      {
        id: "civic_copilot",
        name: "Civic Copilot",
        emoji: "🤖",
        status: "active",
        processedCount: 24, // Chat/Copilot queries
        confidence: 96,
        description: "Generating summaries, recommendations and insights.",
      },
    ];

    // Calculate Decisions Distribution
    let criticalCount = 0;
    let highCount = 0;
    let mediumCount = 0;
    let lowCount = 0;
    let infoCount = 0;

    list.forEach((r) => {
      if (r.severity === "critical") criticalCount++;
      else if (r.severity === "high") highCount++;
      else if (r.severity === "medium") mediumCount++;
      else if (r.severity === "low") lowCount++;
      else infoCount++;
    });

    // If zero, fallback to default design percentages
    const totalDist = criticalCount + highCount + mediumCount + lowCount + infoCount || 20;

    // AI Activity Feed
    const activities = [
      {
        id: "act-1",
        icon: "👥",
        title: "Duplicate cluster detected",
        desc: `${duplicateCount || 8} reports merged into active issues to prevent dispatch duplication`,
        time: "10:29 AM",
        color: "orange",
      },
      {
        id: "act-2",
        icon: "💧",
        title: "High risk water leakage predicted",
        desc: "MG Road area - probability 87% based on pipe stress telemetry",
        time: "10:28 AM",
        color: "blue",
      },
      {
        id: "act-3",
        icon: "⚠️",
        title: "Priority changed to Critical",
        desc: `AI elevated priority on water logging near Hospital due to high public impact`,
        time: "10:27 AM",
        color: "red",
      },
      {
        id: "act-4",
        icon: "🛡️",
        title: "Resolution recommendation generated",
        desc: "Automated routing dispatched to BWSSB Water Works crew - ETA 2 hrs",
        time: "10:26 AM",
        color: "green",
      },
      {
        id: "act-5",
        icon: "💬",
        title: "Community verification received",
        desc: "18 citizens verified the completion of sewage pipeline repair #RPT-2026-006",
        time: "10:24 AM",
        color: "purple",
      },
    ];

    // Top categories distribution
    const categoryStats: Record<string, number> = {};
    list.forEach((r) => {
      categoryStats[r.issueCategory] = (categoryStats[r.issueCategory] || 0) + 1;
    });

    return {
      engines,
      totalReports,
      avgTrustScore,
      duplicateCount,
      decisionsDistribution: {
        critical: criticalCount,
        high: highCount,
        medium: mediumCount,
        low: lowCount,
        info: infoCount,
        total: totalDist,
      },
      activities,
      categoryStats,
    };
  }, [reports]);
}
