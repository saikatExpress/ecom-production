import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import GuestRoute from "./GuestRoute";
import ProtectedRoute from "./ProtectedRoute";

import AdminLayout from "../layouts/AdminLayout";
import ForgotPassword from "../pages/auth/ForgotPassword";
import Login from "../pages/auth/Login";
import Dashboard from "../pages/dashboard/Dashboard";

import ProductList from "../pages/products/ProductList";
import Brand from "../pages/products/Brand";
import Category from "../pages/products/Category";
import SubCategory from "../pages/products/SubCategory";
import Attribute from "../pages/products/Attribute";
import AttributeValue from "../pages/products/AttributeValue";

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
                        <Route path="/products" element={<ProductList />} />
                        <Route path="/products/category" element={<Category />} />
                        <Route path="/products/sub-category" element={<SubCategory />} />
                        <Route path="/products/brand" element={<Brand />} />
                        <Route path="/products/attribute" element={<Attribute />} />
                        <Route path="/products/attribute-values" element={<AttributeValue />} />

                    </Route>

                </Route>

            </Routes>
        </BrowserRouter>
    );
}