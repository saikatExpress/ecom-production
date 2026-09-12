import { CalendarOutlined, ClearOutlined, DeleteOutlined, DollarOutlined, EditOutlined, EnvironmentOutlined, EyeOutlined, FilterOutlined, PhoneOutlined, PlusOutlined, ReloadOutlined, SearchOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import { Breadcrumb, Button, Card, Col, DatePicker, Flex, Form, Input, InputNumber, Popconfirm, Row, Select, Space, Table, Tabs, Tag, Tooltip, Typography, message } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import usePermissions from "../../hooks/usePermissions";
import useTitle from "../../hooks/useTitle";
import { deleteData, getDatas } from "../../services/request";

const { Title, Text } = Typography;

const Order = () => {
    // Hook
    useTitle("Order List");

    // Variable
    const navigate          = useNavigate();
    const { hasPermission } = usePermissions();
    const [form]            = Form.useForm();

    // States
    const [orders, setOrders]                 = useState([]);
    const [statuses, setStatuses]             = useState([]);
    const [loading, setLoading]               = useState(false);
    const [totalAllOrders, setTotalAllOrders] = useState(0);
    const [showAdvanced, setShowAdvanced]         = useState(false);
    const [customerTypes, setCustomerTypes]       = useState([]);
    const [districts, setDistricts]               = useState([]);
    const [deliveryGateways, setDeliveryGateways] = useState([]);
    const [paymentGateways, setPaymentGateways]   = useState([]);
    const [couriers, setCouriers]                 = useState([]);
    const [users, setUsers]                       = useState([]);

    const [filters, setFilters] = useState({
        search_key         : '',
        status_id          : null,
        paid_status        : null,
        customer_type_id   : null,
        delivery_gateway_id: null,
        payment_gateway_id : null,
        district_id        : null,
        courier_id         : null,
        assign_user_id     : null,
        prepared_by        : null,
        date_from          : null,
        date_to            : null,
        min_amount         : null,
        max_amount         : null,
        sort_by            : 'id',
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

            const res = await getDatas("/admin/order", params);

            if (res?.success && res?.data) {
                if (res.data.items) {
                    setOrders(res.data.items);
                }
                if (res.data.pagination) {
                    setPagination(res.data.pagination);
                    if (!currentFilters.status_id) {
                        setTotalAllOrders(res.data.pagination.total);
                    }
                }
                if (res.data.statuses) {
                    setStatuses(res.data.statuses);
                }
            }
        } catch (error) {
            console.error("Failed to fetch orders:", error);
            message.error(error?.response?.data?.message || "Failed to fetch orders.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchDropdownData = async () => {
            try {
                const [customerTypesRes, districtsRes, deliveryGatewaysRes, paymentGatewaysRes, couriersRes, usersRes] = await Promise.all([
                    getDatas("/admin/customer-type/list"),
                    getDatas("/admin/district/list"),
                    getDatas("/admin/delivery-gateway/list"),
                    getDatas("/admin/payment-gateway/list"),
                    getDatas("/admin/courier/list"),
                    getDatas("/admin/user/list")
                ]);

                if (customerTypesRes?.success && customerTypesRes?.data) {
                    setCustomerTypes(customerTypesRes.data);
                }
                
                if (districtsRes?.success && districtsRes?.data) {
                    setDistricts(districtsRes.data);
                }

                if (deliveryGatewaysRes?.success && deliveryGatewaysRes?.data) {
                    setDeliveryGateways(deliveryGatewaysRes.data);
                }

                if (paymentGatewaysRes?.success && paymentGatewaysRes?.data) {
                    setPaymentGateways(paymentGatewaysRes.data);
                }

                if (couriersRes?.success && couriersRes?.data) {
                    setCouriers(couriersRes.data);
                }

                if (usersRes?.success && usersRes?.data) {
                    setUsers(usersRes.data);
                }
            } catch (error) {
                console.error("Failed to fetch dropdown data:", error);
            }
        };
        fetchDropdownData();
    }, []);

    useEffect(() => {
        fetchOrders(filters, pagination.current_page, pagination.per_page);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters.status_id]);

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

        const newFilters = {
            ...filters,
            ...values,
            date_from,
            date_to
        };
        delete newFilters.dateRange;

        setFilters(newFilters);
        fetchOrders(newFilters, 1, pagination.per_page);
    };

    const handleReset = () => {
        form.resetFields();
        const resetFilters = {
            search_key: '',
            status_id: filters.status_id,
            sort_by: 'id',
            sort_direction: 'desc'
        };
        setFilters(resetFilters);
        fetchOrders(resetFilters, 1, pagination.per_page);
    };

    let activeMainTab = 'all';
    if (filters.status_id) {
        if ([4, 13, 14].includes(filters.status_id)) {
            activeMainTab = '4';
        } else if ([9, 10, 11, 12].includes(filters.status_id)) {
            activeMainTab = 'rnd';
        } else {
            activeMainTab = filters.status_id.toString();
        }
    }

    const handleMainTabChange = (key) => {
        if (key === 'all') {
            setFilters(prev => ({ ...prev, status_id: null }));
        } else if (key === 'rnd') {
            const firstRnd = statuses.find(s => [9, 10, 11, 12].includes(s.id));
            setFilters(prev => ({ ...prev, status_id: firstRnd ? firstRnd.id : 9 }));
        } else if (key === '4') {
            setFilters(prev => ({ ...prev, status_id: 4 }));
        } else {
            setFilters(prev => ({ ...prev, status_id: parseInt(key, 10) }));
        }
    };

    const handleSubTabChange = (key) => {
        setFilters(prev => ({ ...prev, status_id: parseInt(key, 10) }));
    };

    const handleDeleteRow = async (id) => {
        try {
            const res = await deleteData(`/admin/order/${id}`);
            if (res?.success) {
                message.success("Order deleted successfully!");
                setOrders(prev => prev.filter(order => order.id !== id));
            } else {
                message.error(res?.message || "Failed to delete order");
            }
        } catch (error) {
            console.error("Failed to delete order:", error);
            message.error("An error occurred while deleting the order.");
        }
    };

    // ─── Tab Builder ─────────────────────────────────────────
    const buildTabLabel = (s, active) => (
        <span style={{
            background  : active ? s.bg_color  : 'transparent',
            color       : active ? s.text_color: '#555',
            padding     : '4px 14px',
            borderRadius: 20,
            fontWeight  : 600,
            fontSize    : 13,
            transition  : 'all 0.3s ease',
            display     : 'inline-flex',
            alignItems  : 'center',
            gap         : 6,
            border      : active ? 'none'      : '1px solid #e8e8e8',
        }}>
            {s.icon && <i className={`ti ${s.icon}`} style={{ fontSize: 16 }} />}
            {s.name}
            <span style={{
                background  : active ? 'rgba(255,255,255,0.25)': '#f0f0f0',
                color       : active ? s.text_color            : '#888',
                padding     : '0 7px',
                borderRadius: 10,
                fontSize    : 11,
                fontWeight  : 700,
                lineHeight  : '18px',
            }}>
                {s.total_orders}
            </span>
        </span>
    );

    const mainTabItems = 
    [
        {
            key: 'all',
            label: (
                <span style={{
                    background  : activeMainTab === 'all' ? 'linear-gradient(135deg, #1677ff, #4096ff)': 'transparent',
                    color       : activeMainTab === 'all' ? '#fff'                                     : '#555',
                    padding     : '4px 14px',
                    borderRadius: 20,
                    fontWeight  : 600,
                    fontSize    : 13,
                    display     : 'inline-flex',
                    alignItems  : 'center',
                    gap         : 6,
                    border      : activeMainTab === 'all' ? 'none'                                     : '1px solid #e8e8e8',
                    transition  : 'all 0.3s ease',
                }}>
                    <ShoppingCartOutlined />
                    All Orders
                    <span style={{
                        background  : activeMainTab === 'all' ? 'rgba(255,255,255,0.25)': '#f0f0f0',
                        color       : activeMainTab === 'all' ? '#fff'                  : '#888',
                        padding     : '0 7px',
                        borderRadius: 10,
                        fontSize    : 11,
                        fontWeight  : 700,
                        lineHeight  : '18px',
                    }}>
                        {totalAllOrders}
                    </span>
                </span>
            )
        }
    ];

    [1, 2, 3, 4, 5, 6, 7, 8].forEach(id => {
        const s = statuses.find(st => st.id === id);
        if (s) {
            mainTabItems.push({ key: s.id.toString(), label: buildTabLabel(s, activeMainTab === s.id.toString()) });
        }
    });

    const rndStatus = statuses.find(s => [9, 10, 11, 12].includes(s.id));
    const rndBg = rndStatus?.bg_color || '#9C27B0';
    const rndTotalOrders = statuses.filter(s => [9, 10, 11, 12].includes(s.id)).reduce((sum, s) => sum + s.total_orders, 0);
    mainTabItems.push({
        key: 'rnd',
        label: (
            <span style={{
                background  : activeMainTab === 'rnd' ? rndBg : 'transparent',
                color       : activeMainTab === 'rnd' ? '#fff': '#555',
                padding     : '4px 14px',
                borderRadius: 20,
                fontWeight  : 600,
                fontSize    : 13,
                display     : 'inline-flex',
                alignItems  : 'center',
                gap         : 6,
                border      : activeMainTab === 'rnd' ? 'none': '1px solid #e8e8e8',
                transition  : 'all 0.3s ease',
            }}>
                R & D
                <span style={{
                    background  : activeMainTab === 'rnd' ? 'rgba(255,255,255,0.25)': '#f0f0f0',
                    color       : activeMainTab === 'rnd' ? '#fff'                  : '#888',
                    padding     : '0 7px',
                    borderRadius: 10,
                    fontSize    : 11,
                    fontWeight  : 700,
                    lineHeight  : '18px',
                }}>
                    {rndTotalOrders}
                </span>
            </span>
        )
    });

    let subTabItems = [];
    if (activeMainTab === '4') {
        subTabItems = [4, 13, 14].map(id => {
            const s = statuses.find(st => st.id === id);
            if (s) return {
                key: s.id.toString(),
                label: buildTabLabel(s, filters.status_id === s.id)
            };
            return null;
        }).filter(Boolean);
    } else if (activeMainTab === 'rnd') {
        subTabItems = [9, 10, 11, 12].map(id => {
            const s = statuses.find(st => st.id === id);
            if (s) return {
                key: s.id.toString(),
                label: buildTabLabel(s, filters.status_id === s.id)
            };
            return null;
        }).filter(Boolean);
    }

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
            ),
            width: 100,
        },
        {
            title: 'Date',
            dataIndex: 'order_date',
            key: 'order_date',
            sorter: true,
            width: 160,
            render: (date) => (
                <Flex align="center" gap={6}>
                    <CalendarOutlined style={{ color: '#8c8c8c', fontSize: 13 }} />
                    <Text style={{ fontSize: 13 }}>{new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</Text>
                </Flex>
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
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
                                    <EnvironmentOutlined style={{ marginRight: 4 }} />{record.shipping_address?.length > 25 ? record.shipping_address.substring(0, 25) + '...' : record.shipping_address}
                                </Text>
                            </div>
                        )}
                    </div>
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
                        textTransform: 'capitalize',
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
            width: 130,
            render: (_, record) => {
                const s = statuses.find(st => st.id === record.status_id);
                if (s) {
                    return (
                        <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            padding: '2px 10px',
                            borderRadius: 12,
                            fontSize: 12,
                            fontWeight: 600,
                            color: s.text_color || '#333',
                            background: s.bg_color || '#f0f0f0',
                        }}>
                            {s.icon && <i className={`ti ${s.icon}`} style={{ fontSize: 14 }} />}
                            {record.current_status?.name}
                        </span>
                    );
                }
                return <Tag>{record.current_status?.name}</Tag>;
            }
        },
        {
            title: 'Action',
            key: 'action',
            align: 'center',
            width: 140,
            fixed: 'right',
            render: (_, record) => (
                <Space size={0}>
                    {hasPermission('order_read') && (
                        <Tooltip title="View Order">
                            <Button
                                type="text"
                                size="small"
                                icon={<EyeOutlined />}
                                onClick={() => navigate(`/orders/view/${record.id}`)}
                                style={{ color: '#1677ff' }}
                            />
                        </Tooltip>
                    )}
                    {hasPermission('order_update') && (
                        <Tooltip title="Edit Order">
                            <Button
                                type="text"
                                size="small"
                                icon={<EditOutlined />}
                                onClick={() => navigate(`/edit/order/${record.id}`)}
                                style={{ color: '#52c41a' }}
                            />
                        </Tooltip>
                    )}
                    {hasPermission('order_delete') && (
                        <Popconfirm
                            title="Delete this order?"
                            description="This order will be moved to trash."
                            onConfirm={() => handleDeleteRow(record.id)}
                            okText="Delete"
                            cancelText="Cancel"
                            okButtonProps={{ danger: true }}
                        >
                            <Tooltip title="Delete Order">
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
            <Card
                size="small"
                style={{
                    marginBottom: 16,
                    borderRadius: 10,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
                                { title: <span style={{ color: '#fff' }}>Order List</span> },
                            ]}
                            separator={<span style={{ color: 'rgba(255,255,255,0.5)' }}>/</span>}
                        />
                        <Title level={4} style={{ margin: '4px 0 0', color: '#fff' }}>
                            <ShoppingCartOutlined style={{ marginRight: 8 }} />
                            Order Management
                        </Title>
                    </div>
                    <Flex gap={8} wrap="wrap">
                        {hasPermission('order_delete') && (
                            <Button
                                icon={<DeleteOutlined />}
                                onClick={() => navigate('/trash/order', {
                                    state: { fromPage: 'Order List Page', fromAction: 'Click "Trash" Button' }
                                })}
                                style={{
                                    background: 'rgba(255,255,255,0.15)',
                                    borderColor: 'rgba(255,255,255,0.3)',
                                    color: '#fff',
                                }}
                            >
                                Trash
                            </Button>
                        )}
                        {hasPermission('order_create') && (
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={() => navigate('/add/order', {
                                    state: { fromPage: 'Order List Page', fromAction: 'Click "Add Order" Button' }
                                })}
                                style={{
                                    background: '#fff',
                                    color: '#764ba2',
                                    fontWeight: 600,
                                    border: 'none',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                }}
                            >
                                Add Order
                            </Button>
                        )}
                    </Flex>
                </Flex>
            </Card>

            <Card size="small" style={{ marginBottom: 16, borderRadius: 10 }} styles={{ body: { padding: '16px 20px' } }}>
                <Form form={form} onFinish={handleFilterSubmit} layout="vertical" size="middle">
                    <Row gutter={[16, 0]}>
                        <Col xs={24} sm={12} md={8} lg={6}>
                            <Form.Item name="search_key" label={<Text strong style={{ fontSize: 12 }}><SearchOutlined /> Search</Text>} style={{ marginBottom: 12 }}>
                                <Input placeholder="Invoice, Name, Phone..." allowClear />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={6}>
                            <Form.Item name="dateRange" label={<Text strong style={{ fontSize: 12 }}><CalendarOutlined /> Order Date</Text>} style={{ marginBottom: 12 }}>
                                <DatePicker.RangePicker style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={6}>
                            <Form.Item name="paid_status" label={<Text strong style={{ fontSize: 12 }}><DollarOutlined /> Paid Status</Text>} style={{ marginBottom: 12 }}>
                                <Select placeholder="All" allowClear>
                                    <Select.Option value="paid">✅ Paid</Select.Option>
                                    <Select.Option value="partial">⚠️ Partial</Select.Option>
                                    <Select.Option value="unpaid">❌ Unpaid</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={24} lg={6}>
                            <Form.Item label=" " style={{ marginBottom: 12 }}>
                                <Flex gap={8} wrap="wrap">
                                    <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                                        Search
                                    </Button>
                                    <Button icon={<ClearOutlined />} onClick={handleReset}>
                                        Clear
                                    </Button>
                                    <Button
                                        icon={<FilterOutlined />}
                                        type={showAdvanced ? 'primary' : 'default'}
                                        ghost={showAdvanced}
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

                    {showAdvanced && (
                        <div style={{
                            background: '#fafafa',
                            borderRadius: 8,
                            padding: '16px 16px 4px',
                            marginBottom: 12,
                            border: '1px dashed #d9d9d9',
                        }}>
                            <Text type="secondary" strong style={{ fontSize: 12, display: 'block', marginBottom: 12 }}>
                                <FilterOutlined /> ADVANCED FILTERS
                            </Text>
                            <Row gutter={[16, 0]}>
                                <Col xs={12} sm={8} md={6} lg={4}>
                                    <Form.Item name="min_amount" label={<Text style={{ fontSize: 12 }}>Min Amount</Text>} style={{ marginBottom: 12 }}>
                                        <InputNumber placeholder="Min" style={{ width: '100%' }} min={0} />
                                    </Form.Item>
                                </Col>
                                <Col xs={12} sm={8} md={6} lg={4}>
                                    <Form.Item name="max_amount" label={<Text style={{ fontSize: 12 }}>Max Amount</Text>} style={{ marginBottom: 12 }}>
                                        <InputNumber placeholder="Max" style={{ width: '100%' }} min={0} />
                                    </Form.Item>
                                </Col>
                                <Col xs={12} sm={8} md={6} lg={4}>
                                    <Form.Item name="district_id" label={<Text style={{ fontSize: 12 }}>District</Text>} style={{ marginBottom: 12 }}>
                                        <Select
                                            placeholder="Select District"
                                            allowClear
                                            showSearch
                                            optionFilterProp="children"
                                            filterOption={(input, option) =>
                                                (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                                            }
                                        >
                                            {districts.map(district => (
                                                <Select.Option key={district.id} value={district.id}>
                                                    {district.district_name}
                                                </Select.Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col xs={12} sm={8} md={6} lg={4}>
                                    <Form.Item name="customer_type_id" label={<Text style={{ fontSize: 12 }}>Customer Type</Text>} style={{ marginBottom: 12 }}>
                                        <Select placeholder="Select Type" allowClear>
                                            {customerTypes.map(type => (
                                                <Select.Option key={type.id} value={type.id}>
                                                    {type.name}
                                                </Select.Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col xs={12} sm={8} md={6} lg={4}>
                                    <Form.Item name="delivery_gateway_id" label={<Text style={{ fontSize: 12 }}>Del. Gateway</Text>} style={{ marginBottom: 12 }}>
                                        <Select placeholder="Select Gateway" allowClear>
                                            {deliveryGateways.map(gateway => (
                                                <Select.Option key={gateway.id} value={gateway.id}>
                                                    {gateway.name} (৳{gateway.delivery_fee})
                                                </Select.Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col xs={12} sm={8} md={6} lg={4}>
                                    <Form.Item name="payment_gateway_id" label={<Text style={{ fontSize: 12 }}>Pay. Gateway</Text>} style={{ marginBottom: 12 }}>
                                        <Select placeholder="Select Gateway" allowClear>
                                            {paymentGateways.map(gateway => (
                                                <Select.Option key={gateway.id} value={gateway.id}>
                                                    {gateway.name}
                                                </Select.Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col xs={12} sm={8} md={6} lg={4}>
                                    <Form.Item name="courier_id" label={<Text style={{ fontSize: 12 }}>Courier</Text>} style={{ marginBottom: 12 }}>
                                        <Select placeholder="Select Courier" allowClear>
                                            {couriers.map(courier => (
                                                <Select.Option key={courier.id} value={courier.id}>
                                                    {courier.name}
                                                </Select.Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>

                                <Col xs={12} sm={8} md={6} lg={4}>
                                    <Form.Item name="assign_user_id" label={<Text style={{ fontSize: 12 }}>Assigned User</Text>} style={{ marginBottom: 12 }}>
                                        <Select
                                            placeholder="Select User"
                                            allowClear
                                            showSearch
                                            optionFilterProp="children"
                                            filterOption={(input, option) =>
                                                (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                                            }
                                        >
                                            {users.map(user => (
                                                <Select.Option key={user.id} value={user.id}>
                                                    {user.username}
                                                </Select.Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col xs={12} sm={8} md={6} lg={4}>
                                    <Form.Item name="prepared_by" label={<Text style={{ fontSize: 12 }}>Prepared By</Text>} style={{ marginBottom: 12 }}>
                                        <Select
                                            placeholder="Select User"
                                            allowClear
                                            showSearch
                                            optionFilterProp="children"
                                            filterOption={(input, option) =>
                                                (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                                            }
                                        >
                                            {users.map(user => (
                                                <Select.Option key={user.id} value={user.id}>
                                                    {user.username}
                                                </Select.Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                            </Row>
                        </div>
                    )}
                </Form>
            </Card>

            <Card style={{ borderRadius: 10 }} styles={{ body: { padding: '12px 20px 20px' } }}>
                <div style={{
                    overflowX: 'auto',
                    whiteSpace: 'nowrap',
                    paddingBottom: 4,
                    marginBottom: 8,
                }}>
                    <Tabs
                        activeKey={activeMainTab}
                        items={mainTabItems}
                        onChange={handleMainTabChange}
                        tabBarStyle={{ marginBottom: 0 }}
                        style={{ minWidth: 'fit-content' }}
                    />
                </div>

                {subTabItems.length > 0 && (
                    <div style={{
                        background: '#fafafa',
                        borderRadius: 8,
                        padding: '8px 12px',
                        marginBottom: 12,
                    }}>
                        <Tabs
                            activeKey={filters.status_id ? filters.status_id.toString() : ''}
                            items={subTabItems}
                            onChange={handleSubTabChange}
                            type="card"
                            size="small"
                            tabBarStyle={{ marginBottom: 0 }}
                        />
                    </div>
                )}

                <Flex justify="space-between" align="center" style={{ marginBottom: 12 }}>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                        Showing <Text strong>{orders.length}</Text> of <Text strong>{pagination.total}</Text> orders
                    </Text>
                </Flex>

                <Table
                    columns={columns}
                    dataSource={orders}
                    rowKey="id"
                    loading={loading}
                    onChange={handleTableChange}
                    scroll={{ x: 1000 }}
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
                                {range[0]}-{range[1]} of <Text strong>{total}</Text> orders
                            </Text>
                        ),
                        style: { marginTop: 16 },
                    }}
                />
            </Card>

            <style>{`
                .ant-table-row-alt {
                    background: #fafbff !important;
                }
                .ant-table-row:hover td {
                    background: #f0f5ff !important;
                }
                .ant-tabs-tab {
                    padding: 6px 4px !important;
                }
                .ant-tabs-tab + .ant-tabs-tab {
                    margin: 0 0 0 4px !important;
                }
                .ant-tabs-ink-bar {
                    display: none !important;
                }
                .ant-table-thead > tr > th {
                    background: #f8f9fe !important;
                    font-weight: 700 !important;
                    font-size: 12px !important;
                    text-transform: uppercase !important;
                    letter-spacing: 0.5px !important;
                    color: #555 !important;
                    border-bottom: 2px solid #e8e8e8 !important;
                }
                .ant-card {
                    box-shadow: 0 1px 3px rgba(0,0,0,0.06) !important;
                }
            `}</style>
        </div>
    );
};

export default Order;