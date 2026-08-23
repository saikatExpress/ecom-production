import { ClearOutlined, DeleteOutlined, EditOutlined, EyeOutlined, FilterOutlined, PlusOutlined, ReloadOutlined, SearchOutlined, ShoppingOutlined } from "@ant-design/icons";
import { Badge, Breadcrumb, Button, Card, Flex, Input, Popconfirm, Select, Space, Table, Tag, Tooltip, Typography, message } from "antd";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDatas } from "../../services/request";

const { Title, Text } = Typography;

export default function ProductList() {
    const navigate                    = useNavigate();
    const [products, setProducts]     = useState([]);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands]         = useState([]);
    const [loading, setLoading]       = useState(false);

    // Filter states
    const [search, setSearch]         = useState("");
    const [categoryId, setCategoryId] = useState(undefined);
    const [brandId, setBrandId]       = useState(undefined);
    const [status, setStatus]         = useState(undefined);

    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 25,
        total: 0,
    });

    // Fetch Products from backend API
    const fetchProducts = useCallback(async (page = 1, pageSize = 25) => {
        setLoading(true);
        try {
            const params = {
                page: page,
                paginate_size: pageSize,
            };

            if (search) params.search = search;
            if (categoryId) params.category_id = categoryId;
            if (brandId) params.brand_id = brandId;
            if (status) params.status = status;

            const response = await getDatas("admin/product", params);

            if (response?.success && response?.data) {
                setProducts(response.data.items || []);
                setPagination({
                    current: response.data.pagination?.current_page || page,
                    pageSize: response.data.pagination?.per_page || pageSize,
                    total: response.data.pagination?.total || 0,
                });
            } else if (response?.data?.items) {
                setProducts(response.data.items || []);
                setPagination({
                    current: response.data.pagination?.current_page || page,
                    pageSize: response.data.pagination?.per_page || pageSize,
                    total: response.data.pagination?.total || 0,
                });
            }
        } catch (error) {
            console.error("Failed to fetch products:", error);
            message.error(error?.response?.data?.message || "Failed to fetch product list.");
        } finally {
            setLoading(false);
        }
    }, [search, categoryId, brandId, status]);

    // Fetch Categories and Brands for select dropdowns
    useEffect(() => {
        const fetchDropdownData = async () => {
            try {
                const catRes = await getDatas("/admin/category", { paginate_size: 100 });
                if (catRes?.data?.items) {
                    setCategories(catRes.data.items);
                }
            } catch (err) {
                console.log("Could not load categories for filter:", err);
            }

            try {
                const brandRes = await getDatas("/admin/brand", { paginate_size: 100 });
                if (brandRes?.data?.items) {
                    setBrands(brandRes.data.items);
                }
            } catch (err) {
                console.log("Could not load brands for filter:", err);
            }
        };

        fetchDropdownData();
    }, []);

    // Trigger product fetch when filters or page changes
    useEffect(() => {
        fetchProducts(pagination.current, pagination.pageSize);
    }, [fetchProducts, pagination.current, pagination.pageSize]);

    const handleTableChange = (newPagination) => {
        setPagination((prev) => ({
            ...prev,
            current: newPagination.current,
            pageSize: newPagination.pageSize,
        }));
    };

    const handleSearchSubmit = (value) => {
        setSearch(value);
        setPagination((prev) => ({ ...prev, current: 1 }));
    };

    const handleResetFilters = () => {
        setSearch("");
        setCategoryId(undefined);
        setBrandId(undefined);
        setStatus(undefined);
        setPagination((prev) => ({ ...prev, current: 1 }));
    };

    const handleRefresh = () => {
        fetchProducts(pagination.current, pagination.pageSize);
    };

    const columns = [
        {
            title: "ID",
            dataIndex: "id",
            key: "id",
            width: 65,
            sorter: (a, b) => a.id - b.id,
        },
        {
            title: "Product Details",
            key: "product_info",
            width: 250,
            render: (_, record) => (
                <Space direction="vertical" size={2}>
                    <Text strong style={{ fontSize: "14px" }}>
                        {record.name}
                    </Text>
                    <Space size="small">
                        <Tag color="default" style={{ fontFamily: "monospace", fontSize: "11px" }}>
                            {record.sku}
                        </Tag>
                    </Space>
                </Space>
            ),
        },
        {
            title: "Category & Brand",
            key: "category_brand",
            width: 170,
            render: (_, record) => (
                <Space direction="vertical" size={4}>
                    {record.category?.name ? (
                        <Tag color="blue">{record.category.name}</Tag>
                    ) : (
                        <Text type="secondary">-</Text>
                    )}
                    {record.brand?.name ? (
                        <Tag color="purple">{record.brand.name}</Tag>
                    ) : (
                        <Text type="secondary">-</Text>
                    )}
                </Space>
            ),
        },
        {
            title: "Price Breakdown",
            key: "prices",
            width: 170,
            render: (_, record) => (
                <Space direction="vertical" size={0}>
                    <Text strong style={{ color: "#1677ff" }}>
                        Price: ৳{record.offer_price || record.sell_price}
                    </Text>
                    {record.mrp && Number(record.mrp) > Number(record.sell_price) && (
                        <Text delete type="secondary" style={{ fontSize: "12px" }}>
                            MRP: ৳{record.mrp}
                        </Text>
                    )}
                    <Text type="secondary" style={{ fontSize: "11px" }}>
                        Buy: ৳{record.buy_price}
                    </Text>
                </Space>
            ),
        },
        {
            title: "Stock & Sales",
            key: "stock_sales",
            width: 140,
            render: (_, record) => {
                const stock = record.current_stock ?? 0;
                const badgeStatus = stock > 20 ? "success" : stock > 0 ? "warning" : "error";
                return (
                    <Space direction="vertical" size={2}>
                        <Badge status={badgeStatus} text={`${stock} in stock`} />
                        <Text type="secondary" style={{ fontSize: "12px" }}>
                            <ShoppingOutlined style={{ marginRight: 4 }} />
                            {record.total_sell_quantity ?? 0} sold
                        </Text>
                    </Space>
                );
            },
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            width: 100,
            render: (stat) => {
                const isActive = stat?.toLowerCase() === "active";
                return (
                    <Tag color={isActive ? "success" : "error"} style={{ textTransform: "capitalize" }}>
                        {stat || "inactive"}
                    </Tag>
                );
            },
        },
        {
            title: "Created At",
            dataIndex: "created_at",
            key: "created_at",
            width: 160,
            render: (date) => (date ? new Date(date).toLocaleString() : "-"),
        },
        {
            title: "Action",
            key: "action",
            width: 140,
            fixed: "right",
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="View Details">
                        <Button type="text" size="small" icon={<EyeOutlined />} />
                    </Tooltip>
                    <Tooltip title="Edit Product">
                        <Button type="text" size="small" icon={<EditOutlined style={{ color: "#1677ff" }} />} />
                    </Tooltip>
                    <Popconfirm
                        title="Delete Product"
                        description={`Delete "${record.name}"?`}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Tooltip title="Delete Product">
                            <Button type="text" danger size="small" icon={<DeleteOutlined />} />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div className="product-list-page">
            <Breadcrumb
                items={[
                    { title: "Dashboard" },
                    { title: "Product" },
                    { title: "Product List" },
                ]}
                style={{ marginBottom: 16 }}
            />

            <Card
                title={
                    <Flex justify="space-between" align="center" wrap="wrap" gap="small">
                        <Title level={3} style={{ margin: 0 }}>
                            Product List
                        </Title>
                        <Space>
                            <Button danger icon={<DeleteOutlined />}>
                                Trash
                            </Button>
                            <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate("/products/create")}>
                                Add Product
                            </Button>
                        </Space>
                    </Flex>
                }
            >
                {/* Search & Filters Toolbar */}
                <Card
                    type="inner"
                    title={
                        <Space>
                            <FilterOutlined />
                            <span>Filters & Search</span>
                        </Space>
                    }
                    style={{ marginBottom: 16, backgroundColor: "#fafafa" }}
                    bodyStyle={{ padding: "16px" }}
                >
                    <Flex wrap="wrap" gap="medium" align="center" justify="space-between">
                        <Space wrap gap="small">
                            {/* Search by Name or SKU */}
                            <Input.Search
                                placeholder="Search Name or SKU..."
                                allowClear
                                enterButton={<SearchOutlined />}
                                style={{ width: 260 }}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onSearch={handleSearchSubmit}
                            />

                            {/* Category Filter */}
                            <Select
                                placeholder="Category"
                                allowClear
                                style={{ width: 160 }}
                                value={categoryId}
                                onChange={(val) => {
                                    setCategoryId(val);
                                    setPagination((prev) => ({ ...prev, current: 1 }));
                                }}
                                options={categories.map((c) => ({ label: c.name, value: c.id }))}
                            />

                            {/* Brand Filter */}
                            <Select
                                placeholder="Brand"
                                allowClear
                                style={{ width: 160 }}
                                value={brandId}
                                onChange={(val) => {
                                    setBrandId(val);
                                    setPagination((prev) => ({ ...prev, current: 1 }));
                                }}
                                options={brands.map((b) => ({ label: b.name, value: b.id }))}
                            />

                            {/* Status Filter */}
                            <Select
                                placeholder="Status"
                                allowClear
                                style={{ width: 130 }}
                                value={status}
                                onChange={(val) => {
                                    setStatus(val);
                                    setPagination((prev) => ({ ...prev, current: 1 }));
                                }}
                                options={[
                                    { label: "Active", value: "active" },
                                    { label: "Inactive", value: "inactive" },
                                ]}
                            />

                            {/* Clear Filters */}
                            {(search || categoryId || brandId || status) && (
                                <Button icon={<ClearOutlined />} onClick={handleResetFilters}>
                                    Reset
                                </Button>
                            )}
                        </Space>

                        <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading}>
                            Refresh
                        </Button>
                    </Flex>
                </Card>

                {/* Product Data Table */}
                <Table
                    columns={columns}
                    dataSource={products}
                    rowKey="id"
                    loading={loading}
                    scroll={{ x: 1100 }}
                    pagination={{
                        current: pagination.current,
                        pageSize: pagination.pageSize,
                        total: pagination.total,
                        showSizeChanger: true,
                        pageSizeOptions: ["10", "25", "50", "100"],
                        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} products`,
                    }}
                    onChange={handleTableChange}
                />
            </Card>
        </div>
    );
}
