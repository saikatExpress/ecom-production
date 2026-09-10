import { CloseOutlined, CopyOutlined, RobotOutlined, SendOutlined } from "@ant-design/icons";
import { Input, Spin, Tooltip, message } from "antd";
import { useEffect, useRef, useState } from "react";
import { postData } from "../../services/request";

export default function BlogAiChat({ form }) {
    const [chatOpen, setChatOpen]         = useState(false);
    const [aiPrompt, setAiPrompt]         = useState("");
    const [aiLoading, setAiLoading]       = useState(false);
    const [chatMessages, setChatMessages] = useState([
        {
            role: "assistant",
            text: "👋 Hi! I'm your AI Blog Assistant. Tell me what you'd like to write about and I'll generate a complete blog post for you!",
        },
    ]);
    const chatEndRef = useRef(null);

    useEffect(() => {
        if (chatOpen && chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [chatMessages, chatOpen]);

    const handleAiGenerate = async () => {
        if (!aiPrompt.trim()) return;

        const userMsg = { role: "user", text: aiPrompt };
        setChatMessages((prev) => [...prev, userMsg]);
        setAiPrompt("");
        setAiLoading(true);

        try {
            const response = await postData("/admin/blogs/ai-generate", { prompt: aiPrompt });

            if (response?.success !== false) {
                const responseData = response?.data || response;
                
                if (responseData?.is_valid_request === false) {
                    setChatMessages((prev) => [...prev, {
                        role: "assistant",
                        type: "invalid",
                        invalidMessage: responseData?.message || "Please provide a valid blog topic.",
                    }]);
                } else {
                    // Extract the actual blog fields which are now nested inside `data.data`
                    const contentData = responseData?.data || responseData;
                    
                    setChatMessages((prev) => [...prev, {
                        role: "assistant",
                        type: "result",
                        rawData: contentData,
                    }]);
                }
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
                    text: response?.message || "Failed to generate content. Please try again.",
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

    const handleUseAllContent = (data) => {
        if (!data) return;
        if (data.title)            form.setFieldValue("title", data.title);
        if (data.excerpt)          form.setFieldValue("excerpt", data.excerpt);
        if (data.content)          form.setFieldValue("content", data.content);
        if (data.meta_title)       form.setFieldValue("meta_title", data.meta_title);
        if (data.meta_description) form.setFieldValue("meta_description", data.meta_description);
        if (data.meta_keywords) {
            const kw = Array.isArray(data.meta_keywords)
                ? data.meta_keywords
                : data.meta_keywords.split(",").map((k) => k.trim());
            form.setFieldValue("meta_keywords", kw);
        }
        message.success("AI content applied to the form! 🎉");
        setChatOpen(false);
    };

    const handleUseField = (field, value) => {
        if (field === "meta_keywords") {
            const kw = Array.isArray(value) ? value : value.split(",").map((k) => k.trim());
            form.setFieldValue("meta_keywords", kw);
        } else {
            form.setFieldValue(field, value);
        }
        message.success(`"${field.replace(/_/g, " ")}" applied to form!`);
    };

    const handleCopyField = (text) => {
        const plain = text.replace(/<[^>]+>/g, "").trim();
        navigator.clipboard.writeText(plain);
        message.success("Copied!");
    };

    return (
        <>
            {/* ── Floating AI Button ── */}
            <Tooltip title="AI Blog Assistant" placement="left">
                <button
                    onClick={() => setChatOpen((o) => !o)}
                    style={{
                        position: "fixed",
                        bottom: 32,
                        right: 32,
                        width: 56,
                        height: 56,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        border: "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 4px 20px rgba(102,126,234,0.5)",
                        zIndex: 1000,
                        transition: "transform 0.2s, box-shadow 0.2s",
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "scale(1.1)";
                        e.currentTarget.style.boxShadow = "0 6px 28px rgba(102,126,234,0.7)";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "scale(1)";
                        e.currentTarget.style.boxShadow = "0 4px 20px rgba(102,126,234,0.5)";
                    }}
                >
                    {chatOpen ? (
                        <CloseOutlined style={{ color: "#fff", fontSize: 20 }} />
                    ) : (
                        <RobotOutlined style={{ color: "#fff", fontSize: 24 }} />
                    )}
                </button>
            </Tooltip>

            {/* ── AI Chatbox Panel ── */}
            {chatOpen && (
                <div
                    style={{
                        position: "fixed",
                        bottom: 100,
                        right: 32,
                        width: 380,
                        maxHeight: "70vh",
                        background: "#fff",
                        borderRadius: 16,
                        boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
                        display: "flex",
                        flexDirection: "column",
                        zIndex: 999,
                        overflow: "hidden",
                        border: "1px solid #f0f0f0",
                    }}
                >
                    {/* Header */}
                    <div
                        style={{
                            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            padding: "14px 18px",
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            flexShrink: 0,
                        }}
                    >
                        <div
                            style={{
                                width: 36,
                                height: 36,
                                borderRadius: "50%",
                                background: "rgba(255,255,255,0.2)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <RobotOutlined style={{ color: "#fff", fontSize: 18 }} />
                        </div>
                        <div>
                            <div style={{ color: "#fff", fontWeight: 600, fontSize: 15, lineHeight: 1.2 }}>AI Blog Assistant</div>
                            <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 12 }}>
                                {aiLoading ? "Generating..." : "Ready to help"}
                            </div>
                        </div>
                        <button
                            onClick={() => setChatOpen(false)}
                            style={{
                                marginLeft: "auto",
                                background: "rgba(255,255,255,0.15)",
                                border: "none",
                                borderRadius: 8,
                                width: 28,
                                height: 28,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <CloseOutlined style={{ color: "#fff", fontSize: 12 }} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div
                        style={{
                            flex: 1,
                            overflowY: "auto",
                            padding: "16px 14px",
                            display: "flex",
                            flexDirection: "column",
                            gap: 12,
                            background: "#f8f9fc",
                        }}
                    >
                        {chatMessages.map((msg, idx) => {
                            // ── User bubble ──
                            if (msg.role === "user") {
                                return (
                                    <div key={idx} style={{ display: "flex", flexDirection: "row-reverse", gap: 8, alignItems: "flex-end" }}>
                                        <div style={{
                                            width: 28, height: 28, borderRadius: "50%",
                                            background: "linear-gradient(135deg, #43e97b, #38f9d7)",
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            flexShrink: 0, fontSize: 12, color: "#fff", fontWeight: 700,
                                        }}>U</div>
                                        <div style={{
                                            maxWidth: "75%",
                                            background: "linear-gradient(135deg, #667eea, #764ba2)",
                                            color: "#fff",
                                            padding: "10px 14px",
                                            borderRadius: "16px 16px 4px 16px",
                                            fontSize: 13, lineHeight: 1.6,
                                            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                                            whiteSpace: "pre-wrap", wordBreak: "break-word",
                                        }}>
                                            {msg.text}
                                        </div>
                                    </div>
                                );
                            }

                            // ── AI greeting / plain text (no type) ──
                            if (!msg.type) {
                                return (
                                    <div key={idx} style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                                        <div style={{
                                            width: 28, height: 28, borderRadius: "50%",
                                            background: "linear-gradient(135deg, #667eea, #764ba2)",
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            flexShrink: 0, color: "#fff",
                                        }}><RobotOutlined style={{ fontSize: 13 }} /></div>
                                        <div style={{
                                            maxWidth: "80%",
                                            background: "#fff",
                                            color: "#333",
                                            padding: "10px 14px",
                                            borderRadius: "16px 16px 16px 4px",
                                            fontSize: 13, lineHeight: 1.6,
                                            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                                        }}>
                                            {msg.text}
                                        </div>
                                    </div>
                                );
                            }

                            // ── Error card ──
                            if (msg.type === "error") {
                                return (
                                    <div key={idx} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                                        <div style={{
                                            width: 28, height: 28, borderRadius: "50%",
                                            background: "linear-gradient(135deg, #667eea, #764ba2)",
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            flexShrink: 0, color: "#fff",
                                        }}><RobotOutlined style={{ fontSize: 13 }} /></div>
                                        <div style={{
                                            background: "#fff2f0",
                                            border: "1px solid #ffccc7",
                                            borderRadius: "12px 12px 12px 4px",
                                            padding: "12px 14px",
                                            maxWidth: "82%",
                                        }}>
                                            <div style={{ fontSize: 18, marginBottom: 4 }}>❌</div>
                                            <div style={{ fontSize: 13, color: "#cf1322", fontWeight: 500 }}>{msg.text}</div>
                                        </div>
                                    </div>
                                );
                            }

                            // ── Validation error card ──
                            if (msg.type === "validation") {
                                return (
                                    <div key={idx} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                                        <div style={{
                                            width: 28, height: 28, borderRadius: "50%",
                                            background: "linear-gradient(135deg, #667eea, #764ba2)",
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            flexShrink: 0, color: "#fff",
                                        }}><RobotOutlined style={{ fontSize: 13 }} /></div>
                                        <div style={{
                                            background: "#fff7e6",
                                            border: "1px solid #ffd591",
                                            borderRadius: "12px 12px 12px 4px",
                                            overflow: "hidden",
                                            maxWidth: "85%",
                                        }}>
                                            {/* Header */}
                                            <div style={{
                                                background: "linear-gradient(135deg, #fa8c16, #fa541c)",
                                                padding: "9px 14px",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 7,
                                            }}>
                                                <span style={{ fontSize: 15 }}>⚠️</span>
                                                <span style={{ color: "#fff", fontWeight: 600, fontSize: 12 }}>
                                                    {msg.validationMessage}
                                                </span>
                                            </div>
                                            {/* Error list */}
                                            <div style={{ padding: "10px 14px" }}>
                                                {msg.validationErrors.map((err, i) => (
                                                    <div key={i} style={{
                                                        display: "flex",
                                                        alignItems: "flex-start",
                                                        gap: 7,
                                                        marginBottom: i < msg.validationErrors.length - 1 ? 6 : 0,
                                                    }}>
                                                        <span style={{
                                                            width: 18, height: 18,
                                                            borderRadius: "50%",
                                                            background: "#fa8c16",
                                                            color: "#fff",
                                                            fontSize: 10,
                                                            fontWeight: 700,
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            flexShrink: 0,
                                                            marginTop: 1,
                                                        }}>{i + 1}</span>
                                                        <span style={{ fontSize: 12, color: "#873800", lineHeight: 1.6 }}>{err}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                );
                            }

                            // ── Invalid request card ──
                            if (msg.type === "invalid") {
                                return (
                                    <div key={idx} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                                        <div style={{
                                            width: 28, height: 28, borderRadius: "50%",
                                            background: "linear-gradient(135deg, #667eea, #764ba2)",
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            flexShrink: 0, color: "#fff",
                                        }}><RobotOutlined style={{ fontSize: 13 }} /></div>
                                        <div style={{
                                            background: "#fffbe6",
                                            border: "1px solid #ffe58f",
                                            borderRadius: "12px 12px 12px 4px",
                                            padding: "14px 16px",
                                            maxWidth: "82%",
                                        }}>
                                            <div style={{ fontSize: 20, marginBottom: 6 }}>⚠️</div>
                                            <div style={{ fontSize: 13, fontWeight: 600, color: "#874d00", marginBottom: 4 }}>
                                                Invalid Request
                                            </div>
                                            <div style={{ fontSize: 12, color: "#ad6800", lineHeight: 1.6 }}>
                                                {msg.invalidMessage}
                                            </div>
                                            <div style={{ marginTop: 10, fontSize: 12, color: "#999" }}>
                                                💡 Try: <em>"Write a blog about Laravel framework"</em>
                                            </div>
                                        </div>
                                    </div>
                                );
                            }

                            // ── Result card (rich structured) ──
                            if (msg.type === "result") {
                                const d = msg.rawData;
                                const fields = [
                                    { key: "title",            label: "📌 Title",            value: d?.title,            field: "title" },
                                    { key: "excerpt",          label: "📝 Excerpt",           value: d?.excerpt,          field: "excerpt",          isHtml: true },
                                    { key: "content",          label: "📄 Content",           value: d?.content,          field: "content",          isHtml: true, preview: true },
                                    { key: "meta_title",       label: "🔍 Meta Title",        value: d?.meta_title,       field: "meta_title" },
                                    { key: "meta_keywords",    label: "🏷️ Meta Keywords",     value: d?.meta_keywords,    field: "meta_keywords" },
                                    { key: "meta_description", label: "📋 Meta Description",  value: d?.meta_description, field: "meta_description" },
                                ].filter((f) => f.value);

                                return (
                                    <div key={idx} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                                        <div style={{
                                            width: 28, height: 28, borderRadius: "50%",
                                            background: "linear-gradient(135deg, #667eea, #764ba2)",
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            flexShrink: 0, color: "#fff",
                                        }}><RobotOutlined style={{ fontSize: 13 }} /></div>

                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            {/* Success header */}
                                            <div style={{
                                                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                                borderRadius: "12px 12px 0 0",
                                                padding: "10px 14px",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 8,
                                            }}>
                                                <span style={{ fontSize: 16 }}>✅</span>
                                                <span style={{ color: "#fff", fontWeight: 600, fontSize: 13 }}>Blog Generated Successfully!</span>
                                            </div>

                                            {/* Fields */}
                                            <div style={{
                                                background: "#fff",
                                                border: "1px solid #e8e8f0",
                                                borderTop: "none",
                                                borderRadius: "0 0 12px 12px",
                                                overflow: "hidden",
                                            }}>
                                                {fields.map((f, fi) => {
                                                    const displayText = f.isHtml
                                                        ? f.value.replace(/<[^>]+>/g, "").trim()
                                                        : f.value;
                                                    const truncated = f.preview && displayText.length > 100
                                                        ? displayText.slice(0, 100) + "…"
                                                        : displayText;

                                                    return (
                                                        <div key={f.key} style={{
                                                            borderBottom: fi < fields.length - 1 ? "1px solid #f0f0f0" : "none",
                                                            padding: "10px 12px",
                                                        }}>
                                                            {/* Label row */}
                                                            <div style={{
                                                                display: "flex",
                                                                justifyContent: "space-between",
                                                                alignItems: "center",
                                                                marginBottom: 4,
                                                            }}>
                                                                <span style={{
                                                                    fontSize: 11,
                                                                    fontWeight: 600,
                                                                    color: "#764ba2",
                                                                    textTransform: "uppercase",
                                                                    letterSpacing: 0.5,
                                                                }}>
                                                                    {f.label}
                                                                </span>
                                                                {/* Per-field actions */}
                                                                <div style={{ display: "flex", gap: 4 }}>
                                                                    <Tooltip title="Copy">
                                                                        <button
                                                                            onClick={() => handleCopyField(f.value)}
                                                                            style={{
                                                                                background: "#f5f5f5",
                                                                                border: "1px solid #e8e8e8",
                                                                                borderRadius: 6,
                                                                                padding: "2px 7px",
                                                                                cursor: "pointer",
                                                                                fontSize: 11,
                                                                                color: "#666",
                                                                                display: "flex",
                                                                                alignItems: "center",
                                                                                gap: 3,
                                                                            }}
                                                                        >
                                                                            <CopyOutlined style={{ fontSize: 10 }} /> Copy
                                                                        </button>
                                                                    </Tooltip>
                                                                    <Tooltip title={`Use this ${f.label.replace(/[^a-zA-Z ]/g, "").trim()}`}>
                                                                        <button
                                                                            onClick={() => handleUseField(f.field, f.value)}
                                                                            style={{
                                                                                background: "linear-gradient(135deg, #667eea, #764ba2)",
                                                                                border: "none",
                                                                                borderRadius: 6,
                                                                                padding: "2px 9px",
                                                                                cursor: "pointer",
                                                                                fontSize: 11,
                                                                                color: "#fff",
                                                                                fontWeight: 600,
                                                                                display: "flex",
                                                                                alignItems: "center",
                                                                                gap: 3,
                                                                            }}
                                                                        >
                                                                            ✦ Use
                                                                        </button>
                                                                    </Tooltip>
                                                                </div>
                                                            </div>
                                                            {/* Value */}
                                                            <div style={{
                                                                fontSize: 12,
                                                                color: "#444",
                                                                lineHeight: 1.6,
                                                                wordBreak: "break-word",
                                                            }}>
                                                                {truncated}
                                                            </div>
                                                        </div>
                                                    );
                                                })}

                                                {/* Use All button */}
                                                <div style={{
                                                    padding: "10px 12px",
                                                    background: "#fafafa",
                                                    borderTop: "1px solid #f0f0f0",
                                                    display: "flex",
                                                    gap: 8,
                                                }}>
                                                    <button
                                                        onClick={() => handleUseAllContent(d)}
                                                        style={{
                                                            flex: 1,
                                                            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                                            color: "#fff",
                                                            border: "none",
                                                            borderRadius: 8,
                                                            padding: "7px 0",
                                                            fontSize: 12,
                                                            fontWeight: 600,
                                                            cursor: "pointer",
                                                            letterSpacing: 0.3,
                                                        }}
                                                    >
                                                        ✨ Use All in Form
                                                    </button>
                                                    <button
                                                        onClick={() => handleCopyField(Object.values(d).filter(Boolean).join("\n\n"))}
                                                        style={{
                                                            background: "#f0f0f0",
                                                            border: "1px solid #e0e0e0",
                                                            borderRadius: 8,
                                                            padding: "7px 12px",
                                                            cursor: "pointer",
                                                            fontSize: 12,
                                                            color: "#555",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            gap: 4,
                                                        }}
                                                    >
                                                        <CopyOutlined style={{ fontSize: 12 }} /> Copy All
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            }

                            return null;
                        })}

                        {/* Typing indicator */}
                        {aiLoading && (
                            <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                                <div style={{
                                    width: 28, height: 28, borderRadius: "50%",
                                    background: "linear-gradient(135deg, #667eea, #764ba2)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    flexShrink: 0, color: "#fff",
                                }}>
                                    <RobotOutlined style={{ fontSize: 12 }} />
                                </div>
                                <div style={{
                                    background: "#fff",
                                    padding: "10px 16px",
                                    borderRadius: "16px 16px 16px 4px",
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                                }}>
                                    <Spin size="small" />
                                    <span style={{ marginLeft: 8, fontSize: 12, color: "#999" }}>Generating your blog...</span>
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Input Area */}
                    <div
                        style={{
                            padding: "12px 14px",
                            background: "#fff",
                            borderTop: "1px solid #f0f0f0",
                            flexShrink: 0,
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                alignItems: "flex-end",
                                gap: 8,
                                background: "#f4f4f8",
                                borderRadius: 12,
                                padding: "8px 8px 8px 14px",
                            }}
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
                                placeholder="e.g. Write a blog about React best practices..."
                                autoSize={{ minRows: 1, maxRows: 4 }}
                                disabled={aiLoading}
                                style={{
                                    flex: 1,
                                    background: "transparent",
                                    border: "none",
                                    resize: "none",
                                    boxShadow: "none",
                                    padding: 0,
                                    fontSize: 13,
                                    lineHeight: 1.5,
                                }}
                            />
                            <button
                                onClick={handleAiGenerate}
                                disabled={aiLoading || !aiPrompt.trim()}
                                style={{
                                    width: 34,
                                    height: 34,
                                    borderRadius: 10,
                                    background: aiLoading || !aiPrompt.trim()
                                        ? "#d9d9d9"
                                        : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                    border: "none",
                                    cursor: aiLoading || !aiPrompt.trim() ? "not-allowed" : "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                    transition: "background 0.2s",
                                }}
                            >
                                <SendOutlined style={{ color: "#fff", fontSize: 14 }} />
                            </button>
                        </div>
                        <div style={{ textAlign: "center", marginTop: 6, fontSize: 11, color: "#bbb" }}>
                            Press Enter to send · Shift+Enter for new line
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
