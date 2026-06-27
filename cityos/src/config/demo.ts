// ─── CityOS Demo Mode Configuration ──────────────────────────────────────────
// Activate with: NEXT_PUBLIC_APP_ENV=demo
// The audience must not be able to distinguish Demo Mode from Live Mode.

import { features } from "./features";
import type {
  IssueCategory,
  IssueSeverity,
  UserRole,
} from "@/types";

export const demo = {
  isActive: features.ENABLE_DEMO_MODE,

  // ── Demo Users (pre-seeded, no Firebase needed) ───────────────────────────
  users: {
    citizen: {
      id: "demo-citizen-1",
      name: "Priya Sharma",
      email: "priya@demo.cityos.in",
      role: "citizen" as UserRole,
      profilePhoto: undefined as string | undefined,
    },
    authority: {
      id: "demo-authority-1",
      name: "Ramesh Kumar",
      email: "ramesh@bwssb.gov.in",
      role: "authority" as UserRole,
      department: "BWSSB Water Works",
      profilePhoto: undefined as string | undefined,
    },
    admin: {
      id: "demo-admin-1",
      name: "Dr. Anand Krishnan",
      email: "admin@bbmp.gov.in",
      role: "admin" as UserRole,
      profilePhoto: undefined as string | undefined,
    },
  },

  // ── Simulation Timings ────────────────────────────────────────────────────
  /** Upload progress simulation duration in ms */
  uploadSimDurationMs: 2500,
  /** AI processing simulation duration in ms */
  aiSimDurationMs: 1800,
  /** Network latency simulation in ms */
  networkLatencyMs: 300,
  /** Repair verification auto-resolve delay in ms */
  repairVerifyDelayMs: 3000,

  // ── Deterministic AI Responses ────────────────────────────────────────────
  aiResponses: {
    reportIntelligence: {
      category: "water" as IssueCategory,
      detectedIssue: "Burst Water Pipeline",
      severity: "critical" as IssueSeverity,
      confidence: 0.96,
      description:
        "A significant water pipeline burst detected near the main road junction, causing waterlogging and traffic obstruction. Immediate intervention required.",
    },
    trustEngine: {
      trustScore: 94,
      duplicateDetected: false,
      duplicateReportIds: [] as string[],
      spamProbability: 0.02,
      authenticity: "verified" as const,
    },
    decisionIntelligence: {
      department: "BWSSB Water Works",
      priority: "critical" as IssueSeverity,
      estimatedResolution: "4 Hours",
      priorityReason:
        "Main road junction with high footfall. Water wastage risk affecting ~500 households. Potential traffic disruption on Outer Ring Road.",
      recommendedActions: [
        "Dispatch emergency water works team immediately",
        "Set up traffic diversion signage at junction",
        "Notify nearby households of possible supply disruption",
      ],
    },
    resolutionIntelligence: {
      repairVerified: true,
      confidence: 0.92,
      closureRecommendation: "close" as const,
      reason:
        "Before and after images confirm complete pipeline repair. GPS location verified. No water seepage detected in after images.",
    },
    copilotResponses: [
      {
        trigger: "status",
        response:
          "Your report has been verified by CityOS Intelligence Layer and assigned to BWSSB Water Works. Based on the severity assessment, resolution is expected within 4 hours.",
      },
      {
        trigger: "duplicate",
        response:
          "We found 6 similar reports within 120 metres. All have been merged into a single priority case to ensure faster resolution.",
      },
      {
        trigger: "nearby",
        response:
          "There are 8 active reports in your area (Ward 7 – Koramangala). 3 are in progress and 2 were resolved this week.",
      },
      {
        trigger: "default",
        response:
          "CityOS has received your report. The Intelligence Layer is analysing the images and details you provided. I will update you as soon as the AI completes its assessment.",
      },
    ],
  },
} as const;

/**
 * Simulate async delay (for demo mode network latency)
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Get demo copilot response based on message content
 */
export function getDemoCopilotResponse(userMessage: string): string {
  const msg = userMessage.toLowerCase();
  const responses = demo.aiResponses.copilotResponses;

  if (msg.includes("status") || msg.includes("update") || msg.includes("progress")) {
    return responses.find((r) => r.trigger === "status")?.response ?? responses[3]!.response;
  }
  if (msg.includes("duplicate") || msg.includes("similar") || msg.includes("merge")) {
    return responses.find((r) => r.trigger === "duplicate")?.response ?? responses[3]!.response;
  }
  if (msg.includes("nearby") || msg.includes("area") || msg.includes("around")) {
    return responses.find((r) => r.trigger === "nearby")?.response ?? responses[3]!.response;
  }
  return responses[3]!.response;
}
