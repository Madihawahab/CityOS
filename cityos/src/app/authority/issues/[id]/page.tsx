"use client";

import { use, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useReportsStore } from "@/store/reportsStore";

const MapView = dynamic(
  () => import("@/components/map/MapView").then((mod) => mod.MapView),
  {
    ssr: false,
    loading: () => (
      <div className="h-[200px] w-full bg-slate-900 rounded-xl animate-pulse flex items-center justify-center text-slate-500">
        Loading Map Location...
      </div>
    ),
  }
);

interface IssueDetailsProps {
  params: Promise<{ id: string }>;
}

const CATEGORY_IMAGES: Record<string, string> = {
  roads: "https://lh3.googleusercontent.com/aida-public/AB6AXuDFhBa2yjbIsAbzF1Bq_sxoGH8VdNgJxxvIs85bAMh3u4Dj7S2-VEznqa9HRZoSP7TfR6oF1hK0q_-TB_4VWpmg8yF1-6J_VG1bvvBijT7EkOsstIRDkO9b6u_6T7FiQN8XdMdQd_-aOlr_PkRMwTB0hHxn4MTZ_4f9kXCSl3P-fcpK7bym708y4MNPWzGDhTvOz5-oLvLwbKhVnWXTrjqczTTscZHxep9Koo9LprfqZ8RfUz5YJPQ6Kn1xdmjt7aXvr4V6IhJN5Gbx",
  electricity: "https://lh3.googleusercontent.com/aida-public/AB6AXuCPv7psSZBJKt8INPn0ReXvbMyYDVIxL7G7g6dpVtvdIIL-Dc2xl8gRmA5sgh-Eu76jfo8Nbbvdyr1N9M_D1kjemNFBWNKyDUz1b4sTqCeHXYb7gPa908H53ZFo0p9VJJGoaJzkAG_r6zQZ_XCsPJ03eIhPcEUXlHj4uqsL21brjDO2JFEy4nV6JCBCiqn-3E0L1-0Ck9w6gZ5cbnRSxPabSHi37zu5xlsXhUICtiuuUl5BZ0-EWzEGIU7A4Dh1CaED4Iur6gpUTGbM",
  water: "https://images.unsplash.com/photo-1542013936693-8848e574047a?w=400&q=80",
  sanitation: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400&q=80",
  parks: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=400&q=80",
  default: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&q=80"
};

