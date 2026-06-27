"use client";

import { cn } from "@/lib/utils/cn";
import type { ReactNode } from "react";

interface PageShellProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  headerAction?: ReactNode;
  noPadding?: boolean;
  className?: string;
  "aria-label"?: string;
}

/**
 * Consistent page wrapper used by every page in all portals.
 * Provides standardized title, subtitle, and header action layout.
 */
export function PageShell({
  children,
  title,
  subtitle,
  headerAction,
  noPadding = false,
  className,
  "aria-label": ariaLabel,
}: PageShellProps) {
  return (
    <main
      className={cn("flex-1 min-h-0", className)}
      aria-label={ariaLabel ?? title}
    >
      {/* Page header */}
      {(title || headerAction) && (
        <div className={cn("flex items-start justify-between gap-4", noPadding ? "px-4 pt-4 pb-0" : "px-4 pt-4 pb-0")}>
          {title && (
            <div>
              <h1 className="text-headline-md font-bold text-on-surface">{title}</h1>
              {subtitle && (
                <p className="mt-1 text-body-md text-on-surface-variant">{subtitle}</p>
              )}
            </div>
          )}
          {headerAction && (
            <div className="flex-shrink-0 mt-1">{headerAction}</div>
          )}
        </div>
      )}

      {/* Page content */}
      <div className={cn(!noPadding && "px-4 py-4")}>
        {children}
      </div>
    </main>
  );
}
