// ─── Environment Variable Validation ─────────────────────────────────────────
// Validates required env vars at startup. Logs warnings for missing optional vars.

import { logger } from "@/lib/logger/logger";

interface EnvValidationResult {
  valid: boolean;
  missing: string[];
  warnings: string[];
}

const REQUIRED_VARS: string[] = [
  // None are truly required in demo mode — all have demo fallbacks
];

const OPTIONAL_VARS: Record<string, string> = {
  NEXT_PUBLIC_FIREBASE_API_KEY: "Firebase — real auth disabled, using demo mode",
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: "Firebase — Firestore disabled, using mock data",
  GEMINI_API_KEY: "Gemini — AI disabled, using deterministic demo responses",
  NEXT_PUBLIC_APP_ENV: "App environment (development|production|demo) — defaulting to development",
};

/**
 * Validate environment variables at startup.
 * Run this in root layout or middleware.
 */
export function validateEnv(): EnvValidationResult {
  const missing: string[] = [];
  const warnings: string[] = [];

  for (const key of REQUIRED_VARS) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  for (const [key, description] of Object.entries(OPTIONAL_VARS)) {
    if (!process.env[key]) {
      warnings.push(`${key}: ${description}`);
    }
  }

  if (missing.length > 0) {
    logger.error("Missing required environment variables", { missing });
  }

  if (warnings.length > 0 && process.env.NODE_ENV === "development") {
    logger.warn("Optional environment variables not set", { warnings });
  }

  return { valid: missing.length === 0, missing, warnings };
}

/**
 * Get a required env var or throw.
 */
export function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

/**
 * Get the current app environment.
 */
export function getAppEnv(): "development" | "production" | "demo" {
  const env = process.env.NEXT_PUBLIC_APP_ENV;
  if (env === "demo" || env === "production") return env;
  return "development";
}
