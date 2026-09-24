import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import ErrorBoundary from "./components/common/ErrorBoundary";
import PageLoader from "./components/common/PageLoader";
import { ApiErrorProvider } from "./context/ApiErrorContext";
import { authInitialized } from "./features/auth/authSlice";
import { getMe } from "./features/auth/meThunk";
import { fetchAllSettings } from "./features/setting/settingThunk";
import AppRoutes from "./routes/AppRoutes";

function App() {

    const dispatch = useDispatch();

    const auth = useSelector(
        state => state.auth
    );

    const settings = useSelector(state => state.setting?.data) || {};

    useEffect(() => {

        const token = localStorage.getItem("access_token");
        
        if (token) {
            dispatch(getMe());
        } else {
            dispatch(authInitialized());
        }

        // Fetch application settings globally
        dispatch(fetchAllSettings());

    }, [dispatch]);

    useEffect(() => {
        if (settings.site_favicon) {
            let link = document.querySelector("link[rel~='icon']");
            if (!link) {
                link = document.createElement('link');
                link.rel = 'icon';
                document.head.appendChild(link);
            }
            link.href = settings.site_favicon;
        }
    }, [settings.site_favicon]);


    if (!auth.authChecked) {
        return <PageLoader />;
    }


    return (
        <ApiErrorProvider>
            <ErrorBoundary>
                <AppRoutes />
            </ErrorBoundary>
        </ApiErrorProvider>
    );
}

export default App;