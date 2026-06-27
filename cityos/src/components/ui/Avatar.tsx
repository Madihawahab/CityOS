import { cn } from "@/lib/utils/cn";

interface AvatarProps {
  name: string;
  imageUrl?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  role?: string;
}

const SIZES = {
  xs: "h-6 w-6 text-xs",
  sm: "h-8 w-8 text-sm",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-lg",
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("");
}

// Deterministic color from name
function getAvatarColor(name: string): string {
  const colors = [
    "bg-primary-light text-primary",
    "bg-secondary/10 text-secondary",
    "bg-tertiary-light text-tertiary",
    "bg-error-light text-error",
    "bg-surface-container text-on-surface",
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index] ?? colors[0]!;
}

export function Avatar({ name, imageUrl, size = "md", className, role }: AvatarProps) {
  const sizeClass = SIZES[size];
  const colorClass = getAvatarColor(name);

  if (imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imageUrl}
        alt={`${name} avatar`}
        className={cn("rounded-full object-cover flex-shrink-0", sizeClass, className)}
        role={role}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full font-semibold flex-shrink-0",
        sizeClass,
        colorClass,
        className
      )}
      aria-label={`${name} avatar`}
      role={role}
    >
      {getInitials(name)}
    </div>
  );
}
