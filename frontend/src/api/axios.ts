import axios, { AxiosError } from "axios";
import { toast } from "sonner";

// Get API base URL from environment variables
// Auto-detect IP for mobile devices if accessing from network
function getApiBaseUrl(): string {
    const envUrl = import.meta.env.VITE_API_BASE_URL;
    if (envUrl) {
        if (import.meta.env.DEV) console.log('🔗 Using API URL from env:', envUrl);
        return envUrl;
    }
    
    // If accessing from network (not localhost), use the same host for API
    const hostname = window.location.hostname;
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
        const apiUrl = `http://${hostname}:8080/api/v1`;
        if (import.meta.env.DEV) console.log('🔗 Auto-detected API URL for mobile:', apiUrl);
        return apiUrl;
    }
    
    // Default fallback for localhost
    const localUrl = "http://localhost:8080/api/v1";
    if (import.meta.env.DEV) console.log('🔗 Using localhost API URL:', localUrl);
    return localUrl;
}

const API_BASE_URL = getApiBaseUrl();

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000, // 30 seconds timeout
    withCredentials: true, // Enable cookies for refresh tokens
    headers: {
        "Content-Type": "application/json",
    },
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor with improved error handling
api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        // Use error.config which is already properly typed by axios
        // Add _retry flag for retry logic
        const originalRequest = error.config ? { ...error.config, _retry: (error.config as any)._retry } : undefined;

        // Handle network errors
        if (!error.response) {
            // Network error or timeout
            toast.error("No connection to server. Please check your internet connection.");

            // Retry logic for network errors (max 1 retry)
            if (originalRequest && !originalRequest._retry && originalRequest.url) {
                originalRequest._retry = true;

                // Wait before retry
                await new Promise(resolve => setTimeout(resolve, 1000));

                try {
                    return await api.request({
                        method: originalRequest.method || 'GET',
                        url: originalRequest.url,
                        data: originalRequest.data,
                        headers: originalRequest.headers,
                    });
                } catch (retryError) {
                    return Promise.reject(retryError);
                }
            }

            return Promise.reject(error);
        }

        const status = error.response?.status;
        const data = error.response?.data as any;

        // Handle different HTTP status codes
        switch (status) {
            case 401:
                // Unauthorized - handle token expiration with automatic refresh
                const isLoginRequest = originalRequest?.url?.includes("/auth/login");
                const isRefreshRequest = originalRequest?.url?.includes("/auth/refresh");
                const isLoginPage = window.location.pathname.includes("/login");
                const isRegisterPage = window.location.pathname.includes("/register");

                // Don't attempt refresh on login/register pages or if already refreshing
                if (isLoginRequest || isRefreshRequest || isLoginPage || isRegisterPage) {
                    break;
                }

                // Try to refresh the token
                if (originalRequest && !originalRequest._retry) {
                    originalRequest._retry = true;

                    try {
                        // Import refreshAccessToken dynamically to avoid circular dependency
                        const { refreshAccessToken } = await import("./auth");
                        const newToken = await refreshAccessToken();

                        // Update token in localStorage
                        localStorage.setItem("token", newToken);

                        // Update the Authorization header for the retry
                        if (originalRequest.headers) {
                            originalRequest.headers.Authorization = `Bearer ${newToken}`;
                        }

                        // Retry the original request
                        return api.request({
                            method: originalRequest.method || 'GET',
                            url: originalRequest.url || '',
                            data: originalRequest.data,
                            headers: originalRequest.headers,
                        });
                    } catch (refreshError) {
                        // Refresh failed - user needs to log in again
                        localStorage.removeItem("token");
                        toast.error("Session expired. Please log in again.");
                        window.location.href = "/app/v1/login";
                        return Promise.reject(refreshError);
                    }
                }

                // If we get here, refresh already failed
                localStorage.removeItem("token");
                toast.error("Session expired. Please log in again.");
                window.location.href = "/app/v1/login";
                break;

            case 403:
                // Forbidden
                toast.error(data?.error || "You don't have access to this resource.");
                break;

            case 404:
                // Not found
                const url = originalRequest?.url || '';
                // Don't show toast for silent 404s (like checking if user exists, analytics endpoints that may not exist yet)
                const silent404Paths = ['/me', '/analytics', '/focus/sessions'];
                const isSilent404 = silent404Paths.some(path => url.includes(path));
                if (!isSilent404) {
                    toast.error(data?.error || "Resource not found.");
                }
                break;

            case 429:
                // Too many requests - rate limiting
                toast.error("Too many requests. Please wait a moment.");
                break;

            case 500:
            case 502:
            case 503:
                // Server errors - retry with exponential backoff (skip 500 errors)
                if (originalRequest && !originalRequest._retry && status !== 500 && originalRequest.url) {
                    originalRequest._retry = true;
                    const retryDelay = Math.min(1000 * Math.pow(2, 1), 10000); // Max 10 seconds

                    await new Promise(resolve => setTimeout(resolve, retryDelay));

                    try {
                        return await api.request({
                            method: originalRequest.method || 'GET',
                            url: originalRequest.url,
                            data: originalRequest.data,
                            headers: originalRequest.headers,
                        });
                    } catch (retryError) {
                        return Promise.reject(retryError);
                    }
                }
                toast.error(data?.error || "Server error. Please try again later.");
                break;

            case 422:
                // Validation errors - show all validation errors
                const validationErrors = data?.errors || data?.error;
                if (Array.isArray(validationErrors)) {
                    validationErrors.forEach((err: string) => toast.error(err));
                } else if (typeof validationErrors === 'object') {
                    // Handle object with field errors
                    Object.entries(validationErrors).forEach(([field, message]) => {
                        toast.error(`${field}: ${message}`);
                    });
                } else {
                    toast.error(validationErrors || "Validation error. Please check your input.");
                }
                break;

            default:
                // Other errors
                if (status) {
                    const errorMessage = data?.error || data?.message || "An error occurred. Please try again.";
                    // Only show toast if not already handled
                    if (status >= 400 && status < 500 && !originalRequest?.url?.includes("/auth/login")) {
                        toast.error(errorMessage);
                    }
                }
        }

        return Promise.reject(error);
    }
);

export default api;
