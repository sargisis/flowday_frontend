import api from "./axios";

export interface Message {
    id: string;
    sender_id: string;
    receiver_id: string;
    content: string;
    created_at: string;
    is_read: boolean;
}

export interface Conversation {
    user_id: string;
    user_name: string;
    user_avatar?: string;
    last_message?: string;
    last_message_time?: string;
    unread_count: number;
    status: string;
}

export const getConversations = async (): Promise<Conversation[]> => {
    // Placeholder API call
    const res = await api.get("/messages/conversations");
    return res.data || [];
};

export const getMessages = async (userId: string): Promise<Message[]> => {
    // Placeholder API call
    const res = await api.get(`/messages/history/${userId}`);
    return res.data || [];
};

export const sendMessage = async (receiverId: string, content: string): Promise<Message> => {
    // Placeholder API call
    const res = await api.post("/messages/send", { receiver_id: receiverId, content });
    return res.data;
};
