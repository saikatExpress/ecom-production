import { DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import { Breadcrumb, Button, Card, Flex, Input, Popconfirm, Space, Table, Tag, Typography, message } from "antd";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import usePermissions from "../../../hooks/usePermissions";
import useTitle from "../../../hooks/useTitle";
import { deleteData, getDatas } from "../../../services/request";

const { Title, Text } = Typography;

export default function BlogCategory() {
    // Hook
    useTitle("Blog Category List");

    // Variable
    const navigate        = useNavigate();
    const {hasPermission} = usePermissions();

    // States
    const [categories, setCategories] = useState([]);
    const [loading, setLoading]       = useState(false);
    const [searchKey, setSearchKey]   = useState("");
    const [pagination, setPagination] = useState({current: 1, pageSize: 25, total: 0});

    const fetchCategories = useCallback(async (page = 1, pageSize = 25, search = "") => {
        setLoading(true);
        try {
            const response = await getDatas("/admin/blog-category", {
                page: page,
                paginate_size: pageSize,
                search_key: search
            });

            if (response?.success && response?.data) {
                const fetchedItems = Array.isArray(response.data) ? response.data : (response.data.items || []);

                setCategories(fetchedItems);
                
                const paginationData = response.data.pagination;
                if (paginationData) {
                    setPagination({
                        current : paginationData.current_page || page,
                        pageSize: paginationData.per_page || pageSize,
                        total   : paginationData.total || fetchedItems.length,
                    });
                } else {
                    setPagination({
                        current : page,
                        pageSize: pageSize,
                        total   : fetchedItems.length,
                    });
                }
            } else {
                setCategories([]);
            }
        } catch (error) {
            console.error("Failed to fetch blog categories:", error);
            message.error(error?.response?.data?.message || "Failed to fetch blog category data.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCategories(pagination.current, pagination.pageSize, searchKey);
    }, [fetchCategories, pagination.current, pagination.pageSize, searchKey]);

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

    const handleRefresh = () => {
        fetchCategories(pagination.current, pagination.pageSize, searchKey);
    };

    const handleDelete = async (id) => {
        try {
            const res = await deleteData(`/admin/blog-category/${id}`);
            if (res?.success !== false) {
                message.success(res?.message || "Category deleted successfully");
                setCategories(prev => prev.filter(item => item.id !== id));
                setPagination(prev => ({
                    ...prev,
                    total: Math.max(0, prev.total - 1)
                }));
            } else {
                message.error(res?.message || "Failed to delete category");
            }
        } catch (error) {
            console.error(error);
            message.error(error?.response?.data?.message || "An error occurred");
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
            title: "Category Name",
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
            title: "Description",
            dataIndex: "description",
            key: "description",
            render: (text) => <Text>{text && text.length > 50 ? text.substring(0, 50) + "..." : text}</Text>,
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
            title: "Action",
            key: "action",
            width: 150,
            render: (_, record) => (
                <Space size="small">
                    {hasPermission('blog_category_update') && (
                        <Button type="link" size="small" icon={<EditOutlined />} onClick={() => navigate(`/edit/blog-category/${record.id}`)}>
                            Edit
                        </Button>
                    )}

                    {hasPermission('blog_category_delete') && (
                        <Popconfirm title="Delete Category" description={`Are you sure to delete "${record.name}"?`} okText="Yes" cancelText="No" onConfirm={() => handleDelete(record.id)}>
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
        <div className="blog-category-page">
            <Breadcrumb
                items={[
                    { title: "Dashboard" },
                    { title: "Blog" },
                    { title: "Blog Category" },
                ]}
                style={{ marginBottom: 16 }}
            />

            <Card
                title={
                    <Flex justify="space-between" align="center" wrap="wrap" gap="small">
                        <Title level={3} style={{ margin: 0 }}>
                            Blog Category List
                        </Title>
                        {hasPermission('blog_category_create') && (
                            <Space>
                                <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/create/blog-category')}>
                                    Add Category
                                </Button>
                            </Space>
                        )}
                    </Flex>
                }
            >
                <Flex justify="space-between" align="center" style={{ marginBottom: 16 }} wrap="wrap" gap="small">
                    <Input.Search
                        placeholder="Search category..."
                        allowClear
                        enterButton={<SearchOutlined />}
                        style={{ maxWidth: 320 }}
                        onSearch={handleSearch}
                    />
                    <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading}>
                        Refresh
                    </Button>
                </Flex>

                <Table
                    columns={columns}
                    dataSource={categories}
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