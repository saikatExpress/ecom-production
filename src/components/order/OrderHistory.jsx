import React, { useEffect, useState } from 'react';
import { Modal, Timeline, Spin, Typography, Tag, Empty } from 'antd';
import { ClockCircleOutlined, UserOutlined } from '@ant-design/icons';
import { getDatas } from '../../services/request';

const { Text } = Typography;

const OrderHistory = ({ open, onClose, orderId }) => {
    const [loading, setLoading] = useState(false);
    const [historyData, setHistoryData] = useState([]);

    useEffect(() => {
        if (open && orderId) {
            fetchHistory();
        } else {
            setHistoryData([]);
        }
    }, [open, orderId]);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const res = await getDatas("/admin/order/history", { order_id: orderId });
            if (res?.success && res?.data) {
                setHistoryData(res.data);
            }
        } catch (error) {
            console.error("Failed to fetch order history", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Order History"
            open={open}
            onCancel={onClose}
            footer={null}
            destroyOnClose
            width={600}
            styles={{ body: { padding: '24px 24px 12px' } }}
        >
            <Spin spinning={loading}>
                {historyData.length > 0 ? (
                    <Timeline mode="alternate" style={{ marginTop: 20 }}>
                        {historyData.map((item, index) => (
                            <Timeline.Item 
                                key={item.id} 
                                color={index === historyData.length - 1 ? 'green' : 'blue'}
                                dot={index === historyData.length - 1 ? <ClockCircleOutlined style={{ fontSize: '16px' }} /> : null}
                            >
                                <div style={{ marginBottom: 6 }}>
                                    <Tag color="blue" style={{ border: 'none', fontWeight: 600, margin: 0 }}>
                                        {item.status?.name}
                                    </Tag>
                                </div>
                                <div style={{ fontSize: 13, color: '#555', marginBottom: 4 }}>
                                    <UserOutlined style={{ marginRight: 4 }} /> 
                                    <Text strong>{item.updated_by?.username || 'System'}</Text>
                                </div>
                                <div style={{ fontSize: 12, color: '#888' }}>
                                    {new Date(item.created_at).toLocaleString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}
                                </div>
                            </Timeline.Item>
                        ))}
                    </Timeline>
                ) : (
                    !loading && <Empty description="No history available" />
                )}
            </Spin>
        </Modal>
    );
};

export default OrderHistory;
