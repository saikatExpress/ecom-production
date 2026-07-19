import { Outlet } from "react-router-dom";
import { useState } from "react";
import { ConfigProvider, theme } from "antd";

import Footer from "../components/common/Footer";
import Sidebar from "../components/common/Sidebar";

import Header from "../components/common/Header";
import "./AdminLayout.css";

export default function AdminLayout() {
    const [isDarkMode, setIsDarkMode] = useState(false);

    return (
        <ConfigProvider
            theme={{
                algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
                token: {
                    colorPrimary: '#1677ff',
                }
            }}
        >
            <div className={`admin-layout ${isDarkMode ? "dark-mode" : ""}`} style={{ background: isDarkMode ? '#141414' : '#f5f5f5', color: isDarkMode ? 'rgba(255, 255, 255, 0.85)' : 'rgba(0, 0, 0, 0.88)' }}>
                <Sidebar />

                <div className="admin-main">
                    <Header isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />

                    <main className="admin-content">
                        <Outlet />
                    </main>

                    <Footer />
                </div>
            </div>
        </ConfigProvider>
    );
}