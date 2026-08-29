import { CloseOutlined, PlusOutlined, SaveOutlined } from '@ant-design/icons';
import { Button, Card, Col, Form, Input, InputNumber, Row, Select, Space, Upload, message } from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useTitle from "../../../hooks/useTitle";
import { postData } from "../../../services/request";

const AddPaymentGateway = () => {
    // Hook
    useTitle("Add Payment Gateway");

    // Variable
    const navigate = useNavigate();
    const [form]   = Form.useForm();

    // State
    const [submitting, setSubmitting] = useState(false);

    const normFile = (e) => {
        if (Array.isArray(e)) {
            return e;
        }
        return e?.fileList;
    };

    const onFinish = async (values) => {
        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('name', values.name);
            
            if (values.account_number) {
                formData.append('account_number', values.account_number);
            }
            
            if (values.position !== undefined && values.position !== null) {
                formData.append('position', values.position);
            }
            
            formData.append('status', values.status);
            
            if (values.image && values.image.length > 0) {
                formData.append('image', values.image[0].originFileObj);
            }

            const res = await postData("/admin/payment-gateway", formData);
            
            if (res?.success !== false) {
                message.success(res?.message || "Payment Gateway created successfully!");
                navigate(-1);
            } else {
                message.error(res?.message || "Failed to create payment gateway");
            }
        } catch (error) {
            console.error(error);
            message.error(error?.response?.data?.message || "An error occurred");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Space direction="vertical" size="large" style={{ display: 'flex', width: '100%' }}>
            <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ status: "active", position: 0 }}>
                <Card 
                    title="Add New Payment Gateway" 
                    extra={
                        <Space>
                            <Button icon={<CloseOutlined />} onClick={() => navigate(-1)}>
                                Cancel
                            </Button>
                            <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={submitting}>
                                Save Gateway
                            </Button>
                        </Space>
                    }
                    bordered={false}
                >
                    <Row gutter={16}>
                        <Col xs={24} md={12}>
                            <Form.Item name="name" label="Gateway Name" rules={[{ required: true, message: 'Please enter gateway name' }]}>
                                <Input placeholder="e.g. bKash" />
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={12}>
                            <Form.Item name="account_number" label="Account Number">
                                <Input placeholder="e.g. 01700000000" />
                            </Form.Item>
                        </Col>
                        
                        <Col xs={24} md={12}>
                            <Form.Item name="position" label="Position">
                                <InputNumber style={{ width: '100%' }} min={0} placeholder="e.g. 0" />
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={12}>
                            <Form.Item name="status" label="Status" rules={[{ required: true, message: 'Please select status' }]}>
                                <Select>
                                    <Select.Option value="active">Active</Select.Option>
                                    <Select.Option value="inactive">Inactive</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>

                        <Col xs={24}>
                            <Form.Item name="image" label="Gateway Logo / Image" valuePropName="fileList" getValueFromEvent={normFile}>
                                <Upload name="image" listType="picture-card" maxCount={1} beforeUpload={() => false} accept="image/*">
                                    <div>
                                        <PlusOutlined />
                                        <div style={{ marginTop: 8 }}>Upload</div>
                                    </div>
                                </Upload>
                            </Form.Item>
                        </Col>
                    </Row>
                </Card>
            </Form>
        </Space>
    );
};

export default AddPaymentGateway;