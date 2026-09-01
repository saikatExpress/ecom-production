import { ArrowLeftOutlined, DeleteOutlined, PlusOutlined, SearchOutlined, UploadOutlined } from "@ant-design/icons";
import { Avatar, Breadcrumb, Button, Card, Col, Empty, Form, Input, InputNumber, List, message, Radio, Row, Select, Space, Spin, Tag, Tooltip, Typography, Upload } from "antd";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useTitle from "../../../hooks/useTitle";
import { getDatas, postData } from "../../../services/request";

const { Title, Text } = Typography;

const EditSection = () => {
    // Hook
    useTitle("Edit Section");

    // Variable
    const { id }        = useParams();
    const navigate      = useNavigate();
    const [form]        = Form.useForm();
    const selectionType = Form.useWatch('selection_type', form);

    // States
    const [loading, setLoading]           = useState(false);
    const [fetchingData, setFetchingData] = useState(true);
    const [fileList, setFileList]         = useState([]);
    
    // Categories state
    const [categories, setCategories]                 = useState([]);
    const [fetchingCategories, setFetchingCategories] = useState(false);
    
    // Products state
    const [products, setProducts]                 = useState([]);
    const [fetchingProducts, setFetchingProducts] = useState(false);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [searchQuery, setSearchQuery]           = useState("");
    
    const debounceTimer = useRef(null);

    // Fetch initial data
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const response = await getDatas(`/admin/section/${id}`);
                if (response?.success && response?.data) {
                    const data = response.data;
                    form.setFieldsValue({
                        name          : data.name,
                        link          : data.link,
                        is_slider     : data.is_slider,
                        position      : data.position,
                        status        : data.status,
                        selection_type: 'product',
                        product_ids   : data.products?.map(p => p.id) || []
                    });
                    
                    if (data.image) {
                        setFileList([{
                            uid: '-1',
                            name: 'image.jpg',
                            status: 'done',
                            url: data.image
                        }]);
                    }
                    
                    if (data.products) {
                        setSelectedProducts(data.products);
                    }
                } else {
                    message.error("Failed to load section data");
                    navigate("/section");
                }
            } catch (error) {
                console.error("Error loading section:", error);
                message.error("Failed to load section data");
                navigate("/section");
            } finally {
                setFetchingData(false);
            }
        };

        if (id) {
            fetchInitialData();
        }
    }, [id, form, navigate]);

    const fetchCategories = async () => {
        setFetchingCategories(true);
        try {
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

    const handleProductSearch = (e) => {
        const value = e.target ? e.target.value : e;
        setSearchQuery(value);
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }
        debounceTimer.current = setTimeout(() => {
            searchProducts(value);
        }, 500);
    };

    const handleAddProduct = (product) => {
        if (!selectedProducts.find(p => p.id === product.id)) {
            const newSelected = [...selectedProducts, product];
            setSelectedProducts(newSelected);
            form.setFieldsValue({ product_ids: newSelected.map(p => p.id) });
        }
    };

    const handleRemoveProduct = (productId) => {
        const newSelected = selectedProducts.filter(p => p.id !== productId);
        setSelectedProducts(newSelected);
        form.setFieldsValue({ product_ids: newSelected.map(p => p.id) });
    };

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("_method", "PUT"); // Laravel method spoofing for PUT with FormData
            formData.append("name", values.name);
            if (values.link) formData.append("link", values.link);
            formData.append("is_slider", values.is_slider);
            formData.append("status", values.status);
            if (values.position !== undefined) {
                formData.append("position", values.position);
            }

            if (fileList.length > 0 && fileList[0].originFileObj) {
                formData.append("image", fileList[0].originFileObj);
            }

            const currentProductIds = form.getFieldValue("product_ids") || [];
            if (currentProductIds.length > 0) {
                currentProductIds.forEach(pid => formData.append("product_ids[]", pid));
            }

            if (values.selection_type === 'category' && values.category_ids) {
                values.category_ids.forEach(cid => formData.append("category_ids[]", cid));
            }

            const response = await postData(`/admin/section/${id}`, formData);

            if (response?.success !== false) {
                message.success(response?.message || "Section updated successfully");
                navigate("/section");
            } else {
                message.error(response?.message || "Failed to update section");
            }
        } catch (error) {
            console.error("Failed to update section:", error);
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
        return false;
    };

    if (fetchingData) {
        return (
            <div style={{ textAlign: 'center', padding: '50px 0' }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div>
            <Breadcrumb
                items={[
                    { title: "CMS" },
                    { title: "Section" },
                    { title: "Edit Section" },
                ]}
                style={{ marginBottom: 16 }}
            />

            <Card
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} />
                        <Title level={4} style={{ margin: 0 }}>Edit Section</Title>
                    </div>
                }
            >
                <Form form={form} layout="vertical" onFinish={onFinish}>
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
                                    <Col span={8}>
                                        <Form.Item label="Position" name="position" rules={[{ required: true, message: "Please enter position" }]}>
                                            <InputNumber min={1} style={{ width: '100%' }} />
                                        </Form.Item>
                                    </Col>
                                    <Col span={8}>
                                        <Form.Item label="Is Slider?" name="is_slider" rules={[{ required: true, message: "Please select if it is a slider" }]}>
                                            <Select>
                                                <Select.Option value={1}>Yes</Select.Option>
                                                <Select.Option value={0}>No</Select.Option>
                                            </Select>
                                        </Form.Item>
                                    </Col>

                                    <Col span={8}>
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
                                            placeholder="Select categories to append to this section"
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
                                    <>
                                        <Form.Item name="product_ids" noStyle>
                                            <Select mode="multiple" style={{ display: 'none' }} />
                                        </Form.Item>
                                        
                                        <div style={{ marginBottom: 24 }}>
                                            <Text strong style={{ display: 'block', marginBottom: 8 }}>Search & Select Products</Text>
                                            <Input 
                                                placeholder="Search products by name or SKU..." 
                                                prefix={<SearchOutlined />} 
                                                onChange={handleProductSearch} 
                                                allowClear
                                            />
                                            {searchQuery && (
                                                <div style={{ maxHeight: 300, overflowY: 'auto', border: '1px solid #d9d9d9', borderRadius: 6, padding: 8, marginTop: 8 }}>
                                                    {fetchingProducts ? (
                                                        <div style={{ textAlign: 'center', padding: 16 }}><Spin /></div>
                                                    ) : products.length > 0 ? (
                                                        <List
                                                            itemLayout="horizontal"
                                                            dataSource={products}
                                                            renderItem={(item) => (
                                                                <List.Item
                                                                    key={item.id}
                                                                    actions={[
                                                                        <Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => handleAddProduct(item)} disabled={selectedProducts.some(p => p.id === item.id)}>
                                                                            Add
                                                                        </Button>
                                                                    ]}
                                                                >
                                                                    <List.Item.Meta
                                                                        avatar={<Avatar src={item.image} shape="square" size={50} />}
                                                                        title={item.name}
                                                                        description={
                                                                            <Space size="small" wrap>
                                                                                <Text type="secondary">SKU: {item.sku}</Text>
                                                                                <Text type="secondary">|</Text>
                                                                                <Text strong type="success">${item.offer_price || item.sell_price}</Text>
                                                                                {item.category && <Tag color="blue">{item.category.name}</Tag>}
                                                                                <Tag color="orange">Stock: {item.current_stock}</Tag>
                                                                            </Space>
                                                                        }
                                                                    />
                                                                </List.Item>
                                                            )}
                                                        />
                                                    ) : (
                                                        <Empty description="No products found" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                                                    )}
                                                </div>
                                            )}

                                            {selectedProducts.length > 0 && (
                                                <div style={{ marginTop: 16 }}>
                                                    <Text strong>Selected Products ({selectedProducts.length})</Text>
                                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginTop: 8 }}>
                                                        {selectedProducts.map(item => (
                                                            <Card 
                                                                key={item.id} 
                                                                size="small" 
                                                                hoverable
                                                                cover={<div style={{ height: 120, overflow: 'hidden' }}><img alt={item.name} src={item.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>}
                                                                actions={[
                                                                    <Tooltip title="Remove Product">
                                                                        <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleRemoveProduct(item.id)} />
                                                                    </Tooltip>
                                                                ]}
                                                                bodyStyle={{ padding: 12 }}
                                                            >
                                                                <Card.Meta 
                                                                    title={<span style={{ fontSize: 13, whiteSpace: 'normal', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.2' }}>{item.name}</span>}
                                                                    description={<Text strong type="success">${item.offer_price || item.sell_price}</Text>} 
                                                                />
                                                            </Card>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </>
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
                            Update Section
                        </Button>
                    </div>
                </Form>
            </Card>
        </div>
    );
};

export default EditSection;