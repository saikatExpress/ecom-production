import { ApiOutlined, AppstoreOutlined, BranchesOutlined, ControlOutlined, CreditCardOutlined, DashboardOutlined, GlobalOutlined, LayoutOutlined, PictureOutlined, PlusCircleOutlined, ProductOutlined, ProfileOutlined, SafetyOutlined, SendOutlined, SettingOutlined, ShoppingCartOutlined, SlidersOutlined, StopOutlined, TagsOutlined, TeamOutlined, TruckOutlined, UnorderedListOutlined, UserOutlined, WarningOutlined } from "@ant-design/icons";

import { Drawer, Menu } from "antd";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
    const { t } = useTranslation();
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

    const allItems = 
    [
        {
            key: "dashboard",
            icon: <DashboardOutlined />,
            label: t("Dashboard"),
        },
        {
            key: "users-menu",
            icon: <UserOutlined />,
            label: t("Users"),
            children: [
                {
                    key       : "management/list",
                    icon      : <UnorderedListOutlined />,
                    label     : t("Management"),
                    permission: "user_read"
                },
                {
                    key       : "employee/list",
                    icon      : <UnorderedListOutlined />,
                    label     : t("Employee"),
                    permission: "user_read"
                },
                {
                    key       : "customers",
                    icon      : <UserOutlined />,
                    label     : t("Customers"),
                    permission: "user_read"
                },
                {
                    key       : "users/role-permission",
                    icon      : <ControlOutlined />,
                    label     : t("Role Permission"),
                    permission: "role_read"
                }
            ]
        },
        {
            key: "product-menu",
            icon: <ProductOutlined />,
            label: t("Product"),
            children: [
                {
                    key       : "products",
                    icon      : <UnorderedListOutlined />,
                    label     : t("Product List"),
                    permission: "product_read"
                },
                {
                    key       : "categories",
                    icon      : <AppstoreOutlined />,
                    label     : t("Category"),
                    permission: "category_read"
                },
                {
                    key       : "sub-categories",
                    icon      : <BranchesOutlined />,
                    label     : t("Sub Category"),
                    permission: "sub_category_read"
                },
                {
                    key       : "brands",
                    icon      : <TagsOutlined />,
                    label     : t("Brand"),
                    permission: "brand_read"
                },
                {
                    key       : "attributes",
                    icon      : <ControlOutlined />,
                    label     : t("Attribute"),
                    permission: "attribute_read"
                },
                {
                    key       : "attribute-values",
                    icon      : <SlidersOutlined />,
                    label     : t("Attribute Values"),
                    permission: "attribute_value_read"
                }
            ]
        },
        {
            key: "orders",
            icon: <ShoppingCartOutlined />,
            label: t("Orders"),
            children: [
                {
                    key       : "orders/list",
                    icon      : <ProfileOutlined />,
                    label     : t("Order List"),
                    permission: "order_read"
                },
                {
                    key       : "add/orders",
                    icon      : <PlusCircleOutlined />,
                    label     : t("Add Order"),
                    permission: "order_create"
                },
                {
                    key       : "order/source",
                    icon      : <GlobalOutlined />,
                    label     : t("Order Source"),
                    permission: "order_source_read"
                },
                {
                    key       : "status",
                    icon      : <GlobalOutlined />,
                    label     : t("Status"),
                    permission: "status_read"
                },
                {
                    key       : "customer-type",
                    icon      : <TeamOutlined />,
                    label     : t("Customer Type"),
                    permission: "customer_type_read"
                },
                {
                    key       : "cancel-reason",
                    icon      : <StopOutlined />,
                    label     : t("Cancel Reason"),
                    permission: "cancel_reason_read"
                },
                {
                    key       : "delivery-gateway",
                    icon      : <TruckOutlined />,
                    label     : t("Delivery Gateway"),
                    permission: "delivery_gateway_read"
                },
                {
                    key       : "payment-gateway",
                    icon      : <CreditCardOutlined />,
                    label     : t("Payment Gateway"),
                    permission: "payment_gateway_read"
                },
                {
                    key       : "coupons",
                    icon      : <TagsOutlined />,
                    label     : t("Coupon"),
                    permission: "coupon_read"
                }
            ]
        },
        {
            key: "fake-order-solutions",
            icon: <WarningOutlined />,
            label: t("Fake Order Solutions"),
            children: [
                {
                    key  : "fake-order-solutions/block-customers",
                    icon : <StopOutlined />,
                    label: t("Block Customers"),
                },
                {
                    key       : "order-guard",
                    icon      : <SafetyOutlined />,
                    label     : t("Order Guard"),
                    permission: "order_guard_settings_read"
                },
                {
                    key  : "fake-order-solutions/fraud-checker",
                    icon : <WarningOutlined />,
                    label: t("Fraud Checker"),
                }
            ]
        },
        {
            key: "courier",
            icon: <SendOutlined />,
            label: t("Courier"),
            children: [
                {
                    key       : "courier",
                    icon      : <UnorderedListOutlined />,
                    label     : t("All Courier"),
                    permission: "courier_read"
                },
                {
                    key       : "courier/settings",
                    icon      : <SettingOutlined />,
                    label     : t("Courier Settings"),
                    permission: "courier_settings_read"
                },
                {
                    key       : "courier/integration",
                    icon      : <ApiOutlined />,
                    label     : t("Courier Integration"),
                    permission: "courier_settings_read"
                }
            ]
        },
        {
            key: "section-banner-menu",
            icon: <LayoutOutlined />,
            label: t("Section & Banner"),
            children: [
                {
                    key       : "section",
                    icon      : <UnorderedListOutlined />,
                    label     : t("Section"),
                    permission: "section_read"
                },
                {
                    key       : "banner",
                    icon      : <PictureOutlined />,
                    label     : t("Section Banner"),
                    permission: "banner_read"
                },
                {
                    key       : "slider",
                    icon      : <SlidersOutlined />,
                    label     : t("Slider"),
                    permission: "slider_read"
                }
            ]
        },
        {
            key: "blog-menu",
            icon: <UnorderedListOutlined />,
            label: t("Blog Menu"),
            children: [
                {
                    key       : "blog-category",
                    icon      : <AppstoreOutlined />,
                    label     : t("Blog Category"),
                    permission: "blog_category_read"
                },
                {
                    key       : "blog-tag",
                    icon      : <TagsOutlined />,
                    label     : t("Blog Tag"),
                    permission: "tag_read"
                },
                {
                    key       : "blog",
                    icon      : <ProfileOutlined />,
                    label     : t("Blog"),
                    permission: "blog_read"
                }
            ]
        },
        {
            key: "cms-menu",
            icon: <ProfileOutlined />,
            label: t("CMS"),
            children: [
                {
                    key       : "about-us",
                    icon      : <UnorderedListOutlined />,
                    label     : t("About Us"),
                    permission: "page_read"
                },
                {
                    key       : "contact-us",
                    icon      : <UnorderedListOutlined />,
                    label     : t("Contact Us"),
                    permission: "page_read"
                },
                {
                    key       : "faq",
                    icon      : <UnorderedListOutlined />,
                    label     : t("Faq"),
                    permission: "page_read"
                },
                {
                    key       : "privacy-policy",
                    icon      : <UnorderedListOutlined />,
                    label     : t("Privacy Policy"),
                    permission: "page_read"
                },
                {
                    key       : "terms-condition",
                    icon      : <UnorderedListOutlined />,
                    label     : t("Terms & Condition"),
                    permission: "page_read"
                },
                {
                    key       : "shipping-delivery-policy",
                    icon      : <UnorderedListOutlined />,
                    label     : t("Shipping & Delivery Policy"),
                    permission: "page_read"
                },
                {
                    key       : "return-refund-policy",
                    icon      : <UnorderedListOutlined />,
                    label     : t("Return & Refund Policy"),
                    permission: "page_read"
                }
            ]
        },
        {
            key: "report-menu",
            icon: <UnorderedListOutlined />,
            label: t("Report"),
            children: [
                {
                    key       : "report/order",
                    icon      : <UnorderedListOutlined />,
                    label     : t("Order Report"),
                    permission: "report_read"
                },
                {
                    key       : "report/product",
                    icon      : <UnorderedListOutlined />,
                    label     : t("Product Report"),
                    permission: "report_read"
                },
                {
                    key       : "report/customer",
                    icon      : <UnorderedListOutlined />,
                    label     : t("Customer Report"),
                    permission: "report_read"
                },
                {
                    key       : "report/courier",
                    icon      : <UnorderedListOutlined />,
                    label     : t("Courier Report"),
                    permission: "report_read"
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

    // ─── Find parent key for current route to auto-open submenu ───────────────
    const getParentKey = (key, menuItems) => {
        for (const item of menuItems) {
            if (item.children) {
                if (item.children.some(child => child.key === key)) {
                    return item.key;
                }
                const nested = getParentKey(key, item.children);
                if (nested) return item.key;
            }
        }
        return null;
    };

    const initialParentKey = getParentKey(currentKey, allItems);
    const [openKeys, setOpenKeys] = useState(initialParentKey ? [initialParentKey] : []);

    // Sync openKeys if URL changes externally
    useEffect(() => {
        const pKey = getParentKey(currentKey, allItems);
        if (pKey && !openKeys.includes(pKey)) {
            setOpenKeys(prev => [...prev, pKey]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentKey]);

    const onOpenChange = (keys) => {
        setOpenKeys(keys);
    };

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
                openKeys={openKeys}
                onOpenChange={onOpenChange}
                items={items}
                onClick={handleClick}
                style={{ 
                    border: 'none',
                    padding: '10px 8px',
                    fontWeight: '600'
                }}
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

