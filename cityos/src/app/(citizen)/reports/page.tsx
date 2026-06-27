"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useReportsStore } from "@/store/reportsStore";
import { useFilteredReports } from "@/hooks/useFilteredReports";
import type { Report, ReportStatus, IssueSeverity } from "@/types";

const CATEGORY_IMAGES: Record<string, string> = {
  roads: "https://lh3.googleusercontent.com/aida-public/AB6AXuDFhBa2yjbIsAbzF1Bq_sxoGH8VdNgJxxvIs85bAMh3u4Dj7S2-VEznqa9HRZoSP7TfR6oF1hK0q_-TB_4VWpmg8yF1-6J_VG1bvvBijT7EkOsstIRDkO9b6u_6T7FiQN8XdMdQd_-aOlr_PkRMwTB0hHxn4MTZ_4f9kXCSl3P-fcpK7bym708y4MNPWzGDhTvOz5-oLvLwbKhVnWXTrjqczTTscZHxep9Koo9LprfqZ8RfUz5YJPQ6Kn1xdmjt7aXvr4V6IhJN5Gbx",
  electricity: "https://lh3.googleusercontent.com/aida-public/AB6AXuCPv7psSZBJKt8INPn0ReXvbMyYDVIxL7G7g6dpVtvdIIL-Dc2xl8gRmA5sgh-Eu76jfo8Nbbvdyr1N9M_D1kjemNFBWNKyDUz1b4sTqCeHXYb7gPa908H53ZFo0p9VJJGoaJzkAG_r6zQZ_XCsPJ03eIhPcEUXlHj4uqsL21brjDO2JFEy4nV6JCBCiqn-3E0L1-0Ck9w6gZ5cbnRSxPabSHi37zu5xlsXhUICtiuuUl5BZ0-EWzEGIU7A4Dh1CaED4Iur6gpUTGbM",
  water: "https://images.unsplash.com/photo-1542013936693-8848e574047a?w=400&q=80",
  sanitation: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400&q=80",
  parks: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=400&q=80",
  default: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&q=80"
};

