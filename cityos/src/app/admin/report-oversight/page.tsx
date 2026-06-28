"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useReportOversight } from "@/hooks/useReportOversight";
import type { IssueSeverity } from "@/types";

const MapView = dynamic(
  () => import("@/components/map/MapView").then((mod) => mod.MapView),
  { ssr: false, loading: () => <div className="h-full w-full bg-slate-900 animate-pulse flex items-center justify-center text-slate-500">Loading Map...</div> }
);

export default function AdminReportOversightPage() {
  const {
    filteredReports,
    selectedReport,
    activeTab,
    setActiveTab,
    selectedDept,
    setSelectedDept,
    searchQuery,
    setSearchQuery,
    setSelectedReportId,
    assignDepartment,
    escalateReport,
    tabCounts,
  } = useReportOversight();

  const [deptMenuOpen, setDeptMenuOpen] = useState(false);
  const [escalateMenuOpen, setEscalateMenuOpen] = useState(false);

  // Core metrics derived dynamically from filteredReports list
  const metrics = useMemo(() => {
    return {
      highPriority: tabCounts.critical + tabCounts.high,
      assigned: tabCounts.all - tabCounts.low,
      inProgress: filteredReports.filter(r => ["in_progress", "work_started"].includes(r.status)).length,
      completed: filteredReports.filter(r => ["resolved", "closed"].includes(r.status)).length,
      avgHrs: 2.4,
    };
  }, [filteredReports, tabCounts]);

  const mapMarker = useMemo(() => {
    if (!selectedReport) return [];
    return [{
      reportId: selectedReport.reportId,
      latitude: selectedReport.location.latitude,
      longitude: selectedReport.location.longitude,
      category: selectedReport.issueCategory,
      severity: selectedReport.severity,
      title: selectedReport.title,
      status: selectedReport.status,
    }];
  }, [selectedReport]);

  const availableDepts = [
    "BWSSB Water Works",
    "BBMP Roads & Infrastructure",
    "BESCOM Electricity",
    "BBMP Sanitation",
    "BBMP Parks & Recreation",
    "BWSSB Drainage Division",
  ];

  return (
    <div className="flex-grow flex h-full w-full overflow-hidden bg-[#0a0f1c] font-sans text-gray-200">
      {/* Main Left Content Column */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden p-6 border-r border-gray-800">
        {/* Header */}
        <header className="flex justify-between items-center mb-6 flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-white leading-none">Report Oversight</h2>
            <p className="text-[11px] text-gray-500 mt-1">Supervise, audit, and route citizen reports across all municipal jurisdictions.</p>
          </div>
        </header>

        {/* Dynamic Metrics Row */}
        <section className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6 flex-shrink-0" aria-label="Oversight Statistics">
          <div className="bg-[#111827] p-4 rounded-xl border border-gray-850 flex items-center gap-3">
            <div className="w-9 h-9 bg-red-950/40 text-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-[18px]">warning</span>
            </div>
            <div>
              <p className="text-[9px] text-gray-550 font-bold uppercase">High Priority</p>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-lg font-bold text-white">{metrics.highPriority}</span>
                <span className="text-[8px] text-green-400 font-bold">+3 today</span>
              </div>
            </div>
          </div>
          <div className="bg-[#111827] p-4 rounded-xl border border-gray-850 flex items-center gap-3">
            <div className="w-9 h-9 bg-orange-950/40 text-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-[18px]">assignment</span>
            </div>
            <div>
              <p className="text-[9px] text-gray-550 font-bold uppercase">Assigned Today</p>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-lg font-bold text-white">{metrics.assigned}</span>
                <span className="text-[8px] text-green-400 font-bold">+8 today</span>
              </div>
            </div>
          </div>
          <div className="bg-[#111827] p-4 rounded-xl border border-gray-850 flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-950/40 text-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-[18px]">sync</span>
            </div>
            <div>
              <p className="text-[9px] text-gray-550 font-bold uppercase">In Progress</p>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-lg font-bold text-white">{metrics.inProgress}</span>
                <span className="text-[8px] text-slate-500 font-medium">Active SLA</span>
              </div>
            </div>
          </div>
          <div className="bg-[#111827] p-4 rounded-xl border border-gray-850 flex items-center gap-3">
            <div className="w-9 h-9 bg-green-950/40 text-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-[18px]">task_alt</span>
            </div>
            <div>
              <p className="text-[9px] text-gray-550 font-bold uppercase">Completed Today</p>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-lg font-bold text-white">{metrics.completed}</span>
                <span className="text-[8px] text-green-400 font-bold">+5 today</span>
              </div>
            </div>
          </div>
          <div className="bg-[#111827] p-4 rounded-xl border border-gray-850 flex items-center gap-3">
            <div className="w-9 h-9 bg-purple-950/40 text-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-[18px]">timer</span>
            </div>
            <div>
              <p className="text-[9px] text-gray-550 font-bold uppercase">Avg Response Time</p>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-lg font-bold text-white">{metrics.avgHrs}h</span>
                <span className="text-[8px] text-green-400 font-bold">-0.8h target</span>
              </div>
            </div>
          </div>
        </section>

        {/* Filter controls */}
        <section className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-4 flex-shrink-0" aria-label="Filters">
          <div className="flex p-0.5 bg-[#111827] rounded-lg border border-slate-800">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-3 py-1 text-[11px] font-semibold rounded-md transition-colors ${activeTab === "all" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"}`}
            >
              All ({tabCounts.all})
            </button>
            <button
              onClick={() => setActiveTab("critical")}
              className={`px-3 py-1 text-[11px] font-semibold rounded-md transition-colors ${activeTab === "critical" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"}`}
            >
              Critical ({tabCounts.critical})
            </button>
            <button
              onClick={() => setActiveTab("high")}
              className={`px-3 py-1 text-[11px] font-semibold rounded-md transition-colors ${activeTab === "high" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"}`}
            >
              High ({tabCounts.high})
            </button>
            <button
              onClick={() => setActiveTab("medium")}
              className={`px-3 py-1 text-[11px] font-semibold rounded-md transition-colors ${activeTab === "medium" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"}`}
            >
              Medium ({tabCounts.medium})
            </button>
            <button
              onClick={() => setActiveTab("low")}
              className={`px-3 py-1 text-[11px] font-semibold rounded-md transition-colors ${activeTab === "low" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"}`}
            >
              Low ({tabCounts.low})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Search reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#111827] border border-slate-800 text-[11px] text-slate-200 rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-blue-650 outline-none w-48 sm:w-56"
            />
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-[#111827] border border-slate-800 text-[11px] text-slate-300 rounded-lg px-2 py-1.5 focus:ring-0 focus:border-slate-700 cursor-pointer"
            >
              <option value="All Departments">All Departments</option>
              <option value="Water Works">Water Works</option>
              <option value="Roads & Infrastructure">Roads & Infra</option>
              <option value="Electricity">Electricity</option>
              <option value="Sanitation">Sanitation</option>
              <option value="Drainage">Drainage</option>
            </select>
          </div>
        </section>

        {/* Scrollable Work Queue List */}
        <section className="flex-1 overflow-y-auto space-y-2 pr-1" aria-label="Work Queue List">
          {/* Table Header */}
          <div className="grid grid-cols-12 px-4 py-2 text-[9px] text-slate-500 uppercase tracking-wider font-semibold">
            <div className="col-span-1">Priority</div>
            <div className="col-span-4">Issue Title</div>
            <div className="col-span-2">Location</div>
            <div className="col-span-2">Dept. Assigned</div>
            <div className="col-span-2">Trust Score</div>
            <div className="col-span-1 text-right">Status</div>
          </div>

          {filteredReports.map((r) => {
            const isSelected = selectedReport?.reportId === r.reportId;
            return (
              <div
                key={r.reportId}
                onClick={() => setSelectedReportId(r.reportId)}
                className={`grid grid-cols-12 items-center px-4 py-3 border rounded-xl cursor-pointer group transition-all duration-150 ${
                  isSelected
                    ? "bg-blue-600/10 border-blue-500/50 shadow-sm"
                    : "bg-transparent border-slate-850 hover:bg-slate-800/20"
                }`}
              >
                <div className="col-span-1">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold tracking-wide w-fit flex items-center justify-center uppercase ${
                    r.severity === "critical"
                      ? "bg-red-950/40 text-red-500"
                      : r.severity === "high"
                      ? "bg-orange-950/40 text-orange-500"
                      : r.severity === "medium"
                      ? "bg-blue-950/40 text-blue-500"
                      : "bg-slate-800/40 text-slate-400"
                  }`}>
                    {r.severity}
                  </span>
                </div>
                <div className="col-span-4 flex items-center space-x-3">
                  <div className="w-10 h-8 rounded bg-slate-900 border border-slate-800 flex items-center justify-center text-xs text-slate-400 overflow-hidden">
                    {r.media?.imageUrls?.length > 0 ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={r.media.imageUrls[0]} alt="pothole" className="w-full h-full object-cover" />
                    ) : (
                      <span>💡</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className={`text-xs font-semibold truncate ${isSelected ? "text-blue-400" : "text-white"}`}>
                      {r.title}
                    </h4>
                    <p className="text-[9px] text-slate-500 mt-0.5">ID: {r.reportId}</p>
                  </div>
                </div>
                <div className="col-span-2 text-[10px] text-slate-400 truncate pr-2">
                  {r.location.address}
                </div>
                <div className="col-span-2 text-[10px] text-slate-400 truncate">
                  {r.departmentAssigned || <span className="text-slate-600 italic">Unassigned</span>}
                </div>
                <div className="col-span-2 text-[10px] text-slate-400 font-semibold">
                  <span className="text-green-400 font-bold">{r.trustScore || 85}%</span>
                </div>
                <div className="col-span-1 flex items-center justify-end">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                    r.status === "resolved"
                      ? "bg-green-950/30 text-green-400 border-green-900/40"
                      : r.status === "in_progress" || r.status === "work_started"
                      ? "bg-yellow-950/30 text-yellow-400 border-yellow-900/40"
                      : "bg-blue-950/30 text-blue-400 border-blue-900/40"
                  }`}>
                    {r.status.replace("_", " ")}
                  </span>
                </div>
              </div>
            );
          })}

          {filteredReports.length === 0 && (
            <div className="p-8 text-center border border-dashed border-slate-850 rounded-xl text-slate-500 text-xs">
              No reports match your filters.
            </div>
          )}
        </section>
      </main>

      {/* Right Sidebar Detail Panel for Selected Report */}
      <aside className="w-[380px] bg-[#111827] overflow-y-auto flex flex-col h-full flex-shrink-0" aria-label="Report Detail Panel">
        {selectedReport ? (
          <div className="p-6 space-y-6 flex-1 flex flex-col justify-between">
            <div className="space-y-6">
              {/* Header block */}
              <div className="flex justify-between items-start border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-extrabold text-white">{selectedReport.title}</h3>
                  <p className="text-[10px] text-slate-500 mt-1">Report ID: {selectedReport.reportId}</p>
                </div>
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                  selectedReport.severity === "critical"
                    ? "bg-red-500/10 text-red-500 border border-red-500/20"
                    : "bg-orange-500/10 text-orange-500 border border-orange-500/20"
                }`}>
                  {selectedReport.severity}
                </span>
              </div>

              {/* Quick stats grid */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-[#161e2d] border border-slate-800/80 p-2.5 rounded-lg">
                  <span className="block font-bold text-white">
                    {selectedReport.mergedReportIds?.length || 0}
                  </span>
                  <span className="text-[8px] text-slate-500 uppercase tracking-widest">Duplicates</span>
                </div>
                <div className="bg-[#161e2d] border border-slate-800/80 p-2.5 rounded-lg">
                  <span className="block font-bold text-green-400">
                    {selectedReport.trustScore || 85}%
                  </span>
                  <span className="text-[8px] text-slate-500 uppercase tracking-widest">Trust Rating</span>
                </div>
                <div className="bg-[#161e2d] border border-slate-800/80 p-2.5 rounded-lg">
                  <span className="block font-bold text-blue-400">
                    {selectedReport.communitySupport}
                  </span>
                  <span className="text-[8px] text-slate-500 uppercase tracking-widest">Supports</span>
                </div>
              </div>

              {/* Location details */}
              <div className="space-y-2 text-xs">
                <p className="font-semibold text-slate-400 uppercase tracking-wider text-[9px]">Location</p>
                <div className="bg-[#161e2d] border border-slate-800/80 p-3 rounded-lg flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-[16px] text-blue-400 mt-0.5">location_on</span>
                  <div>
                    <p className="text-white leading-normal font-medium">{selectedReport.location.address}</p>
                    {selectedReport.location.ward && <p className="text-[10px] text-slate-500 mt-0.5">{selectedReport.location.ward}</p>}
                  </div>
                </div>
              </div>

              {/* AI recommendation Card - Read Only */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[9px] uppercase tracking-wider text-slate-500">
                  <span>AI DECISION SUPPORT</span>
                  <span className="text-blue-400 font-bold bg-blue-500/10 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-0.5 animate-pulse"></span>
                    Gemini AI
                  </span>
                </div>
                <div className="bg-[#161e2d] border border-slate-850 rounded-xl p-4 space-y-3">
                  <p className="text-[11px] text-slate-300 leading-relaxed italic">
                    &quot;Detected {selectedReport.issueCategory} issue with {selectedReport.aiConfidence ? Math.round(selectedReport.aiConfidence * 100) : 95}% confidence. 
                    Recommended for immediate department routing due to municipal safety regulations.&quot;
                  </p>
                  <div className="flex justify-between text-[10px] border-t border-slate-800/60 pt-3 text-slate-400">
                    <div>
                      <span className="block text-[8px] text-slate-500 uppercase">Priority Reason</span>
                      <strong className="text-slate-300 font-medium">Public Hazard risk index 94</strong>
                    </div>
                    <div className="text-right">
                      <span className="block text-[8px] text-slate-500 uppercase">Estimated Resolution</span>
                      <strong className="text-slate-300 font-medium">{selectedReport.estimatedResolution || "2 Days"}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Map coordinates preview */}
              <div className="space-y-2">
                <p className="font-semibold text-slate-400 uppercase tracking-wider text-[9px]">Coordinates Preview</p>
                <div className="h-32 rounded-lg overflow-hidden border border-slate-800 bg-[#0a0f1d]">
                  <MapView markers={mapMarker} />
                </div>
              </div>
            </div>

            {/* Actions Panel */}
            <div className="space-y-3 pt-6 border-t border-slate-800">
              <p className="font-semibold text-slate-400 uppercase tracking-wider text-[9px]">Actions Supervision</p>
              
              {/* Assign Department Button */}
              <div className="relative">
                <button
                  onClick={() => setDeptMenuOpen(!deptMenuOpen)}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">edit_road</span>
                  Assign Department
                </button>
                {deptMenuOpen && (
                  <div className="absolute bottom-full mb-2 left-0 right-0 bg-slate-900 border border-slate-800 rounded-xl py-1 shadow-xl z-50 max-h-48 overflow-y-auto">
                    {availableDepts.map((d) => (
                      <button
                        key={d}
                        onClick={() => {
                          assignDepartment(selectedReport.reportId, d);
                          setDeptMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-[11px] text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Escalate Priority Button */}
              <div className="relative">
                <button
                  onClick={() => setEscalateMenuOpen(!escalateMenuOpen)}
                  className="w-full py-2 bg-transparent border border-slate-850 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">keyboard_double_arrow_up</span>
                  Escalate Report
                </button>
                {escalateMenuOpen && (
                  <div className="absolute bottom-full mb-2 left-0 right-0 bg-slate-900 border border-slate-800 rounded-xl py-1 shadow-xl z-50">
                    {(["critical", "high", "medium", "low"] as IssueSeverity[]).map((sev) => (
                      <button
                        key={sev}
                        onClick={() => {
                          escalateReport(selectedReport.reportId, sev);
                          setEscalateMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-[11px] text-slate-300 hover:bg-slate-800 hover:text-white transition-colors uppercase font-bold"
                      >
                        {sev}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-500 text-xs my-auto">
            Select a report in the list to view administrative options and AI recommendations.
          </div>
        )}
      </aside>
    </div>
  );
}
