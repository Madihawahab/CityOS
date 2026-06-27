import { cn } from "@/lib/utils/cn";

interface AIInsightRowProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon?: string;
  className?: string;
  highlight?: boolean;
}

/**
 * Read-only AI decision display row.
 * RULE: All AI-generated fields are read-only. No edit controls ever appear here.
 */
export function AIInsightRow({
  label,
  value,
  subValue,
  icon,
  className,
  highlight = false,
}: AIInsightRowProps) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-4 py-3 border-b border-outline-variant/20 last:border-0",
        highlight && "bg-primary-light/20 -mx-4 px-4 rounded-xl",
        className
      )}
    >
      {/* Label */}
      <div className="flex items-center gap-2 text-body-md text-on-surface-variant">
        {icon && (
          <span className="material-symbols-outlined text-primary flex-shrink-0" style={{ fontSize: 18 }} aria-hidden="true">
            {icon}
          </span>
        )}
        <span>{label}</span>
      </div>

      {/* Value — read-only, clearly non-editable */}
      <div className="flex items-center gap-2 text-right">
        <div>
          <span className="text-body-md font-semibold text-on-surface">{value}</span>
          {subValue && (
            <p className="text-label-md text-on-surface-variant">{subValue}</p>
          )}
        </div>
        {/* AI lock indicator */}
        <span
          className="material-symbols-outlined text-primary flex-shrink-0"
          style={{ fontSize: 16 }}
          aria-label="AI-determined, read-only"
          title="Set by CityOS Intelligence Layer — cannot be modified"
        >
          lock
        </span>
      </div>
    </div>
  );
}

// ─── AI Insight Panel ─────────────────────────────────────────────────────────

interface AIInsightPanelProps {
  rows: Array<Omit<AIInsightRowProps, "className">>;
  title?: string;
  className?: string;
}

export function AIInsightPanel({ rows, title, className }: AIInsightPanelProps) {
  return (
    <div className={cn("rounded-2xl border border-primary/20 bg-primary-light/10 p-4", className)}>
      {title && (
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-primary" style={{ fontSize: 18 }} aria-hidden="true">
            smart_toy
          </span>
          <h4 className="text-label-md font-semibold text-primary uppercase tracking-wider">
            {title}
          </h4>
          <span className="badge-ai ml-auto">
            <span className="material-symbols-outlined" style={{ fontSize: 10 }} aria-hidden="true">lock</span>
            Read-only
          </span>
        </div>
      )}
      {rows.map((row, i) => (
        <AIInsightRow key={i} {...row} />
      ))}
    </div>
  );
}
