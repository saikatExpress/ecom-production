import {
    DashboardOutlined,
    ProductOutlined,
    ShoppingCartOutlined,
    UserOutlined,
    TagsOutlined,
    AppstoreOutlined,
    BranchesOutlined,
    UnorderedListOutlined,
    ControlOutlined,
    SlidersOutlined
} from "@ant-design/icons";

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

            <Menu
                mode="inline"
                selectedKeys={[currentKey]}
                defaultOpenKeys={["product-menu"]}
                items={items}
                onClick={handleClick}
            />
        </aside>
    );
}