import { cn } from "@/lib/utils/cn";
import { formatDateTime } from "@/lib/utils/formatters";
import type { ReportStatus } from "@/types";

interface TimelineEvent {
  status: string;
  label: string;
  timestamp?: Date;
  note?: string;
  isAI?: boolean;
}

interface ProgressTimelineProps {
  events: TimelineEvent[];
  currentStatus: ReportStatus;
  className?: string;
}

export function ProgressTimeline({ events, currentStatus, className }: ProgressTimelineProps) {

  return (
    <div className={cn("space-y-0", className)} aria-label="Report progress timeline">
      {events.map((event, index) => {
        const isCompleted = index < events.length - 1 || ["resolved", "closed"].includes(currentStatus);
        const isCurrent = index === events.length - 1 && !isCompleted;

        return (
          <div key={index} className="flex gap-4">
            {/* Timeline line + dot */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full",
                  isCompleted
                    ? "bg-secondary text-white"
                    : isCurrent
                    ? "bg-primary text-white ring-4 ring-primary/20"
                    : "bg-surface-container text-on-surface-variant"
                )}
                aria-current={isCurrent ? "step" : undefined}
              >
                {event.isAI ? (
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }} aria-hidden="true">
                    smart_toy
                  </span>
                ) : isCompleted ? (
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }} aria-hidden="true">
                    check
                  </span>
                ) : (
                  <span className="text-xs font-bold">{index + 1}</span>
                )}
              </div>
              {index < events.length - 1 && (
                <div
                  className={cn(
                    "mt-1 w-0.5 flex-1 min-h-[24px]",
                    isCompleted ? "bg-secondary" : "bg-outline-variant"
                  )}
                  aria-hidden="true"
                />
              )}
            </div>

            {/* Content */}
            <div className={cn("pb-6 flex-1 min-w-0", index === events.length - 1 && "pb-0")}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className={cn(
                    "text-body-md font-semibold",
                    isCurrent ? "text-primary" : isCompleted ? "text-on-surface" : "text-on-surface-variant"
                  )}>
                    {event.label}
                  </p>
                  {event.note && (
                    <p className="mt-0.5 text-label-md text-on-surface-variant">{event.note}</p>
                  )}
                  {event.isAI && (
                    <span className="badge-ai mt-1 inline-flex">
                      <span className="material-symbols-outlined" style={{ fontSize: 10 }} aria-hidden="true">smart_toy</span>
                      CityOS Intelligence Layer
                    </span>
                  )}
                </div>
                {event.timestamp && (
                  <time
                    className="flex-shrink-0 text-label-md text-on-surface-variant"
                    dateTime={event.timestamp.toISOString()}
                  >
                    {formatDateTime(event.timestamp)}
                  </time>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
