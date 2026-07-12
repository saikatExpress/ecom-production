import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Checkbox, Form, Input, message } from "antd";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../../features/auth/authThunk";
import { resendOtp } from "../../features/auth/resendOtpThunk";
import { verifyOtp } from "../../features/auth/verifyOtpThunk";
import "./Login.css";

const PHONE_REGEX = /^(\+?88)?01[3-9]\d{8}$/;

export default function Login() {
    // State
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [showOtp, setShowOtp] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const onFinish = async (values) => {
        setLoading(true);
        try {
            if (showOtp) {
                await handleVerifyOtp(values);
            } else {
                await handleLogin(values);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async (values) => {

        const formData = new FormData();

        formData.append("phone_number", values.phone);
        formData.append("password", values.password);

        const result = await dispatch(loginUser(formData));

        if (result?.payload?.success === false) {
            message.warning(result.payload.message);
        }

        if (!loginUser.fulfilled.match(result)) {
            return;
        }

        if (result.payload.data?.otp_required) {

            setShowOtp(true);

            message.info(result.payload.data.message);

            return;
        }

        navigate("/dashboard", { replace: true });

        message.success("Login Successful");
    };

    const handleVerifyOtp = async (values) => {

        const formData = new FormData();

        formData.append("phone_number", form.getFieldValue("phone"));
        formData.append("otp", values.otp);
        formData.append("purpose", "login");

        try {
            await dispatch(verifyOtp(formData)).unwrap();

            message.success("Login Successful");

            navigate("/dashboard", { replace: true });

        } catch (error) {
            message.warning(error.message || "OTP verification failed.");
        }

    };

    const onFinishFailed = (errorInfo) => {
        console.log("Validation failed:", errorInfo);
    };

    const handleResendOtp = async () => {
        setResendLoading(true);

        try {

            const formData = new FormData();

            formData.append("phone_number", form.getFieldValue("phone"));
            formData.append("purpose", "login");

            const res = await dispatch(resendOtp(formData)).unwrap();

            message.success(res.message);

        } catch (error) {

            message.error(error?.message || "Failed to resend OTP");

        } finally {
            setResendLoading(false);
        }

    };

    if (showOtp) {
        return (
            <div className="login-page">
                <div className="login-container">
                    <div className="login-card">
                        <div className="login-header">
                            <h1>Verify OTP</h1>
                            <p>We've sent an OTP to <strong>{form.getFieldValue("phone")}</strong></p>
                        </div>
                        <Form form={form} name="verify-otp"
                            onFinish={onFinish}
                            layout="vertical"
                            size="large"
                            requiredMark={false}
                        >
                            <Form.Item
                                name="otp"
                                rules={[
                                    { required: true, message: "OTP is required" },
                                ]}
                            >
                                <Input
                                    placeholder="Enter OTP"
                                    maxLength={6}
                                />
                            </Form.Item>
                            <Form.Item>
                                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        block
                                        loading={loading}
                                        size="large"
                                    >
                                        {loading ? "Verifying..." : "Verify OTP"}
                                    </Button>
                                    <Button
                                        type="default"
                                        block
                                        onClick={handleResendOtp}
                                        loading={resendLoading}
                                        size="large"
                                    >
                                        Resend OTP
                                    </Button>
                                </div>
                            </Form.Item>
                        </Form>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-card">
                    <div className="login-header">
                        <div className="login-logo">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                                <path
                                    d="M3 7.5L12 3l9 4.5v9L12 21l-9-4.5v-9z"
                                    stroke="#1890ff"
                                    strokeWidth="2"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </div>
                        <h1>Welcome Back</h1>
                        <p>Sign in to your account</p>
                    </div>

                    <Form
                        form={form}
                        name="login"
                        onFinish={onFinish}
                        onFinishFailed={onFinishFailed}
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

                        <Form.Item
                            name="password"
                            rules={[
                                { required: true, message: "Password is required" },
                                { min: 6, message: "Password must be at least 6 characters" }
                            ]}
                        >
                            <Input.Password
                                prefix={<LockOutlined />}
                                placeholder="Password"
                            />
                        </Form.Item>

                        <Form.Item
                            name="terms"
                            valuePropName="checked"
                            rules={[
                                {
                                    validator: (_, value) =>
                                        value
                                            ? Promise.resolve()
                                            : Promise.reject("You must accept the Terms & Conditions")
                                }
                            ]}
                            initialValue={true} // Always checked by default
                        >
                            <Checkbox>
                                I agree to the{" "}
                                <a href="/terms" onClick={(e) => e.preventDefault()}>
                                    Terms & Conditions
                                </a>
                            </Checkbox>
                        </Form.Item>

                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                block
                                loading={loading}
                            >
                                {loading ? "Signing in..." : "Sign in"}
                            </Button>
                        </Form.Item>

                        <div className="login-footer">
                            <a href="/forgot-password" onClick={(e) => e.preventDefault()}>
                                Forgot password?
                            </a>
                        </div>
                    </Form>
                </div>
            </div>
        </div>
    );
}