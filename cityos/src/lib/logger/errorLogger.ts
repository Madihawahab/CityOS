import { logger } from "./logger";

/**
 * Error Boundary and unhandled exception capture.
 * Called by AppErrorBoundary, PortalErrorBoundary, and AIErrorBoundary.
 */
export const errorLogger = {
  /**
   * Log an Error Boundary failure.
   * @param error - The error that was caught
   * @param info - React error info including componentStack
   * @param boundaryName - Name of the boundary that caught the error
   */
  boundary: (
    error: Error,
    info: { componentStack?: string | null },
    boundaryName: string
  ): void => {
    logger.error(`Error boundary triggered: ${boundaryName}`, {
      boundaryName,
      errorMessage: error.message,
      stack: error.stack,
      componentStack: info.componentStack,
      timestamp: new Date().toISOString(),
    });
  },

  /**
   * Log an unhandled exception with optional context.
   * @param error - Any error (Error instance or unknown)
   * @param context - Optional additional context
   */
  exception: (error: unknown, context?: Record<string, unknown>): void => {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error(`Unhandled exception: ${err.message}`, {
      message: err.message,
      stack: err.stack,
      ...(context ?? {}),
      timestamp: new Date().toISOString(),
    });
  },

  /**
   * Log a Gemini API failure.
   */
  gemini: (engine: string, error: unknown): void => {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error(`Gemini engine failure: ${engine}`, {
      engine,
      message: err.message,
      timestamp: new Date().toISOString(),
    });
  },

  /**
   * Log a Firebase operation failure.
   */
  firebase: (operation: string, error: unknown): void => {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error(`Firebase operation failure: ${operation}`, {
      operation,
      message: err.message,
      timestamp: new Date().toISOString(),
    });
  },
};
