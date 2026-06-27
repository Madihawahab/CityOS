// ─── CityOS Centralized Logger ───────────────────────────────────────────────
// Structured JSON logging. Readable in dev, exportable in production.

const isDev = process.env.NODE_ENV === "development";

type LogLevel = "info" | "warn" | "error" | "debug";

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
  durationMs?: number;
}

function log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...(context ? { context } : {}),
  };

  if (isDev) {
    const colors: Record<LogLevel, string> = {
      info: "\x1b[36m",
      warn: "\x1b[33m",
      error: "\x1b[31m",
      debug: "\x1b[90m",
    };
    const reset = "\x1b[0m";
    const prefix = `${colors[level]}[CityOS ${level.toUpperCase()}]${reset}`;
    if (context) {
      console.log(prefix, message, context);
    } else {
      console.log(prefix, message);
    }
  } else {
    // Production: structured JSON — pipe to log aggregator (Datadog, CloudWatch)
    console.log(JSON.stringify(entry));
  }
}

export const logger = {
  info: (msg: string, ctx?: Record<string, unknown>) => log("info", msg, ctx),
  warn: (msg: string, ctx?: Record<string, unknown>) => log("warn", msg, ctx),
  error: (msg: string, ctx?: Record<string, unknown>) => log("error", msg, ctx),
  debug: (msg: string, ctx?: Record<string, unknown>) => log("debug", msg, ctx),

  /** Log AI engine request with timing */
  aiRequest: (engine: string, durationMs: number, success: boolean) =>
    log(success ? "info" : "error", `AI engine: ${engine}`, {
      engine,
      durationMs,
      success,
    }),

  /** Log API route start */
  apiStart: (route: string, method: string) =>
    log("debug", `→ ${method} ${route}`, { route, method }),

  /** Log API route completion */
  apiComplete: (route: string, statusCode: number, durationMs: number) =>
    log("info", `← ${route} ${statusCode} (${durationMs}ms)`, {
      route,
      statusCode,
      durationMs,
    }),

  /** Log auth events */
  auth: (event: string, userId?: string) =>
    log("info", `AUTH: ${event}`, { event, userId }),
};
