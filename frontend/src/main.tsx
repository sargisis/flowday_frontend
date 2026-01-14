import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "./routers/router";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { QueryProvider } from "./providers/QueryProvider";
import { initSentry } from "./utils/sentry";
import { initAnalytics } from "./utils/analytics";
import "./index.css";

import { Toaster } from "sonner";

// Initialize Sentry for error tracking
initSentry();

// Initialize Google Analytics
initAnalytics();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryProvider>
        <RouterProvider router={router} />
        <Toaster position="top-center" richColors theme="dark" />
      </QueryProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
