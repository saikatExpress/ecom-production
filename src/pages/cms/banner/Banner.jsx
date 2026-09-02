import { DeleteOutlined, EditOutlined, PictureOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { Button, Card, Flex, Image, Popconfirm, Space, Table, Tag, Tooltip, Typography, message } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import usePermissions from '../../../hooks/usePermissions';
import useTitle from '../../../hooks/useTitle';
import { deleteData, getDatas } from '../../../services/request';

const { Title, Text } = Typography;

const Banner = () => {
    // Hook
    useTitle("All Banners");

    // Variable
    const navigate = useNavigate();
    const { hasPermission } = usePermissions();

    // States
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(false);
    const [tableParams, setTableParams] = useState({
        pagination: {
            current: 1,
            pageSize: 25,
            total: 0
        },
    });

    const fetchBanners = async (page = 1, pageSize = 25) => {
        setLoading(true);
        try {
            const res = await getDatas(`/admin/banner?page=${page}&per_page=${pageSize}`);
            if (res?.success && res?.data) {
                setBanners(res.data.items || res.data || []);
                if (res.data.pagination) {
                    setTableParams({
                        pagination: {
                            current: res.data.pagination.current_page,
                            pageSize: res.data.pagination.per_page,
                            total: res.data.pagination.total,
                        }
                    });
                }
            } else {
                setBanners([]);
            }
        } catch (error) {
            console.error("Failed to fetch banners", error);
            message.error("Failed to load banners");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBanners(tableParams.pagination.current, tableParams.pagination.pageSize);
    }, []);

    const handleTableChange = (pagination) => {
        fetchBanners(pagination.current, pagination.pageSize);
    };

    const handleDelete = async (id) => {
        try {
            const res = await deleteData(`/admin/banner/${id}`);
            if (res?.success !== false) {
                message.success(res?.message || "Banner deleted successfully");
                fetchBanners(tableParams.pagination.current, tableParams.pagination.pageSize);
            } else {
                message.error(res?.message || "Failed to delete banner");
            }
        } catch (error) {
            console.error(error);
            message.error(error?.response?.data?.message || "An error occurred");
        }
    };

    const columns = 
    [
        {
            title: 'SL',
            key: 'sl',
            width: 60,
            align: 'center',
            render: (_, __, index) => (tableParams.pagination.current - 1) * tableParams.pagination.pageSize + index + 1,
        },
        {
            title: 'Image',
            dataIndex: 'image',
            key: 'image',
            render: (image) => (
                <Image 
                    src={image} 
                    alt="banner"
                    style={{ width: 100, height: 60, objectFit: 'cover', borderRadius: 4 }}
                    fallback="https://via.placeholder.com/100x60?text=No+Image"
                />
            )
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (name) => <Text strong>{name}</Text>
        },
        {
            title: 'Section',
            dataIndex: 'section',
            key: 'section',
            render: (section) => section?.name || 'N/A'
        },
        {
            title: 'Device Type',
            dataIndex: 'device_type',
            key: 'device_type',
            render: (type) => (
                <Tag color={type === 'desktop' ? 'geekblue' : 'purple'} style={{ textTransform: 'capitalize' }}>
                    {type}
                </Tag>
            )
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={status === 'active' ? 'success' : 'error'} style={{ textTransform: 'capitalize' }}>
                    {status}
                </Tag>
            )
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    {hasPermission('banner_update') && (
                        <Tooltip title="Edit">
                            <Button type="primary" ghost icon={<EditOutlined />} onClick={() => navigate(`/edit/banner/${record.id}`)} />
                        </Tooltip>
                    )}
                    {hasPermission('banner_delete') && (
                        <Popconfirm title="Delete the banner" 
                            description="Are you sure to delete this banner?" 
                            onConfirm={() => handleDelete(record.id)}
                            okText="Yes" 
                            cancelText="No"
                            placement="topRight"
                        >
                            <Tooltip title="Delete">
                                <Button danger icon={<DeleteOutlined />} />
                            </Tooltip>
                        </Popconfirm>
                    )}
                </Space>
            )
        }
    ];

    return (
        <Card 
            title={
                <Flex justify="space-between" align="center" style={{ padding: '8px 0' }}>
                    <Space>
                        <PictureOutlined style={{ fontSize: 24, color: '#1890ff' }} />
                        <Title level={4} style={{ margin: 0 }}>Banners List</Title>
                    </Space>

                    <Space>
                        <Tooltip title="Refresh">
                            <Button shape="circle" icon={<ReloadOutlined />} onClick={() => fetchBanners(tableParams.pagination.current, tableParams.pagination.pageSize)} />
                        </Tooltip>

                        {hasPermission('banner_delete') && (
                            <Button danger icon={<DeleteOutlined />} onClick={() => navigate("/trash/banner")} shape="round">
                                Trash
                            </Button>
                        )}

                        {hasPermission('banner_create') && (
                            <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate("/create/banner")} shape="round">
                                Add New Banner
                            </Button>
                        )}
                    </Space>
                </Flex>
            }
            bordered={false}
            style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
        >
            <Table 
                columns={columns} 
                dataSource={banners} 
                rowKey="id" 
                loading={loading}
                scroll={{ x: 800 }}
                onChange={handleTableChange}
                pagination={{
                    ...tableParams.pagination,
                    showSizeChanger: true,
                    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                }}
            />
        </Card>
    );
};

export default Banner;