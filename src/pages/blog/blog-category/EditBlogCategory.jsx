import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { Button, Card, Col, Form, Input, Row, Select, Space, Spin, message } from "antd";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useTitle from "../../../hooks/useTitle";
import { getData, postData } from "../../../services/request";

const EditBlogCategory = () => {
    // Hook
    useTitle("Edit Blog Category");

    // Variable
    const navigate = useNavigate();
    const { id }   = useParams();
    const [form]   = Form.useForm();

    // State
    const [loading, setLoading]       = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Fetch Initial Data
    useEffect(() => {
        const fetchCategory = async () => {
            try {
                const res = await getData(`/admin/blog-category/${id}`);
                if (res?.success !== false) {
                    const category = res?.data || res;
                    form.setFieldsValue({
                        name: category.name,
                        status: category.status,
                        description: category.description
                    });
                } else {
                    message.error(res?.message || "Failed to load category details");
                }
            } catch (error) {
                console.error(error);
                message.error("An error occurred while fetching category data");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchCategory();
        }
    }, [id, form]);

    const onFinish = async (values) => {
        setSubmitting(true);
        try {
            // Using postData with _method: 'PUT' to safely spoof PUT request for Laravel
            const payload = { ...values, _method: 'PUT' };
            const res = await postData(`/admin/blog-category/${id}`, payload);
            
            if (res?.success !== false) {
                message.success(res?.message || "Blog Category updated successfully!");
                navigate(-1);
            } else {
                message.error(res?.message || "Failed to update blog category");
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
                    title="Edit Blog Category" 
                    extra={
                        <Space>
                            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
                                Back to List
                            </Button>
                            <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={submitting}>
                                Update Category
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

export default EditBlogCategory;