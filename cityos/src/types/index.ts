// ─── CityOS Centralized Type Definitions ─────────────────────────────────────
// Single source of truth for all TypeScript interfaces across all portals.

// ─── Core Enums ───────────────────────────────────────────────────────────────

export type IssueCategory =
  | "water"
  | "roads"
  | "electricity"
  | "sanitation"
  | "parks"
  | "public_works"
  | "drainage"
  | "other";

export type IssueSeverity = "critical" | "high" | "medium" | "low";

export type ReportStatus =
  | "submitted"
  | "ai_processing"
  | "ai_verified"
  | "assigned"
  | "in_progress"
  | "work_started"
  | "evidence_uploaded"
  | "ai_verifying_repair"
  | "citizen_verification_pending"
  | "resolved"
  | "closed";

export type UserRole = "citizen" | "authority" | "admin";

export type PrivacyMode = "public" | "anonymous" | "community";

export type NotificationType =
  | "submitted"
  | "assigned"
  | "work_started"
  | "repair_completed"
  | "verification_requested"
  | "nearby_alert"
  | "ai_suggestion";

export type AIEngineId =
  | "report_intelligence"
  | "trust_engine"
  | "decision_intelligence"
  | "resolution_intelligence"
  | "civic_intelligence"
  | "civic_copilot";

export type WorkStatus =
  | "pending"
  | "acknowledged"
  | "in_progress"
  | "evidence_uploaded"
  | "completed";

// ─── Nested Types ─────────────────────────────────────────────────────────────

export interface ReportLocation {
  latitude: number;
  longitude: number;
  address: string;
  ward?: string;
  city?: string;
}

export interface ReportMedia {
  imageUrls: string[];
  videoUrls: string[];
  audioUrl?: string;
}

// ─── Firestore Collections ────────────────────────────────────────────────────

export interface User {
  userId: string;
  fullName: string;
  email: string;
  phone?: string;
  role: UserRole;
  profilePhoto?: string;
  anonymousDefault: boolean;
  department?: string;
  createdAt: Date;
  lastLogin: Date;
}

export interface Report {
  reportId: string;
  citizenId: string;
  anonymousReport: boolean;
  issueCategory: IssueCategory;
  title: string;
  description: string;
  severity: IssueSeverity;
  status: ReportStatus;
  // AI-determined — immutable, never editable by any human user
  trustScore?: number;
  priority?: IssueSeverity;
  departmentAssigned?: string;
  estimatedResolution?: string; // human-readable: "2 Days"
  aiConfidence?: number;
  location: ReportLocation;
  media: ReportMedia;
  communitySupport: number;
  mergedReportIds: string[];
  createdAt: Date;
  updatedAt: Date;
  analysis?: {
    reportIntelligence: {
      category: string;
      detectedIssue: string;
      severity: string;
      confidence: number;
      description: string;
    };
    trustEngine: {
      trustScore: number;
      duplicateDetected: boolean;
      duplicateReportIds: string[];
      spamProbability: number;
      authenticity: string;
    };
    decisionEngine: {
      department: string;
      priority: string;
      estimatedResolution: string;
      priorityReason: string;
      recommendedActions: string[];
    };
    civicIntelligence: {
      communityImpact: string;
      nearbyReportsCount: number;
      wardRiskIndex: string;
    };
    resolutionIntelligence: {
      estimatedResolution: string;
      confidenceScore: number;
      historicalComparison: string;
    };
    civicCopilot?: {
      summary: string;
    };
  };
}

export interface AIAnalysis {
  reportId: string;
  detectedIssue: string;
  confidenceScore: number;
  duplicateDetected: boolean;
  duplicateReportIds: string[];
  spamProbability: number;
  trustScore: number;
  assignedDepartment: string;
  priorityReason: string; // human-readable
  estimatedResolution: string; // human-readable: "2 Days"
  predictedImpact: string;
  recommendedActions: string[];
  civicSummary: string;
  generatedAt: Date;
}

export interface Department {
  departmentId: string;
  departmentName: string;
  departmentHead: string;
  email: string;
  phone: string;
  activeIssues: number;
  resolvedIssues: number;
  averageResolutionTime: number; // hours
  resolutionRate?: number; // percentage 0-100
}

