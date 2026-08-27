import { ApiOutlined, AppstoreOutlined, BranchesOutlined, ControlOutlined, CreditCardOutlined, DashboardOutlined, GlobalOutlined, PlusCircleOutlined, ProductOutlined, ProfileOutlined, SendOutlined, SettingOutlined, ShoppingCartOutlined, SlidersOutlined, StopOutlined, TagsOutlined, TeamOutlined, TruckOutlined, UnorderedListOutlined, UserOutlined } from "@ant-design/icons";

import { Drawer, Menu } from "antd";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
    const navigate = useNavigate();
    const location = useLocation();

    const { permissions } = useSelector((state) => state.auth);

    const currentKey = location.pathname.replace(/^\//, "") || "dashboard";

    const [isMobile, setIsMobile] = useState(window.innerWidth < 992);
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 992);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

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
                    key: "management/list",
                    icon: <UnorderedListOutlined />,
                    label: "Management",
                    permission: "user_read"
                },
                {
                    key: "employee/list",
                    icon: <UnorderedListOutlined />,
                    label: "Employee",
                    permission: "user_read"
                },
                {
                    key: "customers",
                    icon: <UserOutlined />,
                    label: "Customers",
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
                    key: "categories",
                    icon: <AppstoreOutlined />,
                    label: "Category",
                    permission: "category_read"
                },
                {
                    key: "sub-categories",
                    icon: <BranchesOutlined />,
                    label: "Sub Category",
                    permission: "sub_category_read"
                },
                {
                    key: "brands",
                    icon: <TagsOutlined />,
                    label: "Brand",
                    permission: "brand_read"
                },
                {
                    key: "attributes",
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
            children: [
                {
                    key: "orders/list",
                    icon: <ProfileOutlined />,
                    label: "Order List",
                    permission: "order_read"
                },
                {
                    key: "add/orders",
                    icon: <PlusCircleOutlined />,
                    label: "Add Order",
                    permission: "order_create"
                },
                {
                    key: "order/source",
                    icon: <GlobalOutlined />,
                    label: "Order Source",
                    permission: "order_source_read"
                },
                {
                    key: "orders/customer-type",
                    icon: <TeamOutlined />,
                    label: "Customer Type",
                    permission: "customer_type_read"
                },
                {
                    key: "orders/cancel-reason",
                    icon: <StopOutlined />,
                    label: "Cancel Reason",
                    permission: "cancel_reason_read"
                },
                {
                    key: "orders/delivery-gateway",
                    icon: <TruckOutlined />,
                    label: "Delivery Gateway",
                    permission: "delivery_gateway_read"
                },
                {
                    key: "orders/payment-gateway",
                    icon: <CreditCardOutlined />,
                    label: "Payment Gateway",
                    permission: "payment_gateway_read"
                }
            ]
        },
        {
            key: "courier",
            icon: <SendOutlined />,
            label: "Courier",
            children: [
                {
                    key: "courier/all",
                    icon: <UnorderedListOutlined />,
                    label: "All Courier",
                    permission: "courier_read"
                },
                {
                    key: "courier/settings",
                    icon: <SettingOutlined />,
                    label: "Courier Settings",
                    permission: "courier_settings_read"
                },
                {
                    key: "courier/integration",
                    icon: <ApiOutlined />,
                    label: "Courier Integration",
                    permission: "courier_settings_read"
                }
            ]
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
        if (isMobile) setSidebarOpen(false);
    };

    const menuContent = (
        <>
            <div className="sidebar-logo">ECOM ADMIN</div>
            <Menu
                mode="inline"
                selectedKeys={[currentKey]}
                defaultOpenKeys={["dashboard"]}
                items={items}
                onClick={handleClick}
                style={{ border: 'none' }}
            />
        </>
    );

    // Mobile / Tablet — render inside a Drawer
    if (isMobile) {
        return (
            <Drawer
                placement="left"
                open={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                width={260}
                styles={{
                    header: { display: 'none' },
                    body: { padding: 0 },
                }}
            >
                {menuContent}
            </Drawer>
        );
    }

    // Desktop — render as fixed aside
    return (
        <aside className="sidebar">
            {menuContent}
        </aside>
    );
}

