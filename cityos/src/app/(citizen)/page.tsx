"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useAuthStore } from "@/store/authStore";
import { useAppStore } from "@/store/appStore";
import { useReportsStore } from "@/store/reportsStore";
import type { Report } from "@/types";

const MapView = dynamic(
  () => import("@/components/map/MapView").then((mod) => mod.MapView),
  { ssr: false, loading: () => <div className="h-full w-full bg-slate-100 dark:bg-slate-900 animate-pulse flex items-center justify-center text-slate-500">Loading Snapshot Map...</div> }
);

const CATEGORY_IMAGES: Record<string, string> = {
  roads: "https://lh3.googleusercontent.com/aida-public/AB6AXuDFhBa2yjbIsAbzF1Bq_sxoGH8VdNgJxxvIs85bAMh3u4Dj7S2-VEznqa9HRZoSP7TfR6oF1hK0q_-TB_4VWpmg8yF1-6J_VG1bvvBijT7EkOsstIRDkO9b6u_6T7FiQN8XdMdQd_-aOlr_PkRMwTB0hHxn4MTZ_4f9kXCSl3P-fcpK7bym708y4MNPWzGDhTvOz5-oLvLwbKhVnWXTrjqczTTscZHxep9Koo9LprfqZ8RfUz5YJPQ6Kn1xdmjt7aXvr4V6IhJN5Gbx",
  electricity: "https://lh3.googleusercontent.com/aida-public/AB6AXuCPv7psSZBJKt8INPn0ReXvbMyYDVIxL7G7g6dpVtvdIIL-Dc2xl8gRmA5sgh-Eu76jfo8Nbbvdyr1N9M_D1kjemNFBWNKyDUz1b4sTqCeHXYb7gPa908H53ZFo0p9VJJGoaJzkAG_r6zQZ_XCsPJ03eIhPcEUXlHj4uqsL21brjDO2JFEy4nV6JCBCiqn-3E0L1-0Ck9w6gZ5cbnRSxPabSHi37zu5xlsXhUICtiuuUl5BZ0-EWzEGIU7A4Dh1CaED4Iur6gpUTGbM",
  water: "https://images.unsplash.com/photo-1542013936693-8848e574047a?w=400&q=80",
  sanitation: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400&q=80",
  parks: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=400&q=80",
  default: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&q=80"
};

function getReportImage(report: Report): string {
  if (report.media?.imageUrls && report.media.imageUrls.length > 0) {
    return report.media.imageUrls[0]!;
  }
  return CATEGORY_IMAGES[report.issueCategory] ?? CATEGORY_IMAGES.default!;
}

