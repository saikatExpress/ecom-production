import { DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import { Breadcrumb, Button, Card, Flex, Input, Popconfirm, Space, Table, Tag, Typography, message } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import usePermissions from "../../../hooks/usePermissions";
import useTitle from "../../../hooks/useTitle";
import { deleteData, getDatas } from "../../../services/request";

const { Title, Text } = Typography;

const DeliveryGateway = () => {
    // Hook
    useTitle("Delivery Gateway List");

    // Variable
    const navigate = useNavigate();
    const {hasPermission} = usePermissions();

    // States
    const [gateways, setGateways] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchKey, setSearchKey] = useState("");

    const fetchGateways = async (search = "") => {
        setLoading(true);
        try {
            const response = await getDatas("/admin/delivery-gateway", { search_key: search });
            
            if (response?.success && response?.data) {
                setGateways(response.data);
            } else if (Array.isArray(response)) {
                setGateways(response);
            } else if (response?.data && Array.isArray(response.data)) {
                setGateways(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch delivery gateways:", error);
            message.error(error?.response?.data?.message || "Failed to fetch delivery gateways.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGateways(searchKey);
    }, [searchKey]);

    const handleSearch = (value) => {
        setSearchKey(value);
    };

    const handleRefresh = () => {
        fetchGateways(searchKey);
    };

    const handleDelete = async (id) => {
        try {
            const res = await deleteData(`/admin/delivery-gateway/${id}`);
            if (res?.success) {
                message.success(res?.message || "Delivery gateway deleted successfully");
                fetchGateways(searchKey);
            } else {
                message.error(res?.message || "Failed to delete delivery gateway");
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
            title: "Estimated Time",
            key: "estimated_time",
            render: (_, record) => {
                return <Text>{`${record.min_time} - ${record.max_time} ${record.time_unit}`}</Text>;
            },
        },
        {
            title: "Delivery Fee",
            dataIndex: "delivery_fee",
            key: "delivery_fee",
            render: (fee) => <Tag color="cyan">{fee}</Tag>,
        },
        {
            title: "Position",
            dataIndex: "position",
            key: "position",
        },
        {
            title: "Status",
            key: "status",
            render: (_, record) => {
                const status = record.status;
                const safeStatus = String(status ?? "").trim().toLowerCase();
                const isActive = safeStatus === "active" || safeStatus === "1" || safeStatus === "true";
                
                return (
                    <Tag color={isActive ? "success" : "error"} style={{ textTransform: "capitalize" }}>
                        {status !== undefined && status !== null ? String(status) : "Inactive"}
                    </Tag>
                );
            },
        },
        {
            title: "Action",
            key: "action",
            width: 150,
            render: (_, record) => (
                <Space size="small">
                    {hasPermission('delivery_gateway_update') && (
                        <Button type="link" size="small" icon={<EditOutlined />} onClick={() => navigate(`/edit/delivery-gateway/${record.id}`)}>
                            Edit
                        </Button>
                    )}
                    
                    {hasPermission('delivery_gateway_delete') && (
                        <Popconfirm title="Delete Delivery Gateway" description={`Are you sure to delete "${record.name}"?`} okText="Yes" cancelText="No" onConfirm={() => handleDelete(record.id)}>
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
        <div className="delivery-gateway-page">
            <Breadcrumb
                items={[
                    { title: "Dashboard" },
                    { title: "Order" },
                    { title: "Delivery Gateway" },
                ]}
                style={{ marginBottom: 16 }}
            />

            <Card
                title={
                    <Flex justify="space-between" align="center" wrap="wrap" gap="small">
                        <Title level={3} style={{ margin: 0 }}>
                            Delivery Gateway List
                        </Title>
                        {hasPermission('delivery_gateway_create') && (
                            <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/create/delivery-gateway')}>
                                Add Gateway
                            </Button>
                        )}
                    </Flex>
                }
            >
                <Flex justify="space-between" align="center" style={{ marginBottom: 16 }} wrap="wrap" gap="small">
                    <Input.Search
                        placeholder="Search delivery gateway..."
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
                    dataSource={gateways}
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

export default DeliveryGateway;