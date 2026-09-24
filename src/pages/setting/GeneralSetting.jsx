import { SaveOutlined, SettingOutlined } from "@ant-design/icons";
import { Breadcrumb, Button, Card, Col, Flex, Form, Input, InputNumber, List, Row, Skeleton, Typography, message } from "antd";
import { useEffect, useState } from "react";
import useTitle from "../../hooks/useTitle";
import { getDatas, postData } from "../../services/request";

const { Title, Text } = Typography;

const SectionHeader = ({ icon, title, subtitle }) => (
    <Flex align="center" gap={12}>
        <div style={{
            width         : 36,
            height        : 36,
            borderRadius  : 10,
            background    : `linear-gradient(135deg, #1677ff, #1677ffdd)`,
            display       : 'flex',
            alignItems    : 'center',
            justifyContent: 'center',
            color         : '#fff',
            fontSize      : 16,
        }}>
            {icon}
        </div>
        <div>
            <Text strong style={{ fontSize: 15, display: 'block', lineHeight: 1.3 }}>{title}</Text>
            {subtitle && <Text type="secondary" style={{ fontSize: 12 }}>{subtitle}</Text>}
        </div>
    </Flex>
);

const GeneralSetting = () => {
    // Hook
    useTitle("General Setting");

    const [form] = Form.useForm();
    const [loading, setLoading] = useState(true);
    const [updatingKey, setUpdatingKey] = useState(null);
    const [settings, setSettings] = useState([]);

    useEffect(() => {
        const fetchSettings = async () => {
            setLoading(true);
            try {
                const res = await getDatas("/admin/setting", { group_name: "general" });
                if (res?.success && res?.data?.general) {
                    setSettings(res.data.general);
                    const initialValues = {};
                    res.data.general.forEach(item => {
                        initialValues[item.setting_key] = item.value;
                    });
                    form.setFieldsValue(initialValues);
                }
            } catch (error) {
                console.error("Failed to fetch settings:", error);
                message.error("Failed to load settings.");
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, [form]);

    const updateSingleSetting = async (setting) => {
        try {
            const value = await form.validateFields([setting.setting_key]);
            setUpdatingKey(setting.setting_key);
            const payload = {
                group_name: "general",
                settings: { [setting.setting_key]: value[setting.setting_key] }
            };

            const res = await postData("/admin/setting", payload); 
            if (res?.success) {
                message.success(`${setting.label} updated successfully!`);
            } else {
                message.error(res?.message || "Failed to update setting");
            }
        } catch (error) {
            if (error.errorFields) {
                return;
            }
            console.error("Failed to update setting:", error);
            message.error(`Failed to update ${setting.label}`);
        } finally {
            setUpdatingKey(null);
        }
    };

    const renderField = (setting) => {
        switch (setting.type) {
            case "textarea":
                return <Input.TextArea size="large" rows={3} placeholder={`Enter ${setting.label}`} />;
            case "number":
                return <InputNumber size="large" style={{ width: '100%' }} placeholder={`Enter ${setting.label}`} />;
            case "email":
                return <Input size="large" type="email" placeholder={`Enter ${setting.label}`} />;
            default:
                return <Input size="large" placeholder={`Enter ${setting.label}`} />;
        }
    };

    return (
        <div style={{ margin: 5 }}>
            <div style={{
                background  : 'linear-gradient(135deg, #1677ff 0%, #0958d9 100%)',
                padding     : '16px 24px',
                borderRadius: 10,
                marginBottom: 20,
                boxShadow   : '0 4px 15px rgba(22, 119, 255, 0.3)',
            }}>
                <Breadcrumb
                    items={[
                        { title: <span style={{ color: 'rgba(255,255,255,0.7)' }}>Dashboard</span> },
                        { title: <span style={{ color: 'rgba(255,255,255,0.7)' }}>Settings</span> },
                        { title: <span style={{ color: '#fff' }}>General</span> },
                    ]}
                    separator={<span style={{ color: 'rgba(255,255,255,0.5)' }}>/</span>}
                />
                <Title level={4} style={{ margin: '8px 0 0', color: '#fff' }}>
                    <SettingOutlined style={{ marginRight: 8 }} />
                    General Settings
                </Title>
            </div>

            {loading ? (
                <Card bordered={false} style={{ borderRadius: 12 }}><Skeleton active paragraph={{ rows: 10 }} /></Card>
            ) : (
                <Card
                    title={<SectionHeader icon={<SettingOutlined />} title="General Information" subtitle="Update basic information about your site individually" />}
                    bordered={false}
                    style={{ borderRadius: 12, border: '1px solid #f0f0f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
                    styles={{ header: { borderBottom: '2px solid #f0f0f0', padding: '16px 20px' }, body: { padding: '0 20px' } }}
                >
                    <Form form={form} layout="vertical">
                        <List
                            itemLayout="horizontal"
                            dataSource={settings}
                            renderItem={(setting) => (
                                <List.Item style={{ padding: '24px 0' }}>
                                    <Row style={{ width: '100%', alignItems: setting.type === 'textarea' ? 'flex-start' : 'center' }} gutter={24}>
                                        <Col xs={24} md={8}>
                                            <div style={{ marginBottom: 8 }}>
                                                <Text strong style={{ fontSize: 15, color: '#333' }}>{setting.label}</Text>
                                                <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>
                                                    {setting.description || `Configure your ${setting.label.toLowerCase()}`}
                                                </div>
                                            </div>
                                        </Col>
                                        <Col xs={24} md={12}>
                                            <Form.Item
                                                name={setting.setting_key}
                                                style={{ margin: 0 }}
                                                rules={[
                                                    { required: true, message: `Please enter ${setting.label}` },
                                                    ...(setting.type === 'email' ? [{ type: 'email', message: 'Please enter a valid email' }] : [])
                                                ]}
                                            >
                                                {renderField(setting)}
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} md={4} style={{ textAlign: 'right', marginTop: setting.type === 'textarea' ? 0 : 0 }}>
                                            <Button
                                                type="primary"
                                                icon={<SaveOutlined />}
                                                loading={updatingKey === setting.setting_key}
                                                onClick={() => updateSingleSetting(setting)}
                                                style={{ borderRadius: 6, marginTop: 4 }}
                                            >
                                                Update
                                            </Button>
                                        </Col>
                                    </Row>
                                </List.Item>
                            )}
                        />
                    </Form>
                </Card>
            )}

            <style>{`
                .ant-card {
                    box-shadow: 0 1px 3px rgba(0,0,0,0.04) !important;
                }
                .ant-form-item-label > label {
                    font-weight: 600 !important;
                    font-size: 13px !important;
                    color: #444 !important;
                }
                .ant-input-lg, .ant-select-lg .ant-select-selector, .ant-input-number-lg {
                    border-radius: 8px !important;
                }
            `}</style>
        </div>
    );
};

export default GeneralSetting;