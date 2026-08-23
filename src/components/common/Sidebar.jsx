import { AppstoreOutlined, BranchesOutlined, ControlOutlined, DashboardOutlined, ProductOutlined, ShoppingCartOutlined, SlidersOutlined, TagsOutlined, UnorderedListOutlined, UserOutlined } from "@ant-design/icons";

import { Menu } from "antd";
import { useLocation, useNavigate } from "react-router-dom";

export default function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();

    // Format current path to match item key (e.g. "/products/brand" -> "products/brand")
    const currentKey = location.pathname.replace(/^\//, "") || "dashboard";

    const items = [
        {
            key: "dashboard",
            icon: <DashboardOutlined />,
            label: "Dashboard"
        },
        {
            key: "users-menu",
            icon: <UserOutlined />,
            label: "Users",
            children: [
                {
                    key: "users/list",
                    icon: <UnorderedListOutlined />,
                    label: "User List"
                },
                {
                    key: "users/role-permission",
                    icon: <ControlOutlined />,
                    label: "Role Permission"
                }
            ]
        },
        {
            key: "product-menu",
            icon: <ProductOutlined />,
            label: "Product",
            children: [
                {
                    key: "products",
                    icon: <UnorderedListOutlined />,
                    label: "Product List"
                },
                {
                    key: "products/category",
                    icon: <AppstoreOutlined />,
                    label: "Category"
                },
                {
                    key: "products/sub-category",
                    icon: <BranchesOutlined />,
                    label: "Sub Category"
                },
                {
                    key: "products/brand",
                    icon: <TagsOutlined />,
                    label: "Brand"
                },
                {
                    key: "products/attribute",
                    icon: <ControlOutlined />,
                    label: "Attribute"
                },
                {
                    key: "products/attribute-values",
                    icon: <SlidersOutlined />,
                    label: "Attribute Values"
                }
            ]
        },
        {
            key: "orders",
            icon: <ShoppingCartOutlined />,
            label: "Orders"
        },
        {
            key: "customers",
            icon: <UserOutlined />,
            label: "Customers"
        }
    ];

    const handleClick = ({ key }) => {
        navigate(`/${key}`);
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                ECOM ADMIN
            </div>

            <Menu mode="inline" selectedKeys={[currentKey]} defaultOpenKeys={["users-menu"]} items={items} onClick={handleClick}/>
        </aside>
    );
}
