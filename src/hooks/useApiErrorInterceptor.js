/**
 * classifyStatus — maps an HTTP status code to a human-readable label,
 * a theme colour, and an emoji. Used by ApiErrorOverlay.
 */
export function classifyStatus(status) {
    if (!status) return { label: 'Network Error',                  color: '#6b7280', emoji: '🌐' };
    if (status === 404) return { label: '404 — API Endpoint Not Found',  color: '#ef4444', emoji: '🔍' };
    if (status === 422) return { label: '422 — Validation Failed',        color: '#f97316', emoji: '⚠️'  };
    if (status === 403) return { label: '403 — Forbidden',               color: '#a855f7', emoji: '🔒' };
    if (status === 500) return { label: '500 — Internal Server Error',    color: '#dc2626', emoji: '💥' };
    if (status === 502) return { label: '502 — Bad Gateway',              color: '#dc2626', emoji: '🚫' };
    if (status === 503) return { label: '503 — Service Unavailable',      color: '#dc2626', emoji: '⏳' };
    if (status >= 500)  return { label: `${status} — Server Error`,       color: '#dc2626', emoji: '💣' };
    if (status >= 400)  return { label: `${status} — Client Error`,       color: '#f59e0b', emoji: '❗' };
    return { label: `HTTP ${status}`, color: '#6b7280', emoji: '❓' };
}
