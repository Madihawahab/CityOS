import { cn } from "@/lib/utils/cn";
import { StatusBadge, PriorityBadge } from "@/components/ui/Badge";
import { formatRelativeTime } from "@/lib/utils/formatters";
import { theme } from "@/theme/theme";
import type { Report } from "@/types";

interface IssueListRowProps {
  report: Report;
  onClick?: () => void;
  selected?: boolean;
  showDepartment?: boolean;
  className?: string;
}

export function IssueListRow({
  report,
  onClick,
  selected = false,
  showDepartment = true,
  className,
}: IssueListRowProps) {
  const categoryIcon = theme.categoryIcons[report.issueCategory] ?? "report_problem";

  return (
    <div
      className={cn(
        "flex items-center gap-4 px-4 py-3 border-b border-outline-variant/20 transition-colors cursor-pointer",
        selected ? "bg-primary-light" : "hover:bg-surface-low",
        className
      )}
      onClick={onClick}
      role="row"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter") onClick?.(); }}
      aria-selected={selected}
    >
      {/* Category icon */}
      <div className="flex-shrink-0 rounded-lg bg-surface-container p-2">
        <span
          className="material-symbols-outlined text-on-surface-variant"
          style={{ fontSize: 18 }}
          aria-hidden="true"
        >
          {categoryIcon}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-body-md font-semibold text-on-surface truncate">
            {report.title}
          </span>
          {report.priority && <PriorityBadge priority={report.priority} size="sm" />}
        </div>
        <div className="mt-0.5 flex items-center gap-3 text-label-md text-on-surface-variant">
          <span className="truncate">{report.location.ward ?? report.location.address}</span>
          {showDepartment && report.departmentAssigned && (
            <>
              <span aria-hidden="true">·</span>
              <span className="truncate">{report.departmentAssigned}</span>
            </>
          )}
        </div>
      </div>

      {/* Right side */}
      <div className="flex-shrink-0 flex flex-col items-end gap-1">
        <StatusBadge status={report.status} size="sm" />
        <time
          className="text-label-md text-on-surface-variant"
          dateTime={report.createdAt.toISOString()}
        >
          {formatRelativeTime(report.createdAt)}
        </time>
      </div>

      {/* Arrow */}
      <span className="material-symbols-outlined text-on-surface-variant flex-shrink-0" aria-hidden="true">
        chevron_right
      </span>
    </div>
  );
}
