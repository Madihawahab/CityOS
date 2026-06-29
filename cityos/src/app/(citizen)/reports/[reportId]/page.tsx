"use client";

import { use, useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useReportsStore } from "@/store/reportsStore";
import { useAppStore } from "@/store/appStore";
import type { IssueSeverity, ReportStatus, Report } from "@/types";
import { mockNotifications } from "@/lib/mock/notifications";

// Dynamic import of Leaflet MapView to avoid SSR issues
const MapView = dynamic(
  () => import("@/components/map/MapView").then((mod) => mod.MapView),
  {
    ssr: false,
    loading: () => (
      <div className="h-[240px] w-full bg-surface-container-low rounded-2xl animate-pulse flex flex-col items-center justify-center text-on-surface-variant/60">
        <span className="material-symbols-outlined text-4xl mb-2 animate-spin">sync</span>
        <span className="text-xs font-semibold">Loading Live Map Location...</span>
      </div>
    ),
  }
);

interface ReportDetailsProps {
  params: Promise<{ reportId: string }>;
}

const CATEGORY_IMAGES: Record<string, string> = {
  roads: "https://lh3.googleusercontent.com/aida-public/AB6AXuDFhBa2yjbIsAbzF1Bq_sxoGH8VdNgJxxvIs85bAMh3u4Dj7S2-VEznqa9HRZoSP7TfR6oF1hK0q_-TB_4VWpmg8yF1-6J_VG1bvvBijT7EkOsstIRDkO9b6u_6T7FiQN8XdMdQd_-aOlr_PkRMwTB0hHxn4MTZ_4f9kXCSl3P-fcpK7bym708y4MNPWzGDhTvOz5-oLvLwbKhVnWXTrjqczTTscZHxep9Koo9LprfqZ8RfUz5YJPQ6Kn1xdmjt7aXvr4V6IhJN5Gbx",
  electricity: "https://lh3.googleusercontent.com/aida-public/AB6AXuCPv7psSZBJKt8INPn0ReXvbMyYDVIxL7G7g6dpVtvdIIL-Dc2xl8gRmA5sgh-Eu76jfo8Nbbvdyr1N9M_D1kjemNFBWNKyDUz1b4sTqCeHXYb7gPa908H53ZFo0p9VJJGoaJzkAG_r6zQZ_XCsPJ03eIhPcEUXlHj4uqsL21brjDO2JFEy4nV6JCBCiqn-3E0L1-0Ck9w6gZ5cbnRSxPabSHi37zu5xlsXhUICtiuuUl5BZ0-EWzEGIU7A4Dh1CaED4Iur6gpUTGbM",
  water: "https://images.unsplash.com/photo-1542013936693-8848e574047a?w=800&q=80",
  sanitation: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&q=80",
  parks: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=800&q=80",
  default: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80"
};

export default function ReportDetailsPage({ params }: ReportDetailsProps) {
  const resolvedParams = use(params);
  const getReportById = useReportsStore((s) => s.getReportById);
  const report = getReportById(resolvedParams.reportId);
  const router = useRouter();

  if (!report) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
        <span className="material-symbols-outlined text-6xl text-outline-variant animate-pulse">error</span>
        <h2 className="text-title-lg font-bold text-on-surface mt-4">Report Not Found</h2>
        <p className="text-body-md text-on-surface-variant mt-2">The requested report could not be loaded.</p>
        <button 
          onClick={() => router.push("/reports")}
          className="mt-6 bg-primary text-white px-6 py-2 rounded-full font-bold focus:ring-2 focus:ring-primary focus:outline-none transition-transform active:scale-95"
        >
          Back to Reports
        </button>
      </div>
    );
  }

  return <ReportDetailsContent report={report} />;
}

interface ReportDetailsContentProps {
  report: Report;
}

