import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import PageLoader from "./components/common/PageLoader";
import { authInitialized } from "./features/auth/authSlice";
import { getMe } from "./features/auth/meThunk";
import AppRoutes from "./routes/AppRoutes";


function App() {

    const dispatch = useDispatch();

    const auth = useSelector(
        state => state.auth
    );

    useEffect(() => {

        const token = localStorage.getItem("access_token");
        
        if (token) {
            dispatch(getMe());
        } else {
            dispatch(authInitialized());
        }

    }, [dispatch]);


    if (!auth.authChecked) {
        return <PageLoader />;
    }


    return <AppRoutes />;
}

export default App;