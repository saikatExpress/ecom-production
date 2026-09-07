import { AppstoreOutlined, BarcodeOutlined, ClearOutlined, ClockCircleOutlined, DeleteOutlined, DollarOutlined, EditOutlined, EyeOutlined, InfoCircleOutlined, PlusOutlined, ReloadOutlined, SafetyOutlined, ShoppingCartOutlined, TagsOutlined } from "@ant-design/icons";
import { Breadcrumb, Button, Card, Col, DatePicker, Descriptions, Divider, Flex, Input, List, Modal, Popconfirm, Row, Select, Space, Spin, Table, Tag, Typography, message } from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import usePermissions from "../../../hooks/usePermissions";
import useTitle from "../../../hooks/useTitle";
import { deleteData, getData, getDatas } from "../../../services/request";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const Coupon = () => {
    // Hook
    useTitle("All Coupon");

    // Variable
    const navigate        = useNavigate();
    const {hasPermission} = usePermissions();

    // States
    const [coupons, setCoupons]       = useState([]);
    const [loading, setLoading]       = useState(false);
    const [pagination, setPagination] = useState({current: 1,pageSize: 25,total: 0});

    const initialFilters = {
        search_key   : "",
        discount_type: undefined,
        apply_scope  : undefined,
        status       : undefined,
        date_from    : null,
        date_to      : null,
    };

    const [filters, setFilters] = useState(initialFilters);

    // View Modal States
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [viewData, setViewData]               = useState(null);
    const [viewLoading, setViewLoading]         = useState(false);

    const fetchCoupons = async (currentFilters = filters, page = 1) => {
        setLoading(true);
        try {
            const params = {
                page,
                ...currentFilters,
            };

            // Clean up empty params
            Object.keys(params).forEach(key => {
                if (params[key] === undefined || params[key] === null || params[key] === "") {
                    delete params[key];
                }
            });

            const response = await getDatas("/admin/coupon", params);
            if (response?.success && response?.data) {
                setCoupons(response.data.items || []);
                if (response.data.pagination) {
                    setPagination({
                        current: response.data.pagination.current_page,
                        pageSize: response.data.pagination.per_page,
                        total: response.data.pagination.total,
                    });
                }
            } else if (Array.isArray(response)) {
                setCoupons(response);
            } else if (response?.data && Array.isArray(response.data)) {
                setCoupons(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch coupons:", error);
            message.error(error?.response?.data?.message || "Failed to fetch coupons.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCoupons(filters, 1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleFilterChange = (key, value) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        fetchCoupons(newFilters, 1);
    };

    const handleDateRangeChange = (dates, dateStrings) => {
        const newFilters = { 
            ...filters, 
            date_from: dateStrings ? dateStrings[0] : null, 
            date_to: dateStrings ? dateStrings[1] : null 
        };
        setFilters(newFilters);
        fetchCoupons(newFilters, 1);
    };

    const handleReset = () => {
        setFilters(initialFilters);
        fetchCoupons(initialFilters, 1);
    };

    const handleRefresh = () => {
        fetchCoupons(filters, pagination.current);
    };

    const handleTableChange = (newPagination) => {
        fetchCoupons(filters, newPagination.current);
    };

    const handleDelete = async (id) => {
        try {
            const res = await deleteData(`/admin/coupon/${id}`);
            if (res?.success) {
                message.success(res?.message || "Coupon deleted successfully");
                fetchCoupons(filters, pagination.current);
            } else {
                message.error(res?.message || "Failed to delete coupon");
            }
        } catch (error) {
            console.error(error);
            message.error(error?.response?.data?.message || "An error occurred");
        }
    };

    const handleView = async (id) => {
        setIsViewModalOpen(true);
        setViewLoading(true);
        try {
            const response = await getData(`/admin/coupon/${id}`);
            if (response?.success && response?.data) {
                setViewData(response.data);
            } else {
                message.error("Failed to fetch coupon details.");
                setIsViewModalOpen(false);
            }
        } catch (error) {
            console.error(error);
            message.error(error?.response?.data?.message || "An error occurred");
            setIsViewModalOpen(false);
        } finally {
            setViewLoading(false);
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
            title: "Code",
            dataIndex: "code",
            key: "code",
            render: (text) => (
                <Text strong>
                    <Tag color="blue">{text}</Tag>
                </Text>
            ),
        },
        {
            title: "Discount",
            key: "discount",
            render: (_, record) => (
                <Text strong>
                    {record.discount_value} {record.discount_type === "percentage" ? "%" : "Fixed"}
                </Text>
            ),
        },
        {
            title: "Scope",
            dataIndex: "apply_scope",
            key: "apply_scope",
            render: (text) => (
                <Tag color="cyan" style={{ textTransform: "capitalize" }}>
                    {text ? text.replace(/_/g, " ") : "-"}
                </Tag>
            ),
        },
        {
            title: "Min Order Amount",
            dataIndex: "min_order_amount",
            key: "min_order_amount",
        },
        {
            title: "Usage Limit",
            dataIndex: "usage_limit",
            key: "usage_limit",
            render: (limit) => limit ?? "Unlimited",
        },
        {
            title: "Used",
            dataIndex: "used_count",
            key: "used_count",
        },
        {
            title: "Starts At",
            dataIndex: "starts_at",
            key: "starts_at",
            render: (date) => (date ? new Date(date).toLocaleString() : "-"),
        },
        {
            title: "Expires At",
            dataIndex: "expires_at",
            key: "expires_at",
            render: (date) => (date ? new Date(date).toLocaleString() : "-"),
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
            width: 200,
            render: (_, record) => (
                <Space size="small">
                    {hasPermission('coupon_read') && (
                        <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleView(record.id)}>
                            View
                        </Button>
                    )}

                    {hasPermission('coupon_update') && (
                        <Button type="link" size="small" icon={<EditOutlined />} onClick={() => navigate(`/coupon/edi/${record.id}`, {
                            state: {fromPage: 'Edit Status Page', fromAction: 'Click "Edit" Button'}
                        })}>
                            Edit
                        </Button>
                    )}
                    
                    {hasPermission('coupon_delete') && (
                        <Popconfirm 
                            title="Delete Coupon" 
                            description={`Are you sure to delete coupon "${record.code}"?`} 
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
        <div className="coupon-page">
            <Breadcrumb
                items={[{ title: "Dashboard" }, { title: "Order" }, { title: "Coupons" }]}
                style={{ marginBottom: 16 }}
            />

            <Card
                title={
                    <Flex justify="space-between" align="center" wrap="wrap" gap="small">
                        <Title level={3} style={{ margin: 0 }}>
                            Coupon List
                        </Title>
                        <Space>
                            {hasPermission('coupon_create') && (
                                <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/coupon/add', {
                                    state: {fromPage: 'Coupon List Page', fromAction: 'Click "Add Coupon" Button'}
                                })}>
                                    Add Coupon
                                </Button>
                            )}

                            {hasPermission('coupon_delete') && (
                                <Button type="primary" danger icon={<DeleteOutlined />} onClick={() => navigate('/coupon/trash')}>
                                    Trash
                                </Button>
                            )}
                            
                            <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading}>
                                Refresh
                            </Button>
                        </Space>
                    </Flex>
                }
            >
                <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                    <Col xs={24} sm={12} md={8} lg={4}>
                        <Input.Search
                            placeholder="Search code..."
                            allowClear
                            value={filters.search_key}
                            onChange={(e) => setFilters({ ...filters, search_key: e.target.value })}
                            onSearch={(value) => handleFilterChange('search_key', value)}
                            style={{ width: '100%' }}
                        />
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={4}>
                        <Select
                            placeholder="Discount Type"
                            allowClear
                            style={{ width: '100%' }}
                            value={filters.discount_type}
                            onChange={(value) => handleFilterChange('discount_type', value)}
                            options={[
                                { value: 'percentage', label: 'Percentage' },
                                { value: 'fixed', label: 'Fixed' },
                            ]}
                        />
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={4}>
                        <Select
                            placeholder="Apply Scope"
                            allowClear
                            style={{ width: '100%' }}
                            value={filters.apply_scope}
                            onChange={(value) => handleFilterChange('apply_scope', value)}
                            options={[
                                { value: 'all_products', label: 'All Products' },
                                { value: 'selected_products', label: 'Selected Products' },
                                { value: 'selected_categories', label: 'Selected Categories' },
                            ]}
                        />
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={4}>
                        <Select
                            placeholder="Status"
                            allowClear
                            style={{ width: '100%' }}
                            value={filters.status}
                            onChange={(value) => handleFilterChange('status', value)}
                            options={[
                                { value: 'active', label: 'Active' },
                                { value: 'inactive', label: 'Inactive' },
                            ]}
                        />
                    </Col>
                    <Col xs={24} sm={24} md={12} lg={6}>
                        <RangePicker 
                            style={{ width: '100%' }} 
                            onChange={handleDateRangeChange}
                            value={filters.date_from && filters.date_to ? [dayjs(filters.date_from), dayjs(filters.date_to)] : null}
                        />
                    </Col>
                    <Col xs={24} sm={24} md={4} lg={2}>
                        <Button icon={<ClearOutlined />} onClick={handleReset} style={{ width: '100%' }}>
                            Reset
                        </Button>
                    </Col>
                </Row>

                <Table
                    columns={columns}
                    dataSource={coupons}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        ...pagination,
                        showSizeChanger: true,
                        pageSizeOptions: ["10", "25", "50", "100"],
                        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                    }}
                    onChange={handleTableChange}
                    scroll={{ x: "max-content" }}
                />
            </Card>

            <Modal
                title={
                    <Space>
                        <InfoCircleOutlined style={{ color: '#1890ff' }} />
                        <span style={{ fontSize: '18px', fontWeight: 600 }}>Coupon Details</span>
                    </Space>
                }
                open={isViewModalOpen}
                onCancel={() => setIsViewModalOpen(false)}
                footer={[
                    <Button key="close" type="primary" onClick={() => setIsViewModalOpen(false)}>
                        Close
                    </Button>
                ]}
                width={800}
                centered
                styles={{
                    body: { maxHeight: '75vh', overflowY: 'auto', padding: '20px 24px', backgroundColor: '#fcfcfc' },
                }}
            >
                {viewLoading ? (
                    <Flex justify="center" align="center" style={{ padding: "60px 0" }}>
                        <Spin size="large" tip="Loading coupon details..." />
                    </Flex>
                ) : viewData ? (
                    <div className="coupon-details-wrapper">
                        <Row gutter={[16, 16]}>
                            {/* Top Section: Highlighted Code & Status */}
                            <Col span={24}>
                                <Flex justify="space-between" align="center" style={{ background: '#f0f2f5', padding: '16px 24px', borderRadius: '8px' }}>
                                    <Space direction="vertical" size={0}>
                                        <Text type="secondary" style={{ fontSize: '12px' }}><BarcodeOutlined /> COUPON CODE</Text>
                                        <Title level={3} style={{ margin: 0, color: '#1890ff', letterSpacing: '2px' }}>{viewData.code}</Title>
                                    </Space>
                                    <Space direction="vertical" align="end" size={0}>
                                        <Text type="secondary" style={{ fontSize: '12px' }}>STATUS</Text>
                                        <Tag 
                                            color={viewData.status === "active" ? "success" : "error"} 
                                            style={{ textTransform: "capitalize", margin: 0, padding: '4px 12px', fontSize: '14px', borderRadius: '4px' }}
                                        >
                                            {viewData.status || "Inactive"}
                                        </Tag>
                                    </Space>
                                </Flex>
                            </Col>

                            {/* Middle Section: Descriptions */}
                            <Col span={24}>
                                <Card size="small" title={<Space><DollarOutlined /> <span>Discount & Scope</span></Space>} bordered={true} style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.05)', borderColor: '#f0f0f0' }}>
                                    <Descriptions column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }} size="small" layout="vertical">
                                        <Descriptions.Item label="Discount Value">
                                            <Text strong style={{ fontSize: '16px', color: '#52c41a' }}>
                                                {viewData.discount_value} {viewData.discount_type === "percentage" ? "%" : "Fixed"}
                                            </Text>
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Apply Scope">
                                            <Tag color="cyan" style={{ textTransform: "capitalize", fontSize: '13px', padding: '2px 8px' }}>
                                                {viewData.apply_scope ? viewData.apply_scope.replace(/_/g, " ") : "-"}
                                            </Tag>
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Min. Order Amount">
                                            <Text strong>{viewData.min_order_amount} BDT</Text>
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Max. Discount Amount">
                                            {viewData.max_discount_amount ? <Text strong>{viewData.max_discount_amount} BDT</Text> : <Text type="secondary">N/A</Text>}
                                        </Descriptions.Item>
                                    </Descriptions>
                                </Card>
                            </Col>

                            <Col span={24}>
                                <Card size="small" title={<Space><SafetyOutlined /> <span>Usage & Limits</span></Space>} bordered={true} style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.05)', borderColor: '#f0f0f0' }}>
                                    <Descriptions column={{ xxl: 3, xl: 3, lg: 3, md: 1, sm: 1, xs: 1 }} size="small" layout="vertical">
                                        <Descriptions.Item label="Total Usage Limit">
                                            {viewData.usage_limit ? <Text strong>{viewData.usage_limit} Times</Text> : <Text type="secondary">Unlimited</Text>}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Per Phone Limit">
                                            {viewData.per_phone_limit ? <Text strong>{viewData.per_phone_limit} Times</Text> : <Text type="secondary">Unlimited</Text>}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Currently Used">
                                            <Tag color="magenta" style={{ fontSize: '14px' }}>{viewData.used_count} Times</Tag>
                                        </Descriptions.Item>
                                    </Descriptions>
                                </Card>
                            </Col>

                            <Col span={24}>
                                <Card size="small" title={<Space><ClockCircleOutlined /> <span>Validity Period</span></Space>} bordered={true} style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.05)', borderColor: '#f0f0f0' }}>
                                    <Descriptions column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }} size="small" layout="vertical">
                                        <Descriptions.Item label="Starts At">
                                            <Text strong>{viewData.starts_at ? new Date(viewData.starts_at).toLocaleString() : "-"}</Text>
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Expires At">
                                            <Text strong>{viewData.expires_at ? new Date(viewData.expires_at).toLocaleString() : "-"}</Text>
                                        </Descriptions.Item>
                                    </Descriptions>
                                </Card>
                            </Col>

                            {/* Dynamic Sections: Products and Categories */}
                            {(viewData.products?.length > 0 || viewData.categories?.length > 0) && (
                                <Col span={24}>
                                    <Divider style={{ margin: '12px 0' }} />
                                </Col>
                            )}

                            {viewData.products && viewData.products.length > 0 && (
                                <Col span={24}>
                                    <Space direction="vertical" style={{ width: '100%' }}>
                                        <Text strong><ShoppingCartOutlined style={{ marginRight: '8px', color: '#1890ff' }}/> Applicable Products ({viewData.products.length})</Text>
                                        <List
                                            size="small"
                                            bordered
                                            dataSource={viewData.products}
                                            renderItem={(item) => (
                                                <List.Item>
                                                    <Space>
                                                        <TagsOutlined style={{ color: '#8c8c8c' }} />
                                                        <Text>{item.name}</Text>
                                                    </Space>
                                                </List.Item>
                                            )}
                                            style={{ maxHeight: 250, overflowY: 'auto', background: '#fff', borderRadius: '6px' }}
                                        />
                                    </Space>
                                </Col>
                            )}

                            {viewData.categories && viewData.categories.length > 0 && (
                                <Col span={24}>
                                    <Space direction="vertical" style={{ width: '100%' }}>
                                        <Text strong><AppstoreOutlined style={{ marginRight: '8px', color: '#1890ff' }}/> Applicable Categories ({viewData.categories.length})</Text>
                                        <div style={{ background: '#fff', padding: '12px', border: '1px solid #d9d9d9', borderRadius: '6px' }}>
                                            <Space size={[0, 8]} wrap>
                                                {viewData.categories.map(cat => (
                                                    <Tag key={cat.id} color="processing" style={{ padding: '4px 10px', fontSize: '13px' }}>
                                                        {cat.name}
                                                    </Tag>
                                                ))}
                                            </Space>
                                        </div>
                                    </Space>
                                </Col>
                            )}
                        </Row>
                    </div>
                ) : (
                    <Flex justify="center" align="center" style={{ padding: "40px 0", flexDirection: "column" }}>
                        <InfoCircleOutlined style={{ fontSize: '48px', color: '#ff4d4f', marginBottom: '16px' }} />
                        <Text type="danger" style={{ fontSize: '16px' }}>No coupon data available or failed to load.</Text>
                    </Flex>
                )}
            </Modal>
        </div>
    );
};

export default Coupon;