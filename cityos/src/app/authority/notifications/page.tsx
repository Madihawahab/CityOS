"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useNotifications } from "@/hooks/useNotifications";
import { useAuthStore } from "@/store/authStore";
import type { Notification } from "@/types";

// Pure static base time to avoid calling impure Date.now() during render
const BASE_TIME = new Date("2026-06-28T13:00:00Z").getTime();

export default function AuthorityNotificationsPage() {
  const user = useAuthStore((s) => s.user);
  const { data: userNotifications = [], markRead } = useNotifications();

  const departmentName = user?.department || "BWSSB Water Works";

  // Create department fallback notifications to make the page functional
  const notifications = useMemo((): Notification[] => {
    const list: Notification[] = [
      {
        notificationId: "notif-auth-1",
        userId: user?.userId || "demo-authority-1",
        title: "🚨 New Critical Assignment",
        message: `A critical water pipeline burst has been reported at Koramangala 4th Block and assigned to ${departmentName} with an AI score of 94.`,
        type: "assigned",
        reportId: "RPT-2026-001",
        isRead: false,
        createdAt: new Date(BASE_TIME - 10 * 60000), // 10m ago
      },
      {
        notificationId: "notif-auth-2",
        userId: user?.userId || "demo-authority-1",
        title: "✓ Repair Evidence Pending Verification",
        message: "Officer Sunil uploaded repair photos for No Water Supply issue #RPT-2026-008. AI verification in progress.",
        type: "verification_requested",
        reportId: "RPT-2026-008",
        isRead: false,
        createdAt: new Date(BASE_TIME - 45 * 60000), // 45m ago
      },
      {
        notificationId: "notif-auth-3",
        userId: user?.userId || "demo-authority-1",
        title: "⚡ Department Performance Alert",
        message: `Your department ${departmentName} achieved an average resolution time of 18 hours this week, outperforming target BBMP guidelines.`,
        type: "ai_suggestion",
        isRead: true,
        createdAt: new Date(BASE_TIME - 120 * 60000), // 2h ago
      },
    ];

    // Combine with real ones if they match user, otherwise use fallback
    return userNotifications.length > 0 ? (userNotifications as unknown as Notification[]) : list;
  }, [userNotifications, user, departmentName]);

  return (
    <div className="p-8 space-y-8 bg-[#0a0f1c] min-h-screen text-slate-100">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Notifications</h2>
          <p className="text-slate-400 text-sm">System updates and urgent issue dispatches for {departmentName}.</p>
        </div>
        <Link
          href="/authority"
          className="text-xs text-blue-500 hover:underline flex items-center gap-1 focus:outline-none"
        >
          <span className="material-symbols-outlined text-[14px]">arrow_back</span>
          Back to Dashboard
        </Link>
      </header>

      {/* Notifications List */}
      <section className="bg-[#12192c] border border-slate-800/50 rounded-2xl p-6 max-w-4xl mx-auto space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h3 className="font-bold text-sm text-slate-300">Recent Activity</h3>
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
            {notifications.filter((n) => !n.isRead).length} Unread
          </span>
        </div>

        <div className="space-y-3">
          {notifications.map((notif) => (
            <div
              key={notif.notificationId}
              onClick={() => markRead(notif.notificationId)}
              className={`p-4 rounded-xl border transition-all flex gap-4 cursor-pointer ${
                notif.isRead
                  ? "bg-[#161e31]/20 border-slate-800/60 text-slate-400"
                  : "bg-[#1a2337]/50 border-blue-500/20 text-slate-100 hover:border-blue-500/40"
              }`}
            >
              <div className="mt-0.5">
                {notif.type === "assigned" || notif.type === "nearby_alert" ? (
                  <span className="material-symbols-outlined text-red-400" style={{ fontSize: 22 }}>
                    error
                  </span>
                ) : notif.type === "verification_requested" ? (
                  <span className="material-symbols-outlined text-amber-400" style={{ fontSize: 22 }}>
                    hourglass_empty
                  </span>
                ) : (
                  <span className="material-symbols-outlined text-blue-400" style={{ fontSize: 22 }}>
                    info
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-200">{notif.title}</h4>
                  <span className="text-[9px] text-slate-500">
                    {new Date(notif.createdAt).toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{notif.message}</p>
                {notif.reportId && (
                  <div className="mt-2">
                    <Link
                      href={`/authority/issues/${notif.reportId}`}
                      className="text-[10px] text-blue-400 font-semibold hover:underline flex items-center gap-0.5"
                    >
                      View Linked Issue <span className="material-symbols-outlined text-[10px]">open_in_new</span>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
