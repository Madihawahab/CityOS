"use client";

import { useEffect, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type ToastVariant = "success" | "error" | "warning" | "info";

interface ToastProps {
  message: string;
  variant?: ToastVariant;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
  action?: { label: string; onClick: () => void };
}

const ICONS: Record<ToastVariant, string> = {
  success: "check_circle",
  error: "error",
  warning: "warning",
  info: "info",
};

const STYLES: Record<ToastVariant, string> = {
  success: "bg-secondary text-white",
  error: "bg-error text-white",
  warning: "bg-tertiary text-white",
  info: "bg-primary text-white",
};

export function Toast({
  message,
  variant = "info",
  isVisible,
  onClose,
  duration = 4000,
  action,
}: ToastProps) {
  useEffect(() => {
    if (!isVisible) return;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        "fixed bottom-24 left-1/2 -translate-x-1/2 z-50",
        "flex items-center gap-3 rounded-2xl px-4 py-3 shadow-dark-lg",
        "max-w-[calc(100vw-2rem)] animate-slide-up",
        STYLES[variant]
      )}
      role="status"
      aria-live="polite"
    >
      <span className="material-symbols-outlined flex-shrink-0" style={{ fontSize: 20 }} aria-hidden="true">
        {ICONS[variant]}
      </span>
      <p className="text-sm font-medium flex-1">{message}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="text-sm font-bold underline hover:no-underline ml-2"
        >
          {action.label}
        </button>
      )}
      <button
        onClick={onClose}
        className="ml-1 opacity-80 hover:opacity-100 transition-opacity"
        aria-label="Dismiss notification"
      >
        <span className="material-symbols-outlined" style={{ fontSize: 18 }} aria-hidden="true">
          close
        </span>
      </button>
    </div>
  );
}

// ─── useToast hook ────────────────────────────────────────────────────────────

import { useState, useCallback } from "react";

interface ToastState {
  message: string;
  variant: ToastVariant;
  isVisible: boolean;
}

export function useToast() {
  const [toast, setToast] = useState<ToastState>({
    message: "",
    variant: "info",
    isVisible: false,
  });

  const show = useCallback((message: string, variant: ToastVariant = "info") => {
    setToast({ message, variant, isVisible: true });
  }, []);

  const hide = useCallback(() => {
    setToast((t) => ({ ...t, isVisible: false }));
  }, []);

  return { toast, show, hide };
}
