// ─── Report Intelligence Engine ───────────────────────────────────────────────
// AI Engine 1: Analyzes report image and description to classify the civic issue.
// Server-side only. Called from /api/v1/ai/analyze-report

import { executeGeminiPrompt, parseGeminiJSON } from "./client";
import { demo } from "@/config/demo";
import { features } from "@/config/features";
import { sleep } from "@/config/demo";
import type { ReportIntelligenceResult, IssueCategory, IssueSeverity } from "@/types";
import type { Part } from "@google/generative-ai";

const PROMPT_TEMPLATE = (description: string, voiceTranscript?: string | null) => `
You are the CityOS Report Intelligence Engine analyzing a civic issue report from Bengaluru, India.

User Description: "${description}"
${voiceTranscript ? `User Voice Recording Transcript: "${voiceTranscript}"` : ""}

Analyze this civic report, inspect the uploaded image if provided, and respond ONLY with a valid JSON object in this exact format:
{
  "category": "<one of: water|roads|electricity|sanitation|parks|public_works|drainage|other>",
  "detectedIssue": "<concise 3-7 word issue description, e.g., 'Large Pothole on MG Road' or 'Street Light Failure'>",
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
- Category must reflect the visual evidence and descriptions.
`;

/**
 * Run the Report Intelligence Engine with Gemini-first multimodal analysis.
 * Falls back to keyword-based classifier if Gemini is inactive or fails.
 */
export async function analyzeReport(
  description: string,
  hasImages: boolean,
  imageData?: string | null,
  voiceTranscript?: string | null
): Promise<ReportIntelligenceResult> {
  const isGeminiAvailable = process.env.GEMINI_API_KEY && features.ENABLE_GEMINI && !demo.isActive;

  if (isGeminiAvailable) {
    try {
      const prompt = PROMPT_TEMPLATE(description, voiceTranscript);
      const contents: Array<string | Part> = [prompt];

      if (imageData) {
        const matches = imageData.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.*)$/);
        if (matches && matches.length >= 3) {
          contents.push({
            inlineData: {
              data: matches[2]!,
              mimeType: matches[1]!
            }
          });
        } else {
          contents.push({
            inlineData: {
              data: imageData,
              mimeType: "image/jpeg"
            }
          });
        }
      }

      const raw = await executeGeminiPrompt("ReportIntelligence", contents);
      if (raw) {
        const parsed = parseGeminiJSON<ReportIntelligenceResult>(raw);
        if (parsed && parsed.category && parsed.detectedIssue && parsed.severity) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn("Gemini multimodal analysis failed, falling back to keyword classifier:", err);
    }
  }

  // ── Fallback Keyword-Based Classifier ──────────────────────────────────────
  if (demo.isActive || !features.ENABLE_GEMINI) {
    await sleep(demo.aiSimDurationMs);
  }

  let category = "water";
  let detectedIssue = "Water Outage & Pipeline Leak";
  let severity = "medium";
  let descSummary = "A water outage reported by local residents requiring pipeline inspection.";
  
  const query = (description + " " + (voiceTranscript || "")).toLowerCase();
  if (query.includes("pothole") || query.includes("road") || query.includes("asphalt")) {
    category = "roads";
    detectedIssue = "Large Pothole on MG Road";
    severity = "high";
    descSummary = "Significant road damage reported on MG Road causing traffic congestion and safety risks.";
  } else if (query.includes("garbage") || query.includes("waste") || query.includes("refuse") || query.includes("trash")) {
    category = "sanitation";
    detectedIssue = "Overflowing Garbage Bin on 12th Main";
    severity = "medium";
    descSummary = "Overflowing municipal waste bin causing public sanitation and odor concerns.";
  } else if (query.includes("light") || query.includes("lamp") || query.includes("dark")) {
    category = "electricity";
    detectedIssue = "Street Light Failure near Bus Stop";
    severity = "medium";
    descSummary = "Non-functional street light reducing visibility and public safety after dark.";
  } else if (query.includes("drain") || query.includes("flooding") || query.includes("sewer")) {
    category = "drainage";
    detectedIssue = "Sewer Blockage & Drainage Flooding";
    severity = "high";
    descSummary = "Stormwater drain backup flooding public sidewalk and roadway lanes.";
  } else if (query.includes("hazard") || query.includes("debris") || query.includes("safety")) {
    category = "other";
    detectedIssue = "Construction Debris Hazard on Sidewalk";
    severity = "high";
    descSummary = "Unregulated construction waste obstructing pedestrian sidewalk traffic.";
  }

  return {
    category: category as IssueCategory,
    detectedIssue,
    severity: severity as IssueSeverity,
    confidence: 0.94,
    description: descSummary
  };
}
