"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useReportsStore } from "@/store/reportsStore";
import { useAppStore } from "@/store/appStore";
import { getTimelineSteps } from "@/lib/utils/timeline";
import type { IssueSeverity, ReportStatus } from "@/types";

// Dynamic import of Leaflet MapView to avoid SSR issues
const MapView = dynamic(
  () => import("@/components/map/MapView").then((mod) => mod.MapView),
  { ssr: false }
);

interface ReportDetailsProps {
  params: Promise<{ reportId: string }>;
}

const CATEGORY_IMAGES: Record<string, string> = {
  roads: "https://lh3.googleusercontent.com/aida-public/AB6AXuDFhBa2yjbIsAbzF1Bq_sxoGH8VdNgJxxvIs85bAMh3u4Dj7S2-VEznqa9HRZoSP7TfR6oF1hK0q_-TB_4VWpmg8yF1-6J_VG1bvvBijT7EkOsstIRDkO9b6u_6T7FiQN8XdMdQd_-aOlr_PkRMwTB0hHxn4MTZ_4f9kXCSl3P-fcpK7bym708y4MNPWzGDhTvOz5-oLvLwbKhVnWXTrjqczTTscZHxep9Koo9LprfqZ8RfUz5YJPQ6Kn1xdmjt7aXvr4V6IhJN5Gbx",
  electricity: "https://lh3.googleusercontent.com/aida-public/AB6AXuCPv7psSZBJKt8INPn0ReXvbMyYDVIxL7G7g6dpVtvdIIL-Dc2xl8gRmA5sgh-Eu76jfo8Nbbvdyr1N9M_D1kjemNFBWNKyDUz1b4sTqCeHXYb7gPa908H53ZFo0p9VJJGoaJzkAG_r6zQZ_XCsPJ03eIhPcEUXlHj4uqsL21brjDO2JFEy4nV6JCBCiqn-3E0L1-0Ck9w6gZ5cbnRSxPabSHi37zu5xlsXhUICtiuuUl5BZ0-EWzEGIU7A4Dh1CaED4Iur6gpUTGbM",
  water: "https://images.unsplash.com/photo-1542013936693-8848e574047a?w=400&q=80",
  sanitation: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400&q=80",
  parks: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=400&q=80",
  default: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&q=80"
};

