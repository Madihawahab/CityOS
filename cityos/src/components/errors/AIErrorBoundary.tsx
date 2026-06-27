"use client";

import React, { Component, type ErrorInfo, type ReactNode } from "react";
import { errorLogger } from "@/lib/logger/errorLogger";

interface Props {
  children: ReactNode;
  featureName?: string;
}

interface State {
  hasError: boolean;
  retryKey: number;
}

/**
 * AI component error boundary.
 * If the Intelligence Layer crashes, the surrounding portal stays functional.
 * Shows a non-blocking inline fallback — not a full-page error.
 */
export class AIErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, retryKey: 0 };

  static getDerivedStateFromError(): State {
    return { hasError: true, retryKey: 0 };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    errorLogger.boundary(
      error,
      { componentStack: info.componentStack ?? undefined },
      `AIErrorBoundary(${this.props.featureName ?? "AI"})`
    );
  }

  private retry = () => {
    this.setState((s) => ({ hasError: false, retryKey: s.retryKey + 1 }));
  };

  render(): ReactNode {
    if (!this.state.hasError) {
      return (
        <React.Fragment key={this.state.retryKey}>
          {this.props.children}
        </React.Fragment>
      );
    }

    return (
      <div
        className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-outline-variant/30 bg-surface-low p-6 text-center"
        role="status"
        aria-label="AI feature unavailable"
      >
        <span
          className="material-symbols-outlined text-on-surface-variant"
          style={{ fontSize: 32 }}
          aria-hidden="true"
        >
          smart_toy
        </span>
        <div className="space-y-1">
          <p className="text-body-md font-medium text-on-surface">
            CityOS Intelligence Layer is temporarily unavailable
          </p>
          <p className="text-label-md text-on-surface-variant">
            Core features remain fully active
          </p>
        </div>
        <button
          onClick={this.retry}
          className="btn-ghost text-sm"
          aria-label="Retry AI feature"
        >
          <span className="material-symbols-outlined text-sm" aria-hidden="true">
            refresh
          </span>
          Retry
        </button>
      </div>
    );
  }
}
