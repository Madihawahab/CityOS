"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface TooltipProps {
  content: string | ReactNode;
  children: ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  className?: string;
}

export function Tooltip({ content, children, position = "top", className }: TooltipProps) {
  const positionClass = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  }[position];

  return (
    <div className="relative inline-flex group">
      {children}
      <div
        role="tooltip"
        className={cn(
          "absolute z-50 hidden group-hover:block group-focus-within:block",
          "whitespace-nowrap rounded-lg bg-inverse-surface px-3 py-1.5",
          "text-xs font-medium text-inverse-on-surface shadow-lg",
          "pointer-events-none animate-fade-in",
          positionClass,
          className
        )}
      >
        {content}
      </div>
    </div>
  );
}
