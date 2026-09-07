import { ArrowLeftOutlined, ClearOutlined, DeleteOutlined, ReloadOutlined, SearchOutlined, UndoOutlined } from "@ant-design/icons";
import { Breadcrumb, Button, Card, Col, Flex, Form, Input, Popconfirm, Row, Select, Space, Table, Tag, Tooltip, Typography, message } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import usePermissions from "../../../hooks/usePermissions";
import useTitle from "../../../hooks/useTitle";
import { deleteData, getDatas, patchData } from "../../../services/request";

const { Title, Text } = Typography;

const CouponTrash = () => {
    // Hook
    useTitle("Coupon Trash List");

    // Variable
    const navigate          = useNavigate();
    const { hasPermission } = usePermissions();
    const [form]            = Form.useForm();

    // States
    const [coupons, setCoupons]         = useState([]);
    const [loading, setLoading]         = useState(false);
    const [filters, setFilters]         = useState({});
    const [tableParams, setTableParams] = useState({
        pagination: {
            current : 1,
            pageSize: 25,
            total   : 0
        },
    });

    const fetchCoupons = async (page = 1, pageSize = 25, currentFilters = filters) => {
        setLoading(true);
        try {
            // Build query params
            const queryParams = new URLSearchParams({
                page: page,
                paginate_size: pageSize,
                ...currentFilters
            });

            // Remove empty filters
            const keysForDeletion = [];
            for (const [key, value] of queryParams.entries()) {
                if (value === '' || value === null || value === undefined) {
                    keysForDeletion.push(key);
                }
            }
            keysForDeletion.forEach(key => queryParams.delete(key));

            const res = await getDatas(`/admin/coupon/trash?${queryParams.toString()}`);
            if (res?.success && res?.data) {
                const items = Array.isArray(res.data.items) ? res.data.items : (Array.isArray(res.data.data) ? res.data.data : []);
                
                setCoupons(items);
                
                if (res.data.pagination) {
                    setTableParams({
                        pagination: {
                            current : res.data.pagination.current_page,
                            pageSize: res.data.pagination.per_page,
                            total   : res.data.pagination.total,
                        }
                    });
                } else if (res.data.current_page !== undefined) {
                    setTableParams({
                        pagination: {
                            current : res.data.current_page,
                            pageSize: res.data.per_page,
                            total   : res.data.total,
                        }
                    });
                }
            } else {
                setCoupons([]);
            }
        } catch (error) {
            console.error("Failed to fetch coupon trash", error);
            message.error("Failed to load coupon trash");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCoupons(tableParams.pagination.current, tableParams.pagination.pageSize, filters);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleTableChange = (pagination) => {
        fetchCoupons(pagination.current, pagination.pageSize, filters);
    };

    const handleRefresh = () => {
        fetchCoupons(tableParams.pagination.current, tableParams.pagination.pageSize, filters);
    };

    const handleFilterSubmit = (values) => {
        setFilters(values);
        fetchCoupons(1, tableParams.pagination.pageSize, values);
    };

    const handleFilterReset = () => {
        form.resetFields();
        setFilters({});
        fetchCoupons(1, tableParams.pagination.pageSize, {});
    };

    const handleRestore = async (id) => {
        try {
            const res = await patchData(`/admin/coupon/${id}/restore`);
            if (res?.success !== false) {
                message.success(res?.message || 'Coupon restored successfully');
                fetchCoupons(tableParams.pagination.current, tableParams.pagination.pageSize, filters);
            } else {
                message.error(res?.message || 'Failed to restore coupon');
            }
        } catch (error) {
            console.error(error);
            message.error(error?.response?.data?.message || 'An error occurred while restoring');
        }
    };

    const handlePermanentDelete = async (id) => {
        try {
            const res = await deleteData(`/admin/coupon/permanent-delete/${id}`);
            if (res?.success !== false) {
                message.success(res?.message || 'Coupon deleted permanently');
                fetchCoupons(tableParams.pagination.current, tableParams.pagination.pageSize, filters);
            } else {
                message.error(res?.message || 'Failed to delete coupon');
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
            title: 'Code',
            dataIndex: 'code',
            key: 'code',
            render: (text) => <Text strong>{text}</Text>
        },
        {
            title: 'Discount',
            key: 'discount',
            render: (_, record) => (
                <Space direction="vertical" size="small">
                    <Text>
                        {record.discount_value} {record.discount_type === 'percentage' ? '%' : 'Tk'}
                    </Text>
                    <Tag color="blue">{record.discount_type}</Tag>
                </Space>
            )
        },
        {
            title: 'Scope',
            dataIndex: 'apply_scope',
            key: 'apply_scope',
            render: (text) => <Tag color="purple">{text?.replace('_', ' ').toUpperCase()}</Tag>
        },
        {
            title: 'Usage',
            key: 'usage',
            render: (_, record) => (
                <Text>
                    {record.used_count} / {record.usage_limit || '∞'}
                </Text>
            )
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (text) => (
                <Tag color={text === 'active' ? 'green' : 'red'}>
                    {text?.toUpperCase()}
                </Tag>
            )
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
            align: 'center',
            render: (_, record) => (
                <Space>
                    {hasPermission('coupon_delete') && (
                        <>
                            <Popconfirm 
                                title="Restore Coupon" 
                                description={`Are you sure you want to restore "${record.code}"?`} 
                                onConfirm={() => handleRestore(record.id)}
                                okText="Yes, Restore" 
                                cancelText="No"
                            >
                                <Tooltip title="Restore">
                                    <Button type="primary" size="small" icon={<UndoOutlined />} />
                                </Tooltip>
                            </Popconfirm>

                            <Popconfirm 
                                title="Permanently Delete Coupon" 
                                description={`Are you sure you want to permanently delete "${record.code}"? This cannot be undone.`} 
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
        <div className="coupon-trash-page">
            <Breadcrumb
                items={[
                    { title: "Dashboard" },
                    { title: "Order" },
                    { title: <a onClick={() => navigate('/coupons')}>Coupon</a> },
                    { title: "Trash" },
                ]}
                style={{ marginBottom: 16 }}
            />

            <Card style={{ marginBottom: 16, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }} bordered={false}>
                <Form form={form} onFinish={handleFilterSubmit} layout="vertical">
                    <Row gutter={16}>
                        <Col xs={24} sm={12} md={6}>
                            <Form.Item name="search_key" label="Search Code">
                                <Input placeholder="Enter coupon code" prefix={<SearchOutlined />} allowClear />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={5}>
                            <Form.Item name="discount_type" label="Discount Type">
                                <Select placeholder="Select Type" allowClear>
                                    <Select.Option value="percentage">Percentage</Select.Option>
                                    <Select.Option value="fixed">Fixed</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={5}>
                            <Form.Item name="apply_scope" label="Apply Scope">
                                <Select placeholder="Select Scope" allowClear>
                                    <Select.Option value="all_products">All Products</Select.Option>
                                    <Select.Option value="selected_products">Selected Products</Select.Option>
                                    <Select.Option value="categories">Categories</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={4}>
                            <Form.Item name="status" label="Status">
                                <Select placeholder="Select Status" allowClear>
                                    <Select.Option value="active">Active</Select.Option>
                                    <Select.Option value="inactive">Inactive</Select.Option>
                                    <Select.Option value="expired">Expired</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={4}>
                            <Form.Item label=" ">
                                <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                                    <Button onClick={handleFilterReset} icon={<ClearOutlined />}>
                                        Reset
                                    </Button>
                                    <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                                        Filter
                                    </Button>
                                </Space>
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Card>

            <Card 
                title={
                    <Flex justify="space-between" align="center" wrap="wrap" gap="small" style={{ padding: '8px 0' }}>
                        <Space>
                            <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/coupon')}/>
                            <Title level={4} style={{ margin: 0 }}>Coupon Trash List</Title>
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
                    dataSource={coupons} 
                    rowKey="id" 
                    loading={loading}
                    scroll={{ x: 1000 }}
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

export default CouponTrash;