import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "./routers/router";
import { ErrorBoundary } from "./components/ErrorBoundary";
import "./index.css";

import { Toaster } from "sonner";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <RouterProvider router={router} />
      <Toaster position="top-center" richColors theme="dark" />
    </ErrorBoundary>
  </React.StrictMode>
);
