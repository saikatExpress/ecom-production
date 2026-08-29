import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { Button, Card, Col, Form, Input, Row, Select, Space, message } from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useTitle from "../../../hooks/useTitle";
import { postData } from "../../../services/request";

const AddBlogCategory = () => {
    // Hook
    useTitle("Add Blog Category");

    // Variable
    const navigate = useNavigate();
    const [form]   = Form.useForm();

    // State
    const [submitting, setSubmitting] = useState(false);

    const onFinish = async (values) => {
        setSubmitting(true);
        try {
            const res = await postData("/admin/blog-category", values);
            
            if (res?.success !== false) {
                message.success(res?.message || "Blog Category created successfully!");
                navigate(-1);
            } else {
                message.error(res?.message || "Failed to create blog category");
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
                    title="Add New Blog Category" 
                    extra={
                        <Space>
                            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
                                Back to List
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
                            <Form.Item name="name" label="Category Name" rules={[{ required: true, message: 'Please enter category name' }]}>
                                <Input placeholder="e.g. Shopping Guides" />
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
                            <Form.Item name="description" label="Description">
                                <Input.TextArea rows={4} placeholder="Enter category description..." />
                            </Form.Item>
                        </Col>
                    </Row>
                </Card>
            </Form>
        </Space>
    );
};

export default AddBlogCategory;