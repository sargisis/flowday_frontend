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
