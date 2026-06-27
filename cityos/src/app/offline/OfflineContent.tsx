"use client";

import { APP_NAME } from "@/lib/utils/constants";

export function OfflineContent() {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center gap-6 px-8 text-center"
      style={{ backgroundColor: "var(--color-background)" }}
    >
      {/* Icon */}
      <div
        className="rounded-full p-6"
        style={{ backgroundColor: "var(--color-tertiary-light)" }}
      >
        <span
          className="material-symbols-outlined"
          style={{ fontSize: 52, color: "var(--color-tertiary)" }}
          aria-hidden="true"
        >
          wifi_off
        </span>
      </div>

      {/* Content */}
      <div className="space-y-2 max-w-sm">
        <h1
          className="text-headline-md font-bold"
          style={{ color: "var(--color-on-surface)" }}
        >
          You&apos;re offline
        </h1>
        <p
          className="text-body-md"
          style={{ color: "var(--color-on-surface-variant)" }}
        >
          {APP_NAME} requires an internet connection for real-time AI analysis and
          report submission. Your previously viewed reports are available offline.
        </p>
      </div>

      {/* Capabilities */}
      <div
        className="w-full max-w-sm rounded-2xl p-4 space-y-3 text-left"
        style={{
          border: "1px solid var(--color-outline-variant)",
          backgroundColor: "white",
          boxShadow: "var(--shadow-md)",
        }}
      >
        <h2
          className="text-label-md font-semibold uppercase tracking-wider"
          style={{ color: "var(--color-on-surface-variant)" }}
        >
          Available Offline
        </h2>
        {[
          { icon: "list_alt", label: "View your recent reports" },
          { icon: "edit", label: "Draft new reports (queued for upload)" },
          { icon: "notifications", label: "View cached notifications" },
        ].map(({ icon, label }) => (
          <div key={label} className="flex items-center gap-3 text-body-md" style={{ color: "var(--color-on-surface)" }}>
            <span
              className="material-symbols-outlined flex-shrink-0"
              style={{ fontSize: 20, color: "var(--color-secondary)" }}
              aria-hidden="true"
            >
              {icon}
            </span>
            {label}
          </div>
        ))}
      </div>

      {/* Retry */}
      <button
        onClick={() => window.location.reload()}
        className="inline-flex items-center gap-2 rounded-full text-sm font-semibold text-white transition-colors"
        style={{
          backgroundColor: "var(--color-primary)",
          padding: "0.75rem 1.5rem",
          minHeight: "48px",
        }}
      >
        <span className="material-symbols-outlined text-sm" aria-hidden="true">
          refresh
        </span>
        Try Reconnecting
      </button>
    </div>
  );
}
