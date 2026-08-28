import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { Button, Card, Col, ColorPicker, Form, Input, Row, Select, Space, Spin, message } from "antd";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useTitle from "../../../hooks/useTitle";
import { getData, putData } from "../../../services/request";

const EditOrderSource = () => {
    // Hook
    useTitle("Edit Order Source");

    // Variable
    const navigate = useNavigate();
    const { id }   = useParams();
    const [form]   = Form.useForm();

    // States
    const [loading, setLoading]   = useState(false);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        if (id) {
            fetchOrderSource();
        }
    }, [id]);

    const fetchOrderSource = async () => {
        setFetching(true);
        try {
            const res = await getData(`/admin/order-source/${id}`);
            const data = res?.data || res;
            
            if (data) {
                form.setFieldsValue({
                    name: data.name,
                    color_code: data.color_code,
                    status: data.status,
                });
            } else {
                message.error('Failed to load order source data');
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
            
            // Extract hex code from color picker object
            const colorCode = typeof values.color_code === 'string' 
                ? values.color_code 
                : values.color_code?.toHexString?.() || values.color_code;
                
            const payload = {
                name: values.name,
                status: values.status,
                color_code: colorCode,
            };

            const res = await putData(`/admin/order-source/${id}`, payload);
            
            if (res?.success || res?.id || res?.name) { 
                message.success('Order Source updated successfully!');
                navigate(-1);
            } else {
                message.error(res?.message || 'Failed to update order source');
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
        <Card title="Edit Order Source" 
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
                            Update Order Source
                        </Button>
                        <Button htmlType="button" onClick={() => fetchOrderSource()}>
                            Reset
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
        </Card>
    );
};

export default EditOrderSource;