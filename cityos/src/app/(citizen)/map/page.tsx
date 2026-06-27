"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useMapMarkers } from "@/hooks/useMapMarkers";
import { useReportsStore } from "@/store/reportsStore";
import { useAppStore } from "@/store/appStore";
import type { IssueCategory } from "@/types";

// Dynamic import of Leaflet MapView to avoid SSR issues
const MapView = dynamic(
  () => import("@/components/map/MapView").then((mod) => mod.MapView),
  { ssr: false }
);

export default function LiveMapPage() {
  const router = useRouter();
  const openCopilot = useAppStore((s) => s.openCopilot);
  const reports = useReportsStore((s) => s.reports);
  const setReport = useReportsStore((s) => s.setReport);

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState<IssueCategory | "all">("all");
  const selectedSeverity = "all";
  const selectedStatus = "all";
  const [searchQuery, setSearchQuery] = useState("");

  // Selected Marker Info Card state
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  // Fetch markers via filtered custom hook
  const markers = useMapMarkers({
    category: selectedCategory,
    severity: selectedSeverity,
    status: selectedStatus,
    searchQuery
  });

  const selectedReport = selectedReportId ? reports[selectedReportId] : null;

  const handleMarkerClick = (reportId: string) => {
    setSelectedReportId(reportId);
  };

  const handleSupportReport = () => {
    if (!selectedReport) return;
    // Update Zustand support count
    const updated = {
      ...selectedReport,
      communitySupport: (selectedReport.communitySupport ?? 0) + 1,
      updatedAt: new Date()
    };
    setReport(updated);
  };

  return (
    <div className="relative w-full h-[calc(100vh-128px)] overflow-hidden bg-surface">
      {/* Interactive Leaflet Map Background */}
      <div className="absolute inset-0 z-0">
        <MapView 
          markers={markers}
          height="100%"
          onMarkerClick={handleMarkerClick}
          className="w-full h-full rounded-none"
        />
      </div>

      {/* Map Filter Controls Overlay */}
      <div className="absolute inset-x-0 top-4 z-10 pointer-events-none flex flex-col gap-3 px-4">
        {/* Search Panel */}
        <div className="w-full max-w-lg mx-auto flex items-center bg-white rounded-full shadow-lg border border-outline-variant/30 px-5 py-2 pointer-events-auto">
          <span className="material-symbols-outlined text-outline">search</span>
          <input 
            className="flex-grow bg-transparent border-none focus:ring-0 text-body-lg font-body-lg text-on-surface ml-2 outline-none" 
            placeholder="Search address or incident..." 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filter Chips row */}
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar justify-center pointer-events-auto">
          <button 
            onClick={() => setSelectedCategory("all")}
            className={`px-4 py-2 rounded-full font-label-md text-label-md shadow-sm whitespace-nowrap transition-all focus:ring-2 focus:ring-primary ${
              selectedCategory === "all" 
                ? "bg-primary text-white" 
                : "bg-white text-on-surface-variant border border-outline-variant hover:bg-surface-container-low"
            }`}
          >
            All Issues
          </button>
          
          {(["water", "roads", "electricity", "sanitation", "parks"] as IssueCategory[]).map((cat) => {
            const iconMap: Record<IssueCategory, string> = {
              water: "water_drop",
              roads: "edit_road",
              electricity: "electric_bolt",
              sanitation: "delete",
              parks: "yard",
              public_works: "engineering",
              drainage: "water",
              other: "warning"
            };

            return (
              <button 
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full font-label-md text-label-md shadow-sm whitespace-nowrap transition-all flex items-center gap-1 focus:ring-2 focus:ring-primary ${
                  selectedCategory === cat 
                    ? "bg-primary text-white" 
                    : "bg-white text-on-surface-variant border border-outline-variant hover:bg-surface-container-low"
                }`}
              >
                <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                  {iconMap[cat] || "warning"}
                </span>
                <span className="capitalize">{cat}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Marker Information Card (Bottom Left Panel) */}
      {selectedReport && (
        <div className="absolute bottom-4 left-4 z-10 pointer-events-auto max-w-sm w-[calc(100vw-32px)] md:w-full transition-all duration-300">
          <div className="bg-white rounded-lg p-6 shadow-xl border border-outline-variant">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-title-lg text-title-lg text-on-surface mb-1 font-bold">
                  {selectedReport.title}
                </h3>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded-full text-[12px] font-bold capitalize">
                    {selectedReport.status.replace(/_/g, " ")}
                  </span>
                  <span className="text-on-surface-variant text-[12px]">
                    {selectedReport.communitySupport ?? 0} citizens supported
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedReportId(null)}
                className="text-outline hover:text-on-surface transition-colors p-1"
                aria-label="Close details panel"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary" aria-hidden="true">schedule</span>
                <div>
                  <p className="text-[10px] uppercase text-outline font-bold leading-none">Est. Resolution</p>
                  <p className="text-body-md font-body-md text-on-surface">
                    {selectedReport.estimatedResolution || "Pending Assessment"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary" aria-hidden="true">corporate_fare</span>
                <div>
                  <p className="text-[10px] uppercase text-outline font-bold leading-none">Assigned Dept.</p>
                  <p className="text-body-md font-body-md text-on-surface">
                    {selectedReport.departmentAssigned || "Queueing"}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <button 
                onClick={() => router.push(`/reports/${selectedReport.reportId}`)}
                className="w-full py-3 bg-primary text-white rounded-full font-bold active:scale-[0.98] transition-transform shadow-md hover:brightness-110"
              >
                View Details
              </button>
              <button 
                onClick={handleSupportReport}
                className="w-full py-3 border border-primary text-primary rounded-full font-bold active:scale-[0.98] transition-transform hover:bg-surface-container-low"
              >
                Support Existing Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Buttons Overlay (Bottom Right FABs) */}
      <div className="absolute bottom-4 right-4 z-10 pointer-events-auto flex flex-col items-end gap-3">
        {/* Recenter Map FAB */}
        <button 
          onClick={() => {
            // Simulated location search
            router.refresh();
          }}
          className="w-12 h-12 bg-white rounded-full shadow-lg border border-outline-variant/30 flex items-center justify-center text-primary active:scale-90 transition-transform hover:bg-surface-container-low"
          aria-label="Recenter current location"
        >
          <span className="material-symbols-outlined">my_location</span>
        </button>

        {/* AI Copilot Quick Launch FAB */}
        <button 
          onClick={() => openCopilot()}
          className="w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white active:scale-90 transition-transform relative group"
          style={{ background: "linear-gradient(135deg, #4285F4 0%, #9b72cb 50%, #d96570 100%)" }}
          aria-label="Ask AI Copilot about nearby issues"
        >
          <span className="material-symbols-outlined text-[28px]" aria-hidden="true">smart_toy</span>
          <span className="absolute right-16 bg-on-surface text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Ask AI Copilot
          </span>
        </button>

        {/* Report New Issue Action FAB */}
        <button 
          onClick={() => router.push("/reports/new")}
          className="flex items-center gap-3 h-14 px-6 bg-primary text-white rounded-full shadow-lg active:scale-95 transition-all hover:shadow-xl group"
        >
          <span className="material-symbols-outlined text-[24px]" aria-hidden="true">add</span>
          <span className="font-bold text-body-lg">Report New Issue</span>
        </button>
      </div>
    </div>
  );
}
