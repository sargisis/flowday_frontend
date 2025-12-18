import api from "./axios";

export interface Task {
    id: string; // MongoDB ObjectID
    title: string;
    status: string;
    priority: string;
    project_id: string; // MongoDB ObjectID
    description?: string;
}

export const getTasksByProject = async (projectId: string): Promise<Task[]> => {
    const res = await api.get(`/tasks?project_id=${projectId}`);
    return res.data || [];
};

export const updateTask = async (id: string, updates: Partial<Task>) => {
    const res = await api.patch(`/tasks/${id}`, updates);
    return res.data;
};

export const createTask = async (data: {
    title: string;
    priority: string;
    project_id: string;
    description?: string;
}) => {
    const res = await api.post("/tasks", data);
    return res.data;
};

export const deleteTask = async (id: string) => {
    const res = await api.delete(`/tasks/${id}`);
    return res.data;
};
