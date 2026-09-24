import { PictureOutlined, SaveOutlined, UploadOutlined } from "@ant-design/icons";
import { Breadcrumb, Button, Card, Col, Flex, Image, Input, List, Row, Skeleton, Typography, Upload, message } from "antd";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchAllSettings } from "../../features/setting/settingThunk";
import useTitle from "../../hooks/useTitle";
import { getDatas, putData, postData } from "../../services/request";

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

const LogoSettingItem = ({ setting, onUpdate, isUpdating }) => {
    const [fileOrValue, setFileOrValue] = useState(null);
    const [preview, setPreview] = useState(setting.value);

    useEffect(() => {
        setPreview(setting.value);
        setFileOrValue(null);
    }, [setting.value]);

    const handleFileChange = (info) => {
        const fileList = info.fileList;
        if (fileList.length > 0) {
            const newFile = fileList[0].originFileObj;
            setFileOrValue(newFile);
            setPreview(URL.createObjectURL(newFile));
        } else {
            setFileOrValue(null);
            setPreview(setting.value);
        }
    };

    const handleTextChange = (e) => {
        setFileOrValue(e.target.value);
    };

    const handleUpdate = () => {
        let finalValue = fileOrValue;
        if (setting.type !== 'image' && finalValue === null) {
            finalValue = setting.value;
        }
        
        if (setting.type === 'image' && finalValue === null) {
            message.warning(`Please select a new image for ${setting.label} to update.`);
            return;
        }
        
        onUpdate(setting, finalValue);
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        {setting.type === 'image' ? (
                            <>
                                {preview ? (
                                    <div style={{
                                        width: 100, height: 100, borderRadius: 8, border: '1px dashed #d9d9d9',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                                        backgroundColor: '#fafafa'
                                    }}>
                                        <Image src={preview} alt={setting.label} style={{ maxWidth: '100%', maxHeight: 100, objectFit: 'contain' }} />
                                    </div>
                                ) : (
                                    <div style={{
                                        width: 100, height: 100, borderRadius: 8, border: '1px dashed #d9d9d9',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fafafa'
                                    }}>
                                        <PictureOutlined style={{ fontSize: 24, color: '#999' }} />
                                    </div>
                                )}
                                <Upload
                                    beforeUpload={() => false}
                                    showUploadList={false}
                                    onChange={handleFileChange}
                                >
                                    <Button icon={<UploadOutlined />}>Select Image</Button>
                                </Upload>
                            </>
                        ) : (
                            <Input 
                                size="large" 
                                placeholder={`Enter ${setting.label}`} 
                                defaultValue={setting.value} 
                                onChange={handleTextChange} 
                                style={{ borderRadius: 8 }}
                            />
                        )}
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

const LogoSetting = () => {
    useTitle("Logo Setting");
    const dispatch = useDispatch();

    const [loading, setLoading]         = useState(true);
    const [updatingKey, setUpdatingKey] = useState(null);
    const [settings, setSettings]       = useState([]);

    useEffect(() => {
        const fetchSettings = async () => {
            setLoading(true);
            try {
                const res = await getDatas("/admin/setting", { group_name: "logo" });
                if (res?.success && res?.data?.logo) {
                    setSettings(res.data.logo);
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

    const updateSingleSetting = async (setting, fileOrValue) => {
        setUpdatingKey(setting.setting_key);
        try {
            let payload;
            if (setting.type === 'image' && fileOrValue instanceof File) {
                payload = new FormData();
                payload.append("group_name", setting.group_name);
                payload.append("setting_key", setting.setting_key);
                payload.append("label", setting.label);
                payload.append("type", setting.type);
                payload.append("value", fileOrValue);
                payload.append("_method", "PUT");
            } else {
                payload = {
                    group_name: setting.group_name,
                    setting_key: setting.setting_key,
                    label: setting.label,
                    type: setting.type,
                    value: fileOrValue,
                    _method: "PUT"
                };
            }

            const res = await postData(`/admin/setting/${setting.id}`, payload);
            
            if (res?.success) {
                message.success(`Updated successfully!`);
                
                // Refresh to get updated data (e.g. image URLs)
                const updatedRes = await getDatas("/admin/setting", { group_name: "logo" });
                if (updatedRes?.success && updatedRes?.data?.logo) {
                    setSettings(updatedRes.data.logo);
                }
                // Update global state so sidebar logo updates immediately
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
                        { title: <span style={{ color: '#fff' }}>Logo</span> },
                    ]}
                    separator={<span style={{ color: 'rgba(255,255,255,0.5)' }}>/</span>}
                />
                <Title level={4} style={{ margin: '8px 0 0', color: '#fff' }}>
                    <PictureOutlined style={{ marginRight: 8 }} />
                    Logo Settings
                </Title>
            </div>

            {loading ? (
                <Card bordered={false} style={{ borderRadius: 12 }}><Skeleton active paragraph={{ rows: 10 }} /></Card>
            ) : (
                <Card
                    title={<SectionHeader icon={<PictureOutlined />} title="Logo & Images" subtitle="Update logos and favicons for your site individually" />}
                    bordered={false}
                    style={{ borderRadius: 12, border: '1px solid #f0f0f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
                    styles={{ header: { borderBottom: '2px solid #f0f0f0', padding: '16px 20px' }, body: { padding: '0 20px' } }}
                >
                    <List
                        rowKey="id"
                        itemLayout="horizontal"
                        dataSource={settings}
                        renderItem={(setting) => (
                            <LogoSettingItem
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

export default LogoSetting;