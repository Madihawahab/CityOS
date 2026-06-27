import { cn } from "@/lib/utils/cn";

interface SkeletonProps {
  className?: string;
  rounded?: "sm" | "md" | "lg" | "full";
}

export function Skeleton({ className, rounded = "md" }: SkeletonProps) {
  const roundedClass = {
    sm: "rounded",
    md: "rounded-xl",
    lg: "rounded-2xl",
    full: "rounded-full",
  }[rounded];

  return (
    <div
      className={cn(
        "animate-pulse bg-surface-container",
        roundedClass,
        className
      )}
      aria-hidden="true"
    />
  );
}

// ─── Composed Skeletons ───────────────────────────────────────────────────────

export function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-outline-variant/30 bg-white p-4 shadow-sm space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10" rounded="full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-5/6" />
      <div className="flex gap-2">
        <Skeleton className="h-6 w-20" rounded="full" />
        <Skeleton className="h-6 w-16" rounded="full" />
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="rounded-2xl border border-outline-variant/30 bg-white p-4 shadow-sm">
      <Skeleton className="h-8 w-8 mb-3" rounded="lg" />
      <Skeleton className="h-8 w-20 mb-2" />
      <Skeleton className="h-3 w-24" />
    </div>
  );
}

export function ListRowSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="flex items-center gap-4 p-4">
          <Skeleton className="h-10 w-10 flex-shrink-0" rounded="lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-6 w-16" rounded="full" />
        </div>
      ))}
    </div>
  );
}
