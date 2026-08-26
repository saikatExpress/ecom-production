import { useSelector } from 'react-redux';

export default function usePermissions() {
    const permissions = useSelector((state) => state.auth.permissions) || [];

    const hasPermission = (permissionName) => {
        return permissions.some(p => {
            if (typeof p === 'string') {
                return p === permissionName;
            }
            return p?.name === permissionName;
        });
    };

    const hasAnyPermission = (permissionNames = []) => {
        return permissionNames.some(name => hasPermission(name));
    };

    const hasAllPermissions = (permissionNames = []) => {
        return permissionNames.every(name => hasPermission(name));
    };

    return {permissions, hasPermission, hasAnyPermission, hasAllPermissions};
}
