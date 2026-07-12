import React from "react";

export default function PageLoader() {
    return (
        <div
            style={{
                height: "100vh",
                width: "100vw",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                backdropFilter: "blur(4px)",
                position: "fixed",
                top: 0,
                left: 0,
                zIndex: 99999,
            }}
        >
            <div className="erp-loader-wrapper">
                <div className="erp-loader"></div>
            </div>
            <div className="erp-loader-text">Loading...</div>
            <style>
                {`
                .erp-loader-wrapper {
                    position: relative;
                    width: 64px;
                    height: 64px;
                }

                .erp-loader {
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                    border: 4px solid #f0f0f0;
                    border-top-color: #1677ff;
                    border-right-color: #1677ff;
                    animation: spin 1s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite;
                }

                .erp-loader-text {
                    margin-top: 20px;
                    color: #1677ff;
                    font-size: 15px;
                    font-weight: 600;
                    letter-spacing: 2px;
                    text-transform: uppercase;
                    animation: pulse 2s ease-in-out infinite;
                }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                @keyframes pulse {
                    0%, 100% { opacity: 0.5; }
                    50% { opacity: 1; }
                }
                `}
            </style>
        </div>
    );
}