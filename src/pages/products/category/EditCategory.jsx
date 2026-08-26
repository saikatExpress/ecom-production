import { CloseOutlined, PlusOutlined, SaveOutlined } from '@ant-design/icons';
import { Button, Card, Col, Form, Input, InputNumber, Row, Select, Space, Spin, Upload, message } from "antd";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useTitle from "../../../hooks/useTitle";
import { getData, postData } from "../../../services/request";

const EditCategory = () => {
    // Hook
    useTitle("Edit Category");
    const { id } = useParams();
    const navigate = useNavigate();
    const [form] = Form.useForm();

    // State
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchCategory = async () => {
            try {
                const res = await getData(`/admin/category/${id}`);
                if (res?.success) {
                    const category = res.data;
                    
                    let initialFileList = [];
                    // Check for img_url or img_path based on your backend response format
                    const imageUrl = category.img_url || category.img_path; 
                    if (imageUrl) {
                        initialFileList = [
                            {
                                uid: '-1',
                                name: 'Existing Image',
                                status: 'done',
                                url: imageUrl, // Full URL preferred if backend appends domain
                            }
                        ];
                    }

                    form.setFieldsValue({
                        name: category.name,
                        position: category.position,
                        status: category.status,
                        image: initialFileList
                    });
                } else {
                    message.error("Failed to load category details");
                }
            } catch (error) {
                console.error(error);
                message.error("An error occurred while fetching data");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchCategory();
        }
    }, [id, form]);

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
            const formData = new FormData();
            formData.append('name', values.name);
            formData.append('position', values.position || 0);
            formData.append('status', values.status);
            
            // In Laravel, PUT requests with FormData (file uploads) require method spoofing
            formData.append('_method', 'PUT');
            
            // Append the new image file if it was uploaded
            if (values.image && values.image.length > 0) {
                // originFileObj only exists for newly selected files, not for our initial fake file list
                if (values.image[0].originFileObj) {
                    formData.append('image', values.image[0].originFileObj);
                }
            }

            // We use postData instead of putData because of the multipart/form-data + Laravel restriction
            const res = await postData(`/admin/category/${id}`, formData);
            
            if (res?.success) {
                message.success(res?.message || "Category updated successfully!");
                navigate(-1);
            } else {
                message.error(res?.message || "Failed to update category");
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
            <Form 
                form={form} 
                layout="vertical" 
                onFinish={onFinish}
            >
                <Card 
                    title="Edit Category" 
                    extra={
                        <Space>
                            <Button icon={<CloseOutlined />} onClick={() => navigate(-1)}>
                                Cancel
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
                                extra="Recommended size: 400x400px. Max size: 2MB. Leave unchanged to keep the existing image."
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

export default EditCategory;