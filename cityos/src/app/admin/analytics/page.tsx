"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useReportsStore } from "@/store/reportsStore";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const MapView = dynamic(
  () => import("@/components/map/MapView").then((mod) => mod.MapView),
  { ssr: false, loading: () => <div className="h-full w-full bg-slate-900 animate-pulse flex items-center justify-center text-slate-500">Loading Map...</div> }
);

export default function AdminAnalyticsPage() {
  const reports = useReportsStore((s) => s.reports);
  const { kpis, overallHealth, healthStats, wards, trendData, departments, selectedRange, setSelectedRange } = useAnalytics();

  // Convert reports into markers grouped by category for the heatmaps
  const allReportsList = useMemo(() => Object.values(reports), [reports]);

  const mapMarkersForCategory = (category: string | null) => {
    const list = category 
      ? allReportsList.filter(r => r.issueCategory === category)
      : allReportsList;

    return list.map(r => ({
      reportId: r.reportId,
      latitude: r.location.latitude,
      longitude: r.location.longitude,
      category: r.issueCategory,
      severity: r.severity,
      title: r.title,
      status: r.status,
    }));
  };

  return (
    <div className="flex-grow flex flex-col h-full overflow-hidden bg-[#0a0f1d] text-gray-300 font-sans">
      {/* Header */}
      <header className="h-16 flex items-center justify-between px-6 bg-[#070c1a] border-b border-slate-800 flex-shrink-0">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Analytics &amp; Predictions</h2>
          <p className="text-xs text-gray-500">AI-powered insights to help you plan better, act faster, and build a smarter city.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex bg-[#111827] border border-slate-800 rounded-lg p-1 text-xs">
            <select
              value={selectedRange}
              onChange={(e) => setSelectedRange(e.target.value)}
              className="bg-transparent border-none text-xs text-gray-300 focus:ring-0 cursor-pointer pr-8 py-0.5"
            >
              <option value="7 Days">7 Days</option>
              <option value="30 Days">30 Days</option>
              <option value="90 Days">90 Days</option>
            </select>
          </div>
        </div>
      </header>

      {/* Main Grid Content Area */}
      <div className="flex-grow overflow-y-auto p-6 space-y-6">
        {/* Top KPIs Row */}
        <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4" aria-label="Analytical Metrics">
          <div className="bg-[#111827] border border-slate-800 p-4 rounded-xl">
            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Total Issues</p>
            <p className="text-xl font-bold text-white mt-1">{kpis.totalIssues}</p>
            <p className="text-[9px] text-green-400 mt-1">↑ 18.6% vs last week</p>
          </div>
          <div className="bg-[#111827] border border-slate-800 p-4 rounded-xl">
            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Predicted Issues (7D)</p>
            <p className="text-xl font-bold text-white mt-1">{kpis.predictedIssues}</p>
            <p className="text-[9px] text-orange-400 mt-1">↑ 12.8% vs last week</p>
          </div>
          <div className="bg-[#111827] border border-slate-800 p-4 rounded-xl">
            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Issues Resolved</p>
            <p className="text-xl font-bold text-white mt-1">{kpis.issuesResolved}</p>
            <p className="text-[9px] text-green-400 mt-1">↑ 15.3% vs last week</p>
          </div>
          <div className="bg-[#111827] border border-slate-800 p-4 rounded-xl">
            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Prevented Damage</p>
            <p className="text-xl font-bold text-white mt-1">{kpis.preventedDamage}</p>
            <p className="text-[9px] text-green-400 mt-1">SLA target avoided cost</p>
          </div>
          <div className="bg-[#111827] border border-slate-800 p-4 rounded-xl">
            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Citizen Impact</p>
            <p className="text-xl font-bold text-white mt-1">{kpis.citizenImpact}</p>
            <p className="text-[9px] text-green-400 mt-1">Votes & support indicators</p>
          </div>
          <div className="bg-[#111827] border border-slate-800 p-4 rounded-xl">
            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">AI Accuracy (Overall)</p>
            <p className="text-xl font-bold text-white mt-1">{kpis.accuracy}%</p>
            <p className="text-[9px] text-green-400 mt-1">↑ 2.6% vs last week</p>
          </div>
        </section>

        {/* Heatmaps & Infrastructure Health Layout Split */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* City Heatmaps Grid (5 Column map panels) */}
          <div className="lg:col-span-9 bg-[#111827] border border-slate-800 rounded-xl p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-4">City Heatmaps</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Density Map */}
              <div className="flex flex-col space-y-2">
                <div>
                  <h4 className="text-[10px] font-bold text-white leading-none">Issue Density</h4>
                  <span className="text-[8px] text-gray-500">All categories overview</span>
                </div>
                <div className="h-40 rounded-lg overflow-hidden border border-slate-800 relative bg-[#0a0f1d]">
                  <MapView markers={mapMarkersForCategory(null)} />
                </div>
              </div>
              {/* Water Map */}
              <div className="flex flex-col space-y-2">
                <div>
                  <h4 className="text-[10px] font-bold text-white leading-none">Water Leakage</h4>
                  <span className="text-[8px] text-gray-500">BWSSB pipe stress leaks</span>
                </div>
                <div className="h-40 rounded-lg overflow-hidden border border-slate-800 relative bg-[#0a0f1d]">
                  <MapView markers={mapMarkersForCategory("water")} />
                </div>
              </div>
              {/* Road Map */}
              <div className="flex flex-col space-y-2">
                <div>
                  <h4 className="text-[10px] font-bold text-white leading-none">Road Damage</h4>
                  <span className="text-[8px] text-gray-500">BBMP asphalt fatigue points</span>
                </div>
                <div className="h-40 rounded-lg overflow-hidden border border-slate-800 relative bg-[#0a0f1d]">
                  <MapView markers={mapMarkersForCategory("roads")} />
                </div>
              </div>
              {/* Garbage Map */}
              <div className="flex flex-col space-y-2">
                <div>
                  <h4 className="text-[10px] font-bold text-white leading-none">Garbage Overflow</h4>
                  <span className="text-[8px] text-gray-500">Sanitation overflow risk zones</span>
                </div>
                <div className="h-40 rounded-lg overflow-hidden border border-slate-800 relative bg-[#0a0f1d]">
                  <MapView markers={mapMarkersForCategory("sanitation")} />
                </div>
              </div>
              {/* Electricity Map */}
              <div className="flex flex-col space-y-2">
                <div>
                  <h4 className="text-[10px] font-bold text-white leading-none">Electricity Outage</h4>
                  <span className="text-[8px] text-gray-500">BESCOM outage alerts</span>
                </div>
                <div className="h-40 rounded-lg overflow-hidden border border-slate-800 relative bg-[#0a0f1d]">
                  <MapView markers={mapMarkersForCategory("electricity")} />
                </div>
              </div>
            </div>
          </div>

          {/* Infrastructure Health gauge */}
          <div className="lg:col-span-3 bg-[#111827] border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">Infrastructure Health</h3>
              <p className="text-[9px] text-gray-500 mt-1">Overall Health Index</p>
            </div>
            <div className="flex flex-col items-center py-4">
              <div className="relative w-28 h-28 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle className="text-gray-800" cx="56" cy="56" fill="transparent" r="48" stroke="currentColor" strokeWidth="6"></circle>
                  <circle className="text-green-500" cx="56" cy="56" fill="transparent" r="48" stroke="currentColor" stroke-dasharray="301.4" stroke-dashoffset={301.4 - (301.4 * overallHealth) / 100} strokeLinecap="round" strokeWidth="6"></circle>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-bold text-white">{overallHealth}</span>
                  <span className="text-[8px] font-bold text-green-400 uppercase">Good</span>
                </div>
              </div>
            </div>
            <div className="space-y-2 text-[9px] text-gray-400">
              <div className="flex justify-between items-center">
                <span>Roads & Infrastructure</span>
                <span className="font-bold text-white">{healthStats.roads}/100</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Water Supply</span>
                <span className="font-bold text-white">{healthStats.water}/100</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Sanitation & Waste</span>
                <span className="font-bold text-white">{healthStats.sanitation}/100</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Electricity network</span>
                <span className="font-bold text-white">{healthStats.electricity}/100</span>
              </div>
            </div>
          </div>
        </section>

        {/* Risk Predictions, vulnerability list & Trend Analysis */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Timeline Risk predictions (Col-span 3) */}
          <div className="lg:col-span-3 bg-[#111827] border border-slate-800 rounded-xl p-5 flex flex-col justify-between h-[340px]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">Future Risk Predictions</h3>
            <div className="flex-1 overflow-y-auto space-y-3.5 mt-4 pr-1">
              <div className="p-2.5 bg-slate-800/40 rounded-lg border border-slate-850">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="text-[10px] font-bold text-white">High risk of water leakage</h4>
                  <span className="px-1.5 py-0.5 bg-red-500/20 text-red-500 text-[8px] font-bold rounded">87% Prob</span>
                </div>
                <p className="text-[9px] text-gray-500">MG Road junction network</p>
              </div>
              <div className="p-2.5 bg-slate-800/40 rounded-lg border border-slate-850">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="text-[10px] font-bold text-white">Asphalt fatigue worsening</h4>
                  <span className="px-1.5 py-0.5 bg-orange-500/20 text-orange-400 text-[8px] font-bold rounded">72% Prob</span>
                </div>
                <p className="text-[9px] text-gray-500">Ring Road, Ward 4 sector</p>
              </div>
              <div className="p-2.5 bg-slate-800/40 rounded-lg border border-slate-850">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="text-[10px] font-bold text-white">Drainage block predicted</h4>
                  <span className="px-1.5 py-0.5 bg-orange-500/20 text-orange-400 text-[8px] font-bold rounded">68% Prob</span>
                </div>
                <p className="text-[9px] text-gray-500">Sector 7 low-lying paths</p>
              </div>
            </div>
          </div>

          {/* Vulnerability Score Table by Ward */}
          <div className="lg:col-span-4 bg-[#111827] border border-slate-800 rounded-xl p-5 h-[340px] flex flex-col justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">Infrastructure Vulnerability</h3>
            <div className="flex-grow overflow-y-auto mt-4 pr-1">
              <table className="w-full text-left text-[9px] border-collapse">
                <thead>
                  <tr className="text-gray-505 border-b border-slate-850">
                    <th className="pb-2 font-bold">Ward</th>
                    <th className="pb-2 font-bold">Score</th>
                    <th className="pb-2 font-bold">Risk Level</th>
                    <th className="pb-2 font-bold">Top Concern</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {wards.slice(0, 5).map((w, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/20">
                      <td className="py-2.5 font-semibold text-white">{w.ward}</td>
                      <td className="py-2.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{w.score}</span>
                          <div className="w-12 bg-slate-800 rounded-full h-1">
                            <div className="bg-blue-500 h-full rounded-full" style={{ width: `${w.score}%` }}></div>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5">
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                          w.risk === "critical" || w.risk === "high"
                            ? "bg-red-500/15 text-red-400 border border-red-500/20"
                            : "bg-orange-500/15 text-orange-400 border border-orange-500/20"
                        }`}>
                          {w.risk.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-2.5 text-slate-400">{w.topConcern}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Trend Analysis Line Chart */}
          <div className="lg:col-span-5 bg-[#111827] border border-slate-800 rounded-xl p-5 h-[340px] flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">Trend Analysis</h3>
              <p className="text-[9px] text-gray-500 mt-1">Weekly statistics of reported vs resolved tickets</p>
            </div>
            <div className="flex-1 min-h-[180px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" opacity={0.2} />
                  <XAxis dataKey="date" stroke="#6b7280" fontSize={8} />
                  <YAxis stroke="#6b7280" fontSize={8} />
                  <Tooltip contentStyle={{ backgroundColor: "#111827", borderColor: "#1f2937" }} />
                  <Line type="monotone" dataKey="reported" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="predicted" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="4 4" dot={{ r: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-between text-[8px] text-gray-500 border-t border-slate-850 pt-2.5 mt-2">
              <span className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-1.5"></span> Reported</span>
              <span className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5"></span> Resolved</span>
              <span className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-orange-500 mr-1.5"></span> Predicted</span>
            </div>
          </div>
        </section>

        {/* Department detailed KPIs */}
        <section className="bg-[#111827] border border-slate-800 rounded-xl p-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-6">Department KPIs</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {departments.map((d) => (
              <div key={d.name} className="p-3 bg-gray-800/10 rounded-xl border border-slate-800 flex flex-col justify-between h-44 shadow-sm hover:border-blue-500/20 transition-all cursor-pointer">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{d.icon}</span>
                  <span className="text-[10px] font-bold text-white">{d.name}</span>
                </div>
                <div className="flex justify-between text-[9px] mt-2">
                  <div>
                    <span className="block text-gray-500 font-medium">Open</span>
                    <strong className="text-white text-xs">{d.open}</strong>
                  </div>
                  <div className="text-right">
                    <span className="block text-gray-500 font-medium">Resolved</span>
                    <strong className="text-white text-xs">{d.resolved}</strong>
                  </div>
                </div>
                <div className="flex justify-center my-2">
                  <div className="relative w-12 h-12 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle className="text-gray-800" cx="24" cy="24" fill="transparent" r="20" stroke="currentColor" strokeWidth="2.5"></circle>
                      <circle className="text-green-500" cx="24" cy="24" fill="transparent" r="20" stroke="currentColor" stroke-dasharray="125.6" stroke-dashoffset={125.6 - (125.6 * d.rate) / 100} strokeLinecap="round" strokeWidth="2.5"></circle>
                    </svg>
                    <span className="absolute text-[10px] font-bold text-white">{d.rate}%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[8px] border-t border-slate-850 pt-2 text-gray-500">
                  <span>Avg Response Time</span>
                  <span className="font-semibold text-slate-200">{d.avgHours} hrs</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
