import { ArrowLeftOutlined, DeleteOutlined, ReloadOutlined, SearchOutlined, UndoOutlined } from "@ant-design/icons";
import { Breadcrumb, Button, Card, Col, Collapse, DatePicker, Flex, Form, Input, message, Popconfirm, Row, Select, Space, Table, Tag, Typography } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import usePermissions from "../../hooks/usePermissions";
import useTitle from "../../hooks/useTitle";
import { deleteData, getDatas, postData } from "../../services/request";

const { Title, Text } = Typography;

const OrderTrash = () => {
    // Hook
    useTitle("Order Trash List");

    // Variable
    const navigate = useNavigate();
    const { hasPermission } = usePermissions();
    const [form] = Form.useForm();

    // States
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    
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
            
            // Clean up empty params
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
            search_key: '',
            status_id: null,
            paid_status: null,
            customer_type_id: null,
            delivery_gateway_id: null,
            payment_gateway_id: null,
            district_id: null,
            courier_id: null,
            is_duplicate: null,
            date_from: null,
            date_to: null,
            deleted_from: null,
            deleted_to: null,
            sort_by: 'deleted_at',
            sort_direction: 'desc'
        };
        setFilters(resetFilters);
        fetchOrders(resetFilters, 1, pagination.per_page);
    };

    const handleRestore = async (id) => {
        try {
            const res = await postData(`/admin/order/${id}/restore`);
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
            const res = await deleteData(`/admin/order/${id}/force`);
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
            title: 'SL',
            key: 'sl',
            width: 55,
            render: (_, __, index) => (
                <Text type="secondary" style={{ fontSize: 13 }}>{slStart + index}</Text>
            )
        },
        {
            title: 'Invoice',
            dataIndex: 'invoice_number',
            key: 'invoice_number',
            sorter: true,
            render: (text) => <Text strong>{text}</Text>
        },
        {
            title: 'Deleted At',
            dataIndex: 'deleted_at',
            key: 'deleted_at',
            sorter: true,
            render: (date) => date ? new Date(date).toLocaleString() : 'N/A'
        },
        {
            title: 'Deleted By',
            key: 'deleted_by',
            render: (_, record) => record.deleted_by?.username || 'N/A'
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
                        <Popconfirm
                            title="Restore order"
                            description="Are you sure you want to restore this order?"
                            onConfirm={() => handleRestore(record.id)}
                            okText="Yes"
                            cancelText="No"
                        >
                            <Button type="link" size="small" icon={<UndoOutlined />}>
                                Restore
                            </Button>
                        </Popconfirm>
                    )}
                    {hasPermission('order_delete') && (
                        <Popconfirm
                            title="Permanently delete"
                            description="Are you sure you want to delete this permanently? This action cannot be undone."
                            onConfirm={() => handleForceDelete(record.id)}
                            okText="Yes"
                            cancelText="No"
                        >
                            <Button type="link" danger size="small" icon={<DeleteOutlined />}>
                                Delete
                            </Button>
                        </Popconfirm>
                    )}
                </Space>
            )
        }
    ];

    return (
        <div className="order-trash-page">
            <Breadcrumb
                items={[
                    { title: "Dashboard" },
                    { title: "Order" },
                    { title: "Order Trash" },
                ]}
                style={{ marginBottom: 16 }}
            />

            <Card
                title={
                    <Flex justify="space-between" align="center" wrap="wrap" gap="small">
                        <Title level={3} style={{ margin: 0 }}>
                            Order Trash List
                        </Title>
                        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/orders', {
                            state: {fromPage: 'Order Trash List Page', fromAction: 'Click "Back to Orders" Button'}
                        })}>
                            Back to Orders
                        </Button>
                    </Flex>
                }
            >
                <div style={{ marginBottom: 16 }}>
                    <Form form={form} onFinish={handleFilterSubmit} layout="vertical">
                        <Row gutter={16}>
                            <Col span={8}>
                                <Form.Item name="search_key" label="Search">
                                    <Input placeholder="Invoice, Name, Phone" allowClear />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item name="deletedRange" label="Deleted Date">
                                    <DatePicker.RangePicker style={{ width: '100%' }} />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item name="dateRange" label="Order Date">
                                    <DatePicker.RangePicker style={{ width: '100%' }} />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Collapse ghost style={{ padding: 0 }}>
                            <Collapse.Panel header="Advanced Filters" key="1" style={{ padding: 0 }}>
                                <Row gutter={16}>
                                    <Col span={4}>
                                        <Form.Item name="status_id" label="Status ID">
                                            <Input type="number" placeholder="ID" allowClear />
                                        </Form.Item>
                                    </Col>
                                    <Col span={4}>
                                        <Form.Item name="paid_status" label="Paid Status">
                                            <Select placeholder="Select status" allowClear>
                                                <Select.Option value="paid">Paid</Select.Option>
                                                <Select.Option value="partial">Partial</Select.Option>
                                                <Select.Option value="unpaid">Unpaid</Select.Option>
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                    <Col span={4}>
                                        <Form.Item name="is_duplicate" label="Is Duplicate?">
                                            <Select placeholder="Select" allowClear>
                                                <Select.Option value="true">Yes</Select.Option>
                                                <Select.Option value="false">No</Select.Option>
                                            </Select>
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

export default OrderTrash;
