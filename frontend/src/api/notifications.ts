import api from "./axios";

export interface Notification {
    id: string; // MongoDB ObjectID
    user_id: string;
    title: string;
    message: string;
    read: boolean;
    type: 'info' | 'success' | 'warning' | 'error';
    link?: string;
    created_at: string;
}

export const getNotifications = async (): Promise<Notification[]> => {
    const res = await api.get("/notifications");
    // Backend returns paginated response: { data: [...], meta: {...} }
    if (res.data && res.data.data && Array.isArray(res.data.data)) {
        return res.data.data;
    }
    // Fallback for non-paginated response or error
    return Array.isArray(res.data) ? res.data : [];
};

export const markNotificationRead = async (id: string): Promise<void> => {
    await api.patch(`/notifications/${id}/read`);
};

// ✅ ENHANCED: Batch notification operations
export const markNotificationsRead = async (ids: string[]): Promise<{ modified_count: number }> => {
    const res = await api.post("/notifications/batch-read", { notification_ids: ids });
    return res.data;
};

export const markAllNotificationsRead = async (): Promise<{ modified_count: number }> => {
    const res = await api.post("/notifications/mark-all-read");
    return res.data;
};

export const getUnreadCount = async (): Promise<{ count: number }> => {
    const res = await api.get("/notifications/unread-count");
    return res.data;
};

export const deleteOldNotifications = async (daysOld: number = 30): Promise<{ deleted_count: number }> => {
    const res = await api.delete(`/notifications/old?days=${daysOld}`);
    return res.data;
};
