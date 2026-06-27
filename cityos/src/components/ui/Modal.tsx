"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { Button } from "./Button";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const SIZES = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
};

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  className,
  size = "md",
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Trap focus and close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    modalRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
      aria-describedby={description ? "modal-desc" : undefined}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Panel */}
      <div
        ref={modalRef}
        tabIndex={-1}
        className={cn(
          "relative w-full rounded-3xl bg-white shadow-lg animate-slide-up focus:outline-none",
          SIZES[size],
          className
        )}
      >
        {/* Header */}
        {title && (
          <div className="flex items-start justify-between gap-4 p-6 pb-0">
            <div>
              <h2 id="modal-title" className="text-title-lg font-semibold text-on-surface">
                {title}
              </h2>
              {description && (
                <p id="modal-desc" className="mt-1 text-body-md text-on-surface-variant">
                  {description}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="touch-target text-on-surface-variant hover:text-on-surface rounded-full hover:bg-surface-low transition-colors"
              aria-label="Close dialog"
            >
              <span className="material-symbols-outlined" aria-hidden="true">close</span>
            </button>
          </div>
        )}

        {/* Body */}
        <div className="p-6">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="border-t border-outline-variant/30 px-6 py-4">{footer}</div>
        )}
      </div>
    </div>
  );
}
