import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

export default function GuestRoute() {

    const {
        isAuthenticated,
        authChecked,
    } = useSelector(state => state.auth);


    if (!authChecked) {
        return <div>Loading...</div>;
    }


    return isAuthenticated
        ? <Navigate to="/dashboard" replace />
        : <Outlet />;

}