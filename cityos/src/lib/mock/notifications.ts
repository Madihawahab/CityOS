import type { Notification } from "@/types";

const now = new Date();
const t = (minutesAgo: number) => new Date(now.getTime() - minutesAgo * 60000);

export const mockNotifications: Notification[] = [
  // ── AI Suggestions ─────────────────────────────────────────────────────────
  {
    notificationId: "notif-1",
    userId: "demo-citizen-1",
    title: "CityOS Intelligence Update",
    message: "Your water pipeline report has been verified by AI with 96% confidence and assigned to BWSSB Water Works. Expected resolution: 4 hours.",
    type: "assigned",
    reportId: "RPT-2026-001",
    isRead: false,
    createdAt: t(15),
  },
  {
    notificationId: "notif-2",
    userId: "demo-citizen-1",
    title: "⚠️ Nearby Critical Alert",
    message: "A critical electricity issue has been reported 200m from your location at MG Road. CityOS has dispatched BESCOM on priority.",
    type: "nearby_alert",
    reportId: "RPT-2026-005",
    isRead: false,
    createdAt: t(45),
  },
  {
    notificationId: "notif-3",
    userId: "demo-citizen-1",
    title: "Work Started on Your Report",
    message: "BBMP Roads team has started repair work on the pothole you reported at ORR, Marathahalli. Track progress in your dashboard.",
    type: "work_started",
    reportId: "RPT-2026-004",
    isRead: true,
    createdAt: t(120),
  },
  {
    notificationId: "notif-4",
    userId: "demo-citizen-1",
    title: "Verify Repair — Action Required",
    message: "BESCOM has completed the street light repair you reported in Banashankari. Please verify if the issue is resolved.",
    type: "verification_requested",
    reportId: "RPT-2026-010",
    isRead: false,
    createdAt: t(240),
  },
  {
    notificationId: "notif-5",
    userId: "demo-citizen-1",
    title: "Report Resolved ✓",
    message: "The sanitation issue you reported at Jayanagar 4th Main has been fully resolved and verified. Thank you for making Bengaluru cleaner!",
    type: "repair_completed",
    reportId: "RPT-2026-006",
    isRead: true,
    createdAt: t(1440),
  },
  {
    notificationId: "notif-6",
    userId: "demo-citizen-1",
    title: "AI Tip — Report Faster",
    message: "You can now use voice description when submitting a report. Try saying 'Water pipe burst near my location' and CityOS will auto-categorise it.",
    type: "ai_suggestion",
    isRead: true,
    createdAt: t(2880),
  },
  {
    notificationId: "notif-7",
    userId: "demo-citizen-1",
    title: "Report Submitted Successfully",
    message: "Your report about the broken playground equipment in Cubbon Park has been received. CityOS AI will analyse it shortly.",
    type: "submitted",
    reportId: "RPT-2026-011",
    isRead: true,
    createdAt: t(5760),
  },
  {
    notificationId: "notif-8",
    userId: "demo-citizen-1",
    title: "6 Similar Reports Merged",
    message: "Your drainage blockage report near Hebbal flyover has been merged with 5 similar reports. This increases your priority score.",
    type: "ai_suggestion",
    reportId: "RPT-2026-007",
    isRead: true,
    createdAt: t(8640),
  },
];

export function getNotificationsByUser(userId: string): Notification[] {
  return mockNotifications.filter((n) => n.userId === userId);
}

export function getUnreadCount(userId: string): number {
  return mockNotifications.filter((n) => n.userId === userId && !n.isRead).length;
}
