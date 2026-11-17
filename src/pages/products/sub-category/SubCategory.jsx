import { ClearOutlined, DeleteOutlined, EditOutlined, PictureOutlined, PlusOutlined, ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import { Avatar, Breadcrumb, Button, Card, Flex, Image, Input, Popconfirm, Select, Space, Table, Tag, Typography, message } from "antd";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import usePermissions from "../../../hooks/usePermissions";
import useTitle from "../../../hooks/useTitle";
import { deleteData, getDatas } from "../../../services/request";
import "./SubCategory.css";

const { Title, Text } = Typography;

export default function SubCategory() {
    // Hook
    useTitle("Sub Category");

    // Variable
    const navigate = useNavigate();
    const location = useLocation();
    const {hasPermission} = usePermissions();

    // Check if returning from edit
    const returningFromEdit = Boolean(
        location.state?.subCategoryId ||
        sessionStorage.getItem("subcategory_last_id")
    );

    const initialPage = returningFromEdit
        ? (location.state?.page || Number(sessionStorage.getItem("subcategory_page")) || 1)
        : 1;

    const initialPageSize = returningFromEdit
        ? (location.state?.pageSize || Number(sessionStorage.getItem("subcategory_pageSize")) || 25)
        : 25;

    const initialSearch = returningFromEdit
        ? (location.state?.searchKey ?? sessionStorage.getItem("subcategory_search") ?? "")
        : "";

    const initialCategoryId = returningFromEdit
        ? (location.state?.categoryId ?? (sessionStorage.getItem("subcategory_category_id") ? Number(sessionStorage.getItem("subcategory_category_id")) : undefined))
        : undefined;

    const initialTargetId = returningFromEdit
        ? (location.state?.subCategoryId || sessionStorage.getItem("subcategory_last_id") || null)
        : null;

    // States
    const [subCategories, setSubCategories] = useState([]);
    const [categories, setCategories]       = useState([]);
    const [loading, setLoading]             = useState(false);
    const [searchKey, setSearchKey]         = useState(initialSearch);
    const [categoryId, setCategoryId]       = useState(initialCategoryId);
    const [pagination, setPagination]       = useState({
        current: initialPage,
        pageSize: initialPageSize,
        total: 0,
    });

    const [targetSubCategoryId]             = useState(initialTargetId);
    const [highlightedRowId, setHighlightedRowId] = useState(null);

    // Fetch Sub Categories from backend API
    const fetchSubCategories = async (page = 1, pageSize = 25) => {
        setLoading(true);
        try {
            const params = {
                page: page,
                paginate_size: pageSize,
            };

            if (searchKey) params.search_key = searchKey;
            if (categoryId) params.category_id = categoryId;

            const response = await getDatas("/admin/subcategory", params);

            if (response?.success && response?.data) {
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
    };

    useEffect(() => {
        const fetchCategoryList = async () => {
            try {
                const res = await getDatas("/admin/category/list");
                if (res?.data) {
                    setCategories(Array.isArray(res.data) ? res.data : (res.data.items || []));
                }
            } catch (err) {
                console.log("Could not load categories for filter:", err);
            }
        };

        fetchCategoryList();
    }, []);

    useEffect(() => {
        fetchSubCategories(pagination.current, pagination.pageSize);
    }, [pagination.current, pagination.pageSize, searchKey, categoryId]);

    const handleTableChange = (newPagination) => {
        setPagination((prev) => ({
            ...prev,
            current: newPagination.current,
            pageSize: newPagination.pageSize,
        }));
        sessionStorage.setItem("subcategory_page", String(newPagination.current));
        sessionStorage.setItem("subcategory_pageSize", String(newPagination.pageSize));
    };

    const handleDelete = async (id) => {
        try {
            const res = await deleteData(`/admin/subcategory/${id}`);
            if (res?.success) {
                message.success(res?.message || "Sub category deleted successfully");
                setSubCategories((prev) => prev.filter((item) => item.id !== id));
            } else {
                message.error(res?.message || "Failed to delete sub category");
            }
        } catch (error) {
            console.error("Delete error:", error);
            message.error(error?.response?.data?.message || "An error occurred during deletion");
        }
    };

    const handleSearchSubmit = (value) => {
        setSearchKey(value);
        setPagination((prev) => ({ ...prev, current: 1 }));
        sessionStorage.setItem("subcategory_page", "1");
        sessionStorage.setItem("subcategory_search", value || "");
    };

    const handleResetFilters = () => {
        setSearchKey("");
        setCategoryId(undefined);
        setPagination((prev) => ({ ...prev, current: 1 }));
        sessionStorage.removeItem("subcategory_page");
        sessionStorage.removeItem("subcategory_search");
        sessionStorage.removeItem("subcategory_category_id");
        sessionStorage.removeItem("subcategory_last_id");
    };

    const handleEdit = (record) => {
        sessionStorage.setItem("subcategory_last_id", String(record.id));
        sessionStorage.setItem("subcategory_page", String(pagination.current));
        sessionStorage.setItem("subcategory_pageSize", String(pagination.pageSize));
        sessionStorage.setItem("subcategory_search", searchKey || "");
        if (categoryId) {
            sessionStorage.setItem("subcategory_category_id", String(categoryId));
        } else {
            sessionStorage.removeItem("subcategory_category_id");
        }

        navigate(`/edit/subcategory/${record.id}`, {
            state: {
                fromPage: 'Sub Category List Page',
                fromAction: 'Click "Edit" Button',
                subCategoryId: record.id,
                page: pagination.current,
                pageSize: pagination.pageSize,
                searchKey,
                categoryId,
            }
        });
    };

    // Scroll and highlight target row when returning from edit
    useEffect(() => {
        if (!loading && targetSubCategoryId && subCategories.length > 0) {
            const itemExists = subCategories.some((s) => String(s.id) === String(targetSubCategoryId));
            if (itemExists) {
                setHighlightedRowId(targetSubCategoryId);

                const scrollTimer = setTimeout(() => {
                    const rowEl = document.getElementById(`subcategory-row-${targetSubCategoryId}`);
                    if (rowEl) {
                        rowEl.scrollIntoView({ behavior: "smooth", block: "center" });
                    }
                }, 200);

                // Clean up session storage flag so future visits start fresh
                sessionStorage.removeItem("subcategory_last_id");

                const highlightTimer = setTimeout(() => {
                    setHighlightedRowId(null);
                }, 4000);

                return () => {
                    clearTimeout(scrollTimer);
                    clearTimeout(highlightTimer);
                };
            }
        }
    }, [loading, subCategories, targetSubCategoryId]);

    const handleRefresh = () => {
        fetchSubCategories(pagination.current, pagination.pageSize);
    };

    const columns = 
    [
        {
            title: "SL",
            key: "sl",
            width: 70,
            render: (text, record, index) => (pagination.current - 1) * pagination.pageSize + index + 1,
        },
        {
            title: "Image",
            dataIndex: "image",
            key: "image",
            width: 90,
            render: (image, record) =>
                image ? (
                    <Image src={image} alt={record.name} width={40} height={40} style={{ objectFit: "cover", borderRadius: 4 }}/>
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
                    <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
                        Edit
                    </Button>

                    <Popconfirm 
                        title="Delete Sub Category" 
                        description={`Are you sure to delete "${record.name}"?`} 
                        onConfirm={() => handleDelete(record.id)}
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
                            {hasPermission('sub_category_delete') && (
                                <Button danger icon={<DeleteOutlined />} onClick={() => navigate('/subcategory/trash')}>
                                    Trash
                                </Button>
                            )}
                            
                            {hasPermission('sub_category_create') && (
                                <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/add/subcategory', {
                                    state: { fromPage: 'Sub-Category List', fromAction: 'Breadcrumb "Sub-Category List' }
                                })}>
                                    Add New Sub-Category
                                </Button>
                            )}
                        </Space>
                    </Flex>
                }
            >
                <Flex justify="space-between" align="center" style={{ marginBottom: 16 }} wrap="wrap" gap="small">
                    <Space wrap gap="small">
                        <Input.Search 
                            placeholder="Search sub category..." 
                            allowClear 
                            enterButton={<SearchOutlined />} 
                            style={{ width: 280 }} 
                            value={searchKey}
                            onChange={(e) => {
                                setSearchKey(e.target.value);
                                if (!e.target.value) {
                                    handleResetFilters();
                                }
                            }} 
                            onSearch={handleSearchSubmit}
                        />

                        <Select
                            placeholder="Filter by Category"
                            allowClear
                            style={{ width: 200 }}
                            value={categoryId}
                            onChange={(val) => {
                                setCategoryId(val);
                                setPagination((prev) => ({ ...prev, current: 1 }));
                                sessionStorage.setItem("subcategory_page", "1");
                                if (val) {
                                    sessionStorage.setItem("subcategory_category_id", String(val));
                                } else {
                                    sessionStorage.removeItem("subcategory_category_id");
                                }
                            }}
                            options={categories.map((cat) => ({
                                label: cat.name,
                                value: cat.id,
                            }))}
                        />

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

                <Table
                    columns={columns}
                    dataSource={subCategories}
                    rowKey="id"
                    loading={loading}
                    rowClassName={(record) => String(record.id) === String(highlightedRowId) ? "subcategory-highlighted-row" : ""}
                    onRow={(record) => ({
                        id: `subcategory-row-${record.id}`,
                    })}
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
