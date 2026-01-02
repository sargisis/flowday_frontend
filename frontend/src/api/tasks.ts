import api from "./axios";

export interface Task {
    id: string; // MongoDB ObjectID
    title: string;
    status: string;
    priority: string;
    project_id: string; // MongoDB ObjectID
    description?: string;
    due_date?: string;
    created_at?: string;
}

export const getTasksByProject = async (projectId: string): Promise<Task[]> => {
    const res = await api.get(`/tasks?project_id=${projectId}`);
    return res.data || [];
};

export const getAllTasks = async (): Promise<Task[]> => {
    const res = await api.get("/tasks/all");
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
    due_date?: string;
}) => {
    const res = await api.post("/tasks", data);
    return res.data;
};

export const deleteTask = async (id: string) => {
    const res = await api.delete(`/tasks/${id}`);
    return res.data;
};

export const getTasksByRange = async (from: string, to: string): Promise<Task[]> => {
    const res = await api.get(`/tasks/by-range?from=${from}&to=${to}`);
    return res.data || [];
};

export const decomposeTask = async (id: string): Promise<{ message: string, subtasks: Task[] }> => {
    const res = await api.post(`/tasks/${id}/decompose`);
    return res.data;
};

export const enrichTask = async (id: string): Promise<{ message: string, description: string }> => {
    const res = await api.post(`/tasks/${id}/enrich`);
    return res.data;
};

export interface AnalysisContext {
    stats: Record<string, number>;
    stale_tasks: string[];
    blocked_tasks: string[];
    velocity: number;
    overdue_count: number;
}

export const getAIHealthAdvice = async (context: AnalysisContext): Promise<{ advice: string }> => {
    const res = await api.post("/ai/health-advice", context);
    return res.data;
};
