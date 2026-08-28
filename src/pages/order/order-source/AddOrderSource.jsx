import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { Button, Card, Col, ColorPicker, Form, Input, Row, Select, Space, message } from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useTitle from "../../../hooks/useTitle";
import { postData } from "../../../services/request";

const AddOrderSource = () => {
    // Hook
    useTitle("Add Order Source");

    // Variable
    const navigate = useNavigate();
    const [form]   = Form.useForm();

    // State
    const [loading, setLoading] = useState(false);

    const onFinish = async (values) => {
        try {
            setLoading(true);
            
            const colorCode = typeof values.color_code === 'string' ? values.color_code : values.color_code?.toHexString?.() || values.color_code;
                
            const payload = {
                name      : values.name,
                status    : values.status,
                color_code: colorCode,
            };

            const res = await postData('/admin/order-source', payload);
            
            if (res?.id || res?.success || res?.name) { 
                message.success('Order Source created successfully!');
                navigate(-1);
            } else {
                message.error(res?.message || 'Failed to create order source');
            }
        } catch (error) {
            console.error(error);
            message.error(error?.response?.data?.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card title="Create Order Source" 
            extra={
                <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
                    Back to List
                </Button>
            }
            bordered={false}
        >
            <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ status: 'active', color_code: '#1677ff' }}>
                <Row gutter={16}>
                    <Col xs={24} md={12}>
                        <Form.Item name="name" label="Order Source Name" rules={[{ required: true, message: 'Please enter order source name' }]}>
                            <Input placeholder="Enter order source name" />
                        </Form.Item>
                    </Col>
                    
                    <Col xs={24} md={12}>
                        <Form.Item name="color_code" label="Color Code" rules={[{ required: true, message: 'Please select a color' }]}>
                            <ColorPicker showText format="hex" />
                        </Form.Item>
                    </Col>
                    
                    <Col xs={24} md={12}>
                        <Form.Item name="status" label="Status" rules={[{ required: true, message: 'Please select status' }]}>
                            <Select placeholder="Select status">
                                <Select.Option value="active">Active</Select.Option>
                                <Select.Option value="inactive">Inactive</Select.Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>
                
                <Form.Item style={{ marginTop: 16 }}>
                    <Space>
                        <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
                            Save Order Source
                        </Button>
                        <Button htmlType="button" onClick={() => form.resetFields()}>
                            Reset
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
        </Card>
    );
};

export default AddOrderSource;