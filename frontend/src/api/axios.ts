import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8080/api/v1",
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            // Don't redirect if we're already on the login page or if it's a login attempt failure
            const isLoginRequest = error.config.url?.includes("/auth/login");
            const isLoginPage = window.location.pathname.includes("/login");

            if (!isLoginRequest && !isLoginPage) {
                localStorage.removeItem("token");
                window.location.href = "/app/v1/login";
            }
        }
        return Promise.reject(error);
    }
);

export default api;
