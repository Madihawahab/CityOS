// ─── Page State Components ─────────────────────────────────────────────────────
// Every page must support all 6 states: Loading, Error, Empty, Success, Skeleton, Offline

import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";

// ─── Error State ──────────────────────────────────────────────────────────────

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  message = "An unexpected error occurred. Please try again.",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 py-16 px-8 text-center",
        className
      )}
      role="alert"
    >
      <div className="rounded-full bg-error-light p-4">
        <span
          className="material-symbols-outlined text-error"
          style={{ fontSize: 36 }}
          aria-hidden="true"
        >
          error_outline
        </span>
      </div>
      <div className="space-y-1">
        <h3 className="text-title-md font-semibold text-on-surface">{title}</h3>
        <p className="text-body-md text-on-surface-variant max-w-sm">{message}</p>
      </div>
      {onRetry && (
        <Button onClick={onRetry} variant="secondary" size="md" icon="refresh">
          Try Again
        </Button>
      )}
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: string;
  action?: { label: string; onClick: () => void; icon?: string };
  className?: string;
}

export function EmptyState({
  title = "Nothing here yet",
  message = "There are no items to display.",
  icon = "inbox",
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 py-16 px-8 text-center",
        className
      )}
    >
      <div className="rounded-full bg-surface-container p-4">
        <span
          className="material-symbols-outlined text-on-surface-variant"
          style={{ fontSize: 36 }}
          aria-hidden="true"
        >
          {icon}
        </span>
      </div>
      <div className="space-y-1">
        <h3 className="text-title-md font-semibold text-on-surface">{title}</h3>
        <p className="text-body-md text-on-surface-variant max-w-sm">{message}</p>
      </div>
      {action && (
        <Button onClick={action.onClick} icon={action.icon}>
          {action.label}
        </Button>
      )}
    </div>
  );
}

// ─── Offline State ────────────────────────────────────────────────────────────

interface OfflineStateProps {
  message?: string;
  className?: string;
}

export function OfflineState({
  message = "You're offline. CityOS is working from cached data.",
  className,
}: OfflineStateProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-2xl bg-tertiary-light/50 border border-tertiary/20 px-4 py-3",
        className
      )}
      role="status"
      aria-live="polite"
    >
      <span
        className="material-symbols-outlined text-tertiary flex-shrink-0"
        aria-hidden="true"
      >
        wifi_off
      </span>
      <p className="text-body-md font-medium text-tertiary">{message}</p>
    </div>
  );
}

// ─── Page Skeleton ────────────────────────────────────────────────────────────

import { Skeleton, CardSkeleton, StatCardSkeleton, ListRowSkeleton } from "@/components/ui/Skeleton";

interface PageSkeletonProps {
  variant?: "dashboard" | "list" | "detail" | "map";
  className?: string;
}

export function PageSkeleton({ variant = "dashboard", className }: PageSkeletonProps) {
  if (variant === "dashboard") {
    return (
      <div className={cn("space-y-6", className)} aria-busy="true" aria-label="Loading...">
        {/* Stats row */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[0,1,2,3].map((i) => <StatCardSkeleton key={i} />)}
        </div>
        {/* Cards */}
        <div className="grid gap-4 md:grid-cols-2">
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <CardSkeleton />
      </div>
    );
  }

  if (variant === "list") {
    return (
      <div className={cn("space-y-4", className)} aria-busy="true" aria-label="Loading...">
        <Skeleton className="h-10 w-full" rounded="full" />
        <div className="rounded-2xl border border-outline-variant/30 overflow-hidden">
          <ListRowSkeleton count={8} />
        </div>
      </div>
    );
  }

  if (variant === "detail") {
    return (
      <div className={cn("space-y-6", className)} aria-busy="true" aria-label="Loading...">
        <Skeleton className="h-8 w-2/3" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-20" rounded="full" />
          <Skeleton className="h-6 w-16" rounded="full" />
        </div>
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)} aria-busy="true" aria-label="Loading...">
      <Skeleton className="h-64 w-full" rounded="lg" />
      <CardSkeleton />
    </div>
  );
}

// ─── Loading Page ─────────────────────────────────────────────────────────────

export function LoadingPage({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <Spinner size="lg" />
      <p className="text-body-md text-on-surface-variant animate-pulse">{message}</p>
    </div>
  );
}
