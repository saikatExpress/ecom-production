import { CloseOutlined, PlusOutlined, SaveOutlined } from '@ant-design/icons';
import { Button, Card, Col, Form, Input, Row, Select, Space, Spin, Upload, message } from "antd";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useTitle from "../../../hooks/useTitle";
import { getData, postData } from "../../../services/request";

const EditSubCategory = () => {
    // Hook
    useTitle("Edit Sub Category");

    // Variable
    const { id }   = useParams();
    const navigate = useNavigate();
    const [form]   = Form.useForm();

    // State
    const [loading, setLoading]       = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(false);

    // Fetch Initial Data
    useEffect(() => {
        const fetchCategories = async () => {
            setLoadingCategories(true);
            try {
                const res = await getData("/admin/category/list");
                if (res?.success) {
                    setCategories(res?.data || []);
                }
            } catch (error) {
                console.error("Error fetching categories:", error);
                message.error("Failed to load categories");
            } finally {
                setLoadingCategories(false);
            }
        };

        const fetchSubCategory = async () => {
            try {
                const res = await getData(`/admin/subcategory/${id}`);
                if (res?.success) {
                    const subCategory = res.data;
                    
                    let initialFileList = [];
                    const imageUrl = subCategory.image; 
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
                        category_id : subCategory.category_id,
                        name        : subCategory.name,
                        status      : subCategory.status,
                        image       : initialFileList
                    });
                } else {
                    message.error("Failed to load subcategory details");
                }
            } catch (error) {
                console.error(error);
                message.error("An error occurred while fetching subcategory data");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchCategories();
            fetchSubCategory();
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
            formData.append('category_id', values.category_id);
            formData.append('name', values.name);
            formData.append('status', values.status);
            
            formData.append('_method', 'PUT');
            
            if (values.image && values.image.length > 0) {
                if (values.image[0].originFileObj) {
                    formData.append('image', values.image[0].originFileObj);
                }
            }

            const res = await postData(`/admin/subcategory/${id}`, formData);
            
            if (res?.success) {
                message.success(res?.message || "Subcategory updated successfully!");
                navigate(-1);
            } else {
                message.error(res?.message || "Failed to update subcategory");
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
                    title="Edit Sub Category" 
                    extra={
                        <Space>
                            <Button icon={<CloseOutlined />} onClick={() => navigate(-1)}>
                                Cancel
                            </Button>
                            <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={submitting}>
                                Update Sub Category
                            </Button>
                        </Space>
                    }
                    bordered={false}
                >
                    <Row gutter={16}>
                        <Col xs={24} md={12}>
                            <Form.Item name="category_id" label="Parent Category" rules={[{ required: true, message: 'Please select a parent category' }]}>
                                <Select 
                                    placeholder="Select a Category" 
                                    loading={loadingCategories}
                                    showSearch
                                    optionFilterProp="children"
                                    filterOption={(input, option) =>
                                        (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                                    }
                                >
                                    {categories.map(category => (
                                        <Select.Option key={category.id} value={category.id}>
                                            {category.name}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={12}>
                            <Form.Item name="name" label="SubCategory Name" rules={[{ required: true, message: 'Please enter subcategory name' }]}>
                                <Input placeholder="e.g. Mobile Phones" />
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
                            <Form.Item name="image" label="SubCategory Image" valuePropName="fileList" getValueFromEvent={normFile}
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

export default EditSubCategory;