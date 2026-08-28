import { DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import { Breadcrumb, Button, Card, Flex, Input, Popconfirm, Space, Table, Tag, Typography, message } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import usePermissions from "../../../hooks/usePermissions";
import useTitle from "../../../hooks/useTitle";
import { deleteData, getDatas } from "../../../services/request";

const { Title, Text } = Typography;

const OrderSource = () => {
    // Hook
    useTitle("Order Source List");

    // Variable
    const navigate         = useNavigate();
    const {hasPermission} = usePermissions();

    // States
    const [orderSources, setOrderSources] = useState([]);
    const [loading, setLoading]           = useState(false);
    const [searchKey, setSearchKey]       = useState("");

    const fetchOrderSources = async (search = "") => {
        setLoading(true);
        try {
            const response = await getDatas("/admin/order-source", { search_key: search });
            
            if (response?.success && response?.data) {
                setOrderSources(response.data);
            } else if (Array.isArray(response)) {
                setOrderSources(response);
            } else if (response?.data && Array.isArray(response.data)) {
                setOrderSources(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch order sources:", error);
            message.error(error?.response?.data?.message || "Failed to fetch order sources.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrderSources(searchKey);
    }, [searchKey]);

    const handleSearch = (value) => {
        setSearchKey(value);
    };

    const handleRefresh = () => {
        fetchOrderSources(searchKey);
    };

    const handleDelete = async (id) => {
        try {
            const res = await deleteData(`/admin/order-source/${id}`);
            if (res?.success) {
                message.success(res?.message || "Order source deleted successfully");
                fetchOrderSources(searchKey);
            } else {
                message.error(res?.message || "Failed to delete order source");
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
            width: 70,
            render: (_, __, index) => index + 1,
        },
        {
            title: "Name",
            dataIndex: "name",
            key: "name",
            render: (text) => <Text strong>{text}</Text>,
        },
        {
            title: "Slug",
            dataIndex: "slug",
            key: "slug",
            render: (slug) => <Tag color="blue">{slug}</Tag>,
        },
        {
            title: "Color Code",
            dataIndex: "color_code",
            key: "color_code",
            render: (color) => (
                <Flex align="center" gap="small">
                    <div style={{ width: 16, height: 16, backgroundColor: color, borderRadius: 4, border: '1px solid #d9d9d9' }} />
                    <Text>{color}</Text>
                </Flex>
            ),
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
            title: "Created At",
            dataIndex: "created_at",
            key: "created_at",
            render: (date) => (date ? new Date(date).toLocaleString() : "-"),
        },
        {
            title: "Action",
            key: "action",
            width: 150,
            render: (_, record) => (
                <Space size="small">
                    {hasPermission('order_source_read') && (
                        <Button type="link" size="small" icon={<EditOutlined />} onClick={() => navigate(`/edit/order-source/${record.id}`)}>
                            Edit
                        </Button>
                    )}

                    {hasPermission('order_source_delete') && (
                        <Popconfirm title="Delete Order Source" description={`Are you sure to delete "${record.name}"?`} okText="Yes" cancelText="No" onConfirm={() => handleDelete(record.id)}>
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
        <div className="order-source-page">
            <Breadcrumb
                items={[
                    { title: "Dashboard" },
                    { title: "Order" },
                    { title: "Order Source" },
                ]}
                style={{ marginBottom: 16 }}
            />

            <Card
                title={
                    <Flex justify="space-between" align="center" wrap="wrap" gap="small">
                        <Title level={3} style={{ margin: 0 }}>
                            Order Source List
                        </Title>
                        {hasPermission('order_source_create') && (
                            <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/create/order-source')}>
                                Add Source
                            </Button>
                        )}
                    </Flex>
                }
            >
                <Flex justify="space-between" align="center" style={{ marginBottom: 16 }} wrap="wrap" gap="small">
                    <Input.Search
                        placeholder="Search order source..."
                        allowClear
                        enterButton={<SearchOutlined />}
                        style={{ maxWidth: 320 }}
                        onSearch={handleSearch}
                    />
                    <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading}>
                        Refresh
                    </Button>
                </Flex>

                <Table
                    columns={columns}
                    dataSource={orderSources}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        showSizeChanger: true,
                        pageSizeOptions: ["10", "25", "50", "100"],
                        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                    }}
                />
            </Card>
        </div>
    );
};

export default OrderSource;