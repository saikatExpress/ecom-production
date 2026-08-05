import React, { useState, useEffect, useCallback } from "react";
import {
    Card,
    Typography,
    Breadcrumb,
    Table,
    Tag,
    Input,
    Select,
    Button,
    Space,
    Image,
    Avatar,
    Popconfirm,
    message,
    Flex
} from "antd";
import {
    SearchOutlined,
    ReloadOutlined,
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    PictureOutlined,
    ClearOutlined
} from "@ant-design/icons";
import { getDatas } from "../../services/request";

const { Title, Text } = Typography;

export default function SubCategory() {
    const [subCategories, setSubCategories] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);

    // Filter states
    const [searchKey, setSearchKey] = useState("");
    const [categoryId, setCategoryId] = useState(undefined);

    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 25,
        total: 0,
    });

    // Fetch Sub Categories from backend API
    const fetchSubCategories = useCallback(async (page = 1, pageSize = 25) => {
        setLoading(true);
        try {
            const params = {
                page: page,
                paginate_size: pageSize,
            };

            if (searchKey) params.search_key = searchKey;
            if (categoryId) params.category_id = categoryId;

            const response = await getDatas("admin/subcategory", params);

            if (response?.success && response?.data) {
                setSubCategories(response.data.items || []);
                setPagination({
                    current: response.data.pagination?.current_page || page,
                    pageSize: response.data.pagination?.per_page || pageSize,
                    total: response.data.pagination?.total || 0,
                });
            } else if (response?.data?.items) {
                setSubCategories(response.data.items || []);
                setPagination({
                    current: response.data.pagination?.current_page || page,
                    pageSize: response.data.pagination?.per_page || pageSize,
                    total: response.data.pagination?.total || 0,
                });
            }
        } catch (error) {
            console.error("Failed to fetch sub-categories:", error);
            message.error(error?.response?.data?.message || "Failed to fetch sub-category list.");
        } finally {
            setLoading(false);
        }
    }, [searchKey, categoryId]);

    // Fetch Category list for dropdown filter
    useEffect(() => {
        const fetchCategoryList = async () => {
            try {
                const res = await getDatas("/admin/category", { paginate_size: 100 });
                if (res?.data?.items) {
                    setCategories(res.data.items);
                }
            } catch (err) {
                console.log("Could not load categories for filter:", err);
            }
        };

        fetchCategoryList();
    }, []);

    // Re-fetch when page, searchKey, or categoryId changes
    useEffect(() => {
        fetchSubCategories(pagination.current, pagination.pageSize);
    }, [fetchSubCategories, pagination.current, pagination.pageSize]);

    const handleTableChange = (newPagination) => {
        setPagination((prev) => ({
            ...prev,
            current: newPagination.current,
            pageSize: newPagination.pageSize,
        }));
    };

    const handleSearchSubmit = (value) => {
        setSearchKey(value);
        setPagination((prev) => ({ ...prev, current: 1 }));
    };

    const handleResetFilters = () => {
        setSearchKey("");
        setCategoryId(undefined);
        setPagination((prev) => ({ ...prev, current: 1 }));
    };

    const handleRefresh = () => {
        fetchSubCategories(pagination.current, pagination.pageSize);
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
            title: "Image",
            dataIndex: "image",
            key: "image",
            width: 90,
            render: (image, record) =>
                image ? (
                    <Image
                        src={image}
                        alt={record.name}
                        width={40}
                        height={40}
                        style={{ objectFit: "cover", borderRadius: 4 }}
                    />
                ) : (
                    <Avatar shape="square" icon={<PictureOutlined />} size={40} />
                ),
        },
        {
            title: "Sub Category Name",
            dataIndex: "name",
            key: "name",
            render: (text) => <Text strong>{text}</Text>,
        },
        {
            title: "Category",
            key: "category",
            render: (_, record) =>
                record.category?.name ? (
                    <Tag color="blue">{record.category.name}</Tag>
                ) : (
                    <Text type="secondary">-</Text>
                ),
        },
        {
            title: "Slug",
            dataIndex: "slug",
            key: "slug",
            render: (slug) => <Tag color="purple">{slug}</Tag>,
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
                    <Button type="link" size="small" icon={<EditOutlined />}>
                        Edit
                    </Button>
                    <Popconfirm
                        title="Delete Sub Category"
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
        <div className="sub-category-page">
            <Breadcrumb
                items={[
                    { title: "Dashboard" },
                    { title: "Product" },
                    { title: "Sub Category" },
                ]}
                style={{ marginBottom: 16 }}
            />

            <Card
                title={
                    <Flex justify="space-between" align="center" wrap="wrap" gap="small">
                        <Title level={3} style={{ margin: 0 }}>
                            Sub Category List
                        </Title>
                        <Space>
                            <Button danger icon={<DeleteOutlined />}>
                                Trash
                            </Button>
                            <Button type="primary" icon={<PlusOutlined />}>
                                Add Sub Category
                            </Button>
                        </Space>
                    </Flex>
                }
            >
                {/* Search & Filters Toolbar */}
                <Flex justify="space-between" align="center" style={{ marginBottom: 16 }} wrap="wrap" gap="small">
                    <Space wrap gap="small">
                        {/* Search by Sub Category Name */}
                        <Input.Search
                            placeholder="Search sub category..."
                            allowClear
                            enterButton={<SearchOutlined />}
                            style={{ width: 280 }}
                            value={searchKey}
                            onChange={(e) => setSearchKey(e.target.value)}
                            onSearch={handleSearchSubmit}
                        />

                        {/* Filter by Category */}
                        <Select
                            placeholder="Filter by Category"
                            allowClear
                            style={{ width: 200 }}
                            value={categoryId}
                            onChange={(val) => {
                                setCategoryId(val);
                                setPagination((prev) => ({ ...prev, current: 1 }));
                            }}
                            options={categories.map((cat) => ({
                                label: cat.name,
                                value: cat.id,
                            }))}
                        />

                        {/* Reset Filters */}
                        {(searchKey || categoryId) && (
                            <Button icon={<ClearOutlined />} onClick={handleResetFilters}>
                                Reset
                            </Button>
                        )}
                    </Space>

                    <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading}>
                        Refresh
                    </Button>
                </Flex>

                {/* Sub Categories Table */}
                <Table
                    columns={columns}
                    dataSource={subCategories}
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
