"use client";

import React, { Component, type ErrorInfo, type ReactNode } from "react";
import { errorLogger } from "@/lib/logger/errorLogger";
import { cn } from "@/lib/utils/cn";

interface Props {
  children: ReactNode;
  portalName: "citizen" | "authority" | "admin";
  fallbackHref?: string;
  className?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Per-portal error boundary. If one portal crashes, the others remain accessible.
 * Displays a friendly error with Try Again and Return to Dashboard actions.
 */
export class PortalErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    errorLogger.boundary(
      error,
      { componentStack: info.componentStack ?? undefined },
      `PortalErrorBoundary(${this.props.portalName})`
    );
  }

  private get dashboardHref(): string {
    const map: Record<string, string> = {
      citizen: "/",
      authority: "/authority",
      admin: "/admin",
    };
    return this.props.fallbackHref ?? (map[this.props.portalName] ?? "/");
  }

  render(): ReactNode {
    if (!this.state.hasError) return this.props.children;

    return (
      <div
        className={cn(
          "flex min-h-[60vh] items-center justify-center p-8",
          this.props.className
        )}
        role="alert"
        aria-live="assertive"
      >
        <div className="max-w-md w-full text-center space-y-6 animate-fade-in">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="rounded-full bg-error-light p-4">
              <span
                className="material-symbols-outlined text-error"
                style={{ fontSize: 40 }}
                aria-hidden="true"
              >
                error_outline
              </span>
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <h2 className="text-title-lg font-semibold text-on-surface">
              Something went wrong
            </h2>
            <p className="text-body-md text-on-surface-variant">
              CityOS encountered an unexpected error in this section. Your data is safe
              and the rest of the application is still working.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="btn-primary"
              aria-label="Try loading this section again"
            >
              <span className="material-symbols-outlined" aria-hidden="true">refresh</span>
              Try Again
            </button>
            <a
              href={this.dashboardHref}
              className="btn-secondary"
              aria-label="Return to dashboard"
            >
              <span className="material-symbols-outlined" aria-hidden="true">home</span>
              Return to Dashboard
            </a>
          </div>

          {/* Error detail — dev only */}
          {process.env.NODE_ENV === "development" && this.state.error && (
            <details className="mt-4 text-left">
              <summary className="text-label-md text-on-surface-variant cursor-pointer">
                Error details (dev only)
              </summary>
              <pre className="mt-2 overflow-auto rounded-xl bg-surface-container p-4 text-xs text-error">
                {this.state.error.message}
              </pre>
            </details>
          )}
        </div>
      </div>
    );
  }
}
