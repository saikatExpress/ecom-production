import { CloseOutlined, CopyOutlined, RobotOutlined, SendOutlined } from "@ant-design/icons";
import { Input, Spin, Tooltip, message } from "antd";
import { useEffect, useRef, useState } from "react";
import { postData } from "../../services/request";

export default function ProductAiChat({ form, categories, subCategories, brands }) {
    const [chatOpen, setChatOpen]         = useState(false);
    const [aiPrompt, setAiPrompt]         = useState("");
    const [aiLoading, setAiLoading]       = useState(false);
    const [chatMessages, setChatMessages] = useState([
        {
            role: "assistant",
            text: "👋 Hi! I'm your AI Product Assistant. Tell me what kind of product description and SEO data you want, and I'll generate it for you based on your current form inputs!",
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
            // Collect current form data
            const values = form.getFieldsValue();
            
            // Resolve names from IDs
            const categoryName = categories?.find(c => c.id === values.category_id)?.name || "";
            const subCategoryName = subCategories?.find(s => s.id === values.sub_category_id)?.name || "";
            const brandName = brands?.find(b => b.id === values.brand_id)?.name || "";

            const payload = {
                name: values.name || "",
                category: categoryName,
                sub_category: subCategoryName,
                brand: brandName,
                sku: values.sku || "",
                mrp: values.mrp || 0,
                sell_price: values.sell_price || 0,
                free_shipping: !!values.free_shipping,
                prompt: aiPrompt
            };

            const response = await postData("/admin/product/ai-generate", payload);

            if (response?.success !== false) {
                const responseData = response?.data || response;
                
                if (responseData?.is_valid_request === false) {
                    setChatMessages((prev) => [...prev, {
                        role: "assistant",
                        type: "invalid",
                        invalidMessage: responseData?.message || "Please provide a valid product context.",
                    }]);
                } else {
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
        if (data.short_description) form.setFieldValue("short_description", data.short_description);
        if (data.description)       form.setFieldValue("description", data.description);
        if (data.meta_title)        form.setFieldValue("meta_title", data.meta_title);
        if (data.meta_description)  form.setFieldValue("meta_description", data.meta_description);
        if (data.meta_keywords) {
            const kw = Array.isArray(data.meta_keywords)
                ? data.meta_keywords
                : data.meta_keywords.split(",").map((k) => k.trim());
            form.setFieldValue("meta_keywords", kw);
        }
        message.success("AI content applied to the product form! 🎉");
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
            <Tooltip title="Product AI Assistant" placement="left">
                <button
                    onClick={() => setChatOpen((o) => !o)}
                    style={{
                        position: "fixed",
                        bottom: 32,
                        right: 32,
                        width: 56,
                        height: 56,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #FF6B6B 0%, #C44D58 100%)", // Beautiful red/pink theme for product AI
                        border: "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 4px 20px rgba(196, 77, 88, 0.5)",
                        zIndex: 1000,
                        transition: "transform 0.2s, box-shadow 0.2s",
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "scale(1.1)";
                        e.currentTarget.style.boxShadow = "0 6px 28px rgba(196, 77, 88, 0.7)";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "scale(1)";
                        e.currentTarget.style.boxShadow = "0 4px 20px rgba(196, 77, 88, 0.5)";
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
                        width: 400,
                        maxHeight: "75vh",
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
                            background: "linear-gradient(135deg, #FF6B6B 0%, #C44D58 100%)",
                            padding: "16px 20px",
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            flexShrink: 0,
                        }}
                    >
                        <div
                            style={{
                                width: 38,
                                height: 38,
                                borderRadius: "50%",
                                background: "rgba(255,255,255,0.25)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.4)",
                            }}
                        >
                            <RobotOutlined style={{ color: "#fff", fontSize: 20 }} />
                        </div>
                        <div>
                            <div style={{ color: "#fff", fontWeight: 600, fontSize: 16, lineHeight: 1.2 }}>Product AI</div>
                            <div style={{ color: "rgba(255,255,255,0.85)", fontSize: 12 }}>
                                {aiLoading ? "Crafting descriptions..." : "Ready to optimize"}
                            </div>
                        </div>
                        <button
                            onClick={() => setChatOpen(false)}
                            style={{
                                marginLeft: "auto",
                                background: "rgba(255,255,255,0.2)",
                                border: "none",
                                borderRadius: 8,
                                width: 30,
                                height: 30,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                transition: "background 0.2s",
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.3)"}
                            onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.2)"}
                        >
                            <CloseOutlined style={{ color: "#fff", fontSize: 14 }} />
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
                            background: "#fafafa",
                        }}
                    >
                        {chatMessages.map((msg, idx) => {
                            if (msg.role === "user") {
                                return (
                                    <div key={idx} style={{ display: "flex", flexDirection: "row-reverse", gap: 8, alignItems: "flex-end" }}>
                                        <div style={{
                                            maxWidth: "75%",
                                            background: "linear-gradient(135deg, #FF6B6B, #C44D58)",
                                            color: "#fff",
                                            padding: "10px 14px",
                                            borderRadius: "16px 16px 4px 16px",
                                            fontSize: 13, lineHeight: 1.6,
                                            boxShadow: "0 2px 8px rgba(196, 77, 88, 0.15)",
                                            whiteSpace: "pre-wrap", wordBreak: "break-word",
                                        }}>
                                            {msg.text}
                                        </div>
                                    </div>
                                );
                            }

                            if (!msg.type) {
                                return (
                                    <div key={idx} style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                                        <div style={{
                                            width: 28, height: 28, borderRadius: "50%",
                                            background: "linear-gradient(135deg, #FF6B6B, #C44D58)",
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
                                            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                                            border: "1px solid #f0f0f0"
                                        }}>
                                            {msg.text}
                                        </div>
                                    </div>
                                );
                            }

                            if (msg.type === "error") {
                                return (
                                    <div key={idx} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                                        <div style={{
                                            width: 28, height: 28, borderRadius: "50%",
                                            background: "linear-gradient(135deg, #FF6B6B, #C44D58)",
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

                            if (msg.type === "validation") {
                                return (
                                    <div key={idx} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                                        <div style={{
                                            width: 28, height: 28, borderRadius: "50%",
                                            background: "linear-gradient(135deg, #FF6B6B, #C44D58)",
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

                            if (msg.type === "invalid") {
                                return (
                                    <div key={idx} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                                        <div style={{
                                            width: 28, height: 28, borderRadius: "50%",
                                            background: "linear-gradient(135deg, #FF6B6B, #C44D58)",
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
                                                Invalid Context
                                            </div>
                                            <div style={{ fontSize: 12, color: "#ad6800", lineHeight: 1.6 }}>
                                                {msg.invalidMessage}
                                            </div>
                                        </div>
                                    </div>
                                );
                            }

                            if (msg.type === "result") {
                                const d = msg.rawData;
                                const fields = [
                                    { key: "short_description", label: "✨ Short Desc",       value: d?.short_description, field: "short_description", isHtml: true, preview: true },
                                    { key: "description",       label: "📝 Full Desc",        value: d?.description,       field: "description",       isHtml: true, preview: true },
                                    { key: "meta_title",        label: "🔍 SEO Title",        value: d?.meta_title,        field: "meta_title" },
                                    { key: "meta_keywords",     label: "🏷️ SEO Keywords",     value: d?.meta_keywords,     field: "meta_keywords" },
                                    { key: "meta_description",  label: "📋 SEO Description",  value: d?.meta_description,  field: "meta_description" },
                                ].filter((f) => f.value);

                                return (
                                    <div key={idx} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                                        <div style={{
                                            width: 28, height: 28, borderRadius: "50%",
                                            background: "linear-gradient(135deg, #FF6B6B, #C44D58)",
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            flexShrink: 0, color: "#fff",
                                        }}><RobotOutlined style={{ fontSize: 13 }} /></div>

                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{
                                                background: "linear-gradient(135deg, #FF6B6B 0%, #C44D58 100%)",
                                                borderRadius: "12px 12px 0 0",
                                                padding: "10px 14px",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 8,
                                            }}>
                                                <span style={{ fontSize: 16 }}>✅</span>
                                                <span style={{ color: "#fff", fontWeight: 600, fontSize: 13 }}>Content Generated!</span>
                                            </div>

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
                                                    const truncated = f.preview && displayText.length > 150
                                                        ? displayText.slice(0, 150) + "…"
                                                        : displayText;

                                                    return (
                                                        <div key={f.key} style={{
                                                            borderBottom: fi < fields.length - 1 ? "1px solid #f0f0f0" : "none",
                                                            padding: "10px 12px",
                                                        }}>
                                                            <div style={{
                                                                display: "flex",
                                                                justifyContent: "space-between",
                                                                alignItems: "center",
                                                                marginBottom: 4,
                                                            }}>
                                                                <span style={{
                                                                    fontSize: 11,
                                                                    fontWeight: 600,
                                                                    color: "#C44D58",
                                                                    textTransform: "uppercase",
                                                                    letterSpacing: 0.5,
                                                                }}>
                                                                    {f.label}
                                                                </span>
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
                                                                                background: "linear-gradient(135deg, #FF6B6B, #C44D58)",
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
                                                            background: "linear-gradient(135deg, #FF6B6B 0%, #C44D58 100%)",
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
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            }

                            return null;
                        })}

                        {aiLoading && (
                            <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                                <div style={{
                                    width: 28, height: 28, borderRadius: "50%",
                                    background: "linear-gradient(135deg, #FF6B6B, #C44D58)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    flexShrink: 0, color: "#fff",
                                }}>
                                    <RobotOutlined style={{ fontSize: 12 }} />
                                </div>
                                <div style={{
                                    background: "#fff",
                                    padding: "10px 16px",
                                    borderRadius: "16px 16px 16px 4px",
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                                    border: "1px solid #f0f0f0"
                                }}>
                                    <Spin size="small" />
                                    <span style={{ marginLeft: 8, fontSize: 12, color: "#999" }}>Optimizing content...</span>
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
                                background: "#f9f9f9",
                                borderRadius: 12,
                                padding: "8px 8px 8px 14px",
                                border: "1px solid #eaeaea",
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
                                placeholder="e.g. Write a premium Bengali product description..."
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
                                        : "linear-gradient(135deg, #FF6B6B 0%, #C44D58 100%)",
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