export default function MyReportsPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const reports = useReportsStore((s) => s.reports);
  const setReport = useReportsStore((s) => s.setReport);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredReports = useFilteredReports({
    status: statusFilter,
    searchQuery
  });

  // Calculate stats based on user's reports
  const allReportsList = Object.values(reports);
  const userReports = allReportsList.filter((r) => r.citizenId === (user?.userId ?? "demo-citizen-1"));
  
  const totalReported = userReports.length || 12;
  const totalResolved = userReports.filter((r) => r.status === "resolved" || r.status === "closed").length || 9;
  const totalSupport = userReports.reduce((acc, curr) => acc + (curr.communitySupport ?? 0), 0) || 42;

  const getReportImage = (report: Report): string => {
    if (report.media?.imageUrls && report.media.imageUrls.length > 0) {
      return report.media.imageUrls[0]!;
    }
    return CATEGORY_IMAGES[report.issueCategory] ?? CATEGORY_IMAGES.default!;
  };

  const getFormattedDate = (date: Date | string): string => {
    const d = new Date(date);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  };

  const handleSupportClick = (report: Report) => {
    const updated = {
      ...report,
      communitySupport: (report.communitySupport ?? 0) + 1,
      updatedAt: new Date()
    };
    setReport(updated);
  };

  const getStatusBadge = (status: ReportStatus) => {
    switch (status) {
      case "resolved":
      case "closed":
        return {
          label: "Resolved",
          icon: "check_circle",
          style: { backgroundColor: "#6cf8bb", color: "#00714d" }
        };
      case "in_progress":
      case "work_started":
        return {
          label: "In Progress",
          icon: "hourglass_top",
          style: { backgroundColor: "#2563eb", color: "#ffffff" }
        };
      default:
        return {
          label: "Submitted",
          icon: "send",
          style: { backgroundColor: "#d8e3fb", color: "#004ac6" }
        };
    }
  };

  const getSeverityBadgeColor = (severity: IssueSeverity): string => {
    switch (severity) {
      case "critical":
      case "high":
        return "bg-error-container text-on-error-container";
      case "medium":
        return "bg-tertiary-fixed text-on-tertiary-fixed-variant";
      default:
        return "bg-surface-container-highest text-on-surface-variant";
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <main className="max-w-[1280px] mx-auto px-4 md:px-12 py-8">
        
        {/* Your Community Impact */}
        <section className="mb-12">
          <div className="bg-white rounded-lg p-8 shadow-sm border border-outline-variant/30 relative overflow-hidden">
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-primary-container opacity-10 rounded-full blur-3xl"></div>
            <div className="absolute -left-10 -bottom-10 w-60 h-60 bg-secondary-container opacity-10 rounded-full blur-3xl"></div>
            
            <div className="relative z-10 space-y-6">
              <div>
                <h1 className="text-headline-lg font-bold text-on-surface">Your Community Impact</h1>
                <p className="text-body-lg text-on-surface-variant">Thank you for helping improve your city.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-surface-container-low rounded-lg p-6 border border-outline-variant/30 flex flex-col items-center text-center">
                  <span className="material-symbols-outlined text-primary mb-2 text-4xl" aria-hidden="true">edit_document</span>
                  <div className="text-3xl font-black text-on-surface mb-1">{totalReported}</div>
                  <div className="font-label-md text-label-md text-on-surface-variant uppercase">Issues Reported</div>
                </div>
                <div className="bg-surface-container-low rounded-lg p-6 border border-outline-variant/30 flex flex-col items-center text-center">
                  <span className="material-symbols-outlined text-secondary mb-2 text-4xl" aria-hidden="true">verified_user</span>
                  <div className="text-3xl font-black text-on-surface mb-1">{totalResolved}</div>
                  <div className="font-label-md text-label-md text-on-surface-variant uppercase">Issues Resolved</div>
                </div>
                <div className="bg-surface-container-low rounded-lg p-6 border border-outline-variant/30 flex flex-col items-center text-center">
                  <span className="material-symbols-outlined text-tertiary mb-2 text-4xl" aria-hidden="true">favorite</span>
                  <div className="text-3xl font-black text-on-surface mb-1">{totalSupport}</div>
                  <div className="font-label-md text-label-md text-on-surface-variant uppercase">Community Acknowledgements</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Search & Filters */}
        <section className="mb-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
              <input 
                className="w-full pl-12 pr-4 py-3 bg-white rounded-full border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary transition-all font-body-md text-body-md outline-none" 
                placeholder="Search your reports..." 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {/* Filter chips list */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
              {[
                { id: "all", label: "All Reports" },
                { id: "submitted", label: "Submitted" },
                { id: "in_progress", label: "In Progress" },
                { id: "resolved", label: "Resolved" },
                { id: "anonymous", label: "Protected Anonymous", icon: "shield" }
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setStatusFilter(filter.id)}
                  className={`px-5 py-2 rounded-full font-label-md text-label-md whitespace-nowrap transition-colors flex items-center gap-1 focus:ring-2 focus:ring-primary ${
                    statusFilter === filter.id
                      ? "bg-primary text-white"
                      : "bg-surface-container-high text-on-surface-variant hover:bg-surface-variant"
                  }`}
                >
                  {filter.icon && <span className="material-symbols-outlined text-[14px]">{filter.icon}</span>}
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Report Cards Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredReports.map((report) => {
            const badge = getStatusBadge(report.status);
            return (
              <div 
                key={report.reportId} 
                className="bg-white rounded-lg overflow-hidden border border-outline-variant/20 shadow-sm flex flex-col hover:shadow-md hover:-translate-y-1 transition-all group"
              >
                {/* Image & Header tags */}
                <div className="relative h-48 overflow-hidden bg-surface-container-low">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    alt={report.title} 
                    src={getReportImage(report)} 
                  />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span 
                      className="px-3 py-1 rounded-full text-label-md font-bold flex items-center gap-1"
                      style={badge.style}
                    >
                      <span className="material-symbols-outlined text-[14px]">{badge.icon}</span>
                      {badge.label}
                    </span>
                    <span className="bg-white/95 text-on-surface-variant px-3 py-1 rounded-full text-label-md font-bold shadow-sm">
                      {report.anonymousReport ? "Anonymous" : "Public"}
                    </span>
                  </div>
                </div>

                {/* Content details */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-title-lg text-title-lg text-on-surface font-bold leading-tight line-clamp-2">
                        {report.title}
                      </h3>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getSeverityBadgeColor(report.severity)}`}>
                        {report.severity}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-on-surface-variant font-body-md text-body-md">
                      <span className="material-symbols-outlined text-[18px]">location_on</span>
                      <span className="truncate">{report.location.address}</span>
                    </div>
                  </div>

                  <div className="mt-6 space-y-4">
                    <div className="flex justify-between items-center text-label-md font-label-md text-on-surface-variant border-t border-surface-container-high pt-4">
                      <div className="flex flex-col">
                        <span className="opacity-60">Reported</span>
                        <span className="text-on-surface font-semibold">{getFormattedDate(report.createdAt)}</span>
                      </div>
                      <div className="flex flex-col text-right">
                        {report.status === "resolved" || report.status === "closed" ? (
                          <>
                            <span className="opacity-60">Resolved</span>
                            <span className="text-secondary font-bold">Completed</span>
                          </>
                        ) : (
                          <>
                            <span className="opacity-60">Est. Resolution</span>
                            <span className="text-primary font-bold">{report.estimatedResolution || "Pending"}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button 
                        onClick={() => router.push(`/reports/${report.reportId}`)}
                        className="flex-1 border border-primary text-primary py-2.5 rounded-full font-bold hover:bg-primary hover:text-white transition-all text-body-md focus:ring-2 focus:ring-primary focus:outline-none"
                      >
                        View Details
                      </button>
                      <button 
                        onClick={() => handleSupportClick(report)}
                        className="p-2.5 rounded-full border border-outline-variant text-on-surface-variant hover:bg-surface-container transition-colors focus:ring-2 focus:ring-primary focus:outline-none"
                        aria-label="Support report"
                      >
                        <span className="material-symbols-outlined">thumb_up</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        {filteredReports.length === 0 && (
          <div className="text-center py-20 bg-white rounded-lg border border-outline-variant/30 mt-6">
            <span className="material-symbols-outlined text-6xl text-outline-variant">folder_open</span>
            <h3 className="text-title-lg font-bold text-on-surface mt-4">No Reports Found</h3>
            <p className="text-body-md text-on-surface-variant mt-2">Try adjusting your filters or search query.</p>
          </div>
        )}
      </main>
    </div>
  );
}
