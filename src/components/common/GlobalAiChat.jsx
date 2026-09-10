import { CloseOutlined, RobotOutlined, SendOutlined } from "@ant-design/icons";
import { Input, Spin, Tooltip } from "antd";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { postData } from "../../services/request";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function GlobalAiChat() {
    const location = useLocation();

    // Hide global chat on specific pages where we use internal AI chat
    const hideGlobalChat = location.pathname === "/create/blog" || location.pathname.startsWith("/edit/blog/");

    const [chatOpen, setChatOpen]         = useState(false);
    const [aiPrompt, setAiPrompt]         = useState("");
    const [aiLoading, setAiLoading]       = useState(false);
    const [chatMessages, setChatMessages] = useState([
        {
            role: "assistant",
            text: "👋 Hello! I am your AI ERP Assistant. How can I help you today? You can ask me about products, orders, or any other operations.",
        },
    ]);
    const chatEndRef = useRef(null);

    useEffect(() => {
        if (chatOpen && chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [chatMessages, chatOpen]);

    if (hideGlobalChat) {
        return null;
    }

    const handleAiGenerate = async () => {
        if (!aiPrompt.trim()) return;

        const userMsg = { role: "user", text: aiPrompt };
        setChatMessages((prev) => [...prev, userMsg]);
        setAiPrompt("");
        setAiLoading(true);

        try {
            const response = await postData("/admin/ai/chat", { message: aiPrompt });

            if (response?.success !== false) {
                const responseData = response?.data || response;
                
                setChatMessages((prev) => [...prev, {
                    role: "assistant",
                    text: responseData?.message || response?.message || "Success",
                }]);
            } else if (response?.errors) {
                const allErrors = Object.values(response.errors).flat();
                setChatMessages((prev) => [...prev, {
                    role: "assistant",
                    type: "validation",
                    validationMessage: response?.message || "Validation failed.",
                    validationErrors: allErrors,
                }]);
            } else {
                setChatMessages((prev) => [...prev, {
                    role: "assistant",
                    type: "error",
                    text: response?.message || "Failed to generate AI response. Please try again.",
                }]);
            }
        } catch (error) {
            console.error("AI generate error:", error);
            const errData = error?.response?.data;
            
            if (errData && errData.errors) {
                const allErrors = Object.values(errData.errors).flat();
                setChatMessages((prev) => [...prev, {
                    role: "assistant",
                    type: "validation",
                    validationMessage: errData?.message || "Validation failed.",
                    validationErrors: allErrors,
                }]);
            } else {
                setChatMessages((prev) => [...prev, {
                    role: "assistant",
                    type: "error",
                    text: errData?.message || "Something went wrong. Please try again.",
                }]);
            }
        } finally {
            setAiLoading(false);
        }
    };

    return (
        <>
            {/* ── Floating AI Button ── */}
            <Tooltip title="Global AI Assistant" placement="left">
                <button
                    onClick={() => setChatOpen((o) => !o)}
                    style={{
                        position: "fixed",
                        bottom: 32,
                        right: 32,
                        width: 60,
                        height: 60,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)", // Professional dark blue theme
                        border: "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 6px 24px rgba(30,60,114,0.4)",
                        zIndex: 1000,
                        transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
                        transform: chatOpen ? "scale(0)" : "scale(1)",
                        opacity: chatOpen ? 0 : 1,
                        pointerEvents: chatOpen ? "none" : "auto",
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "scale(1.08)";
                        e.currentTarget.style.boxShadow = "0 8px 32px rgba(30,60,114,0.6)";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "scale(1)";
                        e.currentTarget.style.boxShadow = "0 6px 24px rgba(30,60,114,0.4)";
                    }}
                >
                    <RobotOutlined style={{ color: "#fff", fontSize: 28 }} />
                </button>
            </Tooltip>

            {/* ── AI Chatbox Panel ── */}
            <div
                style={{
                    position: "fixed",
                    bottom: 32,
                    right: 32,
                    width: 380,
                    height: "75vh",
                    maxHeight: 700,
                    background: "#fff",
                    borderRadius: 20,
                    boxShadow: "0 12px 48px rgba(0,0,0,0.15)",
                    display: "flex",
                    flexDirection: "column",
                    zIndex: 999,
                    overflow: "hidden",
                    border: "1px solid rgba(0,0,0,0.08)",
                    transition: "all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)",
                    transform: chatOpen ? "translateY(0) scale(1)" : "translateY(20px) scale(0.95)",
                    opacity: chatOpen ? 1 : 0,
                    pointerEvents: chatOpen ? "auto" : "none",
                    transformOrigin: "bottom right",
                }}
            >
                {/* Header */}
                <div
                    style={{
                        background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
                        padding: "18px 20px",
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        flexShrink: 0,
                    }}
                >
                    <div
                        style={{
                            width: 40,
                            height: 40,
                            borderRadius: "50%",
                            background: "rgba(255,255,255,0.2)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.3)",
                        }}
                    >
                        <RobotOutlined style={{ color: "#fff", fontSize: 20 }} />
                    </div>
                    <div>
                        <div style={{ color: "#fff", fontWeight: 700, fontSize: 16, lineHeight: 1.2, letterSpacing: "0.2px" }}>AI Assistant</div>
                        <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, marginTop: 2 }}>
                            {aiLoading ? "Thinking..." : "Always here to help"}
                        </div>
                    </div>
                    <button
                        onClick={() => setChatOpen(false)}
                        style={{
                            marginLeft: "auto",
                            background: "rgba(255,255,255,0.15)",
                            border: "none",
                            borderRadius: "50%",
                            width: 32,
                            height: 32,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "background 0.2s",
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.25)"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}
                    >
                        <CloseOutlined style={{ color: "#fff", fontSize: 14 }} />
                    </button>
                </div>

                {/* Messages */}
                <div
                    style={{
                        flex: 1,
                        overflowY: "auto",
                        padding: "20px 16px",
                        display: "flex",
                        flexDirection: "column",
                        gap: 16,
                        background: "#f4f6f9", // Slight grayish-blue tint
                    }}
                >
                    {chatMessages.map((msg, idx) => {
                        // ── User bubble ──
                        if (msg.role === "user") {
                            return (
                                <div key={idx} style={{ display: "flex", flexDirection: "row-reverse", gap: 8, alignItems: "flex-end" }}>
                                    <div style={{
                                        maxWidth: "80%",
                                        background: "linear-gradient(135deg, #2a5298, #1e3c72)",
                                        color: "#fff",
                                        padding: "12px 16px",
                                        borderRadius: "20px 20px 4px 20px",
                                        fontSize: 14, lineHeight: 1.5,
                                        boxShadow: "0 2px 8px rgba(30,60,114,0.15)",
                                        whiteSpace: "pre-wrap", wordBreak: "break-word",
                                    }}>
                                        {msg.text}
                                    </div>
                                </div>
                            );
                        }

                        // ── Validation error card ──
                        if (msg.type === "validation") {
                            return (
                                <div key={idx} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                                    <div style={{
                                        width: 30, height: 30, borderRadius: "50%",
                                        background: "linear-gradient(135deg, #1e3c72, #2a5298)",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        flexShrink: 0, color: "#fff",
                                    }}><RobotOutlined style={{ fontSize: 14 }} /></div>
                                    <div style={{
                                        background: "#fff7e6",
                                        border: "1px solid #ffd591",
                                        borderRadius: "16px 16px 16px 4px",
                                        overflow: "hidden",
                                        maxWidth: "85%",
                                        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                                    }}>
                                        <div style={{
                                            background: "linear-gradient(135deg, #fa8c16, #fa541c)",
                                            padding: "10px 14px",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 8,
                                        }}>
                                            <span style={{ fontSize: 16 }}>⚠️</span>
                                            <span style={{ color: "#fff", fontWeight: 600, fontSize: 13 }}>
                                                {msg.validationMessage}
                                            </span>
                                        </div>
                                        <div style={{ padding: "12px 14px" }}>
                                            {msg.validationErrors.map((err, i) => (
                                                <div key={i} style={{
                                                    display: "flex",
                                                    alignItems: "flex-start",
                                                    gap: 8,
                                                    marginBottom: i < msg.validationErrors.length - 1 ? 8 : 0,
                                                }}>
                                                    <span style={{
                                                        width: 20, height: 20,
                                                        borderRadius: "50%",
                                                        background: "#fa8c16",
                                                        color: "#fff",
                                                        fontSize: 11,
                                                        fontWeight: 700,
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        flexShrink: 0,
                                                    }}>{i + 1}</span>
                                                    <span style={{ fontSize: 13, color: "#873800", lineHeight: 1.5 }}>{err}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            );
                        }

                        // ── Error card ──
                        if (msg.type === "error") {
                            return (
                                <div key={idx} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                                    <div style={{
                                        width: 30, height: 30, borderRadius: "50%",
                                        background: "linear-gradient(135deg, #1e3c72, #2a5298)",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        flexShrink: 0, color: "#fff",
                                    }}><RobotOutlined style={{ fontSize: 14 }} /></div>
                                    <div style={{
                                        background: "#fff2f0",
                                        border: "1px solid #ffccc7",
                                        borderRadius: "16px 16px 16px 4px",
                                        padding: "14px 16px",
                                        maxWidth: "85%",
                                        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                                    }}>
                                        <div style={{ fontSize: 18, marginBottom: 4 }}>❌</div>
                                        <div style={{ fontSize: 14, color: "#cf1322", fontWeight: 500, lineHeight: 1.5 }}>{msg.text}</div>
                                    </div>
                                </div>
                            );
                        }

                        // ── AI Response (with full markdown parsing) ──
                        return (
                            <div key={idx} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                                <div style={{
                                    width: 30, height: 30, borderRadius: "50%",
                                    background: "linear-gradient(135deg, #1e3c72, #2a5298)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    flexShrink: 0, color: "#fff",
                                }}><RobotOutlined style={{ fontSize: 14 }} /></div>
                                <div style={{
                                    maxWidth: "85%",
                                    background: "#fff",
                                    color: "#2c3e50",
                                    padding: "14px 18px",
                                    borderRadius: "16px 16px 16px 4px",
                                    fontSize: 14, lineHeight: 1.6,
                                    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                                    border: "1px solid rgba(0,0,0,0.03)",
                                    overflowX: "auto", // Allow tables to scroll horizontally if needed
                                }}>
                                    <ReactMarkdown 
                                        remarkPlugins={[remarkGfm]}
                                        components={{
                                            table: ({node, ...props}) => <table style={{borderCollapse: "collapse", width: "100%", margin: "10px 0"}} {...props} />,
                                            th: ({node, ...props}) => <th style={{border: "1px solid #e8e8e8", padding: "8px 12px", background: "#f8f9fa", textAlign: "left", fontWeight: 600, whiteSpace: "nowrap"}} {...props} />,
                                            td: ({node, ...props}) => <td style={{border: "1px solid #e8e8e8", padding: "8px 12px"}} {...props} />,
                                            p: ({node, ...props}) => <p style={{margin: "0 0 10px 0"}} {...props} />,
                                            a: ({node, ...props}) => <a style={{color: "#1677ff", textDecoration: "none"}} {...props} />,
                                            ul: ({node, ...props}) => <ul style={{paddingLeft: "20px", margin: "0 0 10px 0"}} {...props} />,
                                            ol: ({node, ...props}) => <ol style={{paddingLeft: "20px", margin: "0 0 10px 0"}} {...props} />,
                                            strong: ({node, ...props}) => <strong style={{fontWeight: 600, color: "#1a1a1a"}} {...props} />
                                        }}
                                    >
                                        {msg.text}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        );
                    })}

                    {/* Typing indicator */}
                    {aiLoading && (
                        <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                            <div style={{
                                width: 30, height: 30, borderRadius: "50%",
                                background: "linear-gradient(135deg, #1e3c72, #2a5298)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                flexShrink: 0, color: "#fff",
                            }}>
                                <RobotOutlined style={{ fontSize: 14 }} />
                            </div>
                            <div style={{
                                background: "#fff",
                                padding: "12px 18px",
                                borderRadius: "16px 16px 16px 4px",
                                boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                                border: "1px solid rgba(0,0,0,0.03)",
                                display: "flex", alignItems: "center"
                            }}>
                                <Spin size="small" />
                                <span style={{ marginLeft: 10, fontSize: 13, color: "#888", fontWeight: 500 }}>Generating...</span>
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>

                {/* Input Area */}
                <div
                    style={{
                        padding: "16px",
                        background: "#fff",
                        borderTop: "1px solid rgba(0,0,0,0.06)",
                        flexShrink: 0,
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            alignItems: "flex-end",
                            gap: 10,
                            background: "#f4f6f9",
                            borderRadius: 16,
                            padding: "8px 8px 8px 16px",
                            border: "1px solid transparent",
                            transition: "border 0.2s",
                        }}
                        onFocus={(e) => e.currentTarget.style.border = "1px solid #1e3c72"}
                        onBlur={(e) => e.currentTarget.style.border = "1px solid transparent"}
                    >
                        <Input.TextArea
                            value={aiPrompt}
                            onChange={(e) => setAiPrompt(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey && !aiLoading) {
                                    e.preventDefault();
                                    handleAiGenerate();
                                }
                            }}
                            placeholder="Type a message..."
                            autoSize={{ minRows: 1, maxRows: 5 }}
                            disabled={aiLoading}
                            style={{
                                flex: 1,
                                background: "transparent",
                                border: "none",
                                resize: "none",
                                boxShadow: "none",
                                padding: "4px 0",
                                fontSize: 14,
                                lineHeight: 1.5,
                            }}
                        />
                        <button
                            onClick={handleAiGenerate}
                            disabled={aiLoading || !aiPrompt.trim()}
                            style={{
                                width: 36,
                                height: 36,
                                borderRadius: 12,
                                background: aiLoading || !aiPrompt.trim()
                                    ? "#d1d5db"
                                    : "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
                                border: "none",
                                cursor: aiLoading || !aiPrompt.trim() ? "not-allowed" : "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                                transition: "all 0.2s",
                                boxShadow: aiLoading || !aiPrompt.trim() ? "none" : "0 4px 12px rgba(30,60,114,0.3)",
                            }}
                        >
                            <SendOutlined style={{ color: "#fff", fontSize: 16 }} />
                        </button>
                    </div>
                    <div style={{ textAlign: "center", marginTop: 8, fontSize: 11, color: "#a0aec0", fontWeight: 500 }}>
                        Press <span style={{color: "#718096"}}>Enter</span> to send · <span style={{color: "#718096"}}>Shift+Enter</span> for new line
                    </div>
                </div>
            </div>
        </>
    );
}
