import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import GuestRoute from "./GuestRoute";
import PermissionRoute from "./PermissionRoute";
import ProtectedRoute from "./ProtectedRoute";

import AdminLayout from "../layouts/AdminLayout";
import ForgotPassword from "../pages/auth/ForgotPassword";
import Login from "../pages/auth/Login";
import Dashboard from "../pages/dashboard/Dashboard";

import AddBlog from "../pages/blog/AddBlog";
import Blog from "../pages/blog/Blog";
import AddBlogCategory from "../pages/blog/blog-category/AddBlogCategory";
import BlogCategory from "../pages/blog/blog-category/BlogCategory";
import EditBlogCategory from "../pages/blog/blog-category/EditBlogCategory";
import BlogTrash from "../pages/blog/BlogTrash";
import EditBlog from "../pages/blog/EditBlog";
import Tag from "../pages/blog/tag/Tag";
import CancelReason from "../pages/order/cancel-reason/CancelReason";
import CustomerType from "../pages/order/customer-type/CustomerType";
import AddDeliveryGateway from "../pages/order/delivery-gateway/AddDeliveryGateway";
import DeliveryGateway from "../pages/order/delivery-gateway/DeliveryGateway";
import EditDeliveryGateway from "../pages/order/delivery-gateway/EditDeliveryGateway";
import AddOrderSource from "../pages/order/order-source/AddOrderSource";
import EditOrderSource from "../pages/order/order-source/EditOrderSource";
import OrderSource from "../pages/order/order-source/OrderSource";
import AddPaymentGateway from "../pages/order/payment-gateway/AddPaymentGateway";
import EditPaymentGateway from "../pages/order/payment-gateway/EditPaymentGateway";
import PaymentGateway from "../pages/order/payment-gateway/PaymentGateway";
import AddProduct from "../pages/products/AddProduct";
import AttributeValue from "../pages/products/attribute-value/AttributeValue";
import Attribute from "../pages/products/attribute/Attribute";
import AttributeTrash from "../pages/products/attribute/AttributeTrash";
import AddBrand from "../pages/products/brand/AddBrand";
import Brand from "../pages/products/brand/Brand";
import BrandTrash from "../pages/products/brand/BrandTrash";
import EditBrand from "../pages/products/brand/EditBrand";
import AddCategory from "../pages/products/category/AddCategory";
import Category from "../pages/products/category/Category";
import CategoryTrash from "../pages/products/category/CategoryTrash";
import EditCategory from "../pages/products/category/EditCategory";
import ProductList from "../pages/products/ProductList";
import AddSubCategory from "../pages/products/sub-category/AddSubCategory";
import EditSubCategory from "../pages/products/sub-category/EditSubCategory";
import SubCategory from "../pages/products/sub-category/SubCategory";
import SubCategoryTrash from "../pages/products/sub-category/SubCategoryTrash";
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

                        <Route path="/sub-categories" element={
                            <PermissionRoute permission="sub_category_read">
                                <SubCategory />
                            </PermissionRoute>
                        } />

                        <Route path="/add/subcategory" element={
                            <PermissionRoute permission="sub_category_create">
                                <AddSubCategory />
                            </PermissionRoute>
                        } />

                        <Route path="/edit/subcategory/:id" element={
                            <PermissionRoute permission="sub_category_update">
                                <EditSubCategory />
                            </PermissionRoute>
                        } />

                        <Route path="/subcategory/trash" element={
                            <PermissionRoute permission="sub_category_delete">
                                <SubCategoryTrash />
                            </PermissionRoute>
                        } />

                        <Route path="/brands" element={
                            <PermissionRoute permission="brand_read">
                                <Brand />
                            </PermissionRoute>
                        } />

                        <Route path="/create/brand" element={
                            <PermissionRoute permission="brand_create">
                                <AddBrand />
                            </PermissionRoute>
                        } />

                        <Route path="/brand/trash" element={
                            <PermissionRoute permission="brand_delete">
                                <BrandTrash />
                            </PermissionRoute>
                        } />

                        <Route path="/edit/brand/:id" element={
                            <PermissionRoute permission="brand_update">
                                <EditBrand />
                            </PermissionRoute>
                        } />

                        <Route path="/attributes" element={
                            <PermissionRoute permission="attribute_read">
                                <Attribute />
                            </PermissionRoute>
                        } />

                        <Route path="/attribute/trash" element={
                            <PermissionRoute permission="attribute_read">
                                <AttributeTrash />
                            </PermissionRoute>
                        } />

                        <Route path="/attribute-values" element={
                            <PermissionRoute permission="attribute_value_read">
                                <AttributeValue />
                            </PermissionRoute>
                        } />
                        {/* Product Menu */}

                        {/* Order Menu */}
                        <Route path="/order/source" element={
                            <PermissionRoute permission="order_source_read">
                                <OrderSource/>
                            </PermissionRoute>
                        }/>

                        <Route path="/create/order-source" element={
                            <PermissionRoute permission="order_source_create">
                                <AddOrderSource/>
                            </PermissionRoute>
                        }/>

                        <Route path="/edit/order-source/:id" element={
                            <PermissionRoute permission="order_source_update">
                                <EditOrderSource/>
                            </PermissionRoute>
                        }/>

                        <Route path="/customer-type" element={
                            <PermissionRoute permission="customer_type_read">
                                <CustomerType/>
                            </PermissionRoute>
                        }/>

                        <Route path="/cancel-reason" element={
                            <PermissionRoute permission="cancel_reason_read">
                                <CancelReason/>
                            </PermissionRoute>
                        }/>

                        <Route path="/delivery-gateway" element={
                            <PermissionRoute permission="delivery_gateway_read">
                                <DeliveryGateway/>
                            </PermissionRoute>
                        }/>

                        <Route path="/create/delivery-gateway" element={
                            <PermissionRoute permission="delivery_gateway_create">
                                <AddDeliveryGateway/>
                            </PermissionRoute>
                        }/>

                        <Route path="/edit/delivery-gateway/:id" element={
                            <PermissionRoute permission="delivery_gateway_update">
                                <EditDeliveryGateway/>
                            </PermissionRoute>
                        }/>

                        <Route path="/payment-gateway" element={
                            <PermissionRoute permission="payment_gateway_read">
                                <PaymentGateway/>
                            </PermissionRoute>
                        }/>
                        
                        <Route path="/create/payment-gateway" element={
                            <PermissionRoute permission="payment_gateway_create">
                                <AddPaymentGateway/>
                            </PermissionRoute>
                        }/>

                        <Route path="/edit/payment-gateway/:id" element={
                            <PermissionRoute permission="payment_gateway_update">
                                <EditPaymentGateway/>
                            </PermissionRoute>
                        }/>
                        {/* Order Menu */}

                        {/* Blog Menu */}
                        <Route path="/blog-category" element={
                            <PermissionRoute permission="blog_category_read">
                                <BlogCategory/>
                            </PermissionRoute>
                        }/>

                        <Route path="/create/blog-category" element={
                            <PermissionRoute permission="blog_category_create">
                                <AddBlogCategory/>
                            </PermissionRoute>
                        }/>

                        <Route path="/edit/blog-category/:id" element={
                            <PermissionRoute permission="blog_category_update">
                                <EditBlogCategory/>
                            </PermissionRoute>
                        }/>

                        <Route path="/blog-tag" element={
                            <PermissionRoute permission="tag_read">
                                <Tag/>
                            </PermissionRoute>
                        }/>

                        <Route path="/blog" element={
                            <PermissionRoute permission="blog_read">
                                <Blog/>
                            </PermissionRoute>
                        }/>

                        <Route path="/create/blog" element={
                            <PermissionRoute permission="blog_create">
                                <AddBlog/>
                            </PermissionRoute>
                        }/>

                        <Route path="/edit/blog/:id" element={
                            <PermissionRoute permission="blog_update">
                                <EditBlog/>
                            </PermissionRoute>
                        }/>

                        <Route path="/trash/blog" element={
                            <PermissionRoute permission="blog_delete">
                                <BlogTrash/>
                            </PermissionRoute>
                        }/>
                        {/* Blog Menu */}
                    </Route>

                </Route>

            </Routes>
        </BrowserRouter>
    );
}
