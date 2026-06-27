"use client";

import { useState, useEffect, useCallback } from "react";
import { useAppStore } from "@/store/appStore";
import { features } from "@/config/features";

/**
 * Tracks browser online/offline status and syncs with the app store.
 */
export function useOfflineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof window !== "undefined" ? window.navigator.onLine : true
  );
  const setOffline = useAppStore((s) => s.setOffline);

  useEffect(() => {
    if (!features.ENABLE_OFFLINE_MODE) return;

    const handleOnline = () => {
      setIsOnline(true);
      setOffline(false);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setOffline(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [setOffline]);

  return { isOnline, isOffline: !isOnline };
}
