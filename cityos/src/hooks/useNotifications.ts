"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/utils/constants";
import { mockNotifications } from "@/lib/mock/notifications";
import { demo } from "@/config/demo";
import { useAuthStore } from "@/store/authStore";

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

  const query = useQuery({
    queryKey: QUERY_KEYS.notifications.all,
    queryFn: () => fetchNotifications(user?.userId ?? ""),
    enabled: !!user,
    staleTime: 1000 * 30, // 30 seconds
  });

  const markRead = useMutation({
    mutationFn: async (notifId: string) => {
      if (!demo.isActive) {
        await fetch(`/api/v1/notifications/${notifId}/read`, { method: "PATCH" });
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.notifications.all }),
  });

  const unreadCount = (query.data ?? []).filter(
    (n: { isRead: boolean }) => !n.isRead
  ).length;

  return { ...query, markRead: markRead.mutate, unreadCount };
}
