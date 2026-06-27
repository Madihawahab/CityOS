// ─── Resolution Intelligence Engine ──────────────────────────────────────────
// AI Engine 4: Verifies repair evidence uploaded by authority officers.

import { executeGeminiPrompt, parseGeminiJSON } from "./client";
import { demo, sleep } from "@/config/demo";
import { features } from "@/config/features";
import type { ResolutionIntelligenceResult } from "@/types";

const RESOLUTION_PROMPT = (
  originalDescription: string,
  repairNotes: string,
  hasBeforeImages: boolean,
  hasAfterImages: boolean,
  gpsVerified: boolean
) => `
You are the CityOS Resolution Intelligence Engine verifying a completed repair.

Original issue: "${originalDescription}"
Officer repair notes: "${repairNotes}"
Has before images: ${hasBeforeImages}
Has after images: ${hasAfterImages}
GPS location verified: ${gpsVerified}

Evaluate the evidence and respond ONLY with valid JSON:
{
  "repairVerified": <boolean>,
  "confidence": <number 0.0-1.0>,
  "closureRecommendation": "<close|request_more_evidence|reject>",
  "reason": "<1-2 sentences explaining your decision in plain language>"
}
Guidelines:
- close: strong before/after visual evidence, GPS match, coherent repair notes
- request_more_evidence: missing images or unclear documentation
- reject: evidence contradicts original issue or shows incomplete repair
- reason must be understandable by a non-technical reader
`;

export async function verifyRepair(
  originalDescription: string,
  repairNotes: string,
  hasBeforeImages: boolean,
  hasAfterImages: boolean,
  gpsVerified: boolean
): Promise<ResolutionIntelligenceResult> {
  if (demo.isActive || !features.ENABLE_GEMINI) {
    await sleep(demo.repairVerifyDelayMs);
    return demo.aiResponses.resolutionIntelligence;
  }

  const raw = await executeGeminiPrompt(
    "ResolutionIntelligence",
    RESOLUTION_PROMPT(originalDescription, repairNotes, hasBeforeImages, hasAfterImages, gpsVerified)
  );
  if (!raw) return demo.aiResponses.resolutionIntelligence;

  const parsed = parseGeminiJSON<ResolutionIntelligenceResult>(raw);
  return parsed ?? demo.aiResponses.resolutionIntelligence;
}
