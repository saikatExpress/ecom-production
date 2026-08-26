import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import GuestRoute from "./GuestRoute";
import PermissionRoute from "./PermissionRoute";
import ProtectedRoute from "./ProtectedRoute";

import AdminLayout from "../layouts/AdminLayout";
import ForgotPassword from "../pages/auth/ForgotPassword";
import Login from "../pages/auth/Login";
import Dashboard from "../pages/dashboard/Dashboard";

import AddProduct from "../pages/products/AddProduct";
import Attribute from "../pages/products/Attribute";
import AttributeValue from "../pages/products/AttributeValue";
import Brand from "../pages/products/Brand";
import Category from "../pages/products/Category";
import ProductList from "../pages/products/ProductList";
import SubCategory from "../pages/products/SubCategory";
import Employee from "../pages/user/employee/Employee";
import AddManagement from "../pages/user/management/AddManagement";
import EditManagement from "../pages/user/management/EditManagement";
import Management from "../pages/user/management/Management";
import ManagementTrash from "../pages/user/management/ManagementTrash";

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

                        {/* User Menu */}
                        <Route path="/management/list" element={
                            <PermissionRoute permission="user_read">
                                <Management/>
                            </PermissionRoute>
                        } />
                        
                        <Route path="/add/management" element={
                            <PermissionRoute permission="user_create">
                                <AddManagement/>
                            </PermissionRoute>
                        } />
                        
                        <Route path="/edit/management/:id" element={
                            <PermissionRoute permission="user_update">
                                <EditManagement/>
                            </PermissionRoute>
                        } />
                        
                        <Route path="/management/trash" element={
                            <PermissionRoute permission="user_delete">
                                <ManagementTrash/>
                            </PermissionRoute>
                        } />

                        <Route path="/employee/list" element={
                            <PermissionRoute permission="user_read">
                                <Employee/>
                            </PermissionRoute>
                        }/>
                        {/* User Menu */}

                        <Route path="/products" element={<ProductList />} />
                        <Route path="/products/create" element={<AddProduct />} />
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
