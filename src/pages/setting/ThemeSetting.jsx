import { ControlOutlined, SaveOutlined } from "@ant-design/icons";
import { Breadcrumb, Button, Card, Col, ColorPicker, Flex, Input, List, Row, Select, Skeleton, Typography, message } from "antd";
import { useEffect, useState } from "react";
import useTitle from "../../hooks/useTitle";
import { getDatas, putData } from "../../services/request";
import { useDispatch } from "react-redux";
import { fetchAllSettings } from "../../features/setting/settingThunk";

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

const ThemeSettingItem = ({ setting, onUpdate, isUpdating }) => {
    const [value, setValue] = useState(setting.value);

    useEffect(() => {
        setValue(setting.value);
    }, [setting.value]);

    const handleUpdate = () => {
        onUpdate(setting, value);
    };

    const handleColorChange = (color, hexString) => {
        if (typeof color === 'string') {
            setValue(color);
        } else if (hexString) {
            setValue(hexString);
        } else if (color && color.toHexString) {
            setValue(color.toHexString());
        }
    };

    const renderInput = () => {
        switch (setting.type) {
            case 'color':
                return (
                    <Flex align="center" gap={12} style={{ width: '100%' }}>
                        <ColorPicker 
                            value={value} 
                            onChange={handleColorChange} 
                            size="large"
                            showText
                        />
                        <Input 
                            style={{ width: 120, borderRadius: 8 }} 
                            size="large" 
                            value={value} 
                            onChange={(e) => setValue(e.target.value)} 
                        />
                    </Flex>
                );
            case 'select':
                // Provide some basic layout style options since none are strictly given in the payload
                const options = [
                    { label: 'Style 1', value: 'style_1' },
                    { label: 'Style 2', value: 'style_2' },
                    { label: 'Style 3', value: 'style_3' },
                    { label: 'Style 4', value: 'style_4' },
                ];
                return (
                    <Select 
                        size="large" 
                        value={value} 
                        onChange={(val) => setValue(val)} 
                        style={{ width: '100%', borderRadius: 8 }}
                        options={options}
                    />
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
            <Row style={{ width: '100%', alignItems: 'center' }} gutter={24}>
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
                <Col xs={24} md={4} style={{ textAlign: 'right' }}>
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

const ThemeSetting = () => {
    // Hook
    useTitle("Theme Setting");
    const dispatch = useDispatch();

    const [loading, setLoading] = useState(true);
    const [updatingKey, setUpdatingKey] = useState(null);
    const [settings, setSettings] = useState([]);

    useEffect(() => {
        const fetchSettings = async () => {
            setLoading(true);
            try {
                const res = await getDatas("/admin/setting", { group_name: "theme" });
                if (res?.success && res?.data?.theme) {
                    setSettings(res.data.theme);
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

    const updateSingleSetting = async (setting, value) => {
        setUpdatingKey(setting.setting_key);
        try {
            const payload = {
                group_name: setting.group_name,
                setting_key: setting.setting_key,
                label: setting.label,
                type: setting.type,
                value: value
            };

            const res = await putData(`/admin/setting/${setting.id}`, payload); 
            if (res?.success) {
                message.success(`Updated successfully!`);
                // Dispatch global fetch so sidebar/theme changes apply everywhere
                dispatch(fetchAllSettings());
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
                        { title: <span style={{ color: '#fff' }}>Theme</span> },
                    ]}
                    separator={<span style={{ color: 'rgba(255,255,255,0.5)' }}>/</span>}
                />
                <Title level={4} style={{ margin: '8px 0 0', color: '#fff' }}>
                    <ControlOutlined style={{ marginRight: 8 }} />
                    Theme Settings
                </Title>
            </div>

            {loading ? (
                <Card bordered={false} style={{ borderRadius: 12 }}><Skeleton active paragraph={{ rows: 10 }} /></Card>
            ) : (
                <Card
                    title={<SectionHeader icon={<ControlOutlined />} title="Theme Configuration" subtitle="Customize the colors, fonts, and layouts of your storefront" />}
                    bordered={false}
                    style={{ borderRadius: 12, border: '1px solid #f0f0f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
                    styles={{ header: { borderBottom: '2px solid #f0f0f0', padding: '16px 20px' }, body: { padding: '0 20px' } }}
                >
                    <List
                        rowKey="id"
                        itemLayout="horizontal"
                        dataSource={settings}
                        renderItem={(setting) => (
                            <ThemeSettingItem
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
            `}</style>
        </div>
    );
};

export default ThemeSetting;