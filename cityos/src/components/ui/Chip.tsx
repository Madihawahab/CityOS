import { cn } from "@/lib/utils/cn";
import type { ButtonHTMLAttributes } from "react";

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  selected?: boolean;
  icon?: string;
  count?: number;
  onRemove?: () => void;
  asDiv?: boolean;
}

export function Chip({
  label,
  selected = false,
  icon,
  count,
  onRemove,
  className,
  asDiv = false,
  ...props
}: ChipProps) {
  const content = (
    <>
      {icon && (
        <span className="material-symbols-outlined" style={{ fontSize: 16 }} aria-hidden="true">
          {icon}
        </span>
      )}
      <span>{label}</span>
      {count !== undefined && (
        <span
          className={cn(
            "flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-xs font-bold",
            selected ? "bg-white/20" : "bg-primary-light text-primary"
          )}
        >
          {count}
        </span>
      )}
      {onRemove && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="ml-0.5 hover:opacity-70 transition-opacity"
          aria-label={`Remove ${label} filter`}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 14 }} aria-hidden="true">
            close
          </span>
        </button>
      )}
    </>
  );

  const chipClass = cn(
    "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all cursor-pointer select-none min-h-[36px]",
    selected
      ? "bg-primary text-white shadow-sm"
      : "border border-outline-variant bg-white text-on-surface-variant hover:bg-surface-low hover:border-outline",
    className
  );

  if (asDiv) {
    return <div className={chipClass}>{content}</div>;
  }

  return (
    <button
      className={chipClass}
      aria-pressed={selected}
      {...props}
    >
      {content}
    </button>
  );
}

// ─── Chip Group ───────────────────────────────────────────────────────────────

interface ChipGroupProps {
  chips: Array<{ value: string; label: string; icon?: string; count?: number }>;
  selected: string | string[];
  onSelect: (value: string) => void;
  multiSelect?: boolean;
  className?: string;
}

export function ChipGroup({ chips, selected, onSelect, multiSelect = false, className }: ChipGroupProps) {
  const selectedArr = Array.isArray(selected) ? selected : [selected];
  return (
    <div
      className={cn("flex flex-wrap gap-2", className)}
      role={multiSelect ? "group" : "radiogroup"}
    >
      {chips.map((chip) => (
        <Chip
          key={chip.value}
          label={chip.label}
          icon={chip.icon}
          count={chip.count}
          selected={selectedArr.includes(chip.value)}
          onClick={() => onSelect(chip.value)}
          role={multiSelect ? "checkbox" : "radio"}
        />
      ))}
    </div>
  );
}
