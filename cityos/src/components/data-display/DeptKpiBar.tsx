import { cn } from "@/lib/utils/cn";

interface DeptKpiBarProps {
  department: string;
  resolved: number;
  total: number;
  avgHours: number;
  resolutionRate: number;
  rank?: number;
  className?: string;
}

export function DeptKpiBar({
  department,
  resolved,
  total,
  avgHours,
  resolutionRate,
  rank,
  className,
}: DeptKpiBarProps) {
  const pct = Math.min(resolutionRate, 100);
  const barColor =
    pct >= 90 ? "bg-secondary" :
    pct >= 75 ? "bg-primary" :
    pct >= 60 ? "bg-tertiary" :
    "bg-error";

  const shortName = department.replace("BBMP ", "").replace("BWSSB ", "").replace("BESCOM ", "");

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {rank !== undefined && (
            <span className="flex-shrink-0 h-6 w-6 rounded-full bg-surface-container flex items-center justify-center text-xs font-bold text-on-surface-variant">
              {rank}
            </span>
          )}
          <span className="text-body-md font-medium text-on-surface truncate" title={department}>
            {shortName}
          </span>
        </div>
        <div className="flex items-center gap-4 flex-shrink-0 text-label-md text-on-surface-variant">
          <span>{resolved}/{total}</span>
          <span className="font-semibold text-on-surface">{pct}%</span>
        </div>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-surface-container" aria-hidden="true">
        <div
          className={cn("h-full rounded-full transition-all duration-700", barColor)}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${department} resolution rate ${pct}%`}
        />
      </div>
      <div className="text-label-md text-on-surface-variant">
        Avg resolution: {avgHours < 24 ? `${avgHours}h` : `${Math.round(avgHours / 24)}d`}
      </div>
    </div>
  );
}
