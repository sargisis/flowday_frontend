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
