import api from "./axios";

export interface Comment {
    id: string;
    task_id: string;
    user_id: string;
    content: string;
    created_at: string;
    updated_at: string;
}

export const getTaskComments = async (taskId: string): Promise<Comment[]> => {
    const res = await api.get(`/tasks/${taskId}/comments`);
    return res.data || [];
};

export const createComment = async (taskId: string, content: string): Promise<Comment> => {
    const res = await api.post(`/tasks/${taskId}/comments`, { content });
    return res.data;
};

export const updateComment = async (commentId: string, content: string): Promise<void> => {
    await api.put(`/comments/${commentId}`, { content });
};

export const deleteComment = async (commentId: string): Promise<void> => {
    await api.delete(`/comments/${commentId}`);
};
