import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { Breadcrumb, Button, Card, Col, ColorPicker, Flex, Form, Input, InputNumber, Row, Select, Space, Spin, Tag, Typography, message } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useTitle from '../../../hooks/useTitle';
import { getDatas, putData } from '../../../services/request';

const { Title, Text } = Typography;

const EditStatus = () => {
    // Hook
    useTitle("Edit Status");

    // Variable
    const navigate = useNavigate();
    const { id }   = useParams();
    const [form]   = Form.useForm();
    
    // States
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading]       = useState(false);

    // Watch values for preview
    const nameValue      = Form.useWatch('name', form);
    const bgColorValue   = Form.useWatch('bg_color', form);
    const textColorValue = Form.useWatch('text_color', form);
    const iconValue      = Form.useWatch('icon', form);

    useEffect(() => {
        const fetchStatus = async () => {
            setLoading(true);
            try {
                const res = await getDatas(`/admin/status/${id}`);
                if (res?.success && res?.data) {
                    form.setFieldsValue({
                        name      : res.data.name,
                        bg_color  : res.data.bg_color || '#1677ff',
                        text_color: res.data.text_color || '#ffffff',
                        icon      : res.data.icon,
                        position  : res.data.position,
                        status    : res.data.status || 'active',
                    });
                } else {
                    message.error("Failed to load status details");
                }
            } catch (error) {
                console.error("Failed to fetch status", error);
                message.error("Error loading status data");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchStatus();
        }
    }, [id, form]);

    const handleFormSubmit = async (values) => {
        setSubmitting(true);
        try {
            const payload = {
                name      : values.name,
                bg_color  : typeof values.bg_color === 'string' ? values.bg_color    : values.bg_color?.toHexString(),
                text_color: typeof values.text_color === 'string' ? values.text_color: values.text_color?.toHexString(),
                icon      : values.icon,
                position  : values.position,
                status    : values.status,
            };

            const res = await putData(`/admin/status/${id}`, payload);

            if (res?.success !== false) {
                message.success("Status updated successfully!");
                navigate("/status");
            } else {
                message.error(res?.message || "Failed to update status");
            }
        } catch (error) {
            console.error("Submit error:", error);
            message.error(error?.response?.data?.message || "An error occurred");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="edit-status-page">
            <Breadcrumb
                items={[
                    { title: "Dashboard" },
                    { title: "Order" },
                    { title: <a onClick={() => navigate('/status')}>Status List</a> },
                    { title: "Edit Status" },
                ]}
                style={{ marginBottom: 16 }}
            />

            <Card 
                title={
                    <Flex justify="space-between" align="center" style={{ padding: '8px 0' }}>
                        <Space>
                            <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/status')}/>
                            <Title level={4} style={{ margin: 0 }}>Edit Status</Title>
                        </Space>
                    </Flex>
                }
                bordered={false}
                style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
            >
                {loading ? (
                    <Flex justify="center" align="center" style={{ padding: '50px 0' }}>
                        <Spin size="large" />
                    </Flex>
                ) : (
                    <Row gutter={24}>
                        <Col xs={24} md={16} lg={12}>
                            <Form form={form} layout="vertical" onFinish={handleFormSubmit} >
                                <Form.Item name="name" label="Status Name" rules={[{ required: true, message: "Please enter status name" }]}>
                                    <Input placeholder="e.g. New Order" />
                                </Form.Item>

                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item 
                                            name="bg_color" 
                                            label="Background Color"
                                            getValueFromEvent={(color) => typeof color === 'string' ? color : color?.toHexString()}
                                        >
                                            <ColorPicker format="hex" showText />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item 
                                            name="text_color" 
                                            label="Text Color"
                                            getValueFromEvent={(color) => typeof color === 'string' ? color : color?.toHexString()}
                                        >
                                            <ColorPicker format="hex" showText />
                                        </Form.Item>
                                    </Col>
                                </Row>

                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item name="icon" label="Icon Class (Optional)">
                                            <Input placeholder="e.g. ti-plus" />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item name="position" label="Position" rules={[{ required: true, message: "Required" }]}>
                                            <InputNumber min={1} style={{ width: '100%' }} />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                
                                <Form.Item name="status" label="Status Visibility" rules={[{ required: true, message: "Please select status" }]}>
                                    <Select placeholder="Select status">
                                        <Select.Option value="active">Active</Select.Option>
                                        <Select.Option value="inactive">Inactive</Select.Option>
                                    </Select>
                                </Form.Item>
                                
                                <Form.Item style={{ marginTop: 24 }}>
                                    <Space>
                                        <Button onClick={() => navigate('/status')}>
                                            Cancel
                                        </Button>
                                        <Button type="primary" htmlType="submit" loading={submitting} icon={<SaveOutlined />}>
                                            Update Status
                                        </Button>
                                    </Space>
                                </Form.Item>
                            </Form>
                        </Col>
                        
                        <Col xs={24} md={8} lg={12}>
                            <Card title="Live Preview" bordered style={{ background: '#fafafa' }}>
                                <Flex justify="center" align="center" style={{ padding: '40px 0' }}>
                                    <Tag 
                                        style={{ 
                                            backgroundColor: typeof bgColorValue === 'string' ? bgColorValue : bgColorValue?.toHexString?.() || '#1677ff', 
                                            color: typeof textColorValue === 'string' ? textColorValue : textColorValue?.toHexString?.() || '#ffffff', 
                                            borderColor: typeof bgColorValue === 'string' ? bgColorValue : bgColorValue?.toHexString?.() || '#1677ff', 
                                            fontSize: '15px', 
                                            padding: '6px 16px', 
                                            borderRadius: '6px' 
                                        }}
                                    >
                                        {iconValue && <i className={iconValue} style={{ marginRight: 8 }}></i>}
                                        {nameValue || 'Status Name'}
                                    </Tag>
                                </Flex>
                                <div style={{ textAlign: 'center', marginTop: 16 }}>
                                    <Text type="secondary">This is how the badge will appear in tables and orders.</Text>
                                </div>
                            </Card>
                        </Col>
                    </Row>
                )}
            </Card>
        </div>
    );
};

export default EditStatus;