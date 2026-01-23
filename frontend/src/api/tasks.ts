import api from "./axios";

export interface Attachment {
    id: string;
    url: string;
    type: "image" | "file";
    filename: string;
    size: number;
    uploaded_at: string;
}

export interface Task {
    id: string; // MongoDB ObjectID
    title: string;
    status: string;
    priority: string;
    project_id: string; // MongoDB ObjectID
    description?: string;
    subtasks?: { id: string; title: string; completed: boolean }[];
    due_date?: string | null;
    created_at?: string;
    attachments?: Attachment[];
    tags?: Array<{ id: string; name: string; color: string }>;
}

export const getTasksByProject = async (projectId: string): Promise<Task[]> => {
    const res = await api.get(`/tasks?project_id=${projectId}`);
    // Backend returns paginated response: { data: [...], meta: {...} }
    if (res.data && res.data.data && Array.isArray(res.data.data)) {
        return res.data.data;
    }
    // Fallback for non-paginated response or error
    return Array.isArray(res.data) ? res.data : [];
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
    due_date?: string | null;
}) => {
    const res = await api.post("/tasks", data);
    return res.data;
};

export const deleteTask = async (id: string) => {
    const res = await api.delete(`/tasks/${id}`);
    return res.data;
};

export const bulkDeleteTasks = async (ids: string[]) => {
    const res = await api.post("/tasks/bulk-delete", { task_ids: ids });
    return res.data;
};

export const bulkUpdateTasksStatus = async (ids: string[], status: string): Promise<{ message: string; updated_count: number }> => {
    const res = await api.post("/tasks/bulk-update-status", { task_ids: ids, status });
    return res.data;
};

export const bulkUpdateTasksPriority = async (ids: string[], priority: string): Promise<{ message: string; updated_count: number }> => {
    const res = await api.post("/tasks/bulk-update-priority", { task_ids: ids, priority });
    return res.data;
};

export const duplicateTask = async (task: Task) => {
    const res = await api.post("/tasks", {
        title: `${task.title} (Copy)`,
        priority: task.priority,
        project_id: task.project_id,
        description: task.description,
        due_date: task.due_date,
    });
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

export const enrichTask = async (id: string): Promise<{ message: string, description: string, subtasks: Task['subtasks'] }> => {
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

// Task Attachments
export const uploadTaskAttachment = async (taskId: string, file: File): Promise<Attachment> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await api.post(`/tasks/${taskId}/attachments`, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return res.data;
};

export const getTaskAttachments = async (taskId: string): Promise<Attachment[]> => {
    const res = await api.get(`/tasks/${taskId}/attachments`);
    return res.data || [];
};

export const deleteTaskAttachment = async (taskId: string, attachmentId: string): Promise<void> => {
    await api.delete(`/tasks/${taskId}/attachments/${attachmentId}`);
};
