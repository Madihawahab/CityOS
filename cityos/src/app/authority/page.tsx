"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useAuthStore } from "@/store/authStore";
import { useReportsStore } from "@/store/reportsStore";
import { useAuthorityDashboard } from "@/hooks/useAuthorityDashboard";
import { mockDepartments } from "@/lib/mock/departments";
import { auditLogger, AUDIT_ACTIONS } from "@/lib/logger/auditLogger";
import type { Report } from "@/types";

// Dynamic import of Leaflet MapView (no SSR)
const MapView = dynamic(
  () => import("@/components/map/MapView").then((mod) => mod.MapView),
  {
    ssr: false,
    loading: () => (
      <div className="h-[400px] w-full bg-slate-900 rounded-xl animate-pulse flex items-center justify-center text-slate-500">
        Loading Map Infrastructure...
      </div>
    ),
  }
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
    return report.media.imageUrls[0] || CATEGORY_IMAGES.default!;
  }
  return CATEGORY_IMAGES[report.issueCategory] ?? CATEGORY_IMAGES.default!;
}

export default function AuthorityDashboardPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const setReport = useReportsStore((s) => s.setReport);

  const {
    selectedDepartment,
    setSelectedDepartment,
    activeTab,
    setActiveTab,
    kpis,
    filteredReports,
    mapMarkers,
  } = useAuthorityDashboard();

  const [dateString, setDateString] = useState("");
  const [showDeptDropdown, setShowDeptDropdown] = useState(false);

  useEffect(() => {
    // Avoid hydration mismatch by formatting date in client
    const d = new Date();
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const timer = setTimeout(() => {
      setDateString(`${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleStartWork = (report: Report) => {
    // 1. Log audit trail
    auditLogger.log({
      userId: user?.userId || "demo-authority-1",
      role: "authority",
      action: AUDIT_ACTIONS.WORK_STARTED,
      target: report.reportId,
    });

    // 2. Update report status to work_started in store
    setReport({
      ...report,
      status: "work_started",
      updatedAt: new Date(),
    });

    // 3. Navigate to repair submission page
    router.push(`/authority/issues/${report.reportId}/repair`);
  };

  const handleMarkerClick = (reportId: string) => {
    router.push(`/authority/issues/${reportId}`);
  };

  return (
    <div className="p-8 space-y-8 bg-[#0a0f1c] min-h-screen text-slate-100">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Good morning, {user?.fullName || "Ramesh"} 👋</h2>
          <p className="text-slate-400 text-sm">Here&apos;s your department overview and assigned work for today.</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3 px-3 py-1.5 bg-[#161e31] rounded-lg border border-slate-800 text-xs text-slate-300">
            <span className="material-symbols-outlined text-[16px]">calendar_today</span>
            {dateString || "Loading date..."}
          </div>
          <div className="flex items-center gap-3 px-3 py-1.5 bg-[#161e31] rounded-lg border border-slate-800 text-xs text-slate-300">
            <span className="material-symbols-outlined text-[16px]">wb_sunny</span>
            31°C <span className="text-slate-500">Partly Cloudy</span>
          </div>

          {/* Department Selector */}
          <div className="relative">
            <button
              onClick={() => setShowDeptDropdown(!showDeptDropdown)}
              className="flex items-center gap-2 pl-4 border-l border-slate-800 text-left focus:outline-none"
              aria-expanded={showDeptDropdown}
              aria-haspopup="listbox"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-500">
                <span className="material-symbols-outlined text-[20px]">corporate_fare</span>
              </div>
              <div>
                <p className="text-[9px] text-slate-500 uppercase leading-none">Department</p>
                <p className="text-xs font-semibold text-white flex items-center gap-1">
                  {selectedDepartment}
                  <span className="material-symbols-outlined text-[12px]">keyboard_arrow_down</span>
                </p>
              </div>
            </button>

            {showDeptDropdown && (
              <ul
                className="absolute right-0 mt-2 w-64 bg-[#12192c] border border-slate-800 rounded-xl shadow-lg z-50 py-1"
                role="listbox"
              >
                {mockDepartments.map((dept) => (
                  <li key={dept.departmentId}>
                    <button
                      onClick={() => {
                        setSelectedDepartment(dept.departmentName);
                        setShowDeptDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-xs hover:bg-white/5 transition-colors ${
                        selectedDepartment === dept.departmentName ? "text-blue-400 font-semibold" : "text-slate-300"
                      }`}
                      role="option"
                      aria-selected={selectedDepartment === dept.departmentName}
                    >
                      {dept.departmentName}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </header>

      {/* KPI Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" aria-label="KPI Cards">
        {/* Card 1 */}
        <div className="bg-[#12192c] p-5 rounded-2xl border border-slate-800/50 flex gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
            <span className="material-symbols-outlined text-[24px]">assignment</span>
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Assigned Today</p>
            <p className="text-2xl font-bold text-white">{kpis.assignedToday}</p>
            <p className="text-[10px] text-green-500"><span className="font-bold">+4</span> from yesterday</p>
          </div>
        </div>
        {/* Card 2 */}
        <div className="bg-[#12192c] p-5 rounded-2xl border border-slate-800/50 flex gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
            <span className="material-symbols-outlined text-[24px]">pending_actions</span>
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">In Progress</p>
            <p className="text-2xl font-bold text-white">{kpis.inProgress}</p>
            <p className="text-[10px] text-red-400 font-medium">2 overdue</p>
          </div>
        </div>
        {/* Card 3 */}
        <div className="bg-[#12192c] p-5 rounded-2xl border border-slate-800/50 flex gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500">
            <span className="material-symbols-outlined text-[24px]">task_alt</span>
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Completed Today</p>
            <p className="text-2xl font-bold text-white">{kpis.completedToday}</p>
            <p className="text-[10px] text-green-500"><span className="font-bold">+3</span> from yesterday</p>
          </div>
        </div>
        {/* Card 4 */}
        <div className="bg-[#12192c] p-5 rounded-2xl border border-slate-800/50 flex gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
            <span className="material-symbols-outlined text-[24px]">schedule</span>
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Avg. Resolution Time</p>
            <p className="text-2xl font-bold text-white">
              {kpis.avgResolutionTime} <span className="text-sm font-normal text-slate-500">hrs</span>
            </p>
            <p className="text-[10px] text-green-500"><span className="font-bold">-0.8 hrs</span> improvement</p>
          </div>
        </div>
      </section>

      {/* Middle Layout Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Today's Work Queue (col-span-7) */}
        <section className="col-span-12 lg:col-span-7 bg-[#12192c] rounded-2xl border border-slate-800/50 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <h3 className="font-bold text-lg text-white">Today&apos;s Work Queue</h3>
              <span className="text-sm text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded font-semibold">
                {filteredReports.length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Sort by:</span>
              <button className="text-xs font-semibold text-slate-300 flex items-center gap-1 focus:outline-none">
                Priority <span className="material-symbols-outlined text-[14px]">expand_more</span>
              </button>
            </div>
          </div>

          {/* Filters tabs */}
          <div className="flex gap-2 mb-4 border-b border-slate-800 pb-4">
            {["all", "high", "medium", "low"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-all ${
                  activeTab === tab
                    ? "bg-blue-600 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* List items */}
          <div className="space-y-3 flex-1 overflow-y-auto max-h-[480px] pr-2">
            {filteredReports.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-sm">
                No active issues assigned to this category/department.
              </div>
            ) : (
              filteredReports.map((report) => {
                const img = getReportImage(report);
                const score = report.trustScore || 85;
                const verbalRating = score >= 90 ? "Very High" : score >= 75 ? "High" : score >= 50 ? "Medium" : "Low";
                const estRes = report.estimatedResolution || "1 Day";
                const isWorkStarted = report.status === "work_started" || report.status === "in_progress";
                const isResolved = report.status === "resolved" || report.status === "closed";
                const isSubmitted = report.status === "evidence_uploaded" || report.status === "ai_verifying_repair";

                return (
                  <div
                    key={report.reportId}
                    className="flex flex-col sm:flex-row sm:items-center gap-4 p-3 bg-[#1a2337]/50 hover:bg-[#1a2337] rounded-xl border border-transparent hover:border-slate-800 transition-all"
                  >
                    <Link href={`/authority/issues/${report.reportId}`} className="flex-shrink-0">
                      <img
                        alt={report.title}
                        className="w-12 h-12 rounded-lg object-cover cursor-pointer hover:opacity-85 transition-opacity"
                        src={img}
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                            report.severity === "critical"
                              ? "bg-red-500/10 text-red-400"
                              : report.severity === "high"
                              ? "bg-orange-500/10 text-orange-400"
                              : report.severity === "medium"
                              ? "bg-blue-500/10 text-blue-400"
                              : "bg-green-500/10 text-green-400"
                          }`}
                        >
                          {report.severity}
                        </span>
                        <Link href={`/authority/issues/${report.reportId}`}>
                          <h4 className="text-sm font-semibold truncate hover:underline text-white cursor-pointer">
                            {report.title}
                          </h4>
                        </Link>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate">{report.location.address}</p>
                    </div>

                    <div className="flex items-center gap-6 sm:justify-end">
                      <div className="text-left sm:text-right">
                        <p className="text-[9px] text-slate-500 uppercase leading-none mb-1">AI Priority</p>
                        <p className="text-sm font-bold text-white">
                          {score}{" "}
                          <span className="text-[8px] text-green-400 font-medium ml-0.5">{verbalRating}</span>
                        </p>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="text-[9px] text-slate-500 uppercase leading-none mb-1">Est. Resolution</p>
                        <p className="text-xs font-bold text-white">
                          {estRes}{" "}
                          <span className="text-[8px] text-slate-400 font-normal ml-0.5">0.6 km</span>
                        </p>
                      </div>
                      <div className="sm:pl-2">
                        {isResolved ? (
                          <span className="text-xs text-green-400 font-semibold px-4 py-1.5 block bg-green-500/10 rounded-lg text-center">
                            Resolved
                          </span>
                        ) : isSubmitted ? (
                          <span className="text-xs text-blue-400 font-semibold px-3 py-1.5 block bg-blue-500/10 rounded-lg text-center animate-pulse">
                            Verifying...
                          </span>
                        ) : isWorkStarted ? (
                          <button
                            onClick={() => router.push(`/authority/issues/${report.reportId}/repair`)}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                          >
                            Submit Evidence
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStartWork(report)}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                          >
                            Start Work
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* City Map Live Widget (col-span-5) */}
        <section className="col-span-12 lg:col-span-5 bg-[#12192c] rounded-2xl border border-slate-800/50 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg text-white">City Map (Live)</h3>
            <span className="flex items-center gap-1.5 text-[10px] text-green-500 font-bold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> Live
            </span>
          </div>

          <div className="flex-1 relative border border-slate-800 rounded-xl overflow-hidden min-h-[360px]">
            {/* Lazy Loaded Dynamic Map */}
            <MapView
              markers={mapMarkers}
              height="360px"
              onMarkerClick={handleMarkerClick}
              className="w-full h-full"
            />
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
            <div className="flex gap-4">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#ba1a1a]" /> Critical</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#784b00]" /> High</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#004ac6]" /> Medium</span>
            </div>
            <Link
              href="/authority/performance"
              className="text-blue-500 font-medium hover:underline flex items-center gap-1"
            >
              Performance Metrics <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
