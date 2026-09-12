import { Modal, Descriptions, Table, Typography, Tag, Row, Col, Card, Flex, Spin, Divider } from 'antd';
import { useEffect, useState } from 'react';
import { getDatas } from '../../services/request';
import { PhoneOutlined, EnvironmentOutlined, CalendarOutlined, ShoppingCartOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;

const OrderPreview = ({ open, onClose, orderId }) => {
    const [loading, setLoading] = useState(false);
    const [order, setOrder] = useState(null);

    useEffect(() => {
        if (open && orderId) {
            fetchOrderDetails();
        } else {
            setOrder(null);
        }
    }, [open, orderId]);

    const fetchOrderDetails = async () => {
        setLoading(true);
        try {
            const res = await getDatas(`/admin/order/${orderId}`);
            if (res?.success && res?.data) {
                setOrder(res.data);
            }
        } catch (error) {
            console.error("Failed to fetch order", error);
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: 'Product',
            key: 'product',
            render: (_, record) => (
                <Flex gap={12} align="flex-start">
                    {record.product_img_path ? (
                        <div style={{ width: 50, height: 50, borderRadius: 6, overflow: 'hidden', border: '1px solid #e8e8e8' }}>
                            <img src={record.product_img_path} alt="product" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                    ) : (
                        <div style={{ width: 50, height: 50, borderRadius: 6, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ShoppingCartOutlined style={{ fontSize: 20, color: '#bfbfbf' }} />
                        </div>
                    )}
                    <div>
                        <div style={{ fontWeight: 600, fontSize: 13, color: '#1a1a1a', marginBottom: 4 }}>{record.product_name}</div>
                        <div style={{ fontSize: 12, color: '#666' }}>SKU: {record.product_sku}</div>
                        {record.variant_name && <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{record.variant_name}</div>}
                    </div>
                </Flex>
            )
        },
        {
            title: 'Price',
            dataIndex: 'sell_price',
            key: 'sell_price',
            align: 'right',
            render: (val) => `৳${parseFloat(val || 0).toLocaleString()}`
        },
        {
            title: 'Qty',
            dataIndex: 'quantity',
            key: 'quantity',
            align: 'center',
            render: (val) => <Tag color="blue" style={{ margin: 0, fontWeight: 600 }}>{val}</Tag>
        },
        {
            title: 'Total',
            key: 'total',
            align: 'right',
            render: (_, record) => (
                <Text strong style={{ color: '#1a1a1a' }}>
                    ৳{(parseFloat(record.sell_price || 0) * parseFloat(record.quantity || 0)).toLocaleString()}
                </Text>
            )
        }
    ];

    return (
        <Modal
            title={
                order ? (
                    <Flex align="center" gap={12}>
                        <span>Order Preview</span>
                        <Tag color="cyan" style={{ fontSize: 13, padding: '2px 8px', borderRadius: 12, border: 'none' }}>{order.invoice_number}</Tag>
                    </Flex>
                ) : "Order Preview"
            }
            open={open}
            onCancel={onClose}
            width={1000}
            footer={null}
            styles={{ body: { padding: '24px 0 0' } }}
            destroyOnClose
        >
            <Spin spinning={loading}>
                {order && (
                    <div style={{ padding: '0 24px 24px' }}>
                        <Row gutter={[16, 16]}>
                            <Col xs={24} md={8}>
                                <Card title="Customer Information" size="small" bordered={false} style={{ height: '100%', background: '#f8f9fa', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
                                    <div style={{ marginBottom: 8 }}>
                                        <Text strong style={{ fontSize: 15 }}>{order.customer_name}</Text>
                                        {order.customer_type && <Tag color="green" style={{ marginLeft: 8, border: 'none' }}>{order.customer_type.name}</Tag>}
                                    </div>
                                    <div style={{ marginBottom: 6, color: '#555' }}>
                                        <PhoneOutlined style={{ marginRight: 6 }} /> {order.phone_number}
                                    </div>
                                    <div style={{ color: '#555', display: 'flex', alignItems: 'flex-start' }}>
                                        <EnvironmentOutlined style={{ marginRight: 6, marginTop: 4 }} />
                                        <span>
                                            {order.shipping_address}
                                            <br />
                                            <Text type="secondary" style={{ fontSize: 12 }}>{order.district?.name}</Text>
                                        </span>
                                    </div>
                                </Card>
                            </Col>
                            <Col xs={24} md={8}>
                                <Card title="Order Details" size="small" bordered={false} style={{ height: '100%', background: '#f8f9fa', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
                                    <Descriptions column={1} size="small" labelStyle={{ color: '#888' }} contentStyle={{ fontWeight: 500 }}>
                                        <Descriptions.Item label="Date">
                                            {new Date(order.order_date).toLocaleString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Status">
                                            <Tag color="blue" style={{ border: 'none' }}>{order.current_status?.name}</Tag>
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Payment Info">
                                            {order.payment_gateway?.name}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Courier">
                                            {order.courier?.name || 'N/A'}
                                        </Descriptions.Item>
                                        {order.tracking_code && (
                                            <Descriptions.Item label="Tracking">
                                                <Text copyable style={{ color: '#1677ff' }}>{order.tracking_code}</Text>
                                            </Descriptions.Item>
                                        )}
                                    </Descriptions>
                                </Card>
                            </Col>
                            <Col xs={24} md={8}>
                                <Card title="Financial Summary" size="small" bordered={false} style={{ height: '100%', background: '#fff1f0', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
                                    <Descriptions column={1} size="small" labelStyle={{ color: '#888' }} contentStyle={{ fontWeight: 500 }}>
                                        <Descriptions.Item label="Payment Status">
                                            <Tag color={order.paid_status === 'paid' ? 'green' : order.paid_status === 'partial' ? 'orange' : 'red'} style={{ textTransform: 'capitalize', border: 'none' }}>
                                                {order.paid_status}
                                            </Tag>
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Total Payable">
                                            <Text strong style={{ fontSize: 16 }}>৳{parseFloat(order.total_payable_amount || 0).toLocaleString()}</Text>
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Advance">
                                            <Text type="success">৳{parseFloat(order.advanced_payment || 0).toLocaleString()}</Text>
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Due">
                                            <Text type="danger" strong>৳{parseFloat(order.due || 0).toLocaleString()}</Text>
                                        </Descriptions.Item>
                                    </Descriptions>
                                </Card>
                            </Col>
                        </Row>

                        <div style={{ marginTop: 24 }}>
                            <Title level={5} style={{ marginBottom: 16, color: '#1a1a1a' }}>Order Items</Title>
                            <Table
                                columns={columns}
                                dataSource={order.details || []}
                                rowKey="id"
                                pagination={false}
                                size="middle"
                                bordered
                            />
                        </div>

                        <Row justify="end" style={{ marginTop: 24 }}>
                            <Col xs={24} sm={12} md={8}>
                                <div style={{ background: '#f8f9fa', padding: 16, borderRadius: 8, boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
                                    <Flex justify="space-between" style={{ marginBottom: 8 }}>
                                        <Text type="secondary">Net Amount</Text>
                                        <Text strong>৳{parseFloat(order.net_order_amount || 0).toLocaleString()}</Text>
                                    </Flex>
                                    {parseFloat(order.delivery_charge || 0) > 0 && (
                                        <Flex justify="space-between" style={{ marginBottom: 8 }}>
                                            <Text type="secondary">Delivery Charge</Text>
                                            <Text strong>+৳{parseFloat(order.delivery_charge || 0).toLocaleString()}</Text>
                                        </Flex>
                                    )}
                                    {parseFloat(order.additional_cost || 0) > 0 && (
                                        <Flex justify="space-between" style={{ marginBottom: 8 }}>
                                            <Text type="secondary">Additional Cost</Text>
                                            <Text strong>+৳{parseFloat(order.additional_cost || 0).toLocaleString()}</Text>
                                        </Flex>
                                    )}
                                    {(parseFloat(order.special_discount || 0) + parseFloat(order.coupon_discount || 0)) > 0 && (
                                        <Flex justify="space-between" style={{ marginBottom: 8 }}>
                                            <Text type="secondary">Discount</Text>
                                            <Text type="danger" strong>-৳{(parseFloat(order.special_discount || 0) + parseFloat(order.coupon_discount || 0)).toLocaleString()}</Text>
                                        </Flex>
                                    )}
                                    <Divider style={{ margin: '12px 0' }} />
                                    <Flex justify="space-between" align="center">
                                        <Text strong style={{ fontSize: 15 }}>Total Payable</Text>
                                        <Text strong style={{ fontSize: 18, color: '#1677ff' }}>৳{parseFloat(order.total_payable_amount || 0).toLocaleString()}</Text>
                                    </Flex>
                                </div>
                            </Col>
                        </Row>
                    </div>
                )}
            </Spin>
        </Modal>
    );
};

export default OrderPreview;
