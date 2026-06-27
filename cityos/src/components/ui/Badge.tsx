import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";
import { theme } from "@/theme/theme";
import type { IssueSeverity, ReportStatus } from "@/types";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-surface-container text-on-surface-variant",
        primary: "bg-primary-light text-primary",
        success: "bg-secondary/10 text-secondary",
        warning: "bg-tertiary-light text-tertiary",
        error: "bg-error-light text-error",
        ai: "bg-primary-light text-primary",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        md: "px-3 py-1 text-xs",
        lg: "px-4 py-1.5 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

interface BadgeProps extends VariantProps<typeof badgeVariants> {
  children: React.ReactNode;
  className?: string;
  icon?: string;
  dot?: boolean;
  dotColor?: string;
}

export function Badge({ children, variant, size, className, icon, dot, dotColor }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, size }), className)}>
      {dot && (
        <span
          className={cn("h-1.5 w-1.5 rounded-full", dotColor ?? "bg-current")}
          aria-hidden="true"
        />
      )}
      {icon && (
        <span className="material-symbols-outlined" style={{ fontSize: 12 }} aria-hidden="true">
          {icon}
        </span>
      )}
      {children}
    </span>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

interface StatusBadgeProps {
  status: ReportStatus;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const STATUS_VARIANT_MAP: Record<ReportStatus, "default" | "primary" | "success" | "warning" | "error"> = {
  submitted: "default",
  ai_processing: "primary",
  ai_verified: "primary",
  assigned: "warning",
  in_progress: "warning",
  work_started: "warning",
  evidence_uploaded: "primary",
  ai_verifying_repair: "primary",
  citizen_verification_pending: "warning",
  resolved: "success",
  closed: "default",
};

export function StatusBadge({ status, size, className }: StatusBadgeProps) {
  const statusInfo = theme.statusColors[status];
  return (
    <Badge variant={STATUS_VARIANT_MAP[status]} size={size} className={className} dot>
      {statusInfo.label}
    </Badge>
  );
}

// ─── Priority Badge ───────────────────────────────────────────────────────────

interface PriorityBadgeProps {
  priority: IssueSeverity;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const PRIORITY_VARIANT_MAP: Record<IssueSeverity, "error" | "warning" | "primary" | "success"> = {
  critical: "error",
  high: "warning",
  medium: "primary",
  low: "success",
};

export function PriorityBadge({ priority, size, className }: PriorityBadgeProps) {
  const priorityInfo = theme.priorityColors[priority];
  return (
    <Badge variant={PRIORITY_VARIANT_MAP[priority]} size={size} className={className} dot>
      {priorityInfo.label}
    </Badge>
  );
}

// ─── Category Badge ───────────────────────────────────────────────────────────

interface CategoryBadgeProps {
  category: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function CategoryBadge({ category, size, className }: CategoryBadgeProps) {
  const icon = theme.categoryIcons[category as keyof typeof theme.categoryIcons] ?? "category";
  const label = theme.categoryLabels[category as keyof typeof theme.categoryLabels] ?? category;
  return (
    <Badge variant="default" size={size} className={className} icon={icon}>
      {label}
    </Badge>
  );
}
