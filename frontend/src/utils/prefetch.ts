/**
 * Prefetch utilities for code splitting optimization
 */

// Prefetch a module by path
export function prefetchModule(path: string): Promise<any> {
    return import(path).catch(() => {
        // Silently fail if prefetch fails
    });
}

// Prefetch critical routes that users are likely to visit
export function prefetchCriticalRoutes() {
    // Prefetch dashboard and tasks (most common pages)
    if (typeof window !== 'undefined') {
        // Use requestIdleCallback for non-blocking prefetch
        if ('requestIdleCallback' in window) {
            requestIdleCallback(() => {
                prefetchModule('../pages/Dashboard');
                prefetchModule('../pages/TasksPage');
            });
        } else {
            // Fallback for browsers without requestIdleCallback
            setTimeout(() => {
                prefetchModule('../pages/Dashboard');
                prefetchModule('../pages/TasksPage');
            }, 2000);
        }
    }
}

// Prefetch route based on pathname
export function prefetchRoute(pathname: string) {
    const routeMap: Record<string, string> = {
        '/app/v1/dashboard': '../pages/Dashboard',
        '/app/v1/calendar': '../pages/Calendar',
        '/app/v1/tasks': '../pages/TasksPage',
        '/app/v1/messages': '../pages/MessagesPage',
        '/app/v1/team': '../pages/TeamPage',
        '/app/v1/invitations': '../pages/InvitationsPage',
        '/app/v1/settings': '../pages/SettingsPage',
        '/app/v1/focus': '../pages/FocusMode',
        '/app/v1/notifications': '../pages/NotificationsPage',
        '/app/v1/achievements': '../pages/AchievementsPage',
        '/app/v1/analytics': '../pages/AnalyticsPage',
    };

    const modulePath = routeMap[pathname];
    if (modulePath) {
        prefetchModule(modulePath);
    }
}
