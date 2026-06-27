"use client";

import { cn } from "@/lib/utils/cn";
import { features } from "@/config/features";

/**
 * Demo Mode Banner — shown at top of all portals when NEXT_PUBLIC_APP_ENV=demo.
 * Always visible when active. Cannot be dismissed (by design for demo sessions).
 * The audience must not be able to distinguish Demo Mode from Live Mode
 * — this banner is the ONLY indicator.
 */
export function DemoModeBanner({ className }: { className?: string }) {
  if (!features.ENABLE_DEMO_MODE) return null;

  return (
    <div
      className={cn(
        "flex items-center justify-center gap-2 bg-tertiary text-white px-4 py-2 text-sm font-medium",
        className
      )}
      role="banner"
      aria-label="Demo mode active"
    >
      <span className="material-symbols-outlined flex-shrink-0" style={{ fontSize: 16 }} aria-hidden="true">
        play_circle
      </span>
      <span>
        <strong>Demo Mode</strong> — Real-time AI simulation with live-equivalent experience
      </span>
      <span className="ml-2 h-2 w-2 rounded-full bg-white animate-pulse flex-shrink-0" aria-hidden="true" />
    </div>
  );
}
