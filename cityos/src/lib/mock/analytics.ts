import type { Analytics, WeeklyTrendPoint, PredictedRisk, InfrastructureVulnerability } from "@/types";

const d = (daysAgo: number) =>
  new Date(Date.now() - daysAgo * 86400000).toISOString().split("T")[0] ?? "";

// ─── Predicted Risks (must be defined before mockAnalytics) ───────────────────

export const mockPredictedRisks: PredictedRisk[] = [
  { ward: "Ward 7 – Koramangala",  issueType: "water",       probability: 78, riskLevel: "high",     topConcern: "Aging water mains due for replacement" },
  { ward: "Ward 34 – Whitefield",  issueType: "roads",       probability: 65, riskLevel: "high",     topConcern: "IT corridor road stress from heavy traffic" },
  { ward: "Ward 12 – MG Road",     issueType: "drainage",    probability: 72, riskLevel: "high",     topConcern: "Pre-monsoon drainage blockages likely" },
  { ward: "Ward 56 – Hebbal",      issueType: "electricity", probability: 54, riskLevel: "medium",   topConcern: "Transformer overload during summer peak" },
  { ward: "Ward 18 – Jayanagar",   issueType: "sanitation",  probability: 48, riskLevel: "medium",   topConcern: "Collection frequency gaps in residential blocks" },
  { ward: "Ward 63 – HSR Layout",  issueType: "roads",       probability: 41, riskLevel: "medium",   topConcern: "Road infrastructure stress from construction activity" },
  { ward: "Ward 9 – Rajajinagar",  issueType: "electricity", probability: 35, riskLevel: "low",      topConcern: "Power transformer aging in residential areas" },
  { ward: "Ward 81 – Banashankari",issueType: "drainage",    probability: 29, riskLevel: "low",      topConcern: "Seasonal drainage maintenance overdue" },
];

// ─── Infrastructure Vulnerabilities ──────────────────────────────────────────

export const mockInfrastructureVulnerabilities: InfrastructureVulnerability[] = [
  { ward: "Ward 7 – Koramangala",  score: 78, risk: "high",   topConcern: "Water pipeline aging" },
  { ward: "Ward 12 – MG Road",     score: 72, risk: "high",   topConcern: "Drainage infrastructure" },
  { ward: "Ward 34 – Whitefield",  score: 65, risk: "high",   topConcern: "Road deterioration" },
  { ward: "Ward 18 – Jayanagar",   score: 45, risk: "medium", topConcern: "Sanitation gaps" },
  { ward: "Ward 56 – Hebbal",      score: 38, risk: "medium", topConcern: "Electrical load" },
  { ward: "Ward 63 – HSR Layout",  score: 33, risk: "low",    topConcern: "Construction disruption" },
  { ward: "Ward 9 – Rajajinagar",  score: 28, risk: "low",    topConcern: "Aging infrastructure" },
  { ward: "Ward 81 – Banashankari",score: 22, risk: "low",    topConcern: "Seasonal flooding risk" },
];

// ─── Weekly Trend Generator ───────────────────────────────────────────────────

function generateWeeklyTrend(): WeeklyTrendPoint[] {
  const trend: WeeklyTrendPoint[] = [];
  const base     = [42, 38, 55, 47, 63, 51, 44];
  const resolved = [35, 30, 48, 40, 55, 45, 38];
  const predicted = [46, 41, 58, 50, 65, 54, 47];

  for (let i = 6; i >= 0; i--) {
    trend.push({
      date: d(i),
      reported: base[6 - i]     ?? 44,
      resolved: resolved[6 - i] ?? 38,
      predicted: predicted[6 - i] ?? 47,
    });
  }
  return trend;
}

// ─── Main Analytics Object ────────────────────────────────────────────────────

export const mockAnalytics: Analytics = {
  totalReports: 347,
  activeReports: 136,
  resolvedReports: 211,
  averageResolutionTime: 22,
  departmentPerformance: {
    "BWSSB Water Works":          { resolved: 142, avgHours: 18, resolutionRate: 86 },
    "BBMP Roads & Infrastructure":{ resolved: 201, avgHours: 36, resolutionRate: 82 },
    "BESCOM Electricity":         { resolved: 178, avgHours: 8,  resolutionRate: 91 },
    "BBMP Sanitation":            { resolved: 115, avgHours: 24, resolutionRate: 79 },
    "BWSSB Drainage":             { resolved: 67,  avgHours: 12, resolutionRate: 85 },
    "BBMP Parks":                 { resolved: 43,  avgHours: 48, resolutionRate: 77 },
  },
  issueCategoryDistribution: {
    water:       98,
    roads:       87,
    electricity: 63,
    sanitation:  54,
    drainage:    28,
    parks:       17,
  },
  infrastructureHealth: 73,
  cityTrustScore: 87,
  generatedAt: new Date(),
  weeklyTrend: generateWeeklyTrend(),
  predictedRisks: mockPredictedRisks,
};

export const mockCategoryHeatmap = Object.entries(mockAnalytics.issueCategoryDistribution).map(
  ([category, count]) => ({
    category,
    count: count ?? 0,
    intensity: (count ?? 0) / 100,
  })
);
