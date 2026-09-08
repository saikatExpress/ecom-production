import { ClearOutlined, DeleteOutlined, EditOutlined, EyeOutlined, FilterOutlined, PlusOutlined, ReloadOutlined, SearchOutlined, ShoppingOutlined } from "@ant-design/icons";
import { Badge, Breadcrumb, Button, Card, Flex, Input, InputNumber, Popconfirm, Select, Space, Table, Tag, Tooltip, Typography, message } from "antd";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteData, getDatas } from "../../services/request";
import usePermissions from './../../hooks/usePermissions';
import useTitle from './../../hooks/useTitle';

const { Title, Text } = Typography;

export default function ProductList() {
    // Hook
    useTitle('Product List');

    const {hasPermission} = usePermissions();

    const navigate                    = useNavigate();
    const [products, setProducts]     = useState([]);
    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [brands, setBrands]         = useState([]);
    const [loading, setLoading]       = useState(false);

    // Filter states
    const [searchKey, setSearchKey]           = useState("");
    const [categoryIds, setCategoryIds]       = useState([]);
    const [subCategoryIds, setSubCategoryIds] = useState([]);
    const [brandIds, setBrandIds]             = useState([]);
    const [minPrice, setMinPrice]             = useState(undefined);
    const [maxPrice, setMaxPrice]             = useState(undefined);
    const [status, setStatus]                 = useState(undefined);

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

            if (searchKey) params.search_key = searchKey;
            
            if (categoryIds?.length > 0) params.category_ids = categoryIds;
            if (subCategoryIds?.length > 0) params.sub_category_ids = subCategoryIds;
            if (brandIds?.length > 0) params.brand_ids = brandIds;
            
            if (minPrice !== undefined && minPrice !== null) params.min_price = minPrice;
            if (maxPrice !== undefined && maxPrice !== null) params.max_price = maxPrice;
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
    }, [searchKey, categoryIds, subCategoryIds, brandIds, minPrice, maxPrice, status]);

    useEffect(() => {
        const fetchDropdownData = async () => {
            try {
                const catRes = await getDatas("/admin/category/list");
                if (catRes?.data) {
                    setCategories(catRes.data);
                }
            } catch (err) {
                console.log("Could not load categories for filter:", err);
            }

            try {
                const brandRes = await getDatas("/admin/brand/list");
                if (brandRes?.data) {
                    setBrands(brandRes.data);
                }
            } catch (err) {
                console.log("Could not load brands for filter:", err);
            }
        };

        fetchDropdownData();
    }, []);

    useEffect(() => {
        if (!categoryIds || categoryIds.length === 0) {
            setSubCategories([]);
            return;
        }

        const fetchSubCategories = async () => {
            try {
                const subCatRes = await getDatas("admin/subcategory/list", { category_ids: categoryIds });
                if (subCatRes?.data) {
                    setSubCategories(subCatRes.data);
                }
            } catch (err) {
                console.log("Could not load subcategories:", err);
            }
        };

        fetchSubCategories();
    }, [categoryIds]);

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
        setSearchKey(value);
        setPagination((prev) => ({ ...prev, current: 1 }));
    };

    const handleResetFilters = () => {
        setSearchKey("");
        setCategoryIds([]);
        setSubCategoryIds([]);
        setBrandIds([]);
        setMinPrice(undefined);
        setMaxPrice(undefined);
        setStatus(undefined);
        setPagination((prev) => ({ ...prev, current: 1 }));
    };

    const handleRefresh = () => {
        fetchProducts(pagination.current, pagination.pageSize);
    };

    const handleDelete = async (id) => {
        try {
            const res = await deleteData(`/admin/product/${id}`);
            if (res?.success) {
                message.success(res?.message || "Product deleted successfully");
                setProducts(prevProducts => prevProducts.filter(p => p.id !== id));
                setPagination(prev => ({ ...prev, total: prev.total - 1 }));
            } else {
                message.error(res?.message || "Failed to delete product");
            }
        } catch (error) {
            console.error("Delete product error:", error);
            message.error(error?.response?.data?.message || "An error occurred during deletion");
        }
    };

    const columns = 
    [
        {
            title: "SL",
            key: "sl",
            width: 65,
            render: (_, __, index) => (pagination.current - 1) * pagination.pageSize + index + 1,
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
            title: "Action",
            key: "action",
            width: 140,
            fixed: "right",
            render: (_, record) => (
                <Space size="small">
                    {hasPermission('product_read') && (
                        <Tooltip title="View Details">
                            <Button type="text" size="small" icon={<EyeOutlined />} />
                        </Tooltip>
                    )}

                    {hasPermission('product_update') && (
                        <Tooltip title="Edit Product">
                            <Button type="text" size="small" icon={<EditOutlined style={{ color: "#1677ff" }} />} onClick={() => navigate(`/edit/product/${record.id}`, {
                                state: {fromPage: 'Product List Page', fromAction: 'Click "Edit" Button'}
                            })}/>
                        </Tooltip>
                    )}

                    {hasPermission('product_delete') && (
                        <Popconfirm
                            title="Delete Product"
                            description={`Delete "${record.name}"?`}
                            okText="Yes"
                            cancelText="No"
                            onConfirm={() => handleDelete(record.id)}
                        >
                            <Tooltip title="Delete Product">
                                <Button type="text" danger size="small" icon={<DeleteOutlined />} />
                            </Tooltip>
                        </Popconfirm>
                    )}
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
                            {hasPermission('product_delete') && (
                                <Button danger icon={<DeleteOutlined />}>
                                    Trash
                                </Button>
                            )}

                            {hasPermission('product_create') && (
                                <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate("/products/create", {
                                    state: {fromPage: 'Product List Page', fromAction: 'Click "Add Product" Button'}
                                })}>
                                    Add Product
                                </Button>
                            )}
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
                                style={{ width: 220 }}
                                value={searchKey}
                                onChange={(e) => setSearchKey(e.target.value)}
                                onSearch={handleSearchSubmit}
                            />

                            {/* Category Filter */}
                            <Select
                                placeholder="Categories"
                                allowClear
                                mode="multiple"
                                maxTagCount="responsive"
                                style={{ minWidth: 140, maxWidth: 220 }}
                                value={categoryIds}
                                onChange={(val) => {
                                    setCategoryIds(val);
                                    setSubCategoryIds([]);
                                    setPagination((prev) => ({ ...prev, current: 1 }));
                                }}
                                options={categories.map((c) => ({ label: c.name, value: c.id }))}
                            />

                            {/* Sub Category Filter */}
                            <Select
                                placeholder="Sub Categories"
                                allowClear
                                mode="multiple"
                                maxTagCount="responsive"
                                style={{ minWidth: 150, maxWidth: 220 }}
                                value={subCategoryIds}
                                onChange={(val) => {
                                    setSubCategoryIds(val);
                                    setPagination((prev) => ({ ...prev, current: 1 }));
                                }}
                                options={subCategories.map((c) => ({ label: c.name, value: c.id }))}
                            />

                            {/* Brand Filter */}
                            <Select
                                placeholder="Brands"
                                allowClear
                                mode="multiple"
                                maxTagCount="responsive"
                                style={{ minWidth: 120, maxWidth: 220 }}
                                value={brandIds}
                                onChange={(val) => {
                                    setBrandIds(val);
                                    setPagination((prev) => ({ ...prev, current: 1 }));
                                }}
                                options={brands.map((b) => ({ label: b.name, value: b.id }))}
                            />

                            {/* Min Price */}
                            <InputNumber 
                                placeholder="Min Price" 
                                style={{ width: 110 }} 
                                min={0} 
                                value={minPrice} 
                                onChange={(val) => {
                                    setMinPrice(val);
                                    setPagination((prev) => ({ ...prev, current: 1 }));
                                }} 
                            />

                            {/* Max Price */}
                            <InputNumber 
                                placeholder="Max Price" 
                                style={{ width: 110 }} 
                                min={0} 
                                value={maxPrice} 
                                onChange={(val) => {
                                    setMaxPrice(val);
                                    setPagination((prev) => ({ ...prev, current: 1 }));
                                }} 
                            />

                            {/* Status Filter */}
                            <Select
                                placeholder="Status"
                                allowClear
                                style={{ width: 100 }}
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
                            {(searchKey || categoryIds?.length > 0 || subCategoryIds?.length > 0 || brandIds?.length > 0 || minPrice !== undefined || maxPrice !== undefined || status) && (
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
