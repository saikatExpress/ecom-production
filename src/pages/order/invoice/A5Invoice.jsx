import { Col, Divider, Row, Table, Typography } from 'antd';

const { Title, Text } = Typography;

const A5Invoice = ({ order }) => {
    if (!order) return null;

    const columns = 
    [
        {
            title: 'SL',
            key: 'sl',
            width: 30,
            align: 'center',
            render: (_, __, index) => index + 1,
        },
        {
            title: 'Product',
            key: 'product',
            render: (_, record) => (
                <div>
                    <div style={{ fontWeight: 600, fontSize: 11 }}>{record.product_name}</div>
                    {record.variant_name && <div style={{ fontSize: 10, color: '#666' }}>{record.variant_name}</div>}
                </div>
            )
        },
        {
            title: 'Price',
            dataIndex: 'sell_price',
            key: 'price',
            align: 'right',
            width: 70,
            render: (val) => `৳${parseFloat(val || 0).toLocaleString()}`
        },
        {
            title: 'Qty',
            dataIndex: 'quantity',
            key: 'qty',
            align: 'center',
            width: 40,
        },
        {
            title: 'Total',
            key: 'total',
            align: 'right',
            width: 80,
            render: (_, record) => (
                <Text strong>৳{(parseFloat(record.sell_price || 0) * parseFloat(record.quantity || 0)).toLocaleString()}</Text>
            )
        }
    ];

    return (
        <div style={{ 
            width: '148mm', 
            minHeight: '210mm', 
            padding: '12mm', 
            margin: '0 auto', 
            background: '#fff',
            color: '#000',
            fontFamily: 'Arial, sans-serif',
            fontSize: '11px'
        }}>
            <Row justify="space-between" align="middle" style={{ marginBottom: 15 }}>
                <Col>
                    <Title level={4} style={{ margin: 0, color: '#1677ff' }}>ECOM ERP</Title>
                    <div style={{ marginTop: 4, fontSize: 10, color: '#666' }}>
                        123 Commerce St, Tech City, Dhaka<br/>
                        Phone: +880 1234 567890
                    </div>
                </Col>
                <Col style={{ textAlign: 'right' }}>
                    <Title level={3} style={{ margin: 0, color: '#333', textTransform: 'uppercase' }}>Invoice</Title>
                    <div style={{ marginTop: 4, fontSize: 10 }}>
                        <div><Text strong>INV:</Text> {order.invoice_number}</div>
                        <div><Text strong>Date:</Text> {new Date(order.order_date).toLocaleDateString('en-GB')}</div>
                    </div>
                </Col>
            </Row>

            <Divider style={{ margin: '10px 0', borderColor: '#ddd' }} />

            <Row gutter={20} style={{ marginBottom: 15 }}>
                <Col span={12}>
                    <div style={{ background: '#f8f9fa', padding: 8, borderRadius: 6, height: '100%' }}>
                        <div style={{ fontWeight: 'bold', borderBottom: '1px solid #1677ff', display: 'inline-block', paddingBottom: 2, marginBottom: 6 }}>Billed To:</div>
                        <div style={{ lineHeight: 1.4 }}>
                            <div style={{ fontWeight: 'bold' }}>{order.customer_name}</div>
                            <div>Phone: {order.phone_number}</div>
                        </div>
                    </div>
                </Col>
                <Col span={12}>
                    <div style={{ background: '#f8f9fa', padding: 8, borderRadius: 6, height: '100%' }}>
                        <div style={{ fontWeight: 'bold', borderBottom: '1px solid #52c41a', display: 'inline-block', paddingBottom: 2, marginBottom: 6 }}>Shipped To:</div>
                        <div style={{ lineHeight: 1.4 }}>
                            <div>{order.shipping_address}</div>
                            <div>{order.district?.name}</div>
                        </div>
                    </div>
                </Col>
            </Row>

            <Table 
                columns={columns} 
                dataSource={order.details || []} 
                pagination={false}
                rowKey="id"
                bordered
                size="small"
                style={{ marginBottom: 15 }}
            />

            <Row justify="end">
                <Col span={12}>
                    <div style={{ padding: 10, background: '#fcfcfc', border: '1px solid #eee', borderRadius: 6 }}>
                        <Row justify="space-between" style={{ marginBottom: 4 }}>
                            <Col><Text type="secondary">Subtotal:</Text></Col>
                            <Col>৳{parseFloat(order.net_order_amount || 0).toLocaleString()}</Col>
                        </Row>
                        {parseFloat(order.delivery_charge || 0) > 0 && (
                            <Row justify="space-between" style={{ marginBottom: 4 }}>
                                <Col><Text type="secondary">Delivery:</Text></Col>
                                <Col>+ ৳{parseFloat(order.delivery_charge || 0).toLocaleString()}</Col>
                            </Row>
                        )}
                        {parseFloat(order.additional_cost || 0) > 0 && (
                            <Row justify="space-between" style={{ marginBottom: 4 }}>
                                <Col><Text type="secondary">Addl. Cost:</Text></Col>
                                <Col>+ ৳{parseFloat(order.additional_cost || 0).toLocaleString()}</Col>
                            </Row>
                        )}
                        {(parseFloat(order.special_discount || 0) + parseFloat(order.coupon_discount || 0)) > 0 && (
                            <Row justify="space-between" style={{ marginBottom: 4 }}>
                                <Col><Text type="secondary">Discount:</Text></Col>
                                <Col style={{ color: '#ff4d4f' }}>- ৳{(parseFloat(order.special_discount || 0) + parseFloat(order.coupon_discount || 0)).toLocaleString()}</Col>
                            </Row>
                        )}
                        <Divider style={{ margin: '8px 0', borderColor: '#ccc' }} />
                        <Row justify="space-between" align="middle" style={{ marginBottom: 6 }}>
                            <Col><strong style={{ fontSize: 13 }}>Total:</strong></Col>
                            <Col><strong style={{ fontSize: 14, color: '#1677ff' }}>৳{parseFloat(order.total_payable_amount || 0).toLocaleString()}</strong></Col>
                        </Row>
                        
                        <Row justify="space-between" style={{ marginBottom: 2 }}>
                            <Col><Text type="secondary">Paid:</Text></Col>
                            <Col style={{ color: '#52c41a' }}>৳{parseFloat(order.advanced_payment || 0).toLocaleString()}</Col>
                        </Row>
                        <Row justify="space-between" style={{ fontWeight: 'bold' }}>
                            <Col>Due:</Col>
                            <Col style={{ color: '#ff4d4f' }}>৳{parseFloat(order.due || 0).toLocaleString()}</Col>
                        </Row>
                    </div>
                </Col>
            </Row>

            <div style={{ marginTop: 30, textAlign: 'center', color: '#888', fontSize: 10, borderTop: '1px solid #eee', paddingTop: 10 }}>
                Thank you for your business!<br/>
                <b>ECOM ERP</b> © {new Date().getFullYear()}
            </div>
        </div>
    );
};

export default A5Invoice;
