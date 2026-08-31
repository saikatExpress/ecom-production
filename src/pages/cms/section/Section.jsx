import { DeleteOutlined, EditOutlined, PictureOutlined, PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { Avatar, Breadcrumb, Button, Card, Flex, Image, Input, Popconfirm, Space, Table, Tag, Typography, message } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import usePermissions from '../../../hooks/usePermissions';
import useTitle from '../../../hooks/useTitle';
import { deleteData, getDatas } from '../../../services/request';

const { Title, Text } = Typography;

const Section = () => {
    // Hook
    useTitle("Section List");

    // Variable
    const navigate        = useNavigate();
    const {hasPermission} = usePermissions();

    // States
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchKey, setSearchKey] = useState("");
    const [pagination, setPagination] = useState({current: 1, pageSize: 25, total: 0});

    const fetchSections = useCallback(async (page = 1, pageSize = 25, search = "") => {
        setLoading(true);
        try {
            const response = await getDatas("/admin/section", {page: page, paginate_size: pageSize, search_key: search});

            if (response?.success && response?.data) {
                const fetchedItems = response.data.items || [];
                setSections(fetchedItems);
                setPagination({
                    current: response.data.pagination?.current_page || page,
                    pageSize: response.data.pagination?.per_page || pageSize,
                    total: response.data.pagination?.total || 0,
                });
            } else if (response?.data?.items) {
                const fetchedItems = response.data.items || [];
                setSections(fetchedItems);
                setPagination({
                    current: response.data.pagination?.current_page || page,
                    pageSize: response.data.pagination?.per_page || pageSize,
                    total: response.data.pagination?.total || 0,
                });
            }
        } catch (error) {
            console.error("Failed to fetch sections:", error);
            message.error(error?.response?.data?.message || "Failed to fetch section data.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSections(pagination.current, pagination.pageSize, searchKey);
    }, [fetchSections, pagination.current, pagination.pageSize, searchKey]);

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
        fetchSections(pagination.current, pagination.pageSize, searchKey);
    };

    const handleDelete = async (id) => {
        try {
            const res = await deleteData(`/admin/section/${id}`);
            if (res?.success) {
                message.success(res?.message || "Section deleted successfully");
                fetchSections(pagination.current, pagination.pageSize, searchKey);
            } else {
                message.error(res?.message || "Failed to delete section");
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
            title: "Section Name",
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
            title: "Is Slider",
            dataIndex: "is_slider",
            key: "is_slider",
            render: (is_slider) => (
                <Tag color={is_slider === 1 ? "purple" : "default"}>
                    {is_slider === 1 ? "Yes" : "No"}
                </Tag>
            ),
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
            title: "Products",
            dataIndex: "products",
            key: "products",
            render: (products) => <Tag color="cyan">{products?.length || 0} Items</Tag>,
        },
        {
            title: "Created By",
            dataIndex: ["created_by", "username"],
            key: "created_by",
            render: (username) => username || "-",
        },
        {
            title: "Action",
            key: "action",
            width: 150,
            render: (_, record) => (
                <Space size="small">
                    {hasPermission('section_update') && (
                        <Button type="link" size="small" icon={<EditOutlined />} onClick={() => navigate(`/edit/section/${record.id}`)}>
                            Edit
                        </Button>
                    )}
                    {hasPermission('section_delete') && (
                        <Popconfirm title="Delete Section" description={`Are you sure to delete "${record.name}"?`} okText="Yes" cancelText="No" onConfirm={() => handleDelete(record.id)}>
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
        <div className="section-page">
            <Breadcrumb
                items={[
                    { title: "Dashboard" },
                    { title: "CMS" },
                    { title: "Section" },
                ]}
                style={{ marginBottom: 16 }}
            />

            <Card
                title={
                    <Flex justify="space-between" align="center" wrap="wrap" gap="small">
                        <Title level={3} style={{ margin: 0 }}>
                            Section List
                        </Title>
                        <Space>
                            {hasPermission('section_delete') && (
                                <Button danger icon={<DeleteOutlined />} onClick={() => navigate('/trash/section')}>
                                    Trash
                                </Button>
                            )}
                            {hasPermission('section_create') && (
                                <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/create/section')}>
                                    Add Section
                                </Button>
                            )}
                        </Space>
                    </Flex>
                }
            >
                <Flex justify="space-between" align="center" style={{ marginBottom: 16 }} wrap="wrap" gap="small">
                    <Input.Search
                        placeholder="Search section..."
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
                    dataSource={sections}
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
                    scroll={{ x: 'max-content' }}
                />
            </Card>
        </div>
    );
};

export default Section;