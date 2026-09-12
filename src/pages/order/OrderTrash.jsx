import { ArrowLeftOutlined, CalendarOutlined, ClearOutlined, DeleteOutlined, EnvironmentOutlined, ExclamationCircleOutlined, FilterOutlined, PhoneOutlined, ReloadOutlined, SearchOutlined, UndoOutlined, UserOutlined } from "@ant-design/icons";
import { Breadcrumb, Button, Card, Col, DatePicker, Flex, Form, Input, InputNumber, Popconfirm, Row, Select, Space, Table, Tag, Tooltip, Typography, message } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import usePermissions from "../../hooks/usePermissions";
import useTitle from "../../hooks/useTitle";
import { deleteData, getDatas, patchData } from "../../services/request";

const { Title, Text } = Typography;

const OrderTrash = () => {
    // Hook
    useTitle("Order Trash List");

    // Variable
    const navigate          = useNavigate();
    const { hasPermission } = usePermissions();
    const [form]            = Form.useForm();

    // States
    const [orders, setOrders]             = useState([]);
    const [loading, setLoading]           = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);

    const [filters, setFilters] = useState({
        search_key         : '',
        status_id          : null,
        paid_status        : null,
        customer_type_id   : null,
        delivery_gateway_id: null,
        payment_gateway_id : null,
        district_id        : null,
        courier_id         : null,
        is_duplicate       : null,
        date_from          : null,
        date_to            : null,
        deleted_from       : null,
        deleted_to         : null,
        sort_by            : 'deleted_at',
        sort_direction     : 'desc'
    });

    const [pagination, setPagination] = useState({ current_page: 1, per_page: 25, total: 0 });

    const fetchOrders = async (currentFilters, page = 1, perPage = 25) => {
        setLoading(true);
        try {
            const params = {
                paginate_size: perPage,
                page: page,
                ...currentFilters
            };

            Object.keys(params).forEach(key => {
                if (params[key] === null || params[key] === '') {
                    delete params[key];
                }
            });

            const res = await getDatas("/admin/order/trash", params);

            if (res?.success && res?.data) {
                setOrders(res.data.data || []);
                setPagination({
                    current_page: res.data.current_page || 1,
                    per_page: res.data.per_page || 25,
                    total: res.data.total || 0
                });
            }
        } catch (error) {
            console.error("Failed to fetch trash orders:", error);
            message.error(error?.response?.data?.message || "Failed to fetch trash orders.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders(filters, pagination.current_page, pagination.per_page);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleTableChange = (paginationOpts, filtersOpts, sorter) => {
        let newSortBy = filters.sort_by;
        let newSortDir = filters.sort_direction;

        if (sorter.field) {
            newSortBy = sorter.field;
            newSortDir = sorter.order === 'ascend' ? 'asc' : 'desc';
        }

        setFilters(prev => ({
            ...prev,
            sort_by: newSortBy,
            sort_direction: newSortDir
        }));

        fetchOrders({ ...filters, sort_by: newSortBy, sort_direction: newSortDir }, paginationOpts.current, paginationOpts.pageSize);
    };

    const handleFilterSubmit = (values) => {
        const date_from = values.dateRange ? values.dateRange[0].format('YYYY-MM-DD') : null;
        const date_to = values.dateRange ? values.dateRange[1].format('YYYY-MM-DD') : null;
        const deleted_from = values.deletedRange ? values.deletedRange[0].format('YYYY-MM-DD') : null;
        const deleted_to = values.deletedRange ? values.deletedRange[1].format('YYYY-MM-DD') : null;

        const newFilters = {
            ...filters,
            ...values,
            date_from,
            date_to,
            deleted_from,
            deleted_to
        };
        delete newFilters.dateRange;
        delete newFilters.deletedRange;

        setFilters(newFilters);
        fetchOrders(newFilters, 1, pagination.per_page);
    };

    const handleReset = () => {
        form.resetFields();
        const resetFilters = {
            search_key         : '',
            status_id          : null,
            paid_status        : null,
            customer_type_id   : null,
            delivery_gateway_id: null,
            payment_gateway_id : null,
            district_id        : null,
            courier_id         : null,
            is_duplicate       : null,
            date_from          : null,
            date_to            : null,
            deleted_from       : null,
            deleted_to         : null,
            sort_by            : 'deleted_at',
            sort_direction     : 'desc'
        };
        setFilters(resetFilters);
        fetchOrders(resetFilters, 1, pagination.per_page);
    };

    const handleRestore = async (id) => {
        try {
            const res = await patchData(`/admin/order/${id}/restore`);
            if (res?.success) {
                message.success("Order restored successfully!");
                setOrders(prev => prev.filter(order => order.id !== id));
            } else {
                message.error(res?.message || "Failed to restore order.");
            }
        } catch (error) {
            console.error("Failed to restore order:", error);
            message.error("An error occurred while restoring the order.");
        }
    };

    const handleForceDelete = async (id) => {
        try {
            const res = await deleteData(`/admin/order/permanent-delete/${id}`);
            if (res?.success) {
                message.success("Order permanently deleted!");
                setOrders(prev => prev.filter(order => order.id !== id));
            } else {
                message.error(res?.message || "Failed to permanently delete order.");
            }
        } catch (error) {
            console.error("Failed to permanently delete order:", error);
            message.error("An error occurred while deleting the order.");
        }
    };

    const slStart = (pagination.current_page - 1) * pagination.per_page + 1;

    const columns = 
    [
        {
            title: '#',
            key: 'sl',
            width: 50,
            align: 'center',
            render: (_, __, index) => (
                <Text type="secondary" style={{ fontSize: 12, fontWeight: 600 }}>{slStart + index}</Text>
            )
        },
        {
            title: 'Invoice',
            dataIndex: 'invoice_number',
            key: 'invoice_number',
            sorter: true,
            render: (text) => (
                <Text strong copyable={{ text }} style={{ fontSize: 13, color: '#1677ff' }}>
                    {text}
                </Text>
            )
        },
        {
            title: 'Deleted Info',
            dataIndex: 'deleted_at',
            key: 'deleted_at',
            sorter: true,
            width: 180,
            render: (date, record) => (
                <div style={{ lineHeight: 1.5 }}>
                    <Flex align="center" gap={5}>
                        <DeleteOutlined style={{ color: '#ff4d4f', fontSize: 12 }} />
                        <Text style={{ fontSize: 12, color: '#ff4d4f' }}>
                            {date ? new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                        </Text>
                    </Flex>
                    <Flex align="center" gap={5} style={{ marginTop: 2 }}>
                        <UserOutlined style={{ color: '#8c8c8c', fontSize: 11 }} />
                        <Text type="secondary" style={{ fontSize: 11 }}>
                            {record.deleted_by?.username || 'System'}
                        </Text>
                    </Flex>
                </div>
            )
        },
        {
            title: 'Customer',
            key: 'customer',
            width: 220,
            render: (_, record) => (
                <Flex gap={10} align="flex-start">
                    <div style={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: 14,
                        flexShrink: 0,
                    }}>
                        {record.customer_name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div style={{ lineHeight: 1.4 }}>
                        <div><Text strong style={{ fontSize: 13 }}>{record.customer_name}</Text></div>
                        <div>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                                <PhoneOutlined style={{ marginRight: 4 }} />{record.phone_number}
                            </Text>
                        </div>
                        {record.shipping_address && (
                            <div>
                                <Text type="secondary" style={{ fontSize: 11 }}>
                                    <EnvironmentOutlined style={{ marginRight: 4 }} />
                                    {record.shipping_address?.length > 25 ? record.shipping_address.substring(0, 25) + '...' : record.shipping_address}
                                </Text>
                            </div>
                        )}
                    </div>
                </Flex>
            )
        },
        {
            title: 'Order Date',
            dataIndex: 'order_date',
            key: 'order_date',
            sorter: true,
            width: 130,
            render: (date) => (
                <Flex align="center" gap={6}>
                    <CalendarOutlined style={{ color: '#8c8c8c', fontSize: 13 }} />
                    <Text style={{ fontSize: 13 }}>
                        {new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </Text>
                </Flex>
            )
        },
        {
            title: 'Amount',
            dataIndex: 'total_payable_amount',
            key: 'total_payable_amount',
            sorter: true,
            align: 'right',
            width: 140,
            render: (amount, record) => (
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#1a1a1a' }}>
                        ৳{parseFloat(amount || 0).toLocaleString()}
                    </div>
                    {parseFloat(record.due) > 0 && (
                        <Tag color="red" style={{ marginTop: 2, fontSize: 11, borderRadius: 4 }}>
                            Due: ৳{parseFloat(record.due).toLocaleString()}
                        </Tag>
                    )}
                    {parseFloat(record.due) <= 0 && (
                        <Tag color="green" style={{ marginTop: 2, fontSize: 11, borderRadius: 4 }}>
                            Paid
                        </Tag>
                    )}
                </div>
            )
        },
        {
            title: 'Payment',
            dataIndex: 'paid_status',
            key: 'paid_status',
            align: 'center',
            width: 100,
            render: (status) => {
                const config = {
                    paid: { color: '#52c41a', bg: '#f6ffed', border: '#b7eb8f', label: 'Paid' },
                    partial: { color: '#faad14', bg: '#fffbe6', border: '#ffe58f', label: 'Partial' },
                    unpaid: { color: '#ff4d4f', bg: '#fff2f0', border: '#ffccc7', label: 'Unpaid' },
                };
                const c = config[status] || config.unpaid;
                return (
                    <span style={{
                        display: 'inline-block',
                        padding: '2px 10px',
                        borderRadius: 12,
                        fontSize: 12,
                        fontWeight: 600,
                        color: c.color,
                        background: c.bg,
                        border: `1px solid ${c.border}`,
                    }}>
                        {c.label}
                    </span>
                );
            }
        },
        {
            title: 'Status',
            key: 'status',
            align: 'center',
            width: 120,
            render: (_, record) => (
                <Tag color="blue">{record.current_status?.name}</Tag>
            )
        },
        {
            title: 'Action',
            key: 'action',
            align: 'center',
            width: 120,
            fixed: 'right',
            render: (_, record) => (
                <Space size={0}>
                    {hasPermission('order_read') && (
                        <Popconfirm
                            title="Restore this order?"
                            description="This will move the order back to the active list."
                            onConfirm={() => handleRestore(record.id)}
                            okText="Restore"
                            cancelText="Cancel"
                        >
                            <Tooltip title="Restore Order">
                                <Button
                                    type="text"
                                    size="small"
                                    icon={<UndoOutlined />}
                                    style={{ color: '#52c41a' }}
                                />
                            </Tooltip>
                        </Popconfirm>
                    )}
                    {hasPermission('order_delete') && (
                        <Popconfirm
                            title="Permanently delete?"
                            description="This action cannot be undone!"
                            onConfirm={() => handleForceDelete(record.id)}
                            okText="Delete Forever"
                            cancelText="Cancel"
                            okButtonProps={{ danger: true }}
                            icon={<ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />}
                        >
                            <Tooltip title="Delete Permanently">
                                <Button
                                    type="text"
                                    size="small"
                                    danger
                                    icon={<DeleteOutlined />}
                                />
                            </Tooltip>
                        </Popconfirm>
                    )}
                </Space>
            )
        }
    ];

    return (
        <div style={{ margin: 5 }}>
            {/* ─── Header ──────────────────────────────────── */}
            <Card
                size="small"
                style={{
                    marginBottom: 16,
                    borderRadius: 10,
                    background: 'linear-gradient(135deg, #eb3349 0%, #f45c43 100%)',
                    border: 'none',
                }}
                styles={{ body: { padding: '16px 24px' } }}
            >
                <Flex justify="space-between" align="center" wrap="wrap" gap={12}>
                    <div>
                        <Breadcrumb
                            items={[
                                { title: <span style={{ color: 'rgba(255,255,255,0.7)' }}>Dashboard</span> },
                                { title: <span style={{ color: 'rgba(255,255,255,0.7)' }}>Order</span> },
                                { title: <span style={{ color: '#fff' }}>Trash</span> },
                            ]}
                            separator={<span style={{ color: 'rgba(255,255,255,0.5)' }}>/</span>}
                        />
                        <Title level={4} style={{ margin: '4px 0 0', color: '#fff' }}>
                            <DeleteOutlined style={{ marginRight: 8 }} />
                            Order Trash
                            {pagination.total > 0 && (
                                <span style={{
                                    background: 'rgba(255,255,255,0.2)',
                                    color: '#fff',
                                    padding: '2px 10px',
                                    borderRadius: 12,
                                    fontSize: 13,
                                    fontWeight: 600,
                                    marginLeft: 10,
                                }}>
                                    {pagination.total} items
                                </span>
                            )}
                        </Title>
                    </div>
                    <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={() => navigate('/orders', {
                            state: { fromPage: 'Order Trash List Page', fromAction: 'Click "Back to Orders" Button' }
                        })}
                        style={{
                            background: 'rgba(255,255,255,0.15)',
                            borderColor: 'rgba(255,255,255,0.3)',
                            color: '#fff',
                            fontWeight: 600,
                        }}
                    >
                        Back to Orders
                    </Button>
                </Flex>
            </Card>

            {/* ─── Filters ─────────────────────────────────── */}
            <Card
                size="small"
                style={{ marginBottom: 16, borderRadius: 10 }}
                styles={{ body: { padding: '16px 20px' } }}
            >
                <Form form={form} onFinish={handleFilterSubmit} layout="vertical" size="middle">
                    <Row gutter={[16, 0]}>
                        <Col xs={24} sm={12} md={6} lg={6}>
                            <Form.Item name="search_key" label={<Text strong style={{ fontSize: 12 }}><SearchOutlined /> Search</Text>} style={{ marginBottom: 12 }}>
                                <Input placeholder="Invoice, Name, Phone..." allowClear />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={6} lg={6}>
                            <Form.Item name="deletedRange" label={<Text strong style={{ fontSize: 12 }}><DeleteOutlined /> Deleted Date</Text>} style={{ marginBottom: 12 }}>
                                <DatePicker.RangePicker style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={6} lg={6}>
                            <Form.Item name="dateRange" label={<Text strong style={{ fontSize: 12 }}><CalendarOutlined /> Order Date</Text>} style={{ marginBottom: 12 }}>
                                <DatePicker.RangePicker style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={6} lg={6}>
                            <Form.Item label=" " style={{ marginBottom: 12 }}>
                                <Flex gap={8} wrap="wrap">
                                    <Button type="primary" danger htmlType="submit" icon={<SearchOutlined />}>
                                        Search
                                    </Button>
                                    <Button icon={<ClearOutlined />} onClick={handleReset}>
                                        Clear
                                    </Button>
                                    <Button
                                        icon={<FilterOutlined />}
                                        type={showAdvanced ? 'primary' : 'default'}
                                        ghost={showAdvanced}
                                        danger={showAdvanced}
                                        onClick={() => setShowAdvanced(!showAdvanced)}
                                    >
                                        More
                                    </Button>
                                    <Tooltip title="Refresh">
                                        <Button
                                            icon={<ReloadOutlined spin={loading} />}
                                            onClick={() => fetchOrders(filters, pagination.current_page, pagination.per_page)}
                                        />
                                    </Tooltip>
                                </Flex>
                            </Form.Item>
                        </Col>
                    </Row>

                    {/* Advanced Filters */}
                    {showAdvanced && (
                        <div style={{
                            background: '#fff5f5',
                            borderRadius: 8,
                            padding: '16px 16px 4px',
                            marginBottom: 12,
                            border: '1px dashed #ffccc7',
                        }}>
                            <Text type="secondary" strong style={{ fontSize: 12, display: 'block', marginBottom: 12 }}>
                                <FilterOutlined /> ADVANCED FILTERS
                            </Text>
                            <Row gutter={[16, 0]}>
                                <Col xs={12} sm={8} md={6} lg={4}>
                                    <Form.Item name="status_id" label={<Text style={{ fontSize: 12 }}>Status ID</Text>} style={{ marginBottom: 12 }}>
                                        <InputNumber placeholder="ID" style={{ width: '100%' }} min={1} />
                                    </Form.Item>
                                </Col>
                                <Col xs={12} sm={8} md={6} lg={4}>
                                    <Form.Item name="paid_status" label={<Text style={{ fontSize: 12 }}>Paid Status</Text>} style={{ marginBottom: 12 }}>
                                        <Select placeholder="All" allowClear>
                                            <Select.Option value="paid">✅ Paid</Select.Option>
                                            <Select.Option value="partial">⚠️ Partial</Select.Option>
                                            <Select.Option value="unpaid">❌ Unpaid</Select.Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col xs={12} sm={8} md={6} lg={4}>
                                    <Form.Item name="is_duplicate" label={<Text style={{ fontSize: 12 }}>Is Duplicate?</Text>} style={{ marginBottom: 12 }}>
                                        <Select placeholder="All" allowClear>
                                            <Select.Option value="true">Yes</Select.Option>
                                            <Select.Option value="false">No</Select.Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col xs={12} sm={8} md={6} lg={4}>
                                    <Form.Item name="district_id" label={<Text style={{ fontSize: 12 }}>District ID</Text>} style={{ marginBottom: 12 }}>
                                        <InputNumber placeholder="ID" style={{ width: '100%' }} min={1} />
                                    </Form.Item>
                                </Col>
                                <Col xs={12} sm={8} md={6} lg={4}>
                                    <Form.Item name="customer_type_id" label={<Text style={{ fontSize: 12 }}>Customer Type</Text>} style={{ marginBottom: 12 }}>
                                        <InputNumber placeholder="ID" style={{ width: '100%' }} min={1} />
                                    </Form.Item>
                                </Col>
                                <Col xs={12} sm={8} md={6} lg={4}>
                                    <Form.Item name="delivery_gateway_id" label={<Text style={{ fontSize: 12 }}>Del. Gateway</Text>} style={{ marginBottom: 12 }}>
                                        <InputNumber placeholder="ID" style={{ width: '100%' }} min={1} />
                                    </Form.Item>
                                </Col>
                                <Col xs={12} sm={8} md={6} lg={4}>
                                    <Form.Item name="payment_gateway_id" label={<Text style={{ fontSize: 12 }}>Pay. Gateway</Text>} style={{ marginBottom: 12 }}>
                                        <InputNumber placeholder="ID" style={{ width: '100%' }} min={1} />
                                    </Form.Item>
                                </Col>
                                <Col xs={12} sm={8} md={6} lg={4}>
                                    <Form.Item name="courier_id" label={<Text style={{ fontSize: 12 }}>Courier ID</Text>} style={{ marginBottom: 12 }}>
                                        <InputNumber placeholder="ID" style={{ width: '100%' }} min={1} />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </div>
                    )}
                </Form>
            </Card>

            {/* ─── Table ───────────────────────────────────── */}
            <Card
                style={{ borderRadius: 10 }}
                styles={{ body: { padding: '12px 20px 20px' } }}
            >
                {/* Results count */}
                <Flex justify="space-between" align="center" style={{ marginBottom: 12 }}>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                        Showing <Text strong>{orders.length}</Text> of <Text strong>{pagination.total}</Text> trashed orders
                    </Text>
                </Flex>

                <Table
                    columns={columns}
                    dataSource={orders}
                    rowKey="id"
                    loading={loading}
                    onChange={handleTableChange}
                    scroll={{ x: 1100 }}
                    size="middle"
                    rowClassName={(_, index) => index % 2 === 0 ? '' : 'ant-table-row-alt'}
                    pagination={{
                        current: pagination.current_page,
                        pageSize: pagination.per_page,
                        total: pagination.total,
                        showSizeChanger: true,
                        pageSizeOptions: ["10", "25", "50", "100"],
                        showTotal: (total, range) => (
                            <Text type="secondary" style={{ fontSize: 13 }}>
                                {range[0]}-{range[1]} of <Text strong>{total}</Text> trashed orders
                            </Text>
                        ),
                        style: { marginTop: 16 },
                    }}
                />
            </Card>

            {/* ─── Custom Styles ──────────────────────────────── */}
            <style>{`
                .ant-table-row-alt {
                    background: #fffbfb !important;
                }
                .ant-table-row:hover td {
                    background: #fff1f0 !important;
                }
                .ant-table-thead > tr > th {
                    background: #fff5f5 !important;
                    font-weight: 700 !important;
                    font-size: 12px !important;
                    text-transform: uppercase !important;
                    letter-spacing: 0.5px !important;
                    color: #555 !important;
                    border-bottom: 2px solid #ffccc7 !important;
                }
                .ant-card {
                    box-shadow: 0 1px 3px rgba(0,0,0,0.06) !important;
                }
            `}</style>
        </div>
    );
};

export default OrderTrash;
