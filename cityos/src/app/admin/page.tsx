"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAdminDashboard } from "@/hooks/useAdminDashboard";
import { useAuthStore } from "@/store/authStore";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const MapView = dynamic(
  () => import("@/components/map/MapView").then((mod) => mod.MapView),
  { ssr: false, loading: () => <div className="h-full w-full bg-slate-900 animate-pulse flex items-center justify-center text-slate-500">Loading Map...</div> }
);

export default function AdminOverviewPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { kpis, priorityDistribution, recentHighPriority, departmentPerformance, selectedDateRange, setSelectedDateRange } = useAdminDashboard();
  
  const adminName = user?.fullName || "Admin User";

  // Pie chart data for Pending Reports by Priority
  const pieData = useMemo(() => [
    { name: "Critical", value: priorityDistribution.critical, color: "#ef4444" },
    { name: "High", value: priorityDistribution.high, color: "#f59e0b" },
    { name: "Medium", value: priorityDistribution.medium, color: "#3b82f6" },
    { name: "Low", value: priorityDistribution.low, color: "#94a3b8" },
  ], [priorityDistribution]);

  // Map markers from high priority reports
  const mapMarkers = useMemo(() => {
    return recentHighPriority.map((r) => ({
      reportId: r.reportId,
      latitude: r.location.latitude,
      longitude: r.location.longitude,
      category: r.issueCategory,
      severity: r.severity,
      title: r.title,
      status: r.status,
    }));
  }, [recentHighPriority]);

  return (
    <div className="flex-grow flex flex-col h-full overflow-hidden bg-[#0a0f1c] font-sans text-slate-200">
      {/* Header */}
      <header className="h-16 border-b border-slate-800 flex items-center justify-between px-6 flex-shrink-0 bg-[#070c1a]">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-lg font-semibold leading-none text-white">Good morning, {adminName} 👋</h2>
            <p className="text-[11px] text-slate-500 mt-1">Here&apos;s what&apos;s happening in your city today.</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4 text-slate-400 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[14px]">calendar_today</span>
              May 21, 2025
            </span>
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[14px]">schedule</span>
              10:30 AM
            </span>
          </div>
          <div className="flex bg-[#12192c] border border-slate-800 rounded-lg p-1">
            <select
              value={selectedDateRange}
              onChange={(e) => setSelectedDateRange(e.target.value)}
              className="bg-transparent border-none text-[11px] text-slate-300 focus:ring-0 cursor-pointer pr-8 py-0.5"
            >
              <option value="7 Days">7 Days</option>
              <option value="Today">Today</option>
              <option value="30 Days">30 Days</option>
            </select>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-grow overflow-y-auto p-6 space-y-6">
        {/* KPI Grid */}
        <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4" aria-label="Key Performance Indicators">
          {/* Pending Reports */}
          <div className="bg-[#12192c] border border-slate-850 rounded-xl p-4 flex flex-col gap-2 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                <span className="material-symbols-outlined text-[20px]">assignment</span>
              </div>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Pending Reports</p>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-white">{kpis.pendingCount}</span>
                <span className="text-[9px] text-green-400 font-medium">+12 today</span>
              </div>
            </div>
          </div>
          {/* High Priority */}
          <div className="bg-[#12192c] border border-slate-850 rounded-xl p-4 flex flex-col gap-2 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-red-500/10 rounded-lg text-red-400">
                <span className="material-symbols-outlined text-[20px]">warning</span>
              </div>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">High Priority</p>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-white">{kpis.highPriorityCount}</span>
                <span className="text-[9px] text-red-400 font-medium">+3 urgent</span>
              </div>
            </div>
          </div>
          {/* Departments Active */}
          <div className="bg-[#12192c] border border-slate-850 rounded-xl p-4 flex flex-col gap-2 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                <span className="material-symbols-outlined text-[20px]">corporate_fare</span>
              </div>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Active Departments</p>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-white">{kpis.activeDepartmentsCount}</span>
                <span className="text-[9px] text-slate-500">All modules active</span>
              </div>
            </div>
          </div>
          {/* In Progress */}
          <div className="bg-[#12192c] border border-slate-850 rounded-xl p-4 flex flex-col gap-2 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-400">
                <span className="material-symbols-outlined text-[20px]">sync</span>
              </div>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">In Progress</p>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-white">{kpis.inProgressCount}</span>
                <span className="text-[9px] text-yellow-400 font-medium">Active dispatches</span>
              </div>
            </div>
          </div>
          {/* Resolved Today */}
          <div className="bg-[#12192c] border border-slate-850 rounded-xl p-4 flex flex-col gap-2 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-green-500/10 rounded-lg text-green-400">
                <span className="material-symbols-outlined text-[20px]">task_alt</span>
              </div>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Resolved Today</p>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-white">{kpis.resolvedTodayCount}</span>
                <span className="text-[9px] text-green-400 font-medium">+15 from yesterday</span>
              </div>
            </div>
          </div>
          {/* Avg Response Time */}
          <div className="bg-[#12192c] border border-slate-850 rounded-xl p-4 flex flex-col gap-2 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-sky-500/10 rounded-lg text-sky-400">
                <span className="material-symbols-outlined text-[20px]">timer</span>
              </div>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Avg Response Time</p>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-white">{kpis.avgResponseTime}</span>
                <span className="text-[10px] text-slate-400 font-normal">hrs</span>
                <span className="text-[9px] text-green-400 font-medium">-0.8h SLA improvement</span>
              </div>
            </div>
          </div>
        </section>

        {/* Charts & Map Section */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Pending by Priority Donut Chart */}
          <div className="lg:col-span-3 bg-[#12192c] border border-slate-850 rounded-xl p-5 flex flex-col shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-6">Pending Reports by Priority</h3>
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="relative w-40 h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieData.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-white">{priorityDistribution.total}</span>
                  <span className="text-[9px] text-slate-500 uppercase tracking-widest">Total</span>
                </div>
              </div>
              <div className="mt-6 w-full space-y-2 text-[11px]">
                {pieData.map((d) => (
                  <div key={d.name} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }}></span>
                      <span className="text-slate-400">{d.name}</span>
                    </div>
                    <span className="font-semibold text-white">
                      {d.value} ({priorityDistribution.total > 0 ? Math.round((d.value / priorityDistribution.total) * 100) : 0}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Live City Map */}
          <div className="lg:col-span-6 bg-[#12192c] border border-slate-850 rounded-xl p-5 flex flex-col relative overflow-hidden shadow-sm min-h-[350px]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Live City Map</h3>
              <div className="flex items-center gap-2">
                <Link
                  href="/admin/report-oversight"
                  className="px-2.5 py-1 bg-slate-800 rounded-md text-[10px] text-slate-300 border border-slate-700/50 hover:bg-slate-700 transition-colors"
                >
                  Manage Reports
                </Link>
              </div>
            </div>
            <div className="flex-1 rounded-xl overflow-hidden border border-slate-800 relative bg-[#0a0f1d]">
              <MapView markers={mapMarkers} />
            </div>
          </div>

          {/* AI Recommendations */}
          <div className="lg:col-span-3 bg-[#12192c] border border-slate-850 rounded-xl p-5 flex flex-col shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-[18px] text-blue-400">smart_toy</span>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">AI Recommendations</h3>
            </div>
            <div className="flex-1 space-y-3">
              <div className="p-3 bg-slate-900/40 border border-slate-800/80 rounded-xl hover:border-blue-500/30 transition-all cursor-pointer">
                <div className="flex justify-between items-start gap-2 mb-1">
                  <h4 className="text-[11px] font-bold text-white truncate">Focus on Water Leakage in North Zone</h4>
                  <span className="flex-shrink-0 text-[8px] font-bold px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">High Impact</span>
                </div>
                <p className="text-[10px] text-slate-500">Based on 8 merged reports in Koramangala.</p>
              </div>
              <div className="p-3 bg-slate-900/40 border border-slate-800/80 rounded-xl hover:border-blue-500/30 transition-all cursor-pointer">
                <div className="flex justify-between items-start gap-2 mb-1">
                  <h4 className="text-[11px] font-bold text-white truncate">Road Repair Needed on Outer Ring Road</h4>
                  <span className="flex-shrink-0 text-[8px] font-bold px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30">Medium Impact</span>
                </div>
                <p className="text-[10px] text-slate-500">Telemetry points at progressive asphalt fatigue.</p>
              </div>
              <div className="p-3 bg-slate-900/40 border border-slate-800/80 rounded-xl hover:border-blue-500/30 transition-all cursor-pointer">
                <div className="flex justify-between items-start gap-2 mb-1">
                  <h4 className="text-[11px] font-bold text-white truncate">Sanitation collection delay predicted</h4>
                  <span className="flex-shrink-0 text-[8px] font-bold px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30">Medium Impact</span>
                </div>
                <p className="text-[10px] text-slate-500">Market waste overflows expected in next 24h.</p>
              </div>
            </div>
            <Link
              href="/admin/analytics"
              className="mt-4 text-[11px] text-blue-400 font-medium flex items-center gap-1 hover:underline"
            >
              <span>View detailed predictions</span>
              <span>→</span>
            </Link>
          </div>
        </section>

        {/* Bottom Detailed Table Section */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Recent High Priority Reports Table */}
          <div className="lg:col-span-9 bg-[#12192c] border border-slate-850 rounded-xl p-5 overflow-hidden flex flex-col shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Recent High Priority Reports</h3>
              <Link href="/admin/report-oversight" className="text-xs text-blue-400 hover:underline">
                View all oversight queue
              </Link>
            </div>
            <div className="flex-grow overflow-x-auto">
              <table className="w-full text-[11px] text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="text-slate-500 border-b border-slate-800">
                    <th className="pb-3 px-2 font-medium">ID</th>
                    <th className="pb-3 px-2 font-medium">Issue</th>
                    <th className="pb-3 px-2 font-medium">Location</th>
                    <th className="pb-3 px-2 font-medium">Department</th>
                    <th className="pb-3 px-2 font-medium">Status</th>
                    <th className="pb-3 px-2 font-medium">AI recommendation</th>
                    <th className="pb-3 px-2 font-medium">Trust Score</th>
                    <th className="pb-3 px-2 font-medium">Duplicates</th>
                    <th className="pb-3 px-2 font-medium">Est. Resolution</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {recentHighPriority.slice(0, 5).map((r) => (
                    <tr
                      key={r.reportId}
                      onClick={() => router.push(`/admin/report-oversight?reportId=${r.reportId}`)}
                      className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                    >
                      <td className="py-3 px-2 font-mono text-slate-400">{r.reportId}</td>
                      <td className="py-3 px-2 font-semibold text-white">{r.title}</td>
                      <td className="py-3 px-2 text-slate-400 truncate max-w-[150px]">{r.location.address}</td>
                      <td className="py-3 px-2 text-slate-400">{r.departmentAssigned || "Unassigned"}</td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold ${
                          r.status === "resolved"
                            ? "bg-green-500/10 text-green-400 border border-green-500/25"
                            : r.status === "in_progress" || r.status === "work_started"
                            ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/25"
                            : "bg-blue-500/10 text-blue-400 border border-blue-500/25"
                        }`}>
                          {r.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[9px]">
                          {r.severity === "critical" ? "Immediate Dispatch" : "Schedule Service"}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-green-400 font-bold">{r.trustScore || 85}%</td>
                      <td className="py-3 px-2">
                        {r.mergedReportIds?.length > 0 ? (
                          <span className="text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded text-[9px]">
                            Merged ({r.mergedReportIds.length})
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[10px]">—</span>
                        )}
                      </td>
                      <td className="py-3 px-2 text-slate-400 font-semibold">{r.estimatedResolution || "1 Day"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* AI Insights & Department Performance */}
          <div className="lg:col-span-3 space-y-6 flex flex-col">
            {/* AI Insights Summary */}
            <div className="bg-[#12192c] border border-slate-850 rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-[16px] text-blue-400">insights</span>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">AI Insights Summary</h3>
              </div>
              <div className="space-y-3 text-[11px]">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Reports analyzed today</span>
                  <span className="font-bold text-white">{recentHighPriority.length + 5}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Duplicates merged</span>
                  <span className="font-bold text-white">
                    {recentHighPriority.reduce((acc, curr) => acc + (curr.mergedReportIds?.length || 0), 0) || 32}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Spam reports filtered</span>
                  <span className="font-bold text-white">7</span>
                </div>
              </div>
            </div>

            {/* Department Performance completion bars */}
            <div className="bg-[#12192c] border border-slate-850 rounded-xl p-5 shadow-sm flex-1 flex flex-col">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-4">Department Performance</h3>
              <div className="space-y-3.5 flex-grow">
                {departmentPerformance.slice(0, 4).map((d) => (
                  <div key={d.name}>
                    <div className="flex justify-between items-center mb-1 text-[10px]">
                      <span className="text-slate-400 truncate max-w-[120px]">{d.name.replace("BBMP ", "").replace("BESCOM ", "").replace("BWSSB ", "")}</span>
                      <span className="font-bold text-white">{d.resolvedRate}%</span>
                    </div>
                    <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${d.resolvedRate}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
