import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { registerApiErrorReporter, unregisterApiErrorReporter } from '../services/api';
import { KNOWN_ROUTES } from '../hooks/useNearestRoute';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function resolvePageLabel(pathname) {
    const match = KNOWN_ROUTES.find(r => r.path === pathname);
    return match ? match.label : pathname;
}

// ─── Context ──────────────────────────────────────────────────────────────────
export const ApiErrorContext = createContext(null);

// ─── Provider ─────────────────────────────────────────────────────────────────
export function ApiErrorProvider({ children }) {
    const [errorEvent, setErrorEvent] = useState(null);
    const suppressedRef = useRef(new Set());

    const reportApiError = useCallback((info) => {
        // Skip 401 (handled via redirect) and 422 (validation errors handled in forms)
        if (info.status === 401 || info.status === 422) return;
        const endpointKey = info.endpoint?.split('?')[0] || info.endpoint || '';

        if (suppressedRef.current.has(endpointKey)) return;

        setErrorEvent({
            ...info,
            endpointKey,
            timestamp : new Date().toISOString(),
            pagePath  : window.location.pathname,
            pageLabel : resolvePageLabel(window.location.pathname),
        });
    }, []);

    const dismissApiError = useCallback(() => {
        setErrorEvent(prev => {
            if (prev?.endpointKey) suppressedRef.current.add(prev.endpointKey);
            return null;
        });
    }, []);

    const clearApiError = useCallback(() => setErrorEvent(null), []);

    // ── Register our reporter into the axios interceptor on mount ──
    useEffect(() => {
        registerApiErrorReporter(reportApiError);
        return () => unregisterApiErrorReporter();
    }, [reportApiError]);

    return (
        <ApiErrorContext.Provider value={{ errorEvent, reportApiError, dismissApiError, clearApiError }}>
            {children}
        </ApiErrorContext.Provider>
    );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useApiError() {
    const ctx = useContext(ApiErrorContext);
    if (!ctx) throw new Error('useApiError must be used inside <ApiErrorProvider>');
    return ctx;
}
