import React from 'react';
import { Typography, Row, Col, Table, Divider } from 'antd';

const { Title, Text } = Typography;

const NormalInvoice = ({ order }) => {
    if (!order) return null;

    const columns = [
        {
            title: 'SL',
            key: 'sl',
            width: 50,
            align: 'center',
            render: (_, __, index) => index + 1,
        },
        {
            title: 'Product Details',
            key: 'product',
            render: (_, record) => (
                <div>
                    <div style={{ fontWeight: 600 }}>{record.product_name}</div>
                    <div style={{ fontSize: 12, color: '#666' }}>SKU: {record.product_sku}</div>
                    {record.variant_name && <div style={{ fontSize: 12, color: '#666' }}>{record.variant_name}</div>}
                </div>
            )
        },
        {
            title: 'Price',
            dataIndex: 'sell_price',
            key: 'price',
            align: 'right',
            width: 120,
            render: (val) => `৳${parseFloat(val || 0).toLocaleString()}`
        },
        {
            title: 'Qty',
            dataIndex: 'quantity',
            key: 'qty',
            align: 'center',
            width: 80,
        },
        {
            title: 'Total',
            key: 'total',
            align: 'right',
            width: 140,
            render: (_, record) => (
                <Text strong>৳{(parseFloat(record.sell_price || 0) * parseFloat(record.quantity || 0)).toLocaleString()}</Text>
            )
        }
    ];

    return (
        <div style={{ 
            width: '210mm', 
            minHeight: '297mm', 
            padding: '20mm', 
            margin: '0 auto', 
            background: '#fff',
            color: '#000',
            fontFamily: 'Arial, sans-serif'
        }}>
            {/* Header */}
            <Row justify="space-between" align="middle" style={{ marginBottom: 30 }}>
                <Col>
                    <Title level={2} style={{ margin: 0, color: '#1677ff' }}>ECOM ERP</Title>
                    <Text type="secondary">Your Trusted Shopping Partner</Text>
                    <div style={{ marginTop: 10, fontSize: 13 }}>
                        123 Commerce St, Tech City, Dhaka<br/>
                        Phone: +880 1234 567890<br/>
                        Email: support@ecomerp.com
                    </div>
                </Col>
                <Col style={{ textAlign: 'right' }}>
                    <Title level={1} style={{ margin: 0, color: '#333', textTransform: 'uppercase', letterSpacing: 2 }}>Invoice</Title>
                    <div style={{ marginTop: 10, fontSize: 14 }}>
                        <div><Text strong>Invoice No:</Text> {order.invoice_number}</div>
                        <div><Text strong>Date:</Text> {new Date(order.order_date).toLocaleDateString('en-GB')}</div>
                        <div><Text strong>Status:</Text> <span style={{ textTransform: 'capitalize' }}>{order.paid_status}</span></div>
                    </div>
                </Col>
            </Row>

            <Divider style={{ borderColor: '#ddd' }} />

            {/* Customer & Shipping Info */}
            <Row gutter={40} style={{ marginBottom: 30 }}>
                <Col span={12}>
                    <div style={{ background: '#f8f9fa', padding: 15, borderRadius: 8, height: '100%' }}>
                        <Title level={5} style={{ marginTop: 0, marginBottom: 12, borderBottom: '2px solid #1677ff', display: 'inline-block', paddingBottom: 4 }}>Billed To:</Title>
                        <div style={{ fontSize: 14, lineHeight: 1.6 }}>
                            <div style={{ fontWeight: 'bold', fontSize: 16 }}>{order.customer_name}</div>
                            <div>Phone: {order.phone_number}</div>
                        </div>
                    </div>
                </Col>
                <Col span={12}>
                    <div style={{ background: '#f8f9fa', padding: 15, borderRadius: 8, height: '100%' }}>
                        <Title level={5} style={{ marginTop: 0, marginBottom: 12, borderBottom: '2px solid #52c41a', display: 'inline-block', paddingBottom: 4 }}>Shipped To:</Title>
                        <div style={{ fontSize: 14, lineHeight: 1.6 }}>
                            <div>{order.shipping_address}</div>
                            <div>{order.district?.name}</div>
                            {order.courier?.name && <div style={{ marginTop: 8 }}><Text strong>Courier:</Text> {order.courier.name}</div>}
                        </div>
                    </div>
                </Col>
            </Row>

            {/* Items Table */}
            <Table 
                columns={columns} 
                dataSource={order.details || []} 
                pagination={false}
                rowKey="id"
                bordered
                size="small"
                style={{ marginBottom: 30 }}
            />

            {/* Summary Calculation */}
            <Row justify="end">
                <Col span={10}>
                    <div style={{ padding: 15, background: '#fcfcfc', border: '1px solid #eee', borderRadius: 8 }}>
                        <Row justify="space-between" style={{ marginBottom: 8, fontSize: 14 }}>
                            <Col><Text type="secondary">Subtotal:</Text></Col>
                            <Col>৳{parseFloat(order.net_order_amount || 0).toLocaleString()}</Col>
                        </Row>
                        {parseFloat(order.delivery_charge || 0) > 0 && (
                            <Row justify="space-between" style={{ marginBottom: 8, fontSize: 14 }}>
                                <Col><Text type="secondary">Delivery Charge:</Text></Col>
                                <Col>+ ৳{parseFloat(order.delivery_charge || 0).toLocaleString()}</Col>
                            </Row>
                        )}
                        {parseFloat(order.additional_cost || 0) > 0 && (
                            <Row justify="space-between" style={{ marginBottom: 8, fontSize: 14 }}>
                                <Col><Text type="secondary">Additional Cost:</Text></Col>
                                <Col>+ ৳{parseFloat(order.additional_cost || 0).toLocaleString()}</Col>
                            </Row>
                        )}
                        {(parseFloat(order.special_discount || 0) + parseFloat(order.coupon_discount || 0)) > 0 && (
                            <Row justify="space-between" style={{ marginBottom: 8, fontSize: 14 }}>
                                <Col><Text type="secondary">Discount:</Text></Col>
                                <Col style={{ color: '#ff4d4f' }}>- ৳{(parseFloat(order.special_discount || 0) + parseFloat(order.coupon_discount || 0)).toLocaleString()}</Col>
                            </Row>
                        )}
                        <Divider style={{ margin: '12px 0', borderColor: '#ccc' }} />
                        <Row justify="space-between" align="middle" style={{ marginBottom: 8 }}>
                            <Col><Title level={4} style={{ margin: 0 }}>Total:</Title></Col>
                            <Col><Title level={4} style={{ margin: 0, color: '#1677ff' }}>৳{parseFloat(order.total_payable_amount || 0).toLocaleString()}</Title></Col>
                        </Row>
                        
                        <Row justify="space-between" style={{ marginBottom: 4, fontSize: 14 }}>
                            <Col><Text type="secondary">Paid (Advance):</Text></Col>
                            <Col style={{ color: '#52c41a' }}>৳{parseFloat(order.advanced_payment || 0).toLocaleString()}</Col>
                        </Row>
                        <Row justify="space-between" style={{ fontSize: 14, fontWeight: 'bold' }}>
                            <Col>Due:</Col>
                            <Col style={{ color: '#ff4d4f' }}>৳{parseFloat(order.due || 0).toLocaleString()}</Col>
                        </Row>
                    </div>
                </Col>
            </Row>

            {/* Footer */}
            <div style={{ marginTop: 50, textAlign: 'center', color: '#888', fontSize: 12, borderTop: '1px solid #eee', paddingTop: 20 }}>
                Thank you for your business! If you have any questions about this invoice, please contact our support team.<br/>
                <b>ECOM ERP</b> © {new Date().getFullYear()}
            </div>
        </div>
    );
};

export default NormalInvoice;
