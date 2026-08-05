import React, { useState, useEffect, useCallback } from "react";
import {
    Card,
    Typography,
    Breadcrumb,
    Table,
    Tag,
    Input,
    Button,
    Space,
    Popconfirm,
    message,
    Flex,
    Tooltip
} from "antd";
import {
    SearchOutlined,
    ReloadOutlined,
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    ClearOutlined
} from "@ant-design/icons";
import { getDatas } from "../../services/request";

const { Title, Text } = Typography;

export default function Attribute() {
    const [attributes, setAttributes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchKey, setSearchKey] = useState("");
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 25,
        total: 0,
    });

    const fetchAttributes = useCallback(async (page = 1, pageSize = 25, search = "") => {
        setLoading(true);
        try {
            const response = await getDatas("admin/attribute", {
                page: page,
                paginate_size: pageSize,
                search_key: search,
            });

            if (response?.success && response?.data) {
                setAttributes(response.data.items || []);
                setPagination({
                    current: response.data.pagination?.current_page || page,
                    pageSize: response.data.pagination?.per_page || pageSize,
                    total: response.data.pagination?.total || 0,
                });
            } else if (response?.data?.items) {
                setAttributes(response.data.items || []);
                setPagination({
                    current: response.data.pagination?.current_page || page,
                    pageSize: response.data.pagination?.per_page || pageSize,
                    total: response.data.pagination?.total || 0,
                });
            }
        } catch (error) {
            console.error("Failed to fetch attributes:", error);
            message.error(error?.response?.data?.message || "Failed to fetch attribute list.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAttributes(pagination.current, pagination.pageSize, searchKey);
    }, [fetchAttributes, pagination.current, pagination.pageSize, searchKey]);

    const handleTableChange = (newPagination) => {
        setPagination((prev) => ({
            ...prev,
            current: newPagination.current,
            pageSize: newPagination.pageSize,
        }));
    };

    const handleSearch = (value) => {
        setSearchKey(value);
        setPagination((prev) => ({ ...prev, current: 1 }));
    };

    const handleReset = () => {
        setSearchKey("");
        setPagination((prev) => ({ ...prev, current: 1 }));
    };

    const handleRefresh = () => {
        fetchAttributes(pagination.current, pagination.pageSize, searchKey);
    };

    const columns = [
        {
            title: "ID",
            dataIndex: "id",
            key: "id",
            width: 70,
            sorter: (a, b) => a.id - b.id,
        },
        {
            title: "Attribute Name",
            dataIndex: "name",
            key: "name",
            width: 180,
            render: (text) => <Text strong>{text}</Text>,
        },
        {
            title: "Slug",
            dataIndex: "slug",
            key: "slug",
            width: 150,
            render: (slug) => <Tag color="blue">{slug}</Tag>,
        },
        {
            title: "Attribute Values",
            dataIndex: "attributeValues",
            key: "attributeValues",
            render: (values) => {
                if (!values || values.length === 0) {
                    return <Text type="secondary">No values</Text>;
                }
                const maxVisible = 6;
                const visibleValues = values.slice(0, maxVisible);
                const hiddenCount = values.length - maxVisible;

                return (
                    <Space wrap gap="4px">
                        {visibleValues.map((v) => (
                            <Tag color="cyan" key={v.id || v.attribute_value}>
                                {v.attribute_value}
                            </Tag>
                        ))}
                        {hiddenCount > 0 && (
                            <Tooltip title={values.slice(maxVisible).map((v) => v.attribute_value).join(", ")}>
                                <Tag color="geekblue">+{hiddenCount} more</Tag>
                            </Tooltip>
                        )}
                    </Space>
                );
            },
        },
        {
            title: "Created At",
            dataIndex: "created_at",
            key: "created_at",
            width: 180,
            render: (date) => (date ? new Date(date).toLocaleString() : "-"),
        },
        {
            title: "Action",
            key: "action",
            width: 150,
            render: (_, record) => (
                <Space size="small">
                    <Button type="link" size="small" icon={<EditOutlined />}>
                        Edit
                    </Button>
                    <Popconfirm
                        title="Delete Attribute"
                        description={`Are you sure to delete "${record.name}"?`}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button type="link" danger size="small" icon={<DeleteOutlined />}>
                            Delete
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div className="attribute-page">
            <Breadcrumb
                items={[
                    { title: "Dashboard" },
                    { title: "Product" },
                    { title: "Attribute" },
                ]}
                style={{ marginBottom: 16 }}
            />

            <Card
                title={
                    <Flex justify="space-between" align="center" wrap="wrap" gap="small">
                        <Title level={3} style={{ margin: 0 }}>
                            Attribute List
                        </Title>
                        <Space>
                            <Button danger icon={<DeleteOutlined />}>
                                Trash
                            </Button>
                            <Button type="primary" icon={<PlusOutlined />}>
                                Add Attribute
                            </Button>
                        </Space>
                    </Flex>
                }
            >
                {/* Search & Actions Toolbar */}
                <Flex justify="space-between" align="center" style={{ marginBottom: 16 }} wrap="wrap" gap="small">
                    <Space wrap gap="small">
                        <Input.Search
                            placeholder="Search attribute name..."
                            allowClear
                            enterButton={<SearchOutlined />}
                            style={{ width: 300 }}
                            value={searchKey}
                            onChange={(e) => setSearchKey(e.target.value)}
                            onSearch={handleSearch}
                        />
                        {searchKey && (
                            <Button icon={<ClearOutlined />} onClick={handleReset}>
                                Reset
                            </Button>
                        )}
                    </Space>
                    <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading}>
                        Refresh
                    </Button>
                </Flex>

                {/* Attributes Table */}
                <Table
                    columns={columns}
                    dataSource={attributes}
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
}
