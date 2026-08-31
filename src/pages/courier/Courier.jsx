import { DeleteOutlined, EditOutlined, PictureOutlined, PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import { Avatar, Breadcrumb, Button, Card, Flex, Image, Popconfirm, Space, Table, Tag, Typography, message } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import usePermissions from "../../hooks/usePermissions";
import useTitle from "../../hooks/useTitle";
import { deleteData, getDatas } from "../../services/request";

const { Title, Text } = Typography;

const Courier = () => {
    // Hook
    useTitle("All Couriers");

    // Variable
    const navigate = useNavigate();
    const { hasPermission } = usePermissions();

    // States
    const [couriers, setCouriers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 25, total: 0 });

    const fetchCouriers = async (page = 1, pageSize = 25) => {
        setLoading(true);
        try {
            const response = await getDatas("/admin/courier", {
                page: page,
                paginate_size: pageSize
            });

            if (response?.success && response?.data) {
                const fetchedItems = response.data.items || [];
                setCouriers(fetchedItems);
                
                const paginationData = response.data.pagination;
                if (paginationData) {
                    setPagination({
                        current: paginationData.current_page || page,
                        pageSize: paginationData.per_page || pageSize,
                        total: paginationData.total || fetchedItems.length,
                    });
                }
            } else {
                setCouriers([]);
            }
        } catch (error) {
            console.error("Failed to fetch couriers:", error);
            message.error(error?.response?.data?.message || "Failed to fetch data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCouriers(pagination.current, pagination.pageSize);
    }, []);

    const handleTableChange = (newPagination) => {
        setPagination((prev) => ({
            ...prev,
            current: newPagination.current,
            pageSize: newPagination.pageSize,
        }));
        fetchCouriers(newPagination.current, newPagination.pageSize);
    };

    const handleRefresh = () => {
        fetchCouriers(pagination.current, pagination.pageSize);
    };

    const handleDelete = async (id) => {
        try {
            const res = await deleteData(`/admin/courier/${id}`);
            if (res?.success !== false) {
                message.success(res?.message || "Courier deleted successfully");
                setCouriers(prev => prev.filter(item => item.id !== id));
                setPagination(prev => ({ ...prev, total: Math.max(0, prev.total - 1) }));
            } else {
                message.error(res?.message || "Failed to delete courier");
            }
        } catch (error) {
            console.error(error);
            message.error(error?.response?.data?.message || "An error occurred");
        }
    };

    const columns = 
    [
        {
            title: "SL",
            key: "sl",
            width: 60,
            render: (_, __, index) => (pagination.current - 1) * pagination.pageSize + index + 1,
        },
        {
            title: "Image",
            dataIndex: "image",
            key: "image",
            width: 80,
            render: (image) =>
                image ? (
                    <Image src={image} alt="Courier" width={40} height={40} style={{ objectFit: "contain", borderRadius: 4 }} fallback="https://via.placeholder.com/40" />
                ) : (
                    <Avatar shape="square" icon={<PictureOutlined />} size={40} />
                ),
        },
        {
            title: "Name",
            dataIndex: "name",
            key: "name",
            render: (text) => <Text strong>{text}</Text>,
        },
        {
            title: "Default",
            dataIndex: "is_default",
            key: "is_default",
            render: (isDefault) => (
                isDefault ? <Tag color="blue">Default</Tag> : <Tag>No</Tag>
            )
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (status) => {
                const isActive = status?.toLowerCase() === "active";
                return (
                    <Tag color={isActive ? "success" : "error"} style={{ textTransform: "capitalize" }}>
                        {status || "inactive"}
                    </Tag>
                );
            },
        },
        {
            title: "Action",
            key: "action",
            width: 140,
            render: (_, record) => (
                <Space size="small">
                    {hasPermission('courier_update') && (
                        <Button type="link" size="small" icon={<EditOutlined />} onClick={() => navigate(`/edit/courier/${record.id}`)}>
                            Edit
                        </Button>
                    )}

                    {hasPermission('courier_delete') && (
                        <Popconfirm 
                            title="Delete Courier" 
                            description={`Are you sure to delete "${record.name}"?`} 
                            okText="Yes" 
                            cancelText="No" 
                            onConfirm={() => handleDelete(record.id)}
                        >
                            <Button type="link" danger size="small" icon={<DeleteOutlined />}>
                                Delete
                            </Button>
                        </Popconfirm>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <div>
            <Breadcrumb
                items={[
                    { title: "Dashboard" },
                    { title: "Couriers" },
                    { title: "All Couriers" },
                ]}
                style={{ marginBottom: 16 }}
            />

            <Card
                title={
                    <Flex justify="space-between" align="center" wrap="wrap" gap="small">
                        <Title level={4} style={{ margin: 0 }}>
                            Courier List
                        </Title>
                        <Space>
                            <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
                                Refresh
                            </Button>
                            {hasPermission('courier_delete') && (
                                <Button danger icon={<DeleteOutlined />} onClick={() => navigate('/trash/courier')}>
                                    Trash
                                </Button>
                            )}
                            {hasPermission('courier_create') && (
                                <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/create/courier')}>
                                    Add Courier
                                </Button>
                            )}
                        </Space>
                    </Flex>
                }
            >
                <Table
                    columns={columns}
                    dataSource={couriers}
                    rowKey="id"
                    pagination={{
                        current: pagination.current,
                        pageSize: pagination.pageSize,
                        total: pagination.total,
                        showSizeChanger: true,
                        showTotal: (total) => `Total ${total} items`,
                    }}
                    onChange={handleTableChange}
                    loading={loading}
                    scroll={{ x: 'max-content' }}
                />
            </Card>
        </div>
    );
};

export default Courier;