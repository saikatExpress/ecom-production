import { ArrowLeftOutlined, DeleteOutlined, ReloadOutlined, UndoOutlined } from "@ant-design/icons";
import { Breadcrumb, Button, Card, Flex, Popconfirm, Space, Table, Tag, Tooltip, Typography, message } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import usePermissions from "../../../hooks/usePermissions";
import useTitle from "../../../hooks/useTitle";
import { deleteData, getDatas, patchData } from "../../../services/request";

const { Title, Text } = Typography;

const StatusTrash = () => {
    // Hook
    useTitle("Status Trash List");

    // Variable
    const navigate          = useNavigate();
    const { hasPermission } = usePermissions();

      // States
    const [statuses, setStatuses]       = useState([]);
    const [loading, setLoading]         = useState(false);
    const [tableParams, setTableParams] = useState({
        pagination: {
            current : 1,
            pageSize: 25,
            total   : 0
        },
    });

    const fetchStatuses = async (page = 1, pageSize = 25) => {
        setLoading(true);
        try {
            const res = await getDatas(`/admin/status/trash?page=${page}&per_page=${pageSize}`);
            if (res?.success && res?.data) {
                const items = Array.isArray(res.data.data) ? res.data.data : (res.data.items || res.data || []);
                
                setStatuses(items);
                
                if (res.data.current_page !== undefined) {
                    setTableParams({
                        pagination: {
                            current : res.data.current_page,
                            pageSize: res.data.per_page,
                            total   : res.data.total,
                        }
                    });
                }
            } else {
                setStatuses([]);
            }
        } catch (error) {
            console.error("Failed to fetch status trash", error);
            message.error("Failed to load status trash");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatuses(tableParams.pagination.current, tableParams.pagination.pageSize);
    }, []);

    const handleTableChange = (pagination) => {
        fetchStatuses(pagination.current, pagination.pageSize);
    };

    const handleRefresh = () => {
        fetchStatuses(tableParams.pagination.current, tableParams.pagination.pageSize);
    };

    const handleRestore = async (id) => {
        try {
            const res = await patchData(`/admin/status/${id}/restore`);
            if (res?.success !== false) {
                message.success(res?.message || 'Status restored successfully');
                fetchStatuses(tableParams.pagination.current, tableParams.pagination.pageSize);
            } else {
                message.error(res?.message || 'Failed to restore status');
            }
        } catch (error) {
            console.error(error);
            message.error(error?.response?.data?.message || 'An error occurred while restoring');
        }
    };

    const handlePermanentDelete = async (id) => {
        try {
            const res = await deleteData(`/admin/status/permanent-delete/${id}`);
            if (res?.success !== false) {
                message.success(res?.message || 'Status deleted permanently');
                fetchStatuses(tableParams.pagination.current, tableParams.pagination.pageSize);
            } else {
                message.error(res?.message || 'Failed to delete status');
            }
        } catch (error) {
            console.error(error);
            message.error(error?.response?.data?.message || 'An error occurred while deleting');
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
            title: 'Status Badge',
            key: 'badge',
            render: (_, record) => (
                <Tag style={{ backgroundColor: record.bg_color, color: record.text_color, borderColor: record.bg_color, fontSize: '13px', padding: '4px 8px', borderRadius: '4px', filter: 'grayscale(60%)' }}>
                    {record.icon && <i className={record.icon} style={{ marginRight: 6 }}></i>}
                    {record.name}
                </Tag>
            )
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (text) => <Text strong>{text}</Text>
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
            render: (date) => date ? new Date(date).toLocaleDateString() : '-'
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    {hasPermission('status_delete') && (
                        <>
                            <Popconfirm 
                                title="Restore Status" 
                                description={`Are you sure you want to restore "${record.name}"?`} 
                                onConfirm={() => handleRestore(record.id)}
                                okText="Yes, Restore" 
                                cancelText="No"
                            >
                                <Tooltip title="Restore">
                                    <Button type="primary" size="small" icon={<UndoOutlined />} />
                                </Tooltip>
                            </Popconfirm>

                            <Popconfirm 
                                title="Permanently Delete Status" 
                                description={`Are you sure you want to permanently delete "${record.name}"? This cannot be undone.`} 
                                onConfirm={() => handlePermanentDelete(record.id)}
                                okText="Yes, Delete Forever" 
                                okType="danger"
                                cancelText="No"
                                placement="topRight"
                            >
                                <Tooltip title="Delete Permanently">
                                    <Button danger type="primary" size="small" icon={<DeleteOutlined />} />
                                </Tooltip>
                            </Popconfirm>
                        </>
                    )}
                </Space>
            )
        }
    ];

    return (
        <div className="status-trash-page">
            <Breadcrumb
                items={[
                    { title: "Dashboard" },
                    { title: "Order" },
                    { title: <a onClick={() => navigate('/status')}>Status</a> },
                    { title: "Trash" },
                ]}
                style={{ marginBottom: 16 }}
            />

            <Card 
                title={
                    <Flex justify="space-between" align="center" wrap="wrap" gap="small" style={{ padding: '8px 0' }}>
                        <Space>
                            <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/status')}/>
                            
                            <Title level={4} style={{ margin: 0 }}>Status Trash List</Title>
                        </Space>
                        <Space>
                            <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading}>
                                Refresh
                            </Button>
                        </Space>
                    </Flex>
                }
                bordered={false}
                style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
            >
                <Table 
                    columns={columns} 
                    dataSource={statuses} 
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
        </div>
    );
};

export default StatusTrash;