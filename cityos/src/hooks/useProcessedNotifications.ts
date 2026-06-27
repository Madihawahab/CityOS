"use client";

import { useMemo } from "react";
import type { Notification } from "@/types";

interface GroupedNotifications {
  reports: Notification[];
  alerts: Notification[];
  announcements: Notification[];
  recommendations: Notification[];
}

export function useProcessedNotifications(notifications: Notification[], filter: string) {
  return useMemo(() => {
    // 1. Filter notifications
    const filtered = notifications.filter((notif) => {
      if (filter === "unread") return !notif.isRead;
      if (filter === "reports") {
        return ["submitted", "assigned", "work_started", "repair_completed", "verification_requested"].includes(notif.type);
      }
      if (filter === "alerts") return notif.type === "nearby_alert";
      return true;
    });

    // 2. Group into categories
    const grouped: GroupedNotifications = {
      reports: [],
      alerts: [],
      announcements: [],
      recommendations: []
    };

    filtered.forEach((notif) => {
      if (
        notif.type === "submitted" ||
        notif.type === "assigned" ||
        notif.type === "work_started" ||
        notif.type === "repair_completed" ||
        notif.type === "verification_requested"
      ) {
        grouped.reports.push(notif);
      } else if (notif.type === "nearby_alert") {
        grouped.alerts.push(notif);
      } else if (notif.type === "ai_suggestion") {
        grouped.recommendations.push(notif);
      } else {
        grouped.announcements.push(notif);
      }
    });

    // Seed a fallback announcement if list is empty to maintain layout visual fidelity
    if (grouped.announcements.length === 0 && (filter === "all" || filter === "alerts")) {
      grouped.announcements.push({
        notificationId: "notif-ann-1",
        userId: "",
        title: "Upcoming Event",
        message: "Annual Community Fair this Saturday at Central Park!",
        type: "nearby_alert",
        isRead: true,
        createdAt: new Date("2026-06-25T10:00:00Z")
      });
    }

    return grouped;
  }, [notifications, filter]);
}
