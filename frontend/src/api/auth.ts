import api from "./axios";

export const login = async (email: string, password: string) => {
  const res = await api.post("/auth/login", { email, password });
  return res.data;
};

export const register = async (name: string, email: string, password: string) => {
  const res = await api.post("/auth/register", { name, email, password });
  return res.data;
};

export const getMe = async () => {
  const res = await api.get("/me");
  return res.data;
};

export const forgotPassword = async (email: string) => {
  const res = await api.post("/auth/forgot-password", { email });
  return res.data;
};

export const resetPassword = async (email: string, code: string, newPassword: string) => {
  const res = await api.post("/auth/reset-password", { email, code, new_password: newPassword });
  return res.data;
};

export const updateProfile = async (data: { name?: string; bio?: string; workspace_name?: string }) => {
  const res = await api.patch("/users/profile", data);
  return res.data;
};

export const updateUserStatus = async (status: string) => {
  const res = await api.patch("/users/status", { status });
  return res.data;
};

export const uploadAvatar = async (file: File) => {
  const formData = new FormData();
  formData.append("avatar", file);
  const res = await api.post("/users/avatar", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};
export const requestEmailChange = async (currentPassword: string, newEmail: string) => {
  const res = await api.post("/users/email-change/request", { current_password: currentPassword, new_email: newEmail });
  return res.data;
};

export const confirmEmailChange = async (newEmail: string, code: string) => {
  const res = await api.post("/users/email-change/confirm", { new_email: newEmail, code });
  return res.data;
};

export const getAvatarUrl = (path?: string) => {
  if (!path) return null;
  if (path.startsWith('http') || path.startsWith('data:')) return path;
  // Ensure path starts with / if it's relative
  const fullPath = path.startsWith('/') ? path : `/${path}`;
  return `http://localhost:8080${fullPath}`;
};
