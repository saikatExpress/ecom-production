import { EditOutlined, EyeOutlined, PlusOutlined, ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import { Breadcrumb, Button, Card, Col, Collapse, DatePicker, Flex, Form, Input, Row, Select, Space, Table, Tabs, Tag, Typography, message } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import usePermissions from "../../hooks/usePermissions";
import useTitle from "../../hooks/useTitle";
import { getDatas } from "../../services/request";

const { Title, Text } = Typography;

const Order = () => {
    // Hook
    useTitle("Order List");

    // Variable
    const navigate = useNavigate();
    const { hasPermission } = usePermissions();
    const [form] = Form.useForm();

    // States
    const [orders, setOrders] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [loading, setLoading] = useState(false);
    
    const [filters, setFilters] = useState({
        search_key: '',
        status_id: null,
        paid_status: null,
        customer_type_id: null,
        delivery_gateway_id: null,
        payment_gateway_id: null,
        district_id: null,
        courier_id: null,
        courier_status: null,
        assign_user_id: null,
        prepared_by: null,
        is_duplicate: null,
        date_from: null,
        date_to: null,
        min_amount: null,
        max_amount: null,
        sort_by: 'id',
        sort_direction: 'desc'
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
            
            // Clean up empty params
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
        fetchOrders(filters, pagination.current_page, pagination.per_page);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters.status_id]); // Fetch only when status_id (tab) changes. Other filters are handled via submit button.

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
            status_id: filters.status_id, // keep active tab
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

    const mainTabItems = [
        { key: 'all', label: 'All Orders' }
    ];
    
    [1, 2, 3, 4, 5, 6, 7, 8].forEach(id => {
        const s = statuses.find(st => st.id === id);
        if (s) {
            mainTabItems.push({
                key: s.id.toString(),
                label: `${s.name} (${s.total_orders})`
            });
        }
    });
    mainTabItems.push({ key: 'rnd', label: 'R & D' });

    let subTabItems = [];
    if (activeMainTab === '4') {
        subTabItems = [4, 13, 14].map(id => {
            const s = statuses.find(st => st.id === id);
            if (s) return { key: s.id.toString(), label: `${s.name} (${s.total_orders})` };
            return null;
        }).filter(Boolean);
    } else if (activeMainTab === 'rnd') {
        subTabItems = [9, 10, 11, 12].map(id => {
            const s = statuses.find(st => st.id === id);
            if (s) return { key: s.id.toString(), label: `${s.name} (${s.total_orders})` };
            return null;
        }).filter(Boolean);
    }

    const columns = [
        {
            title: 'Invoice',
            dataIndex: 'invoice_number',
            key: 'invoice_number',
            sorter: true,
            render: (text) => <Text strong>{text}</Text>
        },
        {
            title: 'Date',
            dataIndex: 'order_date',
            key: 'order_date',
            sorter: true,
            render: (date) => new Date(date).toLocaleString()
        },
        {
            title: 'Customer',
            key: 'customer',
            render: (_, record) => (
                <div>
                    <div><Text strong>{record.customer_name}</Text></div>
                    <div>{record.phone_number}</div>
                    <div style={{ fontSize: '12px', color: 'gray' }}>{record.shipping_address}</div>
                </div>
            )
        },
        {
            title: 'Amount',
            dataIndex: 'total_payable_amount',
            key: 'total_payable_amount',
            sorter: true,
            render: (amount, record) => (
                <div>
                    <div>Total: ৳{amount}</div>
                    {parseFloat(record.due) > 0 && <div style={{ color: 'red' }}>Due: ৳{record.due}</div>}
                </div>
            )
        },
        {
            title: 'Paid Status',
            dataIndex: 'paid_status',
            key: 'paid_status',
            render: (status) => {
                const color = status === 'paid' ? 'success' : status === 'partial' ? 'warning' : 'error';
                return <Tag color={color} style={{ textTransform: 'capitalize' }}>{status || 'Unpaid'}</Tag>
            }
        },
        {
            title: 'Order Status',
            key: 'status',
            render: (_, record) => (
                <Tag color="blue">{record.current_status?.name}</Tag>
            )
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Space size="small">
                    {hasPermission('order_read') && (
                        <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => navigate(`/orders/view/${record.id}`)}>
                            View
                        </Button>
                    )}
                    {hasPermission('order_update') && (
                        <Button type="link" size="small" icon={<EditOutlined />} onClick={() => navigate(`/edit/order/${record.id}`)}>
                            Edit
                        </Button>
                    )}
                </Space>
            )
        }
    ];

    return (
        <div className="order-page">
            <Breadcrumb
                items={[
                    { title: "Dashboard" },
                    { title: "Order" },
                    { title: "Order List" },
                ]}
                style={{ marginBottom: 16 }}
            />

            <Card
                title={
                    <Flex justify="space-between" align="center" wrap="wrap" gap="small">
                        <Title level={3} style={{ margin: 0 }}>
                            Order List
                        </Title>
                        {hasPermission('order_create') && (
                            <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/add/order', {
                                state: {fromPage: 'Order List Page', fromAction: 'Click "Add Order" Button'}
                            })}>
                                Add Order
                            </Button>
                        )}
                    </Flex>
                }
            >
                <div style={{ marginBottom: 16 }}>
                    <Form form={form} onFinish={handleFilterSubmit} layout="vertical">
                        <Row gutter={16}>
                            <Col span={6}>
                                <Form.Item name="search_key" label="Search">
                                    <Input placeholder="Invoice, Name, Phone" allowClear />
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item name="dateRange" label="Order Date">
                                    <DatePicker.RangePicker style={{ width: '100%' }} />
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item name="paid_status" label="Paid Status">
                                    <Select placeholder="Select status" allowClear>
                                        <Select.Option value="paid">Paid</Select.Option>
                                        <Select.Option value="partial">Partial</Select.Option>
                                        <Select.Option value="unpaid">Unpaid</Select.Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item name="is_duplicate" label="Is Duplicate?">
                                    <Select placeholder="Select" allowClear>
                                        <Select.Option value="true">Yes</Select.Option>
                                        <Select.Option value="false">No</Select.Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>
                        <Collapse ghost style={{ padding: 0 }}>
                            <Collapse.Panel header="Advanced Filters" key="1" style={{ padding: 0 }}>
                                <Row gutter={16}>
                                    <Col span={4}>
                                        <Form.Item name="min_amount" label="Min Amount">
                                            <Input type="number" placeholder="Min" allowClear />
                                        </Form.Item>
                                    </Col>
                                    <Col span={4}>
                                        <Form.Item name="max_amount" label="Max Amount">
                                            <Input type="number" placeholder="Max" allowClear />
                                        </Form.Item>
                                    </Col>
                                    <Col span={4}>
                                        <Form.Item name="district_id" label="District ID">
                                            <Input type="number" placeholder="ID" allowClear />
                                        </Form.Item>
                                    </Col>
                                    <Col span={4}>
                                        <Form.Item name="customer_type_id" label="Customer Type ID">
                                            <Input type="number" placeholder="ID" allowClear />
                                        </Form.Item>
                                    </Col>
                                    <Col span={4}>
                                        <Form.Item name="delivery_gateway_id" label="Del. Gateway ID">
                                            <Input type="number" placeholder="ID" allowClear />
                                        </Form.Item>
                                    </Col>
                                    <Col span={4}>
                                        <Form.Item name="payment_gateway_id" label="Pay. Gateway ID">
                                            <Input type="number" placeholder="ID" allowClear />
                                        </Form.Item>
                                    </Col>
                                    <Col span={4}>
                                        <Form.Item name="courier_id" label="Courier ID">
                                            <Input type="number" placeholder="ID" allowClear />
                                        </Form.Item>
                                    </Col>
                                    <Col span={4}>
                                        <Form.Item name="courier_status" label="Courier Status">
                                            <Input placeholder="Status" allowClear />
                                        </Form.Item>
                                    </Col>
                                    <Col span={4}>
                                        <Form.Item name="assign_user_id" label="Assigned User ID">
                                            <Input type="number" placeholder="ID" allowClear />
                                        </Form.Item>
                                    </Col>
                                    <Col span={4}>
                                        <Form.Item name="prepared_by" label="Prepared By ID">
                                            <Input type="number" placeholder="ID" allowClear />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Collapse.Panel>
                        </Collapse>
                        <Flex justify="flex-end" gap="small" style={{ marginBottom: 16 }}>
                            <Button onClick={handleReset}>Reset</Button>
                            <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>Apply Filters</Button>
                            <Button icon={<ReloadOutlined />} onClick={() => fetchOrders(filters, pagination.current_page, pagination.per_page)} loading={loading}>
                                Refresh
                            </Button>
                        </Flex>
                    </Form>
                </div>

                <Tabs 
                    activeKey={activeMainTab} 
                    items={mainTabItems} 
                    onChange={handleMainTabChange} 
                />

                {subTabItems.length > 0 && (
                    <Tabs 
                        activeKey={filters.status_id ? filters.status_id.toString() : ''} 
                        items={subTabItems} 
                        onChange={handleSubTabChange} 
                        type="card"
                        size="small"
                        style={{ marginBottom: 16 }}
                    />
                )}

                <Table
                    columns={columns}
                    dataSource={orders}
                    rowKey="id"
                    loading={loading}
                    onChange={handleTableChange}
                    pagination={{
                        current: pagination.current_page,
                        pageSize: pagination.per_page,
                        total: pagination.total,
                        showSizeChanger: true,
                        pageSizeOptions: ["10", "25", "50", "100"],
                        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                    }}
                />
            </Card>
        </div>
    );
};

export default Order;