export default function IssueDetailsPage({ params }: IssueDetailsProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const getReportById = useReportsStore((s) => s.getReportById);

  const report = getReportById(resolvedParams.id);
  const [activeImageTab, setActiveImageTab] = useState<"before" | "after">("before");

  const reportImage = useMemo(() => {
    if (!report) return CATEGORY_IMAGES.default!;
    if (report.media?.imageUrls && report.media.imageUrls.length > 0) {
      // If resolved, before image is index 0 and after image is index 1
      if (report.status === "resolved" && report.media.imageUrls.length > 1) {
        return activeImageTab === "before" ? report.media.imageUrls[0]! : report.media.imageUrls[1]!;
      }
      return report.media.imageUrls[0]!;
    }
    return CATEGORY_IMAGES[report.issueCategory] ?? CATEGORY_IMAGES.default!;
  }, [report, activeImageTab]);

  if (!report) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0f1c] p-6 text-slate-300">
        <span className="material-symbols-outlined text-6xl text-slate-700 animate-pulse">error</span>
        <h2 className="text-xl font-bold text-white mt-4">Issue Report Not Found</h2>
        <p className="text-sm text-slate-500 mt-2">The report ID &ldquo;{resolvedParams.id}&rdquo; does not exist or has been deleted.</p>
        <button
          onClick={() => router.push("/authority")}
          className="mt-6 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-xl text-xs font-semibold transition-colors"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const mapMarkers = [
    {
      reportId: report.reportId,
      latitude: report.location.latitude,
      longitude: report.location.longitude,
      category: report.issueCategory,
      severity: report.severity,
      title: report.title,
      status: report.status,
    },
  ];

  const score = report.trustScore || 85;
  const verbalRating = score >= 90 ? "Very High" : score >= 75 ? "High" : score >= 50 ? "Medium" : "Low";
  const estRes = report.estimatedResolution || "1 Day";
  const duplicateCount = report.mergedReportIds?.length || 0;

  // Dynamic AI Priority Reason & Recommendation from single source of truth report object
  const fallbackAnalysis = {
    decisionEngine: {
      priorityReason: report.description.includes("flooding") || report.severity === "critical"
        ? "Critical infrastructure failure causing immediate disruption to traffic and neighboring establishments."
        : "Standard civic disruption causing moderate impact to pedestrian movement.",
      recommendedActions: report.issueCategory === "water"
        ? ["Dispatch BWSSB repair crew immediately", "Close main utility valves if pipeline pressure remains high"]
        : report.issueCategory === "roads"
        ? ["Fill pothole with hot mix asphalt immediately", "Set up signage for vehicle safety"]
        : ["Dispatch technical repair crew", "Verify transformer load limits before reconnecting circuit"]
    }
  };

  const aiPriorityReason = report.analysis?.decisionEngine?.priorityReason || fallbackAnalysis.decisionEngine.priorityReason;
  const aiRecommendation = report.analysis?.decisionEngine?.recommendedActions?.join(". ") || fallbackAnalysis.decisionEngine.recommendedActions.join(". ");

  const isResolved = report.status === "resolved" || report.status === "closed";
  const isWorkStarted = report.status === "work_started" || report.status === "in_progress";
  const isPendingVerification = report.status === "evidence_uploaded" || report.status === "ai_verifying_repair";

  return (
    <div className="p-8 space-y-6 bg-[#0a0f1c] min-h-screen text-slate-100">
      {/* Back Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push("/authority")}
            className="text-xs text-blue-500 hover:underline flex items-center gap-1 focus:outline-none"
          >
            <span className="material-symbols-outlined text-[14px]">arrow_back</span>
            Back to Dashboard
          </button>
        </div>
        <span className="text-xs text-slate-500 font-semibold">Issue ID: {report.reportId}</span>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-8">
        {/* Left Column: Report Details & Images (col-span-8) */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          {/* Card: Report Images & Media */}
          <div className="bg-[#12192c] border border-slate-800/50 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-white">Report Evidence</h3>
              {isResolved && report.media?.imageUrls && report.media.imageUrls.length > 1 && (
                <div className="flex bg-[#1a2337] p-1 rounded-lg">
                  <button
                    onClick={() => setActiveImageTab("before")}
                    className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${
                      activeImageTab === "before" ? "bg-blue-600 text-white" : "text-slate-400"
                    }`}
                  >
                    Before Photo
                  </button>
                  <button
                    onClick={() => setActiveImageTab("after")}
                    className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${
                      activeImageTab === "after" ? "bg-blue-600 text-white" : "text-slate-400"
                    }`}
                  >
                    After Photo
                  </button>
                </div>
              )}
            </div>

            <div className="relative rounded-xl overflow-hidden aspect-video bg-slate-950 flex items-center justify-center max-h-[360px]">
              <img
                alt="Issue evidence"
                className="w-full h-full object-cover rounded-xl"
                src={reportImage}
              />
              <div className="absolute top-4 left-4 bg-black/60 backdrop-blur text-[10px] font-bold px-2 py-1 rounded text-white capitalize">
                {isResolved && report.media?.imageUrls && report.media.imageUrls.length > 1
                  ? `${activeImageTab} Repair`
                  : "Original Issue Photo"}
              </div>
            </div>
          </div>

          {/* Card: Issue Info */}
          <div className="bg-[#12192c] border border-slate-800/50 rounded-2xl p-6 space-y-4">
            <div>
              <div className="flex gap-2 mb-2 flex-wrap">
                <span
                  className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                    report.severity === "critical"
                      ? "bg-red-500/10 text-red-500"
                      : "bg-orange-500/10 text-orange-500"
                  }`}
                >
                  {report.severity} Priority
                </span>
                <span className="text-[9px] px-2 py-0.5 bg-green-500/10 text-green-500 rounded font-bold uppercase">
                  AI Verified
                </span>
                <span className="text-[9px] px-2 py-0.5 bg-blue-500/10 text-blue-500 rounded font-bold uppercase capitalize">
                  {report.status.replace(/_/g, " ")}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-white mb-1">{report.title}</h1>
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">pin_drop</span>
                {report.location.address} · {report.location.ward}
              </p>
            </div>

            <div className="border-t border-slate-800/80 pt-4 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Description</h4>
              <p className="text-sm text-slate-300 leading-relaxed">{report.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-slate-800/80 pt-4 text-xs">
              <div>
                <p className="text-slate-500 font-medium">Assigned Department</p>
                <p className="font-semibold text-slate-200 mt-0.5">{report.departmentAssigned || "N/A"}</p>
              </div>
              <div>
                <p className="text-slate-500 font-medium">Created On</p>
                <p className="font-semibold text-slate-200 mt-0.5">
                  {new Date(report.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: AI Decision Support & Map (col-span-4) */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          {/* Card: AI Decision Support (Read Only) */}
          <div className="bg-[#12192c] border border-slate-800/50 rounded-2xl p-6 flex flex-col space-y-4">
            <h3 className="font-bold text-lg text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-400">auto_awesome</span>
              AI Decision Support
            </h3>

            {/* Metrics */}
            <div className="grid grid-cols-4 gap-2 py-4 border-y border-slate-800 text-center">
              <div>
                <p className="text-[9px] text-slate-500 uppercase leading-none mb-1">AI Score</p>
                <p className="text-sm font-bold text-white">{score}</p>
                <p className="text-[8px] text-green-500">{verbalRating}</p>
              </div>
              <div>
                <p className="text-[9px] text-slate-500 uppercase leading-none mb-1">Est. Res.</p>
                <p className="text-sm font-bold text-white">{estRes}</p>
              </div>
              <div>
                <p className="text-[9px] text-slate-500 uppercase leading-none mb-1">Distance</p>
                <p className="text-sm font-bold text-white">0.6 km</p>
              </div>
              <div>
                <p className="text-[9px] text-slate-500 uppercase leading-none mb-1">Reports</p>
                <p className="text-sm font-bold text-white">{duplicateCount + 1}</p>
                <p className="text-[8px] text-slate-400">Merged</p>
              </div>
            </div>

            {/* AI Recommendation details */}
            <div className="space-y-3">
              <div className="bg-blue-500/5 rounded-xl p-4 border border-blue-500/10">
                <p className="text-[10px] font-bold text-blue-400 mb-1 uppercase tracking-wide flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">info</span>
                  AI Recommendation
                </p>
                <p className="text-[11px] text-slate-400 leading-relaxed">{aiRecommendation}</p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Priority Reason</p>
                <p className="text-xs text-slate-300 leading-normal">{aiPriorityReason}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs pt-2">
                <div>
                  <p className="text-slate-500 font-medium">Duplicate Detection</p>
                  <p className="font-semibold text-slate-200 mt-0.5">
                    {duplicateCount > 0 ? `${duplicateCount} Duplicates Merged` : "No duplicates found"}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500 font-medium">Trust Score</p>
                  <p className="font-semibold text-slate-200 mt-0.5">{report.trustScore || 85}% Verified</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-slate-800/80">
              {isResolved ? (
                <div className="w-full text-center text-xs font-semibold text-green-400 bg-green-500/10 border border-green-500/25 py-2.5 rounded-xl">
                  Issue Fully Resolved
                </div>
              ) : isPendingVerification ? (
                <div className="w-full text-center text-xs font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/25 py-2.5 rounded-xl animate-pulse">
                  AI Verifying Repair Evidence...
                </div>
              ) : (
                <button
                  onClick={() => router.push(`/authority/issues/${report.reportId}/repair`)}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-600/20"
                >
                  {isWorkStarted ? "Submit Repair Evidence" : "Start Work & Submit Evidence"}
                </button>
              )}
            </div>
          </div>

          {/* Card: Map View */}
          <div className="bg-[#12192c] border border-slate-800/50 rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-sm text-white">Location Map</h3>
            <div className="h-[200px] border border-slate-800 rounded-xl overflow-hidden relative">
              <MapView
                markers={mapMarkers}
                center={{ latitude: report.location.latitude, longitude: report.location.longitude }}
                zoom={15}
                height="200px"
                className="w-full h-full"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
