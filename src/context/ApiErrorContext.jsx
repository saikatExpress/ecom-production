import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { KNOWN_ROUTES } from '../hooks/useNearestRoute';
import { registerApiErrorReporter, unregisterApiErrorReporter } from '../services/api';

function resolvePageLabel(pathname) {
    const match = KNOWN_ROUTES.find(r => r.path === pathname);
    return match ? match.label : pathname;
}

export const ApiErrorContext = createContext(null);

export function ApiErrorProvider({ children }) {
    const [errorEvent, setErrorEvent] = useState(null);
    const suppressedRef = useRef(new Set());

    const reportApiError = useCallback((info) => {
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

export function useApiError() {
    const ctx = useContext(ApiErrorContext);
    if (!ctx) throw new Error('useApiError must be used inside <ApiErrorProvider>');
    return ctx;
}
