"use client";

import { useState, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import { useReportsStore } from "@/store/reportsStore";
import { useAppStore } from "@/store/appStore";
import type { IssueCategory, IssueSeverity, ReportStatus, Report } from "@/types";

const MapView = dynamic(
  () => import("@/components/map/MapView").then((mod) => mod.MapView),
  { ssr: false, loading: () => <div className="h-full w-full bg-slate-900 animate-pulse flex items-center justify-center text-slate-500">Loading Map View...</div> }
);

interface LayerState {
  water: boolean;
  roads: boolean;
  garbage: boolean;
  drainage: boolean;
  electricity: boolean;
  resolved: boolean;
  predicted: boolean;
  verification: boolean;
  pipelines: boolean;
  powerGrid: boolean;
  drainageGrid: boolean;
  hospitals: boolean;
  schools: boolean;
  roadMaintenance: boolean;
  riskZones: boolean;
  departments: boolean;
  heatmap: boolean;
}

interface PredictedReport {
  reportId: string;
  title: string;
  issueCategory: string;
  status: string;
  severity: string;
  location: { latitude: number; longitude: number; address: string };
  estimatedResolution: string;
  departmentAssigned: string;
  aiConfidence: number;
  trustScore: number;
  communitySupport: number;
  isPrediction: boolean;
  aiReasoning: string;
}

export default function LiveMapPage() {
  const openCopilot = useAppStore((s) => s.openCopilot);
  const reports = useReportsStore((s) => s.reports);
  const setReport = useReportsStore((s) => s.setReport);

  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [voiceActive, setVoiceActive] = useState(false);
  const [showAutocomplete, setShowAutocomplete] = useState(false);

  // Community support additional simulation flags
  const [affectedList, setAffectedList] = useState<Record<string, boolean>>({});
  const [followList, setFollowList] = useState<Record<string, boolean>>({});

  // Smart Layer Settings
  const [layers, setLayers] = useState<LayerState>({
    water: true,
    roads: true,
    garbage: true,
    drainage: true,
    electricity: true,
    resolved: true,
    predicted: true,
    verification: true,
    pipelines: true,
    powerGrid: false,
    drainageGrid: false,
    hospitals: false,
    schools: false,
    roadMaintenance: false,
    riskZones: true,
    departments: true,
    heatmap: false
  });

  // Heatmap cycling state
  const heatmapModes = [
    "Issue Density", "Water Leakage", "Road Damage", "Garbage", "Drainage", "Electricity", "Community Support", "Predicted Risk", "Duplicate Reports"
  ];
  const [heatmapModeIndex, setHeatmapModeIndex] = useState(0);

  // Sidebar collapsible panels
  const [showLayersPanel, setShowLayersPanel] = useState(true);
  const [showInsightsPanel, setShowInsightsPanel] = useState(true);
  const [showFeedPanel, setShowFeedPanel] = useState(true);

  // Nearby awareness details overlay state
  const [showNearbyInfo, setShowNearbyInfo] = useState(false);

  // Time scrubber timeline states
  const [timelineIndex, setTimelineIndex] = useState(6); // Max step by default
  const [isPlaying, setIsPlaying] = useState(false);

  // Map center/zoom control
  const [mapCenter, setMapCenter] = useState<{ latitude: number; longitude: number } | undefined>(undefined);
  const [mapZoom, setMapZoom] = useState<number | undefined>(undefined);

  // Explainable AI detail card toggle
  const [showExplainAi, setShowExplainAi] = useState(false);

  // User location GPS simulator (Koramangala Center)
  const userLocation = { latitude: 12.9352, longitude: 77.6245 };

  const reportsList = useMemo(() => Object.values(reports), [reports]);

  // Handle Timeline simulation replay
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setInterval(() => {
        setTimelineIndex((prev) => (prev < 6 ? prev + 1 : 0));
      }, 2500);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  const isPrediction = !!selectedReportId?.startsWith("PRED-");

  const selectedReport = useMemo(() => {
    if (!selectedReportId) return null;
    
    // Check if it's a predicted marker
    if (selectedReportId === "PRED-001") {
      return {
        reportId: "PRED-001",
        title: "[AI Prediction] High Drainage Strain Forecasted",
        issueCategory: "drainage",
        status: "predicted",
        severity: "high",
        location: { latitude: 12.9372, longitude: 77.6265, address: "Koramangala 4th Block" },
        estimatedResolution: "48 Hours",
        departmentAssigned: "Water Works",
        aiConfidence: 0.94,
        trustScore: 95,
        communitySupport: 14,
        isPrediction: true,
        aiReasoning: "14 similar historical storm reports, aging sub-networks, and heavy monsoon forecast."
      };
    }
    if (selectedReportId === "PRED-002") {
      return {
        reportId: "PRED-002",
        title: "[AI Prediction] Power Grid Fatigue Threat",
        issueCategory: "electricity",
        status: "predicted",
        severity: "medium",
        location: { latitude: 12.9412, longitude: 77.6185, address: "Koramangala 7th Block" },
        estimatedResolution: "12 Hours",
        departmentAssigned: "BESCOM Dept",
        aiConfidence: 0.89,
        trustScore: 92,
        communitySupport: 9,
        isPrediction: true,
        aiReasoning: "Heavy load peak forecast, transformer fatigue, and school corridor bottleneck within 200m."
      };
    }
    
    return reports[selectedReportId] || null;
  }, [selectedReportId, reports]);

  const predReport = isPrediction ? (selectedReport as unknown as PredictedReport) : null;

  // Autocomplete Suggestions logic
  const autocompleteSuggestions = useMemo(() => {
    if (searchQuery.trim().length < 2) return [];
    const query = searchQuery.toLowerCase().trim();
    return reportsList.filter((r) => 
      r.reportId.toLowerCase().includes(query) ||
      r.title.toLowerCase().includes(query) ||
      r.location.address.toLowerCase().includes(query) ||
      r.issueCategory.toLowerCase().includes(query) ||
      (r.departmentAssigned && r.departmentAssigned.toLowerCase().includes(query))
    ).slice(0, 5);
  }, [searchQuery, reportsList]);

  // Compute filtered reports list dynamically
  const filteredReports = useMemo(() => {
    return reportsList.filter((r) => {
      // Filter by Search Query
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        const matchTitle = r.title.toLowerCase().includes(query);
        const matchDesc = r.description.toLowerCase().includes(query);
        const matchAddress = r.location.address.toLowerCase().includes(query);
        const matchId = r.reportId.toLowerCase().includes(query);
        const matchWard = r.location.ward?.toLowerCase().includes(query);
        const matchDept = r.departmentAssigned?.toLowerCase().includes(query);
        if (!matchTitle && !matchDesc && !matchAddress && !matchId && !matchWard && !matchDept) {
          return false;
        }
      }

      // Filter by Timeline Scrubber Index
      const step = getTimelineStepIndex(r.status);
      if (step > timelineIndex) return false;

      // Filter by Layer Checkboxes
      if (r.status === "resolved" && !layers.resolved) return false;
      if (r.status === "citizen_verification_pending" && !layers.verification) return false;

      const cat = r.issueCategory;
      if (cat === "water" && !layers.water) return false;
      if (cat === "roads" && !layers.roads) return false;
      if (cat === "sanitation" && !layers.garbage) return false;
      if (cat === "drainage" && !layers.drainage) return false;
      if (cat === "electricity" && !layers.electricity) return false;

      return true;
    });
  }, [reportsList, searchQuery, timelineIndex, layers]);

  // Map markers mapping
  const mapMarkers = useMemo(() => {
    const baseMarkers = filteredReports.map((r) => ({
      reportId: r.reportId,
      latitude: r.location.latitude,
      longitude: r.location.longitude,
      category: r.issueCategory as IssueCategory,
      severity: r.severity,
      title: r.title,
      status: r.status,
    }));

    // If predicted layer is toggled, append mock predicted hotspots
    if (layers.predicted) {
      baseMarkers.push(
        {
          reportId: "PRED-001",
          latitude: 12.9372,
          longitude: 77.6265,
          category: "drainage" as IssueCategory,
          severity: "high" as IssueSeverity,
          title: "[AI Prediction] High Drainage Strain Forecasted",
          status: "submitted" as ReportStatus
        },
        {
          reportId: "PRED-002",
          latitude: 12.9412,
          longitude: 77.6185,
          category: "electricity" as IssueCategory,
          severity: "medium" as IssueSeverity,
          title: "[AI Prediction] Power Grid Fatigue Threat",
          status: "submitted" as ReportStatus
        }
      );
    }

    return baseMarkers;
  }, [filteredReports, layers.predicted]);

  // Handle marker click zoom centering
  const handleMarkerClick = (reportId: string) => {
    setSelectedReportId(reportId);
    setShowExplainAi(false);
    
    // Zoom focus matching location
    const matched = reportId.startsWith("PRED-")
      ? (reportId === "PRED-001" ? { latitude: 12.9372, longitude: 77.6265 } : { latitude: 12.9412, longitude: 77.6185 })
      : reports[reportId]?.location;
      
    if (matched) {
      setMapCenter({ latitude: matched.latitude, longitude: matched.longitude });
      setMapZoom(17);
    }
  };

  // Support click handler
  const handleSupportReport = () => {
    if (!selectedReport || isPrediction) return;
    const report = selectedReport as unknown as Report;
    const updated: Report = {
      ...report,
      communitySupport: (report.communitySupport ?? 0) + 1,
      updatedAt: new Date()
    };
    setReport(updated);
  };

  // Affected status trigger
  const handleAffectedClick = (reportId: string) => {
    setAffectedList((prev) => ({ ...prev, [reportId]: !prev[reportId] }));
  };

  // Follow updates trigger
  const handleFollowClick = (reportId: string) => {
    setFollowList((prev) => ({ ...prev, [reportId]: !prev[reportId] }));
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setShowAutocomplete(true);
  };

  // Trigger simulated voice search
  const handleVoiceSearch = () => {
    setVoiceActive(true);
    setTimeout(() => {
      handleSearchChange("RPT-2026-001");
      setVoiceActive(false);
    }, 1800);
  };

  // Focus location Helper
  const focusLocation = (lat: number, lng: number, reportId?: string) => {
    setMapCenter({ latitude: lat, longitude: lng });
    setMapZoom(17);
    if (reportId) setSelectedReportId(reportId);
  };

  // Helper timeline status step index
  function getTimelineStepIndex(status: string) {
    switch (status) {
      case "submitted": return 0;
      case "ai_processing":
      case "ai_verified": return 1;
      case "assigned": return 2;
      case "in_progress": return 3;
      case "work_started": return 4;
      case "citizen_verification_pending": return 5;
      case "resolved": return 6;
      default: return 0;
    }
  }

  // Lifecycle labels mapping
  const getLifecycleLabel = (status: string) => {
    switch (status) {
      case "submitted": return "Report Submitted";
      case "ai_processing":
      case "ai_verified": return "AI Verified";
      case "assigned": return "Department Assigned";
      case "in_progress": return "Repair In Progress";
      case "work_started": return "Crew Dispatched";
      case "citizen_verification_pending": return "Waiting for Community Verification";
      case "resolved": return "Community Verified Resolution";
      default: return "Report Submitted";
    }
  };

  // Calculate distance in meters
  const getDistance = (lat: number, lng: number) => {
    const R = 6371e3; // metres
    const φ1 = (userLocation.latitude * Math.PI) / 180;
    const φ2 = (lat * Math.PI) / 180;
    const Δφ = ((lat - userLocation.latitude) * Math.PI) / 180;
    const Δλ = ((lng - userLocation.longitude) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const d = R * c; 
    return d < 1000 ? `${Math.round(d)}m` : `${(d / 1000).toFixed(1)}km`;
  };

  // Community verification trigger
  const handleVerification = (reportId: string, looksFixed: boolean) => {
    const report = reports[reportId];
    if (report) {
      setReport({
        ...report,
        status: looksFixed ? "resolved" : "in_progress",
        updatedAt: new Date()
      });
      setSelectedReportId(null);
    }
  };

  // AI Insights alerts
  const aiInsights = [
    { title: "Sewer Drainage Risk Active", desc: "Potential overflow due to pipeline clogging.", engine: "📊 Civic Intelligence", confidence: "92%", impact: "High", ward: "Koramangala Ward 7", duration: "4 Hours", lat: 12.9372, lng: 77.6265, id: "PRED-001" },
    { title: "Road Congestion Alert", desc: "MG Road pipeline maintenance limits lanes.", engine: "⚖ Decision Intelligence", confidence: "88%", impact: "Medium", ward: "MG Road District", duration: "2 Days", lat: 12.9412, lng: 77.6185, id: "PRED-002" }
  ];

  // Predictive timeline items
  const forecastTimeline = [
    { title: "Next 6 Hours", desc: "Heavy rainfall expected.", action: "zoom_drainage", lat: 12.9372, lng: 77.6265, id: "PRED-001" },
    { title: "Next 12 Hours", desc: "Drainage overload risk.", action: "zoom_sewer", lat: 12.9352, lng: 77.6245, id: "RPT-2026-001" },
    { title: "Next 24 Hours", desc: "Traffic congestion likely.", action: "zoom_traffic", lat: 12.9412, lng: 77.6185, id: "PRED-002" },
    { title: "Next 48 Hours", desc: "Water leakage probability increasing.", action: "zoom_leak", lat: 12.9392, lng: 77.6285 }
  ];

  // AI Operations Feed
  const aiFeedOperations = [
    { text: "Report Intelligence categorized Water Pipeline Burst.", engine: "🧠 Report Intelligence", time: "Just now", lat: 12.9352, lng: 77.6245, id: "RPT-2026-001" },
    { text: "Trust Engine merged 4 duplicate reports on Outer Ring Road.", engine: "🛡 Trust Engine", time: "15 mins ago", lat: 12.9591, lng: 77.6974 },
    { text: "Decision Engine auto-assigned BBMP Roads to Marathahalli Pothole.", engine: "⚖ Decision Intelligence", time: "1h ago", lat: 12.9591, lng: 77.6974 },
    { text: "Resolution Intelligence detected authority evidence upload: Verification Pending.", engine: "✅ Resolution Intelligence", time: "3h ago", lat: 12.9352, lng: 77.6245, id: "RPT-2026-001" }
  ];

  return (
    <div className="relative w-full h-[calc(100vh-64px)] overflow-hidden bg-background text-on-surface flex flex-col md:flex-row font-sans">
      
      {/* Sidebar Panel Left (AI insights & Operations stream) */}
      <div className="w-full md:w-80 border-r border-outline-variant/30 bg-surface-container-high flex-shrink-0 flex flex-col z-20 pointer-events-auto h-1/2 md:h-full relative overflow-y-auto font-sans">
        <div className="p-4 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container">
          <span className="text-xs font-black uppercase tracking-widest text-on-surface-variant">Civic Intelligence Feed</span>
          <button 
            onClick={() => setShowInsightsPanel(!showInsightsPanel)}
            className="text-xs font-bold text-primary hover:text-on-surface"
          >
            {showInsightsPanel ? "Hide Insights" : "Show Insights"}
          </button>
        </div>

        {showInsightsPanel && (
          <div className="p-4 space-y-4 border-b border-outline-variant/20">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/70">Live AI City Alerts</h4>
            <div className="space-y-3">
              {aiInsights.map((insight, idx) => (
                <div 
                  key={idx}
                  onClick={() => focusLocation(insight.lat, insight.lng, insight.id)}
                  className="p-3 bg-surface-container-low border border-outline-variant/30 hover:border-primary/50 rounded-xl cursor-pointer transition-all space-y-1.5"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-bold text-primary uppercase">{insight.engine}</span>
                    <span className="text-[9px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">{insight.confidence} Conf</span>
                  </div>
                  <h5 className="text-xs font-black text-on-surface">{insight.title}</h5>
                  <p className="text-[10px] text-on-surface-variant">{insight.desc}</p>
                  <div className="flex justify-between items-center text-[9px] pt-1.5 border-t border-outline-variant/20 text-on-surface-variant font-bold uppercase">
                    <span>Impact: <strong className="text-on-surface">{insight.impact}</strong></span>
                    <span>Ward: <strong className="text-on-surface">{insight.ward}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dynamic Replay timeline warnings */}
        <div className="p-4 space-y-4 border-b border-outline-variant/20">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/70">Risk Forecast Timeline</h4>
          <div className="space-y-3">
            {forecastTimeline.map((item, idx) => (
              <div 
                key={idx}
                onClick={() => focusLocation(item.lat, item.lng, item.id)}
                className="flex items-start gap-2.5 p-2 hover:bg-surface-container rounded-lg cursor-pointer transition-colors"
              >
                <div className="h-4 w-4 rounded-full bg-primary/10 border border-primary flex items-center justify-center text-[8px] font-bold text-primary flex-shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <div className="text-[10px]">
                  <p className="font-extrabold text-on-surface leading-none">{item.title}</p>
                  <p className="text-on-surface-variant mt-1">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live AI Operations feed */}
        <div className="p-4 space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/70">Live AI Event Stream</h4>
            <button 
              onClick={() => setShowFeedPanel(!showFeedPanel)}
              className="text-[9px] font-bold text-on-surface-variant hover:text-on-surface"
            >
              {showFeedPanel ? "Collapse" : "Expand"}
            </button>
          </div>
          
          {showFeedPanel && (
            <div className="space-y-3">
              {aiFeedOperations.map((upd, idx) => (
                <div 
                  key={idx}
                  onClick={() => focusLocation(upd.lat, upd.lng, upd.id)}
                  className="flex gap-2.5 text-[10px] hover:bg-surface-container p-2 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-outline-variant/30"
                >
                  <span className="material-symbols-outlined text-[14px] text-primary mt-0.5">smart_toy</span>
                  <div className="flex-grow space-y-0.5">
                    <p className="font-semibold text-on-surface leading-snug">{upd.text}</p>
                    <div className="flex justify-between text-[8px] text-on-surface-variant font-bold uppercase tracking-wider">
                      <span>{upd.engine}</span>
                      <span>{upd.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Map Content Column */}
      <div className="flex-grow relative h-1/2 md:h-full z-10">
        
        {/* Interactive Leaflet Map Background */}
        <div className="absolute inset-0 z-0">
          <MapView 
            markers={mapMarkers}
            center={mapCenter}
            zoom={mapZoom}
            height="100%"
            onMarkerClick={handleMarkerClick}
            className="w-full h-full rounded-none"
            showPipelines={layers.pipelines}
            showPowerGrid={layers.powerGrid}
            showDrainageGrid={layers.drainageGrid}
            showHospitals={layers.hospitals}
            showSchools={layers.schools}
            showRoadMaintenance={layers.roadMaintenance}
            showRiskZones={layers.riskZones}
            showDepartments={layers.departments}
          />
        </div>

        {/* Top Search Controls Bar */}
        <div className="absolute inset-x-0 top-4 z-20 pointer-events-none flex flex-col md:flex-row gap-3 px-4 justify-between items-center max-w-[1000px] mx-auto">
          
          {/* AI Search Panel with voice search and Autocomplete */}
          <div className="w-full md:max-w-md bg-surface-container/95 backdrop-blur-sm border border-outline-variant/30 rounded-full px-4 py-2 pointer-events-auto flex items-center shadow-lg transition-all focus-within:border-primary/40 relative">
            <span className="material-symbols-outlined text-on-surface-variant">search</span>
            <input 
              className="flex-grow bg-transparent border-none text-xs text-on-surface ml-2 outline-none placeholder-on-surface-variant" 
              placeholder="Search Issue ID, Street, Ward, Category or Status..." 
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => setShowAutocomplete(true)}
            />
            <button 
              onClick={handleVoiceSearch}
              className={`p-1.5 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                voiceActive ? "bg-error/20 text-error animate-pulse" : "text-on-surface-variant hover:bg-surface-container-highest"
              }`}
              aria-label="Voice Search"
            >
              <span className="material-symbols-outlined text-[18px]">mic</span>
            </button>

            {/* Autocomplete Dropdown List */}
            {showAutocomplete && autocompleteSuggestions.length > 0 && (
              <div className="absolute top-14 left-0 right-0 bg-surface-container border border-outline-variant/30 rounded-2xl p-2 shadow-2xl space-y-1.5 z-[70] text-xs pointer-events-auto max-h-60 overflow-y-auto">
                <p className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest px-2 py-1">Matching Suggestions</p>
                {autocompleteSuggestions.map((s) => (
                  <div
                    key={s.reportId}
                    onClick={() => {
                      setSearchQuery(s.title);
                      setShowAutocomplete(false);
                      focusLocation(s.location.latitude, s.location.longitude, s.reportId);
                    }}
                    className="flex justify-between items-center p-2.5 hover:bg-surface-container-high rounded-xl cursor-pointer transition-colors"
                  >
                    <div>
                      <span className="font-bold text-on-surface block">{s.title}</span>
                      <span className="text-[10px] text-on-surface-variant capitalize">{s.issueCategory} &bull; {s.location.address}</span>
                    </div>
                    <span className="text-[9px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">{s.reportId}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Stats Summary Banner */}
          <div className="bg-surface-container border border-outline-variant/30 px-4 py-2.5 rounded-2xl pointer-events-auto shadow-md text-[10px] font-bold text-on-surface-variant flex items-center gap-4">
            <div>📍 Wards Covered: <strong className="text-on-surface">Ward 7</strong></div>
            <div>⚡ Risk Hotspots: <strong className="text-error">2 Predicted</strong></div>
            <div>✅ Resolved Today: <strong className="text-success">9 issues</strong></div>
          </div>

        </div>

        {/* Selected Marker Detail Drawer Card (Bottom Left) */}
        {selectedReport && (
          <div className="absolute bottom-20 left-4 z-20 pointer-events-auto max-w-sm w-[calc(100vw-32px)] md:w-full transition-all duration-300">
            <div className="bg-surface-container rounded-2xl p-5 shadow-2xl border border-outline-variant/30 flex flex-col gap-4 text-on-surface">
              
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-black text-on-surface leading-tight flex items-center gap-1.5">
                    {isPrediction ? "📊 Predicted Issue" : "📍 Active Issue"}
                    <span className="text-xs font-normal text-on-surface-variant">({selectedReport.reportId})</span>
                  </h3>
                  <h4 className="text-xs font-bold text-on-surface-variant/80 mt-1">{selectedReport.title}</h4>
                  <p className="text-[10px] text-on-surface-variant mt-0.5 uppercase font-bold tracking-wider">{selectedReport.issueCategory} &bull; {getDistance(selectedReport.location.latitude, selectedReport.location.longitude)} away</p>
                </div>
                <button 
                  onClick={() => setSelectedReportId(null)}
                  className="text-on-surface-variant hover:text-on-surface p-1"
                  aria-label="Close details"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>

              {/* Status and ETA */}
              <div className="grid grid-cols-2 gap-4 border-t border-b border-outline-variant/20 py-3 text-xs">
                <div>
                  <span className="block text-[8px] text-on-surface-variant/50 uppercase tracking-widest font-bold">Lifecycle Status</span>
                  {isPrediction ? (
                    <strong className="text-amber-600 dark:text-amber-400 font-extrabold flex items-center gap-1 mt-0.5">
                      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                      AI Forecasted
                    </strong>
                  ) : (
                    <strong className="text-primary font-extrabold flex items-center gap-1.5 mt-0.5">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full animate-ping"></span>
                      {getLifecycleLabel(selectedReport.status)}
                    </strong>
                  )}
                </div>
                <div>
                  <span className="block text-[8px] text-on-surface-variant/50 uppercase tracking-widest font-bold">Smart Resolution ETA</span>
                  <strong className="text-on-surface font-extrabold block mt-0.5">{selectedReport.estimatedResolution || "18 Hours"}</strong>
                  <span className="text-[8px] font-bold text-blue-600 dark:text-blue-400">94% AI Confidence</span>
                </div>
              </div>

              {/* AI Engine breakdown section */}
              <div className="p-3 bg-surface-container-high/50 border border-outline-variant/30 rounded-xl space-y-1.5 text-[9px] text-on-surface-variant/70">
                <p className="font-bold text-on-surface uppercase text-[8px] border-b border-outline-variant/20 pb-1 flex justify-between">
                  <span>AI Architecture Layers</span>
                  <span className="text-blue-600 dark:text-blue-450 font-bold uppercase tracking-wider">Explainable AI</span>
                </p>
                <div className="flex justify-between items-center">
                  <span>🧠 Report Intelligence:</span>
                  <strong className="text-on-surface-variant text-right font-bold">Categorized {selectedReport.issueCategory}</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span>🛡 Trust Engine:</span>
                  <strong className="text-on-surface-variant font-bold">Confidence {selectedReport.trustScore || 85}%</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span>⚖ Decision Intelligence:</span>
                  <strong className="text-on-surface-variant font-bold">{selectedReport.departmentAssigned || "BBMP Queue"}</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span>✅ Resolution Intelligence:</span>
                  <strong className="text-on-surface-variant font-bold font-bold">Est. completion {selectedReport.estimatedResolution || "18h"}</strong>
                </div>
              </div>

              {/* Explainable AI block details */}
              {showExplainAi ? (
                <div className="p-3 bg-surface-container-high border border-outline-variant/30 rounded-xl space-y-2 text-[9px] text-on-surface-variant/70">
                  <h4 className="font-bold text-on-surface uppercase tracking-widest text-[8px] border-b border-outline-variant/20 pb-1 flex justify-between">
                    <span>Why this Priority?</span>
                    <span className="text-emerald-650 dark:text-emerald-400 font-bold">Confidence: 94%</span>
                  </h4>
                  {isPrediction && predReport ? (
                    <p>{predReport.aiReasoning}</p>
                  ) : (
                    <ul className="space-y-1">
                      <li>• 14 similar reports nearby</li>
                      <li>• Aging sub-network infrastructure</li>
                      <li>• Heavy rainfall forecast active</li>
                      <li>• Critical hospital corridor within 400m</li>
                      <li>• High traffic flow density</li>
                    </ul>
                  )}
                  <button 
                    onClick={() => setShowExplainAi(false)}
                    className="text-blue-600 dark:text-blue-450 font-bold hover:underline block pt-1 cursor-pointer"
                  >
                    Hide reasoning
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowExplainAi(true)}
                  className="text-xs text-blue-600 dark:text-blue-450 font-bold hover:underline self-start flex items-center gap-0.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[14px]">insights</span> Why this hotspot exists?
                </button>
              )}

              {/* Community verification card (If pending verification) */}
              {selectedReport.status === "citizen_verification_pending" && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/25 rounded-xl space-y-3">
                  <div className="flex justify-between items-baseline">
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Repair Completed • Verification Requested</span>
                    <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400">94% AI Match</span>
                  </div>
                  
                  {/* Side by side mock photos */}
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="border border-outline-variant/30 rounded-lg p-1 bg-surface-container-high">
                      <span className="block text-[8px] uppercase tracking-wider text-on-surface-variant/70">Before Photo</span>
                      <div className="h-10 w-full bg-surface-container-low rounded mt-1 flex items-center justify-center text-[10px] text-on-surface-variant">📷 Before</div>
                    </div>
                    <div className="border border-outline-variant/30 rounded-lg p-1 bg-surface-container-high">
                      <span className="block text-[8px] uppercase tracking-wider text-on-surface-variant/70">After Photo</span>
                      <div className="h-10 w-full bg-surface-container-low rounded mt-1 flex items-center justify-center text-[10px] text-on-surface-variant">📷 Fixed</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-center text-[10px]">
                    <button 
                      onClick={() => handleVerification(selectedReport.reportId, true)}
                      className="py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold transition-all cursor-pointer"
                    >
                      Looks Fixed
                    </button>
                    <button 
                      onClick={() => handleVerification(selectedReport.reportId, false)}
                      className="py-2 bg-transparent border border-outline-variant text-on-surface-variant hover:bg-surface-container rounded-lg font-bold transition-all cursor-pointer"
                    >
                      Still Exists
                    </button>
                  </div>
                </div>
              )}

              {/* Community Support Engagement Section */}
              <div className="flex justify-between items-center border-t border-outline-variant/20 pt-2 text-[9px] text-on-surface-variant/50 font-bold uppercase tracking-wider">
                <div className="flex gap-3">
                  <span>Support: <strong className="text-on-surface">{selectedReport.communitySupport ?? 0}</strong></span>
                  <span>Followers: <strong className="text-on-surface">{followList[selectedReport.reportId] ? 73 : 72}</strong></span>
                  <span>Affected: <strong className="text-on-surface">{affectedList[selectedReport.reportId] ? 139 : 138}</strong></span>
                </div>
                <span className="text-primary font-bold bg-primary/10 px-1.5 py-0.5 rounded uppercase">🔥 Trending</span>
              </div>

              {/* Interactive buttons */}
              <div className="grid grid-cols-4 gap-1.5 pt-1">
                <button 
                  onClick={handleSupportReport}
                  className="py-2 bg-primary hover:bg-primary-hover text-white rounded-lg font-bold text-[10px] transition-colors col-span-2 cursor-pointer"
                >
                  Support Issue
                </button>
                <button 
                  onClick={() => handleAffectedClick(selectedReport.reportId)}
                  className={`py-2 rounded-lg font-bold text-[10px] transition-all cursor-pointer ${
                    affectedList[selectedReport.reportId] ? "bg-success text-white" : "border border-outline-variant/30 text-on-surface-variant"
                  }`}
                >
                  {affectedList[selectedReport.reportId] ? "Affected ✓" : "I'm Affected"}
                </button>
                <button 
                  onClick={() => handleFollowClick(selectedReport.reportId)}
                  className={`py-2 rounded-lg font-bold text-[10px] transition-all cursor-pointer ${
                    followList[selectedReport.reportId] ? "bg-primary/20 text-primary border border-primary/40" : "border border-outline-variant/30 text-on-surface-variant"
                  }`}
                >
                  {followList[selectedReport.reportId] ? "Following" : "Follow"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* GPS location nearby summaries card overlay (Bottom Left side) */}
        {showNearbyInfo && (
          <div className="absolute bottom-20 left-4 z-20 pointer-events-auto max-w-sm bg-surface-container border border-outline-variant/30 rounded-2xl p-4 shadow-2xl space-y-3 text-xs w-80 text-on-surface-variant">
            <div className="flex justify-between items-center border-b border-outline-variant/30 pb-2">
              <span className="font-black text-on-surface uppercase text-[9px] tracking-wider">📍 Nearby GPS Awareness</span>
              <button 
                onClick={() => setShowNearbyInfo(false)}
                className="text-on-surface-variant hover:text-on-surface"
              >
                ✕
              </button>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Nearest Active Issue:</span>
                <strong className="text-on-surface font-bold">Water pipeline leak (50m, 🚶 1m, 🚗 1m)</strong>
              </div>
              <div className="flex justify-between">
                <span>Nearest Resolved Issue:</span>
                <strong className="text-on-surface font-bold">Road Repair (200m, 🚶 3m)</strong>
              </div>
              <div className="flex justify-between">
                <span>Nearest Verification Request:</span>
                <strong className="text-on-surface font-bold">BWSSB Evidence (120m, 🚶 2m)</strong>
              </div>
              <div className="flex justify-between">
                <span>Nearest High-Risk Zone:</span>
                <strong className="text-on-surface font-bold">Drainage Overflow (350m, 🚶 5m)</strong>
              </div>
            </div>
          </div>
        )}

        {/* Right Floating Operations Layers Toggles */}
        <div className="absolute top-4 right-4 z-20 pointer-events-auto flex flex-col gap-2 items-end">
          <button 
            onClick={() => setShowLayersPanel(!showLayersPanel)}
            className="w-10 h-10 bg-surface-container border border-outline-variant/30 rounded-xl shadow-lg flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
            aria-label="Map Layers Toggle"
          >
            <span className="material-symbols-outlined">layers</span>
          </button>

          {showLayersPanel && (
            <div className="bg-surface-container-high/95 backdrop-blur-sm border border-outline-variant/30 rounded-2xl p-4 shadow-2xl text-xs space-y-3 w-60">
              <h4 className="font-black text-on-surface uppercase tracking-widest text-[9px] border-b border-outline-variant/20 pb-1.5">Civic Map Layers</h4>
              
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-on-surface-variant hover:text-on-surface">
                  <input 
                    type="checkbox" 
                    checked={layers.water} 
                    onChange={(e) => setLayers({ ...layers, water: e.target.checked })} 
                    className="rounded bg-surface-container border-outline-variant/40 text-blue-600 w-3.5 h-3.5 focus:ring-0" 
                  />
                  <span>Water Outages</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-on-surface-variant hover:text-on-surface">
                  <input 
                    type="checkbox" 
                    checked={layers.roads} 
                    onChange={(e) => setLayers({ ...layers, roads: e.target.checked })} 
                    className="rounded bg-surface-container border-outline-variant/40 text-blue-600 w-3.5 h-3.5 focus:ring-0" 
                  />
                  <span>Road Damage</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-on-surface-variant hover:text-on-surface">
                  <input 
                    type="checkbox" 
                    checked={layers.garbage} 
                    onChange={(e) => setLayers({ ...layers, garbage: e.target.checked })} 
                    className="rounded bg-surface-container border-outline-variant/40 text-blue-600 w-3.5 h-3.5 focus:ring-0" 
                  />
                  <span>Garbage Overflow</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-on-surface-variant hover:text-on-surface">
                  <input 
                    type="checkbox" 
                    checked={layers.drainage} 
                    onChange={(e) => setLayers({ ...layers, drainage: e.target.checked })} 
                    className="rounded bg-surface-container border-outline-variant/40 text-blue-600 w-3.5 h-3.5 focus:ring-0" 
                  />
                  <span>Storm Drainage</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-on-surface-variant hover:text-on-surface">
                  <input 
                    type="checkbox" 
                    checked={layers.electricity} 
                    onChange={(e) => setLayers({ ...layers, electricity: e.target.checked })} 
                    className="rounded bg-surface-container border-outline-variant/40 text-blue-600 w-3.5 h-3.5 focus:ring-0" 
                  />
                  <span>Electricity Outages</span>
                </label>
                
                <h5 className="font-bold text-on-surface-variant/50 uppercase tracking-wider text-[8px] pt-1.5 border-t border-outline-variant/20">AI & Risks</h5>
                
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-on-surface-variant hover:text-on-surface">
                  <input 
                    type="checkbox" 
                    checked={layers.predicted} 
                    onChange={(e) => setLayers({ ...layers, predicted: e.target.checked })} 
                    className="rounded bg-surface-container border-outline-variant/40 text-blue-600 w-3.5 h-3.5 focus:ring-0" 
                  />
                  <span className="text-amber-600 dark:text-amber-400">Predicted Hotspots</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-on-surface-variant hover:text-on-surface">
                  <input 
                    type="checkbox" 
                    checked={layers.verification} 
                    onChange={(e) => setLayers({ ...layers, verification: e.target.checked })} 
                    className="rounded bg-surface-container border-outline-variant/40 text-blue-600 w-3.5 h-3.5 focus:ring-0" 
                  />
                  <span>Pending Verification</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-on-surface-variant hover:text-on-surface">
                  <input 
                    type="checkbox" 
                    checked={layers.resolved} 
                    onChange={(e) => setLayers({ ...layers, resolved: e.target.checked })} 
                    className="rounded bg-surface-container border-outline-variant/40 text-blue-600 w-3.5 h-3.5 focus:ring-0" 
                  />
                  <span>Resolved Issues</span>
                </label>

                <h5 className="font-bold text-on-surface-variant/50 uppercase tracking-wider text-[8px] pt-1.5 border-t border-outline-variant/20">Digital Twin Networks</h5>
                
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-on-surface-variant hover:text-on-surface">
                  <input 
                    type="checkbox" 
                    checked={layers.pipelines} 
                    onChange={(e) => setLayers({ ...layers, pipelines: e.target.checked })} 
                    className="rounded bg-surface-container border-outline-variant/40 text-blue-600 w-3.5 h-3.5 focus:ring-0" 
                  />
                  <span>Water Pipelines</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-on-surface-variant hover:text-on-surface">
                  <input 
                    type="checkbox" 
                    checked={layers.powerGrid} 
                    onChange={(e) => setLayers({ ...layers, powerGrid: e.target.checked })} 
                    className="rounded bg-surface-container border-outline-variant/40 text-blue-600 w-3.5 h-3.5 focus:ring-0" 
                  />
                  <span>Electricity Grid</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-on-surface-variant hover:text-on-surface">
                  <input 
                    type="checkbox" 
                    checked={layers.drainageGrid} 
                    onChange={(e) => setLayers({ ...layers, drainageGrid: e.target.checked })} 
                    className="rounded bg-surface-container border-outline-variant/40 text-blue-600 w-3.5 h-3.5 focus:ring-0" 
                  />
                  <span>Drainage Grid</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-on-surface-variant hover:text-on-surface">
                  <input 
                    type="checkbox" 
                    checked={layers.hospitals} 
                    onChange={(e) => setLayers({ ...layers, hospitals: e.target.checked })} 
                    className="rounded bg-surface-container border-outline-variant/40 text-blue-600 w-3.5 h-3.5 focus:ring-0" 
                  />
                  <span>Hospital zones</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-on-surface-variant hover:text-on-surface">
                  <input 
                    type="checkbox" 
                    checked={layers.schools} 
                    onChange={(e) => setLayers({ ...layers, schools: e.target.checked })} 
                    className="rounded bg-surface-container border-outline-variant/40 text-blue-600 w-3.5 h-3.5 focus:ring-0" 
                  />
                  <span>School zones</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-on-surface-variant hover:text-on-surface">
                  <input 
                    type="checkbox" 
                    checked={layers.roadMaintenance} 
                    onChange={(e) => setLayers({ ...layers, roadMaintenance: e.target.checked })} 
                    className="rounded bg-surface-container border-outline-variant/40 text-blue-600 w-3.5 h-3.5 focus:ring-0" 
                  />
                  <span>Maintenance Zones</span>
                </label>

                {/* Heatmap Overlay cycling */}
                <h5 className="font-bold text-on-surface-variant/50 uppercase tracking-wider text-[8px] pt-1.5 border-t border-outline-variant/20 flex justify-between items-center">
                  <span>Heatmap overlays</span>
                  <button 
                    onClick={() => setLayers({ ...layers, heatmap: !layers.heatmap })}
                    className={`text-[8px] px-1 rounded ${layers.heatmap ? "bg-blue-600 text-white" : "bg-surface-container text-on-surface-variant"}`}
                  >
                    {layers.heatmap ? "On" : "Off"}
                  </button>
                </h5>

                {layers.heatmap && (
                  <div className="pt-1.5 space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-on-surface-variant">Mode: <strong>{heatmapModes[heatmapModeIndex]}</strong></span>
                      <button 
                        onClick={() => setHeatmapModeIndex((prev) => (prev < heatmapModes.length - 1 ? prev + 1 : 0))}
                        className="text-[9px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                      >
                        Cycle Mode
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Floating Timeline Scrubber replay slider */}
        <div className="absolute bottom-4 right-4 z-20 pointer-events-auto bg-surface-container-high/90 backdrop-blur-sm border border-outline-variant/30 px-5 py-3 rounded-2xl shadow-xl w-[320px] space-y-2 text-xs">
          <div className="flex justify-between items-center font-bold">
            <span className="uppercase text-[9px] text-on-surface-variant/50 tracking-wider">Operational Timeline Replay</span>
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="text-xs text-blue-600 dark:text-blue-400 font-extrabold hover:underline cursor-pointer"
            >
              {isPlaying ? "⏸ Pause" : "▶ Play Live"}
            </button>
          </div>
          
          <input 
            type="range" 
            min="0" 
            max="6" 
            value={timelineIndex} 
            onChange={(e) => setTimelineIndex(Number(e.target.value))} 
            className="w-full bg-surface-container rounded-lg appearance-none h-1 cursor-pointer accent-blue-500" 
          />
          
          <div className="flex justify-between text-[8px] uppercase tracking-wider text-on-surface-variant/50 font-bold px-1">
            <span>Submitted</span>
            <span>Verified</span>
            <span>Assigned</span>
            <span>WIP</span>
            <span>Resolved</span>
          </div>
        </div>

        {/* GPS location recenter button overlay */}
        <div className="absolute top-24 right-4 z-20 pointer-events-auto">
          <button 
            onClick={() => {
              focusLocation(userLocation.latitude, userLocation.longitude);
              setShowNearbyInfo(true);
            }}
            className="w-10 h-10 bg-surface-container border border-outline-variant/30 rounded-xl shadow-lg flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
            aria-label="Recenter current location GPS"
          >
            <span className="material-symbols-outlined text-[20px]">my_location</span>
          </button>
        </div>

      </div>

      {/* Floating AI Copilot FAB integration */}
      <div className="fixed bottom-24 right-6 md:bottom-8 md:right-8 z-50">
        <button 
          onClick={openCopilot}
          className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 shadow-2xl flex items-center justify-center text-white active:scale-95 hover:brightness-110 transition-transform duration-200 ring-4 ring-white dark:ring-slate-800 cursor-pointer" 
          aria-label="Open CivicCopilot AI assistant"
        >
          <span className="material-symbols-outlined text-3xl" aria-hidden="true">auto_awesome</span>
        </button>
      </div>

    </div>
  );
}
