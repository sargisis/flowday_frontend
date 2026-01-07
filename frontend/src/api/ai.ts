import api from "./axios";

export interface Message {
    role: "user" | "assistant" | "system";
    content: string;
    timestamp: string;
}

export interface QuotaStatus {
    allowed: boolean;
    remaining: number; // -1 for unlimited
}

export interface Insight {
    id: string;
    type: "velocity" | "stale" | "blocker" | "general";
    title: string;
    message: string;
    is_read: boolean;
    created_at: string;
}

export const chatWithAI = async (message: string): Promise<{ reply: string }> => {
    const res = await api.post("/ai/chat", { message });
    return res.data;
};

export const getChatHistory = async (): Promise<{ history: Message[] }> => {
    const res = await api.get("/ai/history");
    return res.data;
};

export const getQuotaStatus = async (): Promise<QuotaStatus> => {
    const res = await api.get("/ai/quota");
    return res.data;
};

export const getInsights = async (): Promise<{ insights: Insight[] }> => {
    const res = await api.get("/ai/insights");
    return res.data;
};
