import { ApiOutlined, ArrowLeftOutlined, HomeOutlined, SaveOutlined, SettingOutlined, WarningOutlined } from '@ant-design/icons';
import { Alert, Breadcrumb, Button, Card, Col, Flex, Form, Input, message, Popconfirm, Row, Spin, Typography } from 'antd';
import { useEffect, useState } from 'react';
import WebHook from '../../../components/courier/WebHook';
import useTitle from '../../../hooks/useTitle';
import { getData, putData } from '../../../services/request';
import { handleFormErrors } from '../../../utils/formUtils';

const { Title, Text } = Typography;

const SteadFast = () => {
    // Hook
    useTitle("SteadFast API Setup");

    // State
    const [isConfirmed, setIsConfirmed]     = useState(false);
    const [loading, setLoading]             = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [form]                            = Form.useForm();

    const fetchCredentials = async () => {
        setLoading(true);
        try {
            const res = await getData("/admin/courier-setting/steadfast");
            if (res?.success && res?.data) {
                form.setFieldsValue({
                    base_url: res.data.base_url,
                    api_key: res.data.api_key,
                    secret_key: res.data.secret_key,
                });
            }
        } catch (error) {
            console.error("Fetch steadfast credentials error:", error);
            message.error("Failed to load SteadFast credentials.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isConfirmed) {
            fetchCredentials();
        }
    }, [isConfirmed]);

    const handleConfirmSetup = () => {
        setIsConfirmed(true);
    };

    const onFinish = async (values) => {
        setSubmitLoading(true);
        try {
            const res = await putData("/admin/courier-setting/steadfast", values);
            if (res?.success) {
                message.success(res?.message || "SteadFast credentials updated successfully.");
            } else {
                message.error(res?.message || "Failed to update credentials.");
            }
        } catch (error) {
            console.error("Update steadfast credentials error:", error);
            message.error(error?.response?.data?.message || "An error occurred during update.");
            handleFormErrors(error, form, message.error);
        } finally {
            setSubmitLoading(false);
        }
    };

    return (
        <div style={{ padding: '0 0 24px 0' }}>
            <Flex align="center" gap="small" style={{ marginBottom: 16 }}>
                <Button 
                    type="text" 
                    icon={<ArrowLeftOutlined />} 
                    onClick={() => window.history.back()}
                    style={{ fontSize: 16, fontWeight: 500 }}
                >
                    Back
                </Button>
            </Flex>

            <Breadcrumb
                items={[
                    { title: <><HomeOutlined /> Dashboard</> },
                    { title: "Courier Integration" },
                    { title: "SteadFast API Setup" },
                ]}
                style={{ marginBottom: 16 }}
            />

            <Row gutter={[24, 24]}>
                {/* Left Side - YouTube Tutorial */}
                <Col xs={24} lg={10}>
                    <Card 
                        style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: 'none', height: '100%' }}
                        bodyStyle={{ padding: '24px' }}
                    >
                        <Title level={4} style={{ color: '#1677ff', marginBottom: 16 }}>
                            <ApiOutlined /> How to Setup SteadFast
                        </Title>
                        <Text type="secondary" style={{ display: 'block', fontSize: 14, marginBottom: 24 }}>
                            Watch the tutorial below to learn how to obtain your SteadFast API credentials.
                        </Text>
                        
                        <div style={{ borderRadius: 12, overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                            <iframe 
                                width="100%" 
                                height="280" 
                                src="https://www.youtube.com/embed/dQw4w9WgXcQ" 
                                title="SteadFast API Tutorial" 
                                frameBorder="0" 
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                allowFullScreen
                            ></iframe>
                        </div>

                        <Alert
                            message="Important Instruction"
                            description="This configuration contains highly sensitive data. Please be absolutely sure when updating credentials. Incorrect credentials may break your integration and stop automated parcel dispatching."
                            type="warning"
                            showIcon
                            icon={<WarningOutlined />}
                            style={{ marginTop: 24, borderRadius: 8 }}
                        />
                    </Card>
                </Col>

                {/* Right Side - Action / Form */}
                <Col xs={24} lg={14}>
                    {!isConfirmed ? (
                        <Card 
                            style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: 'none', height: '100%' }}
                            bodyStyle={{ padding: '40px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%' }}
                        >
                            <Title level={3} style={{ marginBottom: 16 }}>Ready to Integrate?</Title>
                            <Text type="secondary" style={{ marginBottom: 32, textAlign: 'center', maxWidth: 400 }}>
                                If you have watched the tutorial and have your credentials ready, click the button below to start the setup.
                            </Text>

                            <Popconfirm
                                title="Start Integration"
                                description="Are you sure you want to set up SteadFast Courier?"
                                onConfirm={handleConfirmSetup}
                                okText="Yes, Start Setup"
                                cancelText="No, Cancel"
                                okButtonProps={{ size: 'large' }}
                                cancelButtonProps={{ size: 'large' }}
                            >
                                <Button type="primary" size="large" icon={<SettingOutlined />} style={{ padding: '0 32px', height: 48, fontSize: 16, borderRadius: 24, boxShadow: '0 4px 12px rgba(22,119,255,0.3)' }}>
                                    Are you sure you want to set up this courier?
                                </Button>
                            </Popconfirm>
                        </Card>
                    ) : (
                        <div style={{ animation: 'fadeIn 0.4s ease-in-out', height: '100%' }}>
                            <Card 
                                title={
                                    <Flex align="center" gap="small">
                                        <SettingOutlined style={{ color: '#1677ff', fontSize: 20 }} />
                                        <Title level={4} style={{ margin: 0 }}>Configure SteadFast API</Title>
                                    </Flex>
                                }
                                style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: 'none', height: '100%' }}
                            >
                                {loading ? (
                                    <div style={{ textAlign: 'center', padding: '60px 0' }}>
                                        <Spin size="large" tip={<div style={{ marginTop: 12, color: '#1677ff', fontWeight: 500 }}>Loading Credentials...</div>} />
                                    </div>
                                ) : (
                                    <>
                                        <WebHook path="/admin/steadfast/callback" />
                                        <Form
                                            form={form}
                                            layout="vertical"
                                            onFinish={onFinish}
                                        >
                                            <Row gutter={16}>
                                                <Col span={24}>
                                                    <Form.Item 
                                                        name="base_url" 
                                                        label="Base URL (Endpoint)" 
                                                        rules={[{ required: true, message: 'Please enter base URL' }]}
                                                    >
                                                        <Input size="large" placeholder="e.g. https://steadfast.com.bd/api" />
                                                    </Form.Item>
                                                </Col>

                                                <Col xs={24} md={12}>
                                                    <Form.Item 
                                                        name="api_key" 
                                                        label="API Key" 
                                                        rules={[{ required: true, message: 'Please enter API Key' }]}
                                                    >
                                                        <Input size="large" placeholder="Enter SteadFast API Key" />
                                                    </Form.Item>
                                                </Col>

                                                <Col xs={24} md={12}>
                                                    <Form.Item 
                                                        name="secret_key" 
                                                        label="Secret Key" 
                                                        rules={[{ required: true, message: 'Please enter Secret Key' }]}
                                                    >
                                                        <Input.Password size="large" placeholder="Enter SteadFast Secret Key" />
                                                    </Form.Item>
                                                </Col>
                                            </Row>

                                            <Form.Item style={{ marginTop: 16, marginBottom: 0, textAlign: 'right' }}>
                                                <Button 
                                                    onClick={() => setIsConfirmed(false)} 
                                                    size="large" 
                                                    style={{ marginRight: 16 }}
                                                >
                                                    Cancel
                                                </Button>
                                                <Button 
                                                    type="primary" 
                                                    htmlType="submit" 
                                                    size="large" 
                                                    icon={<SaveOutlined />}
                                                    loading={submitLoading}
                                                >
                                                    Save Configuration
                                                </Button>
                                            </Form.Item>
                                        </Form>
                                    </>
                                )}
                            </Card>
                        </div>
                    )}
                </Col>
            </Row>
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default SteadFast;