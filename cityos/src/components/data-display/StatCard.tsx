import { cn } from "@/lib/utils/cn";
import { Skeleton } from "@/components/ui/Skeleton";

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: string;
  trend?: { value: number; direction: "up" | "down"; label?: string };
  variant?: "default" | "primary" | "success" | "warning" | "error";
  className?: string;
  isLoading?: boolean;
}

const VARIANT_STYLES = {
  default:  { card: "bg-white", icon: "bg-surface-container text-on-surface-variant" },
  primary:  { card: "bg-primary text-white", icon: "bg-white/20 text-white" },
  success:  { card: "bg-secondary text-white", icon: "bg-white/20 text-white" },
  warning:  { card: "bg-tertiary text-white", icon: "bg-white/20 text-white" },
  error:    { card: "bg-error text-white", icon: "bg-white/20 text-white" },
};

export function StatCard({
  label,
  value,
  icon,
  trend,
  variant = "default",
  className,
  isLoading = false,
}: StatCardProps) {
  const styles = VARIANT_STYLES[variant];
  const isColored = variant !== "default";

  if (isLoading) {
    return (
      <div className={cn("rounded-2xl border border-outline-variant/30 p-4 shadow-md", className)}>
        <Skeleton className="h-8 w-8 mb-3" rounded="lg" />
        <Skeleton className="h-8 w-20 mb-2" />
        <Skeleton className="h-3 w-24" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-2xl border p-4 shadow-md transition-transform hover:scale-[1.01]",
        isColored ? `${styles.card} border-transparent` : "bg-white border-outline-variant/30",
        className
      )}
    >
      {icon && (
        <div className={cn("mb-3 inline-flex rounded-xl p-2", styles.icon)}>
          <span
            className="material-symbols-outlined"
            style={{ fontSize: 20 }}
            aria-hidden="true"
          >
            {icon}
          </span>
        </div>
      )}
      <div className={cn("text-2xl font-bold", isColored ? "text-white" : "text-on-surface")}>
        {value}
      </div>
      <div className={cn("mt-1 text-label-md", isColored ? "text-white/80" : "text-on-surface-variant")}>
        {label}
      </div>
      {trend && (
        <div
          className={cn(
            "mt-2 flex items-center gap-1 text-label-md font-medium",
            isColored
              ? "text-white/90"
              : trend.direction === "up"
              ? "text-secondary"
              : "text-error"
          )}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 14 }} aria-hidden="true">
            {trend.direction === "up" ? "trending_up" : "trending_down"}
          </span>
          {trend.value > 0 ? "+" : ""}{trend.value}% {trend.label ?? "vs last week"}
        </div>
      )}
    </div>
  );
}
