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

// Mini Timeline Component
function MiniTimeline({ status }: { status: ReportStatus }) {
  const stages = [
    { key: "submitted", label: "Submitted" },
    { key: "ai_verified", label: "AI Verified", activeKeys: ["ai_processing", "ai_verified", "assigned", "in_progress", "work_started", "evidence_uploaded", "ai_verifying_repair", "citizen_verification_pending", "resolved", "closed"] },
    { key: "assigned", label: "Assigned", activeKeys: ["assigned", "in_progress", "work_started", "evidence_uploaded", "ai_verifying_repair", "citizen_verification_pending", "resolved", "closed"] },
    { key: "work_started", label: "Work Started", activeKeys: ["work_started", "evidence_uploaded", "ai_verifying_repair", "citizen_verification_pending", "resolved", "closed"] },
    { key: "resolved", label: "Resolved", activeKeys: ["resolved", "closed"] }
  ];

  return (
    <div className="flex items-center justify-between w-full mt-4 pt-4 border-t border-surface-container-highest">
      {stages.map((stage, idx) => {
        const isCompleted = stage.activeKeys ? stage.activeKeys.includes(status) : true; // submitted is always true
        const isCurrent = (status === stage.key) || 
                          (status === "in_progress" && stage.key === "assigned") || 
                          (status === "evidence_uploaded" && stage.key === "work_started") ||
                          (status === "citizen_verification_pending" && stage.key === "work_started") ||
                          (status === "closed" && stage.key === "resolved");

        return (
          <div key={stage.key} className="flex flex-col items-center flex-1 relative group">
            <div className={`w-3 h-3 rounded-full mb-1 z-10 transition-colors ${isCurrent ? 'bg-primary ring-2 ring-primary/30' : isCompleted ? 'bg-primary' : 'bg-surface-container-highest'}`} />
            {idx < stages.length - 1 && (
              <div className={`absolute top-1.5 left-1/2 w-full h-[2px] -z-0 ${isCompleted && (stages[idx+1]?.activeKeys?.includes(status)) ? 'bg-primary' : 'bg-surface-container-highest'}`} />
            )}
            <span className={`text-[9px] font-bold uppercase tracking-wider text-center ${isCurrent ? 'text-primary' : isCompleted ? 'text-on-surface' : 'text-on-surface-variant/50'}`}>
              {stage.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function MyReportsPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const reports = useReportsStore((s) => s.reports);
  const setReport = useReportsStore((s) => s.setReport);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "priority" | "updated" | "supported">("newest");

  const filteredReports = useFilteredReports({
    status: statusFilter,
    searchQuery,
    sortBy
  });

  // Calculate stats based on user's reports
  const allReportsList = Object.values(reports);
  const userReports = allReportsList.filter((r) => r.citizenId === (user?.userId ?? "demo-citizen-1"));
  
  const totalReported = userReports.length || 12;
  const totalResolved = userReports.filter((r) => r.status === "resolved" || r.status === "closed").length || 9;
  const totalSupport = userReports.reduce((acc, curr) => acc + (curr.communitySupport ?? 0), 0) || 42;
  
  // Use stored report data where possible for "People Benefited"
  const peopleBenefited = userReports.reduce((acc, curr) => {
    // If the data provides nearby reports count, we can use that to estimate local impact.
    // Otherwise fallback to a modest baseline per report (e.g. 5 neighbors).
    const impactVal = curr.analysis?.civicIntelligence?.nearbyReportsCount ? curr.analysis.civicIntelligence.nearbyReportsCount * 5 : 5;
    return acc + impactVal;
  }, 0) || 215;

  // Civic Profile derivations (These should ideally live in the User object, derived here for demonstration)
  const impactPoints = (totalResolved * 50) + (totalSupport * 10);
  const trustScoreAvg = userReports.length > 0 
    ? Math.round(userReports.reduce((acc, curr) => acc + (curr.analysis?.trustEngine?.trustScore ?? 90), 0) / userReports.length)
    : 92;
  
  let currentBadge = "Active Citizen";
  if (totalResolved >= 10) currentBadge = "Community Champion";
  else if (totalResolved >= 5) currentBadge = "City Guardian";

  const getReportImage = (report: Report): string => {
    if (report.media?.imageUrls && report.media.imageUrls.length > 0) {
      return report.media.imageUrls[0]!;
    }
    return CATEGORY_IMAGES[report.issueCategory] ?? CATEGORY_IMAGES.default!;
  };

  const handleSupportClick = (report: Report) => {
    const updated: Report = {
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
        return { label: "Resolved", icon: "check_circle", style: { backgroundColor: "#6cf8bb", color: "#00714d" } };
      case "citizen_verification_pending":
        return { label: "Verification Needed", icon: "fact_check", style: { backgroundColor: "#fef08a", color: "#854d0e" } };
      case "in_progress":
      case "work_started":
        return { label: "In Progress", icon: "hourglass_top", style: { backgroundColor: "#2563eb", color: "#ffffff" } };
      default:
        return { label: "Active", icon: "pending", style: { backgroundColor: "#d8e3fb", color: "#004ac6" } };
    }
  };

  const getSeverityBadgeColor = (severity: IssueSeverity): string => {
    switch (severity) {
      case "critical":
      case "high": return "bg-error-container text-on-error-container";
      case "medium": return "bg-tertiary-fixed text-on-tertiary-fixed-variant";
      default: return "bg-surface-container-highest text-on-surface-variant";
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <main className="max-w-[1280px] mx-auto px-4 md:px-12 py-8">
        
        {/* Civic Profile & Impact Summary */}
        <section className="mb-8">
          <div className="bg-surface-container-low rounded-3xl p-8 shadow-sm border border-outline-variant/30 relative overflow-hidden flex flex-col md:flex-row gap-8 items-center md:items-stretch">
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-primary-container opacity-10 rounded-full blur-3xl"></div>
            <div className="absolute -left-10 -bottom-10 w-60 h-60 bg-secondary-container opacity-10 rounded-full blur-3xl"></div>
            
            {/* Civic Profile Section */}
            <div className="flex flex-col items-center justify-center p-6 bg-surface rounded-2xl border border-outline-variant/30 w-full md:w-1/3 relative z-10">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-4 border-4 border-surface shadow-sm">
                 <span className="material-symbols-outlined text-5xl text-primary">social_leaderboard</span>
              </div>
              <h2 className="text-title-lg font-bold text-on-surface">{user?.fullName || "Sarah Jenkins"}</h2>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-3 py-1 bg-tertiary-container text-on-tertiary-container rounded-full text-label-md font-bold uppercase tracking-wider flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">stars</span>
                  {currentBadge}
                </span>
              </div>
              <div className="mt-6 flex justify-between w-full text-center px-4">
                <div>
                  <div className="text-xl font-black text-on-surface">{impactPoints}</div>
                  <div className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">Impact Pts</div>
                </div>
                <div className="w-[1px] h-full bg-outline-variant/30"></div>
                <div>
                  <div className="text-xl font-black text-primary">{trustScoreAvg}%</div>
                  <div className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">Trust Score</div>
                </div>
              </div>
            </div>

            {/* Impact Overview Section */}
            <div className="flex-1 flex flex-col justify-center relative z-10 w-full">
              <h1 className="text-display-sm font-bold text-on-surface mb-2">My Civic Contributions</h1>
              <p className="text-body-lg text-on-surface-variant mb-6">Your reports are directly improving city infrastructure.</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-surface rounded-xl p-4 border border-outline-variant/20 flex flex-col hover:-translate-y-1 transition-transform">
                  <span className="material-symbols-outlined text-on-surface-variant mb-1 text-2xl">edit_document</span>
                  <div className="text-2xl font-black text-on-surface">{totalReported}</div>
                  <div className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider">Submitted</div>
                </div>
                <div className="bg-surface rounded-xl p-4 border border-outline-variant/20 flex flex-col hover:-translate-y-1 transition-transform">
                  <span className="material-symbols-outlined text-secondary mb-1 text-2xl">verified</span>
                  <div className="text-2xl font-black text-on-surface">{totalResolved}</div>
                  <div className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider">Resolved</div>
                </div>
                <div className="bg-surface rounded-xl p-4 border border-outline-variant/20 flex flex-col hover:-translate-y-1 transition-transform">
                  <span className="material-symbols-outlined text-tertiary mb-1 text-2xl">favorite</span>
                  <div className="text-2xl font-black text-on-surface">{totalSupport}</div>
                  <div className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider">Support</div>
                </div>
                <div className="bg-surface rounded-xl p-4 border border-outline-variant/20 flex flex-col hover:-translate-y-1 transition-transform">
                  <span className="material-symbols-outlined text-primary mb-1 text-2xl">groups</span>
                  <div className="text-2xl font-black text-on-surface">{peopleBenefited.toLocaleString()}</div>
                  <div className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider">Benefited</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Civic Journey & Contextual Insights */}
        {userReports.length > 0 && (
          <section className="mb-10 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-primary/5 rounded-2xl p-6 border border-primary/20 flex items-start gap-4">
              <span className="material-symbols-outlined text-3xl text-primary">insights</span>
              <div>
                <h3 className="text-title-md font-bold text-on-surface mb-1">AI Contextual Insight</h3>
                <p className="text-body-sm text-on-surface-variant">
                  {userReports[0]?.analysis?.civicIntelligence?.wardRiskIndex 
                    ? `Your recent reports in Ward ${userReports[0]?.location.ward} have helped lower the area's risk index. Thank you for staying proactive!`
                    : "Your ongoing contributions are improving AI resource allocation across the city by helping identify critical infrastructure trends early."}
                </p>
              </div>
            </div>
            <div className="bg-tertiary-container/30 rounded-2xl p-6 border border-tertiary/20 flex items-start gap-4">
              <span className="material-symbols-outlined text-3xl text-tertiary">route</span>
              <div className="w-full">
                <h3 className="text-title-md font-bold text-on-surface mb-1">Civic Journey</h3>
                <div className="flex justify-between text-label-sm text-on-surface-variant font-bold mb-2 uppercase tracking-wider">
                  <span>{currentBadge}</span>
                  <span>Next: {totalResolved < 5 ? "City Guardian" : totalResolved < 10 ? "Community Champion" : "Civic Leader"}</span>
                </div>
                <div className="w-full bg-surface-container-highest rounded-full h-2 overflow-hidden">
                  <div className="bg-tertiary h-full rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, (totalResolved % 5) * 20)}%` }}></div>
                </div>
                <p className="text-[11px] text-on-surface-variant mt-2 text-right">{5 - (totalResolved % 5)} more resolutions to rank up.</p>
              </div>
            </div>
          </section>
        )}

        {/* Search & Filters */}
        <section className="mb-8 space-y-4">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
            
            {/* Filter chips list */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 xl:pb-0 no-scrollbar flex-1">
              {[
                { id: "all", label: "All Contributions" },
                { id: "active", label: "Active" },
                { id: "verification_pending", label: "Action Needed" },
                { id: "resolved", label: "Resolved" },
                { id: "supported", label: "Supported" }
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setStatusFilter(filter.id)}
                  className={`px-5 py-2.5 rounded-full font-label-md text-label-md whitespace-nowrap transition-colors flex items-center gap-1 focus:ring-2 focus:ring-primary ${
                    statusFilter === filter.id
                      ? "bg-primary text-white"
                      : "bg-surface-container-low border border-outline-variant/30 text-on-surface hover:bg-surface-container"
                  }`}
                >
                  {filter.label}
                  {filter.id === "verification_pending" && <span className="flex w-2 h-2 rounded-full bg-error ml-1 animate-pulse"></span>}
                </button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
              <div className="relative w-full sm:flex-1 min-w-[240px]">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
                <input 
                  className="w-full pl-12 pr-4 py-2.5 bg-surface-container-low text-on-surface placeholder:text-on-surface-variant/60 font-semibold rounded-full border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary transition-all font-body-sm text-body-sm outline-none shadow-sm" 
                  placeholder="Search ID, keyword, ward..." 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="relative w-full sm:w-auto">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as "newest" | "oldest" | "priority" | "updated" | "supported")}
                  className="w-full sm:w-auto appearance-none pl-4 pr-10 py-2.5 bg-surface-container-low text-on-surface font-semibold rounded-full border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary transition-all font-body-sm text-body-sm outline-none shadow-sm cursor-pointer"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="priority">Highest Priority</option>
                  <option value="updated">Recently Updated</option>
                  <option value="supported">Most Supported</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">expand_more</span>
              </div>
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
                className="bg-surface-container-low rounded-3xl overflow-hidden border border-outline-variant/30 shadow-sm flex flex-col hover:shadow-lg hover:-translate-y-1 transition-all group relative"
              >
                {/* Image & Header tags */}
                <div className="relative h-48 overflow-hidden bg-surface-container-low">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                    alt={report.title} 
                    src={getReportImage(report)} 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                  
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    <span 
                      className="px-3 py-1 rounded-full text-label-sm font-bold flex items-center gap-1 shadow-md w-fit"
                      style={badge.style}
                    >
                      <span className="material-symbols-outlined text-[14px]">{badge.icon}</span>
                      {badge.label}
                    </span>
                    {report.anonymousReport && (
                      <span className="bg-surface-container-highest/90 text-on-surface px-3 py-1 rounded-full text-[10px] font-bold shadow-md border border-outline-variant/30 backdrop-blur-md uppercase w-fit">
                        Anonymous
                      </span>
                    )}
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex justify-between items-end">
                      <h3 className="font-title-lg text-white font-bold leading-tight line-clamp-2 drop-shadow-md">
                        {report.title}
                      </h3>
                    </div>
                  </div>
                </div>

                {/* Content details */}
                <div className="p-6 flex-1 flex flex-col justify-between relative bg-surface-container-low">
                  {/* Floating Action Button for Support */}
                  <button 
                    onClick={() => handleSupportClick(report)}
                    className="absolute -top-6 right-6 w-12 h-12 rounded-full bg-surface shadow-md flex items-center justify-center border border-outline-variant/20 hover:bg-surface-container hover:scale-105 transition-all text-on-surface focus:ring-2 focus:ring-primary focus:outline-none z-10 group/btn"
                    aria-label="Support report"
                  >
                    <span className="material-symbols-outlined group-hover/btn:text-tertiary transition-colors">thumb_up</span>
                  </button>

                  <div className="space-y-5">
                    <div className="flex justify-between items-center text-label-sm font-bold uppercase tracking-wider text-on-surface-variant">
                      <div className="flex items-center gap-1 bg-surface-container py-1 px-2 rounded-md border border-outline-variant/30">
                        <span className="material-symbols-outlined text-[14px]">{report.analysis?.trustEngine?.trustScore && report.analysis.trustEngine.trustScore > 80 ? 'verified' : 'analytics'}</span>
                        <span>Trust: {report.analysis?.trustEngine?.trustScore ?? '90'}</span>
                      </div>
                      <span className={`px-2 py-1 rounded-md ${getSeverityBadgeColor(report.severity)}`}>
                        {report.severity}
                      </span>
                    </div>

                    <div className="flex items-start gap-2 text-on-surface-variant text-body-sm font-medium">
                      <span className="material-symbols-outlined text-[18px] text-primary shrink-0 mt-0.5">location_on</span>
                      <span className="line-clamp-2">{report.location.address} {report.location.ward ? `(Ward ${report.location.ward})` : ''}</span>
                    </div>
                    
                    {/* Impact of this Report (Contextual AI Insight specific to card) */}
                    <div className="bg-surface rounded-xl p-3 border border-outline-variant/30 text-body-sm text-on-surface-variant">
                      <div className="flex items-center gap-1 mb-1 font-bold text-on-surface">
                        <span className="material-symbols-outlined text-[16px] text-secondary">public</span>
                        Report Impact
                      </div>
                      <p className="line-clamp-2">
                        {report.analysis?.civicIntelligence?.communityImpact 
                          ? report.analysis.civicIntelligence.communityImpact
                          : `Identified ${report.issueCategory} infrastructure vulnerability, helping prevent potential safety risks for nearby residents.`}
                      </p>
                    </div>

                    <div className="flex justify-between items-center text-label-md text-on-surface-variant bg-surface-container p-3 rounded-xl border border-outline-variant/20">
                      <div className="flex flex-col">
                        <span className="opacity-70 text-[10px] uppercase font-bold tracking-wider">Dept</span>
                        <span className="text-on-surface font-semibold truncate max-w-[120px]">{report.departmentAssigned || 'Routing...'}</span>
                      </div>
                      <div className="flex flex-col text-right">
                        <span className="opacity-70 text-[10px] uppercase font-bold tracking-wider">Target Resolution</span>
                        <span className={`font-bold ${report.status === 'resolved' || report.status === 'closed' ? 'text-secondary' : 'text-primary'}`}>
                          {report.status === "resolved" || report.status === "closed" ? "Completed" : report.estimatedResolution || "Pending"}
                        </span>
                      </div>
                    </div>
                    
                    {/* Mini Timeline Inline Component */}
                    <MiniTimeline status={report.status} />
                  </div>

                  <div className="mt-6 flex gap-3 pt-4 border-t border-surface-container-highest">
                    <button 
                      onClick={() => router.push(`/reports/${report.reportId}`)}
                      className="flex-1 bg-surface-container-high text-on-surface border border-outline-variant/30 py-2.5 rounded-full font-bold hover:bg-primary hover:text-white transition-all text-label-lg focus:ring-2 focus:ring-primary focus:outline-none"
                    >
                      View Details
                    </button>
                    {report.status === "citizen_verification_pending" && (
                      <button 
                        onClick={() => router.push(`/reports/${report.reportId}`)}
                        className="flex-1 bg-primary text-white py-2.5 rounded-full font-bold hover:bg-primary/90 transition-all text-label-lg shadow-sm"
                      >
                        Verify Repair
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        {filteredReports.length === 0 && (
          <div className="text-center py-24 bg-surface-container-low rounded-3xl border border-outline-variant/30 mt-6 shadow-sm relative overflow-hidden">
            <div className="absolute inset-0 bg-primary/5"></div>
            <div className="relative z-10 flex flex-col items-center">
              <span className="material-symbols-outlined text-8xl text-primary/40 mb-6">celebration</span>
              <h3 className="text-headline-md font-bold text-on-surface">Great work!</h3>
              <p className="text-body-lg text-on-surface-variant mt-2 max-w-md mx-auto mb-8">
                You currently have no civic issues matching this filter. Thanks to your contributions, your neighbourhood is looking better every day.
              </p>
              <button 
                onClick={() => router.push('/new-report')}
                className="bg-primary text-white px-8 py-3 rounded-full font-bold text-label-lg shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all focus:ring-2 focus:ring-primary focus:outline-none flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[20px]">add_circle</span>
                Report a New Issue
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
