import { BellOutlined, ClearOutlined, LogoutOutlined, MenuOutlined, MoonOutlined, ProfileOutlined, QuestionCircleOutlined, SearchOutlined, SettingOutlined, SunOutlined, UserOutlined } from "@ant-design/icons";
import { Avatar, Badge, Button, Dropdown, Input, List, message, Modal, Space, Tooltip, Typography } from "antd";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../features/auth/authSlice";
import { postData } from "../../services/request";
import "./Header.css";

const { Text } = Typography;

export default function Header({ isDarkMode, setIsDarkMode, setSidebarOpen }) {
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();

    const [cacheModalVisible, setCacheModalVisible] = useState(false);
    const [cacheData, setCacheData] = useState("");
    const [cacheLoading, setCacheLoading] = useState(false);

    const handleClearCache = async () => {
        setCacheLoading(true);
        try {
            const res = await postData("admin/cache-clear");
            if (res?.success) {
                setCacheData(res.data);
                setCacheModalVisible(true);
            } else {
                message.error(res?.message || "Failed to clear cache");
            }
        } catch (error) {
            console.error(error);
            message.error("An error occurred while clearing cache");
        } finally {
            setCacheLoading(false);
        }
    };

    const handleCacheModalClose = () => {
        setCacheModalVisible(false);
        window.location.reload();
    };

    const handleMenuClick = async (e) => {
        if (e.key === 'logout') {
            try {
                await postData('/auth/logout');
            } catch (error) {
                console.error("Logout failed:", error);
            } finally {
                dispatch(logout());
                message.success('Logged out successfully');
            }
        }
    };

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
    };

    const profileItems = [
        {
            key: "account",
            icon: <ProfileOutlined />,
            label: "Account",
        },
        {
            key: "setting",
            icon: <SettingOutlined />,
            label: "Settings",
        },
        {
            key: "support",
            icon: <QuestionCircleOutlined />,
            label: "Support",
        },
        {
            type: "divider",
        },
        {
            key: "logout",
            icon: <LogoutOutlined />,
            label: "Logout",
            danger: true,
        },
    ];

    const demoOrders = [
        { id: 1, title: "New Order #1024", desc: "John Doe placed an order for $120.00", time: "2 mins ago" },
        { id: 2, title: "Order #1020 Shipped", desc: "Order has been dispatched.", time: "1 hour ago" },
        { id: 3, title: "New Order #1025", desc: "Alice Smith placed an order for $50.00", time: "2 hours ago" },
    ];

    const notificationContent = (
        <div className="notification-dropdown">
            <div className="notification-header">
                <Text strong>Notifications</Text>
                <Badge count={demoOrders.length} className="notification-badge" />
            </div>
            <List
                itemLayout="horizontal"
                dataSource={demoOrders}
                renderItem={(item) => (
                    <List.Item className="notification-item">
                        <List.Item.Meta
                            avatar={<Avatar style={{ backgroundColor: '#1677ff' }} icon={<BellOutlined />} />}
                            title={<a href="#">{item.title}</a>}
                            description={
                                <div>
                                    <Text type="secondary" style={{ fontSize: '12px' }}>{item.desc}</Text>
                                    <br />
                                    <Text type="secondary" style={{ fontSize: '10px' }}>{item.time}</Text>
                                </div>
                            }
                        />
                    </List.Item>
                )}
            />
            <div className="notification-footer">
                <Button type="link" block>View All Notifications</Button>
            </div>
        </div>
    );

    return (
        <header className="header-container">
            <div className="header-left">
                {/* Hamburger — only visible on mobile/tablet */}
                <Button
                    type="text"
                    icon={<MenuOutlined style={{ fontSize: '18px' }} />}
                    className="header-hamburger"
                    onClick={() => setSidebarOpen(true)}
                />
                <Input
                    size="large"
                    placeholder="Search here..."
                    prefix={<SearchOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
                    className="header-search"
                    allowClear
                    style={{ borderRadius: '20px' }}
                />
            </div>

            <div className="header-right">
                <Space size="middle" align="center">
                    <Button
                        type="text"
                        shape="circle"
                        icon={isDarkMode ? <SunOutlined style={{ fontSize: '18px' }} /> : <MoonOutlined style={{ fontSize: '18px' }} />}
                        onClick={toggleTheme}
                        className="header-icon-btn"
                    />

                    <Tooltip title="Clear Cache">
                        <Button
                            type="text"
                            shape="circle"
                            icon={<ClearOutlined style={{ fontSize: '18px' }} />}
                            onClick={handleClearCache}
                            loading={cacheLoading}
                            className="header-icon-btn"
                        />
                    </Tooltip>

                    <Dropdown
                        dropdownRender={() => notificationContent}
                        trigger={['click']}
                        placement="bottomRight"
                    >
                        <Badge count={3} size="small" style={{ cursor: 'pointer' }}>
                            <Button
                                type="text"
                                shape="circle"
                                icon={<BellOutlined style={{ fontSize: '18px' }} />}
                                className="header-icon-btn"
                            />
                        </Badge>
                    </Dropdown>

                    <Dropdown
                        menu={{ items: profileItems, onClick: handleMenuClick }}
                        trigger={['click']}
                        placement="bottomRight"
                    >
                        <div className="user-profile">
                            <Avatar
                                size="default"
                                icon={<UserOutlined />}
                                src={user?.avatar}
                                className="user-avatar"
                            />
                            <div className="user-info">
                                <Text strong className="user-name">{user?.username || 'Admin User'}</Text>
                                <Text type="secondary" className="user-role">{user?.role || 'Administrator'}</Text>
                            </div>
                        </div>
                    </Dropdown>
                </Space>
            </div>

            <Modal
                title={
                    <Space>
                        <ClearOutlined style={{ color: '#52c41a' }} />
                        <Typography.Text strong style={{ fontSize: '18px' }}>Cache Cleared Successfully</Typography.Text>
                    </Space>
                }
                open={cacheModalVisible}
                onOk={handleCacheModalClose}
                onCancel={handleCacheModalClose}
                okText="Reload Application"
                cancelText="Close"
                width={700}
                centered
            >
                <div style={{ marginTop: '16px' }}>
                    <Typography.Paragraph type="secondary" style={{ marginBottom: '16px' }}>
                        All application caches have been successfully flushed. Below is the system log output:
                    </Typography.Paragraph>
                    <div 
                        style={{ 
                            backgroundColor: '#1e1e1e', 
                            color: '#4af626', 
                            padding: '16px', 
                            borderRadius: '8px', 
                            fontFamily: "'Fira Code', 'Courier New', Courier, monospace", 
                            whiteSpace: 'pre-wrap', 
                            maxHeight: '400px', 
                            overflowY: 'auto',
                            boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)',
                            fontSize: '13px',
                            lineHeight: '1.6'
                        }}
                    >
                        {cacheData}
                    </div>
                </div>
            </Modal>
        </header>
    );
}