function getFormattedDate(date: Date | string): string {
  const d = new Date(date);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[d.getMonth()]} ${d.getDate()}`;
}

export default function CitizenHomePage() {
  const user = useAuthStore((s) => s.user);
  const reports = useReportsStore((s) => s.reports);
  const setReport = useReportsStore((s) => s.setReport);
  const openCopilot = useAppStore((s) => s.openCopilot);
  const router = useRouter();
  
  const [greeting, setGreeting] = useState("Good Day");
  const [explainReport, setExplainReport] = useState<Report | null>(null);
  const [verificationResult, setVerificationResult] = useState<"success" | "fail" | null>(null);
  const [isDashboardLoading, setIsDashboardLoading] = useState(true);

  const reportsList = useMemo(() => Object.values(reports), [reports]);

  // Seed RPT-2026-001 as citizen_verification_pending on first mount to showcase verification
  useEffect(() => {
    const r = reportsList.find(x => x.reportId === "RPT-2026-001");
    if (r && r.status !== "resolved" && r.status !== "closed" && r.status !== "citizen_verification_pending") {
      setReport({
        ...r,
        status: "citizen_verification_pending"
      });
    }
  }, [reportsList, setReport]);

  useEffect(() => {
    const h = new Date().getHours();
    let currentGreeting = "Good Day";
    if (h < 12) currentGreeting = "Good Morning";
    else if (h < 17) currentGreeting = "Good Afternoon";
    else currentGreeting = "Good Evening";
    
    const timer = setTimeout(() => {
      setGreeting(currentGreeting);
      setIsDashboardLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const displayName = user?.fullName ?? "Priya Sharma";

  // Filter user reports
  const userReports = useMemo(() => {
    return reportsList.filter(r => r.citizenId === (user?.userId ?? "demo-citizen-1"));
  }, [reportsList, user]);

  // Extract the active report for Active Issue Tracker
  const activeReport = useMemo(() => {
    return userReports.find(r => r.status !== "resolved" && r.status !== "closed" && r.status !== "citizen_verification_pending");
  }, [userReports]);

  // Extract report currently awaiting citizen verification
  const verificationReport = useMemo(() => {
    return userReports.find(r => r.status === "citizen_verification_pending");
  }, [userReports]);

  // Recent reports for queue list (exclude verification pending)
  const displayReports = useMemo(() => {
    const filtered = reportsList.filter(r => r.status !== "citizen_verification_pending");
    return filtered.slice(0, 3);
  }, [reportsList]);

  // Dynamic impact calculations
  const totalReportsCount = userReports.length || 12;
  const solvedCount = userReports.filter(r => ["resolved", "closed"].includes(r.status)).length || 9;
  const supportsCount = userReports.reduce((acc, r) => acc + (r.communitySupport || 0), 0) || 42;
  const verifiedCount = solvedCount + 2; // Simulated verification actions
  const impactPoints = (totalReportsCount * 10) + (solvedCount * 25) + (verifiedCount * 15) + supportsCount;

  // Map markers
  const mapMarkers = useMemo(() => {
    return reportsList.map((r) => ({
      reportId: r.reportId,
      latitude: r.location.latitude,
      longitude: r.location.longitude,
      category: r.issueCategory as "water" | "roads" | "electricity" | "sanitation" | "parks" | "public_works" | "drainage" | "other",
      severity: r.severity,
      title: r.title,
      status: r.status,
    }));
  }, [reportsList]);

  // Check if any critical flooding / water pipeline reports exist in Ward 7 to trigger warning
  const cityAlert = useMemo(() => {
    const alertReport = reportsList.find(r => 
      r.severity === "critical" && 
      r.location.ward?.includes("Ward 7") &&
      (r.issueCategory === "water" || r.issueCategory === "drainage")
    );
    if (alertReport) {
      return {
        title: "Flood Risk Active",
        desc: "Burst pipeline near 4th Block is causing flooding. Crews are on-site.",
        type: "flood"
      };
    }
    return null;
  }, [reportsList]);

  // Handle citizen verification actions
  const handleVerification = (reportId: string, looksFixed: boolean) => {
    const report = reports[reportId];
    if (report) {
      setVerificationResult(looksFixed ? "success" : "fail");
      setTimeout(() => {
        setReport({
          ...report,
          status: looksFixed ? "resolved" : "in_progress",
          updatedAt: new Date()
        });
        setVerificationResult(null);
      }, 2000);
    }
  };

  // Get lifecycle label for consistency
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

  // Get active timeline index for progress timeline
  const getTimelineStepIndex = (status: string) => {
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
  };

  // Dynamic AI Activity feed logs
  const aiActivities = useMemo(() => {
    return [
      { id: "act-1", title: "Resolution Intelligence calculated verification confidence at 94%.", time: "Just now", icon: "shield_person" },
      { id: "act-2", title: "Trust Engine verified report authenticity.", time: "15 minutes ago", icon: "verified" },
      { id: "act-3", title: "Report Intelligence categorized new road issue on Outer Ring Road.", time: "Yesterday", icon: "auto_awesome" },
      { id: "act-4", title: "Decision Engine auto-assigned BBMP Roads to Marathahalli Pothole.", time: "Yesterday", icon: "engineering" },
      { id: "act-5", title: "ETA updated dynamically based on BWSSB workload profiles.", time: "Yesterday", icon: "schedule" }
    ];
  }, []);

  // Dynamic neighborhood feed
  const neighborhoodActivity = useMemo(() => {
    return [
      { id: "n-1", status: "repaired", text: "Water leakage repaired", desc: "200m away • 2 hours ago", color: "bg-emerald-500" },
      { id: "n-2", status: "wip", text: "Road repair in progress", desc: "Outer Ring Road • ETA 3 PM", color: "bg-amber-500" },
      { id: "n-3", status: "reported", text: "Garbage overflow reported", desc: "AI assigned Sanitation Department", color: "bg-red-500" },
      { id: "n-4", status: "info", text: "Water maintenance scheduled", desc: "Ward 7 • Low pressure tomorrow", color: "bg-blue-500" }
    ];
  }, []);

  if (isDashboardLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0A0F1C] text-slate-800 dark:text-slate-100 transition-colors duration-200">
        <main className="max-w-[1280px] mx-auto px-4 md:px-8 py-8 space-y-8">
          {/* Header Skeleton */}
          <div className="space-y-3 animate-pulse">
            <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/3"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/2"></div>
            <div className="flex gap-2 pt-2">
              <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-full w-24"></div>
              <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-full w-32"></div>
              <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-full w-24"></div>
            </div>
          </div>

          {/* Grid Layout Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column Skeletons */}
            <div className="lg:col-span-8 space-y-6">
              <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse"></div>
              <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse"></div>
              <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse"></div>
            </div>

            {/* Right Column Skeletons */}
            <div className="lg:col-span-4 space-y-6">
              <div className="h-[320px] bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse"></div>
              <div className="h-56 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse"></div>
              <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0A0F1C] text-slate-800 dark:text-slate-100 transition-colors duration-200 font-sans">
      <main className="max-w-[1280px] mx-auto px-4 md:px-8 py-8 space-y-8">
        
        {/* Welcome Section */}
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-headline-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              {greeting}, {displayName} 
              <span className="inline-block animate-bounce">👋</span>
            </h1>
            <p className="text-body-lg text-slate-550 dark:text-slate-400 mt-1">
              Securely connected to Bengaluru Civic Operations Command.
            </p>
          </div>

          {/* Conditional City Alert Chip */}
          {cityAlert && (
            <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 dark:bg-red-500/20 border border-red-500/25 rounded-2xl text-xs font-bold text-red-650 dark:text-red-400 animate-pulse-glow shadow-sm max-w-sm">
              <span className="material-symbols-outlined text-[16px] text-red-500">warning</span>
              <div>
                <p className="leading-none text-[10px] uppercase font-black tracking-wider">{cityAlert.title}</p>
                <p className="text-[9px] font-medium text-slate-650 dark:text-slate-300 mt-0.5">{cityAlert.desc}</p>
              </div>
            </div>
          )}
        </section>

        {/* Dashboard Split Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Main Dashboard Column */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* AI Summary bulletin board */}
            <div className="p-6 rounded-2xl relative overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-md hover:shadow-lg transition-shadow duration-200">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
              <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-white" aria-hidden="true">auto_awesome</span>
                    <h2 className="text-title-lg font-extrabold tracking-tight">AI Summary for You</h2>
                  </div>
                  <span className="text-[9px] font-bold bg-white/20 text-white px-2 py-0.5 rounded-full uppercase tracking-wider font-sans">Active Assistant</span>
                </div>
                <ul className="space-y-3 text-xs md:text-sm">
                  {verificationReport && (
                    <li className="flex items-start gap-2.5">
                      <span className="text-emerald-300 font-bold">✓</span>
                      <span>One of your reports has been resolved. Please verify the repair photo.</span>
                    </li>
                  )}
                  {activeReport && (
                    <li className="flex items-start gap-2.5">
                      <span className="text-emerald-300 font-bold">✓</span>
                      <span>Based on current department workload, your issue is expected to be resolved 6 hours earlier.</span>
                    </li>
                  )}
                  <li className="flex items-start gap-2.5">
                    <span className="text-emerald-300 font-bold">✓</span>
                    <span>Heavy rainfall forecast in Ward 7 may increase sewer drainage strain over next 24 hours.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-emerald-300 font-bold">✓</span>
                    <span>Your report has helped identify a larger infrastructure problem. Three nearby duplicate complaints merged.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-emerald-300 font-bold">✓</span>
                    <span>Community support increased your report priority. Your civic contribution rank improved to Top 12%.</span>
                  </li>
                </ul>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-white/10 text-xs">
                  <span className="text-slate-200/80 italic font-medium">Powered by CityOS AI</span>
                  <button 
                    onClick={openCopilot}
                    className="px-5 py-2.5 bg-white text-blue-600 rounded-xl font-bold hover:bg-slate-50 transition-all active:scale-95 text-xs shadow-sm self-start sm:self-auto"
                  >
                    Ask CityOS Copilot
                  </button>
                </div>
              </div>
            </div>

            {/* Current Active Issue (Hero Card) */}
            <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-5 hover:translate-y-[-2px] transition-transform duration-200">
              <div className="flex justify-between items-center border-b border-gray-100 dark:border-slate-850 pb-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">track_changes</span>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Current Active Issue</h3>
                </div>
                {activeReport && (
                  <span className="text-[9px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1 h-1 bg-blue-50 rounded-full animate-ping"></span> Live Tracking
                  </span>
                )}
              </div>

              {activeReport ? (
                <div className="space-y-4">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="w-full md:w-32 h-24 rounded-lg overflow-hidden flex-shrink-0 relative bg-slate-100 dark:bg-slate-900 border border-gray-200 dark:border-slate-800">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        className="w-full h-full object-cover" 
                        alt={activeReport.title} 
                        src={getReportImage(activeReport)}
                      />
                    </div>
                    
                    <div className="flex-grow space-y-2">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <h4 className="text-sm font-extrabold text-slate-900 dark:text-white leading-tight">{activeReport.title}</h4>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                            Category: <strong className="text-slate-700 dark:text-slate-300 uppercase">{activeReport.issueCategory} (98% Confidence)</strong> &bull; Department: <strong className="text-slate-700 dark:text-slate-300">{activeReport.departmentAssigned}</strong>
                          </p>
                          <p className="text-[10px] text-slate-550 dark:text-slate-400">
                            Assigned Officer: <strong className="text-slate-700 dark:text-slate-300">Inspector Ramesh Kumar</strong>
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="block text-[8px] text-slate-500 uppercase tracking-widest">Est. Resolution</span>
                          <strong className="text-xs font-extrabold text-slate-850 dark:text-white">{activeReport.estimatedResolution || "18 Hours"}</strong>
                          <span className="block text-[8px] text-blue-650 dark:text-blue-400 font-bold mt-0.5">91% AI Confidence</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-4 text-[10px] text-slate-500 pt-1.5 border-t border-gray-100 dark:border-slate-850">
                        <span>Trust Score: <strong className="text-slate-800 dark:text-white">{activeReport.trustScore || 90}%</strong></span>
                        <span>Community Support: <strong className="text-slate-800 dark:text-white">{activeReport.communitySupport || 47} votes</strong></span>
                        <span>Status: <strong className="text-blue-600 dark:text-blue-400 font-bold">{getLifecycleLabel(activeReport.status)}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Horizontal Timeline Progress */}
                  <div className="pt-2">
                    <div className="flex justify-between text-[8px] uppercase tracking-wider text-slate-500 mb-2 font-bold px-1">
                      <span className={getTimelineStepIndex(activeReport.status) >= 0 ? "text-blue-600 dark:text-blue-400 font-bold" : ""}>Submitted</span>
                      <span className={getTimelineStepIndex(activeReport.status) >= 1 ? "text-blue-600 dark:text-blue-400 font-bold" : ""}>AI Verified</span>
                      <span className={getTimelineStepIndex(activeReport.status) >= 2 ? "text-blue-600 dark:text-blue-400 font-bold" : ""}>Assigned</span>
                      <span className={getTimelineStepIndex(activeReport.status) >= 3 ? "text-blue-600 dark:text-blue-400 font-bold" : ""}>Dispatched</span>
                      <span className={getTimelineStepIndex(activeReport.status) >= 4 ? "text-blue-600 dark:text-blue-400 font-bold" : ""}>In Progress</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden relative">
                      <div 
                        className="bg-blue-600 dark:bg-blue-500 h-full rounded-full transition-all duration-550" 
                        style={{ width: `${((getTimelineStepIndex(activeReport.status) + 1) / 5) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center space-y-3 bg-slate-50 dark:bg-slate-900/40 border border-dashed border-gray-255 dark:border-slate-800 rounded-2xl p-4">
                  <span className="text-3xl inline-block animate-pulse">🎉</span>
                  <p className="text-sm font-extrabold text-slate-900 dark:text-white">Great news!</p>
                  <p className="text-xs text-slate-550 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                    No active civic issues require your attention today. Your neighbourhood is looking better.
                  </p>
                </div>
              )}
            </div>

            {/* Community Verification Card (USP Resolution Workflow) */}
            {verificationReport && (
              <div className="bg-emerald-500/5 dark:bg-emerald-500/10 border-2 border-emerald-500/30 rounded-2xl p-6 shadow-sm space-y-4 hover:translate-y-[-2px] transition-transform duration-200">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-2xl">verified</span>
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white leading-tight">Authority Repair Evidence Submitted</h4>
                    <p className="text-xs text-slate-650 dark:text-slate-400 mt-0.5">AI Before/After Verification Completed. Please confirm resolution.</p>
                  </div>
                </div>

                {verificationResult ? (
                  <div className="p-4 bg-slate-100/50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-800 rounded-xl text-center text-xs font-bold animate-pulse">
                    {verificationResult === "success" ? (
                      <span className="text-emerald-650 dark:text-emerald-400">✅ Community Verified Resolution: Archiving Report...</span>
                    ) : (
                      <span className="text-red-500">⚠ Issue Automatically Reopened: Re-routing to Dispatch...</span>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                    <div className="bg-[#F8FAFC] dark:bg-slate-900 rounded-xl p-3 border border-gray-250 dark:border-slate-800 text-xs space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-550 font-bold uppercase tracking-wider text-[9px]">Community Responses</span>
                        <strong className="text-slate-800 dark:text-white">16 / 20 Verified</strong>
                      </div>
                      <div className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: "80%" }}></div>
                      </div>
                      <div className="flex justify-between items-center text-[10px] pt-1">
                        <span className="text-slate-550">Resolution Confidence:</span>
                        <strong className="text-emerald-600 dark:text-emerald-400 font-bold">94%</strong>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        onClick={() => handleVerification(verificationReport.reportId, true)}
                        className="py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all active:scale-95 shadow-sm cursor-pointer"
                      >
                        Looks Fixed
                      </button>
                      <button
                        onClick={() => handleVerification(verificationReport.reportId, false)}
                        className="py-3 bg-transparent border border-gray-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer"
                      >
                        Still Exists
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Smart ETA Explanation details block */}
            {activeReport && (
              <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-550">Smart ETA Insights</h4>
                <div className="flex items-center justify-between">
                  <div className="text-xs">
                    <p className="font-semibold text-slate-850 dark:text-white">Estimated Resolution: {activeReport.estimatedResolution || "18 Hours"}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Calculated using live operational queue statistics.</p>
                  </div>
                  <div className="text-right">
                    <span className="block text-[8px] text-slate-500 uppercase tracking-widest">Prediction Confidence</span>
                    <strong className="text-xs text-blue-655 dark:text-blue-400">94% Confidence</strong>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 pt-2 border-t border-gray-105 dark:border-slate-850 text-[10px] text-slate-600 dark:text-slate-400 font-medium">
                  <div>• Live Department workload: <strong className="text-slate-850 dark:text-white">Normal</strong></div>
                  <div>• Historical performance: <strong className="text-slate-850 dark:text-white">94% on-time</strong></div>
                  <div>• Weather impact model: <strong className="text-slate-850 dark:text-white">No delays</strong></div>
                  <div>• Current issue severity: <strong className="text-slate-850 dark:text-white">{activeReport.severity}</strong></div>
                  <div>• Similar resolved items: <strong className="text-slate-850 dark:text-white">42 samples</strong></div>
                  <div>• Queue depth: <strong className="text-slate-850 dark:text-white">3rd in line</strong></div>
                </div>
              </div>
            )}

            {/* Recent Reports Queue with details and "Why" modal triggers */}
            <div className="space-y-4">
              <div className="flex justify-between items-center px-1">
                <h3 className="text-title-md font-bold text-slate-900 dark:text-white">Recent Area Reports</h3>
                <Link href="/reports" className="text-blue-600 dark:text-blue-400 text-xs font-bold hover:underline">
                  View All Reports
                </Link>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {displayReports.map((report) => (
                  <div 
                    key={report.reportId}
                    className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
                  >
                    <div className="w-full md:w-36 h-28 rounded-xl overflow-hidden flex-shrink-0 relative bg-slate-100 dark:bg-slate-900 border border-gray-150 dark:border-slate-800">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                        alt={report.title} 
                        src={getReportImage(report)}
                      />
                    </div>
                    
                    <div className="flex-grow min-w-0 flex flex-col justify-between">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                            report.severity === "critical"
                              ? "bg-red-500/10 text-red-500 border border-red-500/20"
                              : report.severity === "high"
                              ? "bg-orange-500/10 text-orange-500 border border-orange-500/20"
                              : "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                          }`}>
                            {report.severity} Priority
                          </span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold bg-slate-50 dark:bg-slate-900 px-1.5 py-0.5 rounded border border-gray-250 dark:border-slate-850">
                            {getLifecycleLabel(report.status)}
                          </span>
                        </div>
                        <h4 
                          onClick={() => router.push(`/reports/${report.reportId}`)}
                          className="text-sm font-bold text-slate-800 dark:text-white truncate cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                          {report.title}
                        </h4>
                        <p className="text-[10px] text-slate-550 dark:text-slate-400 truncate">
                          {report.location.address} &bull; Reported {getFormattedDate(report.createdAt)}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center justify-between border-t border-gray-100 dark:border-slate-850 pt-2.5 mt-2 gap-2 text-[10px]">
                        <div className="flex gap-4 text-slate-500 dark:text-slate-455 font-medium">
                          <span>Est. Resolution: <strong className="text-slate-800 dark:text-white">{report.estimatedResolution || "2 Days"}</strong></span>
                          <span>Trust Rating: <strong className="text-slate-800 dark:text-white">{report.trustScore || 85}%</strong></span>
                          <span>AI Conf: <strong className="text-slate-800 dark:text-white">{report.aiConfidence ? Math.round(report.aiConfidence * 100) : 95}%</strong></span>
                        </div>
                        <button
                          onClick={() => setExplainReport(report)}
                          className="text-xs text-blue-600 dark:text-blue-400 font-extrabold flex items-center gap-0.5 hover:underline focus:outline-none cursor-pointer"
                        >
                          Why?
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Smart Notification Preview List */}
            <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-gray-150 dark:border-slate-850 pb-2">Recent Notifications</h3>
              <div className="grid grid-cols-1 gap-2.5">
                {[
                  { desc: "Water leakage repair has started.", reportId: "RPT-2026-001", time: "Just now" },
                  { desc: "Road maintenance nearby may affect traffic today.", reportId: "RPT-2026-004", time: "15 minutes ago" },
                  { desc: "Your report has been merged with nearby reports.", reportId: "RPT-2026-004", time: "2 hours ago" },
                  { desc: "Authority uploaded repair evidence. Your verification is requested.", reportId: "RPT-2026-001", time: "Yesterday" }
                ].map((notif, idx) => (
                  <div 
                    key={idx}
                    onClick={() => router.push(`/reports/${notif.reportId}`)}
                    className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-gray-150 dark:border-slate-850 hover:border-blue-500/30 cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-base">🔔</span>
                      <p className="text-xs font-semibold text-slate-905 dark:text-slate-300 leading-snug">{notif.desc}</p>
                    </div>
                    <span className="text-[8px] text-slate-400 uppercase font-bold tracking-wider flex-shrink-0 ml-4">{notif.time}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Dashboard Sidebar Column */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Live City Snapshot dynamic map card */}
            <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm flex flex-col h-[320px] hover:translate-y-[-2px] transition-transform duration-200">
              <div className="p-4 border-b border-gray-150 dark:border-slate-850 flex items-center justify-between flex-shrink-0">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Live City Snapshot</h4>
                <Link href="/map" className="text-[10px] text-blue-600 dark:text-blue-400 font-bold hover:underline">
                  View Full Map
                </Link>
              </div>
              <div className="flex-grow relative bg-[#0a0f1d]">
                <MapView markers={mapMarkers} />
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-900/50 border-t border-gray-150 dark:border-slate-850 grid grid-cols-4 gap-1 text-[8px] font-bold text-center uppercase tracking-wider text-slate-500 flex-shrink-0">
                <div><span className="inline-block w-1.5 h-1.5 bg-red-500 rounded-full mr-1"></span> Critical</div>
                <div><span className="inline-block w-1.5 h-1.5 bg-yellow-500 rounded-full mr-1"></span> In Progress</div>
                <div><span className="inline-block w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></span> Resolved</div>
                <div><span className="inline-block w-1.5 h-1.5 bg-orange-500 rounded-full mr-1"></span> Risk Zone</div>
              </div>
            </div>

            {/* Ward Health Score Card */}
            <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 hover:translate-y-[-2px] transition-transform duration-200">
              <div className="border-b border-gray-150 dark:border-slate-850 pb-3">
                <span className="block text-[8px] uppercase tracking-widest font-black text-slate-400">Neighborhood Analytics</span>
                <h4 className="text-sm font-black text-slate-905 dark:text-white">Koramangala Ward 7</h4>
                
                <div className="flex justify-between items-baseline mt-3">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-slate-900 dark:text-white">84 / 100</span>
                    <span className="text-xs font-bold text-green-500">Good Health</span>
                  </div>
                  <span className="text-[10px] font-bold text-green-500">↑ Improved by 6 pts</span>
                </div>
              </div>

              <div className="space-y-3.5 text-[10px]">
                <div>
                  <div className="flex justify-between items-center mb-1 font-medium">
                    <span className="text-slate-600 dark:text-slate-400">Water Networks</span>
                    <span className="text-slate-800 dark:text-slate-200 font-bold">82%</span>
                  </div>
                  <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full rounded-full transition-all duration-500" style={{ width: "82%" }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1 font-medium">
                    <span className="text-slate-600 dark:text-slate-400">Road Quality</span>
                    <span className="text-slate-800 dark:text-slate-200 font-bold">68%</span>
                  </div>
                  <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="bg-orange-500 h-full rounded-full transition-all duration-500" style={{ width: "68%" }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1 font-medium">
                    <span className="text-slate-600 dark:text-slate-400">Electricity Networks</span>
                    <span className="text-slate-800 dark:text-slate-200 font-bold">85%</span>
                  </div>
                  <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: "85%" }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1 font-medium">
                    <span className="text-slate-600 dark:text-slate-400">Sanitation & Garbage</span>
                    <span className="text-slate-800 dark:text-slate-200 font-bold">72%</span>
                  </div>
                  <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: "72%" }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1 font-medium">
                    <span className="text-slate-600 dark:text-slate-400">Storm Drainage</span>
                    <span className="text-slate-800 dark:text-slate-200 font-bold">75%</span>
                  </div>
                  <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="bg-purple-600 h-full rounded-full transition-all duration-500" style={{ width: "75%" }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Live AI Activity Feed */}
            <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-gray-150 dark:border-slate-850 pb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Live AI Engine Operations</h4>
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
              </div>
              
              <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-1">
                {aiActivities.map((act) => (
                  <div key={act.id} className="flex gap-3 text-[10px] items-start hover:bg-slate-55 dark:hover:bg-slate-900/40 p-1.5 rounded-lg transition-colors">
                    <span className="material-symbols-outlined text-[14px] text-blue-600 dark:text-blue-400 mt-0.5">smart_toy</span>
                    <div className="flex-1 space-y-0.5">
                      <p className="font-semibold text-slate-700 dark:text-slate-300 leading-tight">{act.title}</p>
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">{act.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Community Impact Story Card (Celebrating Civic Actions) */}
            <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-gray-150 dark:border-slate-850 pb-2">Your Civic Impact Story</h4>
              
              <div className="space-y-3.5 text-xs">
                <div className="p-3 bg-blue-500/5 rounded-xl border border-blue-500/10 text-slate-700 dark:text-slate-355 leading-relaxed font-medium">
                  🎉 Priya, your reports have helped approximately <strong className="text-blue-600 dark:text-blue-400 font-black">1,420 neighbors</strong> and prevented an estimated <strong className="text-blue-600 dark:text-blue-400 font-black">18,000 litres</strong> of clean water loss in Koramangala Ward 7.
                </div>

                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-gray-150 dark:border-slate-850">
                    <span className="block text-xl font-extrabold text-blue-600 dark:text-blue-400">{totalReportsCount}</span>
                    <span className="text-[8px] text-slate-550 dark:text-slate-400 font-bold uppercase tracking-wider">Reports</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-gray-150 dark:border-slate-850">
                    <span className="block text-xl font-extrabold text-emerald-600">{solvedCount}</span>
                    <span className="text-[8px] text-slate-550 dark:text-slate-400 font-bold uppercase tracking-wider">Resolved</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-gray-150 dark:border-slate-850">
                    <span className="block text-xl font-extrabold text-blue-650">{verifiedCount}</span>
                    <span className="text-[8px] text-slate-550 dark:text-slate-400 font-bold uppercase tracking-wider">Verified</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-gray-150 dark:border-slate-850">
                    <span className="block text-xl font-extrabold text-blue-655">{supportsCount}</span>
                    <span className="text-[8px] text-slate-550 dark:text-slate-400 font-bold uppercase tracking-wider">Supports</span>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-gray-150 dark:border-slate-850 col-span-2 flex justify-between items-center px-4">
                    <div className="text-left">
                      <span className="block text-xs font-extrabold text-slate-855 dark:text-white">{impactPoints} pts</span>
                      <span className="text-[8px] text-slate-550 uppercase tracking-widest font-bold">Impact Points</span>
                    </div>
                    <div className="text-right">
                      <span className="block text-xs font-extrabold text-slate-855 dark:text-white">95%</span>
                      <span className="text-[8px] text-slate-555 uppercase tracking-widest font-bold">Trust Rating</span>
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-100/50 dark:bg-slate-900/50 border border-gray-150 dark:border-slate-850 rounded-xl col-span-2 text-left flex justify-between items-center text-xs">
                    <div>
                      <span className="block text-[8px] text-slate-550 uppercase tracking-widest font-bold">Contribution Badge</span>
                      <strong className="text-slate-855 dark:text-white font-black">City Guardian 👑</strong>
                    </div>
                    <div className="text-right">
                      <span className="block text-[8px] text-slate-555 uppercase tracking-widest font-bold">Community Rank</span>
                      <strong className="text-slate-855 dark:text-white font-black">Top 12%</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Neighborhood Activity Feed (What's Happening Nearby) */}
            <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-gray-150 dark:border-slate-850 pb-2">What&apos;s Happening Nearby</h4>
              
              <div className="space-y-4">
                {neighborhoodActivity.map((n) => (
                  <div key={n.id} className="flex gap-3 text-xs items-center hover:translate-x-1 transition-all duration-150">
                    <span className={`w-2.5 h-2.5 rounded-full ${n.color} flex-shrink-0 relative`}>
                      {n.status === "wip" && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>}
                    </span>
                    <div className="flex-grow">
                      <p className="font-bold text-slate-855 dark:text-white leading-tight">{n.text}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{n.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Protected Anonymous Reporting Privacy Assurance Banner (USP) */}
        <section className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center text-lg flex-shrink-0">🛡️</div>
            <div>
              <h4 className="text-sm font-bold text-slate-905 dark:text-white">Protected Anonymous Reporting</h4>
              <p className="text-xs text-slate-550 dark:text-slate-400 mt-0.5">
                Every report matters. Every citizen matters. Every identity is protected.
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-2 text-center text-[10px] font-bold text-slate-655 dark:text-slate-350">
            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-gray-150 dark:border-slate-850 flex flex-col items-center gap-1.5">
              <span>👤</span>
              <span>Hidden from Authorities</span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-gray-150 dark:border-slate-850 flex flex-col items-center gap-1.5">
              <span>🔑</span>
              <span>Hidden from Admins</span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-gray-150 dark:border-slate-850 flex flex-col items-center gap-1.5">
              <span>👥</span>
              <span>Hidden from Citizens</span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-gray-150 dark:border-slate-850 flex flex-col items-center gap-1.5">
              <span>🗺️</span>
              <span>Sanitized on Maps</span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-gray-150 dark:border-slate-850 flex flex-col items-center gap-1.5">
              <span>🤖</span>
              <span>Sanitized in Summaries</span>
            </div>
          </div>

          <div className="text-[10px] text-slate-555 bg-slate-100/50 dark:bg-slate-900/50 p-3 rounded-lg border border-dashed border-gray-250 dark:border-slate-800 text-center font-medium italic">
            Identity always displayed as &quot;Protected Anonymous&quot;. No Name, Phone, Email, Address, Avatar, or Citizen ID exposed.
          </div>
        </section>

      </main>

      {/* Explainable AI Dialog Modal */}
      {explainReport && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setExplainReport(null)}>
          <div 
            className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-850 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">insights</span>
                <h3 className="text-sm md:text-base font-extrabold text-slate-900 dark:text-white">Explainable AI Insights</h3>
              </div>
              <button 
                onClick={() => setExplainReport(null)}
                className="text-slate-400 hover:text-slate-650 dark:hover:text-white text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4 text-xs text-slate-650 dark:text-slate-350">
              <div>
                <p className="font-extrabold text-slate-900 dark:text-slate-200 uppercase tracking-wider text-[9px]">Why this priority ({explainReport.severity})?</p>
                <p className="mt-1 leading-relaxed">
                  Calculated using hazard density checks. The AI classified this priority to ensure pedestrian safety and coordinate street repair resources efficiently in {explainReport.location.ward || "the area"}.
                </p>
              </div>
              <div>
                <p className="font-extrabold text-slate-900 dark:text-slate-200 uppercase tracking-wider text-[9px]">Why this department ({explainReport.departmentAssigned || "BBMP"})?</p>
                <p className="mt-1 leading-relaxed">
                  Assigned directly based on issue keyword semantic mapping with municipal department division rules.
                </p>
              </div>
              <div>
                <p className="font-extrabold text-slate-900 dark:text-slate-200 uppercase tracking-wider text-[9px]">Why this ETA ({explainReport.estimatedResolution || "2 Days"})?</p>
                <p className="mt-1 leading-relaxed">
                  Calculated based on municipal department queue workload depth, current issue severity parameters, local weather forecast models, and historical response speed.
                </p>
              </div>
            </div>
            
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setExplainReport(null)}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Close Insights
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating AI Copilot FAB Only */}
      <div className="fixed bottom-24 right-6 md:bottom-8 md:right-8 z-[60]">
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
