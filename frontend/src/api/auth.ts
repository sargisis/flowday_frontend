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

// Get file upload base URL from environment variables
// Fallback to localhost for development if not set
const FILE_BASE_URL = import.meta.env.VITE_FILE_UPLOAD_BASE_URL || "http://localhost:8080";

export const getAvatarUrl = (path?: string) => {
  if (!path) return null;
  if (path.startsWith('http') || path.startsWith('data:')) return path;
  // Ensure path starts with / if it's relative
  const fullPath = path.startsWith('/') ? path : `/${path}`;
  return `${FILE_BASE_URL}${fullPath}`;
};

// Export file base URL helper for use in other components
export const getFileUrl = (path?: string) => {
  if (!path) return null;
  if (path.startsWith('http') || path.startsWith('data:')) return path;
  const fullPath = path.startsWith('/') ? path : `/${path}`;
  return `${FILE_BASE_URL}${fullPath}`;
};

// Refresh access token using the refresh token stored in HTTP-Only cookie
export const refreshAccessToken = async () => {
  const res = await api.post("/auth/refresh");
  return res.data.token;
};

export const updateNotificationSettings = async (data: { 
  email_notifications?: boolean; 
  slack_webhook_url?: string;
}) => {
  const res = await api.patch("/users/notifications", data);
  return res.data;
};

export const testSlackWebhook = async (webhookURL?: string) => {
  const res = await api.post("/users/notifications/test-slack", webhookURL ? { webhook_url: webhookURL } : {});
  return res.data;
};

// Slack OAuth Integration
export const initiateSlackOAuth = async () => {
  const res = await api.get("/slack/oauth/initiate");
  return res.data;
};

export const disconnectSlack = async () => {
  const res = await api.post("/slack/disconnect");
  return res.data;
};

export const getSlackChannels = async () => {
  const res = await api.get("/slack/channels");
  return res.data;
};

export const updateSlackChannel = async (channelId: string) => {
  const res = await api.patch("/slack/channel", { channel_id: channelId });
  return res.data;
};

export const testSlackOAuth = async () => {
  const res = await api.post("/slack/test");
  return res.data;
};

