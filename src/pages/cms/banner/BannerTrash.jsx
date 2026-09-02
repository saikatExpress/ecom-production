import { ArrowLeftOutlined, DeleteOutlined, PictureOutlined, ReloadOutlined, UndoOutlined } from '@ant-design/icons';
import { Button, Card, Flex, Image, Modal, Space, Table, Tag, Tooltip, Typography, message } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import usePermissions from '../../../hooks/usePermissions';
import useTitle from '../../../hooks/useTitle';
import { deleteData, getDatas, patchData } from '../../../services/request';

const { Title, Text } = Typography;

const BannerTrash = () => {
    // Hook
    useTitle("Banner Trash List");

    // Variable
    const navigate          = useNavigate();
    const { hasPermission } = usePermissions();

    // States
    const [banners, setBanners]         = useState([]);
    const [loading, setLoading]         = useState(false);
    const [tableParams, setTableParams] = useState({
        pagination: {
            current : 1,
            pageSize: 25,
            total   : 0
        },
    });

    const fetchBanners = async (page = 1, pageSize = 25) => {
        setLoading(true);
        try {
            const res = await getDatas(`/admin/banner/trash?page=${page}&per_page=${pageSize}`);
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
            console.error("Failed to fetch banner trash", error);
            message.error("Failed to load banner trash");
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

    const handleRestore = (id) => {
        Modal.confirm({
            title: 'Are you sure you want to restore this banner?',
            content: 'This banner will be moved back to the active list.',
            okText: 'Yes, Restore',
            cancelText: 'No',
            onOk: async () => {
                try {
                    const res = await patchData(`/admin/banner/${id}/restore`);
                    if (res?.success !== false) {
                        message.success(res?.message || 'Restored successfully');
                        fetchBanners(tableParams.pagination.current, tableParams.pagination.pageSize);
                    } else {
                        message.error(res?.message || 'Failed to restore banner');
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
            title: 'Are you sure you want to permanently delete this banner?',
            content: 'This action cannot be undone. All data will be lost forever.',
            okText: 'Yes, Delete Permanently',
            okType: 'danger',
            cancelText: 'No',
            onOk: async () => {
                try {
                    const res = await deleteData(`/admin/banner/permanent-delete/${id}`);
                    if (res?.success !== false) {
                        message.success(res?.message || 'Deleted permanently');
                        fetchBanners(tableParams.pagination.current, tableParams.pagination.pageSize);
                    } else {
                        message.error(res?.message || 'Failed to delete banner');
                    }
                } catch (error) {
                    console.error(error);
                    message.error(error?.response?.data?.message || 'An error occurred while deleting');
                }
            }
        });
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
                    style={{ width: 100, height: 60, objectFit: 'cover', borderRadius: 4, filter: 'grayscale(100%)' }}
                    fallback="https://via.placeholder.com/100x60?text=No+Image"
                />
            )
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (name) => <Text type="secondary" strong>{name}</Text>
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
            title: 'Deleted By',
            dataIndex: 'deleted_by',
            key: 'deleted_by',
            render: (deletedBy) => deletedBy?.username || 'Unknown'
        },
        {
            title: 'Deleted At',
            dataIndex: 'deleted_at',
            key: 'deleted_at',
            render: (date) => new Date(date).toLocaleDateString()
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    {hasPermission('banner_delete') && (
                        <>
                            <Tooltip title="Restore">
                                <Button type="primary" icon={<UndoOutlined />} onClick={() => handleRestore(record.id)} />
                            </Tooltip>
                            <Tooltip title="Delete Permanently">
                                <Button danger icon={<DeleteOutlined />} onClick={() => handlePermanentDelete(record.id)}/>
                            </Tooltip>
                        </>
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
                        <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/banner')}/>
                        <PictureOutlined style={{ fontSize: 24, color: '#ff4d4f' }} />
                        <Title level={4} style={{ margin: 0 }}>Banner Trash List</Title>
                    </Space>

                    <Space>
                        <Tooltip title="Refresh">
                            <Button shape="circle" icon={<ReloadOutlined />} onClick={() => fetchBanners(tableParams.pagination.current, tableParams.pagination.pageSize)} />
                        </Tooltip>
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

export default BannerTrash;