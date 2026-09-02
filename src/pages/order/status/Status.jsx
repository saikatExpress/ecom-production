import { DeleteOutlined, EditOutlined, HolderOutlined, PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import { Breadcrumb, Button, Card, Flex, Popconfirm, Space, Table, Tag, Typography, message } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import usePermissions from "../../../hooks/usePermissions";
import useTitle from "../../../hooks/useTitle";
import { deleteData, getDatas, postData } from "../../../services/request";

import { DndContext, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const { Title, Text } = Typography;

const DraggableRow = (props) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: props['data-row-key'],
    });

    const style = {
        ...props.style,
        transform: CSS.Transform.toString(transform && { ...transform, scaleY: 1 }),
        transition,
        ...(isDragging ? { position: 'relative', zIndex: 9999, background: '#fafafa' } : {}),
    };

    return (
        <tr {...props} ref={setNodeRef} {...attributes} {...listeners} style={{...style,cursor: 'move',}}/>
    );
};

const Status = () => {
    // Hook
    useTitle("Status List");

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

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        })
    );

    const fetchStatuses = async (page = 1, pageSize = 25) => {
        setLoading(true);
        try {
            const res = await getDatas(`/admin/status?page=${page}&per_page=${pageSize}`);
            if (res?.success && res?.data) {
                setStatuses(res.data.items || res.data || []);
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
                setStatuses([]);
            }
        } catch (error) {
            console.error("Failed to fetch statuses", error);
            message.error("Failed to load statuses");
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

    const handleDelete = async (id) => {
        try {
            const res = await deleteData(`/admin/status/${id}`);
            if (res?.success !== false) {
                message.success(res?.message || "Status deleted successfully");
                fetchStatuses(tableParams.pagination.current, tableParams.pagination.pageSize);
            } else {
                message.error(res?.message || "Failed to delete status");
            }
        } catch (error) {
            console.error(error);
            message.error(error?.response?.data?.message || "An error occurred");
        }
    };

    const onDragEnd = async ({ active, over }) => {
        if (active.id !== over?.id) {
            setStatuses((prev) => {
                const activeIndex = prev.findIndex((i) => i.id === active.id);
                const overIndex = prev.findIndex((i) => i.id === over?.id);
                const newOrder = arrayMove(prev, activeIndex, overIndex);
                
                handleReorder(newOrder);
                return newOrder;
            });
        }
    };

    const handleReorder = async (newOrder) => {
        try {
            const payload = {
                status_ids: newOrder.map(item => item.id)
            };
            const res = await postData("/admin/status/reorder", payload);
            if (res?.success !== false) {
                message.success("Reordered successfully");
                fetchStatuses(tableParams.pagination.current, tableParams.pagination.pageSize);
            } else {
                message.error("Failed to reorder");
            }
        } catch (error) {
            console.error("Failed to reorder", error);
            message.error("Failed to reorder statuses");
            fetchStatuses(tableParams.pagination.current, tableParams.pagination.pageSize);
        }
    };

    const columns = 
    [
        {
            key: 'sort',
            align: 'center',
            width: 50,
            render: () => <HolderOutlined style={{ cursor: 'grab', color: '#999' }} />,
        },
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
                <Tag style={{ backgroundColor: record.bg_color, color: record.text_color, borderColor: record.bg_color, fontSize: '13px', padding: '4px 8px', borderRadius: '4px' }}>
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
            title: 'Position',
            dataIndex: 'position',
            key: 'position',
            align: 'center',
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
                    {hasPermission('status_update') && (
                        <Button type="link" size="small" icon={<EditOutlined />} onClick={() => navigate(`/edit/status/${record.id}`)}>
                            Edit
                        </Button>
                    )}
                    {hasPermission('status_delete') && (
                        <Popconfirm 
                            title="Delete the status" 
                            description={`Are you sure to delete "${record.name}"?`} 
                            onConfirm={() => handleDelete(record.id)}
                            okText="Yes" 
                            cancelText="No"
                            placement="topRight"
                        >
                            <Button danger type="link" size="small" icon={<DeleteOutlined />}>
                                Delete
                            </Button>
                        </Popconfirm>
                    )}
                </Space>
            )
        }
    ];

    return (
        <div className="status-page">
            <Breadcrumb
                items={[
                    { title: "Dashboard" },
                    { title: "Order" },
                    { title: "Status" },
                ]}
                style={{ marginBottom: 16 }}
            />

            <Card 
                title={
                    <Flex justify="space-between" align="center" wrap="wrap" gap="small">
                        <Title level={4} style={{ margin: 0 }}>Order Status List</Title>
                        <Space>
                            <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading}>
                                Refresh
                            </Button>
                            
                            {hasPermission('status_delete') && (
                                <Button danger icon={<DeleteOutlined />} onClick={() => navigate("/trash/status")} shape="round">
                                    Trash
                                </Button>
                            )}

                            {hasPermission('status_create') && (
                                <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate("/create/status")} shape="round">
                                    Add New Status
                                </Button>
                            )}
                        </Space>
                    </Flex>
                }
                bordered={false}
                style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
            >
                <DndContext sensors={sensors} modifiers={[restrictToVerticalAxis]} onDragEnd={onDragEnd} collisionDetection={closestCenter}>
                    <SortableContext items={statuses.map((i) => i.id)} strategy={verticalListSortingStrategy}>
                        <Table 
                            components={{
                                body: {
                                    row: DraggableRow,
                                }
                            }}
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
                    </SortableContext>
                </DndContext>
            </Card>
        </div>
    );
};

export default Status;