"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { mockAnalytics } from "@/lib/mock/analytics";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function DepartmentPerformancePage() {
  const user = useAuthStore((s) => s.user);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const departmentName = user?.department || "BWSSB Water Works";

  // Fetch department stats from mock analytics
  const deptStats = useMemo(() => {
    const defaultStats = { resolved: 142, avgHours: 18, resolutionRate: 86 };
    return mockAnalytics.departmentPerformance[departmentName] || defaultStats;
  }, [departmentName]);

  const stats = useMemo(() => {
    const totalAssigned = Math.round(deptStats.resolved / (deptStats.resolutionRate / 100));
    return {
      totalAssigned,
      completed: deptStats.resolved,
      avgResolutionTime: deptStats.avgHours,
      citizenSatisfaction: Math.min(deptStats.resolutionRate + 6, 98), // slightly higher satisfaction
    };
  }, [deptStats]);

  // Dynamic/mock category distributions based on department
  const categoryData = useMemo(() => {
    if (departmentName.includes("Water")) {
      return [
        { name: "Water Leakage", percentage: 43, color: "bg-blue-500" },
        { name: "Pipeline Burst", percentage: 25, color: "bg-orange-500" },
        { name: "Low Pressure", percentage: 16, color: "bg-amber-500" },
        { name: "Other", percentage: 16, color: "bg-slate-500" },
      ];
    } else if (departmentName.includes("Roads")) {
      return [
        { name: "Potholes", percentage: 55, color: "bg-orange-500" },
        { name: "Broken Footpath", percentage: 25, color: "bg-blue-500" },
        { name: "Street Signage Missing", percentage: 12, color: "bg-amber-500" },
        { name: "Other", percentage: 8, color: "bg-slate-500" },
      ];
    } else {
      return [
        { name: "Equipment Outage", percentage: 50, color: "bg-blue-500" },
        { name: "Fallen Line", percentage: 30, color: "bg-red-500" },
        { name: "Street Light Fault", percentage: 15, color: "bg-amber-500" },
        { name: "Other", percentage: 5, color: "bg-slate-500" },
      ];
    }
  }, [departmentName]);

  const trendData = mockAnalytics.weeklyTrend || [];

  return (
    <div className="p-8 space-y-8 bg-[#0a0f1c] min-h-screen text-slate-100">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Department Performance</h2>
          <p className="text-slate-400 text-sm">Historical trends and satisfaction insights for {departmentName}.</p>
        </div>
        <Link
          href="/authority"
          className="text-xs text-blue-500 hover:underline flex items-center gap-1 focus:outline-none"
        >
          <span className="material-symbols-outlined text-[14px]">arrow_back</span>
          Back to Dashboard
        </Link>
      </header>

      {/* Stats Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" aria-label="Performance Metrics">
        <div className="bg-[#12192c] p-6 rounded-2xl border border-slate-800/50 space-y-2">
          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Total Assigned</p>
          <p className="text-3xl font-extrabold text-white">{stats.totalAssigned}</p>
          <p className="text-xs text-green-500 font-medium">+12% from last month</p>
        </div>
        <div className="bg-[#12192c] p-6 rounded-2xl border border-slate-800/50 space-y-2">
          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Completed Repairs</p>
          <p className="text-3xl font-extrabold text-white">{stats.completed}</p>
          <p className="text-xs text-green-500 font-medium">+18% resolution efficiency</p>
        </div>
        <div className="bg-[#12192c] p-6 rounded-2xl border border-slate-800/50 space-y-2">
          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Avg. Resolution Time</p>
          <p className="text-3xl font-extrabold text-white">
            {stats.avgResolutionTime} <span className="text-base font-normal text-slate-500">hours</span>
          </p>
          <p className="text-xs text-green-500 font-medium">-2.4 hrs improvement</p>
        </div>
        <div className="bg-[#12192c] p-6 rounded-2xl border border-slate-800/50 space-y-2">
          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Citizen Satisfaction</p>
          <p className="text-3xl font-extrabold text-white">{stats.citizenSatisfaction}%</p>
          <p className="text-xs text-blue-400 font-medium">94% post-repair rating</p>
        </div>
      </section>

      {/* Charts Grid */}
      <div className="grid grid-cols-12 gap-8">
        {/* Trend Area Chart (col-span-8) */}
        <section className="col-span-12 lg:col-span-8 bg-[#12192c] border border-slate-800/50 rounded-2xl p-6 flex flex-col space-y-4">
          <div>
            <h3 className="font-bold text-lg text-white">Performance Overview</h3>
            <p className="text-xs text-slate-400">Weekly trend analysis comparing reported, resolved, and AI-predicted civic issues.</p>
          </div>

          <div className="h-[320px] w-full relative">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorReported" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.3} />
                  <XAxis
                    dataKey="date"
                    stroke="#475569"
                    fontSize={10}
                    tickFormatter={(val) => {
                      const parts = val.split("-");
                      return parts.length > 2 ? `${parts[1]}/${parts[2]}` : val;
                    }}
                  />
                  <YAxis stroke="#475569" fontSize={10} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#12192c",
                      borderColor: "#1e293b",
                      borderRadius: "12px",
                      color: "#f8fafc",
                      fontSize: "11px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="reported"
                    stroke="#ef4444"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorReported)"
                    name="Reported Issues"
                  />
                  <Area
                    type="monotone"
                    dataKey="resolved"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorResolved)"
                    name="Resolved Issues"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full bg-slate-900 animate-pulse rounded-lg" />
            )}
          </div>
        </section>

        {/* Top Issue Categories (col-span-4) */}
        <section className="col-span-12 lg:col-span-4 bg-[#12192c] border border-slate-800/50 rounded-2xl p-6 flex flex-col space-y-6">
          <div>
            <h3 className="font-bold text-lg text-white">Top Issue Categories</h3>
            <p className="text-xs text-slate-400">Distribution of reports by primary categories in your sector.</p>
          </div>

          <div className="space-y-5 flex-1 flex flex-col justify-center">
            {categoryData.map((cat, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">{cat.name}</span>
                  <span className="text-slate-500 font-semibold">{cat.percentage}%</span>
                </div>
                <div className="w-full h-1.5 bg-[#1a2337] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${cat.color}`}
                    style={{ width: mounted ? `${cat.percentage}%` : "0%" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
