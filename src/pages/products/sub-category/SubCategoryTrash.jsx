import { ArrowLeftOutlined, ClearOutlined, DeleteOutlined, PictureOutlined, ReloadOutlined, SearchOutlined, UndoOutlined } from '@ant-design/icons';
import { Avatar, Breadcrumb, Button, Card, Flex, Image, Input, Modal, Select, Space, Table, Tag, Typography, message } from "antd";
import dayjs from 'dayjs';
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useTitle from "../../../hooks/useTitle";
import { deleteData, getDatas, patchData } from "../../../services/request";

const { Title, Text } = Typography;

export default function SubCategoryTrash() {
    // Hook
    useTitle("Sub Category Trash List");

    // Variable
    const navigate = useNavigate();

    // States
    const [subCategories, setSubCategories] = useState([]);
    const [categories, setCategories]       = useState([]);
    const [loading, setLoading]             = useState(false);
    const [searchKey, setSearchKey]         = useState("");
    const [categoryId, setCategoryId]       = useState(undefined);
    const [pagination, setPagination]       = useState({current: 1,pageSize: 25,total: 0,});

    const fetchSubCategories = async (page = 1, pageSize = 25) => {
        setLoading(true);
        try {
            const params = {page: page,paginate_size: pageSize};

            if (searchKey) params.search_key = searchKey;
            if (categoryId) params.category_id = categoryId;

            const response = await getDatas("/admin/subcategory/trash", params);

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
            message.error(error?.response?.data?.message || "Failed to fetch trash data.");
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

    const handleRestore = (id) => {
        Modal.confirm({
            title: 'Are you sure you want to restore this sub category?',
            content: 'This sub category will be moved back to the active sub category list.',
            okText: 'Yes, Restore',
            cancelText: 'No',
            onOk: async () => {
                try {
                    const res = await patchData(`/admin/subcategory/${id}/restore`);
                    if (res?.success) {
                        message.success(res?.message || 'Restored successfully');
                        setSubCategories(prev => prev.filter(item => item.id !== id));
                        setPagination(prev => ({ ...prev, total: Math.max(0, prev.total - 1) }));
                    } else {
                        message.error(res?.message || 'Failed to restore sub category');
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
            title: 'Are you sure you want to permanently delete this sub category?',
            content: 'This action cannot be undone. All data will be lost forever.',
            okText: 'Yes, Delete Permanently',
            okType: 'danger',
            cancelText: 'No',
            onOk: async () => {
                try {
                    const res = await deleteData(`/admin/subcategory/permanent-delete/${id}`);
                    if (res?.success) {
                        message.success(res?.message || 'Deleted permanently');
                        setSubCategories(prev => prev.filter(item => item.id !== id));
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
            title: 'Deleted By',
            key: 'deleted_by',
            render: (_, record) => record?.deleted_by?.username || 'N/A',
        },
        {
            title: 'Deleted At',
            dataIndex: 'deleted_at',
            key: 'deleted_at',
            render: (value) => value ? dayjs(value).format('DD MMMM, YY, hh:mm A') : 'N/A',
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
        <div className="sub-category-trash-page">
            <Breadcrumb
                items={[
                    { title: "Dashboard" },
                    { title: "Product" },
                    { title: "Sub Category" },
                    { title: "Trash" },
                ]}
                style={{ marginBottom: 16 }}
            />

            <Card
                title={
                    <Flex justify="space-between" align="center" wrap="wrap" gap="small">
                        <Title level={3} style={{ margin: 0 }}>
                            Sub Category Trash List
                        </Title>
                        <Space>
                            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
                                Back to Sub Category List
                            </Button>
                        </Space>
                    </Flex>
                }
            >
                <Flex justify="space-between" align="center" style={{ marginBottom: 16 }} wrap="wrap" gap="small">
                    <Space wrap gap="small">
                        <Input.Search
                            placeholder="Search trash..."
                            allowClear
                            enterButton={<SearchOutlined />}
                            style={{ width: 280 }}
                            value={searchKey}
                            onChange={(e) => setSearchKey(e.target.value)}
                            onSearch={handleSearchSubmit}
                        />

                        <Select
                            placeholder="Filter by Category"
                            allowClear
                            style={{ width: 200 }}
                            value={categoryId}
                            onChange={(val) => {setCategoryId(val);setPagination((prev) => ({ ...prev, current: 1 }));}}
                            options={categories.map((cat) => ({label: cat.name,value: cat.id}))}
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

                <Table
                    columns={columns}
                    dataSource={subCategories}
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