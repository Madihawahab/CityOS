// ─── CityOS Constants ────────────────────────────────────────────────────────
import type { IssueCategory, IssueSeverity, ReportStatus } from "@/types";

// ── Departments ───────────────────────────────────────────────────────────────
export const DEPARTMENTS = [
  { id: "bwssb-water", name: "BWSSB Water Works", short: "Water", icon: "water_drop" },
  { id: "bbmp-roads", name: "BBMP Roads & Infrastructure", short: "Roads", icon: "road" },
  { id: "bescom", name: "BESCOM Electricity", short: "Electricity", icon: "bolt" },
  { id: "bbmp-sanitation", name: "BBMP Sanitation", short: "Sanitation", icon: "delete" },
  { id: "bwssb-drainage", name: "BWSSB Drainage", short: "Drainage", icon: "water" },
  { id: "bbmp-parks", name: "BBMP Parks", short: "Parks", icon: "park" },
] as const;

// ── Bengaluru Wards ───────────────────────────────────────────────────────────
export const WARDS = [
  { id: "ward-7", name: "Ward 7 – Koramangala" },
  { id: "ward-9", name: "Ward 9 – Rajajinagar" },
  { id: "ward-12", name: "Ward 12 – MG Road" },
  { id: "ward-18", name: "Ward 18 – Jayanagar" },
  { id: "ward-34", name: "Ward 34 – Whitefield" },
  { id: "ward-56", name: "Ward 56 – Hebbal" },
  { id: "ward-63", name: "Ward 63 – HSR Layout" },
  { id: "ward-81", name: "Ward 81 – Banashankari" },
] as const;

// ── Issue Categories ──────────────────────────────────────────────────────────
export const CATEGORY_LABELS: Record<IssueCategory, string> = {
  water: "Water Supply",
  roads: "Roads & Infrastructure",
  electricity: "Electricity",
  sanitation: "Sanitation",
  parks: "Parks & Recreation",
  public_works: "Public Works",
  drainage: "Drainage",
  other: "Other",
};

export const CATEGORY_ICONS: Record<IssueCategory, string> = {
  water: "water_drop",
  roads: "road",
  electricity: "bolt",
  sanitation: "delete_sweep",
  parks: "park",
  public_works: "construction",
  drainage: "water",
  other: "report_problem",
};

export const CATEGORY_COLORS: Record<IssueCategory, string> = {
  water: "text-blue-600 bg-blue-50",
  roads: "text-orange-600 bg-orange-50",
  electricity: "text-yellow-600 bg-yellow-50",
  sanitation: "text-green-600 bg-green-50",
  parks: "text-emerald-600 bg-emerald-50",
  public_works: "text-purple-600 bg-purple-50",
  drainage: "text-cyan-600 bg-cyan-50",
  other: "text-gray-600 bg-gray-50",
};

// ── Status Labels ─────────────────────────────────────────────────────────────
export const STATUS_LABELS: Record<ReportStatus, string> = {
  submitted: "Submitted",
  ai_processing: "AI Processing",
  ai_verified: "AI Verified",
  assigned: "Assigned",
  in_progress: "In Progress",
  work_started: "Work Started",
  evidence_uploaded: "Evidence Uploaded",
  ai_verifying_repair: "AI Verifying Repair",
  citizen_verification_pending: "Awaiting Your Verification",
  resolved: "Resolved",
  closed: "Closed",
};

// ── Priority Labels ───────────────────────────────────────────────────────────
export const PRIORITY_LABELS: Record<IssueSeverity, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};

// ── AI Engine Labels ──────────────────────────────────────────────────────────
export const AI_ENGINE_LABELS = {
  report_intelligence: "Report Intelligence",
  trust_engine: "Trust Engine",
  decision_intelligence: "Decision Intelligence",
  resolution_intelligence: "Resolution Intelligence",
  civic_intelligence: "Civic Intelligence",
  civic_copilot: "Civic Copilot",
} as const;

// ── Report Timeline Steps ─────────────────────────────────────────────────────
export const TIMELINE_STEPS = [
  { key: "submitted", label: "Report Submitted", icon: "upload" },
  { key: "ai_verified", label: "AI Verified", icon: "verified" },
  { key: "assigned", label: "Assigned to Department", icon: "assignment_ind" },
  { key: "work_started", label: "Work Started", icon: "construction" },
  { key: "resolved", label: "Issue Resolved", icon: "check_circle" },
] as const;

// ── App Constants ─────────────────────────────────────────────────────────────
export const APP_NAME = "CityOS";
export const APP_TAGLINE = "One Report. Zero Follow-ups. AI Handles Everything.";
export const APP_SUBTITLE = "Civic Operating System";

export const MAX_UPLOAD_SIZE_MB = 20;
export const MAX_UPLOAD_SIZE_BYTES = MAX_UPLOAD_SIZE_MB * 1024 * 1024;
export const IMAGE_MAX_DIMENSION = 2048;
export const IMAGE_QUALITY = 0.8;

export const NEARBY_RADIUS_METRES = 1000;
export const DUPLICATE_RADIUS_METRES = 120;

// ── Query Keys ────────────────────────────────────────────────────────────────
export const QUERY_KEYS = {
  reports: {
    all: ["reports"] as const,
    my: ["reports", "my"] as const,
    byId: (id: string) => ["reports", id] as const,
    nearby: (lat: number, lng: number) => ["reports", "nearby", lat, lng] as const,
  },
  workQueue: {
    all: ["work-queue"] as const,
    byFilter: (f: object) => ["work-queue", f] as const,
  },
  analytics: {
    all: ["analytics"] as const,
    admin: ["analytics", "admin"] as const,
  },
  notifications: {
    all: ["notifications"] as const,
    unread: ["notifications", "unread"] as const,
  },
  aiEngines: {
    status: ["ai", "status"] as const,
  },
  departments: {
    all: ["departments"] as const,
    performance: ["departments", "performance"] as const,
  },
} as const;