export interface WorkQueueItem {
  workId: string;
  reportId: string;
  assignedDepartment: string;
  assignedOfficer?: string;
  // AI-set fields — read-only
  priority: IssueSeverity;
  dueDate: Date;
  status: WorkStatus;
  startedAt?: Date;
  completedAt?: Date;
  // Derived from Report
  title?: string;
  location?: ReportLocation;
  issueCategory?: IssueCategory;
}

export interface RepairEvidence {
  evidenceId: string;
  reportId: string;
  officerId: string;
  beforeImages: string[];
  afterImages: string[];
  gpsLocation: { latitude: number; longitude: number };
  uploadTime: Date;
  notes: string;
}

export interface CitizenVerification {
  verificationId: string;
  reportId: string;
  citizenId: string;
  verified: boolean;
  feedback?: string;
  verifiedAt: Date;
}

export interface Notification {
  notificationId: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  reportId?: string;
  isRead: boolean;
  createdAt: Date;
}

export interface Analytics {
  totalReports: number;
  activeReports: number;
  resolvedReports: number;
  averageResolutionTime: number; // hours
  departmentPerformance: Record<
    string,
    { resolved: number; avgHours: number; resolutionRate: number }
  >;
  issueCategoryDistribution: Partial<Record<IssueCategory, number>>;
  infrastructureHealth: number; // 0–100
  cityTrustScore: number; // 0–100
  generatedAt: Date;
  weeklyTrend?: WeeklyTrendPoint[];
  predictedRisks?: PredictedRisk[];
}

export interface WeeklyTrendPoint {
  date: string;
  reported: number;
  resolved: number;
  predicted: number;
}

export interface PredictedRisk {
  ward: string;
  issueType: string;
  probability: number; // 0-100
  riskLevel: IssueSeverity;
  topConcern: string;
}

export interface InfrastructureVulnerability {
  ward: string;
  score: number; // 0-100
  risk: IssueSeverity;
  topConcern: string;
}

export interface AuditLog {
  logId: string;
  userId: string;
  role: UserRole;
  action: string;
  target: string;
  timestamp: Date;
  ipAddress: string;
}

// ─── AI Engine Types ──────────────────────────────────────────────────────────

export interface AIEngineStatus {
  engine: AIEngineId;
  label: string;
  status: "processing" | "active" | "idle" | "error";
  processedCount: number;
  accuracy: number; // 0–100
  lastActivityAt: Date;
}

// ─── Offline Queue ────────────────────────────────────────────────────────────

export interface OfflineReport {
  localId: string;
  draftReport: Partial<Report>;
  mediaFiles?: FileInfo[];
  queuedAt: Date;
  retryCount: number;
}

export interface FileInfo {
  name: string;
  size: number;
  type: string;
  dataUrl?: string;
}

// ─── AI Response Types ────────────────────────────────────────────────────────

export interface ReportIntelligenceResult {
  category: IssueCategory;
  detectedIssue: string;
  severity: IssueSeverity;
  confidence: number;
  description: string;
}

export interface TrustEngineResult {
  trustScore: number;
  duplicateDetected: boolean;
  duplicateReportIds: string[];
  spamProbability: number;
  authenticity: "verified" | "suspicious" | "spam";
}

export interface DecisionIntelligenceResult {
  department: string;
  priority: IssueSeverity;
  estimatedResolution: string;
  priorityReason: string;
  recommendedActions: string[];
}

export interface ResolutionIntelligenceResult {
  repairVerified: boolean;
  confidence: number;
  closureRecommendation: "close" | "request_more_evidence" | "reject";
  reason: string;
}

export interface CopilotMessage {
  id?: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

// ─── API Response Wrappers ────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  nextPage?: number;
}

// ─── UI State Types ───────────────────────────────────────────────────────────

export type PageState = "loading" | "error" | "empty" | "success" | "offline";

export interface FilterState {
  category?: IssueCategory;
  status?: ReportStatus;
  priority?: IssueSeverity;
  department?: string;
  search?: string;
}

// ─── Map Types ────────────────────────────────────────────────────────────────

export interface MapMarkerData {
  reportId: string;
  latitude: number;
  longitude: number;
  category: IssueCategory;
  severity: IssueSeverity;
  title: string;
  status: ReportStatus;
}

export interface HeatmapCell {
  ward: string;
  category: IssueCategory;
  count: number;
  intensity: number; // 0-1
}

// ─── Demo Types ───────────────────────────────────────────────────────────────

export interface DemoUser {
  id: string;
  name: string;
  role: UserRole;
}
