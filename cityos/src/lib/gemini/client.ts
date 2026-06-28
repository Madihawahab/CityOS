// ─── Gemini API Client ────────────────────────────────────────────────────────
// SECURITY: All Gemini calls are EXCLUSIVELY server-side (API routes only).
// This file is never imported by browser components.
// The GEMINI_API_KEY env var is never NEXT_PUBLIC_ prefixed.

import { GoogleGenerativeAI, type GenerativeModel, type Part } from "@google/generative-ai";
import { logger } from "@/lib/logger/logger";
import { errorLogger } from "@/lib/logger/errorLogger";

let client: GoogleGenerativeAI | null = null;
let model: GenerativeModel | null = null;

/**
 * Initialize Gemini client (server-side only).
 * Returns null if API key is not configured.
 */
export function getGeminiClient(): GoogleGenerativeAI | null {
  if (client) return client;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    logger.warn("Gemini API key not configured — using demo mode responses");
    return null;
  }

  client = new GoogleGenerativeAI(apiKey);
  return client;
}

/**
 * Get the default Gemini model.
 */
export function getGeminiModel(modelName = "gemini-1.5-flash"): GenerativeModel | null {
  const gemini = getGeminiClient();
  if (!gemini) return null;

  if (!model) {
    model = gemini.getGenerativeModel({ model: modelName });
  }
  return model;
}

export async function executeGeminiPrompt(
  engineName: string,
  contents: string | Array<string | Part>,
  modelName = "gemini-1.5-flash"
): Promise<string | null> {
  const geminiModel = getGeminiModel(modelName);
  if (!geminiModel) return null;

  const startTime = Date.now();
  try {
    const result = await geminiModel.generateContent(contents as string | Array<string | Part>);
    const text = result.response.text();
    const durationMs = Date.now() - startTime;

    logger.aiRequest(engineName, durationMs, true);
    return text;
  } catch (error) {
    const durationMs = Date.now() - startTime;
    logger.aiRequest(engineName, durationMs, false);
    errorLogger.gemini(engineName, error);
    return null;
  }
}

/**
 * Parse JSON from Gemini response, stripping markdown code fences.
 */
export function parseGeminiJSON<T>(rawText: string): T | null {
  try {
    // Strip markdown code fences
    const cleaned = rawText
      .replace(/```json\s*/g, "")
      .replace(/```\s*/g, "")
      .trim();
    return JSON.parse(cleaned) as T;
  } catch {
    logger.error("Failed to parse Gemini JSON response", { rawText: rawText.slice(0, 200) });
    return null;
  }
}
