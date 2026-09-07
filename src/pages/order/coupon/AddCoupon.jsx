import { ArrowLeftOutlined, DeleteOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { Avatar, Breadcrumb, Button, Card, Col, DatePicker, Empty, Form, Input, InputNumber, List, Row, Select, Space, Spin, Tag, Tooltip, Typography, message } from "antd";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import useTitle from "../../../hooks/useTitle";
import { getDatas, postData } from "../../../services/request";
import { handleFormErrors } from './../../../utils/formUtils';

const { Title, Text } = Typography;

const AddCoupon = () => {
    // Hook
    useTitle("Add Coupon");

    // Variable
    const navigate   = useNavigate();
    const [form]     = Form.useForm();
    const applyScope = Form.useWatch("apply_scope", form);

    // States
    const [loading, setLoading] = useState(false);

    // Categories state
    const [categories, setCategories]                 = useState([]);
    const [fetchingCategories, setFetchingCategories] = useState(false);

    // Products state
    const [products, setProducts]                 = useState([]);
    const [fetchingProducts, setFetchingProducts] = useState(false);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [searchQuery, setSearchQuery]           = useState("");

    const debounceTimer = useRef(null);

    const fetchCategories = async () => {
        setFetchingCategories(true);
        try {
            const response = await getDatas("/admin/category/list");
            if (response?.success && response?.data) {
                setCategories(response.data);
            } else if (Array.isArray(response)) {
                setCategories(response);
            }
        } catch (error) {
            console.error("Failed to fetch categories:", error);
            message.error("Failed to fetch categories.");
        } finally {
            setFetchingCategories(false);
        }
    };

    useEffect(() => {
        if (applyScope === "selected_categories" && categories.length === 0) {
            fetchCategories();
        }
    }, [applyScope, categories.length]);

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
        if (!selectedProducts.find((p) => p.id === product.id)) {
            const newSelected = [...selectedProducts, product];
            setSelectedProducts(newSelected);
            form.setFieldsValue({ product_ids: newSelected.map((p) => p.id) });
        }
    };

    const handleRemoveProduct = (productId) => {
        const newSelected = selectedProducts.filter((p) => p.id !== productId);
        setSelectedProducts(newSelected);
        form.setFieldsValue({ product_ids: newSelected.map((p) => p.id) });
    };

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const payload = {
                ...values,
                starts_at: values.starts_at ? values.starts_at.format("YYYY-MM-DD HH:mm:ss") : null,
                expires_at: values.expires_at ? values.expires_at.format("YYYY-MM-DD HH:mm:ss") : null,
            };

            const response = await postData("/admin/coupon", payload);

            if (response?.success !== false) {
                message.success(response?.message || "Coupon added successfully");
                navigate("/coupons"); // Or /coupon based on route config, using /coupons or go back
                navigate(-1);
            } else {
                message.error(response?.message || "Failed to add coupon");
            }
        } catch (error) {
            console.error("Failed to add coupon:", error);
            message.error(error?.response?.data?.message || "An error occurred");
            handleFormErrors(error, form, message.error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <Breadcrumb
                items={[
                    { title: "Dashboard" },
                    { title: "Order" },
                    { title: "Coupons" },
                    { title: "Add Coupon" },
                ]}
                style={{ marginBottom: 16 }}
            />

            <Card
                title={
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/coupons', {
                            state: {fromPage: 'Add Coupon Page', fromAction: 'Click "Back Icon" in this form'}
                        })} />
                        <Title level={4} style={{ margin: 0 }}>Add New Coupon</Title>
                    </div>
                }
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    initialValues={{
                        status: "active",
                        discount_type: "percentage",
                        apply_scope: "all_products",
                    }}
                >
                    <Row gutter={24}>
                        <Col span={24} md={12}>
                            <Card type="inner" title="Basic Information" style={{ marginBottom: 16 }}>
                                <Form.Item label="Coupon Code" name="code" rules={[{ required: true, message: "Please enter coupon code" }]}>
                                    <Input placeholder="e.g. SUMMER50" style={{ textTransform: "uppercase" }} />
                                </Form.Item>

                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item label="Discount Type" name="discount_type">
                                            <Select>
                                                <Select.Option value="percentage">Percentage (%)</Select.Option>
                                                <Select.Option value="fixed">Fixed Amount</Select.Option>
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item label="Discount Value" name="discount_value" rules={[{ required: true, message: "Enter discount value" }]}>
                                            <InputNumber min={0} step={0.01} style={{ width: "100%" }} placeholder="e.g. 50" />
                                        </Form.Item>
                                    </Col>
                                </Row>

                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item label="Starts At" name="starts_at" rules={[{ required: true, message: "Select start date" }]}>
                                            <DatePicker showTime style={{ width: "100%" }} />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item label="Expires At" name="expires_at" rules={[{ required: true, message: "Select expiry date" }]}>
                                            <DatePicker showTime style={{ width: "100%" }} />
                                        </Form.Item>
                                    </Col>
                                </Row>

                                <Form.Item label="Status" name="status" rules={[{ required: true }]}>
                                    <Select>
                                        <Select.Option value="active">Active</Select.Option>
                                        <Select.Option value="inactive">Inactive</Select.Option>
                                    </Select>
                                </Form.Item>
                            </Card>

                            <Card type="inner" title="Limits & Restrictions">
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item label="Minimum Order Amount" name="min_order_amount">
                                            <InputNumber min={0} step={0.01} style={{ width: "100%" }} placeholder="0" />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item label="Maximum Discount Amount" name="max_discount_amount" tooltip="Leave empty for no maximum (useful for percentage)">
                                            <InputNumber min={0} step={0.01} style={{ width: "100%" }} placeholder="Optional" />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item label="Total Usage Limit" name="usage_limit" tooltip="Total number of times this coupon can be used by all users combined">
                                            <InputNumber min={1} style={{ width: "100%" }} placeholder="e.g. 1000" />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item label="Per Phone Limit" name="per_phone_limit" tooltip="Number of times a single user (phone number) can use this coupon">
                                            <InputNumber min={1} style={{ width: "100%" }} placeholder="e.g. 1" />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Card>
                        </Col>

                        <Col span={24} md={12}>
                            <Card type="inner" title="Apply Scope">
                                <Form.Item name="apply_scope" label="Select Scope">
                                    <Select>
                                        <Select.Option value="all_products">All Products</Select.Option>
                                        <Select.Option value="selected_categories">Selected Categories</Select.Option>
                                        <Select.Option value="selected_products">Selected Products</Select.Option>
                                    </Select>
                                </Form.Item>

                                {applyScope === "selected_categories" && (
                                    <Form.Item label="Categories" name="category_ids" rules={[{ required: true, message: "Please select at least one category" }]}>
                                        <Select
                                            mode="multiple"
                                            placeholder="Select categories"
                                            loading={fetchingCategories}
                                            options={categories.map((cat) => ({
                                                label: cat.name,
                                                value: cat.id,
                                            }))}
                                            showSearch
                                            filterOption={(input, option) =>
                                                (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                                            }
                                        />
                                    </Form.Item>
                                )}

                                {applyScope === "selected_products" && (
                                    <>
                                        <Form.Item name="product_ids" rules={[{ required: true, message: "Please select at least one product" }]} noStyle>
                                            <Select mode="multiple" style={{ display: "none" }} />
                                        </Form.Item>

                                        <div style={{ marginBottom: 24 }}>
                                            <Text strong style={{ display: "block", marginBottom: 8 }}>Search & Select Products</Text>
                                            <Input
                                                placeholder="Search products by name or SKU..."
                                                prefix={<SearchOutlined />}
                                                onChange={handleProductSearch}
                                                allowClear
                                            />
                                            {searchQuery && (
                                                <div style={{ maxHeight: 300, overflowY: "auto", border: "1px solid #d9d9d9", borderRadius: 6, padding: 8, marginTop: 8 }}>
                                                    {fetchingProducts ? (
                                                        <div style={{ textAlign: "center", padding: 16 }}><Spin /></div>
                                                    ) : products.length > 0 ? (
                                                        <List
                                                            itemLayout="horizontal"
                                                            dataSource={products}
                                                            renderItem={(item) => (
                                                                <List.Item
                                                                    key={item.id}
                                                                    actions={[
                                                                        <Button
                                                                            type="primary"
                                                                            size="small"
                                                                            icon={<PlusOutlined />}
                                                                            onClick={() => handleAddProduct(item)}
                                                                            disabled={selectedProducts.some((p) => p.id === item.id)}
                                                                        >
                                                                            Add
                                                                        </Button>,
                                                                    ]}
                                                                >
                                                                    <List.Item.Meta
                                                                        avatar={<Avatar src={item.image} shape="square" size={50} />}
                                                                        title={item.name}
                                                                        description={
                                                                            <Space size="small" wrap>
                                                                                <Text strong type="success">৳{item.offer_price || item.sell_price}</Text>
                                                                                {item.category && <Tag color="blue">{item.category.name}</Tag>}
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
                                                    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8, maxHeight: 400, overflowY: "auto" }}>
                                                        {selectedProducts.map((item) => (
                                                            <Card
                                                                key={item.id}
                                                                size="small"
                                                                bodyStyle={{ padding: "8px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}
                                                            >
                                                                <Space>
                                                                    <Avatar src={item.image} shape="square" size={40} />
                                                                    <div>
                                                                        <div style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.2 }}>{item.name}</div>
                                                                        <Text type="success" strong style={{ fontSize: 12 }}>৳{item.offer_price || item.sell_price}</Text>
                                                                    </div>
                                                                </Space>
                                                                <Tooltip title="Remove Product">
                                                                    <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleRemoveProduct(item.id)} />
                                                                </Tooltip>
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
                    </Row>

                    <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end", gap: 12 }}>
                        <Button onClick={() => navigate(-1)}>Cancel</Button>
                        <Button type="primary" htmlType="submit" loading={loading}>
                            Save Coupon
                        </Button>
                    </div>
                </Form>
            </Card>
        </div>
    );
};

export default AddCoupon;