"use client";

import type { ReactNode } from "react";
import { QueryProvider } from "@/providers/QueryProvider";
import { AppErrorBoundary } from "@/components/errors/AppErrorBoundary";
import { useOfflineStatus } from "@/hooks/useOfflineStatus";
import { useAuth } from "@/hooks/useAuth";

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
  return <>{children}</>;
}
