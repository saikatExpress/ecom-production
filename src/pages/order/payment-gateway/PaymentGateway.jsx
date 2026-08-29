import { DeleteOutlined, EditOutlined, PictureOutlined, PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import { Avatar, Breadcrumb, Button, Card, Flex, Image, Popconfirm, Space, Table, Tag, Typography, message } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useTitle from "../../../hooks/useTitle";
import { deleteData, getDatas } from "../../../services/request";
import usePermissions from './../../../hooks/usePermissions';

const { Title, Text } = Typography;

const PaymentGateway = () => {
    // Hook
    useTitle("Payment Gateway List");

    // Variable
    const navigate        = useNavigate();
    const {hasPermission} = usePermissions();

    // States
    const [gateways, setGateways]     = useState([]);
    const [loading, setLoading]       = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 25, total: 0 });

    const fetchGateways = async (page = 1, pageSize = 25) => {
        setLoading(true);
        try {
            const response = await getDatas("/admin/payment-gateway", { 
                page: page,
                paginate_size: pageSize
            });
            
            if (response?.success && response?.data) {
                setGateways(response.data.items || []);
                setPagination({
                    current: response.data.pagination?.current_page || page,
                    pageSize: response.data.pagination?.per_page || pageSize,
                    total: response.data.pagination?.total || 0,
                });
            }
        } catch (error) {
            console.error("Failed to fetch payment gateways:", error);
            message.error(error?.response?.data?.message || "Failed to fetch payment gateways.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGateways(pagination.current, pagination.pageSize);
    }, [pagination.current, pagination.pageSize]);

    const handleTableChange = (newPagination) => {
        setPagination((prev) => ({
            ...prev,
            current: newPagination.current,
            pageSize: newPagination.pageSize,
        }));
    };

    const handleRefresh = () => {
        fetchGateways(pagination.current, pagination.pageSize);
    };

    const handleDelete = async (id) => {
        try {
            const res = await deleteData(`/admin/payment-gateway/${id}`);
            if (res?.success) {
                message.success(res?.message || "Payment gateway deleted successfully");
                fetchGateways(pagination.current, pagination.pageSize);
            } else {
                message.error(res?.message || "Failed to delete payment gateway");
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
            render: (_, __, index) => (pagination.current - 1) * pagination.pageSize + index + 1,
        },
        {
            title: "Image",
            dataIndex: "image",
            key: "image",
            width: 80,
            render: (image, record) =>
                image ? (
                    <Image src={image} alt={record.name} width={40} height={40} style={{ objectFit: "cover", borderRadius: 4 }} />
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
            title: "Account Number",
            dataIndex: "account_number",
            key: "account_number",
            render: (num) => (num ? <Text code>{num}</Text> : <Text type="secondary">N/A</Text>),
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
                    {hasPermission('payment_gateway_update') && (
                        <Button type="link" size="small" icon={<EditOutlined />} onClick={() => navigate(`/edit/payment-gateway/${record.id}`)}>
                            Edit
                        </Button>
                    )}

                    {hasPermission('payment_gateway_delete') && (
                        <Popconfirm title="Delete Payment Gateway" description={`Are you sure to delete "${record.name}"?`} okText="Yes" cancelText="No" onConfirm={() => handleDelete(record.id)}>
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
        <div className="payment-gateway-page">
            <Breadcrumb
                items={[
                    { title: "Dashboard" },
                    { title: "Order" },
                    { title: "Payment Gateway" },
                ]}
                style={{ marginBottom: 16 }}
            />

            <Card
                title={
                    <Flex justify="space-between" align="center" wrap="wrap" gap="small">
                        <Title level={3} style={{ margin: 0 }}>
                            Payment Gateway List
                        </Title>

                        {hasPermission('payment_gateway_create') && (
                            <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/create/payment-gateway')}>
                                Add Gateway
                            </Button>
                        )}
                    </Flex>
                }
            >
                <Flex justify="flex-end" align="center" style={{ marginBottom: 16 }} wrap="wrap" gap="small">
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
                        current: pagination.current,
                        pageSize: pagination.pageSize,
                        total: pagination.total,
                        showSizeChanger: true,
                        pageSizeOptions: ["10", "25", "50", "100"],
                        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                    }}
                    onChange={handleTableChange}
                />
            </Card>
        </div>
    );
};

export default PaymentGateway;