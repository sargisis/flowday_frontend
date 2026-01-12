import axios, { AxiosError } from "axios";
import { toast } from "sonner";

// Get API base URL from environment variables
// Fallback to localhost for development if not set
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1";

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000, // 30 seconds timeout
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
            toast.error("Нет соединения с сервером. Проверьте интернет-соединение.");
            
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
                // Unauthorized - handle token expiration
                const isLoginRequest = originalRequest?.url?.includes("/auth/login");
                const isLoginPage = window.location.pathname.includes("/login");
                const isRegisterPage = window.location.pathname.includes("/register");

                if (!isLoginRequest && !isLoginPage && !isRegisterPage) {
                    localStorage.removeItem("token");
                    toast.error("Сессия истекла. Пожалуйста, войдите снова.");
                    window.location.href = "/app/v1/login";
                }
                break;

            case 403:
                // Forbidden
                toast.error(data?.error || "У вас нет доступа к этому ресурсу.");
                break;

            case 404:
                // Not found
                if (!originalRequest?.url?.includes("/me")) {
                    // Don't show toast for silent 404s (like checking if user exists)
                    toast.error(data?.error || "Ресурс не найден.");
                }
                break;

            case 429:
                // Too many requests - rate limiting
                toast.error("Слишком много запросов. Пожалуйста, подождите немного.");
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
                toast.error(data?.error || "Ошибка на сервере. Попробуйте позже.");
                break;

            case 422:
                // Validation errors
                const validationErrors = data?.errors || data?.error;
                if (Array.isArray(validationErrors)) {
                    validationErrors.forEach((err: string) => toast.error(err));
                } else {
                    toast.error(validationErrors || "Ошибка валидации данных.");
                }
                break;

            default:
                // Other errors
                if (status) {
                    const errorMessage = data?.error || data?.message || "Произошла ошибка. Попробуйте еще раз.";
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
