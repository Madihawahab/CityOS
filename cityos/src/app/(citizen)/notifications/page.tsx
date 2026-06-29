"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useNotifications } from "@/hooks/useNotifications";
import { useReportsStore } from "@/store/reportsStore";
import { useAppStore } from "@/store/appStore";
import { useAuthStore } from "@/store/authStore";
import { useNotificationsStore } from "@/store/notificationsStore";
import type { Notification, ReportStatus, AIEngineId } from "@/types";

export default function NotificationsPage() {
  const router = useRouter();
  
  // Auth store
  const user = useAuthStore((s) => s.user);

  // Hook to get synced notifications, read states, and unread counts
  const { data = [], isLoading, markRead, markAllRead, unreadCount } = useNotifications();

  // Stores for reports and copilot
  const setReport = useReportsStore((s) => s.setReport);
  const getReportById = useReportsStore((s) => s.getReportById);
  const openCopilot = useAppStore((s) => s.openCopilot);
  const syncNotifications = useNotificationsStore((s) => s.syncNotifications);

  // States
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedWhy, setExpandedWhy] = useState<Record<string, boolean>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [now, setNow] = useState<number | null>(null);

  // Set stable timestamp on mount to prevent render impurity
  useEffect(() => {
    Promise.resolve().then(() => {
      setNow(Date.now());
    });
  }, []);

  // Mobile swipe-to-read state
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [swipingId, setSwipingId] = useState<string | null>(null);

  const minSwipeDistance = 50;

  // Toast helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // AI engine badge configuration
  const getEngineBadge = (engine?: AIEngineId) => {
    if (!engine) return null;
    switch (engine) {
      case "report_intelligence":
        return { label: "🧠 Report Intelligence", bg: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20" };
      case "trust_engine":
        return { label: "🛡️ Trust Engine", bg: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20" };
      case "decision_intelligence":
        return { label: "⚖️ Decision Intelligence", bg: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200" };
      case "civic_intelligence":
        return { label: "📊 Civic Intelligence", bg: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20" };
      case "resolution_intelligence":
        return { label: "✅ Resolution Intelligence", bg: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20" };
      case "civic_copilot":
        return { label: "🤖 Civic Copilot", bg: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20" };
      default:
        return null;
    }
  };

  // Format time display
  const getTimeAgo = (dateInput: Date | string): string => {
    if (!now) return "Just now";
    const diffMs = now - new Date(dateInput).getTime();
    const diffMins = Math.max(0, Math.floor(diffMs / 60000));
    const diffHrs = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHrs / 24);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHrs < 24) return `${diffHrs}h ago`;
    return `${diffDays}d ago`;
  };

  // ─── SWIPE HANDLERS ─────────────────────────────────────────────────────────
  const handleTouchStart = (e: React.TouchEvent, id: string) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0]!.clientX);
    setSwipingId(id);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0]!.clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd || !swipingId) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    if (isLeftSwipe) {
      // Find the notification in data to check if already read
      const notif = data.find((n) => n.notificationId === swipingId);
      if (notif && !notif.isRead) {
        markRead(swipingId);
        showToast("Notification marked as read ✓");
      }
    }
    setTouchStart(null);
    setTouchEnd(null);
    setSwipingId(null);
  };

  // ─── ACTION HANDLERS ────────────────────────────────────────────────────────
  const handleVerifyFix = (reportId: string, notifId: string) => {
    const report = getReportById(reportId);
    if (report) {
      const updated = {
        ...report,
        status: "resolved" as ReportStatus,
        updatedAt: new Date()
      };
      setReport(updated);
      markRead(notifId);
      if (user) syncNotifications(user.userId);
      showToast("Thank you! The report status has been updated to Resolved.");
    }
  };

  const handleVerifyReopen = (reportId: string, notifId: string) => {
    const report = getReportById(reportId);
    if (report) {
      const updated = {
        ...report,
        status: "in_progress" as ReportStatus,
        updatedAt: new Date()
      };
      setReport(updated);
      markRead(notifId);
      if (user) syncNotifications(user.userId);
      showToast("Issue reopened. We have notified authorities to review the work.");
    }
  };

  const handleSupportClick = (reportId: string) => {
    const report = getReportById(reportId);
    if (report) {
      const updated = {
        ...report,
        communitySupport: (report.communitySupport ?? 0) + 1,
        updatedAt: new Date()
      };
      setReport(updated);
      if (user) syncNotifications(user.userId);
      showToast("Your support has been logged. Thank you!");
    }
  };

  const handleActionClick = (notif: Notification & { actionType?: string }) => {
    if (!notif.isRead) {
      markRead(notif.notificationId);
    }

    if (notif.actionType === "ask_copilot") {
      openCopilot();
    } else if (notif.actionType === "open_map" && notif.reportId) {
      router.push(`/map?reportId=${notif.reportId}`);
    } else if (notif.reportId) {
      router.push(`/reports/${notif.reportId}`);
    }
  };

  // ─── FILTER & SEARCH LOGIC ──────────────────────────────────────────────────
  const filteredNotifications = useMemo(() => {
    let items = data as (Notification & {
      readAt?: Date;
      aiEngine?: AIEngineId;
      whyExplanation?: string;
      needsAction?: boolean;
      actionType?: string;
      category?: string;
      department?: string;
      ward?: string;
    })[];

    // 1. Filter by active filter tab
    if (activeFilter === "unread") {
      items = items.filter((n) => !n.isRead);
    } else if (activeFilter === "needs_action") {
      items = items.filter((n) => n.needsAction);
    } else if (activeFilter === "ai") {
      items = items.filter((n) => n.aiEngine);
    } else if (activeFilter === "reports") {
      items = items.filter((n) => ["submitted", "assigned", "work_started", "repair_completed", "verification_requested"].includes(n.type));
    } else if (activeFilter === "community") {
      items = items.filter((n) => n.title.includes("Community") || n.title.includes("Trending") || n.message.includes("supporting") || n.title.includes("Milestone"));
    } else if (activeFilter === "verification") {
      items = items.filter((n) => n.type === "verification_requested" || n.title.includes("Verification"));
    } else if (activeFilter === "nearby") {
      items = items.filter((n) => n.title.includes("Nearby") || n.title.includes("Safety Hazard") || n.type === "nearby_alert");
    } else if (activeFilter === "resolved") {
      items = items.filter((n) => n.title.includes("Resolved") || n.title.includes("Closed"));
    } else if (activeFilter === "announcements") {
      items = items.filter((n) => n.title.includes("Announcement") || n.title.includes("Fair"));
    }

    // 2. Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      items = items.filter((n) => {
        const matchId = n.reportId?.toLowerCase().includes(q);
        const matchTitle = n.title.toLowerCase().includes(q);
        const matchMsg = n.message.toLowerCase().includes(q);
        const matchCat = n.category?.toLowerCase().includes(q);
        const matchDept = n.department?.toLowerCase().includes(q);
        const matchWard = n.ward?.toLowerCase().includes(q);
        const matchStatus = n.type.toLowerCase().includes(q);

        return matchId || matchTitle || matchMsg || matchCat || matchDept || matchWard || matchStatus;
      });
    }

    return items;
  }, [data, activeFilter, searchQuery]);

  // ─── GMAIL-LIKE PRIORITY & TIME GROUPING ─────────────────────────────────────
  const groupedNotifications = useMemo(() => {
    // 1. Group by Priority Category
    const groups: {
      needsAction: typeof filteredNotifications;
      aiUpdates: typeof filteredNotifications;
      progress: typeof filteredNotifications;
      community: typeof filteredNotifications;
      nearby: typeof filteredNotifications;
      announcements: typeof filteredNotifications;
      resolved: typeof filteredNotifications;
    } = {
      needsAction: [],
      aiUpdates: [],
      progress: [],
      community: [],
      nearby: [],
      announcements: [],
      resolved: []
    };

    filteredNotifications.forEach((n) => {
      if (n.needsAction) {
        groups.needsAction.push(n);
      } else if (n.aiEngine && n.type !== "repair_completed" && !n.title.includes("Resolved")) {
        groups.aiUpdates.push(n);
      } else if (n.title.includes("Announcement") || n.title.includes("Fair")) {
        groups.announcements.push(n);
      } else if (n.title.includes("Nearby") || n.title.includes("Safety Hazard") || n.type === "nearby_alert") {
        groups.nearby.push(n);
      } else if (n.title.includes("Community") || n.title.includes("Trending") || n.message.includes("supporting") || n.title.includes("Milestone")) {
        groups.community.push(n);
      } else if (n.title.includes("Resolved") || n.title.includes("Closed") || n.type === "repair_completed") {
        groups.resolved.push(n);
      } else {
        groups.progress.push(n);
      }
    });

    // Helper to group array by time
    const timeGroup = (list: typeof filteredNotifications) => {
      const todayList: typeof filteredNotifications = [];
      const yesterdayList: typeof filteredNotifications = [];
      const earlierList: typeof filteredNotifications = [];

      const startOfToday = new Date().setHours(0, 0, 0, 0);
      const startOfYesterday = startOfToday - 24 * 3600000;

      list.forEach((item) => {
        const t = new Date(item.createdAt).getTime();
        if (t >= startOfToday) {
          todayList.push(item);
        } else if (t >= startOfYesterday) {
          yesterdayList.push(item);
        } else {
          earlierList.push(item);
        }
      });

      return {
        Today: todayList,
        Yesterday: yesterdayList,
        Earlier: earlierList
      };
    };

    // Construct final structured grouping
    return {
      "Needs Your Action": timeGroup(groups.needsAction),
      "AI Updates": timeGroup(groups.aiUpdates),
      "Report Progress": timeGroup(groups.progress),
      "Community Activity": timeGroup(groups.community),
      "Nearby Alerts": timeGroup(groups.nearby),
      "City Announcements": timeGroup(groups.announcements),
      "Resolved Reports": timeGroup(groups.resolved)
    };
  }, [filteredNotifications]);

  // Check if there are any visible notifications in the list
  const hasNotifications = filteredNotifications.length > 0;

  return (
    <div className="min-h-screen bg-background pb-20 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-800 animate-fade-in transition-all">
          <span className="material-symbols-outlined text-emerald-400">check_circle</span>
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <header className="bg-surface border-b border-outline-variant/30 sticky top-16 z-30">
        <div className="flex justify-between items-center px-4 md:px-12 py-3 w-full max-w-[1280px] mx-auto h-16">
          <div>
            <h1 className="font-headline-md text-headline-md font-bold text-primary flex items-center gap-2">
              CityOS Civic Activity Center
            </h1>
            <p className="text-[10px] text-on-surface-variant font-semibold">Live updates, AI analysis, and citizen resolutions</p>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={markAllRead}
              className="text-primary hover:bg-primary-container/20 transition-colors px-4 py-2 rounded-full font-label-md text-label-md focus:ring-2 focus:ring-primary focus:outline-none border border-primary/20 font-bold"
            >
              Mark all read
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        
        {/* Instant Search Bar */}
        <section className="relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/70">search</span>
          <input 
            type="text"
            placeholder="Search by ID, Category, Department, Status, Ward, Keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-surface-container-low border border-outline-variant/50 hover:border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-full text-xs shadow-sm focus:outline-none transition-all placeholder:text-on-surface-variant/50 text-on-surface font-semibold"
            aria-label="Search notifications"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface focus:outline-none"
              aria-label="Clear search"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}
        </section>

        {/* Filters Row */}
        <section className="flex gap-1.5 overflow-x-auto pb-2 no-scrollbar justify-start md:justify-center border-b border-outline-variant/10">
          {[
            { id: "all", label: "All" },
            { id: "unread", label: `Unread (${unreadCount})` },
            { id: "needs_action", label: "Needs Action" },
            { id: "ai", label: "AI Updates" },
            { id: "reports", label: "My Reports" },
            { id: "community", label: "Community" },
            { id: "verification", label: "Verifications" },
            { id: "nearby", label: "Nearby" },
            { id: "resolved", label: "Resolved" },
            { id: "announcements", label: "Announcements" }
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => setActiveFilter(btn.id)}
              className={`px-4 py-1.5 rounded-full font-label-md text-[11px] font-bold whitespace-nowrap transition-colors focus:ring-2 focus:ring-primary focus:outline-none ${
                activeFilter === btn.id
                  ? "bg-primary text-white"
                  : "bg-surface-container-low text-on-surface-variant/80 border border-outline-variant/20 hover:bg-surface-variant/30"
              }`}
            >
              {btn.label}
            </button>
          ))}
        </section>

        {/* Dynamic Activity List */}
        <div className="space-y-6">
          {isLoading && (
            <div className="space-y-4">
              <div className="h-6 bg-surface-container-low rounded animate-pulse w-1/4" />
              <div className="h-20 bg-surface-container-low rounded-xl animate-pulse" />
              <div className="h-20 bg-surface-container-low rounded-xl animate-pulse" />
            </div>
          )}

          {hasNotifications ? (
            Object.entries(groupedNotifications).map(([groupTitle, timeGroups]) => {
              // Check if the group has any notifications in Today, Yesterday, or Earlier
              const hasItems = 
                timeGroups.Today.length > 0 || 
                timeGroups.Yesterday.length > 0 || 
                timeGroups.Earlier.length > 0;

              if (!hasItems) return null;

              return (
                <section key={groupTitle} className="space-y-3">
                  <div className="flex items-center gap-2 border-b border-outline-variant/10 pb-2 mb-2">
                    <h2 className="font-title-lg text-title-md font-black text-primary uppercase tracking-wider">{groupTitle}</h2>
                  </div>
                  
                  {Object.entries(timeGroups).map(([timeTitle, items]) => {
                    if (items.length === 0) return null;

                    return (
                      <div key={timeTitle} className="space-y-3">
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/65 pl-2">{timeTitle}</h3>
                        
                        <div className="space-y-3">
                          {items.map((notif) => {
                            const badge = getEngineBadge(notif.aiEngine);
                            const isRead = notif.isRead;
                            
                            return (
                              <div
                                key={notif.notificationId}
                                onTouchStart={(e) => handleTouchStart(e, notif.notificationId)}
                                onTouchMove={handleTouchMove}
                                onTouchEnd={handleTouchEnd}
                                className={`p-4 rounded-2xl flex flex-col gap-3 border shadow-sm transition-all duration-200 relative overflow-hidden group hover:shadow-md hover:-translate-y-0.5 ${
                                  isRead 
                                    ? "bg-surface-container-low border-outline-variant/20 text-on-surface-variant" 
                                    : "bg-primary/5 border-primary/20 text-on-surface"
                                }`}
                              >
                                {/* Swipe Indicator hint for mobile */}
                                <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />

                                <div className="flex items-start gap-4">
                                  {/* Unread Indicator Pulse */}
                                  {!isRead && (
                                    <span className="absolute top-4 left-4 flex h-2 w-2">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                                    </span>
                                  )}
                                  
                                  <div className="flex-1 space-y-1 pl-3">
                                    <div className="flex justify-between items-start gap-2 flex-wrap">
                                      <h4 className={`text-body-md font-bold ${isRead ? "text-on-surface-variant" : "text-on-surface"}`}>
                                        {notif.title}
                                      </h4>
                                      <span className="text-on-surface-variant/60 font-semibold text-[10px] whitespace-nowrap">
                                        {getTimeAgo(notif.createdAt)}
                                      </span>
                                    </div>
                                    
                                    <p className="text-xs leading-relaxed text-on-surface-variant">
                                      {notif.message}
                                    </p>
                                  </div>
                                </div>

                                {/* Dynamic AI Badges & Why Accordion */}
                                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-outline-variant/10 pt-3 pl-3">
                                  <div className="flex flex-wrap items-center gap-2">
                                    {badge && (
                                      <span className={`px-2.5 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-wider animate-pulse ${badge.bg}`}>
                                        {badge.label}
                                      </span>
                                    )}
                                    {notif.aiEngine && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setExpandedWhy((prev) => ({
                                            ...prev,
                                            [notif.notificationId]: !prev[notif.notificationId]
                                          }));
                                        }}
                                        className="text-[10px] font-bold text-primary hover:underline flex items-center gap-0.5 focus:outline-none"
                                        aria-expanded={expandedWhy[notif.notificationId] || false}
                                      >
                                        Why?
                                        <span className="material-symbols-outlined text-[12px]">
                                          {expandedWhy[notif.notificationId] ? "expand_less" : "expand_more"}
                                        </span>
                                      </button>
                                    )}
                                  </div>

                                  {/* Contextual Action Buttons */}
                                  <div className="flex items-center gap-2">
                                    {notif.needsAction && notif.type === "verification_requested" && notif.reportId ? (
                                      <div className="flex items-center gap-2">
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleVerifyFix(notif.reportId!, notif.notificationId);
                                          }}
                                          className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 rounded-lg text-[10px] font-bold transition-all shadow-sm focus:outline-none"
                                        >
                                          Looks Fixed
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleVerifyReopen(notif.reportId!, notif.notificationId);
                                          }}
                                          className="border border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 px-3 py-1 rounded-lg text-[10px] font-bold transition-all focus:outline-none"
                                        >
                                          Still Exists
                                        </button>
                                      </div>
                                    ) : (
                                      <>
                                        {notif.actionType === "support" && notif.reportId && (
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleSupportClick(notif.reportId!);
                                            }}
                                            className="text-primary hover:bg-primary-container/20 border border-primary/20 px-3.5 py-1 rounded-full text-[10px] font-bold transition-transform active:scale-95 focus:outline-none"
                                          >
                                            Support Issue
                                          </button>
                                        )}
                                        {notif.actionType && notif.actionType !== "support" && (
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleActionClick(notif);
                                            }}
                                            className="bg-primary text-white hover:brightness-110 px-3.5 py-1 rounded-full text-[10px] font-bold transition-transform active:scale-95 focus:outline-none"
                                          >
                                            {notif.actionType === "ask_copilot" ? "Ask AI Copilot" : (notif.actionType === "open_map" ? "Open Map" : "View Report")}
                                          </button>
                                        )}
                                      </>
                                    )}
                                    {!isRead && !notif.needsAction && (
                                      <button 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          markRead(notif.notificationId);
                                        }}
                                        className="text-on-surface-variant/65 hover:text-on-surface p-1 rounded-full hover:bg-surface-container-high transition-colors focus:outline-none"
                                        aria-label="Mark as read"
                                      >
                                        <span className="material-symbols-outlined text-[16px]">done</span>
                                      </button>
                                    )}
                                  </div>
                                </div>

                                {/* Explainable AI Rational Accordion Box */}
                                {expandedWhy[notif.notificationId] && notif.whyExplanation && (
                                  <div className="mt-2 p-3 bg-surface-container rounded-xl border border-outline-variant/30 text-[11px] leading-relaxed text-on-surface-variant animate-slide-down">
                                    <p className="font-bold text-on-surface mb-0.5 flex items-center gap-1">
                                      <span className="material-symbols-outlined text-[14px]">psychology</span>
                                      AI Rationale Explanation
                                    </p>
                                    <p>{notif.whyExplanation}</p>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </section>
              );
            })
          ) : (
            <div className="text-center py-20 bg-surface-container-low rounded-2xl border border-outline-variant/30 flex flex-col items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-6xl text-outline-variant animate-pulse">notifications_off</span>
              <h3 className="text-title-lg font-bold text-on-surface mt-4">No Activity Found</h3>
              <p className="text-xs text-on-surface-variant mt-2 max-w-xs leading-normal">
                No notifications match your current filter or search criteria.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
