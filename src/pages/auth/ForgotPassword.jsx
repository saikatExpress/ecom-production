import { ArrowLeftOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Form, Input, message } from "antd";
import { useState } from "react";
import { Link } from "react-router-dom";
import { postData } from "../../services/request";
import "./Login.css";

const PHONE_REGEX = /^(\+?88)?01[3-9]\d{8}$/;

export default function ForgotPassword() {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const onFinish = async (values) => {

        setLoading(true);

        try {
            const formData = new FormData();

            formData.append("phone_number", values.phone);
            formData.append("purpose", "forgot-password");

            const res = await postData("/auth/forgot-password", formData);

            if(res?.success){
                message.success(res.message);
            }
        } catch (error) {
            message.error(error.response?.data?.message || "Something went wrong.");
        } finally {

            setLoading(false);

        }

    };

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-card">
                    <div className="login-header">
                        <div className="login-logo">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#1890ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                <path d="M7 11V7a5 5 0 0110 0v4"></path>
                            </svg>
                        </div>
                        <h1>Forgot Password</h1>
                        <p>Enter your phone number to reset</p>
                    </div>

                    <Form
                        form={form}
                        name="forgot-password"
                        onFinish={onFinish}
                        layout="vertical"
                        size="large"
                        requiredMark={false}
                    >
                        <Form.Item
                            name="phone"
                            rules={[
                                { required: true, message: "Phone number is required" },
                                {
                                    pattern: PHONE_REGEX,
                                    message: "Enter a valid phone number (e.g., 01XXXXXXXXX)"
                                }
                            ]}
                        >
                            <Input
                                prefix={<UserOutlined />}
                                placeholder="Phone number"
                                maxLength={14}
                            />
                        </Form.Item>

                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                block
                                loading={loading}
                            >
                                {loading ? "Sending..." : "Send Reset OTP"}
                            </Button>
                        </Form.Item>

                        <div className="login-footer" style={{ marginTop: 24 }}>
                            <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                <ArrowLeftOutlined /> Back to login
                            </Link>
                        </div>
                    </Form>
                </div>
            </div>
        </div>
    );
}
