import { ConfigProvider, theme } from "antd";
import { useState } from "react";
import { Outlet } from "react-router-dom";

import ApiErrorOverlay from "../components/common/ApiErrorOverlay";
import Footer from "../components/common/Footer";
import Header from "../components/common/Header";
import Sidebar from "../components/common/Sidebar";
import GlobalAiChat from "../components/common/GlobalAiChat";
import "./AdminLayout.css";

export default function AdminLayout() {
    const [isDarkMode, setIsDarkMode]   = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <ConfigProvider
            theme={{
                algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
                token: {
                    colorPrimary: '#1677ff',
                }
            }}
        >
            <ApiErrorOverlay />

            <div className={`admin-layout ${isDarkMode ? "dark-mode" : ""}`} style={{ background: isDarkMode ? '#141414' : '#f5f5f5', color: isDarkMode ? 'rgba(255, 255, 255, 0.85)' : 'rgba(0, 0, 0, 0.88)' }}>
                <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

                <div className="admin-main">
                    <Header isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} setSidebarOpen={setSidebarOpen} />

                    <main className="admin-content">
                        <Outlet />
                    </main>

                    <Footer />
                </div>
            </div>

            <GlobalAiChat />
        </ConfigProvider>
    );
}
