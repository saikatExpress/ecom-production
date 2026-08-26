import { CloseOutlined, PlusOutlined, SaveOutlined } from '@ant-design/icons';
import { Button, Card, Col, Form, Input, InputNumber, Row, Select, Space, Upload, message } from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useTitle from "../../../hooks/useTitle";
import { postData } from "../../../services/request";

const AddCategory = () => {
    // Hook
    useTitle("Create Category");
    const navigate = useNavigate();
    const [form] = Form.useForm();

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
            formData.append('position', values.position || 0);
            formData.append('status', values.status);
            
            // Append the image file if it was uploaded
            if (values.image && values.image.length > 0) {
                // originFileObj contains the actual File object
                formData.append('image', values.image[0].originFileObj);
            }

            const res = await postData("/admin/category", formData);
            
            if (res?.success) {
                message.success(res?.message || "Category created successfully!");
                navigate(-1);
            } else {
                message.error(res?.message || "Failed to create category");
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
            <Form 
                form={form} 
                layout="vertical" 
                onFinish={onFinish}
                initialValues={{ status: 1, position: 0 }}
            >
                <Card 
                    title="Create New Category" 
                    extra={
                        <Space>
                            <Button icon={<CloseOutlined />} onClick={() => navigate(-1)}>
                                Cancel
                            </Button>
                            <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={submitting}>
                                Save Category
                            </Button>
                        </Space>
                    }
                    bordered={false}
                >
                    <Row gutter={16}>
                        <Col xs={24} md={12}>
                            <Form.Item 
                                name="name" 
                                label="Category Name" 
                                rules={[{ required: true, message: 'Please enter category name' }]}
                            >
                                <Input placeholder="e.g. Electronics" />
                            </Form.Item>
                        </Col>
                        
                        <Col xs={24} md={12}>
                            <Form.Item 
                                name="status" 
                                label="Status" 
                                rules={[{ required: true, message: 'Please select status' }]}
                            >
                                <Select>
                                    <Select.Option value={1}>Active</Select.Option>
                                    <Select.Option value={0}>Inactive</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={12}>
                            <Form.Item 
                                name="position" 
                                label="Position / Order" 
                                rules={[{ required: true, message: 'Please enter position' }]}
                                help="Determines the display order of the category"
                            >
                                <InputNumber style={{ width: '100%' }} min={0} placeholder="e.g. 1" />
                            </Form.Item>
                        </Col>

                        <Col xs={24}>
                            <Form.Item 
                                name="image" 
                                label="Category Image"
                                valuePropName="fileList"
                                getValueFromEvent={normFile}
                            >
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

export default AddCategory;