"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  side?: "right" | "left" | "bottom";
  className?: string;
  width?: string;
}

export function Drawer({
  isOpen,
  onClose,
  title,
  children,
  side = "right",
  className,
  width = "max-w-md",
}: DrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  const positionClass = {
    right: "right-0 top-0 h-full animate-slide-in-right",
    left: "left-0 top-0 h-full",
    bottom: "bottom-0 left-0 right-0 rounded-t-3xl animate-slide-up",
  }[side];

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "drawer-title" : undefined}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Panel */}
      <div
        ref={drawerRef}
        className={cn(
          "absolute bg-white shadow-dark-lg flex flex-col overflow-hidden focus:outline-none",
          side === "bottom" ? "w-full" : `w-full ${width}`,
          positionClass,
          className
        )}
        tabIndex={-1}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between border-b border-outline-variant/30 px-6 py-4 flex-shrink-0">
            <h2 id="drawer-title" className="text-title-md font-semibold text-on-surface">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="touch-target text-on-surface-variant hover:text-on-surface rounded-full hover:bg-surface-low transition-colors"
              aria-label="Close panel"
            >
              <span className="material-symbols-outlined" aria-hidden="true">close</span>
            </button>
          </div>
        )}
        {/* Content */}
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
