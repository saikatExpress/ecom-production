import { AppstoreOutlined, ClearOutlined, DeleteOutlined, DownloadOutlined, EditOutlined, EyeOutlined, FilterOutlined, PlusOutlined, ReloadOutlined, SearchOutlined, ShoppingOutlined } from "@ant-design/icons";
import { Avatar, Badge, Breadcrumb, Button, Card, Flex, Input, InputNumber, message, Modal, Popconfirm, Radio, Select, Space, Table, Tag, Tooltip, Typography } from "antd";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProductPreviewModal from "../../components/product/ProductPreviewModal";
import { deleteData, getData, getDatas } from "../../services/request";
import usePermissions from './../../hooks/usePermissions';
import useTitle from './../../hooks/useTitle';

const { Title, Text } = Typography;

export default function ProductTrash() {
    // Hook
    useTitle('Product Trash List');

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
    const [status, setStatus]                 = useState(undefined);

    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 25,
        total: 0,
    });

    // Bulk action states
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [isBulkModalVisible, setIsBulkModalVisible] = useState(false);
    const [bulkStatus, setBulkStatus] = useState("active");

    // Preview Modal states
    const [previewModalVisible, setPreviewModalVisible] = useState(false);
    const [previewProduct, setPreviewProduct] = useState(null);
    const [previewLoading, setPreviewLoading] = useState(false);

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
            
            if (status) params.status = status;

            const response = await getDatas("admin/product/trash", params);

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
    }, [searchKey, categoryIds, subCategoryIds, brandIds, status]);

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
        setStatus(undefined);
        setPagination((prev) => ({ ...prev, current: 1 }));
    };

    const handleRefresh = () => {
        fetchProducts(pagination.current, pagination.pageSize);
    };

    const handleRestore = async (id) => {
        try {
            // Assuming restore uses a POST or GET endpoint. Update as needed.
            const res = await getDatas(`/admin/product/restore/${id}`);
            if (res?.success) {
                message.success(res?.message || "Product restored successfully");
                setProducts(prevProducts => prevProducts.filter(p => p.id !== id));
                setPagination(prev => ({ ...prev, total: prev.total - 1 }));
            } else {
                message.error(res?.message || "Failed to restore product");
            }
        } catch (error) {
            console.error("Restore product error:", error);
            message.error(error?.response?.data?.message || "An error occurred during restoration");
        }
    };

    const handleForceDelete = async (id) => {
        try {
            const res = await deleteData(`/admin/product/force-delete/${id}`);
            if (res?.success) {
                message.success(res?.message || "Product permanently deleted");
                setProducts(prevProducts => prevProducts.filter(p => p.id !== id));
                setPagination(prev => ({ ...prev, total: prev.total - 1 }));
            } else {
                message.error(res?.message || "Failed to permanently delete product");
            }
        } catch (error) {
            console.error("Force delete product error:", error);
            message.error(error?.response?.data?.message || "An error occurred during deletion");
        }
    };

    const handleBulkDelete = async () => {
        // You can integrate real API for bulk delete here
        message.info(`Ready to Bulk Delete IDs: ${selectedRowKeys.join(", ")}`);
        setIsBulkModalVisible(false);
        // setSelectedRowKeys([]);
        // fetchProducts(pagination.current, pagination.pageSize);
    };

    const handleBulkStatusChange = async () => {
        // You can integrate real API for bulk status update here
        message.info(`Ready to change status to ${bulkStatus} for IDs: ${selectedRowKeys.join(", ")}`);
        setIsBulkModalVisible(false);
        // setSelectedRowKeys([]);
    };

    const handleDownloadCSV = () => {
        const selectedProducts = products.filter(p => selectedRowKeys.includes(p.id));
        const headers = ["ID", "Name", "SKU", "Category", "Brand", "Price", "Stock", "Status"];
        const csvRows = [headers.join(",")];
        selectedProducts.forEach(p => {
            const safeName = p.name ? p.name.replace(/"/g, '""') : '';
            csvRows.push(`${p.id},"${safeName}","${p.sku}",${p.category?.name || ''},${p.brand?.name || ''},${p.sell_price},${p.current_stock},${p.status}`);
        });
        const csvString = csvRows.join("\n");
        const blob = new Blob([csvString], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'selected_products.csv';
        a.click();
        window.URL.revokeObjectURL(url);
        message.success("CSV Downloaded successfully");
        setIsBulkModalVisible(false);
    };

    const rowSelection = {
        selectedRowKeys,
        onChange: (newSelectedRowKeys) => {
            setSelectedRowKeys(newSelectedRowKeys);
        },
    };

    const handlePreviewProduct = async (id) => {
        setPreviewModalVisible(true);
        setPreviewLoading(true);
        try {
            const res = await getData(`/admin/product/${id}`);
            if (res?.success) {
                setPreviewProduct(res.data);
            } else {
                message.error(res?.message || "Failed to fetch product details");
                setPreviewModalVisible(false);
            }
        } catch (error) {
            console.error("Preview error:", error);
            message.error("Failed to load product preview");
            setPreviewModalVisible(false);
        } finally {
            setPreviewLoading(false);
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
            title: "Product Info",
            key: "product_info",
            width: 320,
            render: (_, record) => (
                <Space align="start" size="middle">
                    <Avatar 
                        shape="square" 
                        size={64} 
                        src={record.image} 
                        style={{ backgroundColor: '#fafafa', border: '1px solid #f0f0f0' }}
                    />
                    <Space direction="vertical" size={0}>
                        <Text strong style={{ fontSize: "14px", lineHeight: "1.2", display: 'block', whiteSpace: 'normal', marginBottom: 4 }}>
                            {record.name}
                        </Text>
                        <Space size="small" wrap>
                            <Text type="secondary" style={{ fontFamily: "monospace", fontSize: "12px", background: '#f5f5f5', padding: '2px 6px', borderRadius: 4 }}>
                                {record.sku}
                            </Text>
                            {record.variants?.length > 0 && (
                                <Tag color="geekblue" style={{ margin: 0 }}>{record.variants.length} Variants</Tag>
                            )}
                        </Space>
                    </Space>
                </Space>
            ),
        },
        {
            title: "Category & Brand",
            key: "category_brand",
            width: 180,
            render: (_, record) => (
                <Space direction="vertical" size={2}>
                    <Space size={4}>
                        <Tag color="cyan">{record.category?.name || "N/A"}</Tag>
                    </Space>
                    {record.subCategory?.name && (
                        <Text type="secondary" style={{ fontSize: "12px" }}>
                            ↳ {record.subCategory.name}
                        </Text>
                    )}
                    {record.brand?.name && (
                        <Tag color="purple" style={{ marginTop: 4 }}>{record.brand.name}</Tag>
                    )}
                </Space>
            ),
        },
        {
            title: "Pricing",
            key: "prices",
            width: 170,
            render: (_, record) => {
                if (record.variation_price_range) {
                    return (
                        <Space direction="vertical" size={0}>
                            <Text strong style={{ color: "#1677ff", fontSize: '15px' }}>
                                ৳{record.variation_price_range.min_price} - ৳{record.variation_price_range.max_price}
                            </Text>
                            <Text type="secondary" style={{ fontSize: "12px" }}>
                                Variable Pricing
                            </Text>
                        </Space>
                    );
                }

                return (
                    <Space direction="vertical" size={0}>
                        <Text strong style={{ color: "#1677ff", fontSize: '15px' }}>
                            ৳{record.offer_price || record.sell_price}
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
                );
            },
        },
        {
            title: "Inventory",
            key: "stock_sales",
            width: 150,
            render: (_, record) => {
                const stock = record.current_stock ?? 0;
                let color = "success";
                if (stock === 0) color = "error";
                else if (stock < 10) color = "warning";

                return (
                    <Space direction="vertical" size={4} style={{ width: '100%' }}>
                        <Flex justify="space-between" align="center">
                            <Text type="secondary" style={{ fontSize: "12px" }}>Stock:</Text>
                            <Badge status={color} text={<Text strong>{stock}</Text>} />
                        </Flex>
                        <Flex justify="space-between" align="center">
                            <Text type="secondary" style={{ fontSize: "12px" }}>Sales:</Text>
                            <Text strong>
                                <ShoppingOutlined style={{ marginRight: 4, color: '#1677ff' }} />
                                {record.total_sell_quantity ?? 0}
                            </Text>
                        </Flex>
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
                    {hasPermission('product_update') && (
                        <Popconfirm
                            title="Restore Product"
                            description={`Restore "${record.name}"?`}
                            okText="Yes"
                            cancelText="No"
                            onConfirm={() => handleRestore(record.id)}
                        >
                            <Tooltip title="Restore Product">
                                <Button type="text" size="small" icon={<ReloadOutlined style={{ color: "#52c41a" }} />} />
                            </Tooltip>
                        </Popconfirm>
                    )}

                    {hasPermission('product_delete') && (
                        <Popconfirm
                            title="Permanent Delete"
                            description={`Permanently delete "${record.name}"?`}
                            okText="Yes"
                            cancelText="No"
                            okType="danger"
                            onConfirm={() => handleForceDelete(record.id)}
                        >
                            <Tooltip title="Permanent Delete">
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
                    { title: "Product Trash List" },
                ]}
                style={{ marginBottom: 16 }}
            />

            <Card
                title={
                    <Flex justify="space-between" align="center" wrap="wrap" gap="small">
                        <Space align="center" size="middle">
                            <Title level={3} style={{ margin: 0 }}>
                                Product Trash List
                            </Title>
                            <Tag color="red" style={{ borderRadius: '16px', padding: '2px 12px', fontSize: '14px', fontWeight: 'bold' }}>
                                Total Trashed: {pagination.total}
                            </Tag>
                        </Space>
                        <Space>
                            {selectedRowKeys.length > 0 && (
                                <Button type="primary" style={{ backgroundColor: '#52c41a' }} icon={<AppstoreOutlined />} onClick={() => setIsBulkModalVisible(true)}>
                                    Bulk Actions ({selectedRowKeys.length})
                                </Button>
                            )}
                            <Button type="primary" onClick={() => navigate('/products')}>
                                Back to Products
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
                            {(searchKey || categoryIds?.length > 0 || subCategoryIds?.length > 0 || brandIds?.length > 0 || status) && (
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
                    bordered
                    columns={columns}
                    dataSource={products}
                    rowKey="id"
                    rowSelection={rowSelection}
                    loading={loading}
                    scroll={{ x: 1100, y: "calc(100vh - 380px)" }}
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

            <Modal
                title={`Bulk Actions (${selectedRowKeys.length} items selected)`}
                open={isBulkModalVisible}
                onCancel={() => setIsBulkModalVisible(false)}
                footer={null}
                width={500}
            >
                <Space direction="vertical" style={{ width: '100%' }} size="large">
                    <Card size="small" type="inner" title="1. Update Status">
                        <Space>
                            <Radio.Group value={bulkStatus} onChange={(e) => setBulkStatus(e.target.value)}>
                                <Radio.Button value="active">Active</Radio.Button>
                                <Radio.Button value="inactive">Inactive</Radio.Button>
                            </Radio.Group>
                            <Button type="primary" onClick={handleBulkStatusChange}>
                                Apply Status
                            </Button>
                        </Space>
                    </Card>

                    <Card size="small" type="inner" title="2. Export Data">
                        <Button icon={<DownloadOutlined />} onClick={handleDownloadCSV} block>
                            Download Selected as CSV
                        </Button>
                    </Card>

                    <Card size="small" type="inner" title="3. Danger Zone" style={{ borderColor: '#ffccc7' }} headStyle={{ color: '#cf1322' }}>
                        <Popconfirm title="Are you sure you want to delete the selected products?" onConfirm={handleBulkDelete} okText="Yes, Delete All" okType="danger">
                            <Button danger block icon={<DeleteOutlined />}>
                                Bulk Delete Products
                            </Button>
                        </Popconfirm>
                    </Card>
                </Space>
            </Modal>

            <ProductPreviewModal 
                visible={previewModalVisible} 
                onClose={() => setPreviewModalVisible(false)} 
                product={previewProduct} 
                loading={previewLoading}
            />
        </div>
    );
}
