import axios from "axios";

const api = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}`,
    withCredentials: true,
});

// ── Request Interceptor ────────────────────────────────────────────────────────
api.interceptors.request.use(
    (config) => config,
    (error) => Promise.reject(error)
);

// ── Response Interceptor ───────────────────────────────────────────────────────
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
        }
        return Promise.reject(error);
    }
);

export default api;