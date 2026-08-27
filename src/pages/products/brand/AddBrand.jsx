import { CloseOutlined, PlusOutlined, SaveOutlined } from '@ant-design/icons';
import { Button, Card, Col, Form, Input, Row, Select, Space, Upload, message } from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useTitle from "../../../hooks/useTitle";
import { postData } from "../../../services/request";

const AddBrand = () => {
    // Hook
    useTitle("Add Brand");

    // Variable
    const navigate = useNavigate();
    const [form]   = Form.useForm();

    // State
    const [submitting, setSubmitting] = useState(false);

    // Normalize file input for Ant Design Upload
    const normFile = (e) => {
        if (Array.isArray(e)) {
            return e;
        }
        return e?.fileList;
    };

    const onFinish = async (values) => {
        setSubmitting(true);
        try {
            // Use FormData for file upload support
            const formData = new FormData();
            formData.append('name', values.name);
            formData.append('status', values.status);
            
            if (values.image && values.image.length > 0) {
                formData.append('image', values.image[0].originFileObj);
            }

            const res = await postData("/admin/brand", formData);
            
            if (res?.success) {
                message.success(res?.message || "Brand created successfully!");
                navigate(-1);
            } else {
                message.error(res?.message || "Failed to create brand");
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
            <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ status: "active" }}>
                <Card 
                    title="Add New Brand" 
                    extra={
                        <Space>
                            <Button icon={<CloseOutlined />} onClick={() => navigate(-1)}>
                                Cancel
                            </Button>
                            <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={submitting}>
                                Save Brand
                            </Button>
                        </Space>
                    }
                    bordered={false}
                >
                    <Row gutter={16}>
                        <Col xs={24} md={12}>
                            <Form.Item name="name" label="Brand Name" rules={[{ required: true, message: 'Please enter brand name' }]}>
                                <Input placeholder="e.g. Samsung" />
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
                            <Form.Item name="image" label="Brand Logo / Image" valuePropName="fileList" getValueFromEvent={normFile}>
                                <Upload 
                                    name="image"
                                    listType="picture-card"
                                    maxCount={1}
                                    beforeUpload={() => false}
                                    accept="image/*"
                                >
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

export default AddBrand;