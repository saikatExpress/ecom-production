import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { Button, Card, Col, Form, Input, InputNumber, Row, Select, Space, Spin, message } from "antd";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useTitle from "../../../hooks/useTitle";
import { getData, putData } from "../../../services/request";

const EditDeliveryGateway = () => {
    // Hook
    useTitle("Edit Delivery Gateway");

    // Variable
    const navigate                = useNavigate();
    const { id }                  = useParams();
    const [form]                  = Form.useForm();
    const [loading, setLoading]   = useState(false);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        if (id) {
            fetchGateway();
        }
    }, [id]);

    const fetchGateway = async () => {
        setFetching(true);
        try {
            const res = await getData(`/admin/delivery-gateway/${id}`);
            const data = res?.data || res;
            
            if (data) {
                form.setFieldsValue({
                    name        : data.name,
                    min_time    : data.min_time,
                    max_time    : data.max_time,
                    time_unit   : data.time_unit,
                    delivery_fee: data.delivery_fee,
                    position    : data.position,
                    status      : data.status,
                });
            } else {
                message.error('Failed to load delivery gateway data');
            }
        } catch (error) {
            console.error(error);
            message.error(error?.response?.data?.message || 'An error occurred while fetching');
        } finally {
            setFetching(false);
        }
    };

    const onFinish = async (values) => {
        try {
            setLoading(true);
            const res = await putData(`/admin/delivery-gateway/${id}`, values);
            
            if (res?.success !== false) {
                message.success('Delivery Gateway updated successfully!');
                navigate(-1);
            } else {
                message.error(res?.message || 'Failed to update delivery gateway');
            }
        } catch (error) {
            console.error(error);
            message.error(error?.response?.data?.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <Card bordered={false} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
                <Spin size="large" />
            </Card>
        );
    }

    return (
        <Card title="Edit Delivery Gateway" 
            extra={
                <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
                    Back to List
                </Button>
            }
            bordered={false}
        >
            <Form form={form} layout="vertical" onFinish={onFinish}>
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
                            Update Gateway
                        </Button>
                        <Button htmlType="button" onClick={() => fetchGateway()}>
                            Reset
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
        </Card>
    );
};

export default EditDeliveryGateway;