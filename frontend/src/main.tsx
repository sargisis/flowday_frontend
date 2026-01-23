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

// Log environment info for debugging
console.log('🚀 Flowday Starting...');
console.log('🔧 Mode:', import.meta.env.MODE);
console.log('📍 Hostname:', window.location.hostname);
console.log('🌐 Location:', window.location.href);
console.log('📱 User Agent:', navigator.userAgent);

try {
    const testUrl = import.meta.env.VITE_API_BASE_URL || 'auto-detect';
    console.log('🔗 API URL:', testUrl);
} catch (e) {
    console.error('❌ Error getting API URL:', e);
}

// Initialize Sentry for error tracking
try {
    console.log('🔧 Initializing Sentry...');
    initSentry();
    console.log('✅ Sentry initialized');
} catch (e) {
    console.error('❌ Sentry failed:', e);
}

// Initialize Google Analytics
try {
    console.log('📊 Initializing Analytics...');
    initAnalytics();
    console.log('✅ Analytics initialized');
} catch (e) {
    console.error('❌ Analytics failed:', e);
}

// Global error handler for unhandled errors
window.addEventListener('error', (event) => {
    console.error('🚨 Global Error:', event.error);
    if (import.meta.env.DEV) {
        console.error('Error details:', {
            message: event.message,
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            error: event.error
        });
    }
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('🚨 Unhandled Promise Rejection:', event.reason);
    if (import.meta.env.DEV) {
        console.error('Promise rejection details:', event.reason);
    }
});

// Prefetch critical routes after initial load
import { prefetchCriticalRoutes } from './utils/prefetch';
setTimeout(() => {
    prefetchCriticalRoutes();
}, 3000); // Prefetch after 3 seconds (non-blocking)

console.log('⚛️ Starting React render...');

try {
    const rootElement = document.getElementById("root");
    if (!rootElement) {
        throw new Error('Root element not found');
    }
    
    console.log('📦 Creating React root...');
    const root = ReactDOM.createRoot(rootElement);
    
    console.log('🎨 Rendering app...');
    root.render(
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
    
    console.log('✅ React app rendered');
} catch (e) {
    console.error('❌ Failed to render:', e);
    const rootElement = document.getElementById("root");
    if (rootElement) {
        rootElement.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:100vh;background:#09090b;color:white;flex-direction:column;gap:1rem;padding:2rem;text-align:center;"><h1 style="color:#ef4444;">⚠️ Error</h1><p style="color:#a1a1aa;">${e instanceof Error ? e.message : 'Failed to start'}</p><button onclick="location.reload()" style="padding:0.75rem 1.5rem;background:#6366f1;color:white;border:none;border-radius:0.5rem;cursor:pointer;font-weight:600;">Refresh</button></div>`;
    }
}
