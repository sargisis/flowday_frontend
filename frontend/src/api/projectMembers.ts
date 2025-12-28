import api from "./axios";

export interface ProjectMember {
    id: string; // MongoDB ObjectID
    project_id: string; // MongoDB ObjectID
    user_id: string; // MongoDB ObjectID
    role: string;
    status: string;
    token?: string;
    invited_at: string;
    accepted_at?: string;
    user?: {
        id: string; // MongoDB ObjectID
        name: string;
        email: string;
    };
    project?: {
        id: string; // MongoDB ObjectID
        name: string;
    };
}

export const getProjectMembers = async (projectId: string): Promise<ProjectMember[]> => {
    const res = await api.get(`/projects/${projectId}/members`);
    return res.data || [];
};

export const inviteMember = async (projectId: string, email: string) => {
    const res = await api.post(`/projects/${projectId}/members`, { email });
    return res.data;
};

export const getMyInvitations = async (): Promise<ProjectMember[]> => {
    const res = await api.get("/invitations");
    return res.data || [];
};

export const acceptInvitation = async (projectId: string) => {
    const res = await api.post(`/invitations/${projectId}/accept`);
    return res.data;
};

export const rejectInvitation = async (projectId: string) => {
    const res = await api.post(`/invitations/${projectId}/reject`);
    return res.data;
};

export const removeMember = async (projectId: string, userId: string) => {
    const res = await api.delete(`/projects/${projectId}/members/${userId}`);
    return res.data;
};

export const updateMemberRole = async (projectId: string, userId: string, role: string) => {
    const res = await api.put(`/projects/${projectId}/members/${userId}`, { role });
    return res.data;
};
