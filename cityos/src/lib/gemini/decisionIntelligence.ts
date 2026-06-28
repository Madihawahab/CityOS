// ─── Decision Intelligence Engine ────────────────────────────────────────────
// AI Engine 3: Routes verified reports to the correct department with priority.
// Decisions are IMMUTABLE. No human override permitted.

import { executeGeminiPrompt, parseGeminiJSON } from "./client";
import { demo, sleep } from "@/config/demo";
import { features } from "@/config/features";
import { DEPARTMENTS } from "@/lib/utils/constants";
import type { DecisionIntelligenceResult, IssueCategory, IssueSeverity } from "@/types";

const DECISION_PROMPT = (
  category: IssueCategory,
  severity: IssueSeverity,
  location: string,
  mergedCount: number
) => `
You are the CityOS Decision Intelligence Engine. Route this verified civic report.

Category: ${category}
Severity: ${severity}
Location: ${location}
Merged reports count: ${mergedCount}

Available departments: ${DEPARTMENTS.map((d) => d.name).join(", ")}

Respond ONLY with valid JSON:
{
  "department": "<exact department name from the list above>",
  "priority": "<critical|high|medium|low>",
  "estimatedResolution": "<human-readable like '2 Hours', '1 Day', '3 Days'>",
  "priorityReason": "<1-2 sentences explaining the priority, mention area and impact>",
  "recommendedActions": ["<action 1>", "<action 2>", "<action 3>"]
}
Rules:
- Route water/drainage issues to BWSSB
- Route road issues to BBMP Roads
- Route electricity to BESCOM
- Route sanitation/parks to BBMP
- Escalate if mergedCount > 5
- Always write priorityReason in plain language for non-technical readers
`;

export async function routeReport(
  category: IssueCategory,
  severity: IssueSeverity,
  location: string,
  mergedCount: number
): Promise<DecisionIntelligenceResult> {
  const fallback = (): DecisionIntelligenceResult => ({
    ...demo.aiResponses.decisionIntelligence,
    recommendedActions: [...demo.aiResponses.decisionIntelligence.recommendedActions],
  });

  if (demo.isActive || !features.ENABLE_GEMINI) {
    await sleep(demo.aiSimDurationMs / 3);
    
    let dept = "BBMP Solid Waste Management Division";
    const priority = severity;
    let eta = "3 Days";
    let reason = `Assigned priority based on Category ${category} and Severity ${severity} in local HSR Layout zone.`;
    let actions = ["Inspect reported location", "Dispatch work crew"];

    if (category === "water") {
      dept = "BWSSB Water Supply Division";
      eta = "2–3 Days";
      reason = "Water disruption risk detected on busy transit street corridor.";
      actions = ["Locate shutoff valve", "Seal pipe leakage"];
    } else if (category === "roads") {
      dept = "BBMP Roads & Infrastructure Division";
      eta = "3 Days";
      reason = "Pothole poses hazard on active vehicle traffic corridor.";
      actions = ["Seal pothole with cold mix", "Re-tar segment"];
    } else if (category === "electricity") {
      dept = "BESCOM Street Lighting Dept";
      eta = "2 Days";
      reason = "Streetlight repair needed for night pedestrian safety.";
      actions = ["Replace bulb/fixture", "Check wiring line"];
    } else if (category === "drainage") {
      dept = "BWSSB Drainage & Stormwater Division";
      eta = "2 Days";
      reason = "Drain blockage flooding public walk lanes.";
      actions = ["Clear drain inlet", "Flush stormwater pipe"];
    }

    return {
      department: dept,
      priority: priority,
      estimatedResolution: eta,
      priorityReason: reason,
      recommendedActions: actions
    };
  }

  const raw = await executeGeminiPrompt(
    "DecisionIntelligence",
    DECISION_PROMPT(category, severity, location, mergedCount)
  );
  if (!raw) return fallback();

  const parsed = parseGeminiJSON<DecisionIntelligenceResult>(raw);
  return parsed ?? fallback();
}
