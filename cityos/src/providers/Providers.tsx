"use client";

import type { ReactNode } from "react";
import { QueryProvider } from "@/providers/QueryProvider";
import { AppErrorBoundary } from "@/components/errors/AppErrorBoundary";
import { useOfflineStatus } from "@/hooks/useOfflineStatus";
import { useAuth } from "@/hooks/useAuth";

import { useEffect } from "react";
import { useAppStore } from "@/store/appStore";

interface ProvidersProps {
  children: ReactNode;
}

/**
 * Root global providers. Order matters:
 * 1. AppErrorBoundary (outermost — catches everything)
 * 2. QueryProvider (TanStack Query)
 * 3. AppBootstrap (auth sync + offline detection)
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <AppErrorBoundary>
      <QueryProvider>
        <AppBootstrap>{children}</AppBootstrap>
      </QueryProvider>
    </AppErrorBoundary>
  );
}

/**
 * Bootstrap component — initializes auth and offline status on mount.
 * Must be a client component inside QueryProvider.
 */
function AppBootstrap({ children }: { children: ReactNode }) {
  // These hooks are side-effect only — they sync state with stores
  useAuth();
  useOfflineStatus();
  return <ThemeBootstrap>{children}</ThemeBootstrap>;
}

function ThemeBootstrap({ children }: { children: ReactNode }) {
  const theme = useAppStore((s) => s.theme);

  useEffect(() => {
    const root = window.document.documentElement;
    const applyTheme = (t: "light" | "dark" | "system") => {
      root.classList.remove("light", "dark");
      if (t === "system") {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        root.classList.add(systemTheme);
      } else {
        root.classList.add(t);
      }
    };

    applyTheme(theme);

    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = () => applyTheme("system");
      mediaQuery.addEventListener("change", handler);
      return () => mediaQuery.removeEventListener("change", handler);
    }
  }, [theme]);

  return <>{children}</>;
}
