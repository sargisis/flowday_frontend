import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { trackPageView } from '../utils/analytics'

/**
 * Component to track page views on route changes
 * Add this inside RouterProvider to track all navigation
 */
export function AnalyticsTracker() {
  const location = useLocation()

  useEffect(() => {
    // Track page view on route change
    trackPageView(location.pathname + location.search, document.title)
  }, [location])

  return null
}
