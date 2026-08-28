import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { Button, Card, Col, Form, Input, InputNumber, Row, Select, Space, message } from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useTitle from "../../../hooks/useTitle";
import { postData } from "../../../services/request";

const AddDeliveryGateway = () => {
    // Hook
    useTitle("Add Delivery Gateway");

    // Variable
    const navigate              = useNavigate();
    const [form]                = Form.useForm();
    const [loading, setLoading] = useState(false);

    const onFinish = async (values) => {
        try {
            setLoading(true);
            const res = await postData('/admin/delivery-gateway', values);
            
            if (res === undefined || res?.success !== false) {
                message.success('Delivery Gateway created successfully!');
                navigate(-1);
            } else {
                message.error(res?.message || 'Failed to create delivery gateway');
            }
        } catch (error) {
            console.error(error);
            message.error(error?.response?.data?.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card title="Create Delivery Gateway" 
            extra={
                <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
                    Back to List
                </Button>
            }
            bordered={false}
        >
            <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ status: 'active', time_unit: 'days' }}>
                <Row gutter={16}>
                    <Col xs={24} md={12}>
                        <Form.Item name="name" label="Gateway Name" rules={[{ required: true, message: 'Please enter gateway name' }]}>
                            <Input placeholder="e.g. Inside Dhaka" />
                        </Form.Item>
                    </Col>
                    
                    <Col xs={24} md={12}>
                        <Form.Item name="delivery_fee" label="Delivery Fee" rules={[{ required: true, message: 'Please enter delivery fee' }]}>
                            <InputNumber min={0} style={{ width: '100%' }} placeholder="e.g. 80" />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={8}>
                        <Form.Item name="min_time" label="Minimum Time" rules={[{ required: true, message: 'Required' }]}>
                            <InputNumber min={0} style={{ width: '100%' }} placeholder="e.g. 1" />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={8}>
                        <Form.Item name="max_time" label="Maximum Time" rules={[{ required: true, message: 'Required' }]}>
                            <InputNumber min={0} style={{ width: '100%' }} placeholder="e.g. 2" />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={8}>
                        <Form.Item name="time_unit" label="Time Unit" rules={[{ required: true, message: 'Please select time unit' }]}>
                            <Select placeholder="Select unit">
                                <Select.Option value="hours">Hours</Select.Option>
                                <Select.Option value="days">Days</Select.Option>
                                <Select.Option value="weeks">Weeks</Select.Option>
                            </Select>
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                        <Form.Item name="position" label="Position (Order)" rules={[{ required: true, message: 'Please enter position' }]}>
                            <InputNumber min={1} style={{ width: '100%' }} placeholder="e.g. 1" />
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
                            Save Gateway
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

export default AddDeliveryGateway;