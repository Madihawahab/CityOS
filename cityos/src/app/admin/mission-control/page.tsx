"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import { useMissionControl } from "@/hooks/useMissionControl";
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

const MapView = dynamic(
  () => import("@/components/map/MapView").then((mod) => mod.MapView),
  { ssr: false, loading: () => <div className="h-full w-full bg-slate-900 animate-pulse flex items-center justify-center text-slate-500">Loading Map...</div> }
);

export default function AIMissionControlPage() {
  const { engines, totalReports, avgTrustScore, duplicateCount, decisionsDistribution, activities, categoryStats } = useMissionControl();

  // Pie chart data for Decisions Distribution
  const decisionsData = useMemo(() => [
    { name: "Critical", value: decisionsDistribution.critical || 23, color: "#f97316" },
    { name: "High", value: decisionsDistribution.high || 31, color: "#ef4444" },
    { name: "Medium", value: decisionsDistribution.medium || 28, color: "#3b82f6" },
    { name: "Low", value: decisionsDistribution.low || 12, color: "#06b6d4" },
    { name: "Info", value: decisionsDistribution.info || 6, color: "#64748b" },
  ], [decisionsDistribution]);

  // System performance trend mock data (clean line chart)
  const performanceTrendData = [
    { name: "12 AM", reportIntel: 94, trustEngine: 95, decisionIntel: 92, resolutionIntel: 93 },
    { name: "3 AM", reportIntel: 95, trustEngine: 96, decisionIntel: 93, resolutionIntel: 94 },
    { name: "6 AM", reportIntel: 93, trustEngine: 95, decisionIntel: 92, resolutionIntel: 93 },
    { name: "9 AM", reportIntel: 95, trustEngine: 96, decisionIntel: 94, resolutionIntel: 93 },
    { name: "12 PM", reportIntel: 96, trustEngine: 97, decisionIntel: 94, resolutionIntel: 94 },
    { name: "3 PM", reportIntel: 95, trustEngine: 96, decisionIntel: 93, resolutionIntel: 93 },
    { name: "6 PM", reportIntel: 96, trustEngine: 97, decisionIntel: 95, resolutionIntel: 94 },
  ];

  // Hotspots for the mini map
  const hotspotMarkers = [
    { reportId: "hs-1", latitude: 12.9766, longitude: 77.6065, category: "water" as const, severity: "critical" as const, title: "MG Road Hotspot", status: "submitted" as const },
    { reportId: "hs-2", latitude: 12.9591, longitude: 77.6974, category: "roads" as const, severity: "high" as const, title: "Sector 12 Hotspot", status: "assigned" as const },
    { reportId: "hs-3", latitude: 12.9352, longitude: 77.6245, category: "drainage" as const, severity: "medium" as const, title: "Koramangala Hotspot", status: "in_progress" as const },
  ];

  return (
    <div className="flex-grow flex flex-col h-full overflow-hidden bg-[#030816] text-slate-200 font-sans">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-5 flex-shrink-0 bg-[#070c1a] border-b border-slate-900">
        <div>
          <h2 className="text-xl font-bold text-white leading-none">AI Mission Control</h2>
          <p className="text-[11px] text-slate-500 mt-1">Autonomous AI engines working 24/7 to make our city smarter and more responsive.</p>
        </div>
        <div className="flex items-center space-x-6 text-xs text-slate-400">
          <span className="flex items-center"><span className="mr-1.5">📅</span> May 21, 2025</span>
          <span className="flex items-center"><span className="mr-1.5">🕒</span> 10:30 AM</span>
        </div>
      </header>

      {/* Stats, Pipeline and Visuals Grid */}
      <div className="flex-grow overflow-y-auto p-8 space-y-6">
        {/* Top Mini Stats */}
        <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4" aria-label="AI Systems Statistics">
          <div className="bg-[#0f172a]/60 border border-blue-500/10 p-4 rounded-xl flex flex-col justify-between">
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Total Reports Processed</p>
            <h3 className="text-xl font-bold text-white mt-1">{totalReports}</h3>
            <p className="text-[9px] text-green-500 mt-1">↑ 18.6% vs yesterday</p>
          </div>
          <div className="bg-[#0f172a]/60 border border-green-500/10 p-4 rounded-xl flex flex-col justify-between">
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">AI Actions Taken</p>
            <h3 className="text-xl font-bold text-white mt-1">986</h3>
            <p className="text-[9px] text-green-500 mt-1">↑ 22.4% vs yesterday</p>
          </div>
          <div className="bg-[#0f172a]/60 border border-emerald-500/10 p-4 rounded-xl flex flex-col justify-between">
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Duplicates Resolved</p>
            <h3 className="text-xl font-bold text-white mt-1">{duplicateCount}</h3>
            <p className="text-[9px] text-green-500 mt-1">AI Merged</p>
          </div>
          <div className="bg-[#0f172a]/60 border border-purple-500/10 p-4 rounded-xl flex flex-col justify-between">
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Community Impact</p>
            <h3 className="text-xl font-bold text-white mt-1">24,850</h3>
            <p className="text-[9px] text-slate-500 mt-1">People benefited</p>
          </div>
          <div className="bg-[#0f172a]/60 border border-orange-500/10 p-4 rounded-xl flex flex-col justify-between">
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Predicted Issues</p>
            <h3 className="text-xl font-bold text-white mt-1">156</h3>
            <p className="text-[9px] text-green-500 mt-1">↑ 12.8% vs yesterday</p>
          </div>
          <div className="bg-[#0f172a]/60 border border-cyan-500/10 p-4 rounded-xl flex flex-col justify-between">
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">AI Accuracy (Overall)</p>
            <h3 className="text-xl font-bold text-white mt-1">94.7%</h3>
            <p className="text-[9px] text-green-500 mt-1">↑ 2.6% vs yesterday</p>
          </div>
        </section>

        {/* Layout Split: Left Main and Right Activity Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Visuals Column */}
          <div className="lg:col-span-9 space-y-6">
            {/* AI Engine Pipeline */}
            <div className="bg-[#0f172a]/60 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-350">AI Engine Pipeline</h4>
                  <p className="text-[10px] text-slate-500">6 Autonomous AI Engines working in harmony</p>
                </div>
                <span className="flex items-center text-[9px] font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5 animate-pulse"></span> LIVE
                </span>
              </div>

              {/* Horizontal Pipeline flow */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 relative">
                {engines.map((eng, idx) => (
                  <div key={eng.id} className="flex flex-col items-center text-center group transition-transform duration-250 hover:scale-105">
                    <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center bg-[#070c1a] shadow-[0_0_15px_rgba(59,130,246,0.15)] relative ${
                      idx === 0 ? "border-blue-500" :
                      idx === 1 ? "border-emerald-500" :
                      idx === 2 ? "border-amber-500" :
                      idx === 3 ? "border-red-500" :
                      idx === 4 ? "border-purple-500" : "border-pink-500"
                    }`}>
                      <span className="text-lg">{eng.emoji}</span>
                      <span className="absolute -top-1.5 -right-1.5 bg-slate-800 border border-slate-700 text-[8px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                        {idx + 1}
                      </span>
                    </div>
                    <div className="mt-4">
                      <p className="text-[10px] font-bold text-white">{eng.name}</p>
                      <p className="text-[8px] text-slate-500 mt-1 leading-tight px-1.5">{eng.description}</p>
                      <p className="text-[9px] text-green-500 mt-2 font-medium flex items-center justify-center">
                        <span className="w-1 h-1 bg-green-500 rounded-full mr-1 animate-pulse"></span> {eng.status.toUpperCase()}
                      </p>
                      <p className="text-[9px] font-bold mt-1 text-slate-400">{eng.processedCount} processed</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Middle charts: Decisions, Trust, Categories */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Decisions Distribution Donut */}
              <div className="bg-[#0f172a]/60 border border-slate-800 p-5 rounded-2xl flex flex-col h-64">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">AI Decisions Distribution</h4>
                <p className="text-[9px] text-slate-500 mt-1">Classification statistics of active dispatches</p>
                <div className="flex-grow flex items-center mt-2">
                  <div className="w-24 h-24 relative flex-shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={decisionsData}
                          cx="50%"
                          cy="50%"
                          innerRadius={30}
                          outerRadius={44}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {decisionsData.map((entry, idx) => (
                            <Cell key={`cell-${idx}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-sm font-bold text-white">{decisionsDistribution.total}</span>
                      <span className="text-[7px] text-slate-500 uppercase">Total</span>
                    </div>
                  </div>
                  <div className="ml-4 space-y-1 text-[9px] flex-1">
                    {decisionsData.map((d) => (
                      <div key={d.name} className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: d.color }}></span>
                          <span className="text-slate-400">{d.name}</span>
                        </span>
                        <span className="font-semibold text-slate-200">{d.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Trust Engine score */}
              <div className="bg-[#0f172a]/60 border border-slate-800 p-5 rounded-2xl flex flex-col h-64 justify-between">
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Trust Engine Insights</h4>
                  <p className="text-[9px] text-slate-500 mt-1">Spam detection & quality metrics</p>
                </div>
                <div className="flex flex-col items-center py-2">
                  <div className="relative w-24 h-24 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle className="text-slate-800" cx="48" cy="48" fill="transparent" r="40" stroke="currentColor" strokeWidth="6"></circle>
                      <circle className="text-green-500" cx="48" cy="48" fill="transparent" r="40" stroke="currentColor" strokeDasharray="251.2" stroke-dashoffset={251.2 - (251.2 * avgTrustScore) / 100} strokeLinecap="round" strokeWidth="6"></circle>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-xl font-bold text-white">{avgTrustScore}%</span>
                      <span className="text-[7px] text-slate-500 uppercase">Trust Score</span>
                    </div>
                  </div>
                  <div className="w-full mt-3 flex justify-around text-[9px] text-slate-400">
                    <div className="text-center"><span className="block font-bold text-green-400">88%</span> Genuine</div>
                    <div className="text-center"><span className="block font-bold text-yellow-400">8%</span> Low Quality</div>
                    <div className="text-center"><span className="block font-bold text-red-400">4%</span> Spam/Fake</div>
                  </div>
                </div>
              </div>

              {/* Top Issue Categories progress */}
              <div className="bg-[#0f172a]/60 border border-slate-800 p-5 rounded-2xl flex flex-col h-64 justify-between">
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Top Issue Categories</h4>
                  <p className="text-[9px] text-slate-500 mt-1">Based on AI classifications</p>
                </div>
                <div className="space-y-3.5 my-2">
                  {[
                    { name: "Water Leakage", pct: 25, color: "bg-blue-500", count: categoryStats.water || 5 },
                    { name: "Road Damage", pct: 23, color: "bg-orange-500", count: categoryStats.roads || 4 },
                    { name: "Garbage Overflow", pct: 17, color: "bg-emerald-500", count: categoryStats.sanitation || 3 },
                    { name: "Street Light", pct: 12, color: "bg-amber-500", count: categoryStats.parks || 2 },
                  ].map((c) => (
                    <div key={c.name}>
                      <div className="flex justify-between text-[9px] mb-1">
                        <span className="text-slate-400">{c.name}</span>
                        <span className="font-semibold text-slate-200">{c.count} ({c.pct}%)</span>
                      </div>
                      <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${c.color}`} style={{ width: `${c.pct}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Row: System performance chart and Hardware health metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Performance line chart */}
              <div className="bg-[#0f172a]/60 border border-slate-800 p-6 rounded-2xl h-80 flex flex-col justify-between">
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">System Performance</h4>
                  <p className="text-[9px] text-slate-500 mt-1">Real-time accuracy of deployed modules</p>
                </div>
                <div className="flex-1 min-h-[160px] mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={performanceTrendData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" opacity={0.2} />
                      <XAxis dataKey="name" stroke="#6b7280" fontSize={8} />
                      <YAxis domain={[90, 100]} stroke="#6b7280" fontSize={8} />
                      <Tooltip contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155" }} />
                      <Area type="monotone" dataKey="trustEngine" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.05} />
                      <Area type="monotone" dataKey="reportIntel" stackId="2" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.05} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-between text-[8px] text-slate-500 border-t border-slate-800 pt-2.5 mt-2">
                  <span className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5"></span> Trust Engine</span>
                  <span className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-1.5"></span> Report Intel</span>
                </div>
              </div>

              {/* Hardware stats */}
              <div className="bg-[#0f172a]/60 border border-slate-800 p-6 rounded-2xl h-80 flex flex-col justify-between">
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">System Health</h4>
                  <p className="text-[9px] text-slate-500 mt-1">Real-time load and response times</p>
                </div>
                <div className="grid grid-cols-2 gap-4 my-2">
                  <div className="bg-[#0b1120] border border-slate-850 p-3.5 rounded-xl text-center flex flex-col items-center">
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">CPU Load</p>
                    <span className="text-lg font-extrabold text-white mt-1">32%</span>
                    <span className="text-[8px] text-green-500 mt-1">● Operational</span>
                  </div>
                  <div className="bg-[#0b1120] border border-slate-850 p-3.5 rounded-xl text-center flex flex-col items-center">
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">RAM Usage</p>
                    <span className="text-lg font-extrabold text-white mt-1">58%</span>
                    <span className="text-[8px] text-green-500 mt-1">● Stable</span>
                  </div>
                  <div className="bg-[#0b1120] border border-slate-850 p-3.5 rounded-xl text-center flex flex-col items-center">
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">GPU Load</p>
                    <span className="text-lg font-extrabold text-white mt-1">41%</span>
                    <span className="text-[8px] text-green-500 mt-1">● Cool</span>
                  </div>
                  <div className="bg-[#0b1120] border border-slate-850 p-3.5 rounded-xl text-center flex flex-col items-center">
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">API Latency</p>
                    <span className="text-lg font-extrabold text-white mt-1">412ms</span>
                    <span className="text-[8px] text-green-500 mt-1">● Optimal</span>
                  </div>
                </div>
                <div className="text-[9px] text-slate-500 flex items-center justify-between border-t border-slate-800 pt-3">
                  <span>Uptime: <strong className="text-white">99.98%</strong></span>
                  <span className="text-green-500">All Nodes Active</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right sidebar Activity Log & Hotspots */}
          <div className="lg:col-span-3 space-y-6">
            {/* AI activity feed list */}
            <div className="bg-[#0f172a]/60 border border-slate-800 p-5 rounded-2xl flex flex-col h-[400px]">
              <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3 flex-shrink-0">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">AI Activity Feed</h4>
                <span className="flex items-center text-[9px] font-bold text-green-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1 animate-pulse"></span> LIVE
                </span>
              </div>
              <div className="flex-1 overflow-y-auto pr-1 space-y-4">
                {activities.map((act) => (
                  <div key={act.id} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-center text-sm flex-shrink-0">
                      {act.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between items-start">
                        <p className="text-[10px] font-bold text-white truncate pr-1">{act.title}</p>
                        <span className="text-[8px] text-slate-500 flex-shrink-0">{act.time}</span>
                      </div>
                      <p className="text-[9px] text-slate-400 mt-1 leading-normal">{act.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* mini predicted hotspots map */}
            <div className="bg-[#0f172a]/60 border border-slate-800 p-5 rounded-2xl flex flex-col h-[280px]">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Predicted Hotspots</h4>
              <p className="text-[9px] text-slate-500 mb-3">Risk projection coordinates for next 7 days</p>
              <div className="flex-grow rounded-xl overflow-hidden border border-slate-800 bg-[#070c1a]">
                <MapView markers={hotspotMarkers} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
