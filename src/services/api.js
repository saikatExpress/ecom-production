import axios from "axios";

let _reportApiError = null;

export function registerApiErrorReporter(fn) {
    _reportApiError = fn;
}

export function unregisterApiErrorReporter() {
    _reportApiError = null;
}

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    timeout: 30000,
    headers: {
        Accept: "application/json",
    },
});

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

api.interceptors.response.use(
    (response) => response,

    (error) => {
        const status = error.response?.status;
        const config = error.config || {};

        if (status === 401) {
            localStorage.removeItem("access_token");
            window.location.href = "/login";
            return Promise.reject(error);
        }

        if (_reportApiError && status !== 401) {
            const method = (config.method || "GET").toUpperCase();

            const base     = (config.baseURL || "").replace(/\/$/, "");
            const path     = (config.url    || "").replace(/^\//, "");
            let   endpoint = `${base}/${path}`;

            if (config.params && Object.keys(config.params).length) {
                const qs = new URLSearchParams(config.params).toString();
                endpoint += (endpoint.includes("?") ? "&" : "?") + qs;
            }

            const serverMessage =
                error.response?.data?.message ||
                error.response?.data?.error   ||
                error.message                  ||
                "No additional details.";

            _reportApiError({
                status,
                method,
                endpoint,
                message : serverMessage,
            });
        }

        return Promise.reject(error);
    }
);

export default api;