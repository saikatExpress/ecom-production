import { ArrowLeftOutlined, DeleteOutlined, DesktopOutlined, MobileOutlined, PictureOutlined, ReloadOutlined, UndoOutlined } from '@ant-design/icons';
import { Button, Card, Col, Empty, Flex, Image, Modal, Row, Skeleton, Space, Tag, Tooltip, Typography, message } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useTitle from '../../../hooks/useTitle';
import { deleteData, getDatas, patchData } from '../../../services/request';

const { Title, Text } = Typography;

const SliderTrash = () => {
    // Hook
    useTitle("Slider Trash List");

    // Variable
    const navigate = useNavigate();

    // States
    const [sliders, setSliders] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchSliders = async () => {
        setLoading(true);
        try {
            const res = await getDatas("/admin/slider/trash");
            if (res?.success && res?.data) {
                setSliders(res.data.items || []);
            } else {
                setSliders([]);
            }
        } catch (error) {
            console.error("Failed to fetch slider trash", error);
            message.error("Failed to load slider trash");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSliders();
    }, []);

    const handleRestore = (id) => {
        Modal.confirm({
            title: 'Are you sure you want to restore this slider?',
            content: 'This slider will be moved back to the active list.',
            okText: 'Yes, Restore',
            cancelText: 'No',
            onOk: async () => {
                try {
                    const res = await patchData(`/admin/slider/${id}/restore`);
                    if (res?.success !== false) {
                        message.success(res?.message || 'Restored successfully');
                        setSliders(prev => prev.filter(item => item.id !== id));
                    } else {
                        message.error(res?.message || 'Failed to restore slider');
                    }
                } catch (error) {
                    console.error(error);
                    message.error(error?.response?.data?.message || 'An error occurred while restoring');
                }
            }
        });
    };

    const handlePermanentDelete = (id) => {
        Modal.confirm({
            title: 'Are you sure you want to permanently delete this slider?',
            content: 'This action cannot be undone. All data will be lost forever.',
            okText: 'Yes, Delete Permanently',
            okType: 'danger',
            cancelText: 'No',
            onOk: async () => {
                try {
                    const res = await deleteData(`/admin/slider/permanent-delete/${id}`);
                    if (res?.success !== false) {
                        message.success(res?.message || 'Deleted permanently');
                        setSliders(prev => prev.filter(item => item.id !== id));
                    } else {
                        message.error(res?.message || 'Failed to delete slider');
                    }
                } catch (error) {
                    console.error(error);
                    message.error(error?.response?.data?.message || 'An error occurred while deleting');
                }
            }
        });
    };

    return (
        <Card 
            title={
                <Flex justify="space-between" align="center" style={{ padding: '8px 0' }}>
                    <Space>
                        <Button
                            type="text"
                            icon={<ArrowLeftOutlined />}
                            onClick={() => navigate('/slider')}
                        />
                        <PictureOutlined style={{ fontSize: 24, color: '#ff4d4f' }} />
                        <Title level={4} style={{ margin: 0 }}>Slider Trash</Title>
                    </Space>
                    <Space>
                        <Tooltip title="Refresh">
                            <Button shape="circle" icon={<ReloadOutlined />} onClick={fetchSliders} />
                        </Tooltip>
                    </Space>
                </Flex>
            }
            bordered={false}
            styles={{ body: { padding: '24px 0' } }}
            style={{ background: 'transparent' }}
        >
            {loading ? (
                <Row gutter={[24, 24]}>
                    {Array.from({ length: 4 }).map((_, index) => (
                        <Col xs={24} sm={12} lg={12} xl={8} key={index}>
                            <Card 
                                cover={<Skeleton.Image active style={{ width: '100%', height: 220 }} />}
                                styles={{ body: { padding: 20 } }}
                            >
                                <Skeleton active paragraph={{ rows: 2 }} />
                            </Card>
                        </Col>
                    ))}
                </Row>
            ) : sliders.length > 0 ? (
                <Row gutter={[24, 24]}>
                    {sliders.map(slider => (
                        <Col xs={24} sm={12} lg={12} xl={8} xxl={6} key={slider.id}>
                            <Card
                                hoverable
                                styles={{ 
                                    body: { padding: 20 },
                                }}
                                style={{ 
                                    borderRadius: 16, 
                                    overflow: 'hidden', 
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                                    transition: 'all 0.3s',
                                    border: '1px solid #ffccc7'
                                }}
                                cover={
                                    <div style={{ height: 220, overflow: 'hidden', position: 'relative', backgroundColor: '#f0f0f0' }}>
                                        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(255,255,255,0.4)', zIndex: 1 }} />
                                        <Image 
                                            src={slider.image} 
                                            alt={slider.name}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(100%)' }}
                                            fallback="https://via.placeholder.com/600x400?text=Image+Not+Found"
                                            preview={false}
                                        />
                                        <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 8, zIndex: 2 }}>
                                            <Tag 
                                                color="#ff4d4f"
                                                style={{ margin: 0, borderRadius: 12, fontWeight: 600, border: 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
                                            >
                                                TRASHED
                                            </Tag>
                                        </div>
                                        <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 8, zIndex: 2 }}>
                                            <Tag 
                                                color={slider.device_type === 'desktop' ? 'geekblue' : 'purple'} 
                                                icon={slider.device_type === 'desktop' ? <DesktopOutlined /> : <MobileOutlined />}
                                                style={{ margin: 0, borderRadius: 12, fontWeight: 600, border: 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
                                            >
                                                {slider.device_type?.toUpperCase()}
                                            </Tag>
                                        </div>
                                    </div>
                                }
                            >
                                <div style={{ minHeight: 70, marginBottom: 16 }}>
                                    <Title level={5} ellipsis={{ rows: 1, tooltip: slider.name }} style={{ marginTop: 0, marginBottom: 8, color: '#8c8c8c' }}>
                                        {slider.name}
                                    </Title>

                                    <Flex justify="space-between" align="center" style={{ marginTop: 16 }}>
                                        <Text type="secondary" style={{ fontSize: '12px' }}>
                                            Deleted by <Text strong style={{ color: '#595959' }}>{slider.deleted_by?.username || 'Unknown'}</Text>
                                        </Text>
                                        <Text type="secondary" style={{ fontSize: '11px' }}>
                                            {new Date(slider.deleted_at).toLocaleDateString()}
                                        </Text>
                                    </Flex>
                                </div>
                                <Flex gap="middle">
                                    <Button 
                                        type="primary" 
                                        icon={<UndoOutlined />} 
                                        onClick={() => handleRestore(slider.id)} 
                                        style={{ flex: 1 }}
                                    >
                                        Restore
                                    </Button>
                                    <Button 
                                        danger 
                                        icon={<DeleteOutlined />} 
                                        onClick={() => handlePermanentDelete(slider.id)}
                                        style={{ flex: 1 }}
                                    >
                                        Delete Forever
                                    </Button>
                                </Flex>
                            </Card>
                        </Col>
                    ))}
                </Row>
            ) : (
                <Empty 
                    image={Empty.PRESENTED_IMAGE_SIMPLE} 
                    description={
                        <Space direction="vertical">
                            <Text type="secondary">Trash is empty.</Text>
                            <Button type="primary" onClick={() => navigate("/slider")}>
                                Back to Sliders
                            </Button>
                        </Space>
                    }
                    style={{ background: '#fff', padding: '48px 0', borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
                />
            )}
        </Card>
    );
};

export default SliderTrash;