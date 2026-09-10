import { Modal, Row, Col, Typography, Tag, Divider, Carousel, Image, Descriptions, Badge, Space, Table, Tabs, Spin } from 'antd';
import { ShoppingOutlined, CloseCircleOutlined } from '@ant-design/icons';
import React from 'react';

const { Title, Text } = Typography;

export default function ProductPreviewModal({ visible, onClose, product, loading }) {
    if (loading) {
        return (
            <Modal open={visible} footer={null} closable={false} centered bodyStyle={{ padding: '60px', textAlign: 'center' }}>
                <Spin size="large" tip="Loading product details..." />
            </Modal>
        );
    }

    if (!product) return null;

    // Carousel for main image + gallery
    const images = [];
    if (product.image) images.push(product.image);
    if (product.gallery_images?.length > 0) {
        product.gallery_images.forEach(g => images.push(g.image));
    }

    const variantColumns = [
        {
            title: 'Image',
            key: 'image',
            width: 80,
            render: (_, variant) => (
                <Image src={variant.image} width={50} height={50} style={{ objectFit: 'cover', borderRadius: '4px' }} />
            )
        },
        {
            title: 'SKU & Attributes',
            key: 'sku',
            render: (_, variant) => (
                <Space direction="vertical" size={0}>
                    <Text strong>{variant.attribute_values.map(a => `${a.attribute_name}: ${a.value}`).join(' | ')}</Text>
                    <Text type="secondary" style={{ fontSize: '12px' }}>{variant.sku}</Text>
                </Space>
            )
        },
        {
            title: 'Price',
            key: 'price',
            render: (_, variant) => (
                <Space direction="vertical" size={0}>
                    <Text strong style={{ color: "#cf1322" }}>৳{variant.sell_price}</Text>
                    {variant.mrp && Number(variant.mrp) > Number(variant.sell_price) && (
                        <Text delete type="secondary" style={{ fontSize: '11px' }}>৳{variant.mrp}</Text>
                    )}
                </Space>
            )
        },
        {
            title: 'Stock',
            dataIndex: 'current_stock',
            key: 'stock',
            render: (stock) => <Badge status={stock > 0 ? "success" : "error"} text={stock} />
        },
        {
            title: 'Status',
            key: 'status',
            render: (_, variant) => (
                <Tag color={variant.status === 'active' ? 'success' : 'error'} style={{ textTransform: 'capitalize' }}>{variant.status}</Tag>
            )
        }
    ];

    return (
        <Modal
            title={null}
            open={visible}
            onCancel={onClose}
            footer={null}
            width={1000}
            centered
            bodyStyle={{ padding: 0 }}
            closeIcon={<CloseCircleOutlined style={{ fontSize: '24px', color: '#fff', background: '#000', borderRadius: '50%', border: '2px solid #fff' }} />}
        >
            <div style={{ backgroundColor: '#fafafa', padding: '40px 40px 16px 40px', borderTopLeftRadius: '8px', borderTopRightRadius: '8px' }}>
                <Row gutter={[40, 40]}>
                    <Col xs={24} md={10}>
                        {images.length > 0 ? (
                            <Carousel autoplay effect="fade" style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: '12px', overflow: 'hidden' }}>
                                {images.map((img, idx) => (
                                    <div key={idx}>
                                        <Image src={img} width="100%" height={400} style={{ objectFit: 'contain', background: '#f5f5f5' }} />
                                    </div>
                                ))}
                            </Carousel>
                        ) : (
                            <div style={{ width: '100%', height: 400, background: '#e6f7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px' }}>
                                <Text type="secondary">No Image Available</Text>
                            </div>
                        )}
                    </Col>

                    <Col xs={24} md={14}>
                        <Space direction="vertical" size="small" style={{ width: '100%' }}>
                            <Space wrap>
                                <Tag color="cyan" style={{ padding: '2px 10px', borderRadius: '12px' }}>{product.category?.name || 'Uncategorized'}</Tag>
                                {product.subCategory && <Tag style={{ padding: '2px 10px', borderRadius: '12px' }}>{product.subCategory.name}</Tag>}
                                {product.brand && <Tag color="purple" style={{ padding: '2px 10px', borderRadius: '12px' }}>{product.brand.name}</Tag>}
                            </Space>

                            <Title level={2} style={{ margin: '8px 0', fontWeight: 'bold' }}>{product.name}</Title>
                            
                            <Space size="middle" align="center">
                                <Text type="secondary" style={{ fontFamily: 'monospace', background: '#e6f4ff', padding: '4px 10px', borderRadius: '6px', fontSize: '13px' }}>
                                    {product.sku}
                                </Text>
                                <Tag color={product.status === 'active' ? 'success' : 'error'} style={{ textTransform: 'uppercase', borderRadius: '6px' }}>
                                    {product.status}
                                </Tag>
                            </Space>

                            <Divider style={{ margin: '20px 0' }} />

                            <Descriptions column={2} size="middle" labelStyle={{ color: '#8c8c8c' }} contentStyle={{ fontWeight: '500' }}>
                                <Descriptions.Item label="Sell Price">
                                    <Text strong style={{ fontSize: '20px', color: '#cf1322' }}>
                                        ৳{product.sell_price}
                                    </Text>
                                </Descriptions.Item>
                                {product.mrp && Number(product.mrp) > Number(product.sell_price) && (
                                    <Descriptions.Item label="MRP">
                                        <Text delete type="secondary" style={{ fontSize: '16px' }}>৳{product.mrp}</Text>
                                    </Descriptions.Item>
                                )}
                                <Descriptions.Item label="Current Stock">
                                    <Badge status={product.current_stock > 0 ? "success" : "error"} text={<Text strong style={{ fontSize: '16px' }}>{product.current_stock}</Text>} />
                                </Descriptions.Item>
                                <Descriptions.Item label="Total Sales">
                                    <Text strong style={{ fontSize: '16px' }}><ShoppingOutlined style={{ marginRight: 4 }} />{product.total_sell_quantity}</Text>
                                </Descriptions.Item>
                            </Descriptions>

                            {product.variation_price_range && (
                                <div style={{ background: '#f6ffed', padding: '10px 16px', borderRadius: '8px', border: '1px solid #b7eb8f', marginTop: 12 }}>
                                    <Text type="success" strong style={{ fontSize: '15px' }}>
                                        Variable Price Range: ৳{product.variation_price_range.min_price} - ৳{product.variation_price_range.max_price}
                                    </Text>
                                </div>
                            )}

                        </Space>
                    </Col>
                </Row>
            </div>

            <div style={{ padding: '0 40px 40px 40px', background: '#fafafa', borderBottomLeftRadius: '8px', borderBottomRightRadius: '8px' }}>
                <Tabs
                    defaultActiveKey="1"
                    style={{ marginTop: 8 }}
                    items={[
                        {
                            key: '1',
                            label: <span style={{ fontSize: '16px', fontWeight: 'bold' }}>Description</span>,
                            children: (
                                <div style={{ padding: '24px', background: '#fff', border: '1px solid #e8e8e8', borderRadius: '12px' }}>
                                    <Title level={5} style={{ color: '#1890ff' }}>Short Description</Title>
                                    <div dangerouslySetInnerHTML={{ __html: product.short_description || '<span style="color:#bfbfbf">No short description available</span>' }} style={{ color: '#595959', lineHeight: '1.6' }} />
                                    
                                    <Divider />
                                    
                                    <Title level={5} style={{ color: '#1890ff' }}>Detailed Description</Title>
                                    <div dangerouslySetInnerHTML={{ __html: product.description || '<span style="color:#bfbfbf">No detailed description available</span>' }} style={{ color: '#595959', lineHeight: '1.6' }} />
                                </div>
                            )
                        },
                        {
                            key: '2',
                            label: <span style={{ fontSize: '16px', fontWeight: 'bold' }}>Variants ({product.variants?.length || 0})</span>,
                            children: (
                                <div style={{ background: '#fff', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e8e8e8' }}>
                                    <Table 
                                        columns={variantColumns} 
                                        dataSource={product.variants || []} 
                                        rowKey="id" 
                                        pagination={false} 
                                        size="middle"
                                    />
                                </div>
                            )
                        }
                    ]}
                />
            </div>
        </Modal>
    );
}
