import { ArrowLeftOutlined, DollarOutlined, FileTextOutlined, MinusCircleOutlined, PhoneOutlined, PlusOutlined, SaveOutlined, SettingOutlined, ShoppingCartOutlined, UserOutlined } from "@ant-design/icons";
import { Affix, Breadcrumb, Button, Card, Col, Divider, Flex, Form, Input, InputNumber, Row, Select, Tag, Tooltip, Typography, message } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useTitle from "../../hooks/useTitle";
import { getDatas, postData } from "../../services/request";
import { handleFormErrors } from "../../utils/formUtils";

const { Title, Text } = Typography;

const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : ((r & 0x3) | 0x8);
        return v.toString(16);
    });
};

const SectionHeader = ({ icon, title, subtitle, color = '#667eea' }) => (
    <Flex align="center" gap={12}>
        <div style={{
            width         : 36,
            height        : 36,
            borderRadius  : 10,
            background    : `linear-gradient(135deg, ${color}, ${color}dd)`,
            display       : 'flex',
            alignItems    : 'center',
            justifyContent: 'center',
            color         : '#fff',
            fontSize      : 16,
        }}>
            {icon}
        </div>
        <div>
            <Text strong style={{ fontSize: 15, display: 'block', lineHeight: 1.3 }}>{title}</Text>
            {subtitle && <Text type="secondary" style={{ fontSize: 12 }}>{subtitle}</Text>}
        </div>
    </Flex>
);

