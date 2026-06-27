"use client";

import React, { Component, type ErrorInfo, type ReactNode } from "react";
import { errorLogger } from "@/lib/logger/errorLogger";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Root-level error boundary. Wraps the entire application.
 * If everything fails, shows a minimal recovery UI.
 */
export class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    errorLogger.boundary(error, { componentStack: info.componentStack ?? undefined }, "AppErrorBoundary");
  }

  render(): ReactNode {
    if (!this.state.hasError) return this.props.children;

    if (this.props.fallback) return this.props.fallback;

    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          fontFamily: "Inter, system-ui, sans-serif",
          background: "#f9f9ff",
        }}
      >
        <div style={{ maxWidth: 480, textAlign: "center", gap: 16, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ fontSize: 64, lineHeight: 1 }}>⚠️</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#111c2d", margin: 0 }}>
            CityOS encountered an error
          </h1>
          <p style={{ color: "#434655", fontSize: 14, lineHeight: 1.6, margin: 0 }}>
            An unexpected error has occurred. Your data is safe. Please refresh the page to continue.
          </p>
          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              style={{
                background: "#004ac6",
                color: "#fff",
                border: "none",
                borderRadius: 24,
                padding: "12px 24px",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                minHeight: 48,
              }}
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: "transparent",
                color: "#004ac6",
                border: "1px solid #737686",
                borderRadius: 24,
                padding: "12px 24px",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                minHeight: 48,
              }}
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    );
  }
}
