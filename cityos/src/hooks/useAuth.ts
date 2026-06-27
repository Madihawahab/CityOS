"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { onAuthChange } from "@/lib/firebase/auth";
import { features } from "@/config/features";
import { logger } from "@/lib/logger/logger";
import { demo } from "@/config/demo";

/**
 * Primary auth hook. Syncs Firebase auth state with Zustand store.
 * In Demo Mode, auth is managed entirely by the store.
 */
export function useAuth() {
  const { user, isLoading, isAuthenticated, setUser, setLoading, logout, loginAsDemo } =
    useAuthStore();

  useEffect(() => {
    // Demo mode — no Firebase subscription needed
    if (demo.isActive || !features.ENABLE_FIREBASE) {
      setLoading(false);
      return;
    }

    // Subscribe to Firebase auth state changes
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        // In a real app, we'd fetch the full user profile from Firestore here
        // For now, map FirebaseUser to our User type
        setUser({
          userId: firebaseUser.uid,
          fullName: firebaseUser.displayName ?? "User",
          email: firebaseUser.email ?? "",
          role: "citizen", // Default — actual role fetched from Firestore
          anonymousDefault: false,
          createdAt: new Date(firebaseUser.metadata.creationTime ?? Date.now()),
          lastLogin: new Date(),
        });
        logger.auth("AUTH_STATE_CHANGED", firebaseUser.uid);
      } else {
        setUser(null);
      }
    });

    return unsubscribe;
  }, [setUser, setLoading]);

  return {
    user,
    isLoading,
    isAuthenticated,
    role: user?.role ?? null,
    logout,
    loginAsDemo,
    isCitizen: user?.role === "citizen",
    isAuthority: user?.role === "authority",
    isAdmin: user?.role === "admin",
  };
}
