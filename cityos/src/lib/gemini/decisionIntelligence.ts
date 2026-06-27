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
    return fallback();
  }

  const raw = await executeGeminiPrompt(
    "DecisionIntelligence",
    DECISION_PROMPT(category, severity, location, mergedCount)
  );
  if (!raw) return fallback();

  const parsed = parseGeminiJSON<DecisionIntelligenceResult>(raw);
  return parsed ?? fallback();
}
