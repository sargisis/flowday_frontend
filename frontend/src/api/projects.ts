import api from "./axios";

export interface Project {
    id: string; // MongoDB ObjectID
    name: string;
}

export const getProjects = async (): Promise<Project[]> => {
    const res = await api.get("/projects");
    return res.data || [];
};

export const createProject = async (name: string): Promise<Project> => {
    const res = await api.post("/projects", { name });
    return res.data;
};
