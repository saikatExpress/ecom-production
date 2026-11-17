import { ClearOutlined, DeleteOutlined, EditOutlined, PictureOutlined, PlusOutlined, ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import { Avatar, Breadcrumb, Button, Card, Flex, Image, Input, Popconfirm, Space, Table, Tag, Typography, message } from "antd";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import usePermissions from "../../../hooks/usePermissions";
import useTitle from "../../../hooks/useTitle";
import { deleteData, getDatas } from "../../../services/request";
import "./Brand.css";

const { Title, Text } = Typography;

export default function Brand() {
    // Hook
    useTitle("Brand List");

    // Variable
    const navigate        = useNavigate();
    const location        = useLocation();
    const {hasPermission} = usePermissions();

    // Check if returning from edit
    const returningFromEdit = Boolean(
        location.state?.brandId ||
        sessionStorage.getItem("brand_last_id")
    );

    const initialPage = returningFromEdit
        ? (location.state?.page || Number(sessionStorage.getItem("brand_page")) || 1)
        : 1;

    const initialPageSize = returningFromEdit
        ? (location.state?.pageSize || Number(sessionStorage.getItem("brand_pageSize")) || 25)
        : 25;

    const initialSearch = returningFromEdit
        ? (location.state?.searchKey ?? sessionStorage.getItem("brand_search") ?? "")
        : "";

    const initialTargetId = returningFromEdit
        ? (location.state?.brandId || sessionStorage.getItem("brand_last_id") || null)
        : null;

    // States
    const [brands, setBrands]         = useState([]);
    const [loading, setLoading]       = useState(false);
    const [searchKey, setSearchKey]   = useState(initialSearch);
    const [pagination, setPagination] = useState({
        current: initialPage,
        pageSize: initialPageSize,
        total: 0,
    });

    const [targetBrandId]             = useState(initialTargetId);
    const [highlightedRowId, setHighlightedRowId] = useState(null);

    const fetchBrands = async (page = 1, pageSize = 25, search = "") => {
        setLoading(true);
        try {
            const res = await getDatas("admin/brand", {
                page: page,
                paginate_size: pageSize,
                search_key: search,
            });

            if (res && res?.success) {
                setBrands(res.data.items || []);
                setPagination({
                    current: res.data.pagination?.current_page || page,
                    pageSize: res.data.pagination?.per_page || pageSize,
                    total: res.data.pagination?.total || 0,
                });
            }
        } catch (error) {
            console.error("Failed to fetch brands:", error);
            message.error(error?.response?.data?.message || "Failed to fetch brand list.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBrands(pagination.current, pagination.pageSize, searchKey);
    }, [pagination.current, pagination.pageSize, searchKey]);

    const handleTableChange = (newPagination) => {
        setPagination((prev) => ({
            ...prev,
            current: newPagination.current,
            pageSize: newPagination.pageSize,
        }));
        sessionStorage.setItem("brand_page", String(newPagination.current));
        sessionStorage.setItem("brand_pageSize", String(newPagination.pageSize));
    };

    const handleDelete = async (id) => {
        try {
            const res = await deleteData(`/admin/brand/${id}`);
            if (res?.success) {
                message.success(res?.message || "Brand deleted successfully");
                setBrands((prev) => prev.filter((item) => item.id !== id));
            } else {
                message.error(res?.message || "Failed to delete brand");
            }
        } catch (error) {
            console.error("Delete error:", error);
            message.error(error?.response?.data?.message || "An error occurred during deletion");
        }
    };

    const handleSearch = (value) => {
        setSearchKey(value);
        setPagination((prev) => ({ ...prev, current: 1 }));
        sessionStorage.setItem("brand_page", "1");
        sessionStorage.setItem("brand_search", value || "");
    };

    const handleReset = () => {
        setSearchKey("");
        setPagination((prev) => ({ ...prev, current: 1 }));
        sessionStorage.removeItem("brand_page");
        sessionStorage.removeItem("brand_search");
        sessionStorage.removeItem("brand_last_id");
    };

    const handleEdit = (record) => {
        sessionStorage.setItem("brand_last_id", String(record.id));
        sessionStorage.setItem("brand_page", String(pagination.current));
        sessionStorage.setItem("brand_pageSize", String(pagination.pageSize));
        sessionStorage.setItem("brand_search", searchKey || "");

        navigate(`/edit/brand/${record.id}`, {
            state: {
                fromPage: 'Brand List Page',
                fromAction: 'Click "Edit" Button',
                brandId: record.id,
                page: pagination.current,
                pageSize: pagination.pageSize,
                searchKey,
            }
        });
    };

    // Scroll and highlight target row when returning from edit
    useEffect(() => {
        if (!loading && targetBrandId && brands.length > 0) {
            const itemExists = brands.some((b) => String(b.id) === String(targetBrandId));
            if (itemExists) {
                setHighlightedRowId(targetBrandId);

                const scrollTimer = setTimeout(() => {
                    const rowEl = document.getElementById(`brand-row-${targetBrandId}`);
                    if (rowEl) {
                        rowEl.scrollIntoView({ behavior: "smooth", block: "center" });
                    }
                }, 200);

                // Clean up session storage flag so future visits start fresh
                sessionStorage.removeItem("brand_last_id");

                const highlightTimer = setTimeout(() => {
                    setHighlightedRowId(null);
                }, 4000);

                return () => {
                    clearTimeout(scrollTimer);
                    clearTimeout(highlightTimer);
                };
            }
        }
    }, [loading, brands, targetBrandId]);

    const handleRefresh = () => {
        fetchBrands(pagination.current, pagination.pageSize, searchKey);
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
            title: "Image",
            dataIndex: "image",
            key: "image",
            width: 100,
            render: (image, record) =>
                image ? (
                    <Image src={image} alt={record.name} width={40} height={40} style={{ objectFit: "cover", borderRadius: 4 }}/>
                ) : (
                    <Avatar shape="square" icon={<PictureOutlined />} size={40} />
                ),
        },
        {
            title: "Brand Name",
            dataIndex: "name",
            key: "name",
            render: (text) => <Text strong>{text}</Text>,
        },
        {
            title: "Slug",
            dataIndex: "slug",
            key: "slug",
            render: (slug) => <Tag color="blue">{slug}</Tag>,
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
                    {hasPermission('brand_update') && (
                        <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
                            Edit
                        </Button>
                    )}
                    
                    {hasPermission('brand_delete') && (
                        <Popconfirm
                            title="Delete Brand"
                            description={`Are you sure to delete "${record.name}"?`}
                            onConfirm={() => handleDelete(record.id)}
                            okText="Yes"
                            cancelText="No"
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
        <div className="brand-page">
            <Breadcrumb
                items={[
                    { title: "Dashboard" },
                    { title: "Product" },
                    { title: "Brand" },
                ]}
                style={{ marginBottom: 16 }}
            />

            <Card
                title={
                    <Flex justify="space-between" align="center" wrap="wrap" gap="small">
                        <Title level={3} style={{ margin: 0 }}>
                            Brand List
                        </Title>
                        <Space>
                            {hasPermission('brand_delete') && (
                                <Button danger icon={<DeleteOutlined />} onClick={() => navigate('/brand/trash')}>
                                    Trash
                                </Button>
                            )}
                            
                            {hasPermission('brand_create') && (
                                <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/create/brand', {
                                        state: { fromPage: 'Brand List', fromAction: 'Click "Add Brand" Button' }
                                    })}>
                                    Add Brand
                                </Button>
                            )}
                        </Space>
                    </Flex>
                }
            >
                {/* Search & Actions Toolbar */}
                <Flex justify="space-between" align="center" style={{ marginBottom: 16 }} wrap="wrap" gap="small">
                    <Space wrap gap="small">
                        <Input.Search
                            placeholder="Search brand name..."
                            allowClear
                            enterButton={<SearchOutlined />}
                            style={{ width: 300 }}
                            value={searchKey}
                            onChange={(e) => {
                                setSearchKey(e.target.value);
                                if (!e.target.value) {
                                    handleReset();
                                }
                            }}
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

                {/* Brands Table */}
                <Table
                    columns={columns}
                    dataSource={brands}
                    rowKey="id"
                    loading={loading}
                    rowClassName={(record) => String(record.id) === String(highlightedRowId) ? "brand-highlighted-row" : ""}
                    onRow={(record) => ({
                        id: `brand-row-${record.id}`,
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