export default function ReportDetailsPage({ params }: ReportDetailsProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const getReportById = useReportsStore((s) => s.getReportById);
  const setReport = useReportsStore((s) => s.setReport);
  const openCopilot = useAppStore((s) => s.openCopilot);

  const report = getReportById(resolvedParams.reportId);
  const [verificationFeedback, setVerificationFeedback] = useState<string | null>(null);

  if (!report) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
        <span className="material-symbols-outlined text-6xl text-outline-variant">error</span>
        <h2 className="text-title-lg font-bold text-on-surface mt-4">Report Not Found</h2>
        <p className="text-body-md text-on-surface-variant mt-2">The requested report could not be loaded.</p>
        <button 
          onClick={() => router.push("/reports")}
          className="mt-6 bg-primary text-white px-6 py-2 rounded-full font-bold focus:ring-2 focus:ring-primary focus:outline-none"
        >
          Back to Reports
        </button>
      </div>
    );
  }

  const getReportImage = (): string => {
    if (report.media?.imageUrls && report.media.imageUrls.length > 0) {
      return report.media.imageUrls[0]!;
    }
    return CATEGORY_IMAGES[report.issueCategory] ?? CATEGORY_IMAGES.default!;
  };


  const handleSupportReport = () => {
    const updated = {
      ...report,
      communitySupport: (report.communitySupport ?? 0) + 1,
      updatedAt: new Date()
    };
    setReport(updated);
  };

  const handleVerificationClick = (isFixed: boolean) => {
    const newStatus: ReportStatus = isFixed ? "resolved" : "in_progress";
    const updated = {
      ...report,
      status: newStatus,
      updatedAt: new Date()
    };
    setReport(updated);
    setVerificationFeedback(isFixed ? "Thank you! The report status has been updated to Resolved." : "Feedback submitted. We have notified authorities to review the work.");
  };

  const timelineSteps = getTimelineSteps(report.status, report.createdAt, report.updatedAt);

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

  // Convert single report to a MapView compatible marker array
  const mapMarkers = [{
    reportId: report.reportId,
    latitude: report.location.latitude,
    longitude: report.location.longitude,
    category: report.issueCategory,
    severity: report.severity,
    title: report.title,
    status: report.status
  }];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Detail Page Title Area */}
      <header className="bg-white border-b border-outline-variant/30 sticky top-16 z-30">
        <div className="flex justify-between items-center px-4 md:px-12 py-3 w-full max-w-[1280px] mx-auto">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.back()}
              className="p-2 hover:bg-surface-container-low transition-colors rounded-full focus:ring-2 focus:ring-primary focus:outline-none"
              aria-label="Go back"
            >
              <span className="material-symbols-outlined text-primary">arrow_back</span>
            </button>
            <h1 className="font-title-lg text-title-lg text-primary font-bold">Report Details</h1>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: report.title,
                    text: report.description,
                    url: window.location.href
                  }).catch(() => {});
                }
              }}
              className="p-2 hover:bg-surface-container-low transition-colors rounded-full focus:ring-2 focus:ring-primary focus:outline-none"
              aria-label="Share report details"
            >
              <span className="material-symbols-outlined text-on-surface-variant">share</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1280px] mx-auto px-4 md:px-12 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Summary & Map */}
          <div className="lg:col-span-7 space-y-6">
            <section className="bg-white rounded-lg shadow-sm border border-outline-variant/20 overflow-hidden flex flex-col">
              
              {/* Incident Photo */}
              <div className="relative h-64 md:h-80 w-full bg-surface-container-low">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  className="w-full h-full object-cover" 
                  alt={report.title} 
                  src={getReportImage()} 
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="bg-primary-container text-on-primary-container px-3 py-1 rounded-full font-label-md text-label-md capitalize">
                    {report.issueCategory}
                  </span>
                  <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full font-label-md text-label-md flex items-center gap-1 capitalize">
                    <span className="material-symbols-outlined text-[14px]">sync</span>
                    {report.status.replace(/_/g, " ")}
                  </span>
                </div>
              </div>

              {/* Main Card Content */}
              <div className="p-6 md:p-8 space-y-6">
                <div>
                  <div className="flex justify-between items-start gap-4 mb-2 flex-wrap">
                    <h2 className="text-headline-lg font-bold text-on-surface leading-tight">
                      {report.title}
                    </h2>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getSeverityBadgeColor(report.severity)}`}>
                      {report.severity}
                    </span>
                  </div>
                  <p className="text-on-surface-variant font-body-lg text-body-lg">
                    {report.description}
                  </p>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-surface-container-low">
                    <span className="material-symbols-outlined text-primary">account_balance</span>
                    <div>
                      <p className="text-on-surface-variant text-[12px] uppercase tracking-wider font-bold">Department</p>
                      <p className="font-body-md text-body-md font-semibold">
                        {report.departmentAssigned || "Pending Assignment"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-surface-container-low">
                    <span className="material-symbols-outlined text-primary">event_available</span>
                    <div>
                      <p className="text-on-surface-variant text-[12px] uppercase tracking-wider font-bold">Estimated Resolution</p>
                      <p className="font-body-md text-body-md font-semibold">
                        {report.estimatedResolution || "Pending Assessment"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Integrated Leaflet Map Location Preview */}
                <div className="rounded-lg overflow-hidden h-48 border border-outline-variant/30 relative">
                  <MapView 
                    markers={mapMarkers}
                    center={{ latitude: report.location.latitude, longitude: report.location.longitude }}
                    zoom={15}
                    height="100%"
                    className="w-full h-full"
                  />
                </div>
              </div>
            </section>

            {/* Privacy Shield Info */}
            <div className="flex items-center gap-3 p-4 bg-surface-container-high rounded-lg border border-primary/10">
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
              <p className="font-body-md text-body-md text-on-surface-variant">
                {report.anonymousReport ? (
                  <>
                    <span className="font-bold text-primary">Protected Anonymous.</span> Your citizen identity is securely hidden.
                  </>
                ) : (
                  <>
                    <span className="font-bold text-primary">Public Report.</span> This report is visible with reporter details.
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Right Column: Timeline & verification */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Repair Verification Panel */}
            {report.status !== "submitted" && (
              <section className="bg-primary-fixed text-on-primary-fixed-variant p-6 rounded-lg border border-primary/5 shadow-sm space-y-4">
                <h3 className="text-title-lg font-bold">Repair Verification</h3>
                {verificationFeedback ? (
                  <p className="font-body-md text-body-md bg-white/20 p-3 rounded-lg font-semibold animate-fade-in">
                    {verificationFeedback}
                  </p>
                ) : (
                  <>
                    <p className="font-body-md text-body-md opacity-90">
                      CityOS AI or crews have completed the initial work. Can you verify if the issue has been resolved successfully?
                    </p>
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <button 
                        onClick={() => handleVerificationClick(true)}
                        className="bg-primary text-white py-3 rounded-lg font-bold hover:brightness-110 active:scale-95 transition-all shadow-sm focus:ring-2 focus:ring-primary focus:outline-none"
                      >
                        Yes, it&apos;s fixed
                      </button>
                      <button 
                        onClick={() => handleVerificationClick(false)}
                        className="border border-primary text-primary py-3 rounded-lg font-bold hover:bg-primary/5 active:scale-95 transition-all focus:ring-2 focus:ring-primary focus:outline-none"
                      >
                        Still Exists
                      </button>
                    </div>
                  </>
                )}
              </section>
            )}

            {/* Community Support */}
            <section className="bg-white p-6 rounded-lg border border-outline-variant/20 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant font-bold">Community Support</h3>
                <span className="text-primary font-bold text-body-md">{report.communitySupport ?? 0} Supporters</span>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={handleSupportReport}
                  className="flex-1 bg-white hover:bg-surface-container-low text-primary border border-primary/20 py-2.5 rounded-full font-bold active:scale-95 transition-transform flex items-center justify-center gap-1 focus:ring-2 focus:ring-primary focus:outline-none"
                >
                  <span className="material-symbols-outlined text-[18px]">thumb_up</span>
                  Support This Report
                </button>
              </div>
            </section>

            {/* Dynamic Progress Timeline */}
            <section className="bg-white p-6 rounded-lg border border-outline-variant/20 shadow-sm space-y-6">
              <h3 className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant font-bold">Progress Timeline</h3>
              
              <div className="space-y-0">
                {timelineSteps.map((step, idx) => {
                  const isLast = idx === timelineSteps.length - 1;
                  
                  let circleClass = "w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-all ";
                  let textClass = "font-bold text-on-surface-variant ";
                  let lineClass = "w-0.5 h-12 transition-all ";

                  if (step.status === "completed") {
                    circleClass += "bg-primary-container text-on-primary-container";
                    lineClass += "bg-primary";
                    textClass = "font-bold text-on-surface";
                  } else if (step.status === "active") {
                    circleClass += "bg-primary text-white ring-4 ring-primary-container/20";
                    lineClass += "bg-outline-variant";
                    textClass = "font-bold text-primary";
                  } else {
                    circleClass += "bg-surface-container-high text-outline";
                    lineClass += "bg-surface-container-high";
                    textClass = "font-bold text-on-surface-variant/40";
                  }

                  return (
                    <div key={idx} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={circleClass}>
                          <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                            {step.icon}
                          </span>
                        </div>
                        {!isLast && <div className={lineClass} />}
                      </div>
                      <div className="pb-8">
                        <p className={textClass}>{step.title}</p>
                        {step.time && <p className="text-on-surface-variant text-[12px]">{step.time}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* AI Help & Copilot Drawer Integration */}
            <div className="bg-surface-container p-6 rounded-lg flex flex-col items-center text-center gap-4 border border-outline-variant/30">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white shadow-lg">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
              </div>
              <div>
                <h4 className="font-bold text-on-surface">Need Help?</h4>
                <p className="text-on-surface-variant text-body-md">Get instant answers about this report or local policies.</p>
              </div>
              <button 
                onClick={() => openCopilot()}
                className="bg-white text-primary border border-primary/20 w-full py-2.5 rounded-lg font-bold hover:bg-primary hover:text-white transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2 focus:ring-2 focus:ring-primary focus:outline-none"
              >
                Chat with CityOS AI
              </button>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
