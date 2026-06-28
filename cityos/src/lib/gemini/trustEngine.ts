// ─── Trust Engine ─────────────────────────────────────────────────────────────
// AI Engine 2: Assesses report authenticity and detects duplicates.

import { executeGeminiPrompt, parseGeminiJSON } from "./client";
import { demo, sleep } from "@/config/demo";
import { features } from "@/config/features";
import type { TrustEngineResult } from "@/types";

const TRUST_PROMPT = (description: string, location: string, existingReportIds: string[]) => `
You are the CityOS Trust Engine evaluating a civic report for authenticity.

Report: "${description}"
Location: ${location}
Nearby existing reports: ${existingReportIds.length}

Respond ONLY with valid JSON:
{
  "trustScore": <integer 0-100>,
  "duplicateDetected": <boolean>,
  "duplicateReportIds": [<array of string IDs if duplicates found, else []>],
  "spamProbability": <number 0.0-1.0>,
  "authenticity": "<verified|suspicious|spam>"
}
Guidelines:
- trustScore 90-100: highly credible (location data, clear description, consistent)
- trustScore 70-89: likely genuine but minor concerns
- trustScore 50-69: suspicious — vague, no location, unusual pattern
- trustScore 0-49: likely spam or test report
`;

export async function evaluateTrust(
  description: string,
  location: string,
  nearbyReportIds: string[]
): Promise<TrustEngineResult> {
  if (demo.isActive || !features.ENABLE_GEMINI) {
    await sleep(demo.aiSimDurationMs / 3);
    const hasDups = description.toLowerCase().includes("leak") || description.toLowerCase().includes("pothole") || description.toLowerCase().includes("drain");
    return {
      trustScore: 92,
      duplicateDetected: hasDups,
      duplicateReportIds: hasDups ? ["RPT-2026-001", "RPT-2026-004"] : [],
      spamProbability: 0.04,
      authenticity: "verified"
    };
  }

  const raw = await executeGeminiPrompt(
    "TrustEngine",
    TRUST_PROMPT(description, location, nearbyReportIds)
  );
  if (!raw) return demo.aiResponses.trustEngine;

  const parsed = parseGeminiJSON<TrustEngineResult>(raw);
  return parsed ?? demo.aiResponses.trustEngine;
}
