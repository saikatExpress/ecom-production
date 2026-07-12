import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    timeout: 30000,
    headers: {
        Accept: "application/json",
    },
});

// Request Interceptor
api.interceptors.request.use(
    (config) => {

        const token = localStorage.getItem("access_token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        if (!(config.data instanceof FormData)) {
            config.headers["Content-Type"] = "application/json";
        }

        return config;

    },
    (error) => Promise.reject(error)
);

// Response Interceptor
api.interceptors.response.use(
    (response) => response,

    (error) => {

        if (error.response?.status === 401) {

            localStorage.removeItem("access_token");

            window.location.href = "/login";

        }

        return Promise.reject(error);

    }
);

export default api;