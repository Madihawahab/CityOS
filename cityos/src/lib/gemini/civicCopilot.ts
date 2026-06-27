// ─── Civic Copilot Engine ─────────────────────────────────────────────────────
// AI Engine 6: Conversational AI assistant for citizens.
// Server-side only. Called from /api/v1/ai/copilot

import { executeGeminiPrompt } from "./client";
import { demo, getDemoCopilotResponse, sleep } from "@/config/demo";
import { features } from "@/config/features";
import type { CopilotMessage } from "@/types";

const SYSTEM_PROMPT = `You are CivicCopilot, the AI assistant for CityOS — Bengaluru's civic issue management platform.

You help citizens:
- Understand the status of their reports
- Learn about civic issues in their area
- Navigate the CityOS platform
- Understand how AI processes their reports

Tone: Friendly, concise, helpful. Maximum 3 sentences per response.
Language: English (simple, no jargon)
Never: Make promises about resolution times, override AI decisions, or discuss internal CityOS architecture.
Always: Acknowledge the citizen's concern first, then provide information.`;

/**
 * Generate a Civic Copilot response for a citizen query.
 */
export async function generateCopilotResponse(
  userMessage: string,
  conversationHistory: CopilotMessage[],
  reportContext?: { reportId: string; status: string; department: string }
): Promise<string> {
  // ── Demo / Offline Fallback ────────────────────────────────────────────────
  if (demo.isActive || !features.ENABLE_GEMINI) {
    await sleep(600); // Realistic typing delay
    return getDemoCopilotResponse(userMessage);
  }

  // ── Build conversation context ─────────────────────────────────────────────
  const contextBlock = reportContext
    ? `\nCurrent report context: Report ${reportContext.reportId} is "${reportContext.status}" and assigned to ${reportContext.department}.`
    : "";

  const historyBlock = conversationHistory
    .slice(-6) // Last 6 messages for context window
    .map((m) => `${m.role === "user" ? "Citizen" : "CivicCopilot"}: ${m.content}`)
    .join("\n");

  const prompt = `${SYSTEM_PROMPT}${contextBlock}

Conversation history:
${historyBlock}

Citizen: ${userMessage}
CivicCopilot:`;

  const response = await executeGeminiPrompt("CivicCopilot", prompt);
  return response ?? getDemoCopilotResponse(userMessage);
}
