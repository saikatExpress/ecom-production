import { DeleteOutlined, EditOutlined, PictureOutlined, PlusOutlined, ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import { Avatar, Breadcrumb, Button, Card, Flex, Image, Input, Popconfirm, Select, Space, Table, Tag, Typography, message } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import usePermissions from "../../hooks/usePermissions";
import useTitle from "../../hooks/useTitle";
import { deleteData, getDatas } from "../../services/request";

const { Title, Text } = Typography;

export default function Blog() {
    // Hook
    useTitle("All Blogs");

    // Variable
    const navigate        = useNavigate();
    const {hasPermission} = usePermissions();

    // States
    const [blogs, setBlogs]           = useState([]);
    const [loading, setLoading]       = useState(false);
    const [searchKey, setSearchKey]   = useState("");
    const [pagination, setPagination] = useState({ current: 1, pageSize: 25, total: 0 });

    // Filter States
    const [categoriesList, setCategoriesList]         = useState([]);
    const [tagsList, setTagsList]                     = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedTags, setSelectedTags]             = useState([]);

    // Fetch filters on mount
    useEffect(() => {
        const fetchFilters = async () => {
            try {
                const catRes = await getDatas("/admin/blog-category/list");
                if (catRes?.success) setCategoriesList(catRes.data);
                
                const tagRes = await getDatas("/admin/tag/list");
                if (tagRes?.success) setTagsList(tagRes.data);
            } catch (error) {
                console.error("Failed to load filters", error);
            }
        };
        fetchFilters();
    }, []);

    const fetchBlogs = async (page = 1, pageSize = 25, search = "", catIds = [], tagIds = []) => {
        setLoading(true);
        try {
            const response = await getDatas("/admin/blog", {
                page         : page,
                paginate_size: pageSize,
                search_key   : search,
                category_ids : catIds,
                tag_ids      : tagIds
            });

            if (response?.success && response?.data) {
                const fetchedItems = response.data.items || [];
                setBlogs(fetchedItems);
                
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
                setBlogs([]);
            }
        } catch (error) {
            console.error("Failed to fetch blogs:", error);
            message.error(error?.response?.data?.message || "Failed to fetch blog data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBlogs(pagination.current, pagination.pageSize, searchKey, selectedCategories, selectedTags);
    }, [pagination.current, pagination.pageSize, searchKey, selectedCategories, selectedTags]);

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

    const handleCategoryChange = (value) => {
        setSelectedCategories(value);
        setPagination((prev) => ({ ...prev, current: 1 }));
    };

    const handleTagChange = (value) => {
        setSelectedTags(value);
        setPagination((prev) => ({ ...prev, current: 1 }));
    };

    const handleRefresh = () => {
        fetchBlogs(pagination.current, pagination.pageSize, searchKey, selectedCategories, selectedTags);
    };

    const handleDelete = async (id) => {
        try {
            const res = await deleteData(`/admin/blog/${id}`);
            if (res?.success !== false) {
                message.success(res?.message || "Blog deleted successfully");
                setBlogs(prev => prev.filter(item => item.id !== id));
                setPagination(prev => ({
                    ...prev,
                    total: Math.max(0, prev.total - 1)
                }));
            } else {
                message.error(res?.message || "Failed to delete blog");
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
            width: 60,
            render: (_, __, index) => (pagination.current - 1) * pagination.pageSize + index + 1,
        },
        {
            title: "Image",
            dataIndex: "image",
            key: "image",
            width: 80,
            render: (image, record) =>
                image ? (
                    <Image src={image} alt="Image" width={50} height={50} style={{ objectFit: "cover", borderRadius: 4 }}/>
                ) : (
                    <Avatar shape="square" icon={<PictureOutlined />} size={50} />
                ),
        },
        {
            title: "Title",
            dataIndex: "title",
            key: "title",
            render: (text) => (
                <Text strong style={{ maxWidth: 250, display: "inline-block", whiteSpace: "normal" }}>
                    {text && text.length > 50 ? text.substring(0, 50) + "..." : text}
                </Text>
            ),
        },
        {
            title: "Category",
            dataIndex: "category",
            key: "category",
            render: (category) => category?.name || "-",
        },
        {
            title: "Tags",
            dataIndex: "tags",
            key: "tags",
            render: (tags) => (
                <Space size={[0, 4]} wrap style={{ maxWidth: 150 }}>
                    {tags && tags.length > 0 
                        ? tags.slice(0, 3).map(tag => <Tag key={tag.id} color="blue">{tag.name}</Tag>) 
                        : "-"}
                    {tags && tags.length > 3 && <Tag>+{tags.length - 3}</Tag>}
                </Space>
            ),
        },
        {
            title: "Views",
            dataIndex: "views_count",
            key: "views",
            width: 80,
        },
        {
            title: "Author",
            dataIndex: "created_by",
            key: "author",
            render: (author) => author?.username || "-",
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
            width: 140,
            render: (_, record) => (
                <Space size="small">
                    {hasPermission('blog_update') && (
                        <Button type="link" size="small" icon={<EditOutlined />} onClick={() => navigate(`/edit/blog/${record.id}`)}>
                            Edit
                        </Button>
                    )}

                    {hasPermission('blog_delete') && (
                        <Popconfirm title="Delete Blog" description={`Are you sure to delete "${record.title.substring(0, 20)}..."?`} okText="Yes" cancelText="No" onConfirm={() => handleDelete(record.id)}>
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
        <div className="blog-list-page">
            <Breadcrumb
                items={[
                    { title: "Dashboard" },
                    { title: "Blog" },
                    { title: "All Blogs" },
                ]}
                style={{ marginBottom: 16 }}
            />

            <Card
                title={
                    <Flex justify="space-between" align="center" wrap="wrap" gap="small">
                        <Title level={3} style={{ margin: 0 }}>
                            Blog List
                        </Title>
                        {hasPermission('blog_create') && (
                            <Space>
                                <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/create/blog')}>
                                    Add Blog
                                </Button>
                            </Space>
                        )}
                    </Flex>
                }
            >
                <Flex justify="space-between" align="center" style={{ marginBottom: 16 }} wrap="wrap" gap="small">
                    <Space wrap>
                        <Input.Search
                            placeholder="Search blog..."
                            allowClear
                            enterButton={<SearchOutlined />}
                            style={{ width: 250 }}
                            onSearch={handleSearch}
                        />
                        <Select
                            mode="multiple"
                            allowClear
                            placeholder="Filter by Category"
                            style={{ minWidth: 200 }}
                            onChange={handleCategoryChange}
                            options={categoriesList.map(cat => ({ label: cat.name, value: cat.id }))}
                            maxTagCount="responsive"
                        />
                        <Select
                            mode="multiple"
                            allowClear
                            placeholder="Filter by Tag"
                            style={{ minWidth: 200 }}
                            onChange={handleTagChange}
                            options={tagsList.map(tag => ({ label: tag.name, value: tag.id }))}
                            maxTagCount="responsive"
                        />
                    </Space>
                    <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading}>
                        Refresh
                    </Button>
                </Flex>

                <Table
                    columns={columns}
                    dataSource={blogs}
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
                    scroll={{ x: 1000 }}
                />
            </Card>
        </div>
    );
}