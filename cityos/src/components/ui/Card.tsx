import { cn } from "@/lib/utils/cn";
import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  glass?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
}

const PADDING = { none: "", sm: "p-3", md: "p-4", lg: "p-6" };

export function Card({
  children,
  className,
  glass = false,
  padding = "md",
  hover = false,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-outline-variant/30",
        glass ? "glass-card" : "bg-white shadow-md",
        PADDING[padding],
        hover && "cursor-pointer transition-shadow hover:shadow-lg",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// ─── Card sub-components ──────────────────────────────────────────────────────

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  icon?: string;
  className?: string;
}

export function CardHeader({ title, subtitle, action, icon, className }: CardHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between gap-4 mb-4", className)}>
      <div className="flex items-center gap-3 min-w-0">
        {icon && (
          <div className="flex-shrink-0 rounded-xl bg-primary-light p-2">
            <span
              className="material-symbols-outlined text-primary"
              style={{ fontSize: 20 }}
              aria-hidden="true"
            >
              {icon}
            </span>
          </div>
        )}
        <div className="min-w-0">
          <h3 className="text-title-md font-semibold text-on-surface truncate">{title}</h3>
          {subtitle && (
            <p className="text-label-md text-on-surface-variant mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

interface CardDividerProps {
  className?: string;
}

export function CardDivider({ className }: CardDividerProps) {
  return <hr className={cn("border-outline-variant/30 -mx-4 my-4", className)} />;
}
