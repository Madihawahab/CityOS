"use client";

import { useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/utils/constants";
import { mockNotifications } from "@/lib/mock/notifications";
import { demo } from "@/config/demo";
import { useAuthStore } from "@/store/authStore";
import { useNotificationsStore } from "@/store/notificationsStore";
import type { Notification } from "@/types";

async function fetchNotifications(userId: string) {
  if (demo.isActive) {
    return mockNotifications.filter((n) => n.userId === userId);
  }
  const res = await fetch("/api/v1/notifications");
  if (!res.ok) throw new Error("Failed to fetch notifications");
  return res.json();
}

export function useNotifications() {
  const user = useAuthStore((s) => s.user);
  const qc = useQueryClient();

  // Zustand notifications store hooks (for Citizen AI Civic Activity Center)
  const isCitizen = user?.role === "citizen";
  const storeNotifications = useNotificationsStore((s) => s.notifications);
  const markReadStore = useNotificationsStore((s) => s.markRead);
  const markAllReadStore = useNotificationsStore((s) => s.markAllRead);
  const syncNotifications = useNotificationsStore((s) => s.syncNotifications);

  // Sync notifications whenever user changes or store updates
  useEffect(() => {
    if (user && isCitizen) {
      syncNotifications(user.userId);
    }
  }, [user, isCitizen, syncNotifications]);

  // Query for backend/mock fallback (e.g. for Authority users or non-citizen pages)
  const query = useQuery({
    queryKey: QUERY_KEYS.notifications.all,
    queryFn: () => fetchNotifications(user?.userId ?? ""),
    enabled: !!user && !isCitizen,
    staleTime: 1000 * 30, // 30 seconds
  });

  const queryMarkRead = useMutation({
    mutationFn: async (notifId: string) => {
      if (!demo.isActive) {
        await fetch(`/api/v1/notifications/${notifId}/read`, { method: "PATCH" });
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.notifications.all }),
  });

  // Compile final data
  const data = useMemo(() => {
    if (isCitizen && user) {
      return Object.values(storeNotifications)
        .filter((n) => n.userId === user.userId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) as Notification[];
    }
    return (query.data ?? []) as Notification[];
  }, [isCitizen, user, storeNotifications, query.data]);

  const unreadCount = useMemo(() => {
    return data.filter((n) => !n.isRead).length;
  }, [data]);

  const markRead = (id: string) => {
    if (isCitizen) {
      markReadStore(id);
    } else {
      queryMarkRead.mutate(id);
    }
  };

  const markAllRead = () => {
    if (isCitizen && user) {
      markAllReadStore(user.userId);
    } else if (user) {
      // Invalidate queries or mark all read on mock backend
      const unread = ((query.data ?? []) as Notification[]).filter((n) => !n.isRead);
      unread.forEach((n) => queryMarkRead.mutate(n.notificationId));
    }
  };

  return {
    data,
    isLoading: isCitizen ? false : query.isLoading,
    markRead,
    markAllRead,
    unreadCount
  };
}
