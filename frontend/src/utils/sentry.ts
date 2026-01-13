import * as Sentry from "@sentry/react";

/**
 * Initialize Sentry for error tracking
 * Call this in main.tsx before rendering the app
 */
export function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN;

  // Only initialize if DSN is provided
  if (!dsn) {
    if (import.meta.env.PROD) {
      console.warn("Sentry DSN not provided. Error tracking is disabled.");
    }
    return;
  }

  Sentry.init({
    dsn,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    // Performance Monitoring
    tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0, // 10% in production, 100% in dev
    // Session Replay
    replaysSessionSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
    replaysOnErrorSampleRate: 1.0, // Always record when error occurs
    // Environment
    environment: import.meta.env.MODE || "development",
    // Release tracking (useful for tracking which version has errors)
    release: import.meta.env.VITE_APP_VERSION || undefined,
    // Filter out common errors that aren't useful
    beforeSend(event, hint) {
      // Don't send errors in development (unless explicitly testing)
      if (import.meta.env.DEV && !import.meta.env.VITE_SENTRY_DEBUG) {
        return null;
      }

      // Filter out network errors that are expected (CORS, etc.)
      const error = hint.originalException;
      if (error instanceof Error) {
        // Skip known errors that aren't actionable
        if (
          error.message.includes("ResizeObserver loop") ||
          error.message.includes("Non-Error promise rejection")
        ) {
          return null;
        }
      }

      return event;
    },
  });
}
