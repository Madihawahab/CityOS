// ─── Report Intelligence Engine ───────────────────────────────────────────────
// AI Engine 1: Analyzes report image and description to classify the civic issue.
// Server-side only. Called from /api/v1/ai/analyze-report

import { executeGeminiPrompt, parseGeminiJSON } from "./client";
import { demo } from "@/config/demo";
import { features } from "@/config/features";
import { sleep } from "@/config/demo";
import type { ReportIntelligenceResult } from "@/types";

const PROMPT_TEMPLATE = (description: string, hasImages: boolean) => `
You are the CityOS Report Intelligence Engine analyzing a civic issue report from Bengaluru, India.

Report Description: "${description}"
Has Images: ${hasImages}

Analyze this civic report and respond ONLY with a valid JSON object in this exact format:
{
  "category": "<one of: water|roads|electricity|sanitation|parks|public_works|drainage|other>",
  "detectedIssue": "<concise 3-7 word issue description>",
  "severity": "<one of: critical|high|medium|low>",
  "confidence": <number between 0.7 and 0.99>,
  "description": "<2-3 sentences summarizing the issue in plain language for citizens>"
}

Guidelines:
- critical: life safety risk, major infrastructure failure, affects 500+ people
- high: significant disruption, affects 100-500 people
- medium: moderate inconvenience, affects 10-100 people  
- low: minor issue, affects <10 people
- Be factual and human-friendly. No jargon.
`;

/**
 * Run the Report Intelligence Engine.
 * Returns demo response if Gemini is unavailable.
 */
export async function analyzeReport(
  description: string,
  hasImages: boolean
): Promise<ReportIntelligenceResult> {
  // ── Demo / Offline Fallback ────────────────────────────────────────────────
  if (demo.isActive || !features.ENABLE_GEMINI) {
    await sleep(demo.aiSimDurationMs);
    return demo.aiResponses.reportIntelligence;
  }

  // ── Live Gemini Call ───────────────────────────────────────────────────────
  const raw = await executeGeminiPrompt(
    "ReportIntelligence",
    PROMPT_TEMPLATE(description, hasImages)
  );

  if (!raw) return demo.aiResponses.reportIntelligence;

  const parsed = parseGeminiJSON<ReportIntelligenceResult>(raw);
  return parsed ?? demo.aiResponses.reportIntelligence;
}