function ReportDetailsContent({ report }: ReportDetailsContentProps) {
  const router = useRouter();
  const setReport = useReportsStore((s) => s.setReport);
  const openCopilot = useAppStore((s) => s.openCopilot);

  // States for microinteractions & UI
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isAccordionExpanded, setIsAccordionExpanded] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);
  
  // Slider state
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);
  const sliderContainerRef = useRef<HTMLDivElement>(null);

  // Simulate loading state on mount for a premium feel
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  // Toast helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Get status metadata for premium styling
  const getStatusConfig = (status: ReportStatus) => {
    switch (status) {
      case "resolved":
      case "closed":
        return {
          label: "Resolved",
          gradient: "from-emerald-500 to-teal-600",
          bgLight: "bg-emerald-50 text-emerald-700 border-emerald-200",
          icon: "check_circle",
          colorClass: "text-emerald-600"
        };
      case "citizen_verification_pending":
      case "evidence_uploaded":
      case "ai_verifying_repair":
        return {
          label: "Waiting for Community Verification",
          gradient: "from-purple-500 to-indigo-600",
          bgLight: "bg-purple-50 text-purple-700 border-purple-200",
          icon: "rate_review",
          colorClass: "text-purple-600"
        };
      case "in_progress":
      case "work_started":
        return {
          label: status === "work_started" ? "Crew Dispatched" : "In Progress",
          gradient: "from-amber-500 to-orange-600",
          bgLight: "bg-amber-50 text-amber-700 border-amber-200",
          icon: status === "work_started" ? "local_shipping" : "engineering",
          colorClass: "text-amber-600"
        };
      default:
        return {
          label: status === "ai_processing" ? "AI Processing" : "Report Submitted",
          gradient: "from-blue-500 to-cyan-600",
          bgLight: "bg-blue-50 text-blue-700 border-blue-200",
          icon: "assignment",
          colorClass: "text-blue-600"
        };
    }
  };

  const statusConfig = getStatusConfig(report.status);

  // Format dates nicely
  const formatDate = (dateInput: Date | string) => {
    const d = new Date(dateInput);
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // Get base images for before/after
  const getBeforeImage = (): string => {
    if (report.media?.imageUrls && report.media.imageUrls.length > 0) {
      return report.media.imageUrls[0]!;
    }
    return CATEGORY_IMAGES[report.issueCategory] ?? CATEGORY_IMAGES.default!;
  };

  const getAfterImage = (): string | null => {
    if (report.media?.imageUrls && report.media.imageUrls.length > 1) {
      return report.media.imageUrls[1]!;
    }
    return null;
  };

  const beforeImg = getBeforeImage();
  const afterImg = getAfterImage();

  // ─── STORES & ACTIONS ────────────────────────────────────────────────────────
  const handleSupportReport = () => {
    const updated = {
      ...report,
      communitySupport: (report.communitySupport ?? 0) + 1,
      updatedAt: new Date()
    };
    setReport(updated);
    showToast("Thank you! Your support has been logged.");
  };

  const handleFollowUpdates = () => {
    setIsFollowing(!isFollowing);
    showToast(!isFollowing ? "You are now following this report's updates." : "You have unfollowed this report.");
  };

  const handleVerificationClick = (isFixed: boolean) => {
    const newStatus: ReportStatus = isFixed ? "resolved" : "in_progress";
    const updated = {
      ...report,
      status: newStatus,
      updatedAt: new Date()
    };
    setReport(updated);
    showToast(isFixed ? "Thank you! The report status has been updated to Resolved." : "Report reopened. We have notified authorities to review the work.");
  };

  // ─── COMPLETE LIFECYCLE TIMELINE ─────────────────────────────────────────────
  const getLifecycleSteps = (currentStatus: ReportStatus) => {
    const steps = [
      { id: "submitted", title: "Report Submitted", icon: "check" },
      { id: "ai_verified", title: "AI Verified", icon: "quickreply" },
      { id: "assigned", title: "Department Assigned", icon: "corporate_fare" },
      { id: "work_started", title: "Crew Dispatched", icon: "local_shipping" },
      { id: "in_progress", title: "Repair Started", icon: "engineering" },
      { id: "evidence_uploaded", title: "Evidence Uploaded", icon: "cloud_upload" },
      { id: "citizen_verification_pending", title: "Waiting for Community Verification", icon: "rate_review" },
      { id: "resolved", title: "Community Verified Resolution", icon: "task_alt" }
    ];

    // Map currentStatus to the index in the steps array
    const statusIndices: Record<string, number> = {
      submitted: 0,
      ai_processing: 0,
      ai_verified: 1,
      assigned: 2,
      work_started: 3,
      in_progress: 4,
      evidence_uploaded: 5,
      ai_verifying_repair: 5,
      citizen_verification_pending: 6,
      resolved: 7,
      closed: 7
    };

    const currentIndex = statusIndices[currentStatus] ?? 0;

    return steps.map((step, idx) => {
      let status: "completed" | "active" | "pending" = "pending";
      if (idx < currentIndex) {
        status = "completed";
      } else if (idx === currentIndex) {
        status = "active";
      }
      return { ...step, status };
    });
  };

  const timelineSteps = getLifecycleSteps(report.status);

  // ─── REPAIR PROGRESS CALCULATION ────────────────────────────────────────────
  const getRepairProgress = (status: ReportStatus) => {
    const showProgress = ["work_started", "in_progress", "evidence_uploaded", "ai_verifying_repair", "citizen_verification_pending", "resolved", "closed"].includes(status);
    if (!showProgress) return null;

    let percent = 0;
    let activity = "Awaiting deployment";

    if (status === "work_started") {
      percent = 25;
      activity = "Travelling to location";
    } else if (status === "in_progress") {
      percent = 60;
      activity = "Repair in progress";
    } else if (status === "evidence_uploaded" || status === "ai_verifying_repair") {
      percent = 85;
      activity = "Quality inspection & testing";
    } else if (status === "citizen_verification_pending") {
      percent = 90;
      activity = "Awaiting citizen verification";
    } else if (status === "resolved" || status === "closed") {
      percent = 100;
      activity = "Completed & verified";
    }

    return {
      percent,
      activity,
      officer: "Officer Ramesh Kumar",
      department: report.departmentAssigned || "BBMP Infrastructure",
      startedAt: formatDate(new Date(new Date(report.createdAt).getTime() + 45 * 60000)),
      estCompletion: report.estimatedResolution || "2 Hours"
    };
  };

  const repairProgress = getRepairProgress(report.status);

  // ─── CHRONOLOGICAL ACTIVITY FEED ─────────────────────────────────────────────
  const getActivityFeed = () => {
    const feed = [];
    const baseTime = new Date(report.createdAt).getTime();

    feed.push({
      title: "Report Submitted",
      time: formatDate(new Date(baseTime)),
      description: report.anonymousReport 
        ? "Report successfully submitted. Citizen identity fully protected by Privacy Shield." 
        : `Report successfully submitted by Citizen.`,
      engine: null
    });

    feed.push({
      title: "AI Verified",
      time: formatDate(new Date(baseTime + 5 * 60000)),
      description: report.analysis?.reportIntelligence 
        ? `AI scanned the submission and verified the issue with ${Math.round((report.analysis.reportIntelligence.confidence || 0.9) * 100)}% confidence.`
        : "AI scanned the submission and verified the authenticity of the report.",
      engine: "report_intelligence"
    });

    if (report.mergedReportIds && report.mergedReportIds.length > 0) {
      feed.push({
        title: "Duplicate Reports Merged",
        time: formatDate(new Date(baseTime + 12 * 60000)),
        description: `Identified and merged ${report.mergedReportIds.length} duplicate reports in the vicinity, increasing priority score.`,
        engine: "trust_engine"
      });
    }

    const showAssigned = ["assigned", "work_started", "in_progress", "evidence_uploaded", "ai_verifying_repair", "citizen_verification_pending", "resolved", "closed"].includes(report.status);
    if (showAssigned) {
      feed.push({
        title: "Department Assigned",
        time: formatDate(new Date(baseTime + 30 * 60000)),
        description: `Dispatched to ${report.departmentAssigned || "Municipal Department"} for resolution.`,
        engine: "decision_intelligence"
      });
    }

    const showDispatched = ["work_started", "in_progress", "evidence_uploaded", "ai_verifying_repair", "citizen_verification_pending", "resolved", "closed"].includes(report.status);
    if (showDispatched) {
      feed.push({
        title: "Crew Dispatched",
        time: formatDate(new Date(baseTime + 45 * 60000)),
        description: "Field crew and equipment dispatched to the reported site.",
        engine: null
      });
    }

    const showStarted = ["in_progress", "evidence_uploaded", "ai_verifying_repair", "citizen_verification_pending", "resolved", "closed"].includes(report.status);
    if (showStarted) {
      feed.push({
        title: "Repair Started",
        time: formatDate(new Date(baseTime + 60 * 60000)),
        description: "Work crew arrived on site and commenced physical repair operations.",
        engine: null
      });
    }

    const showEvidence = ["evidence_uploaded", "ai_verifying_repair", "citizen_verification_pending", "resolved", "closed"].includes(report.status);
    if (showEvidence) {
      feed.push({
        title: "Evidence Uploaded",
        time: formatDate(new Date(report.updatedAt)),
        description: "Officer Ramesh Kumar uploaded before/after photos and notes for audit.",
        engine: null
      });
    }

    const showPendingVerify = ["citizen_verification_pending", "resolved", "closed"].includes(report.status);
    if (showPendingVerify) {
      feed.push({
        title: "Community Verification Requested",
        time: formatDate(new Date(report.updatedAt)),
        description: "Local community verification requested to confirm quality of repair.",
        engine: "resolution_intelligence"
      });
    }

    if (report.status === "resolved" || report.status === "closed") {
      feed.push({
        title: "Resolved",
        time: formatDate(new Date(report.updatedAt)),
        description: "Issue resolved successfully and verified by the community.",
        engine: "resolution_intelligence"
      });
    }

    return feed.reverse(); // Newest first
  };

  const activityFeed = getActivityFeed();

  // ─── MAP MARKERS & CONTEXT ───────────────────────────────────────────────────
  const reportsMap = useReportsStore((s) => s.reports);
  const allReports = useMemo(() => Object.values(reportsMap), [reportsMap]);

  const nearbyReports = useMemo(() => {
    return allReports.filter((r) => {
      if (r.reportId === report.reportId) return false;
      const latDiff = Math.abs(r.location.latitude - report.location.latitude);
      const lngDiff = Math.abs(r.location.longitude - report.location.longitude);
      return latDiff < 0.015 && lngDiff < 0.015;
    });
  }, [allReports, report.location.latitude, report.location.longitude, report.reportId]);

  const mapMarkers = useMemo(() => {
    const markers = [
      {
        reportId: report.reportId,
        latitude: report.location.latitude,
        longitude: report.location.longitude,
        category: report.issueCategory,
        severity: report.severity,
        title: report.title,
        status: report.status
      }
    ];

    // Add nearby reports
    nearbyReports.forEach((nr) => {
      markers.push({
        reportId: nr.reportId,
        latitude: nr.location.latitude,
        longitude: nr.location.longitude,
        category: nr.issueCategory,
        severity: nr.severity,
        title: nr.title,
        status: nr.status
      });
    });

    // Add exactly one predicted hotspot
    markers.push({
      reportId: "PRED-HOTSPOT",
      latitude: report.location.latitude + 0.003,
      longitude: report.location.longitude - 0.002,
      category: report.issueCategory,
      severity: "high" as IssueSeverity,
      title: "AI Predicted Hotspot: Infrastructure Risk Zone",
      status: "predicted" as ReportStatus
    });

    // Add exactly one verification request
    markers.push({
      reportId: "NEARBY-VERIFY",
      latitude: report.location.latitude - 0.004,
      longitude: report.location.longitude + 0.003,
      category: "roads",
      severity: "medium" as IssueSeverity,
      title: "Verification Request: Street Light Repair",
      status: "citizen_verification_pending"
    });

    // Add assigned department office
    markers.push({
      reportId: "DEPT-OFFICE",
      latitude: report.location.latitude + 0.005,
      longitude: report.location.longitude + 0.004,
      category: "public_works",
      severity: "low" as IssueSeverity,
      title: `${report.departmentAssigned || "Municipal"} Local Office`,
      status: "resolved"
    });

    return markers;
  }, [report, nearbyReports]);

  const selectedMarker = useMemo(() => {
    if (!selectedMarkerId) return null;
    return mapMarkers.find((m) => m.reportId === selectedMarkerId);
  }, [selectedMarkerId, mapMarkers]);

  // ─── SMART NOTIFICATIONS RELATED ONLY TO THIS REPORT ─────────────────────────
  const reportNotifications = useMemo(() => {
    return mockNotifications.filter((n) => n.reportId === report.reportId);
  }, [report.reportId]);

  // ─── BEFORE/AFTER SLIDER HANDLERS ────────────────────────────────────────────
  const handleSliderMove = (clientX: number) => {
    if (!sliderContainerRef.current) return;
    const rect = sliderContainerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingSlider) return;
    handleSliderMove(e.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches[0]) {
      handleSliderMove(e.touches[0].clientX);
    }
  };

  // Scroll to section helper
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      element.classList.add("ring-2", "ring-primary", "ring-offset-2");
      setTimeout(() => {
        element.classList.remove("ring-2", "ring-primary", "ring-offset-2");
      }, 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-20 max-w-[1280px] mx-auto px-4 md:px-12 py-8 space-y-6">
        <div className="h-12 bg-surface-container-low rounded-xl animate-pulse w-1/4" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-6">
            <div className="h-80 bg-surface-container-low rounded-2xl animate-pulse" />
            <div className="h-48 bg-surface-container-low rounded-2xl animate-pulse" />
          </div>
          <div className="lg:col-span-5 space-y-6">
            <div className="h-64 bg-surface-container-low rounded-2xl animate-pulse" />
            <div className="h-64 bg-surface-container-low rounded-2xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-800 animate-fade-in transition-all">
          <span className="material-symbols-outlined text-emerald-400">info</span>
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Detail Page Title Area */}
      <header className="bg-surface border-b border-outline-variant/30 sticky top-16 z-30">
        <div className="flex justify-between items-center px-4 md:px-12 py-3 w-full max-w-[1280px] mx-auto">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.back()}
              className="p-2 hover:bg-surface-container-low transition-colors rounded-full focus:ring-2 focus:ring-primary focus:outline-none"
              aria-label="Go back"
            >
              <span className="material-symbols-outlined text-primary">arrow_back</span>
            </button>
            <div>
              <h1 className="font-title-lg text-title-lg text-primary font-bold">Report Tracker</h1>
              <p className="text-[10px] text-on-surface-variant font-semibold">ID: {report.reportId}</p>
            </div>
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
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  showToast("Link copied to clipboard!");
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

      {/* Premium Status Header Banner */}
      <div className={`w-full bg-gradient-to-r ${statusConfig.gradient} text-white shadow-md`}>
        <div className="max-w-[1280px] mx-auto px-4 md:px-12 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-3xl animate-pulse" style={{ fontVariationSettings: "'FILL' 1" }}>
              {statusConfig.icon}
            </span>
            <div>
              <p className="text-[10px] uppercase tracking-wider font-bold opacity-85">Live Issue Status</p>
              <h2 className="text-lg font-black leading-tight">{statusConfig.label}</h2>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur flex flex-col">
              <span className="text-[9px] uppercase tracking-wider opacity-70">Priority</span>
              <span className="font-bold capitalize">{report.priority || report.severity}</span>
            </div>
            <div className="bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur flex flex-col">
              <span className="text-[9px] uppercase tracking-wider opacity-70">Department</span>
              <span className="font-bold">{report.departmentAssigned || "Pending Assignment"}</span>
            </div>
            <div className="bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur flex flex-col">
              <span className="text-[9px] uppercase tracking-wider opacity-70">Resolution ETA</span>
              <span className="font-bold">{report.estimatedResolution || "Pending Assessment"}</span>
            </div>
            <div className="bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur flex flex-col">
              <span className="text-[9px] uppercase tracking-wider opacity-70">AI Reliability</span>
              <span className="font-bold">{report.trustScore ? `${report.trustScore}%` : "Pending Scan"}</span>
            </div>
            {report.anonymousReport && (
              <div className="bg-slate-900 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-lg flex items-center gap-1 font-bold">
                <span className="material-symbols-outlined text-[14px]">shield</span>
                <span>Protected Anonymous</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <main className="max-w-[1280px] mx-auto px-4 md:px-12 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Media, Details, AI Diagnosis, Map */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Main Report Card */}
            <section className="bg-surface-container-low rounded-2xl shadow-sm border border-outline-variant/30 overflow-hidden flex flex-col transition-all hover:shadow-md">
              
              {/* Interactive Before/After Evidence Slider */}
              {["evidence_uploaded", "ai_verifying_repair", "citizen_verification_pending", "resolved", "closed"].includes(report.status) ? (
                <div className="w-full bg-surface-container-low">
                  {afterImg ? (
                    /* Interactive Drag Slider */
                    <div className="space-y-2 p-6 border-b border-outline-variant/30">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-body-md text-on-surface flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-primary text-[20px]">compare</span>
                          Interactive Repair Verification
                        </h3>
                        <span className="text-xs text-on-surface-variant/70">Drag slider to compare</span>
                      </div>
                      <div 
                        ref={sliderContainerRef}
                        className="relative w-full aspect-video overflow-hidden rounded-xl select-none cursor-ew-resize border border-outline-variant/30"
                        onMouseMove={handleMouseMove}
                        onMouseDown={() => setIsDraggingSlider(true)}
                        onMouseUp={() => setIsDraggingSlider(false)}
                        onMouseLeave={() => setIsDraggingSlider(false)}
                        onTouchMove={handleTouchMove}
                        onTouchStart={() => setIsDraggingSlider(true)}
                        onTouchEnd={() => setIsDraggingSlider(false)}
                      >
                        {/* Before Image (Background) */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={beforeImg} 
                          className="absolute inset-0 w-full h-full object-cover" 
                          alt="Before repair" 
                          draggable="false"
                        />
                        <div className="absolute bottom-4 left-4 z-10 bg-black/60 px-3 py-1 rounded-full text-white text-[10px] font-bold tracking-wider">
                          BEFORE
                        </div>

                        {/* After Image (Foreground, clipped using clip-path) */}
                        <div 
                          className="absolute inset-0 w-full h-full" 
                          style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img 
                            src={afterImg} 
                            className="w-full h-full object-cover" 
                            alt="After repair" 
                            draggable="false"
                          />
                          <div className="absolute bottom-4 right-4 z-10 bg-primary px-3 py-1 rounded-full text-white text-[10px] font-bold tracking-wider">
                            AFTER
                          </div>
                        </div>

                        {/* Slider Line & Handle */}
                        <div 
                          className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize z-20"
                          style={{ left: `${sliderPosition}%` }}
                        >
                          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white shadow-2xl border border-outline-variant flex items-center justify-center hover:scale-110 active:scale-95 transition-transform">
                            <span className="material-symbols-outlined text-primary text-[18px]">unfold_more</span>
                          </div>
                        </div>
                      </div>
                      
                      {report.analysis?.resolutionIntelligence && (
                        <div className="mt-4 p-4 bg-purple-50/50 rounded-xl border border-purple-100 space-y-2 text-xs">
                          <p className="font-bold text-purple-800 uppercase tracking-wide flex items-center gap-1">
                            <span className="material-symbols-outlined text-[16px]">visibility</span>
                            AI Visual Comparison
                          </p>
                          <p className="text-on-surface-variant leading-relaxed">
                            {report.analysis.resolutionIntelligence.historicalComparison}
                          </p>
                          <div className="pt-2 border-t border-purple-100 flex justify-between font-semibold text-purple-700">
                            <span>Resolution Confidence</span>
                            <span>{report.analysis.resolutionIntelligence.confidenceScore}% Match</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Side by Side Before & Awaiting After Placeholder */
                    <div className="p-6 border-b border-outline-variant/30 space-y-4">
                      <h3 className="font-bold text-body-md text-on-surface flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-primary text-[20px]">construction</span>
                        Repair Evidence
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative aspect-video bg-surface-container rounded-xl overflow-hidden border border-outline-variant/30">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img 
                            src={beforeImg} 
                            className="w-full h-full object-cover" 
                            alt="Before repair" 
                          />
                          <div className="absolute bottom-3 left-3 bg-black/60 px-2.5 py-1 rounded-full text-white text-[9px] font-bold tracking-wider">
                            BEFORE PHOTO
                          </div>
                        </div>
                        <div className="flex flex-col items-center justify-center border-2 border-dashed border-outline-variant/60 rounded-xl p-6 bg-surface-container-low text-center aspect-video">
                          <span className="material-symbols-outlined text-outline-variant text-4xl mb-2 animate-pulse">pending_actions</span>
                          <p className="text-body-md font-bold text-on-surface-variant">Awaiting After Photo</p>
                          <p className="text-[11px] text-on-surface-variant/70 mt-1 max-w-[220px] leading-normal">
                            Repair evidence will appear here once the department uploads it.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Standard Image with Zoom Modal */
                <div className="relative h-64 md:h-80 w-full bg-surface-container-low overflow-hidden group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 cursor-zoom-in" 
                    alt={report.title} 
                    src={beforeImg} 
                    onClick={() => setIsZoomed(true)}
                  />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="bg-primary-container text-on-primary-container px-3 py-1 rounded-full font-label-md text-label-md capitalize shadow-sm">
                      {report.issueCategory}
                    </span>
                    <span className={`px-3 py-1 rounded-full font-label-md text-label-md flex items-center gap-1 capitalize shadow-sm ${statusConfig.bgLight}`}>
                      <span className="material-symbols-outlined text-[14px]">{statusConfig.icon}</span>
                      {statusConfig.label}
                    </span>
                  </div>
                  <button 
                    onClick={() => setIsZoomed(true)}
                    className="absolute bottom-4 right-4 bg-black/60 text-white p-2 rounded-full backdrop-blur hover:bg-black/80 transition-all focus:outline-none"
                    aria-label="Zoom photo"
                  >
                    <span className="material-symbols-outlined text-[20px]">zoom_in</span>
                  </button>
                </div>
              )}

              {/* Card Title & Description */}
              <div className="p-6 md:p-8 space-y-6">
                <div>
                  <h2 className="text-headline-lg font-black text-on-surface leading-tight mb-3">
                    {report.title}
                  </h2>
                  <p className="text-on-surface-variant font-body-lg text-body-lg leading-relaxed">
                    {report.description}
                  </p>
                </div>

                {/* COMPACT CURRENT STATUS SECTION (Directly below title & description) */}
                <div id="status-section" className="bg-surface-container-low border border-outline-variant/50 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center gap-2 border-b border-outline-variant/20 pb-3">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                    </span>
                    <h3 className="font-bold text-body-md text-on-surface uppercase tracking-wide">Current Status &amp; Crew Details</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                    <div className="space-y-1">
                      <span className="text-on-surface-variant/70 block font-medium uppercase tracking-wider text-[9px]">Current Status</span>
                      <span className="font-bold text-on-surface text-body-sm capitalize">{report.status.replace(/_/g, " ")}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-on-surface-variant/70 block font-medium uppercase tracking-wider text-[9px]">Assigned Officer</span>
                      <span className="font-bold text-on-surface text-body-sm">
                        {["assigned", "work_started", "in_progress", "evidence_uploaded", "ai_verifying_repair", "citizen_verification_pending", "resolved", "closed"].includes(report.status) 
                          ? "Officer Ramesh Kumar" 
                          : "Pending Assignment"}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-on-surface-variant/70 block font-medium uppercase tracking-wider text-[9px]">Department</span>
                      <span className="font-bold text-on-surface text-body-sm">{report.departmentAssigned || "Pending Assignment"}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-on-surface-variant/70 block font-medium uppercase tracking-wider text-[9px]">Expected Arrival / ETA</span>
                      <span className="font-bold text-on-surface text-body-sm">{report.estimatedResolution || "Pending Assessment"}</span>
                    </div>
                    <div className="space-y-1 md:col-span-2 lg:col-span-2">
                      <span className="text-on-surface-variant/70 block font-medium uppercase tracking-wider text-[9px]">Last Updated</span>
                      <span className="font-bold text-on-surface text-body-sm">{formatDate(report.updatedAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Location Address Details */}
                <div className="flex items-start gap-3 p-4 rounded-xl bg-surface-container-low text-xs">
                  <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">pin_drop</span>
                  <div>
                    <p className="font-bold text-on-surface">Incident Address</p>
                    <p className="text-on-surface-variant mt-0.5 leading-normal">
                      {report.location.address}
                    </p>
                    {report.location.ward && (
                      <p className="text-primary font-semibold mt-1">
                        Ward: {report.location.ward}
                      </p>
                    )}
                  </div>
                </div>

              </div>
            </section>

            {/* AI SUMMARY CARD */}
            <section id="ai-summary" className="bg-surface-container-low rounded-2xl border border-outline-variant/30 p-6 space-y-4 shadow-sm hover:shadow-md transition-all">
              <h3 className="font-bold text-body-lg text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">auto_awesome</span>
                AI Analysis &amp; Diagnostics
              </h3>
              
              {report.analysis ? (
                <div className="space-y-4">
                  <div className="bg-primary-container/20 p-4 rounded-xl border border-primary/10">
                    <h4 className="font-bold text-primary text-xs uppercase tracking-wider mb-1">AI Generated Title</h4>
                    <p className="text-body-md font-bold text-on-surface">{report.analysis.reportIntelligence.detectedIssue}</p>
                  </div>
                  
                  <div className="space-y-1 text-xs">
                    <span className="text-on-surface-variant/70 block font-medium uppercase tracking-wider text-[9px]">AI Generated Description</span>
                    <p className="text-on-surface leading-relaxed">{report.analysis.reportIntelligence.description}</p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 border-t border-outline-variant/20 pt-4 text-xs">
                    <div>
                      <span className="text-on-surface-variant/70 block font-medium uppercase tracking-wider text-[9px]">Category</span>
                      <span className="font-bold text-on-surface capitalize">{report.analysis.reportIntelligence.category}</span>
                    </div>
                    <div>
                      <span className="text-on-surface-variant/70 block font-medium uppercase tracking-wider text-[9px]">Severity</span>
                      <span className="font-bold text-on-surface capitalize">{report.analysis.reportIntelligence.severity}</span>
                    </div>
                    <div>
                      <span className="text-on-surface-variant/70 block font-medium uppercase tracking-wider text-[9px]">Assigned Department</span>
                      <span className="font-bold text-on-surface">{report.analysis.decisionEngine.department}</span>
                    </div>
                    <div>
                      <span className="text-on-surface-variant/70 block font-medium uppercase tracking-wider text-[9px]">Estimated Resolution</span>
                      <span className="font-bold text-on-surface">{report.analysis.decisionEngine.estimatedResolution}</span>
                    </div>
                    <div>
                      <span className="text-on-surface-variant/70 block font-medium uppercase tracking-wider text-[9px]">Community Impact</span>
                      <span className="font-bold text-on-surface">{report.analysis.civicIntelligence.communityImpact}</span>
                    </div>
                    <div>
                      <span className="text-on-surface-variant/70 block font-medium uppercase tracking-wider text-[9px]">Trust Rating</span>
                      <span className="font-bold text-on-surface capitalize">{report.analysis.trustEngine.authenticity}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-on-surface-variant/70 block font-medium uppercase tracking-wider text-[9px]">AI Reliability Score</span>
                      <span className="font-bold text-primary">{report.analysis.trustEngine.trustScore}% Confidence Rating</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 rounded-xl bg-surface-container-low border border-outline-variant/30 text-center flex flex-col items-center justify-center">
                  <span className="material-symbols-outlined text-outline-variant text-4xl mb-2">smart_toy</span>
                  <h4 className="font-bold text-on-surface">AI Analysis Unavailable</h4>
                  <p className="text-xs text-on-surface-variant mt-1 leading-normal max-w-sm">
                    AI analysis and diagnostics are currently unavailable for this report. The report is being processed using standard validation workflows.
                  </p>
                </div>
              )}
            </section>

            {/* EXPLAINABLE AI ACCORDION */}
            <section className="bg-surface-container-low rounded-2xl border border-outline-variant/30 shadow-sm overflow-hidden">
              <button 
                onClick={() => setIsAccordionExpanded(!isAccordionExpanded)}
                className="w-full p-6 flex justify-between items-center hover:bg-surface-container-low transition-colors focus:outline-none"
                aria-expanded={isAccordionExpanded}
              >
                <div className="flex items-center gap-2 text-left">
                  <span className="material-symbols-outlined text-primary">psychology</span>
                  <div>
                    <h3 className="font-bold text-body-lg text-on-surface">Explainable AI Decision Rationale</h3>
                    <p className="text-xs text-on-surface-variant">Understand how and why decisions were made</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant transition-transform duration-300" style={{ transform: isAccordionExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                  expand_more
                </span>
              </button>
              
              {isAccordionExpanded && (
                <div className="px-6 pb-6 border-t border-outline-variant/10 pt-4 space-y-4 animate-slide-down">
                  {report.analysis ? (
                    <div className="space-y-4 text-xs leading-relaxed text-on-surface-variant">
                      <div>
                        <h4 className="font-bold text-on-surface mb-1 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px] text-primary">priority_high</span>
                          Why this Priority?
                        </h4>
                        <p>{report.analysis.decisionEngine.priorityReason}</p>
                      </div>
                      <div className="border-t border-outline-variant/10 pt-3">
                        <h4 className="font-bold text-on-surface mb-1 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px] text-primary">corporate_fare</span>
                          Why this Department?
                        </h4>
                        <p>
                          Assigned to the <strong>{report.analysis.decisionEngine.department}</strong> as the primary municipal agency responsible for managing <strong>{report.analysis.reportIntelligence.category}</strong> infrastructure in this district.
                        </p>
                      </div>
                      <div className="border-t border-outline-variant/10 pt-3">
                        <h4 className="font-bold text-on-surface mb-1 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px] text-primary">schedule</span>
                          Why this ETA?
                        </h4>
                        <p>
                          The estimated resolution window of <strong>{report.analysis.decisionEngine.estimatedResolution}</strong> is calculated based on historical response times for similar <strong>{report.analysis.reportIntelligence.category}</strong> issues in <strong>{report.location.ward || "this ward"}</strong>, adjusted for current crew availability.
                        </p>
                      </div>
                      <div className="border-t border-outline-variant/10 pt-3">
                        <h4 className="font-bold text-on-surface mb-1 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px] text-primary">layers</span>
                          Why were duplicate reports merged?
                        </h4>
                        <p>
                          {report.analysis.trustEngine.duplicateDetected ? (
                            `We identified ${report.analysis.trustEngine.duplicateReportIds?.length || 0} other reports in this immediate area describing the same issue. Merging them aggregates community feedback and increases the issue's priority weight, ensuring faster dispatch.`
                          ) : (
                            "No duplicate reports have been merged for this issue. We continue to monitor incoming submissions for overlap."
                          )}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-on-surface-variant text-center py-4 italic">
                      AI Decision Rationale is unavailable for this report.
                    </p>
                  )}
                </div>
              )}
            </section>

            {/* FOCUSED LIVE MAP */}
            <section className="bg-surface-container-low rounded-2xl border border-outline-variant/30 p-6 space-y-4 shadow-sm hover:shadow-md transition-all">
              <div>
                <h3 className="font-bold text-body-lg text-on-surface flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-primary">map</span>
                  Live Location Map Context
                </h3>
                <p className="text-xs text-on-surface-variant">Focused view of this issue and its immediate surroundings</p>
              </div>
              
              <div className="h-64 rounded-xl overflow-hidden border border-outline-variant/30 relative">
                <MapView 
                  markers={mapMarkers}
                  center={{ latitude: report.location.latitude, longitude: report.location.longitude }}
                  zoom={15}
                  height="100%"
                  className="w-full h-full"
                  onMarkerClick={(markerId) => setSelectedMarkerId(markerId)}
                  showDepartments={false} // Disable default ones, we pass the custom office in markers
                />
              </div>

              {/* Selected Marker Summary Details Card */}
              {selectedMarker && (
                <div className="p-4 rounded-xl border border-outline-variant/30 bg-surface-container-low flex flex-col gap-2 relative animate-fade-in">
                  <button 
                    onClick={() => setSelectedMarkerId(null)}
                    className="absolute top-3 right-3 text-on-surface-variant/70 hover:text-on-surface focus:outline-none"
                    aria-label="Close details"
                  >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[18px]">
                      {selectedMarker.reportId === "DEPT-OFFICE" ? "corporate_fare" : (selectedMarker.reportId === "PRED-HOTSPOT" ? "insights" : "pin_drop")}
                    </span>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-on-surface-variant">
                      {selectedMarker.reportId === "DEPT-OFFICE" ? "Department Office" : (selectedMarker.reportId === "PRED-HOTSPOT" ? "AI Predicted Hotspot" : (selectedMarker.reportId === "NEARBY-VERIFY" ? "Verification Request" : "Nearby Report"))}
                    </span>
                  </div>
                  <h4 className="font-bold text-on-surface text-body-sm pr-6 leading-tight">{selectedMarker.title}</h4>
                  <div className="flex justify-between items-center mt-2 border-t border-outline-variant/20 pt-2">
                    <span className="text-[11px] text-on-surface-variant capitalize">Category: {selectedMarker.category}</span>
                    {selectedMarker.reportId !== "DEPT-OFFICE" && selectedMarker.reportId !== "PRED-HOTSPOT" && selectedMarker.reportId !== "NEARBY-VERIFY" && selectedMarker.reportId !== report.reportId && (
                      <button 
                        onClick={() => router.push(`/reports/${selectedMarker.reportId}`)}
                        className="text-[11px] text-primary font-bold hover:underline focus:outline-none"
                      >
                        View Report Details
                      </button>
                    )}
                  </div>
                </div>
              )}
            </section>

          </div>

          {/* Right Column: Timeline, Repair progress, Verification, Support, Notifications */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* REPAIR VERIFICATION PANEL */}
            {["citizen_verification_pending", "evidence_uploaded", "in_progress"].includes(report.status) && (
              <section id="verification-section" className="bg-primary-container text-on-primary-container p-6 rounded-2xl border border-primary/15 shadow-sm space-y-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">rate_review</span>
                  <h3 className="text-title-md font-bold">Community Verification</h3>
                </div>
                <p className="text-xs leading-relaxed opacity-90">
                  CityOS AI or municipal crews have completed work on this issue. Please verify if the repair has been executed successfully.
                </p>
                
                <div className="bg-white/50 p-3 rounded-xl text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="font-medium text-on-surface-variant">Community Votes:</span>
                    <span className="font-bold text-primary">3 Fixed · 0 Exists</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-on-surface-variant">AI Confidence:</span>
                    <span className="font-bold text-primary">
                      {report.analysis?.resolutionIntelligence?.confidenceScore 
                        ? `${report.analysis.resolutionIntelligence.confidenceScore}%` 
                        : "AI analysis unavailable"}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button 
                    onClick={() => handleVerificationClick(true)}
                    className="bg-primary text-white py-3 rounded-xl font-bold hover:brightness-110 active:scale-95 transition-all shadow-sm focus:ring-2 focus:ring-primary focus:outline-none text-xs"
                  >
                    Looks Fixed
                  </button>
                  <button 
                    onClick={() => handleVerificationClick(false)}
                    className="border-2 border-primary text-primary py-3 rounded-xl font-bold hover:bg-primary/5 active:scale-95 transition-all focus:ring-2 focus:ring-primary focus:outline-none text-xs bg-transparent"
                  >
                    Still Exists
                  </button>
                </div>
              </section>
            )}

            {/* REPAIR PROGRESS CARD */}
            {repairProgress && (
              <section id="repair-progress" className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/30 shadow-sm space-y-4 hover:shadow-md transition-all">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-body-lg text-on-surface">Active Repair Progress</h3>
                    <p className="text-xs text-on-surface-variant">Real-time crew operations tracking</p>
                  </div>
                  <span className="text-xs font-bold text-primary bg-primary-container/20 px-2.5 py-1 rounded-full animate-pulse capitalize">
                    {repairProgress.activity}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-[11px] font-bold text-on-surface-variant">
                    <span>Overall Progress</span>
                    <span>{repairProgress.percent}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-surface-container-high rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all duration-1000 ease-out" 
                      style={{ width: `${repairProgress.percent}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-outline-variant/15 pt-4 text-[11px] leading-tight">
                  <div>
                    <span className="text-on-surface-variant/70 block uppercase tracking-wider text-[9px] mb-0.5">Assigned Officer</span>
                    <strong className="text-on-surface">{repairProgress.officer}</strong>
                  </div>
                  <div>
                    <span className="text-on-surface-variant/70 block uppercase tracking-wider text-[9px] mb-0.5">Department</span>
                    <strong className="text-on-surface">{repairProgress.department}</strong>
                  </div>
                  <div>
                    <span className="text-on-surface-variant/70 block uppercase tracking-wider text-[9px] mb-0.5">Dispatched At</span>
                    <strong className="text-on-surface">{repairProgress.startedAt}</strong>
                  </div>
                  <div>
                    <span className="text-on-surface-variant/70 block uppercase tracking-wider text-[9px] mb-0.5">Estimated Completion</span>
                    <strong className="text-on-surface">{repairProgress.estCompletion}</strong>
                  </div>
                </div>
              </section>
            )}

            {/* DYNAMIC PROGRESS TIMELINE */}
            <section className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/30 shadow-sm space-y-6 hover:shadow-md transition-all">
              <h3 className="font-bold text-body-lg text-on-surface">Lifecycle Progress Timeline</h3>
              
              <div className="space-y-0 relative pl-2">
                {timelineSteps.map((step, idx) => {
                  const isLast = idx === timelineSteps.length - 1;
                  
                  let circleClass = "w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-all ";
                  let textClass = "font-bold text-on-surface-variant text-xs ";
                  let lineClass = "w-0.5 h-10 transition-all ";

                  if (step.status === "completed") {
                    circleClass += "bg-emerald-500 text-white";
                    lineClass += "bg-emerald-500";
                    textClass = "font-bold text-on-surface";
                  } else if (step.status === "active") {
                    circleClass += "bg-primary text-white ring-4 ring-primary-container/40 animate-pulse";
                    lineClass += "bg-outline-variant";
                    textClass = "font-bold text-primary";
                  } else {
                    circleClass += "bg-surface-container-high text-outline-variant";
                    lineClass += "bg-surface-container-high";
                    textClass = "font-bold text-on-surface-variant/40";
                  }

                  return (
                    <div key={step.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={circleClass}>
                          <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                            {step.icon}
                          </span>
                        </div>
                        {!isLast && <div className={lineClass} />}
                      </div>
                      <div className="pb-6">
                        <p className={textClass}>{step.title}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* COMMUNITY SUPPORT */}
            <section className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/30 shadow-sm space-y-4 hover:shadow-md transition-all">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-body-lg text-on-surface">Community Support</h3>
                {report.communitySupport > 25 && (
                  <span className="bg-orange-500/10 text-orange-600 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide flex items-center gap-0.5 animate-bounce">
                    <span className="material-symbols-outlined text-[12px]">local_fire_department</span>
                    Trending
                  </span>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4 py-3 bg-surface-container-low rounded-xl border border-outline-variant/20 text-center text-xs">
                <div>
                  <span className="text-on-surface-variant/70 block uppercase tracking-wider text-[9px] mb-0.5">Supporters</span>
                  <strong className="text-on-surface text-body-md">{report.communitySupport}</strong>
                </div>
                <div>
                  <span className="text-on-surface-variant/70 block uppercase tracking-wider text-[9px] mb-0.5">Followers</span>
                  <strong className="text-on-surface text-body-md">{report.communitySupport + 8}</strong>
                </div>
                <div>
                  <span className="text-on-surface-variant/70 block uppercase tracking-wider text-[9px] mb-0.5">People Affected</span>
                  <strong className="text-on-surface text-body-md">{report.communitySupport * 3}</strong>
                </div>
                <div>
                  <span className="text-on-surface-variant/70 block uppercase tracking-wider text-[9px] mb-0.5">Merged Reports</span>
                  <strong className="text-on-surface text-body-md">{report.mergedReportIds?.length || 0}</strong>
                </div>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={handleSupportReport}
                  className="flex-1 bg-primary text-white py-2.5 rounded-full font-bold text-xs hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1 focus:ring-2 focus:ring-primary focus:outline-none shadow-sm"
                >
                  <span className="material-symbols-outlined text-[16px]">thumb_up</span>
                  Support Issue
                </button>
                <button 
                  onClick={handleFollowUpdates}
                  className={`flex-1 border py-2.5 rounded-full font-bold text-xs active:scale-95 transition-all flex items-center justify-center gap-1 focus:ring-2 focus:ring-primary focus:outline-none ${
                    isFollowing 
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" 
                      : "bg-surface-container text-on-surface-variant border-outline-variant/60 hover:bg-surface-container-low"
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">{isFollowing ? "done" : "notifications"}</span>
                  {isFollowing ? "Following" : "Follow Updates"}
                </button>
              </div>
            </section>

            {/* SMART NOTIFICATIONS RELATED ONLY TO THIS REPORT */}
            <section className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/30 shadow-sm space-y-4 hover:shadow-md transition-all">
              <h3 className="font-bold text-body-lg text-on-surface flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary">notifications_active</span>
                Report Notifications
              </h3>
              
              {reportNotifications.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {reportNotifications.map((notif) => {
                    let scrollId = "status-section";
                    if (notif.type === "work_started") scrollId = "repair-progress";
                    if (["verification_requested", "repair_completed"].includes(notif.type)) scrollId = "verification-section";

                    return (
                      <button 
                        key={notif.notificationId}
                        onClick={() => scrollToSection(scrollId)}
                        className="w-full text-left p-3 rounded-xl border border-outline-variant/20 hover:bg-surface-container-low transition-colors flex items-start gap-3 text-xs focus:outline-none"
                      >
                        <span className="material-symbols-outlined text-primary mt-0.5 text-[18px]">
                          {notif.type === "work_started" ? "local_shipping" : (notif.type === "verification_requested" ? "rate_review" : "info")}
                        </span>
                        <div>
                          <p className="font-bold text-on-surface">{notif.title}</p>
                          <p className="text-on-surface-variant text-[11px] mt-0.5 leading-normal">{notif.message}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-on-surface-variant/75 italic py-2">
                  No recent notifications for this report.
                </p>
              )}
            </section>

            {/* PRIVACY SHIELD BANNER */}
            {report.anonymousReport && (
              <div className="flex items-start gap-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-xs">
                <span className="material-symbols-outlined text-emerald-600 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
                <div>
                  <p className="font-bold text-emerald-800">Protected Anonymous Report</p>
                  <p className="text-emerald-700/80 mt-0.5 leading-normal">
                    This report is protected by the CityOS Cryptographic Privacy Shield. Personal identity details (name, email, phone, address) are fully masked from public view and city officials.
                  </p>
                </div>
              </div>
            )}

            {/* CHRONOLOGICAL ACTIVITY FEED */}
            <section className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/30 shadow-sm space-y-4 hover:shadow-md transition-all">
              <h3 className="font-bold text-body-lg text-on-surface flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary">history</span>
                Chronological Activity History
              </h3>
              
              <div className="space-y-4 relative pl-2 border-l border-outline-variant/20 ml-2 pt-2">
                {activityFeed.map((activity, idx) => (
                  <div key={idx} className="relative text-xs leading-normal">
                    <div className="absolute -left-[14px] top-1 w-2 h-2 rounded-full bg-primary ring-4 ring-white" />
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-bold text-on-surface">{activity.title}</h4>
                      <span className="text-[10px] text-on-surface-variant/70 font-semibold whitespace-nowrap">{activity.time}</span>
                    </div>
                    <p className="text-on-surface-variant/95 text-[11px] mt-1 leading-relaxed">{activity.description}</p>
                    {activity.engine && (
                      <span className="inline-block mt-1.5 bg-primary-container/20 text-primary px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide">
                        🧠 AI {activity.engine.replace(/_/g, " ")}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* AI HELP & COPILOT DRAWER INTEGRATION */}
            <div className="bg-surface-container-low p-6 rounded-2xl flex flex-col items-center text-center gap-4 border border-outline-variant/30 hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white shadow-lg">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
              </div>
              <div>
                <h4 className="font-bold text-on-surface">Need Help?</h4>
                <p className="text-on-surface-variant text-xs">Get instant answers about this report or local policies.</p>
              </div>
              <button 
                onClick={() => openCopilot()}
                className="bg-surface-container text-primary border border-primary/20 w-full py-2.5 rounded-xl font-bold text-xs hover:bg-primary hover:text-white transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2 focus:ring-2 focus:ring-primary focus:outline-none"
              >
                Chat with CityOS AI
              </button>
            </div>

          </div>
        </div>
      </main>

      {/* PHOTO ZOOM MODAL */}
      {isZoomed && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setIsZoomed(false)}
        >
          <button 
            className="absolute top-6 right-6 text-white text-3xl focus:outline-none"
            onClick={() => setIsZoomed(false)}
            aria-label="Close fullscreen view"
          >
            <span className="material-symbols-outlined text-[32px]">close</span>
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={beforeImg} 
            alt={report.title} 
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl animate-scale-up" 
          />
        </div>
      )}
    </div>
  );
}
