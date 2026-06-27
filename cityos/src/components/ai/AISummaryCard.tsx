import { cn } from "@/lib/utils/cn";

// ─── AI Summary Card ──────────────────────────────────────────────────────────

interface AISummaryCardProps {
  title: string;
  summary: string;
  confidence?: number;
  engine?: string;
  className?: string;
  children?: React.ReactNode;
}

export function AISummaryCard({
  title,
  summary,
  confidence,
  engine = "CityOS Intelligence Layer",
  className,
  children,
}: AISummaryCardProps) {
  return (
    <div
      className={cn(
        "relative rounded-2xl border border-primary/30 bg-gradient-to-br from-primary-light/40 to-primary-light/10 p-4 overflow-hidden",
        className
      )}
      role="region"
      aria-label={`AI analysis: ${title}`}
    >
      {/* AI glow background */}
      <div className="absolute inset-0 ai-pulse opacity-30 pointer-events-none" aria-hidden="true" />

      {/* Header */}
      <div className="relative flex items-center gap-2 mb-3">
        <span
          className="material-symbols-outlined text-primary"
          style={{ fontSize: 20 }}
          aria-hidden="true"
        >
          smart_toy
        </span>
        <h4 className="text-label-md font-semibold text-primary uppercase tracking-wider">
          {engine}
        </h4>
        {confidence !== undefined && (
          <span className="ml-auto badge-ai">
            {Math.round(confidence * 100)}% confidence
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="relative text-title-md font-semibold text-on-surface mb-1">{title}</h3>

      {/* Summary */}
      <p className="relative text-body-md text-on-surface-variant">{summary}</p>

      {/* Children (extra fields) */}
      {children && <div className="relative mt-4">{children}</div>}

      {/* Read-only lock */}
      <div className="relative mt-3 flex items-center gap-1 text-label-md text-primary/60">
        <span className="material-symbols-outlined" style={{ fontSize: 12 }} aria-hidden="true">lock</span>
        AI decisions are final and cannot be modified
      </div>
    </div>
  );
}

// ─── AI Processing Indicator ──────────────────────────────────────────────────

interface AIProcessingCardProps {
  engine: string;
  step: string;
  className?: string;
}

export function AIProcessingCard({ engine, step, className }: AIProcessingCardProps) {
  return (
    <div className={cn("flex items-center gap-4 rounded-2xl border border-primary/20 bg-primary-light/10 p-4", className)}>
      <div className="flex-shrink-0 rounded-full bg-primary p-3">
        <span
          className="material-symbols-outlined text-white animate-spin"
          style={{ fontSize: 20 }}
          aria-hidden="true"
        >
          progress_activity
        </span>
      </div>
      <div>
        <p className="text-body-md font-semibold text-on-surface">{engine}</p>
        <p className="text-label-md text-primary animate-pulse">{step}</p>
      </div>
    </div>
  );
}

// ─── AI Confidence Bar ────────────────────────────────────────────────────────

interface AIConfidenceBarProps {
  confidence: number;
  label?: string;
  className?: string;
}

export function AIConfidenceBar({ confidence, label = "AI Confidence", className }: AIConfidenceBarProps) {
  const pct = Math.round(confidence * 100);
  const color = pct >= 90 ? "bg-secondary" : pct >= 70 ? "bg-primary" : "bg-tertiary";

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center justify-between text-label-md text-on-surface-variant">
        <span>{label}</span>
        <span className="font-semibold text-primary">{pct}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-surface-container">
        <div
          className={cn("h-full rounded-full transition-all duration-1000", color)}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${label}: ${pct}%`}
        />
      </div>
    </div>
  );
}
