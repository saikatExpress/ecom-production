import { CheckCircleOutlined, CloseCircleOutlined, CodeSandboxOutlined } from '@ant-design/icons';
import { Avatar, Badge, Card, Col, Divider, Empty, Row, Spin, Statistic, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { postData } from '../../services/request';

const { Text, Title } = Typography;

const CourierHistory = ({ phone }) => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);

    useEffect(() => {
        if (!phone) return;
        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await postData("/admin/fraud-cheker", { phone: phone });
                
                if (res?.success && res?.data?.data) {
                    setData(res.data.data);
                } else {
                    setData(null);
                }
            } catch (error) {
                console.error("Failed to fetch courier history", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [phone]);

    if (loading) {
        return (
            <div style={{ width: 450, padding: '40px 20px', textAlign: 'center' }}>
                <Spin tip="Checking fraud history..." />
            </div>
        );
    }

    if (!data) {
        return (
            <div style={{ width: 450, padding: 20 }}>
                <Empty description="No history found for this customer" />
            </div>
        );
    }

    const { summary, ...couriers } = data;
    const courierKeys = Object.keys(couriers).filter(key => key !== 'reports' && couriers[key]?.name);
    const courierList = courierKeys.map(key => couriers[key]).filter(c => c.total_parcel > 0);

    return (
        <div style={{ width: 450, padding: '4px' }}>
            <Title level={5} style={{ marginTop: 0, marginBottom: 16 }}>Customer Courier History</Title>
            
            {summary && (
                <div style={{ 
                    background  : '#f0f5ff',
                    padding     : '12px 16px',
                    borderRadius: 8,
                    marginBottom: 20,
                    border      : '1px solid #d6e4ff'
                }}>
                    <Row gutter={16} justify="space-between" align="middle">
                        <Col span={6} style={{ textAlign: 'center' }}>
                            <Statistic 
                                title={<Text type="secondary" style={{ fontSize: 11 }}>Total</Text>} 
                                value={summary.total_parcel} 
                                valueStyle={{ fontSize: 18, fontWeight: 700 }} 
                                prefix={<CodeSandboxOutlined style={{ fontSize: 14 }} />} 
                            />
                        </Col>
                        <Col span={6} style={{ textAlign: 'center' }}>
                            <Statistic 
                                title={<Text type="secondary" style={{ fontSize: 11 }}>Success</Text>} 
                                value={summary.success_parcel} 
                                valueStyle={{ color: '#3f8600', fontSize: 18, fontWeight: 700 }} 
                                prefix={<CheckCircleOutlined style={{ fontSize: 14 }} />} 
                            />
                        </Col>
                        <Col span={6} style={{ textAlign: 'center' }}>
                            <Statistic 
                                title={<Text type="secondary" style={{ fontSize: 11 }}>Cancelled</Text>} 
                                value={summary.cancelled_parcel} 
                                valueStyle={{ color: '#cf1322', fontSize: 18, fontWeight: 700 }} 
                                prefix={<CloseCircleOutlined style={{ fontSize: 14 }} />} 
                            />
                        </Col>
                        <Col span={6} style={{ textAlign: 'center' }}>
                            <Statistic 
                                title={<Text type="secondary" style={{ fontSize: 11 }}>Success Rate</Text>} 
                                value={summary.success_ratio} 
                                precision={0}
                                valueStyle={{ 
                                    color: summary.success_ratio >= 50 ? '#3f8600' : (summary.success_ratio >= 20 ? '#faad14' : '#cf1322'), 
                                    fontSize: 18, 
                                    fontWeight: 700 
                                }} 
                                suffix="%" 
                            />
                        </Col>
                    </Row>
                </div>
            )}

            {courierList.length > 0 && (
                <>
                    <Divider style={{ margin: '12px 0' }} orientation="left" plain>
                        <Text type="secondary" style={{ fontSize: 12 }}>Courier Breakdown</Text>
                    </Divider>
                    
                    <div style={{ maxHeight: 280, overflowY: 'auto', paddingRight: 4 }}>
                        {courierList.map((courier, index) => (
                            <Card 
                                key={index} 
                                size="small" 
                                bordered={true}
                                style={{ marginBottom: 8, borderRadius: 8, boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}
                                bodyStyle={{ padding: '10px 12px' }}
                            >
                                <Row align="middle" justify="space-between">
                                    <Col>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <Avatar 
                                                src={courier.logo} 
                                                shape="square" 
                                                size={36} 
                                                style={{ border: '1px solid #f0f0f0', background: '#fff', padding: 2 }} 
                                            />
                                            <div style={{ lineHeight: 1.3 }}>
                                                <Text strong style={{ fontSize: 13 }}>{courier.name}</Text>
                                                <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>
                                                    T: <b style={{ color: '#333' }}>{courier.total_parcel}</b> &nbsp;|&nbsp; 
                                                    S: <b style={{ color: '#3f8600' }}>{courier.success_parcel}</b> &nbsp;|&nbsp; 
                                                    C: <b style={{ color: '#cf1322' }}>{courier.cancelled_parcel}</b>
                                                </div>
                                            </div>
                                        </div>
                                    </Col>
                                    <Col>
                                        <Badge 
                                            count={`${courier.success_ratio}%`} 
                                            style={{ 
                                                backgroundColor: courier.success_ratio >= 50 ? '#52c41a': (courier.success_ratio >= 20 ? '#faad14' : '#ff4d4f'),
                                                color          : '#fff',
                                                fontWeight     : 'bold',
                                                boxShadow      : 'none',
                                                borderRadius   : 12
                                            }} 
                                        />
                                    </Col>
                                </Row>
                            </Card>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default CourierHistory;
