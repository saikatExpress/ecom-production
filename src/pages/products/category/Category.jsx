import { DeleteOutlined, EditOutlined, PictureOutlined, PlusOutlined, ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import { Avatar, Breadcrumb, Button, Card, Flex, Image, Input, Popconfirm, Space, Table, Tag, Typography, message } from "antd";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useTitle from "../../../hooks/useTitle";
import { getDatas } from "../../../services/request";

const { Title, Text } = Typography;

export default function Category() {
    // Hook
    useTitle("Category List");

    // Variable
    const navigate = useNavigate();

    // States
    const [categories, setCategories] = useState([]);
    const [loading, setLoading]       = useState(false);
    const [searchKey, setSearchKey]   = useState("");
    const [pagination, setPagination] = useState({current: 1,pageSize: 25,total: 0,});

    const fetchCategories = useCallback(async (page = 1, pageSize = 25, search = "") => {
        setLoading(true);
        try {
            const response = await getDatas("/admin/category", {
                page: page,
                paginate_size: pageSize,
                search_key: search,
            });

            if (response?.success && response?.data) {
                setCategories(response.data.items || []);
                setPagination({
                    current: response.data.pagination?.current_page || page,
                    pageSize: response.data.pagination?.per_page || pageSize,
                    total: response.data.pagination?.total || 0,
                });
            } else if (response?.data?.items) {
                setCategories(response.data.items || []);
                setPagination({
                    current: response.data.pagination?.current_page || page,
                    pageSize: response.data.pagination?.per_page || pageSize,
                    total: response.data.pagination?.total || 0,
                });
            }
        } catch (error) {
            console.error("Failed to fetch categories:", error);
            message.error(error?.response?.data?.message || "Failed to fetch category data.");
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

    const columns = 
    [
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
            title : "Position",
            dataIndex: "position",
            key: "position"
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
                    <Button type="link" size="small" icon={<EditOutlined />} onClick={() => navigate(`/edit/category/${record.id}`)}>
                        Edit
                    </Button>
                    <Popconfirm title="Delete Category" description={`Are you sure to delete "${record.name}"?`} okText="Yes" cancelText="No">
                        <Button type="link" danger size="small" icon={<DeleteOutlined />}>
                            Delete
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div className="category-page">
            <Breadcrumb
                items={[
                    { title: "Dashboard" },
                    { title: "Product" },
                    { title: "Category" },
                ]}
                style={{ marginBottom: 16 }}
            />

            <Card
                title={
                    <Flex justify="space-between" align="center" wrap="wrap" gap="small">
                        <Title level={3} style={{ margin: 0 }}>
                            Category List
                        </Title>
                        <Space>
                            <Button danger icon={<DeleteOutlined />}>
                                Trash
                            </Button>
                            <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/create/category')}>
                                Add Category
                            </Button>
                        </Space>
                    </Flex>
                }
            >
                {/* Search & Actions Toolbar */}
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

                {/* Categories Table */}
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
