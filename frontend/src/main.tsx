import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "./routers/router";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { QueryProvider } from "./providers/QueryProvider";
import { ThemeProvider } from "./context/ThemeContext";
import { initSentry } from "./utils/sentry";
import { initAnalytics } from "./utils/analytics";
import "./index.css";

import { ThemeToaster } from "./components/ThemeToaster";

// ✅ PERFORMANCE: Unregister any existing service workers in dev mode
// This prevents old Service Workers from interfering with development
if (import.meta.env.DEV && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      registration.unregister().then(() => {
        console.log('[App] Unregistered old service worker:', registration.scope);
      });
    }
  });
}

// Initialize Sentry for error tracking
initSentry();

// Initialize Google Analytics
initAnalytics();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <QueryProvider>
          <RouterProvider router={router} />
          <ThemeToaster />
        </QueryProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
