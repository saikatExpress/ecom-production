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
import AddCategory from "../pages/products/category/AddCategory";
import Category from "../pages/products/category/Category";
import CategoryTrash from "../pages/products/category/CategoryTrash";
import EditCategory from "../pages/products/category/EditCategory";
import ProductList from "../pages/products/ProductList";
import SubCategory from "../pages/products/SubCategory";
import AddEmployee from "../pages/user/employee/AddEmployee";
import EditEmployee from "../pages/user/employee/EditEmployee";
import Employee from "../pages/user/employee/Employee";
import EmployeeTrash from "../pages/user/employee/EmployeeTrash";
import AddManagement from "../pages/user/management/AddManagement";
import EditManagement from "../pages/user/management/EditManagement";
import Management from "../pages/user/management/Management";
import ManagementTrash from "../pages/user/management/ManagementTrash";
import AddRole from "../pages/user/Role/AddRole";
import EditRole from "../pages/user/Role/EditRole";
import Role from "../pages/user/Role/Role";
import Customer from './../pages/user/Customer';

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

                        <Route path="/employee/trash" element={
                            <PermissionRoute permission="user_read">
                                <EmployeeTrash/>
                            </PermissionRoute>
                        }/>

                        <Route path="/add/employee" element={
                            <PermissionRoute permission="user_create">
                                <AddEmployee/>
                            </PermissionRoute>
                        }/>

                        <Route path="/edit/employee/:id" element={
                            <PermissionRoute permission="user_update">
                                <EditEmployee/>
                            </PermissionRoute>
                        } />

                        <Route path="/customers" element={
                            <PermissionRoute permission="user_read">
                                <Customer/>
                            </PermissionRoute>
                        } />

                        <Route path="/users/role-permission" element={
                            <PermissionRoute permission="role_read">
                                <Role/>
                            </PermissionRoute>
                        } />

                        <Route path="/role/create" element={
                            <PermissionRoute permission="role_create">
                                <AddRole/>
                            </PermissionRoute>
                        } />

                        <Route path="/role/edit/:id" element={
                            <PermissionRoute permission="role_update">
                                <EditRole/>
                            </PermissionRoute>
                        } />
                        {/* User Menu */}

                        {/* Product Menu */}
                        <Route path="/products" element={
                            <PermissionRoute permission="product_read">
                                <ProductList />
                            </PermissionRoute>
                        } />

                        <Route path="/products/create" element={
                            <PermissionRoute permission="product_create">
                                <AddProduct />
                            </PermissionRoute>
                        } />

                        <Route path="/categories" element={
                            <PermissionRoute permission="category_read">
                                <Category />
                            </PermissionRoute>
                        } />

                        <Route path="/category/trash/list" element={
                            <PermissionRoute permission="category_read">
                                <CategoryTrash />
                            </PermissionRoute>
                        } />

                        <Route path="/create/category" element={
                            <PermissionRoute permission="category_create">
                                <AddCategory />
                            </PermissionRoute>
                        } />

                        <Route path="/edit/category/:id" element={
                            <PermissionRoute permission="category_update">
                                <EditCategory />
                            </PermissionRoute>
                        } />

                        <Route path="/products/sub-category" element={
                            <PermissionRoute permission="sub_category_read">
                                <SubCategory />
                            </PermissionRoute>
                        } />

                        <Route path="/products/brand" element={
                            <PermissionRoute permission="brand_read">
                                <Brand />
                            </PermissionRoute>
                        } />

                        <Route path="/products/attribute" element={
                            <PermissionRoute permission="attribute_read">
                                <Attribute />
                            </PermissionRoute>
                        } />

                        <Route path="/products/attribute-values" element={
                            <PermissionRoute permission="attribute_value_read">
                                <AttributeValue />
                            </PermissionRoute>
                        } />
                        {/* Product Menu */}

                    </Route>

                </Route>

            </Routes>
        </BrowserRouter>
    );
}
