import api from "./axios";

export interface Project {
    id: string; // MongoDB ObjectID
    name: string;
    user_id: string;
}

export const getProjects = async (): Promise<Project[]> => {
    const res = await api.get("/projects");
    // Backend returns paginated response: { data: [...], meta: {...} }
    if (res.data && res.data.data && Array.isArray(res.data.data)) {
        return res.data.data;
    }
    // Fallback for non-paginated response or error
    return Array.isArray(res.data) ? res.data : [];
};

export const createProject = async (name: string): Promise<Project> => {
    const res = await api.post("/projects", { name });
    return res.data;
};
