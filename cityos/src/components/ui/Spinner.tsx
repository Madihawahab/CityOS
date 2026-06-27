import { cn } from "@/lib/utils/cn";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
}

const SIZES = { sm: "h-4 w-4", md: "h-8 w-8", lg: "h-12 w-12" };
const BORDER = { sm: "border-2", md: "border-[3px]", lg: "border-4" };

export function Spinner({ size = "md", className, label = "Loading..." }: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label={label}
      className={cn("flex items-center justify-center", className)}
    >
      <div
        className={cn(
          "rounded-full border-surface-container border-t-primary animate-spin",
          SIZES[size],
          BORDER[size]
        )}
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}

export function FullPageSpinner({ label = "Loading CityOS..." }: { label?: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <Spinner size="lg" />
      <p className="text-body-md text-on-surface-variant animate-pulse">{label}</p>
    </div>
  );
}
