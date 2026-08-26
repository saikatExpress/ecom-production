import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import usePermissions from "../hooks/usePermissions";
import { message } from "antd";

export default function PermissionRoute({ permission, redirectTo = "/dashboard", children }) {
    const { hasPermission } = usePermissions();
    const hasAccess = hasPermission(permission);

    useEffect(() => {
        if (!hasAccess) {
            message.error("You do not have permission to access this page.");
        }
    }, [hasAccess]);

    if (!hasAccess) {
        return <Navigate to={redirectTo} replace />;
    }

    return children ? children : <Outlet />;
}
