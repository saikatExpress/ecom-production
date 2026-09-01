import { ArrowLeftOutlined, UploadOutlined } from "@ant-design/icons";
import { Breadcrumb, Button, Card, Col, Form, Input, message, Row, Select, Typography, Upload, Radio, Spin } from "antd";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useTitle from "../../../hooks/useTitle";
import { postData, getDatas } from "../../../services/request";

const { Title } = Typography;

const AddSection = () => {
    // Hook
    useTitle("Add Section");

    // Variable
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const selectionType = Form.useWatch('selection_type', form);

    // States
    const [loading, setLoading] = useState(false);
    const [fileList, setFileList] = useState([]);
    
    // Categories state
    const [categories, setCategories] = useState([]);
    const [fetchingCategories, setFetchingCategories] = useState(false);
    
    // Products state
    const [products, setProducts] = useState([]);
    const [fetchingProducts, setFetchingProducts] = useState(false);
    
    const debounceTimer = useRef(null);

    const fetchCategories = async () => {
        setFetchingCategories(true);
        try {
            // Using the standard category list endpoint
            const response = await getDatas("/admin/category/list");
            if (response?.success && response?.data) {
                setCategories(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch categories:", error);
            message.error("Failed to fetch categories.");
        } finally {
            setFetchingCategories(false);
        }
    };

    useEffect(() => {
        if (selectionType === 'category' && categories.length === 0) {
            fetchCategories();
        }
    }, [selectionType, categories.length]);

    const searchProducts = async (value) => {
        if (!value) {
            setProducts([]);
            return;
        }
        setFetchingProducts(true);
        try {
            const response = await getDatas("/admin/product/search", { search_key: value });
            if (response?.success && response?.data) {
                setProducts(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch products:", error);
        } finally {
            setFetchingProducts(false);
        }
    };

    const handleProductSearch = (value) => {
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }
        debounceTimer.current = setTimeout(() => {
            searchProducts(value);
        }, 500);
    };

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("name", values.name);
            if (values.link) formData.append("link", values.link);
            formData.append("is_slider", values.is_slider);
            formData.append("status", values.status);

            if (fileList.length > 0) {
                formData.append("image", fileList[0].originFileObj);
            }

            if (values.selection_type === 'category' && values.category_ids) {
                values.category_ids.forEach(id => formData.append("category_ids[]", id));
            } else if (values.selection_type === 'product' && values.product_ids) {
                values.product_ids.forEach(id => formData.append("product_ids[]", id));
            }

            const response = await postData("/admin/section", formData);

            if (response?.success !== false) {
                message.success(response?.message || "Section added successfully");
                navigate("/section");
            } else {
                message.error(response?.message || "Failed to add section");
            }
        } catch (error) {
            console.error("Failed to add section:", error);
            message.error(error?.response?.data?.message || "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = ({ fileList: newFileList }) => {
        setFileList(newFileList);
    };

    const beforeUpload = (file) => {
        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/webp';
        if (!isJpgOrPng) {
            message.error('You can only upload JPG/PNG/WEBP file!');
        }
        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
            message.error('Image must smaller than 2MB!');
        }
        return false; // Prevent automatic upload
    };

    return (
        <div>
            <Breadcrumb
                items={[
                    { title: "CMS" },
                    { title: "Section" },
                    { title: "Add Section" },
                ]}
                style={{ marginBottom: 16 }}
            />

            <Card
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} />
                        <Title level={4} style={{ margin: 0 }}>Add New Section</Title>
                    </div>
                }
            >
                <Form 
                    form={form} 
                    layout="vertical" 
                    onFinish={onFinish} 
                    initialValues={{ 
                        status: "active", 
                        is_slider: 0,
                        selection_type: 'category' 
                    }}
                >
                    <Row gutter={24}>
                        <Col span={24} md={16}>
                            <Card type="inner" title="Basic Information" style={{ marginBottom: 16 }}>
                                <Form.Item label="Name" name="name" rules={[{ required: true, message: "Please enter section name" }]}>
                                    <Input placeholder="Enter section name (e.g. Best Selling)" />
                                </Form.Item>

                                <Form.Item label="Link URL" name="link">
                                    <Input placeholder="Enter redirect link (optional)" />
                                </Form.Item>

                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item label="Is Slider?" name="is_slider" rules={[{ required: true, message: "Please select if it is a slider" }]}>
                                            <Select>
                                                <Select.Option value={1}>Yes</Select.Option>
                                                <Select.Option value={0}>No</Select.Option>
                                            </Select>
                                        </Form.Item>
                                    </Col>

                                    <Col span={12}>
                                        <Form.Item label="Status" name="status" rules={[{ required: true, message: "Please select status" }]}>
                                            <Select>
                                                <Select.Option value="active">Active</Select.Option>
                                                <Select.Option value="inactive">Inactive</Select.Option>
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Card>
                            
                            <Card type="inner" title="Product Selection Option">
                                <Form.Item name="selection_type" label="Choose Selection Type">
                                    <Radio.Group>
                                        <Radio value="category">Select Category</Radio>
                                        <Radio value="product">Search Products</Radio>
                                    </Radio.Group>
                                </Form.Item>

                                {selectionType === 'category' && (
                                    <Form.Item label="Categories" name="category_ids" rules={[{ required: true, message: 'Please select at least one category' }]}>
                                        <Select
                                            mode="multiple"
                                            placeholder="Select categories"
                                            loading={fetchingCategories}
                                            options={categories.map(cat => ({
                                                label: cat.name,
                                                value: cat.id
                                            }))}
                                            showSearch
                                            filterOption={(input, option) =>
                                                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                            }
                                        />
                                    </Form.Item>
                                )}

                                {selectionType === 'product' && (
                                    <Form.Item label="Products" name="product_ids" rules={[{ required: true, message: 'Please select at least one product' }]}>
                                        <Select
                                            mode="multiple"
                                            placeholder="Search and select products"
                                            showSearch
                                            filterOption={false}
                                            onSearch={handleProductSearch}
                                            loading={fetchingProducts}
                                            notFoundContent={fetchingProducts ? <Spin size="small" /> : null}
                                            options={products.map(prod => ({
                                                label: prod.name,
                                                value: prod.id
                                            }))}
                                        />
                                    </Form.Item>
                                )}
                            </Card>
                        </Col>

                        <Col span={24} md={8}>
                            <Card type="inner" title="Section Image">
                                <Form.Item label="Upload Image" name="image">
                                    <Upload
                                        listType="picture-card"
                                        fileList={fileList}
                                        onChange={handleFileChange}
                                        beforeUpload={beforeUpload}
                                        maxCount={1}
                                        accept="image/png, image/jpeg, image/webp"
                                    >
                                        {fileList.length < 1 && (
                                            <div>
                                                <UploadOutlined />
                                                <div style={{ marginTop: 8 }}>Upload</div>
                                            </div>
                                        )}
                                    </Upload>
                                </Form.Item>
                            </Card>
                        </Col>
                    </Row>

                    <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                        <Button onClick={() => navigate(-1)}>
                            Cancel
                        </Button>
                        <Button type="primary" htmlType="submit" loading={loading}>
                            Save Section
                        </Button>
                    </div>
                </Form>
            </Card>
        </div>
    );
};

export default AddSection;