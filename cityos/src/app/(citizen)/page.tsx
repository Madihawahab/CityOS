"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { useAppStore } from "@/store/appStore";
import { mockReports } from "@/lib/mock/reports";
import type { Report, ReportStatus } from "@/types";

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

function getStatusChip(status: ReportStatus) {
  switch (status) {
    case "in_progress":
    case "work_started":
      return {
        label: "In Progress",
        style: { backgroundColor: "#6cf8bb", color: "#00714d" },
      };
    case "resolved":
    case "closed":
      return {
        label: "Resolved",
        style: { backgroundColor: "#dbe1ff", color: "#004ac6" },
      };
    case "ai_verified":
    case "submitted":
      return {
        label: "Verified",
        style: { backgroundColor: "#d8e3fb", color: "#434655" },
      };
    default:
      return {
        label: "Submitted",
        style: { backgroundColor: "#e7eeff", color: "#111c2d" },
      };
  }
}

export default function CitizenHomePage() {
  const user = useAuthStore((s) => s.user);
  const openCopilot = useAppStore((s) => s.openCopilot);
  const router = useRouter();
  const [greeting, setGreeting] = useState("Good Day");

  useEffect(() => {
    const h = new Date().getHours();
    let currentGreeting = "Good Day";
    if (h < 12) currentGreeting = "Good Morning";
    else if (h < 17) currentGreeting = "Good Afternoon";
    else currentGreeting = "Good Evening";

    const timer = setTimeout(() => {
      setGreeting(currentGreeting);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const displayName = user?.fullName ?? "John";

  // Filter user reports if logged in, otherwise default to top mock reports
  const userReports = mockReports.filter(r => r.citizenId === user?.userId);
  const displayReports = userReports.length > 0 ? userReports.slice(0, 2) : mockReports.slice(0, 2);

  // Dynamic impact calculations
  const totalReportsCount = userReports.length || 12;
  const solvedCount = userReports.filter(r => ["resolved", "closed"].includes(r.status)).length;
  const solvedPercent = userReports.length > 0 ? Math.round((solvedCount / totalReportsCount) * 100) : 92;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f9f9ff" }}>
      <main className="max-w-[1280px] mx-auto px-4 md:px-12 py-8">
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Welcome & Summary */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {/* Welcome Greeting */}
            <div>
              <h1 className="text-headline-lg text-on-surface font-bold">
                {greeting}, {displayName} 👋
              </h1>
              <p className="text-body-lg text-on-surface-variant mt-2">
                Ready to make your community a better place today?
              </p>
            </div>

            {/* AI Summary Card */}
            <div 
              className="p-6 rounded-lg shadow-sm relative overflow-hidden group"
              style={{ backgroundColor: "#004ac6", color: "#eeefff" }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl transition-transform group-hover:scale-110"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined" aria-hidden="true">auto_awesome</span>
                  <span className="text-title-lg font-bold">Today&apos;s AI Summary</span>
                </div>
                <ul className="space-y-3 text-body-lg">
                  <li className="flex items-center gap-3">
                    <span 
                      className="material-symbols-outlined" 
                      style={{ color: "#6cf8bb" }}
                      aria-hidden="true"
                    >
                      check_circle
                    </span>
                    3 road repairs completed nearby your current location.
                  </li>
                  <li className="flex items-center gap-3">
                    <span 
                      className="material-symbols-outlined" 
                      style={{ color: "#6cf8bb" }}
                      aria-hidden="true"
                    >
                      report_problem
                    </span>
                    2 new issues reported in your district this morning.
                  </li>
                  <li className="flex items-center gap-3">
                    <span 
                      className="material-symbols-outlined" 
                      style={{ color: "#6cf8bb" }}
                      aria-hidden="true"
                    >
                      notifications_off
                    </span>
                    No critical alerts for your saved zones today.
                  </li>
                </ul>
              </div>
            </div>

            {/* Quick Action Button */}
            <button 
              onClick={() => router.push("/reports/new")}
              className="bg-primary hover:bg-primary-hover text-white py-6 rounded-lg text-title-lg shadow-lg flex items-center justify-center gap-3 transition-all transform active:scale-95 group font-medium"
            >
              <span className="material-symbols-outlined text-3xl group-hover:rotate-90 transition-transform" aria-hidden="true">
                add_circle
              </span>
              Report New Issue
            </button>

            {/* Recent Reports (List/Cards) */}
            <div className="flex flex-col gap-4 mt-4">
              <div className="flex justify-between items-center">
                <h2 className="text-title-lg text-on-surface font-bold">Your Recent Reports</h2>
                <Link href="/reports" className="text-primary text-label-md hover:underline font-medium">
                  View All
                </Link>
              </div>

              {displayReports.map((report) => {
                const chip = getStatusChip(report.status);
                return (
                  <div 
                    key={report.reportId}
                    className="bg-white p-4 rounded-lg flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="w-20 h-20 rounded-md overflow-hidden flex-shrink-0 relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        className="w-full h-full object-cover" 
                        alt={report.title} 
                        src={getReportImage(report)}
                      />
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="text-body-lg font-bold text-on-surface truncate">
                          {report.title}
                        </h3>
                        <span 
                          className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex-shrink-0"
                          style={chip.style}
                        >
                          {chip.label}
                        </span>
                      </div>
                      <p className="text-on-surface-variant text-body-md mt-1">
                        Reported {getFormattedDate(report.createdAt)} &bull; {report.location.ward || "District 4"}
                      </p>
                      <button 
                        onClick={() => router.push(`/reports/${report.reportId}`)}
                        className="text-primary text-label-md mt-2 flex items-center gap-1 hover:gap-2 transition-all font-medium"
                      >
                        View Details 
                        <span className="material-symbols-outlined text-sm animate-none" aria-hidden="true">
                          arrow_forward
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Map, Impact & Timeline */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* Live Community Map Preview */}
            <div className="bg-white rounded-lg overflow-hidden shadow-sm flex flex-col">
              <div 
                className="h-48 relative cursor-pointer group"
                onClick={() => router.push("/map")}
              >
                <div 
                  className="absolute inset-0 bg-surface-dim bg-cover bg-center transition-transform duration-300 group-hover:scale-105" 
                  style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDJF1KYgMtUy1NIjKzQXy7XHvWvwBi8V0QshdfegYSEwlxArS_DyK3IZHX8_5goe-FGtwIp8shOPEWGa245Vyh7PdedG9wV_4ywwTRBcyNRwJQl3QmtH-ERHv1iAA5GVc-uVxvyd2w-Odl8t81EpcwVJZDIFZh3pVwmsPuKhEuXMvCMsZoEZH0AEGTnyQ9uKyClN1imFxoUK7c6Hq3u_U78v8wLpg8djYyLv3BHKhyix2TNTS8TEyxs82ugWUIRF3YNfMpmwWHwzJyy')" }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent flex items-end p-4">
                  <button 
                    onClick={(e) => { e.stopPropagation(); router.push("/map"); }}
                    className="bg-white/90 backdrop-blur text-primary text-label-md px-4 py-2 rounded-full flex items-center gap-2 hover:bg-white active:scale-95 transition-all font-medium shadow-sm"
                  >
                    <span className="material-symbols-outlined text-sm" aria-hidden="true">open_in_full</span>
                    Expand Map
                  </button>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-body-lg font-bold text-on-surface">Nearby Issues (8)</h3>
                <p className="text-on-surface-variant text-body-md mt-1">Most active near Broadway &amp; 42nd St.</p>
              </div>
            </div>

            {/* Community Impact Card */}
            <div className="bg-surface-container p-6 rounded-lg shadow-sm">
              <h3 className="text-title-lg text-on-surface font-bold mb-4">Your Impact</h3>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white p-3 rounded-lg text-center shadow-sm">
                  <span className="block text-headline-lg text-primary font-bold">{totalReportsCount}</span>
                  <span className="text-label-md text-on-surface-variant font-medium">Reports</span>
                </div>
                <div className="bg-white p-3 rounded-lg text-center shadow-sm">
                  <span className="block text-headline-lg text-secondary font-bold">{solvedPercent}%</span>
                  <span className="text-label-md text-on-surface-variant font-medium">Solved</span>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white/40 p-3 rounded-lg border border-primary/10">
                <span className="material-symbols-outlined text-primary" aria-hidden="true">volunteer_activism</span>
                <p className="text-body-md italic text-on-surface-variant">
                  &ldquo;Your reports help improve your community every single day.&rdquo;
                </p>
              </div>
            </div>

            {/* Latest Updates Timeline */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-title-lg text-on-surface font-bold mb-6">Latest Updates</h3>
              <div className="relative space-y-6 before:content-[''] before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[2px] before:bg-outline-variant">
                <div className="relative pl-10">
                  <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-secondary-container flex items-center justify-center z-10 border-4 border-white">
                    <span 
                      className="material-symbols-outlined text-[12px]" 
                      style={{ color: "#00714d" }} 
                      aria-hidden="true"
                    >
                      done_all
                    </span>
                  </div>
                  <div>
                    <h4 className="text-body-md font-bold text-on-surface">Repair completed</h4>
                    <p className="text-on-surface-variant text-[12px]">Crosby Park Graffiti Removal &bull; 2h ago</p>
                  </div>
                </div>
                <div className="relative pl-10">
                  <div className="absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center z-10 border-4 border-white" style={{ backgroundColor: "#004ac6" }}>
                    <span className="material-symbols-outlined text-white text-[12px]" aria-hidden="true">engineering</span>
                  </div>
                  <div>
                    <h4 className="text-body-md font-bold text-on-surface">Department assigned</h4>
                    <p className="text-on-surface-variant text-[12px]">Water Main Leak &bull; 5h ago</p>
                  </div>
                </div>
                <div className="relative pl-10">
                  <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-surface-container-highest flex items-center justify-center z-10 border-4 border-white">
                    <span className="material-symbols-outlined text-on-surface-variant text-[12px]" aria-hidden="true">verified</span>
                  </div>
                  <div>
                    <h4 className="text-body-md font-bold text-on-surface">Issue verified</h4>
                    <p className="text-on-surface-variant text-[12px]">Broken Street Light &bull; 1d ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Floating AI Copilot FAB & Menu */}
      <div className="fixed bottom-24 right-6 md:bottom-8 md:right-8 z-[60] flex flex-col items-end gap-3 group">
        {/* Floating Options Menu (Visible on hover/group-hover) */}
        <div className="flex flex-col gap-2 items-end mb-2 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 pointer-events-none group-hover:pointer-events-auto transition-all duration-300">
          <button 
            onClick={() => router.push("/map")}
            className="bg-white px-4 py-2 rounded-full shadow-lg text-body-md font-bold text-primary flex items-center gap-2 hover:bg-primary-container hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-lg" aria-hidden="true">search</span> 
            Find Nearby Issues
          </button>
          <button 
            onClick={() => router.push("/reports")}
            className="bg-white px-4 py-2 rounded-full shadow-lg text-body-md font-bold text-primary flex items-center gap-2 hover:bg-primary-container hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-lg" aria-hidden="true">track_changes</span> 
            Track My Report
          </button>
          <button 
            onClick={() => router.push("/reports/new")}
            className="bg-white px-4 py-2 rounded-full shadow-lg text-body-md font-bold text-primary flex items-center gap-2 hover:bg-primary-container hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-lg" aria-hidden="true">add</span> 
            Report Issue
          </button>
        </div>
        {/* Main Assistant Button */}
        <button 
          onClick={openCopilot}
          className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary-hover shadow-2xl flex items-center justify-center text-white active:scale-90 transition-transform duration-200 ring-4 ring-white/50" 
          aria-label="Open CivicCopilot AI assistant"
        >
          <span className="material-symbols-outlined text-3xl" aria-hidden="true">bolt</span>
        </button>
      </div>
    </div>
  );
}
