import { CloseOutlined, DeleteOutlined, MessageOutlined, PlusOutlined, RobotOutlined, SendOutlined } from "@ant-design/icons";
import { Input, Spin, Tooltip } from "antd";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { postData } from "../../services/request";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function GlobalAiChat() {
    const location = useLocation();

    const hideGlobalChat = 
        location.pathname === "/create/blog" || 
        location.pathname.startsWith("/edit/blog/") ||
        location.pathname === "/products/create" ||
        location.pathname.startsWith("/edit/product/");

    const [sessions, setSessions] = useState(() => {
        try {
            const saved = localStorage.getItem("ai_chat_sessions");
            if (saved) return JSON.parse(saved);
        } catch (e) {
            console.error(e);
        }
        return [];
    });
    const [activeSessionId, setActiveSessionId] = useState(() => {
        try {
            const saved = localStorage.getItem("ai_chat_sessions");
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed.length > 0) return parsed[0].id;
            }
        } catch (e) {
            console.error(e);
        }
        return null;
    });

    useEffect(() => {
        localStorage.setItem("ai_chat_sessions", JSON.stringify(sessions));
    }, [sessions]);

    const [chatOpen, setChatOpen]         = useState(false);
    const [aiPrompt, setAiPrompt]         = useState("");
    const [aiLoading, setAiLoading]       = useState(false);

    const initialGreeting = {
        role: "assistant",
        text: "👋 Hello! I am your AI ERP Assistant. How can I help you today? You can ask me about products, orders, or any other operations.",
    };

    const activeSession = sessions.find((s) => s.id === activeSessionId);
    const chatMessages = activeSession ? activeSession.messages : [initialGreeting];

    const chatEndRef = useRef(null);

    useEffect(() => {
        if (chatOpen && chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [chatMessages, chatOpen]);

    if (hideGlobalChat) {
        return null;
    }

    const createNewSession = () => {
        const newSession = {
            id: Date.now().toString(),
            title: "New Conversation",
            messages: [initialGreeting]
        };
        setSessions([newSession, ...sessions]);
        setActiveSessionId(newSession.id);
    };

    const deleteSession = (e, id) => {
        e.stopPropagation();
        const updated = sessions.filter(s => s.id !== id);
        setSessions(updated);
        if (activeSessionId === id) {
            setActiveSessionId(updated.length > 0 ? updated[0].id : null);
        }
    };

    const handleAiGenerate = async () => {
        if (!aiPrompt.trim()) return;

        let currentActiveId = activeSessionId;
        const currentPrompt = aiPrompt;
        setAiPrompt("");
        setAiLoading(true);

        const userMsg = { role: "user", text: currentPrompt };

        setSessions(prev => {
            let sessionList = [...prev];
            if (!currentActiveId || !sessionList.find(s => s.id === currentActiveId)) {
                currentActiveId = Date.now().toString();
                const newSession = {
                    id: currentActiveId,
                    title: currentPrompt.slice(0, 25) + (currentPrompt.length > 25 ? "..." : ""),
                    messages: [initialGreeting, userMsg]
                };
                sessionList = [newSession, ...sessionList];
                setActiveSessionId(currentActiveId);
            } else {
                sessionList = sessionList.map(s => {
                    if (s.id === currentActiveId) {
                        return { 
                            ...s, 
                            title: s.title === "New Conversation" ? currentPrompt.slice(0, 25) + (currentPrompt.length > 25 ? "..." : "") : s.title,
                            messages: [...s.messages, userMsg] 
                        };
                    }
                    return s;
                });
            }
            return sessionList;
        });

        try {
            const response = await postData("/admin/ai/chat", { message: currentPrompt });
            let responseMessageObj = {};

            if (response?.success !== false) {
                const responseData = response?.data || response;
                responseMessageObj = {
                    role: "assistant",
                    text: responseData?.message || response?.message || "Success",
                };
            } else if (response?.errors) {
                const allErrors = Object.values(response.errors).flat();
                responseMessageObj = {
                    role: "assistant",
                    type: "validation",
                    validationMessage: response?.message || "Validation failed.",
                    validationErrors: allErrors,
                };
            } else {
                responseMessageObj = {
                    role: "assistant",
                    type: "error",
                    text: response?.message || "Failed to generate AI response. Please try again.",
                };
            }

            setSessions(prev => prev.map(s => {
                if (s.id === currentActiveId) {
                    return { ...s, messages: [...s.messages, responseMessageObj] };
                }
                return s;
            }));

        } catch (error) {
            console.error("AI generate error:", error);
            const errData = error?.response?.data;
            let responseMessageObj = {};
            
            if (errData && errData.errors) {
                const allErrors = Object.values(errData.errors).flat();
                responseMessageObj = {
                    role: "assistant",
                    type: "validation",
                    validationMessage: errData?.message || "Validation failed.",
                    validationErrors: allErrors,
                };
            } else {
                responseMessageObj = {
                    role: "assistant",
                    type: "error",
                    text: errData?.message || "Something went wrong. Please try again.",
                };
            }

            setSessions(prev => prev.map(s => {
                if (s.id === currentActiveId) {
                    return { ...s, messages: [...s.messages, responseMessageObj] };
                }
                return s;
            }));
        } finally {
            setAiLoading(false);
        }
    };

    return (
        <>
            <Tooltip title="Global AI Assistant" placement="left">
                <button
                    onClick={() => setChatOpen(true)}
                    style={{
                        position: "fixed",
                        bottom: 32,
                        right: 32,
                        width: 64,
                        height: 64,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #0f172a 0%, #334155 100%)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        cursor: "pointer",
                        display: chatOpen ? "none" : "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 12px 30px rgba(0,0,0,0.2)",
                        zIndex: 1000,
                        transition: "transform 0.2s, box-shadow 0.2s",
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "scale(1.05) translateY(-4px)";
                        e.currentTarget.style.boxShadow = "0 16px 40px rgba(0,0,0,0.25)";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "scale(1)";
                        e.currentTarget.style.boxShadow = "0 12px 30px rgba(0,0,0,0.2)";
                    }}
                >
                    <RobotOutlined style={{ color: "#fff", fontSize: 28 }} />
                </button>
            </Tooltip>

            {chatOpen && (
                <div className="global-ai-panel">
                    <style>{`
                        @keyframes chatFadeIn {
                            from { opacity: 0; transform: translateY(20px) scale(0.98); }
                            to { opacity: 1; transform: translateY(0) scale(1); }
                        }
                        
                        .global-ai-panel {
                            position: fixed;
                            bottom: 24px;
                            right: 24px;
                            width: calc(100vw - 48px);
                            max-width: 950px;
                            height: 85vh;
                            max-height: 800px;
                            background: #fff;
                            border-radius: 20px;
                            box-shadow: 0 24px 60px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05);
                            display: flex;
                            flex-direction: row;
                            z-index: 9999;
                            overflow: hidden;
                            animation: chatFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                        }

                        .ai-sidebar {
                            width: 280px;
                            background: #0f172a;
                            display: flex;
                            flex-direction: column;
                            border-right: 1px solid #1e293b;
                            flex-shrink: 0;
                        }

                        .ai-chat-area {
                            flex: 1;
                            display: flex;
                            flex-direction: column;
                            background: #fff;
                            min-width: 0; /* CRITICAL: prevents chat area from blowing out panel width */
                        }

                        /* Responsive */
                        @media (max-width: 768px) {
                            .global-ai-panel {
                                flex-direction: column;
                                bottom: 12px;
                                right: 12px;
                                width: calc(100vw - 24px);
                                height: calc(100vh - 24px);
                                max-height: none;
                            }
                            .ai-sidebar {
                                width: 100%;
                                height: 200px;
                                flex-shrink: 0;
                                border-right: none;
                                border-bottom: 1px solid #1e293b;
                            }
                            .ai-chat-area {
                                height: calc(100% - 200px);
                            }
                        }

                        .ai-sidebar-item {
                            padding: 12px 14px;
                            border-radius: 12px;
                            margin-bottom: 6px;
                            cursor: pointer;
                            display: flex;
                            align-items: center;
                            gap: 12px;
                            transition: all 0.2s;
                            color: #94a3b8;
                            min-width: 0; /* CRITICAL for flex children text truncation */
                        }
                        .ai-sidebar-item:hover {
                            background: rgba(255,255,255,0.05);
                            color: #f8fafc;
                        }
                        .ai-sidebar-item.active {
                            background: #1e293b;
                            color: #fff;
                        }
                        
                        /* Custom Scrollbars */
                        .ai-scrollbar::-webkit-scrollbar {
                            width: 6px;
                            height: 6px;
                        }
                        .ai-scrollbar::-webkit-scrollbar-track {
                            background: transparent;
                        }
                        .ai-scrollbar::-webkit-scrollbar-thumb {
                            background: rgba(0,0,0,0.1);
                            border-radius: 10px;
                        }
                        .ai-sidebar-scrollbar::-webkit-scrollbar-thumb {
                            background: rgba(255,255,255,0.1);
                        }
                    `}</style>

                    <div className="ai-sidebar">
                        <div style={{ padding: "20px 20px 10px", flexShrink: 0 }}>
                            <button
                                onClick={createNewSession}
                                style={{
                                    width: "100%",
                                    background: "#1e293b",
                                    border: "1px solid rgba(255,255,255,0.1)",
                                    borderRadius: 12,
                                    padding: "12px",
                                    color: "#fff",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: 8,
                                    cursor: "pointer",
                                    fontSize: 14,
                                    fontWeight: 500,
                                    transition: "background 0.2s",
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = "#334155"}
                                onMouseLeave={(e) => e.currentTarget.style.background = "#1e293b"}
                            >
                                <PlusOutlined /> New Chat
                            </button>
                        </div>

                        <div className="ai-scrollbar ai-sidebar-scrollbar" style={{
                            flex: 1,
                            overflowY: "auto",
                            padding: "10px 14px",
                        }}>
                            <div style={{ fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 12, paddingLeft: 8, textTransform: "uppercase", letterSpacing: 1 }}>
                                Chat History
                            </div>
                            
                            {sessions.length === 0 ? (
                                <div style={{ color: "#64748b", fontSize: 13, padding: "0 8px", textAlign: "center", marginTop: 20 }}>
                                    No history yet
                                </div>
                            ) : (
                                sessions.map(session => (
                                    <div 
                                        key={session.id}
                                        className={`ai-sidebar-item ${activeSessionId === session.id ? 'active' : ''}`}
                                        onClick={() => setActiveSessionId(session.id)}
                                    >
                                        <MessageOutlined style={{ fontSize: 14, flexShrink: 0 }} />
                                        <div style={{ 
                                            flex: 1, 
                                            whiteSpace: "nowrap", 
                                            overflow: "hidden", 
                                            textOverflow: "ellipsis", 
                                            fontSize: 13, 
                                            fontWeight: 500,
                                            minWidth: 0 // CRITICAL
                                        }}>
                                            {session.title}
                                        </div>
                                        <button
                                            onClick={(e) => deleteSession(e, session.id)}
                                            style={{
                                                background: "none", border: "none", color: "inherit", cursor: "pointer", padding: 4, 
                                                opacity: activeSessionId === session.id ? 1 : 0.4, flexShrink: 0
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.color = "#ef4444"}
                                            onMouseLeave={(e) => e.currentTarget.style.color = "inherit"}
                                        >
                                            <DeleteOutlined />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                        <div style={{
                            padding: "20px",
                            borderTop: "1px solid #1e293b",
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            flexShrink: 0
                        }}>
                            <div style={{
                                width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                                display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0
                            }}>
                                <RobotOutlined style={{ fontSize: 18 }} />
                            </div>
                            <div style={{ minWidth: 0, overflow: "hidden" }}>
                                <div style={{ color: "#f8fafc", fontSize: 14, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>ERP AI</div>
                                <div style={{ color: "#64748b", fontSize: 12 }}>v2.0 Premium</div>
                            </div>
                        </div>
                    </div>

                    <div className="ai-chat-area">
                        <div style={{
                            padding: "16px 24px",
                            borderBottom: "1px solid #f1f5f9",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            flexShrink: 0
                        }}>
                            <div style={{ fontWeight: 600, fontSize: 16, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginRight: 16 }}>
                                {activeSession ? activeSession.title : "AI Assistant"}
                            </div>
                            <button
                                onClick={() => setChatOpen(false)}
                                style={{
                                    background: "#f1f5f9",
                                    border: "none",
                                    borderRadius: 10,
                                    width: 32,
                                    height: 32,
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "#64748b",
                                    transition: "all 0.2s",
                                    flexShrink: 0
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = "#e2e8f0"; e.currentTarget.style.color = "#0f172a"; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = "#f1f5f9"; e.currentTarget.style.color = "#64748b"; }}
                            >
                                <CloseOutlined style={{ fontSize: 14 }} />
                            </button>
                        </div>

                        <div className="ai-scrollbar" style={{
                            flex: 1,
                            overflowY: "auto",
                            overflowX: "hidden",
                            padding: "24px 8%",
                            display: "flex",
                            flexDirection: "column",
                            gap: 24,
                            background: "#f8fafc",
                        }}>
                            {chatMessages.map((msg, idx) => {
                                // ── User bubble ──
                                if (msg.role === "user") {
                                    return (
                                        <div key={idx} style={{ display: "flex", flexDirection: "row-reverse", gap: 16, alignItems: "flex-start" }}>
                                            <div style={{
                                                width: 36, height: 36, borderRadius: "50%",
                                                background: "#cbd5e1", display: "flex", alignItems: "center", justifyContent: "center",
                                                flexShrink: 0, fontSize: 14, color: "#475569", fontWeight: 700,
                                            }}>U</div>
                                            <div style={{
                                                maxWidth: "85%",
                                                background: "#0f172a",
                                                color: "#f8fafc",
                                                padding: "14px 20px",
                                                borderRadius: "20px 20px 4px 20px",
                                                fontSize: 15, lineHeight: 1.6,
                                                boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
                                                whiteSpace: "pre-wrap", wordBreak: "break-word",
                                            }}>
                                                {msg.text}
                                            </div>
                                        </div>
                                    );
                                }

                                // ── AI Validation error ──
                                if (msg.type === "validation") {
                                    return (
                                        <div key={idx} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                                            <div style={{
                                                width: 36, height: 36, borderRadius: "50%",
                                                background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                                flexShrink: 0, color: "#fff",
                                            }}><RobotOutlined style={{ fontSize: 16 }} /></div>
                                            <div style={{
                                                background: "#fff7e6",
                                                border: "1px solid #ffd591",
                                                borderRadius: "20px 20px 20px 4px",
                                                overflow: "hidden",
                                                maxWidth: "100%",
                                                minWidth: 0,
                                            }}>
                                                <div style={{ background: "linear-gradient(135deg, #fa8c16, #fa541c)", padding: "12px 18px", display: "flex", alignItems: "center", gap: 10 }}>
                                                    <span style={{ fontSize: 16 }}>⚠️</span>
                                                    <span style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>{msg.validationMessage}</span>
                                                </div>
                                                <div style={{ padding: "14px 18px" }}>
                                                    {msg.validationErrors.map((err, i) => (
                                                        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: i < msg.validationErrors.length - 1 ? 8 : 0 }}>
                                                            <span style={{ width: 20, height: 20, borderRadius: "50%", background: "#fa8c16", color: "#fff", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>{i + 1}</span>
                                                            <span style={{ fontSize: 14, color: "#873800", lineHeight: 1.6 }}>{err}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }

                                // ── AI Error ──
                                if (msg.type === "error") {
                                    return (
                                        <div key={idx} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                                            <div style={{
                                                width: 36, height: 36, borderRadius: "50%",
                                                background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "#fff",
                                            }}><RobotOutlined style={{ fontSize: 16 }} /></div>
                                            <div style={{
                                                background: "#fff2f0", border: "1px solid #ffccc7", borderRadius: "20px 20px 20px 4px", padding: "16px 20px", maxWidth: "100%", minWidth: 0
                                            }}>
                                                <div style={{ fontSize: 20, marginBottom: 8 }}>❌</div>
                                                <div style={{ fontSize: 15, color: "#cf1322", fontWeight: 500, lineHeight: 1.5 }}>{msg.text}</div>
                                            </div>
                                        </div>
                                    );
                                }

                                // ── AI Markdown Response ──
                                return (
                                    <div key={idx} style={{ display: "flex", gap: 16, alignItems: "flex-start", minWidth: 0 }}>
                                        <div style={{
                                            width: 36, height: 36, borderRadius: "50%",
                                            background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            flexShrink: 0, color: "#fff", boxShadow: "0 4px 10px rgba(59, 130, 246, 0.3)"
                                        }}><RobotOutlined style={{ fontSize: 18 }} /></div>
                                        <div className="ai-scrollbar" style={{
                                            maxWidth: "100%",
                                            minWidth: 0,
                                            background: "#fff",
                                            color: "#1e293b",
                                            padding: "16px 24px",
                                            borderRadius: "20px 20px 20px 4px",
                                            fontSize: 15, lineHeight: 1.7,
                                            boxShadow: "0 4px 15px rgba(0,0,0,0.03)",
                                            border: "1px solid #e2e8f0",
                                            overflowX: "auto", /* Handles wide tables gracefully */
                                        }}>
                                            <ReactMarkdown 
                                                remarkPlugins={[remarkGfm]}
                                                components={{
                                                    table: ({node, ...props}) => <table style={{borderCollapse: "collapse", width: "100%", margin: "16px 0", borderRadius: 8, overflow: "hidden", minWidth: 400}} {...props} />,
                                                    th: ({node, ...props}) => <th style={{border: "1px solid #e2e8f0", padding: "10px 14px", background: "#f8fafc", textAlign: "left", fontWeight: 600, color: "#334155", whiteSpace: "nowrap"}} {...props} />,
                                                    td: ({node, ...props}) => <td style={{border: "1px solid #e2e8f0", padding: "10px 14px", color: "#475569"}} {...props} />,
                                                    p: ({node, ...props}) => <p style={{margin: "0 0 12px 0", wordBreak: "break-word"}} {...props} />,
                                                    a: ({node, ...props}) => <a style={{color: "#3b82f6", textDecoration: "none", fontWeight: 500, wordBreak: "break-all"}} {...props} />,
                                                    ul: ({node, ...props}) => <ul style={{paddingLeft: "24px", margin: "0 0 12px 0"}} {...props} />,
                                                    ol: ({node, ...props}) => <ol style={{paddingLeft: "24px", margin: "0 0 12px 0"}} {...props} />,
                                                    strong: ({node, ...props}) => <strong style={{fontWeight: 700, color: "#0f172a"}} {...props} />,
                                                    code: ({node, inline, ...props}) => inline ? <code style={{background: "#f1f5f9", padding: "2px 6px", borderRadius: 4, fontSize: 13, color: "#ec4899", wordBreak: "break-word"}} {...props} /> : <code {...props} />,
                                                    pre: ({node, ...props}) => <pre className="ai-scrollbar" style={{background: "#0f172a", color: "#f8fafc", padding: 16, borderRadius: 12, overflowX: "auto", margin: "12px 0"}} {...props} />
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
                                <div style={{ display: "flex", gap: 16, alignItems: "flex-end", minWidth: 0 }}>
                                    <div style={{
                                        width: 36, height: 36, borderRadius: "50%",
                                        background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "#fff",
                                    }}>
                                        <RobotOutlined style={{ fontSize: 18 }} />
                                    </div>
                                    <div style={{
                                        background: "#fff", padding: "14px 20px", borderRadius: "20px 20px 20px 4px",
                                        boxShadow: "0 4px 15px rgba(0,0,0,0.03)", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: 12, minWidth: 0
                                    }}>
                                        <Spin size="small" />
                                        <span style={{ fontSize: 14, color: "#94a3b8", fontWeight: 500 }}>Thinking...</span>
                                    </div>
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Input Area */}
                        <div style={{
                            padding: "20px 8%",
                            background: "linear-gradient(to top, #fff 80%, rgba(255,255,255,0))",
                            position: "relative",
                            zIndex: 10,
                            flexShrink: 0
                        }}>
                            <div style={{
                                display: "flex",
                                alignItems: "flex-end",
                                gap: 12,
                                background: "#fff",
                                borderRadius: 24,
                                padding: "12px 12px 12px 20px",
                                border: "1px solid #e2e8f0",
                                boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
                                transition: "border-color 0.2s, box-shadow 0.2s"
                            }}>
                                <Input.TextArea
                                    value={aiPrompt}
                                    onChange={(e) => setAiPrompt(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && !e.shiftKey && !aiLoading) {
                                            e.preventDefault();
                                            handleAiGenerate();
                                        }
                                    }}
                                    placeholder="Message ERP AI..."
                                    autoSize={{ minRows: 1, maxRows: 5 }}
                                    disabled={aiLoading}
                                    style={{
                                        flex: 1, background: "transparent", border: "none", resize: "none", boxShadow: "none", padding: 0,
                                        fontSize: 15, lineHeight: 1.5, color: "#0f172a", minWidth: 0
                                    }}
                                />
                                <button
                                    onClick={handleAiGenerate}
                                    disabled={aiLoading || !aiPrompt.trim()}
                                    style={{
                                        width: 40, height: 40, borderRadius: 16,
                                        background: aiLoading || !aiPrompt.trim() ? "#f1f5f9" : "#0f172a",
                                        color: aiLoading || !aiPrompt.trim() ? "#94a3b8" : "#fff",
                                        border: "none", cursor: aiLoading || !aiPrompt.trim() ? "not-allowed" : "pointer",
                                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.2s",
                                    }}
                                >
                                    <SendOutlined style={{ fontSize: 16 }} />
                                </button>
                            </div>
                            <div style={{ textAlign: "center", marginTop: 10, fontSize: 12, color: "#94a3b8", fontWeight: 500 }}>
                                AI Assistant can make mistakes. Consider verifying important data.
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
