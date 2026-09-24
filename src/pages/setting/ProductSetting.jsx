import { SaveOutlined, ShoppingOutlined } from "@ant-design/icons";
import { Breadcrumb, Button, Card, Col, Flex, Input, InputNumber, List, Row, Skeleton, Switch, Typography, message } from "antd";
import { useEffect, useState } from "react";
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
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

const ProductSettingItem = ({ setting, onUpdate, isUpdating }) => {
    // Normalize boolean values
    const getInitialValue = () => {
        if (setting.type === 'boolean') {
            return setting.value === 'true' || setting.value === '1' || setting.value === 1 || setting.value === true;
        }
        return setting.value;
    };

    const [value, setValue] = useState(getInitialValue());

    // Update local state if the setting value changes from server fetch
    useEffect(() => {
        setValue(getInitialValue());
    }, [setting.value]);

    const handleUpdate = () => {
        onUpdate(setting.setting_key, value);
    };

    const renderInput = () => {
        switch (setting.type) {
            case 'boolean':
                return (
                    <Switch 
                        checked={!!value} 
                        onChange={(checked) => setValue(checked)} 
                    />
                );
            case 'number':
                return (
                    <InputNumber 
                        size="large" 
                        style={{ width: '100%', borderRadius: 8 }} 
                        value={value} 
                        onChange={(val) => setValue(val)} 
                        placeholder={`Enter ${setting.label}`}
                    />
                );
            case 'textarea':
                return (
                    <div style={{ width: '100%', background: '#fff' }}>
                        <ReactQuill 
                            theme="snow" 
                            value={value || ''} 
                            onChange={setValue} 
                            placeholder={`Enter ${setting.label}`} 
                        />
                    </div>
                );
            default:
                return (
                    <Input 
                        size="large" 
                        value={value} 
                        onChange={(e) => setValue(e.target.value)} 
                        placeholder={`Enter ${setting.label}`} 
                        style={{ borderRadius: 8 }}
                    />
                );
        }
    };

    return (
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
                    <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        {renderInput()}
                    </div>
                </Col>
                <Col xs={24} md={4} style={{ textAlign: 'right', marginTop: setting.type === 'textarea' ? 0 : 0 }}>
                    <Button
                        type="primary"
                        icon={<SaveOutlined />}
                        loading={isUpdating}
                        onClick={handleUpdate}
                        style={{ borderRadius: 6 }}
                    >
                        Update
                    </Button>
                </Col>
            </Row>
        </List.Item>
    );
};

const ProductSetting = () => {
    // Hook
    useTitle("Product Setting");

    const [loading, setLoading] = useState(true);
    const [updatingKey, setUpdatingKey] = useState(null);
    const [settings, setSettings] = useState([]);

    useEffect(() => {
        const fetchSettings = async () => {
            setLoading(true);
            try {
                const res = await getDatas("/admin/setting", { group_name: "product" });
                if (res?.success && res?.data?.product) {
                    setSettings(res.data.product);
                }
            } catch (error) {
                console.error("Failed to fetch settings:", error);
                message.error("Failed to load settings.");
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, []);

    const updateSingleSetting = async (setting_key, value) => {
        setUpdatingKey(setting_key);
        try {
            const payload = {
                group_name: "product",
                settings: { [setting_key]: value }
            };

            const res = await postData("/admin/setting", payload); 
            if (res?.success) {
                message.success(`Updated successfully!`);
                // Optionally refresh all settings here if needed
            } else {
                message.error(res?.message || "Failed to update setting");
            }
        } catch (error) {
            console.error("Failed to update setting:", error);
            message.error(`Failed to update setting`);
        } finally {
            setUpdatingKey(null);
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
                        { title: <span style={{ color: '#fff' }}>Product</span> },
                    ]}
                    separator={<span style={{ color: 'rgba(255,255,255,0.5)' }}>/</span>}
                />
                <Title level={4} style={{ margin: '8px 0 0', color: '#fff' }}>
                    <ShoppingOutlined style={{ marginRight: 8 }} />
                    Product Settings
                </Title>
            </div>

            {loading ? (
                <Card bordered={false} style={{ borderRadius: 12 }}><Skeleton active paragraph={{ rows: 10 }} /></Card>
            ) : (
                <Card
                    title={<SectionHeader icon={<ShoppingOutlined />} title="Product Configuration" subtitle="Manage product-related settings and preferences" />}
                    bordered={false}
                    style={{ borderRadius: 12, border: '1px solid #f0f0f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
                    styles={{ header: { borderBottom: '2px solid #f0f0f0', padding: '16px 20px' }, body: { padding: '0 20px' } }}
                >
                    <List
                        rowKey="id"
                        itemLayout="horizontal"
                        dataSource={settings}
                        renderItem={(setting) => (
                            <ProductSettingItem
                                key={setting.id}
                                setting={setting}
                                isUpdating={updatingKey === setting.setting_key}
                                onUpdate={updateSingleSetting}
                            />
                        )}
                    />
                </Card>
            )}

            <style>{`
                .ant-card {
                    box-shadow: 0 1px 3px rgba(0,0,0,0.04) !important;
                }
                .ant-list-item {
                    border-bottom: 1px solid #f0f0f0 !important;
                }
                .ant-list-item:last-child {
                    border-bottom: none !important;
                }
                .ql-editor {
                    min-height: 150px;
                    font-size: 14px;
                }
            `}</style>
        </div>
    );
};

export default ProductSetting;