import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";
import type { ButtonHTMLAttributes, ReactNode } from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        primary: "bg-primary text-white hover:bg-primary-hover shadow-sm",
        secondary: "border border-outline bg-transparent text-on-surface hover:bg-surface-low",
        ghost: "bg-transparent text-primary hover:bg-primary-light",
        danger: "bg-error text-white hover:bg-red-700",
        "ghost-danger": "bg-transparent text-error hover:bg-error-light",
      },
      size: {
        sm: "rounded-full px-4 py-2 text-sm min-h-[36px]",
        md: "rounded-full px-6 py-3 text-sm min-h-[48px]",
        lg: "rounded-full px-8 py-4 text-base min-h-[56px]",
        icon: "rounded-full p-3 min-h-[48px] min-w-[48px]",
        "icon-sm": "rounded-full p-2 min-h-[36px] min-w-[36px]",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  children: ReactNode;
  loading?: boolean;
  icon?: string; // Material Symbol name
  iconPosition?: "left" | "right";
}

export function Button({
  className,
  variant,
  size,
  children,
  loading,
  icon,
  iconPosition = "left",
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled ?? loading}
      aria-busy={loading}
      {...props}
    >
      {loading ? (
        <>
          <span
            className="material-symbols-outlined animate-spin text-sm"
            aria-hidden="true"
          >
            progress_activity
          </span>
          {children}
        </>
      ) : (
        <>
          {icon && iconPosition === "left" && (
            <span className="material-symbols-outlined text-sm" aria-hidden="true">
              {icon}
            </span>
          )}
          {children}
          {icon && iconPosition === "right" && (
            <span className="material-symbols-outlined text-sm" aria-hidden="true">
              {icon}
            </span>
          )}
        </>
      )}
    </button>
  );
}
