import { ArrowLeftOutlined, DeleteOutlined, PictureOutlined, ReloadOutlined, SearchOutlined, UndoOutlined } from '@ant-design/icons';
import { Avatar, Breadcrumb, Button, Card, Flex, Image, Input, Modal, Select, Space, Table, Tag, Typography, message } from "antd";
import dayjs from 'dayjs';
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useTitle from "../../hooks/useTitle";
import { deleteData, getDatas, patchData } from "../../services/request";

const { Title, Text } = Typography;

export default function BlogTrash() {
    // Hook
    useTitle("Blog Trash List");

    // Variable
    const navigate = useNavigate();

    // States
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchKey, setSearchKey] = useState("");
    const [pagination, setPagination] = useState({ current: 1, pageSize: 25, total: 0 });

    // Filter States
    const [categoriesList, setCategoriesList] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);

    // Fetch category filter on mount
    useEffect(() => {
        const fetchFilters = async () => {
            try {
                const catRes = await getDatas("/admin/blog-category/list");
                if (catRes?.success) setCategoriesList(catRes.data);
            } catch (error) {
                console.error("Failed to load filters", error);
            }
        };
        fetchFilters();
    }, []);

    const fetchBlogs = useCallback(async (page = 1, pageSize = 25, search = "", catIds = []) => {
        setLoading(true);
        try {
            const response = await getDatas("/admin/blog/trash", {
                page: page,
                paginate_size: pageSize,
                search_key: search,
                category_ids: catIds,
            });

            if (response?.success && response?.data) {
                const fetchedItems = response.data.items || [];
                setBlogs(fetchedItems);
                
                const paginationData = response.data.pagination;
                if (paginationData) {
                    setPagination({
                        current: paginationData.current_page || page,
                        pageSize: paginationData.per_page || pageSize,
                        total: paginationData.total || fetchedItems.length,
                    });
                } else {
                    setPagination({
                        current: page,
                        pageSize: pageSize,
                        total: fetchedItems.length,
                    });
                }
            } else {
                setBlogs([]);
            }
        } catch (error) {
            console.error("Failed to fetch blog trash:", error);
            message.error(error?.response?.data?.message || "Failed to fetch trash data.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBlogs(pagination.current, pagination.pageSize, searchKey, selectedCategories);
    }, [fetchBlogs, pagination.current, pagination.pageSize, searchKey, selectedCategories]);

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

    const handleRefresh = () => {
        fetchBlogs(pagination.current, pagination.pageSize, searchKey, selectedCategories);
    };

    const handleRestore = (id) => {
        Modal.confirm({
            title: 'Are you sure you want to restore this blog?',
            content: 'This blog will be moved back to the active blog list.',
            okText: 'Yes, Restore',
            cancelText: 'No',
            onOk: async () => {
                try {
                    const res = await patchData(`/admin/blog/${id}/restore`);
                    if (res?.success) {
                        message.success(res?.message || 'Restored successfully');
                        setBlogs(prev => prev.filter(item => item.id !== id));
                        setPagination(prev => ({ ...prev, total: Math.max(0, prev.total - 1) }));
                    } else {
                        message.error(res?.message || 'Failed to restore blog');
                    }
                } catch (error) {
                    console.error(error);
                    message.error(error?.response?.data?.message || 'An error occurred while restoring');
                }
            }
        });
    };

    const handlePermanentDelete = (id) => {
        Modal.confirm({
            title: 'Are you sure you want to permanently delete this blog?',
            content: 'This action cannot be undone. All data will be lost forever.',
            okText: 'Yes, Delete Permanently',
            okType: 'danger',
            cancelText: 'No',
            onOk: async () => {
                try {
                    const res = await deleteData(`/admin/blog/permanent-delete/${id}`);
                    if (res?.success) {
                        message.success(res?.message || 'Deleted permanently');
                        setBlogs(prev => prev.filter(item => item.id !== id));
                        setPagination(prev => ({ ...prev, total: Math.max(0, prev.total - 1) }));
                    } else {
                        message.error(res?.message || 'Failed to delete permanently');
                    }
                } catch (error) {
                    console.error(error);
                    message.error(error?.response?.data?.message || 'An error occurred while deleting permanently');
                }
            }
        });
    };

    const columns = [
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
            width: 80,
            render: (image, record) =>
                image ? (
                    <Image src={image} alt={record.title} width={40} height={40} style={{ objectFit: "cover", borderRadius: 4 }}/>
                ) : (
                    <Avatar shape="square" icon={<PictureOutlined />} size={40} />
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
            title: 'Deleted By',
            key: 'deleted_by',
            render: (_, record) => record?.deleted_by?.username || 'N/A',
        },
        {
            title: 'Deleted At',
            dataIndex: 'deleted_at',
            key: 'deleted_at',
            render: (value) => value ? dayjs(value).format('DD MMM YYYY, hh:mm A') : 'N/A',
        },
        {
            title: "Action",
            key: "action",
            width: 280,
            render: (_, record) => (
                <Space size="middle">
                    <Button type="primary" icon={<UndoOutlined />} size="small" onClick={() => handleRestore(record.id)}>
                        Restore
                    </Button>
                    <Button danger icon={<DeleteOutlined />} size="small" onClick={() => handlePermanentDelete(record.id)}>
                        Permanent Delete
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <div className="blog-trash-page">
            <Breadcrumb
                items={[
                    { title: "Dashboard" },
                    { title: "Blog" },
                    { title: "All Blogs" },
                    { title: "Trash" },
                ]}
                style={{ marginBottom: 16 }}
            />

            <Card
                title={
                    <Flex justify="space-between" align="center" wrap="wrap" gap="small">
                        <Title level={3} style={{ margin: 0 }}>
                            Blog Trash List
                        </Title>
                        <Space>
                            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/blog')}>
                                Back to Blog List
                            </Button>
                        </Space>
                    </Flex>
                }
            >
                <Flex justify="space-between" align="center" style={{ marginBottom: 16 }} wrap="wrap" gap="small">
                    <Space wrap>
                        <Input.Search
                            placeholder="Search trash..."
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
                    scroll={{ x: 'max-content' }}
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