import { logger } from "./logger";

interface AuditEntry {
  userId: string;
  role: "authority" | "admin";
  action: string;
  target: string;
  detail?: Record<string, unknown>;
  timestamp: string;
  ipAddress?: string;
}

/**
 * Authority and Admin action audit trail.
 * Every audit entry is also written to Firestore audit_logs collection via API route.
 *
 * @example
 * auditLogger.log({ userId, role: 'authority', action: 'EVIDENCE_UPLOADED', target: reportId })
 * auditLogger.log({ userId, role: 'admin', action: 'AUDIT_LOG_VIEWED', target: 'audit_logs' })
 */
export const auditLogger = {
  log: (entry: Omit<AuditEntry, "timestamp">): void => {
    const fullEntry: AuditEntry = {
      ...entry,
      timestamp: new Date().toISOString(),
    };
    logger.info(
      `AUDIT: ${entry.role} — ${entry.action} on ${entry.target}`,
      fullEntry as unknown as Record<string, unknown>
    );
    // Async write to Firestore audit_logs via API route (non-blocking)
    if (typeof window !== "undefined") {
      fetch("/api/v1/admin/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fullEntry),
      }).catch(() => {
        // Silently fail — audit logging must never block the UI
      });
    }
  },
};

// ─── Predefined Audit Actions ─────────────────────────────────────────────────
export const AUDIT_ACTIONS = {
  // Authority actions
  WORK_ACKNOWLEDGED: "WORK_ACKNOWLEDGED",
  WORK_STARTED: "WORK_STARTED",
  EVIDENCE_UPLOADED: "EVIDENCE_UPLOADED",
  WORK_COMPLETED: "WORK_COMPLETED",
  ASSISTANCE_REQUESTED: "ASSISTANCE_REQUESTED",
  // Admin actions
  AUDIT_LOG_VIEWED: "AUDIT_LOG_VIEWED",
  ANALYTICS_VIEWED: "ANALYTICS_VIEWED",
  DEPARTMENT_KPI_VIEWED: "DEPARTMENT_KPI_VIEWED",
  AI_MISSION_CONTROL_VIEWED: "AI_MISSION_CONTROL_VIEWED",
} as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[keyof typeof AUDIT_ACTIONS];
