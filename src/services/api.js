import axios from "axios";

// ─── Stable callback ref — set by ApiErrorProvider on mount ──────────────────
// This lets the interceptor (registered at module load) call into React context
// without any hook ordering or timing issues.
let _reportApiError = null;

export function registerApiErrorReporter(fn) {
    _reportApiError = fn;
}

export function unregisterApiErrorReporter() {
    _reportApiError = null;
}

// ─── Axios instance ───────────────────────────────────────────────────────────
const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    timeout: 30000,
    headers: {
        Accept: "application/json",
    },
});

// ─── Request interceptor — attach auth token ──────────────────────────────────
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

// ─── Response interceptor — handle 401 + fire API error reporter ──────────────
api.interceptors.response.use(
    (response) => response,

    (error) => {
        const status = error.response?.status;
        const config = error.config || {};

        // ── 401: auto logout ──
        if (status === 401) {
            localStorage.removeItem("access_token");
            window.location.href = "/login";
            return Promise.reject(error);
        }

        // ── All other errors: fire the error overlay if reporter is registered ──
        if (_reportApiError && status !== 401) {
            const method = (config.method || "GET").toUpperCase();

            // Build full endpoint URL correctly
            // config.url is the relative path; config.baseURL is the base
            // Axios may store params separately in config.params — append them
            const base     = (config.baseURL || "").replace(/\/$/, "");
            const path     = (config.url    || "").replace(/^\//, "");
            let   endpoint = `${base}/${path}`;

            // Append any params Axios stored separately (e.g. when using params:{})
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