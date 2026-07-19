import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import GuestRoute from "./GuestRoute";
import ProtectedRoute from "./ProtectedRoute";

import AdminLayout from "../layouts/AdminLayout";
import ForgotPassword from "../pages/auth/ForgotPassword";
import Login from "../pages/auth/Login";
import Dashboard from "../pages/dashboard/Dashboard";

export default function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>

                <Route path="/" element={<Navigate to="/dashboard" replace />}/>

                <Route element={<GuestRoute />}>
                    <Route path="/login" element={<Login />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                </Route>

                <Route element={<ProtectedRoute />}>

                    <Route element={<AdminLayout />}>

                        <Route path="/dashboard" element={<Dashboard />} />

                    </Route>

                </Route>

            </Routes>
        </BrowserRouter>
    );
}