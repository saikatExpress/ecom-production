import { DeleteOutlined, DesktopOutlined, EditOutlined, LinkOutlined, MobileOutlined, PictureOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { Button, Card, Col, Empty, Flex, Image, Popconfirm, Row, Skeleton, Space, Tag, Tooltip, Typography, message } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import usePermissions from '../../../hooks/usePermissions';
import useTitle from './../../../hooks/useTitle';
import { deleteData, getDatas } from './../../../services/request';

const { Title, Text } = Typography;

const Slider = () => {
    // Hook
    useTitle("All Sliders");

    // Variable
    const navigate        = useNavigate();
    const {hasPermission} = usePermissions();

    // States
    const [sliders, setSliders] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchSliders = async () => {
        setLoading(true);
        try {
            const res = await getDatas("/admin/slider");
            if (res?.success && res?.data) {
                setSliders(res.data.items || []);
            } else {
                setSliders([]);
            }
        } catch (error) {
            console.error("Failed to fetch sliders", error);
            message.error("Failed to load sliders");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSliders();
    }, []);

    const handleDelete = async (id) => {
        try {
            const res = await deleteData(`/admin/slider/${id}`);
            if (res?.success !== false) {
                message.success(res?.message || "Slider deleted successfully");
                fetchSliders();
            } else {
                message.error(res?.message || "Failed to delete slider");
            }
        } catch (error) {
            console.error(error);
            message.error(error?.response?.data?.message || "An error occurred");
        }
    };

    return (
        <Card 
            title={
                <Flex justify="space-between" align="center" style={{ padding: '8px 0' }}>
                    <Space>
                        <PictureOutlined style={{ fontSize: 24, color: '#1890ff' }} />
                        <Title level={4} style={{ margin: 0 }}>Sliders Gallery</Title>
                    </Space>

                    <Space>
                        <Tooltip title="Refresh">
                            <Button shape="circle" icon={<ReloadOutlined />} onClick={fetchSliders} />
                        </Tooltip>

                        {hasPermission('slider_delete') && (
                            <Button danger icon={<DeleteOutlined />} onClick={() => navigate("/trash/slider")} shape="round">
                                Trash
                            </Button>
                        )}

                        {hasPermission('slider_create') && (
                            <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate("/create/slider")} shape="round">
                                Add New Slider
                            </Button>
                        )}
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
                            <Card cover={<Skeleton.Image active style={{ width: '100%', height: 220 }} />} styles={{ body: { padding: 20 } }}>
                                <Skeleton active paragraph={{ rows: 2 }} />
                            </Card>
                        </Col>
                    ))}
                </Row>
            ) : sliders.length > 0 ? (
                <Row gutter={[24, 24]}>
                    {sliders.map(slider => (
                        <Col xs={24} sm={12} lg={12} xl={8} xxl={6} key={slider.id}>
                            <Card hoverable styles={{ body: { padding: 20 }, actions: { background: '#fafafa', borderTop: '1px solid #f0f0f0' }}}
                                style={{ 
                                    borderRadius: 16,
                                    overflow    : 'hidden',
                                    boxShadow   : '0 4px 20px rgba(0,0,0,0.08)',
                                    transition  : 'all 0.3s'
                                }}
                                cover={
                                    <div style={{ height: 220, overflow: 'hidden', position: 'relative', backgroundColor: '#f0f0f0' }}>
                                        <Image 
                                            src={slider.image} 
                                            alt={slider.name}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            fallback="https://via.placeholder.com/600x400?text=Image+Not+Found"
                                            preview={{
                                                mask: <Space><PictureOutlined /> Preview</Space>
                                            }}
                                        />
                                        <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 8 }}>
                                            <Tag 
                                                color={slider.status === 'active' ? '#52c41a' : '#ff4d4f'}
                                                style={{ margin: 0, borderRadius: 12, fontWeight: 600, border: 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
                                            >
                                                {slider.status?.toUpperCase()}
                                            </Tag>
                                        </div>
                                        <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 8 }}>
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
                                    <Title level={5} ellipsis={{ rows: 1, tooltip: slider.name }} style={{ marginTop: 0, marginBottom: 8 }}>
                                        {slider.name}
                                    </Title>
                                    
                                    {slider.link ? (
                                        <a href={slider.link} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#595959' }}>
                                            <LinkOutlined style={{ color: '#1890ff' }} />
                                            <Text ellipsis={{ tooltip: slider.link }} style={{ maxWidth: '90%', color: 'inherit' }}>
                                                {slider.link}
                                            </Text>
                                        </a>
                                    ) : (
                                        <Text type="secondary" italic>No link attached</Text>
                                    )}

                                    <Flex justify="space-between" align="center" style={{ marginTop: 16 }}>
                                        <Text type="secondary" style={{ fontSize: '12px' }}>
                                            Added by <Text strong style={{ color: '#595959' }}>{slider.created_by?.username || 'Unknown'}</Text>
                                        </Text>
                                        <Text type="secondary" style={{ fontSize: '11px' }}>
                                            {new Date(slider.created_at).toLocaleDateString()}
                                        </Text>
                                    </Flex>
                                </div>
                                <Flex gap="middle">
                                    {hasPermission('slider_update') && (
                                        <Button type="primary" ghost icon={<EditOutlined />} onClick={() => navigate(`/edit/slider/${slider.id}`)} style={{ flex: 1 }}>
                                            Edit
                                        </Button>
                                    )}

                                    {hasPermission('slider_delete') && (
                                        <Popconfirm title="Delete the slider" description="Are you sure to delete this slider?" onConfirm={() => handleDelete(slider.id)}okText="Yes" cancelText="No" placement="topRight">
                                            <Button danger icon={<DeleteOutlined />} style={{ flex: 1 }}>
                                                Delete
                                            </Button>
                                        </Popconfirm>
                                    )}
                                </Flex>
                            </Card>
                        </Col>
                    ))}
                </Row>
            ) : (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} 
                    description={
                        <Space direction="vertical">
                            <Text type="secondary">No sliders available.</Text>
                            <Button type="primary" onClick={() => navigate("/create/slider")}>
                                Create First Slider
                            </Button>
                        </Space>
                    }
                    style={{ background: '#fff', padding: '48px 0', borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
                />
            )}
        </Card>
    );
};

export default Slider;