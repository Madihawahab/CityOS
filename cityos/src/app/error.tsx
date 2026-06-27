"use client";

import { useEffect } from "react";
import type { Metadata } from "next";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to error reporting in production
    console.error("[CityOS Global Error]", error);
  }, [error]);

  return (
    <html lang="en-IN">
      <body style={{ fontFamily: "Inter, system-ui, sans-serif", background: "#f9f9ff", margin: 0 }}>
        <div style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          textAlign: "center",
        }}>
          <div style={{ maxWidth: 480, width: "100%" }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>⚠️</div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: "#111c2d", marginBottom: 8 }}>
              CityOS experienced a critical error
            </h1>
            <p style={{ color: "#434655", fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
              Something unexpected happened. Your civic data is safe. Please try refreshing the page.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <button
                onClick={reset}
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
                onClick={() => window.location.href = "/"}
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
                Return to Home
              </button>
            </div>
            {process.env.NODE_ENV === "development" && error.digest && (
              <p style={{ marginTop: 16, fontSize: 12, color: "#737686" }}>
                Error ID: {error.digest}
              </p>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}
