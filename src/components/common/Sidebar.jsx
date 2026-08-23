import { AppstoreOutlined, BranchesOutlined, ControlOutlined, DashboardOutlined, ProductOutlined, ShoppingCartOutlined, SlidersOutlined, TagsOutlined, UnorderedListOutlined, UserOutlined } from "@ant-design/icons";

import { Menu } from "antd";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";

export default function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();

    const { permissions } = useSelector((state) => state.auth);

    const currentKey = location.pathname.replace(/^\//, "") || "dashboard";

    const allItems = [
        {
            key: "dashboard",
            icon: <DashboardOutlined />,
            label: "Dashboard",
        },
        {
            key: "users-menu",
            icon: <UserOutlined />,
            label: "Users",
            children: [
                {
                    key: "users/list",
                    icon: <UnorderedListOutlined />,
                    label: "User List",
                    permission: "user_read"
                },
                {
                    key: "users/role-permission",
                    icon: <ControlOutlined />,
                    label: "Role Permission",
                    permission: "role_read"
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
                    label: "Product List",
                    permission: "product_read"
                },
                {
                    key: "products/category",
                    icon: <AppstoreOutlined />,
                    label: "Category",
                    permission: "category_read"
                },
                {
                    key: "products/sub-category",
                    icon: <BranchesOutlined />,
                    label: "Sub Category",
                    permission: "sub_category_read"
                },
                {
                    key: "products/brand",
                    icon: <TagsOutlined />,
                    label: "Brand",
                    permission: "brand_read"
                },
                {
                    key: "products/attribute",
                    icon: <ControlOutlined />,
                    label: "Attribute",
                    permission: "attribute_read"
                },
                {
                    key: "products/attribute-values",
                    icon: <SlidersOutlined />,
                    label: "Attribute Values",
                    permission: "attribute_value_read"
                }
            ]
        },
        {
            key: "orders",
            icon: <ShoppingCartOutlined />,
            label: "Orders",
            children : [
                {
                    key: "orders/list",
                    icon: <UnorderedListOutlined />,
                    label: "Order List",
                    permission: "order_read"
                },
                {
                    key: "add/orders",
                    icon : <UnorderedListOutlined />,
                    label: "Add Order",
                    permission: "order_create"
                },
                {
                    key: "order/source",
                    icon : <UnorderedListOutlined />,
                    label: "Order Source",
                    permission: "order_source_read"
                }
            ]
        },
        {
            key: "customers",
            icon: <UserOutlined />,
            label: "Customers",
            permission: "user_read"
        }
    ];

    const filterMenuItems = (items) => {
        return items
            .map((item) => {
                if (item.children) {
                    const filteredChildren = filterMenuItems(item.children);
                    if (filteredChildren.length > 0) {
                        return { ...item, children: filteredChildren };
                    }
                    return null;
                }

                if (item.permission) {
                    if (permissions && permissions.includes(item.permission)) {
                        return item;
                    }
                    return null;
                }

                return item;
            })
            .filter(Boolean);
    };

    const items = filterMenuItems(allItems);

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
