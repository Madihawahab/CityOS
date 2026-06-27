import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { StatusBadge, PriorityBadge, CategoryBadge } from "@/components/ui/Badge";
import { formatRelativeTime } from "@/lib/utils/formatters";
import { theme } from "@/theme/theme";
import type { Report } from "@/types";

interface ReportCardProps {
  report: Report;
  href?: string;
  showPriority?: boolean;
  compact?: boolean;
  className?: string;
  onClick?: () => void;
}

export function ReportCard({
  report,
  href,
  showPriority = true,
  compact = false,
  className,
  onClick,
}: ReportCardProps) {
  const categoryIcon = theme.categoryIcons[report.issueCategory] ?? "report_problem";

  const CardContent = (
    <div
      className={cn(
        "rounded-2xl border border-outline-variant/30 bg-white shadow-md transition-all",
        "hover:shadow-lg hover:-translate-y-0.5",
        compact ? "p-3" : "p-4",
        (href || onClick) && "cursor-pointer",
        className
      )}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === "Enter") onClick(); } : undefined}
    >
      {/* Header row */}
      <div className="flex items-start gap-3">
        {/* Category icon */}
        <div className="flex-shrink-0 rounded-xl bg-surface-low p-2 mt-0.5">
          <span
            className="material-symbols-outlined text-on-surface-variant"
            style={{ fontSize: compact ? 18 : 20 }}
            aria-hidden="true"
          >
            {categoryIcon}
          </span>
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <h3 className={cn(
            "font-semibold text-on-surface truncate",
            compact ? "text-body-md" : "text-title-md"
          )}>
            {report.title}
          </h3>

          {!compact && (
            <p className="mt-1 text-body-md text-on-surface-variant line-clamp-2">
              {report.description}
            </p>
          )}

          {/* Location */}
          <div className="mt-2 flex items-center gap-1 text-label-md text-on-surface-variant">
            <span className="material-symbols-outlined" style={{ fontSize: 14 }} aria-hidden="true">
              location_on
            </span>
            <span className="truncate">{report.location.address}</span>
          </div>
        </div>
      </div>

      {/* Footer row */}
      <div className={cn("flex flex-wrap items-center gap-2", compact ? "mt-2" : "mt-3")}>
        <StatusBadge status={report.status} size="sm" />
        {showPriority && report.priority && (
          <PriorityBadge priority={report.priority} size="sm" />
        )}
        <CategoryBadge category={report.issueCategory} size="sm" />

        {/* Right side */}
        <div className="ml-auto flex items-center gap-3 text-label-md text-on-surface-variant">
          {report.communitySupport > 0 && (
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined" style={{ fontSize: 14 }} aria-hidden="true">
                thumb_up
              </span>
              {report.communitySupport}
            </span>
          )}
          <time dateTime={report.createdAt.toISOString()}>
            {formatRelativeTime(report.createdAt)}
          </time>
        </div>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block focus:outline-none focus:ring-2 focus:ring-primary rounded-2xl">
        {CardContent}
      </Link>
    );
  }

  return CardContent;
}