const AddOrder = () => {
    // Hook
    useTitle("Add Order");

    // Variable
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [submitting, setSubmitting] = useState(false);

    // Dropdown States
    const [districts, setDistricts]               = useState([]);
    const [customerTypes, setCustomerTypes]       = useState([]);
    const [deliveryGateways, setDeliveryGateways] = useState([]);
    const [paymentGateways, setPaymentGateways]   = useState([]);
    const [statuses, setStatuses]                 = useState([]);
    const [coupons, setCoupons]                   = useState([]);
    const [couriers, setCouriers]                 = useState([]);
    const [productOptions, setProductOptions]     = useState([]);
    const [fetchedProducts, setFetchedProducts]   = useState({});
    const [searchTimeout, setSearchTimeout]       = useState(null);
    const [isSearching, setIsSearching]           = useState(false);

    useEffect(() => {
        const fetchDropdowns = async () => {
            try {
                const res = await getDatas("/admin/district/list");
                if (res?.success && res?.data) {
                    setDistricts(res.data);
                }
            } catch (error) {
                console.error("Failed to fetch districts:", error);
            }

            try {
                const res = await getDatas("/admin/customer-type/list");
                if (res?.success && res?.data) {
                    setCustomerTypes(res.data);
                }
            } catch (error) {
                console.error("Failed to fetch customer types:", error);
            }

            try {
                const res = await getDatas("/admin/delivery-gateway/list");
                if (res?.success && res?.data) {
                    setDeliveryGateways(res.data);
                }
            } catch (error) {
                console.error("Failed to fetch delivery gateways:", error);
            }

            try {
                const res = await getDatas("/admin/payment-gateway/list");
                if (res?.success && res?.data) {
                    setPaymentGateways(res.data);
                }
            } catch (error) {
                console.error("Failed to fetch payment gateways:", error);
            }

            try {
                const res = await getDatas("/admin/status/list");
                if (res?.success && res?.data) {
                    setStatuses(res.data);
                }
            } catch (error) {
                console.error("Failed to fetch statuses:", error);
            }

            try {
                const res = await getDatas("/admin/coupon/list");
                if (res?.success && res?.data) {
                    setCoupons(res.data);
                }
            } catch (error) {
                console.error("Failed to fetch coupons:", error);
            }

            try {
                const res = await getDatas("/admin/courier/list");
                if (res?.success && res?.data) {
                    setCouriers(res.data);
                    const defaultCourier = res.data.find(c => c.is_default);
                    if (defaultCourier && !form.getFieldValue('courier_id')) {
                        form.setFieldsValue({ courier_id: defaultCourier.id });
                    }
                }
            } catch (error) {
                console.error("Failed to fetch couriers:", error);
            }
        };
        fetchDropdowns();
    }, [form]);

    const handleProductSearch = (value) => {
        if (searchTimeout) clearTimeout(searchTimeout);

        if (value) {
            setIsSearching(true);
            const timeout = setTimeout(async () => {
                try {
                    const res = await getDatas("/admin/product/search", { search_key: value });
                    let products = [];
                    if (res?.success && res?.data) {
                        products = res.data;
                    } else if (Array.isArray(res)) {
                        products = res;
                    } else if (res?.data?.items) {
                        products = res.data.items;
                    }

                    setProductOptions(products);

                    setFetchedProducts(prev => {
                        const newDict = { ...prev };
                        products.forEach(p => {
                            newDict[p.id] = p;
                        });
                        return newDict;
                    });
                } catch (error) {
                    console.error(error);
                } finally {
                    setIsSearching(false);
                }
            }, 500);
            setSearchTimeout(timeout);
        } else {
            setProductOptions([]);
        }
    };

    const onFinish = async (values) => {
        setSubmitting(true);
        try {
            const payload = {
                ...values,
                idempotency_key: generateUUID(),
            };

            const response = await postData("/admin/order", payload);

            if (response?.success || response?.id) {
                message.success("Order created successfully!");
                navigate('/orders');
            } else {
                message.error(response?.message || "Failed to create order");
            }
        } catch (error) {
            console.error("Failed to create order:", error);
            handleFormErrors(error, form, message.error);
        } finally {
            setSubmitting(false);
        }
    };

    const cardStyle = {
        marginBottom: 20,
        borderRadius: 12,
        border      : '1px solid #f0f0f0',
        boxShadow   : '0 1px 3px rgba(0,0,0,0.04)',
    };

    return (
        <div style={{ margin: 5 }}>
            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                initialValues={{
                    advanced_payment: 0,
                    special_discount: 0,
                    coupon_discount: 0,
                    delivery_charge: 0,
                    additional_cost: 0,
                    paid_status: 'unpaid',
                    items: [{}]
                }}
            >
                <Affix offsetTop={0}>
                    <div style={{
                        background  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        padding     : '12px 24px',
                        borderRadius: 10,
                        marginBottom: 20,
                        boxShadow   : '0 4px 15px rgba(102, 126, 234, 0.3)',
                    }}>
                        <Flex justify="space-between" align="center" wrap="wrap" gap={12}>
                            <div>
                                <Breadcrumb
                                    items={[
                                        { title: <span style={{ color: 'rgba(255,255,255,0.7)' }}>Dashboard</span> },
                                        { title: <span style={{ color: 'rgba(255,255,255,0.7)' }}>Order</span> },
                                        { title: <span style={{ color: '#fff' }}>Create New</span> },
                                    ]}
                                    separator={<span style={{ color: 'rgba(255,255,255,0.5)' }}>/</span>}
                                />
                                <Title level={4} style={{ margin: '4px 0 0', color: '#fff' }}>
                                    <PlusOutlined style={{ marginRight: 8 }} />
                                    Create New Order
                                </Title>
                            </div>
                            <Flex gap={8}>
                                <Button
                                    icon={<ArrowLeftOutlined />}
                                    onClick={() => navigate('/orders')}
                                    size="large"
                                    style={{
                                        background: 'rgba(255,255,255,0.15)',
                                        borderColor: 'rgba(255,255,255,0.3)',
                                        color: '#fff',
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    icon={<SaveOutlined />}
                                    loading={submitting}
                                    size="large"
                                    style={{
                                        background: '#fff',
                                        color: '#764ba2',
                                        fontWeight: 700,
                                        border: 'none',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                    }}
                                >
                                    Save Order
                                </Button>
                            </Flex>
                        </Flex>
                    </div>
                </Affix>

                <Row gutter={[20, 0]}>
                    <Col xs={24} lg={12}>
                        <Card
                            title={<SectionHeader icon={<UserOutlined />} title="Customer Details" subtitle="Customer & shipping information" color="#667eea" />}
                            bordered={false}
                            style={cardStyle}
                            styles={{ header: { borderBottom: '2px solid #f0f0f0', padding: '16px 20px' }, body: { padding: 20 } }}
                        >
                            <Row gutter={16}>
                                <Col xs={24}>
                                    <Form.Item name="customer_name" label="Customer Name" rules={[{ required: true, message: 'Please enter customer name' }]}>
                                        <Input size="large" placeholder="e.g. John Doe" prefix={<UserOutlined style={{ color: '#bfbfbf' }} />} />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12}>
                                    <Form.Item name="phone_number" label="Phone Number" rules={[{ required: true, message: 'Please enter phone number' }]}>
                                        <Input size="large" placeholder="e.g. 01700000000" prefix={<PhoneOutlined style={{ color: '#bfbfbf' }} />} />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12}>
                                    <Form.Item name="customer_type_id" label="Customer Type">
                                        <Select size="large" placeholder="Select type" showSearch optionFilterProp="label" options={customerTypes.map(c => ({ value: c.id, label: c.name }))} allowClear />
                                    </Form.Item>
                                </Col>
                                <Col xs={24}>
                                    <Form.Item name="shipping_address" label="Shipping Address" rules={[{ required: true, message: 'Please enter shipping address' }]}>
                                        <Input.TextArea size="large" rows={2} placeholder="Full shipping address..." />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12}>
                                    <Form.Item name="district_id" label="District">
                                        <Select
                                            size="large"
                                            showSearch
                                            placeholder="Select a district"
                                            optionFilterProp="children"
                                            filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                                            options={districts.map(d => ({ value: d.id, label: d.district_name }))}
                                            allowClear
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Card>

                        <Card
                            title={<SectionHeader icon={<SettingOutlined />} title="Order Settings" subtitle="Status, gateway & courier" color="#f5222d" />}
                            bordered={false}
                            style={cardStyle}
                            styles={{ header: { borderBottom: '2px solid #f0f0f0', padding: '16px 20px' }, body: { padding: 20 } }}
                        >
                            <Row gutter={16}>
                                <Col xs={24} sm={12}>
                                    <Form.Item name="status_id" label="Status" rules={[{ required: true, message: 'Please select a status' }]}>
                                        <Select size="large" placeholder="Select Status" showSearch optionFilterProp="label" options={statuses.map(s => ({ value: s.id, label: s.name }))} allowClear />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12}>
                                    <Form.Item name="delivery_gateway_id" label="Delivery Gateway">
                                        <Select size="large" placeholder="Select Gateway" allowClear onChange={(val) => {
                                            if (val) {
                                                const selected = deliveryGateways.find(g => g.id === val);
                                                if (selected && selected.delivery_fee !== undefined) {
                                                    form.setFieldsValue({ delivery_charge: selected.delivery_fee });
                                                }
                                            }
                                        }}>
                                            {deliveryGateways.map(g => (
                                                <Select.Option key={g.id} value={g.id}>
                                                    {g.name} <Tag color="blue" style={{ marginLeft: 4 }}>৳{g.delivery_fee}</Tag>
                                                </Select.Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12}>
                                    <Form.Item name="payment_gateway_id" label="Payment Gateway">
                                        <Select size="large" placeholder="Select Payment Gateway" allowClear>
                                            {paymentGateways.map(g => (
                                                <Select.Option key={g.id} value={g.id}>{g.name}</Select.Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12}>
                                    <Form.Item name="courier_id" label="Select Courier">
                                        <Select size="large" placeholder="Choose Courier" showSearch optionFilterProp="label" options={couriers.map(c => ({ value: c.id, label: c.name }))} allowClear />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12}>
                                    <Form.Item name="coupon_id" label="Coupon">
                                        <Select size="large" placeholder="Select Coupon" showSearch optionFilterProp="label" options={coupons.map(c => ({ value: c.id, label: c.code }))} allowClear />
                                    </Form.Item>
                                </Col>
                                <Col xs={24}>
                                    <Form.Item name="note" label="Customer Note">
                                        <Input.TextArea size="large" rows={2} placeholder="Any notes from the customer..." />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Card>
                    </Col>

                    <Col xs={24} lg={12}>
                        <Card
                            title={<SectionHeader icon={<ShoppingCartOutlined />} title="Order Items" subtitle="Add products to the order" color="#52c41a" />}
                            bordered={false}
                            style={cardStyle}
                            styles={{ header: { borderBottom: '2px solid #f0f0f0', padding: '16px 20px' }, body: { padding: 20 } }}
                        >
                            <Form.List
                                name="items"
                                rules={[
                                    {
                                        validator: async (_, items) => {
                                            if (!items || items.length < 1) {
                                                return Promise.reject(new Error('At least one item is required'));
                                            }
                                        },
                                    },
                                ]}
                            >
                                {(fields, { add, remove }, { errors }) => (
                                    <>
                                        {fields.map(({ key, name, ...restField }, idx) => (
                                            <div
                                                key={key}
                                                style={{
                                                    marginBottom: 12,
                                                    padding     : '14px 16px',
                                                    background  : idx % 2 === 0 ? '#fafbff': '#f8faf5',
                                                    borderRadius: 10,
                                                    border      : '1px solid #f0f0f0',
                                                    position    : 'relative',
                                                }}
                                            >
                                                <div style={{
                                                    position    : 'absolute',
                                                    top         : -8,
                                                    left        : 12,
                                                    background  : 'linear-gradient(135deg, #52c41a, #73d13d)',
                                                    color       : '#fff',
                                                    fontSize    : 10,
                                                    fontWeight  : 700,
                                                    padding     : '1px 8px',
                                                    borderRadius: 8,
                                                }}>
                                                    ITEM #{idx + 1}
                                                </div>

                                                <Row gutter={[12, 8]} align="middle">
                                                    <Col xs={24} md={11}>
                                                        <Form.Item
                                                            {...restField}
                                                            name={[name, 'product_id']}
                                                            label={<Text style={{ fontSize: 12 }}>Product</Text>}
                                                            rules={[{ required: true, message: 'Missing product' }]}
                                                            style={{ marginBottom: 0 }}
                                                        >
                                                            <Select
                                                                showSearch
                                                                placeholder="Search products..."
                                                                onSearch={handleProductSearch}
                                                                filterOption={false}
                                                                loading={isSearching}
                                                                optionLabelProp="label"
                                                                onChange={() => {
                                                                    const currentItems = form.getFieldValue('items');
                                                                    if (currentItems[name]) {
                                                                        currentItems[name].product_variant_id = null;
                                                                    }
                                                                    form.setFieldsValue({ items: currentItems });
                                                                }}
                                                            >
                                                                {Object.values(fetchedProducts).map(p => (
                                                                    <Select.Option key={p.id} value={p.id} label={p.name}>
                                                                        <Flex align="center" gap={10}>
                                                                            {p.image ? (
                                                                                <img src={p.image} alt={p.name} style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 6, border: '1px solid #f0f0f0' }} />
                                                                            ) : (
                                                                                <div style={{ width: 36, height: 36, borderRadius: 6, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bfbfbf', fontSize: 16 }}>
                                                                                    <ShoppingCartOutlined />
                                                                                </div>
                                                                            )}
                                                                            <div style={{ flex: 1, overflow: 'hidden', lineHeight: 1.3 }}>
                                                                                <div style={{ fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                                                                                    {p.name}
                                                                                </div>
                                                                                <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 1 }}>
                                                                                    {p.category?.name || 'Uncategorized'}
                                                                                    <span style={{ color: '#1677ff', fontWeight: 600, marginLeft: 6 }}>৳{p.sell_price}</span>
                                                                                </div>
                                                                            </div>
                                                                        </Flex>
                                                                    </Select.Option>
                                                                ))}
                                                            </Select>
                                                        </Form.Item>
                                                    </Col>
                                                    <Col xs={16} md={7}>
                                                        <Form.Item
                                                            noStyle
                                                            shouldUpdate={(prevValues, currentValues) => {
                                                                return prevValues.items?.[name]?.product_id !== currentValues.items?.[name]?.product_id;
                                                            }}
                                                        >
                                                            {() => {
                                                                const selectedProductId = form.getFieldValue(['items', name, 'product_id']);
                                                                const selectedProduct = fetchedProducts[selectedProductId];
                                                                const variants = selectedProduct?.variants || [];

                                                                return (
                                                                    <Form.Item
                                                                        {...restField}
                                                                        name={[name, 'product_variant_id']}
                                                                        label={<Text style={{ fontSize: 12 }}>Variant</Text>}
                                                                        style={{ marginBottom: 0 }}
                                                                        rules={[{ required: variants.length > 0, message: 'Variant required' }]}
                                                                    >
                                                                        <Select placeholder="Select Variant" disabled={!selectedProductId || variants.length === 0} allowClear>
                                                                            {variants.map(v => {
                                                                                const attrs = v.attributes.map(a => a.attribute_value_name).join(', ');
                                                                                return (
                                                                                    <Select.Option key={v.id} value={v.id}>
                                                                                        {attrs || v.sku} (Stock: {v.current_stock})
                                                                                    </Select.Option>
                                                                                );
                                                                            })}
                                                                        </Select>
                                                                    </Form.Item>
                                                                );
                                                            }}
                                                        </Form.Item>
                                                    </Col>
                                                    <Col xs={5} md={4}>
                                                        <Form.Item
                                                            {...restField}
                                                            name={[name, 'quantity']}
                                                            label={<Text style={{ fontSize: 12 }}>Qty</Text>}
                                                            rules={[{ required: true, message: 'Qty' }]}
                                                            style={{ marginBottom: 0 }}
                                                        >
                                                            <InputNumber style={{ width: '100%' }} min={1} />
                                                        </Form.Item>
                                                    </Col>
                                                    <Col xs={3} md={2} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 24 }}>
                                                        {fields.length > 1 ? (
                                                            <Tooltip title="Remove item">
                                                                <MinusCircleOutlined
                                                                    style={{
                                                                        color: '#ff4d4f',
                                                                        fontSize: 18,
                                                                        cursor: 'pointer',
                                                                        transition: 'transform 0.2s',
                                                                    }}
                                                                    onClick={() => remove(name)}
                                                                />
                                                            </Tooltip>
                                                        ) : null}
                                                    </Col>
                                                </Row>
                                            </div>
                                        ))}
                                        <Form.Item style={{ marginBottom: 0, marginTop: 8 }}>
                                            <Button
                                                type="dashed"
                                                onClick={() => add()}
                                                block
                                                icon={<PlusOutlined />}
                                                style={{
                                                    height: 44,
                                                    borderRadius: 10,
                                                    borderColor: '#52c41a',
                                                    color: '#52c41a',
                                                    fontWeight: 600,
                                                }}
                                            >
                                                Add Another Item
                                            </Button>
                                            <Form.ErrorList errors={errors} />
                                        </Form.Item>
                                    </>
                                )}
                            </Form.List>
                        </Card>

                        <Card
                            title={<SectionHeader icon={<DollarOutlined />} title="Financials & Summary" subtitle="Charges, discounts & payment" color="#faad14" />}
                            bordered={false}
                            style={cardStyle}
                            styles={{ header: { borderBottom: '2px solid #f0f0f0', padding: '16px 20px' }, body: { padding: 20 } }}
                        >
                            <Row gutter={[16, 0]}>
                                <Col xs={12} sm={8}>
                                    <Form.Item name="delivery_charge" label={<Text style={{ fontSize: 12 }}>🚚 Delivery Charge</Text>}>
                                        <InputNumber style={{ width: '100%' }} min={0} addonAfter="৳" />
                                    </Form.Item>
                                </Col>
                                <Col xs={12} sm={8}>
                                    <Form.Item name="advanced_payment" label={<Text style={{ fontSize: 12 }}>💰 Advanced Payment</Text>}>
                                        <InputNumber style={{ width: '100%' }} min={0} addonAfter="৳" />
                                    </Form.Item>
                                </Col>
                                <Col xs={12} sm={8}>
                                    <Form.Item name="special_discount" label={<Text style={{ fontSize: 12 }}>🏷️ Special Discount</Text>}>
                                        <InputNumber style={{ width: '100%' }} min={0} addonAfter="৳" />
                                    </Form.Item>
                                </Col>
                                <Col xs={12} sm={8}>
                                    <Form.Item name="coupon_discount" label={<Text style={{ fontSize: 12 }}>🎫 Coupon Discount</Text>}>
                                        <InputNumber style={{ width: '100%' }} min={0} addonAfter="৳" />
                                    </Form.Item>
                                </Col>
                                <Col xs={12} sm={8}>
                                    <Form.Item name="additional_cost" label={<Text style={{ fontSize: 12 }}>➕ Additional Cost</Text>}>
                                        <InputNumber style={{ width: '100%' }} min={0} addonAfter="৳" />
                                    </Form.Item>
                                </Col>
                                <Col xs={12} sm={8}>
                                    <Form.Item name="paid_status" label={<Text style={{ fontSize: 12 }}>💳 Paid Status</Text>}>
                                        <Select
                                            options={[
                                                { value: 'paid', label: '✅ Paid' },
                                                { value: 'unpaid', label: '❌ Unpaid' }
                                            ]}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item noStyle shouldUpdate>
                                {() => {
                                    const items = form.getFieldValue('items') || [];
                                    let subtotal = 0;

                                    items.forEach(item => {
                                        if (item && item.product_id && item.quantity) {
                                            const product = fetchedProducts[item.product_id];
                                            if (product) {
                                                let price = Number(product.sell_price);
                                                if (item.product_variant_id) {
                                                    const variant = product.variants?.find(v => v.id === item.product_variant_id);
                                                    if (variant && variant.sell_price) {
                                                        price = Number(variant.sell_price);
                                                    }
                                                }
                                                subtotal += price * Number(item.quantity);
                                            }
                                        }
                                    });

                                    const delivery_charge = Number(form.getFieldValue('delivery_charge') || 0);
                                    const additional_cost = Number(form.getFieldValue('additional_cost') || 0);
                                    const special_discount = Number(form.getFieldValue('special_discount') || 0);
                                    const coupon_discount = Number(form.getFieldValue('coupon_discount') || 0);
                                    const advanced_payment = Number(form.getFieldValue('advanced_payment') || 0);

                                    const total = subtotal + delivery_charge + additional_cost - special_discount - coupon_discount;
                                    const due = total - advanced_payment;

                                    return (
                                        <div style={{
                                            background: 'linear-gradient(135deg, #f8f9fe 0%, #f0f4ff 100%)',
                                            padding: '20px',
                                            borderRadius: 12,
                                            marginTop: 8,
                                            border: '1px solid #e6e9f0',
                                        }}>
                                            <Flex align="center" gap={8} style={{ marginBottom: 16 }}>
                                                <FileTextOutlined style={{ color: '#667eea', fontSize: 16 }} />
                                                <Text strong style={{ fontSize: 15, color: '#1f1f1f' }}>Order Summary</Text>
                                            </Flex>

                                            <div style={{ fontSize: 13 }}>
                                                <Flex justify="space-between" style={{ marginBottom: 8 }}>
                                                    <Text type="secondary">Subtotal</Text>
                                                    <Text style={{ fontWeight: 600 }}>৳{subtotal.toFixed(2)}</Text>
                                                </Flex>
                                                <Flex justify="space-between" style={{ marginBottom: 8 }}>
                                                    <Text type="secondary">Delivery Charge</Text>
                                                    <Text style={{ color: '#1677ff' }}>+ ৳{delivery_charge.toFixed(2)}</Text>
                                                </Flex>
                                                {additional_cost > 0 && (
                                                    <Flex justify="space-between" style={{ marginBottom: 8 }}>
                                                        <Text type="secondary">Additional Cost</Text>
                                                        <Text style={{ color: '#1677ff' }}>+ ৳{additional_cost.toFixed(2)}</Text>
                                                    </Flex>
                                                )}
                                                {special_discount > 0 && (
                                                    <Flex justify="space-between" style={{ marginBottom: 8 }}>
                                                        <Text style={{ color: '#ff4d4f' }}>Special Discount</Text>
                                                        <Text style={{ color: '#ff4d4f' }}>- ৳{special_discount.toFixed(2)}</Text>
                                                    </Flex>
                                                )}
                                                {coupon_discount > 0 && (
                                                    <Flex justify="space-between" style={{ marginBottom: 8 }}>
                                                        <Text style={{ color: '#ff4d4f' }}>Coupon Discount</Text>
                                                        <Text style={{ color: '#ff4d4f' }}>- ৳{coupon_discount.toFixed(2)}</Text>
                                                    </Flex>
                                                )}
                                            </div>

                                            <Divider style={{ margin: '12px 0', borderColor: '#d6dce8' }} />

                                            <Flex justify="space-between" align="center" style={{ marginBottom: 8 }}>
                                                <Text strong style={{ fontSize: 16 }}>Total Payable</Text>
                                                <Text strong style={{ fontSize: 18, color: '#1f1f1f' }}>৳{total.toFixed(2)}</Text>
                                            </Flex>

                                            {advanced_payment > 0 && (
                                                <>
                                                    <Flex justify="space-between" style={{ marginBottom: 8 }}>
                                                        <Text style={{ color: '#52c41a' }}>Advanced Payment</Text>
                                                        <Text style={{ color: '#52c41a', fontWeight: 600 }}>- ৳{advanced_payment.toFixed(2)}</Text>
                                                    </Flex>
                                                    <Divider style={{ margin: '12px 0', borderColor: '#d6dce8' }} />
                                                    <Flex justify="space-between" align="center">
                                                        <Text strong style={{ fontSize: 18 }}>Due Amount</Text>
                                                        <div style={{
                                                            background: due > 0 ? 'linear-gradient(135deg, #ff4d4f, #ff7875)' : 'linear-gradient(135deg, #52c41a, #73d13d)',
                                                            color: '#fff',
                                                            padding: '4px 16px',
                                                            borderRadius: 8,
                                                            fontSize: 18,
                                                            fontWeight: 700,
                                                        }}>
                                                            ৳{due.toFixed(2)}
                                                        </div>
                                                    </Flex>
                                                </>
                                            )}
                                        </div>
                                    );
                                }}
                            </Form.Item>
                        </Card>
                    </Col>
                </Row>
            </Form>

            <style>{`
                .ant-card {
                    box-shadow: 0 1px 3px rgba(0,0,0,0.04) !important;
                }
                .ant-form-item-label > label {
                    font-weight: 600 !important;
                    font-size: 13px !important;
                    color: #444 !important;
                }
                .ant-input-lg, .ant-select-lg .ant-select-selector, .ant-input-number-lg {
                    border-radius: 8px !important;
                }
            `}</style>
        </div>
    );

};

export default AddOrder;
