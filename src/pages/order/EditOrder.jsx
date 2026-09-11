import { MinusCircleOutlined, PlusOutlined, SaveOutlined } from "@ant-design/icons";
import { Affix, Breadcrumb, Button, Card, Col, Divider, Flex, Form, Input, InputNumber, Row, Select, Spin, Typography, message } from "antd";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useTitle from "../../hooks/useTitle";
import { getData, getDatas, putData } from "../../services/request";
import { handleFormErrors } from "../../utils/formUtils";

const { Title } = Typography;

const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : ((r & 0x3) | 0x8);
        return v.toString(16);
    });
};

const EditOrder = () => {
    // Hook
    useTitle("Edit Order");

    // Variable
    const navigate                    = useNavigate();
    const { id }                      = useParams();
    const [loading, setLoading]       = useState(true);
    const [form]                      = Form.useForm();
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


    useEffect(() => {
        if (!id) return;
        const fetchOrder = async () => {
            try {
                const res = await getData(`/admin/order/${id}`);

                if (res?.success && res?.data) {
                    const order = res.data;
                    
                    const initialProducts = {};
                    const items = (order.details || []).map(d => {
                        initialProducts[d.product_id] = {
                            id        : d.product_id,
                            name      : d.product_name,
                            sku       : d.product_sku,
                            image     : d.product_img_path,
                            sell_price: d.sell_price,
                            variants  : d.product_variant_id ? [{
                                id           : d.product_variant_id,
                                sku          : d.variant_sku,
                                sell_price   : d.sell_price,
                                current_stock: 100,
                                attributes   : d.variant_options ? [{ attribute_value_name: d.variant_name }]: []
                            }]           : []
                        };
                        
                        return {
                            product_id        : d.product_id,
                            product_variant_id: d.product_variant_id,
                            quantity          : d.quantity
                        };
                    });
                    
                    setFetchedProducts(prev => ({ ...prev, ...initialProducts }));

                    form.setFieldsValue({
                        customer_name      : order.customer_name,
                        phone_number       : order.phone_number,
                        customer_type_id   : order.customer_type_id,
                        shipping_address   : order.shipping_address,
                        district_id        : order.district_id,
                        status_id          : order.status_id,
                        delivery_gateway_id: order.delivery_gateway_id,
                        payment_gateway_id : order.payment_gateway_id,
                        courier_id         : order.courier_id,
                        coupon_id          : order.coupon_id,
                        note               : order.note || '',
                        delivery_charge    : Number(order.delivery_charge) || 0,
                        advanced_payment   : Number(order.advanced_payment) || 0,
                        special_discount   : Number(order.special_discount) || 0,
                        coupon_discount    : Number(order.coupon_discount) || 0,
                        additional_cost    : Number(order.additional_cost) || 0,
                        paid_status        : order.paid_status || 'unpaid',
                        
                        items: items.length > 0 ? items: [{}]
                    });
                }
            } catch (error) {
                console.error("Failed to fetch order:", error);
                message.error("Failed to fetch order data");
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [id, form]);

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

            const response = await putData(`/admin/order/${id}`, payload);
            
            if (response?.success || response?.id) {
                message.success("Order updated successfully!");
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

    return (
        <div className="add-order-page" style={{ margin: '5px' }}>
            <Breadcrumb
                items={[
                    { title: "Dashboard" },
                    { title: "Order" },
                    { title: "Edit Order" },
                ]}
                style={{ marginBottom: 24 }}
            />

            <Spin spinning={loading}>
            <Form form={form} layout="vertical" onFinish={onFinish}
                initialValues={{
                    advanced_payment: 0,
                    special_discount: 0,
                    coupon_discount : 0,
                    delivery_charge : 0,
                    additional_cost : 0,
                    paid_status     : 'unpaid',
                    items           : [{}]
                }}
            >
                <Affix offsetTop={0}>
                    <Flex 
                        justify="space-between" 
                        align="center" 
                        wrap="wrap" 
                        gap="small"
                        style={{ 
                            marginBottom  : 24,
                            zIndex        : 99,
                            background    : 'rgba(255, 255, 255, 0.90)',
                            backdropFilter: 'blur(8px)',
                            padding       : '16px 24px',
                            borderRadius  : 8,
                            boxShadow     : '0 4px 12px rgba(0,0,0,0.05)',
                            border        : '1px solid #f0f0f0'
                        }}
                    >
                        <Title level={2} style={{ margin: 0 }}>Edit Order</Title>
                        <Flex gap="small">
                            <Button onClick={() => navigate('/orders')} size="large">Cancel</Button>

                            <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={submitting} size="large">
                                Update Order
                            </Button>
                        </Flex>
                    </Flex>
                </Affix>

                <Row gutter={[24, 24]}>
                    <Col xs={24} lg={12}>
                        <Card title="Customer Details" bordered={false} style={{ marginBottom: 24, boxShadow: '0 1px 2px 0 rgba(0,0,0,0.03), 0 1px 6px -1px rgba(0,0,0,0.02), 0 2px 4px 0 rgba(0,0,0,0.02)' }}>
                            <Row gutter={16}>
                                <Col xs={24}>
                                    <Form.Item name="customer_name" label="Customer Name" rules={[{ required: true, message: 'Please enter customer name' }]}>
                                        <Input size="large" placeholder="e.g. John Doe" />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12}>
                                    <Form.Item name="phone_number" label="Phone Number" rules={[{ required: true, message: 'Please enter phone number' }]}>
                                        <Input size="large" placeholder="e.g. 01700000000" />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12}>
                                    <Form.Item name="customer_type_id" label="Customer Type">
                                        <Select size="large" placeholder="Select type" options={customerTypes.map(c => ({ value: c.id, label: c.name }))} allowClear />
                                    </Form.Item>
                                </Col>
                                <Col xs={24}>
                                    <Form.Item name="shipping_address" label="Shipping Address" rules={[{ required: true, message: 'Please enter shipping address' }]}>
                                        <Input.TextArea size="large" rows={2} placeholder="Full shipping address..." />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12}>
                                    <Form.Item name="district_id" label="District">
                                        <Select size="large" showSearch placeholder="Select a district" optionFilterProp="children" filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())} options={districts.map(d => ({ value: d.id, label: d.district_name }))} allowClear />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Card>

                        <Card title="Order Settings" bordered={false} style={{ marginBottom: 24, boxShadow: '0 1px 2px 0 rgba(0,0,0,0.03), 0 1px 6px -1px rgba(0,0,0,0.02), 0 2px 4px 0 rgba(0,0,0,0.02)' }}>
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
                                                <Select.Option key={g.id} value={g.id}>{g.name} (৳{g.delivery_fee})</Select.Option>
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
                        <Card title="Order Items" bordered={false} style={{ marginBottom: 24, boxShadow: '0 1px 2px 0 rgba(0,0,0,0.03), 0 1px 6px -1px rgba(0,0,0,0.02), 0 2px 4px 0 rgba(0,0,0,0.02)' }}>
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
                                        {fields.map(({ key, name, ...restField }) => (
                                            <Card size="small" style={{ marginBottom: 12, background: '#fafafa', border: '1px solid #f0f0f0' }} key={key}>
                                                <Row gutter={[16, 16]} align="middle">
                                                    <Col xs={24} sm={24} md={12}>
                                                        <Form.Item
                                                            {...restField}
                                                            name={[name, 'product_id']}
                                                            label="Product"
                                                            rules={[{ required: true, message: 'Missing product' }]}
                                                            style={{ marginBottom: 0 }}
                                                        >
                                                            <Select
                                                                showSearch
                                                                placeholder="Search..."
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
                                                                        <Flex align="center" gap="small">
                                                                            {p.image && <img src={p.image} alt={p.name} style={{ width: 32, height: 32, objectFit: 'cover', borderRadius: 4 }} />}
                                                                            <div style={{ flex: 1, overflow: 'hidden', lineHeight: '1.2' }}>
                                                                                <div style={{ fontWeight: 500, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                                                                                    {p.name}
                                                                                </div>
                                                                                <div style={{ fontSize: '12px', color: 'gray', marginTop: 2 }}>
                                                                                    {p.category?.name || 'Uncategorized'} • <span style={{ color: '#1677ff' }}>৳{p.sell_price}</span>
                                                                                </div>
                                                                            </div>
                                                                        </Flex>
                                                                    </Select.Option>
                                                                ))}
                                                            </Select>
                                                        </Form.Item>
                                                    </Col>
                                                    <Col xs={24} sm={12} md={7}>
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
                                                                        label="Variant"
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
                                                    <Col xs={20} sm={10} md={3}>
                                                        <Form.Item
                                                            {...restField}
                                                            name={[name, 'quantity']}
                                                            label="Qty"
                                                            rules={[{ required: true, message: 'Missing Qty' }]}
                                                            style={{ marginBottom: 0 }}
                                                        >
                                                            <InputNumber style={{ width: '100%' }} min={1} />
                                                        </Form.Item>
                                                    </Col>
                                                    <Col xs={4} sm={2} md={2} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 28 }}>
                                                        {fields.length > 1 ? (
                                                            <MinusCircleOutlined
                                                                style={{ color: '#ff4d4f', fontSize: 18, cursor: 'pointer' }}
                                                                onClick={() => remove(name)}
                                                            />
                                                        ) : null}
                                                    </Col>
                                                </Row>
                                            </Card>
                                        ))}
                                        <Form.Item style={{ marginBottom: 0 }}>
                                            <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                                Add Another Item
                                            </Button>
                                            <Form.ErrorList errors={errors} />
                                        </Form.Item>
                                    </>
                                )}
                            </Form.List>
                        </Card>

                        <Card title="Financials & Summary" bordered={false} style={{ marginBottom: 24, boxShadow: '0 1px 2px 0 rgba(0,0,0,0.03), 0 1px 6px -1px rgba(0,0,0,0.02), 0 2px 4px 0 rgba(0,0,0,0.02)' }}>
                            <Row gutter={16}>
                                <Col xs={12} sm={8}>
                                    <Form.Item name="delivery_charge" label="Delivery Charge">
                                        <InputNumber style={{ width: '100%' }} min={0} addonAfter="৳" />
                                    </Form.Item>
                                </Col>
                                <Col xs={12} sm={8}>
                                    <Form.Item name="advanced_payment" label="Advanced Payment">
                                        <InputNumber style={{ width: '100%' }} min={0} addonAfter="৳" />
                                    </Form.Item>
                                </Col>
                                <Col xs={12} sm={8}>
                                    <Form.Item name="special_discount" label="Special Discount">
                                        <InputNumber style={{ width: '100%' }} min={0} addonAfter="৳" />
                                    </Form.Item>
                                </Col>
                                <Col xs={12} sm={8}>
                                    <Form.Item name="coupon_discount" label="Coupon Discount">
                                        <InputNumber style={{ width: '100%' }} min={0} addonAfter="৳" />
                                    </Form.Item>
                                </Col>
                                <Col xs={12} sm={8}>
                                    <Form.Item name="additional_cost" label="Additional Cost">
                                        <InputNumber style={{ width: '100%' }} min={0} addonAfter="৳" />
                                    </Form.Item>
                                </Col>
                                <Col xs={12} sm={8}>
                                    <Form.Item name="paid_status" label="Paid Status">
                                        <Select
                                            options={[
                                                { value: 'paid', label: 'Paid' },
                                                { value: 'unpaid', label: 'Unpaid' }
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
                                        <div style={{ background: '#f5f7fa', padding: 16, borderRadius: 8, marginTop: 16, border: '1px dashed #d9d9d9' }}>
                                            <Title level={5} style={{ marginTop: 0, marginBottom: 16, color: '#1f1f1f' }}>Order Summary</Title>
                                            <Flex justify="space-between" style={{ marginBottom: 8 }}>
                                                <Typography.Text type="secondary">Subtotal:</Typography.Text>
                                                <Typography.Text>৳{subtotal.toFixed(2)}</Typography.Text>
                                            </Flex>
                                            <Flex justify="space-between" style={{ marginBottom: 8 }}>
                                                <Typography.Text type="secondary">Delivery Charge:</Typography.Text>
                                                <Typography.Text>+ ৳{delivery_charge.toFixed(2)}</Typography.Text>
                                            </Flex>
                                            {additional_cost > 0 && (
                                                <Flex justify="space-between" style={{ marginBottom: 8 }}>
                                                    <Typography.Text type="secondary">Additional Cost:</Typography.Text>
                                                    <Typography.Text>+ ৳{additional_cost.toFixed(2)}</Typography.Text>
                                                </Flex>
                                            )}
                                            {special_discount > 0 && (
                                                <Flex justify="space-between" style={{ marginBottom: 8 }}>
                                                    <Typography.Text type="danger">Special Discount:</Typography.Text>
                                                    <Typography.Text type="danger">- ৳{special_discount.toFixed(2)}</Typography.Text>
                                                </Flex>
                                            )}
                                            {coupon_discount > 0 && (
                                                <Flex justify="space-between" style={{ marginBottom: 8 }}>
                                                    <Typography.Text type="danger">Coupon Discount:</Typography.Text>
                                                    <Typography.Text type="danger">- ৳{coupon_discount.toFixed(2)}</Typography.Text>
                                                </Flex>
                                            )}
                                            <Divider style={{ margin: '12px 0', borderColor: '#d9d9d9' }} />
                                            <Flex justify="space-between" style={{ marginBottom: 8 }}>
                                                <Typography.Text strong style={{ fontSize: 16 }}>Total Payable:</Typography.Text>
                                                <Typography.Text strong style={{ fontSize: 16 }}>৳{total.toFixed(2)}</Typography.Text>
                                            </Flex>
                                            {advanced_payment > 0 && (
                                                <Flex justify="space-between" style={{ marginBottom: 8 }}>
                                                    <Typography.Text type="success">Advanced Payment:</Typography.Text>
                                                    <Typography.Text type="success">- ৳{advanced_payment.toFixed(2)}</Typography.Text>
                                                </Flex>
                                            )}
                                            {advanced_payment > 0 && (
                                                <>
                                                    <Divider style={{ margin: '12px 0', borderColor: '#d9d9d9' }} />
                                                    <Flex justify="space-between">
                                                        <Typography.Text strong style={{ fontSize: 18 }}>Due Amount:</Typography.Text>
                                                        <Typography.Text strong style={{ fontSize: 18, color: due > 0 ? '#ff4d4f' : '#52c41a' }}>
                                                            ৳{due.toFixed(2)}
                                                        </Typography.Text>
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
            </Spin>
        </div>
    );
};

export default EditOrder;
