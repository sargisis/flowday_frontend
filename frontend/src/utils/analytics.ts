/**
 * Google Analytics 4 (GA4) Integration
 * 
 * This module provides analytics tracking for Flowday.
 * Configure VITE_GA4_MEASUREMENT_ID in your .env file to enable tracking.
 */

declare global {
  interface Window {
    gtag?: (
      command: string,
      targetId: string | Date,
      config?: Record<string, any>
    ) => void
    dataLayer?: any[]
  }
}

// GA4 Measurement ID from environment variable
const GA4_MEASUREMENT_ID = import.meta.env.VITE_GA4_MEASUREMENT_ID

/**
 * Initialize Google Analytics 4
 * Call this in main.tsx before rendering the app
 */
export function initAnalytics() {
  if (!GA4_MEASUREMENT_ID) {
    if (import.meta.env.PROD) {
      console.warn('GA4 Measurement ID not provided. Analytics is disabled.')
    }
    return
  }

  // Prevent multiple initializations
  if (window.dataLayer) {
    return
  }

  // Initialize dataLayer
  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag() {
    if (window.dataLayer) {
      window.dataLayer.push(arguments)
    }
  }
  window.gtag('js', new Date())
  window.gtag('config', GA4_MEASUREMENT_ID, {
    send_page_view: false, // We'll send page views manually
  })

  // Load GA4 script
  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`
  document.head.appendChild(script)
}

/**
 * Track page view
 */
export function trackPageView(path: string, title?: string) {
  if (!GA4_MEASUREMENT_ID || !window.gtag) return

  window.gtag('config', GA4_MEASUREMENT_ID, {
    page_path: path,
    page_title: title || document.title,
  })
}

/**
 * Track custom event
 */
export function trackEvent(
  eventName: string,
  parameters?: Record<string, any>
) {
  if (!GA4_MEASUREMENT_ID || !window.gtag) return

  window.gtag('event', eventName, parameters)
}

// Pre-defined event tracking functions for common actions

/**
 * Track user registration
 */
export function trackRegistration(method: 'email' | 'oauth' = 'email') {
  trackEvent('sign_up', { method })
}

/**
 * Track user login
 */
export function trackLogin(method: 'email' | 'oauth' = 'email') {
  trackEvent('login', { method })
}

/**
 * Track task creation
 */
export function trackTaskCreate(taskId: string, priority?: string) {
  trackEvent('task_create', {
    task_id: taskId,
    priority: priority || 'medium',
  })
}

/**
 * Track task completion
 */
export function trackTaskComplete(taskId: string, duration?: number) {
  trackEvent('task_complete', {
    task_id: taskId,
    duration_minutes: duration,
  })
}

/**
 * Track task update
 */
export function trackTaskUpdate(taskId: string, field: string) {
  trackEvent('task_update', {
    task_id: taskId,
    field,
  })
}

/**
 * Track focus mode session start
 */
export function trackFocusStart(taskId?: string, duration?: number) {
  trackEvent('focus_start', {
    task_id: taskId,
    planned_duration_minutes: duration,
  })
}

/**
 * Track focus mode session end
 */
export function trackFocusEnd(taskId?: string, duration?: number) {
  trackEvent('focus_end', {
    task_id: taskId,
    actual_duration_minutes: duration,
  })
}

/**
 * Track project creation
 */
export function trackProjectCreate(projectId: string) {
  trackEvent('project_create', { project_id: projectId })
}

/**
 * Track team invitation sent
 */
export function trackInvitationSent(email: string) {
  trackEvent('invitation_sent', { email })
}

/**
 * Track feature usage
 */
export function trackFeatureUsage(featureName: string, details?: Record<string, any>) {
  trackEvent('feature_use', {
    feature_name: featureName,
    ...details,
  })
}

/**
 * Track search query
 */
export function trackSearch(query: string, resultCount?: number) {
  trackEvent('search', {
    search_term: query,
    result_count: resultCount,
  })
}

/**
 * Track error (for analytics, not error tracking)
 */
export function trackError(errorMessage: string, errorLocation?: string) {
  trackEvent('exception', {
    description: errorMessage,
    fatal: false,
    location: errorLocation,
  })
}
