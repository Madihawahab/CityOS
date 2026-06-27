import { cn } from "@/lib/utils/cn";
import { formatRelativeTime } from "@/lib/utils/formatters";
import type { Notification, NotificationType } from "@/types";

interface NotificationItemProps {
  notification: Notification;
  onClick?: () => void;
  className?: string;
}

const TYPE_ICONS: Record<NotificationType, string> = {
  submitted: "upload",
  assigned: "assignment_ind",
  work_started: "construction",
  repair_completed: "check_circle",
  verification_requested: "rate_review",
  nearby_alert: "location_on",
  ai_suggestion: "smart_toy",
};

const TYPE_COLORS: Record<NotificationType, string> = {
  submitted: "bg-surface-container text-on-surface-variant",
  assigned: "bg-primary-light text-primary",
  work_started: "bg-tertiary-light text-tertiary",
  repair_completed: "bg-secondary/10 text-secondary",
  verification_requested: "bg-tertiary-light text-tertiary",
  nearby_alert: "bg-error-light text-error",
  ai_suggestion: "bg-primary-light text-primary",
};

export function NotificationItem({ notification, onClick, className }: NotificationItemProps) {
  const icon = TYPE_ICONS[notification.type];
  const colorClass = TYPE_COLORS[notification.type];

  return (
    <div
      className={cn(
        "flex items-start gap-3 px-4 py-4 transition-colors border-b border-outline-variant/20",
        !notification.isRead && "bg-primary-light/30",
        onClick && "cursor-pointer hover:bg-surface-low",
        className
      )}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === "Enter") onClick(); } : undefined}
      aria-label={notification.title}
    >
      {/* Icon */}
      <div className={cn("flex-shrink-0 rounded-xl p-2 mt-0.5", colorClass)}>
        <span className="material-symbols-outlined" style={{ fontSize: 18 }} aria-hidden="true">
          {icon}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={cn(
            "text-body-md text-on-surface",
            !notification.isRead && "font-semibold"
          )}>
            {notification.title}
          </p>
          {!notification.isRead && (
            <span className="flex-shrink-0 h-2 w-2 rounded-full bg-primary mt-1" aria-label="Unread" />
          )}
        </div>
        <p className="mt-0.5 text-label-md text-on-surface-variant line-clamp-2">
          {notification.message}
        </p>
        <time
          className="mt-1 block text-label-md text-on-surface-variant"
          dateTime={notification.createdAt.toISOString()}
        >
          {formatRelativeTime(notification.createdAt)}
        </time>
      </div>
    </div>
  );
}
