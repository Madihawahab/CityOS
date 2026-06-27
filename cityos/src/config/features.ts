// ─── CityOS Feature Flag Registry ────────────────────────────────────────────
// No feature requires code removal. Toggle availability at runtime.
// Components gracefully hide unavailable functionality.

export const features = {
  // ── AI & Intelligence Layer ──────────────────────────────────────────────
  /** Real Gemini API calls — falls back to demo.aiResponses if false */
  ENABLE_GEMINI:
    process.env.NEXT_PUBLIC_APP_ENV !== "demo" &&
    Boolean(process.env.NEXT_PUBLIC_APP_ENV !== "development" || process.env.GEMINI_API_KEY),
  /** CivicCopilot chat drawer — falls back to scripted FAQ if Gemini off */
  ENABLE_AI_COPILOT: true,
  /** Predictive analytics on Admin portal */
  ENABLE_PREDICTIONS: true,
  /** City heatmap visualisations */
  ENABLE_HEATMAPS: true,

  // ── Backend ──────────────────────────────────────────────────────────────
  /** Real Firestore — falls back to mock data if false */
  ENABLE_FIREBASE: process.env.NEXT_PUBLIC_APP_ENV !== "demo",
  /** Firebase Cloud Messaging push notifications */
  ENABLE_PUSH_NOTIFICATIONS: true,

  // ── Frontend Features ────────────────────────────────────────────────────
  /** IndexedDB offline report queue */
  ENABLE_OFFLINE_MODE: true,
  /** PWA install prompt */
  ENABLE_PWA: true,
  /** Admin analytics section */
  ENABLE_ANALYTICS: true,

  // ── Demo & Development ───────────────────────────────────────────────────
  /** Full demo mode — set NEXT_PUBLIC_APP_ENV=demo to activate */
  ENABLE_DEMO_MODE: process.env.NEXT_PUBLIC_APP_ENV === "demo",
} as const;

export type FeatureFlag = keyof typeof features;

/**
 * Check if a feature flag is enabled.
 * @example
 * if (isEnabled('ENABLE_AI_COPILOT')) { ... }
 */
export function isEnabled(flag: FeatureFlag): boolean {
  return features[flag];
}
