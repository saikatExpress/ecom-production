import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { Breadcrumb, Button, Card, Col, ColorPicker, Flex, Form, Input, InputNumber, Row, Select, Space, Tag, Typography, message } from 'antd';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useTitle from '../../../hooks/useTitle';
import { postData } from '../../../services/request';

const { Title, Text } = Typography;

const AddStatus = () => {
    // Hook
    useTitle("Add Status");

    // Variable
    const navigate = useNavigate();
    const [form]   = Form.useForm();
    
    // States
    const [submitting, setSubmitting] = useState(false);

    // Watch values for preview
    const nameValue      = Form.useWatch('name', form);
    const bgColorValue   = Form.useWatch('bg_color', form);
    const textColorValue = Form.useWatch('text_color', form);
    const iconValue      = Form.useWatch('icon', form);

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

            const res = await postData("/admin/status", payload);

            if (res?.success !== false) {
                message.success("Status created successfully!");
                navigate("/status");
            } else {
                message.error(res?.message || "Failed to create status");
            }
        } catch (error) {
            console.error("Submit error:", error);
            message.error(error?.response?.data?.message || "An error occurred");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="add-status-page">
            <Breadcrumb
                items={[
                    { title: "Dashboard" },
                    { title: "Order" },
                    { title: <a onClick={() => navigate('/status')}>Status List</a> },
                    { title: "Add Status" },
                ]}
                style={{ marginBottom: 16 }}
            />

            <Card 
                title={
                    <Flex justify="space-between" align="center" style={{ padding: '8px 0' }}>
                        <Space>
                            <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/status')}/>
                            <Title level={4} style={{ margin: 0 }}>Add New Status</Title>
                        </Space>
                    </Flex>
                }
                bordered={false}
                style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
            >
                <Row gutter={24}>
                    <Col xs={24} md={16} lg={12}>
                        <Form 
                            form={form} 
                            layout="vertical" 
                            onFinish={handleFormSubmit} 
                            initialValues={{ 
                                status    : 'active',
                                position  : 1,
                                bg_color  : '#1677ff',
                                text_color: '#ffffff',
                                name      : '',
                                icon      : ''
                            }}
                        >
                            <Form.Item name="name" label="Status Name" rules={[{ required: true, message: "Please enter status name" }]}>
                                <Input placeholder="e.g. New Order" />
                            </Form.Item>

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item name="bg_color" label="Background Color" getValueFromEvent={(color) => typeof color === 'string' ? color : color?.toHexString()}>
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
                                        Save Status
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
            </Card>
        </div>
    );
};

export default AddStatus;