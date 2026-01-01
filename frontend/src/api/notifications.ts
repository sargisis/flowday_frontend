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
    return res.data || [];
};

export const markNotificationRead = async (id: string): Promise<void> => {
    await api.patch(`/notifications/${id}/read`);
};
