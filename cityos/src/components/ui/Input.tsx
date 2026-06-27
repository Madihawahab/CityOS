import { cn } from "@/lib/utils/cn";
import type { InputHTMLAttributes, TextareaHTMLAttributes, ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: string;
  className?: string;
  containerClassName?: string;
}

export function Input({
  label,
  error,
  hint,
  icon,
  className,
  containerClassName,
  id,
  ...props
}: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className={cn("space-y-1.5", containerClassName)}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-label-md font-medium text-on-surface"
        >
          {label}
          {props.required && <span className="text-error ml-0.5" aria-hidden="true">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span
            className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none"
            style={{ fontSize: 20 }}
            aria-hidden="true"
          >
            {icon}
          </span>
        )}
        <input
          id={inputId}
          className={cn(
            "input-base",
            icon && "pl-11",
            error && "border-error focus:border-error focus:ring-error/20",
            className
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...props}
        />
      </div>
      {error && (
        <p id={`${inputId}-error`} className="text-label-md text-error" role="alert">
          {error}
        </p>
      )}
      {hint && !error && (
        <p id={`${inputId}-hint`} className="text-label-md text-on-surface-variant">
          {hint}
        </p>
      )}
    </div>
  );
}

// ─── Textarea ─────────────────────────────────────────────────────────────────

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  containerClassName?: string;
}

export function Textarea({
  label,
  error,
  hint,
  className,
  containerClassName,
  id,
  ...props
}: TextareaProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className={cn("space-y-1.5", containerClassName)}>
      {label && (
        <label htmlFor={inputId} className="block text-label-md font-medium text-on-surface">
          {label}
          {props.required && <span className="text-error ml-0.5" aria-hidden="true">*</span>}
        </label>
      )}
      <textarea
        id={inputId}
        className={cn(
          "input-base resize-none",
          error && "border-error focus:border-error focus:ring-error/20",
          className
        )}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} className="text-label-md text-error" role="alert">
          {error}
        </p>
      )}
      {hint && !error && (
        <p className="text-label-md text-on-surface-variant">{hint}</p>
      )}
    </div>
  );
}
