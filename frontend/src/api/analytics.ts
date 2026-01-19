import api from './axios';

export interface FocusSession {
    id: string;
    task_id?: string;
    task_title: string;
    duration: number; // in minutes
    xp: number;
    created_at: string;
}

export interface ActivityData {
    date: string;
    count: number;
}

export interface AnalyticsData {
    flowScore: {
        current: number;
        previous?: number;
        factors: {
            completionRate: number;
            focusTime: number;
            consistency: number;
            velocity: number;
            quality: number;
        };
    };
    activityHeatmap: ActivityData[];
    focusSessions: FocusSession[];
    taskTrends: Array<{
        date: string;
        created: number;
        completed: number;
    }>;
}

/**
 * Get focus sessions for analytics
 */
export async function getFocusSessions(
    from?: string,
    to?: string
): Promise<FocusSession[]> {
    const params: Record<string, string> = {};
    if (from) params.from = from;
    if (to) params.to = to;
    
    try {
        const response = await api.get('/focus/sessions', { params });
        return response.data || [];
    } catch (error: any) {
        // If endpoint doesn't exist (404), return empty array silently
        if (error?.response?.status === 404) {
            return [];
        }
        throw error;
    }
}

/**
 * Get activity data for heatmap
 */
export async function getActivityData(
    projectId?: string,
    days: number = 365
): Promise<ActivityData[]> {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);

    const params: Record<string, string> = {
        from: start.toISOString().split('T')[0],
        to: end.toISOString().split('T')[0],
    };
    if (projectId) params.project_id = projectId;

    try {
        const response = await api.get('/analytics/activity', { params });
        return response.data || [];
    } catch (error: any) {
        // If endpoint doesn't exist (404), return empty array silently
        // Other errors should be handled by caller
        if (error?.response?.status === 404) {
            return [];
        }
        throw error;
    }
}

/**
 * Get comprehensive analytics data
 */
export async function getAnalyticsData(
    projectId?: string,
    days: number = 30
): Promise<Partial<AnalyticsData>> {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);

    const params: Record<string, string> = {
        from: start.toISOString().split('T')[0],
        to: end.toISOString().split('T')[0],
    };
    if (projectId) params.project_id = projectId;

    try {
        const response = await api.get('/analytics', { params });
        return response.data || {};
    } catch (error: any) {
        // If endpoint doesn't exist (404), return empty data silently
        if (error?.response?.status === 404) {
            return {};
        }
        throw error;
    }
}
