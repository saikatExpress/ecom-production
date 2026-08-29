import { CloseOutlined, PlusOutlined, SaveOutlined } from '@ant-design/icons';
import { Button, Card, Col, Form, Input, InputNumber, Row, Select, Space, Spin, Upload, message } from "antd";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useTitle from "../../../hooks/useTitle";
import { getData, postData } from "../../../services/request";

const EditPaymentGateway = () => {
    // Hook
    useTitle("Edit Payment Gateway");

    // Variable
    const { id }   = useParams();
    const navigate = useNavigate();
    const [form]   = Form.useForm();

    // State
    const [loading, setLoading]       = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Fetch Initial Data
    useEffect(() => {
        const fetchPaymentGateway = async () => {
            try {
                const res = await getData(`/admin/payment-gateway/${id}`);
                if (res?.success !== false) {
                    const paymentGateway = res?.data || res;
                    
                    let initialFileList = [];
                    const imageUrl = paymentGateway.img_url || paymentGateway.img_path || paymentGateway.image; 
                    if (imageUrl) {
                        initialFileList = [
                            {
                                uid: '-1',
                                name: 'Existing Image',
                                status: 'done',
                                url: imageUrl,
                            }
                        ];
                    }

                    form.setFieldsValue({
                        name           : paymentGateway.name,
                        account_number : paymentGateway.account_number,
                        position       : paymentGateway.position,
                        status         : paymentGateway.status,
                        image          : initialFileList
                    });
                } else {
                    message.error(res?.message || "Failed to load payment gateway details");
                }
            } catch (error) {
                console.error(error);
                message.error("An error occurred while fetching payment gateway data");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchPaymentGateway();
        }
    }, [id, form]);

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
            
            formData.append('_method', 'PUT');
            
            if (values.image && values.image.length > 0) {
                if (values.image[0].originFileObj) {
                    formData.append('image', values.image[0].originFileObj);
                }
            }

            const res = await postData(`/admin/payment-gateway/${id}`, formData);
            
            if (res?.success !== false) {
                message.success(res?.message || "Payment Gateway updated successfully!");
                navigate(-1);
            } else {
                message.error(res?.message || "Failed to update payment gateway");
            }
        } catch (error) {
            console.error(error);
            message.error(error?.response?.data?.message || "An error occurred");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '100px 0' }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <Space direction="vertical" size="large" style={{ display: 'flex', width: '100%' }}>
            <Form form={form} layout="vertical" onFinish={onFinish}>
                <Card 
                    title="Edit Payment Gateway" 
                    extra={
                        <Space>
                            <Button icon={<CloseOutlined />} onClick={() => navigate(-1)}>
                                Cancel
                            </Button>
                            <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={submitting}>
                                Update Gateway
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
                            <Form.Item name="image" label="Gateway Logo / Image" valuePropName="fileList" getValueFromEvent={normFile}
                                extra="Leave unchanged to keep the existing image."
                            >
                                <Upload name="image" listType="picture-card" maxCount={1} beforeUpload={() => false} accept="image/*">
                                    <div>
                                        <PlusOutlined />
                                        <div style={{ marginTop: 8 }}>Upload New</div>
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

export default EditPaymentGateway;