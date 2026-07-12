import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute() {

    const {
        isAuthenticated,
        authChecked,
    } = useSelector(state => state.auth);


    if (!authChecked) {
        return <div>Loading...</div>;
    }


    return isAuthenticated
        ? <Outlet />
        : <Navigate to="/login" replace />;

}