// ─── CityOS Centralized Theme System ─────────────────────────────────────────
// Single source of truth for all design tokens.
// All components consume values from here — never hardcode colors.

export const theme = {
  colors: {
    // ── Brand ─────────────────────────────────────────────────────────────
    primary: "#004ac6",
    primaryHover: "#003ea8",
    primaryLight: "#dbe1ff",
    primaryFixed: "#b4c5ff",
    secondary: "#006c49",
    secondaryLight: "#6cf8bb",
    tertiary: "#784b00",
    tertiaryLight: "#ffddb8",

    // ── Semantic ──────────────────────────────────────────────────────────
    success: "#006c49",
    warning: "#784b00",
    error: "#ba1a1a",
    errorLight: "#ffdad6",
    info: "#004ac6",

    // ── Surface (Light Theme) ─────────────────────────────────────────────
    background: "#f9f9ff",
    surface: "#f9f9ff",
    surfaceLow: "#f0f3ff",
    surfaceContainer: "#e7eeff",
    surfaceContainerHigh: "#dee8ff",
    surfaceHighest: "#d8e3fb",
    surfaceDim: "#cfdaf2",
    surfaceLowest: "#ffffff",

    // ── Text ──────────────────────────────────────────────────────────────
    onSurface: "#111c2d",
    onSurfaceVariant: "#434655",
    outline: "#737686",
    outlineVariant: "#c3c6d7",

    // ── On-color ──────────────────────────────────────────────────────────
    onPrimary: "#ffffff",
    onSecondary: "#ffffff",
    onError: "#ffffff",

    // ── Inverse (Dark Mode) ───────────────────────────────────────────────
    inverseSurface: "#263143",
    inverseOnSurface: "#ecf1ff",
    inversePrimary: "#b4c5ff",

    // ── Dark Theme ────────────────────────────────────────────────────────
    dark: {
      background: "#0c0e14",
      surface: "#111827",
      surfaceLow: "#1a2035",
      surfaceContainer: "#1e2640",
      onSurface: "#ecf1ff",
      onSurfaceVariant: "#b4bcd0",
      outline: "#4a4f60",
      outlineVariant: "#2a3045",
    },
  },

  radius: {
    sm: "0.5rem",
    md: "1rem",
    lg: "2rem",
    xl: "3rem",
    full: "9999px",
  },

  shadow: {
    sm: "0px 2px 8px rgba(30,41,59,0.04)",
    md: "0px 4px 20px rgba(30,41,59,0.05)",
    lg: "0px 8px 30px rgba(30,41,59,0.08)",
    ai: "0 0 15px rgba(0,74,198,0.15)",
    dark: "0px 4px 20px rgba(0,0,0,0.3)",
    darkLg: "0px 8px 40px rgba(0,0,0,0.4)",
  },

  spacing: {
    unit: "4px",
    gutter: "24px",
    marginMobile: "16px",
    marginTablet: "24px",
    marginDesktop: "48px",
    maxWidth: "1280px",
  },

  typography: {
    displayLg: { size: "57px", lineHeight: "64px", weight: 700, letterSpacing: "-0.02em" },
    headlineLg: { size: "32px", lineHeight: "40px", weight: 600, letterSpacing: "-0.01em" },
    headlineMd: { size: "28px", lineHeight: "36px", weight: 600, letterSpacing: "-0.01em" },
    titleLg: { size: "22px", lineHeight: "28px", weight: 500 },
    titleMd: { size: "16px", lineHeight: "24px", weight: 500 },
    bodyLg: { size: "16px", lineHeight: "24px", weight: 400 },
    bodyMd: { size: "14px", lineHeight: "20px", weight: 400 },
    labelMd: { size: "12px", lineHeight: "16px", weight: 500, letterSpacing: "0.1px" },
    font: "Inter, system-ui, sans-serif",
  },

  breakpoints: {
    mobile: "375px",
    tablet: "768px",
    laptop: "1024px",
    desktop: "1280px",
  },

  // ── Status color mapping ──────────────────────────────────────────────────
  statusColors: {
    submitted: { bg: "bg-surface-container", text: "text-on-surface-variant", label: "Submitted" },
    ai_processing: { bg: "bg-primary-light", text: "text-primary", label: "AI Processing" },
    ai_verified: { bg: "bg-primary-light", text: "text-primary", label: "AI Verified" },
    assigned: { bg: "bg-tertiary/10", text: "text-tertiary", label: "Assigned" },
    in_progress: { bg: "bg-tertiary/10", text: "text-tertiary", label: "In Progress" },
    work_started: { bg: "bg-tertiary/15", text: "text-tertiary", label: "Work Started" },
    evidence_uploaded: { bg: "bg-primary-light", text: "text-primary", label: "Evidence Uploaded" },
    ai_verifying_repair: { bg: "bg-primary-light", text: "text-primary", label: "AI Verifying" },
    citizen_verification_pending: { bg: "bg-tertiary/10", text: "text-tertiary", label: "Pending Verification" },
    resolved: { bg: "bg-secondary/10", text: "text-secondary", label: "Resolved" },
    closed: { bg: "bg-surface-highest", text: "text-on-surface-variant", label: "Closed" },
  },

  // ── Priority color mapping ────────────────────────────────────────────────
  priorityColors: {
    critical: { bg: "bg-error-light", text: "text-error", dot: "bg-error", label: "Critical" },
    high: { bg: "bg-tertiary-light", text: "text-tertiary", dot: "bg-tertiary", label: "High" },
    medium: { bg: "bg-primary-light", text: "text-primary", dot: "bg-primary", label: "Medium" },
    low: { bg: "bg-secondary/10", text: "text-secondary", dot: "bg-secondary", label: "Low" },
  },

  // ── Category icons (Material Symbols) ────────────────────────────────────
  categoryIcons: {
    water: "water_drop",
    roads: "road",
    electricity: "bolt",
    sanitation: "delete",
    parks: "park",
    public_works: "construction",
    drainage: "water",
    other: "report_problem",
  },

  // ── Category labels ───────────────────────────────────────────────────────
  categoryLabels: {
    water: "Water Supply",
    roads: "Roads & Infrastructure",
    electricity: "Electricity",
    sanitation: "Sanitation",
    parks: "Parks & Recreation",
    public_works: "Public Works",
    drainage: "Drainage",
    other: "Other",
  },
} as const;

export type Theme = typeof theme;
