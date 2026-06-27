"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useNotifications } from "@/hooks/useNotifications";
import { useProcessedNotifications } from "@/hooks/useProcessedNotifications";
import type { Notification } from "@/types";

export default function NotificationsPage() {
  const router = useRouter();
  const { data = [], isLoading, markRead, unreadCount } = useNotifications();
  const [activeFilter, setActiveFilter] = useState("all");
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    Promise.resolve().then(() => {
      setNow(Date.now());
    });
  }, []);

  // Filter and group notifications via custom hook
  const groupedNotifications = useProcessedNotifications(data, activeFilter);

  const handleMarkAllRead = () => {
    const unread = data.filter((n: Notification) => !n.isRead);
    unread.forEach((n: Notification) => markRead(n.notificationId));
  };

  const handleNotificationClick = (notif: Notification) => {
    if (!notif.isRead) {
      markRead(notif.notificationId);
    }
    if (notif.reportId) {
      router.push(`/reports/${notif.reportId}`);
    }
  };

  const getTimeAgo = (date: Date | string): string => {
    if (!now) return "Just now";
    const diffMs = now - new Date(date).getTime();
    const diffMins = Math.max(0, Math.floor(diffMs / 60000));
    const diffHrs = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHrs / 24);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHrs < 24) return `${diffHrs}h ago`;
    return `${diffDays}d ago`;
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "assigned":
      case "work_started":
        return {
          icon: "engineering",
          colorClass: "bg-secondary-container text-on-secondary-container"
        };
      case "repair_completed":
      case "verification_requested":
        return {
          icon: "check_circle",
          colorClass: "bg-secondary text-white"
        };
      case "nearby_alert":
        return {
          icon: "water_drop",
          colorClass: "bg-error-container text-on-error-container"
        };
      case "ai_suggestion":
        return {
          icon: "lightbulb",
          colorClass: "bg-primary text-white"
        };
      default:
        return {
          icon: "campaign",
          colorClass: "bg-primary-container text-on-primary-container"
        };
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      
      {/* Top Bar */}
      <header className="bg-white border-b border-outline-variant/30 sticky top-16 z-30">
        <div className="flex justify-between items-center px-4 md:px-12 py-3 w-full max-w-[1280px] mx-auto h-16">
          <h1 className="font-headline-lg text-headline-lg font-bold text-primary">CityOS Notifications</h1>
          <div className="flex items-center gap-4">
            <button 
              onClick={handleMarkAllRead}
              className="text-on-surface-variant hover:bg-surface-container-low transition-colors px-4 py-2 rounded-full font-label-md text-label-md focus:ring-2 focus:ring-primary focus:outline-none"
            >
              Mark all read
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        
        {/* Filters Row */}
        <section className="flex gap-2 overflow-x-auto pb-2 no-scrollbar justify-center">
          {[
            { id: "all", label: "All" },
            { id: "unread", label: `Unread (${unreadCount})` },
            { id: "reports", label: "Reports" },
            { id: "alerts", label: "Alerts" }
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => setActiveFilter(btn.id)}
              className={`px-5 py-2 rounded-full font-label-md text-label-md whitespace-nowrap transition-colors focus:ring-2 focus:ring-primary ${
                activeFilter === btn.id
                  ? "bg-primary text-white"
                  : "bg-surface-container-highest text-on-surface-variant hover:bg-surface-variant"
              }`}
            >
              {btn.label}
            </button>
          ))}
        </section>

        {/* Notifications List */}
        <div className="space-y-8">
          
          {/* Reports Category */}
          {groupedNotifications.reports.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between mb-2 px-2">
                <h2 className="font-title-lg text-title-lg font-bold text-on-surface">My Reports</h2>
                <span className="bg-primary-container text-on-primary-container px-3 py-0.5 rounded-full font-label-md text-label-md">
                  {groupedNotifications.reports.filter(n => !n.isRead).length} New
                </span>
              </div>
              <div className="space-y-4">
                {groupedNotifications.reports.map((notif) => {
                  const ui = getNotificationIcon(notif.type);
                  return (
                    <div 
                      key={notif.notificationId}
                      onClick={() => handleNotificationClick(notif)}
                      className={`p-5 rounded-lg flex gap-4 border border-outline-variant/10 shadow-sm transition-all duration-200 cursor-pointer hover:shadow-md hover:-translate-y-0.5 ${
                        notif.isRead ? "bg-white" : "bg-primary/5 border-primary/20"
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${ui.colorClass}`}>
                        <span className="material-symbols-outlined">{ui.icon}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1 gap-2">
                          <h3 className="font-body-lg text-body-lg font-bold text-on-surface">{notif.title}</h3>
                          <span className="text-outline font-label-md text-label-md whitespace-nowrap">{getTimeAgo(notif.createdAt)}</span>
                        </div>
                        <p className="text-on-surface-variant font-body-md text-body-md leading-relaxed">{notif.message}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Nearby Alerts Category */}
          {groupedNotifications.alerts.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between mb-2 px-2">
                <h2 className="font-title-lg text-title-lg font-bold text-on-surface">Nearby Alerts</h2>
              </div>
              <div className="space-y-4">
                {groupedNotifications.alerts.map((notif) => {
                  const ui = getNotificationIcon(notif.type);
                  return (
                    <div 
                      key={notif.notificationId}
                      onClick={() => handleNotificationClick(notif)}
                      className={`p-5 rounded-lg flex gap-4 border border-outline-variant/10 shadow-sm transition-all duration-200 cursor-pointer hover:shadow-md hover:-translate-y-0.5 ${
                        notif.isRead ? "bg-white" : "bg-primary/5 border-primary/20"
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${ui.colorClass}`}>
                        <span className="material-symbols-outlined">{ui.icon}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1 gap-2">
                          <h3 className="font-body-lg text-body-lg font-bold text-on-surface">{notif.title}</h3>
                          <span className="text-outline font-label-md text-label-md whitespace-nowrap">{getTimeAgo(notif.createdAt)}</span>
                        </div>
                        <p className="text-on-surface-variant font-body-md text-body-md leading-relaxed">{notif.message}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* AI Recommendations Category */}
          {groupedNotifications.recommendations.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center gap-2 mb-2 px-2">
                <h2 className="font-title-lg text-title-lg font-bold text-on-surface">AI Recommendations</h2>
                <span className="material-symbols-outlined text-primary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              </div>
              <div className="space-y-4">
                {groupedNotifications.recommendations.map((notif) => (
                  <div 
                    key={notif.notificationId}
                    onClick={() => handleNotificationClick(notif)}
                    className="p-5 bg-white rounded-lg flex gap-4 border border-primary/20 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer relative overflow-hidden"
                    style={{ boxShadow: "0 0 15px rgba(0, 74, 198, 0.08)" }}
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
                    <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center shrink-0 z-10">
                      <span className="material-symbols-outlined">lightbulb</span>
                    </div>
                    <div className="flex-1 z-10">
                      <div className="flex justify-between items-start mb-1 gap-2">
                        <h3 className="font-body-lg text-body-lg font-bold text-on-surface">{notif.title}</h3>
                        <span className="text-outline font-label-md text-label-md whitespace-nowrap">{getTimeAgo(notif.createdAt)}</span>
                      </div>
                      <p className="text-on-surface-variant font-body-md text-body-md leading-relaxed">{notif.message}</p>
                      {notif.reportId && (
                        <div className="flex gap-2 mt-4">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/reports/${notif.reportId}`);
                            }}
                            className="bg-primary text-white px-4 py-1.5 rounded-full font-label-md text-label-md hover:brightness-110 active:scale-95 transition-transform"
                          >
                            View Proposal
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Announcements Category */}
          {groupedNotifications.announcements.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between mb-2 px-2">
                <h2 className="font-title-lg text-title-lg font-bold text-on-surface">City Announcements</h2>
              </div>
              <div className="space-y-4">
                {groupedNotifications.announcements.map((notif) => {
                  const ui = getNotificationIcon(notif.type);
                  return (
                    <div 
                      key={notif.notificationId}
                      className="bg-white p-5 rounded-lg flex gap-4 border border-outline-variant/10 shadow-sm"
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${ui.colorClass}`}>
                        <span className="material-symbols-outlined">{ui.icon}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1 gap-2">
                          <h3 className="font-body-lg text-body-lg font-bold text-on-surface">{notif.title}</h3>
                          <span className="text-outline font-label-md text-label-md whitespace-nowrap">{getTimeAgo(notif.createdAt)}</span>
                        </div>
                        <p className="text-on-surface-variant font-body-md text-body-md leading-relaxed">{notif.message}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {data.length === 0 && !isLoading && (
            <div className="text-center py-20 bg-white rounded-lg border border-outline-variant/30">
              <span className="material-symbols-outlined text-6xl text-outline-variant">notifications_off</span>
              <h3 className="text-title-lg font-bold text-on-surface mt-4">No Notifications</h3>
              <p className="text-body-md text-on-surface-variant mt-2">You are all caught up!</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
