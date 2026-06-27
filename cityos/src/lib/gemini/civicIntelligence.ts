// ─── Civic Intelligence Engine ────────────────────────────────────────────────
// AI Engine 5: City-wide pattern analysis, risk predictions, infrastructure health.

import { executeGeminiPrompt, parseGeminiJSON } from "./client";
import { demo, sleep } from "@/config/demo";
import { features } from "@/config/features";
import type { PredictedRisk, InfrastructureVulnerability } from "@/types";

interface CivicIntelligenceResult {
  cityTrustScore: number;
  infrastructureHealth: number;
  predictedRisks: PredictedRisk[];
  vulnerabilities: InfrastructureVulnerability[];
  insights: string[];
}

const CIVIC_PROMPT = (
  totalReports: number,
  resolvedReports: number,
  topCategories: string[],
  topWards: string[]
) => `
You are the CityOS Civic Intelligence Engine analyzing city-wide infrastructure data.

Total reports (last 30 days): ${totalReports}
Resolved reports: ${resolvedReports}
Top issue categories: ${topCategories.join(", ")}
Most affected wards: ${topWards.join(", ")}
City: Bengaluru

Provide city intelligence and respond ONLY with valid JSON:
{
  "cityTrustScore": <integer 0-100>,
  "infrastructureHealth": <integer 0-100>,
  "predictedRisks": [
    {
      "ward": "<ward name>",
      "issueType": "<category>",
      "probability": <integer 0-100>,
      "riskLevel": "<critical|high|medium|low>",
      "topConcern": "<brief concern description>"
    }
  ],
  "vulnerabilities": [
    {
      "ward": "<ward name>",
      "score": <integer 0-100>,
      "risk": "<critical|high|medium|low>",
      "topConcern": "<brief concern>"
    }
  ],
  "insights": ["<insight 1>", "<insight 2>", "<insight 3>"]
}
Return 3-5 predicted risks and 3-5 vulnerability entries. Keep text concise and human-readable.
`;

export async function analyzeCityIntelligence(
  totalReports: number,
  resolvedReports: number,
  topCategories: string[],
  topWards: string[]
): Promise<CivicIntelligenceResult> {
  if (demo.isActive || !features.ENABLE_GEMINI) {
    await sleep(200);
    return getMockCivicIntelligence();
  }

  const raw = await executeGeminiPrompt(
    "CivicIntelligence",
    CIVIC_PROMPT(totalReports, resolvedReports, topCategories, topWards)
  );
  if (!raw) return getMockCivicIntelligence();

  const parsed = parseGeminiJSON<CivicIntelligenceResult>(raw);
  return parsed ?? getMockCivicIntelligence();
}

function getMockCivicIntelligence(): CivicIntelligenceResult {
  return {
    cityTrustScore: 87,
    infrastructureHealth: 73,
    predictedRisks: [
      { ward: "Ward 7 – Koramangala", issueType: "water", probability: 78, riskLevel: "high", topConcern: "Aging water mains due for replacement" },
      { ward: "Ward 34 – Whitefield", issueType: "roads", probability: 65, riskLevel: "high", topConcern: "IT corridor road stress from heavy traffic" },
      { ward: "Ward 12 – MG Road", issueType: "drainage", probability: 72, riskLevel: "high", topConcern: "Pre-monsoon drainage blockages likely" },
      { ward: "Ward 56 – Hebbal", issueType: "electricity", probability: 54, riskLevel: "medium", topConcern: "Transformer overload during summer peak" },
      { ward: "Ward 18 – Jayanagar", issueType: "sanitation", probability: 48, riskLevel: "medium", topConcern: "Collection frequency gaps in residential blocks" },
    ],
    vulnerabilities: [
      { ward: "Ward 7 – Koramangala", score: 78, risk: "high", topConcern: "Water pipeline aging" },
      { ward: "Ward 34 – Whitefield", score: 65, risk: "high", topConcern: "Road deterioration" },
      { ward: "Ward 12 – MG Road", score: 72, risk: "high", topConcern: "Drainage infrastructure" },
      { ward: "Ward 18 – Jayanagar", score: 45, risk: "medium", topConcern: "Sanitation gaps" },
      { ward: "Ward 56 – Hebbal", score: 38, risk: "medium", topConcern: "Electrical load" },
    ],
    insights: [
      "Water infrastructure in Ward 7 shows 35% higher failure rate than city average",
      "Resolution time improved 18% since last month across all departments",
      "Pre-monsoon period projected to increase drainage reports by 40%",
    ],
  };
}
