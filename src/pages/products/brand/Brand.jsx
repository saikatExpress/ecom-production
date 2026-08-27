import { ClearOutlined, DeleteOutlined, EditOutlined, PictureOutlined, PlusOutlined, ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import { Avatar, Breadcrumb, Button, Card, Flex, Image, Input, Popconfirm, Space, Table, Tag, Typography, message } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import useTitle from "../../../hooks/useTitle";
import { deleteData, getDatas } from "../../../services/request";

const { Title, Text } = Typography;

export default function Brand() {
    // Hook
    useTitle("Brand List");

    // Variable
    const navigate = useNavigate();

    // States
    const [brands, setBrands]         = useState([]);
    const [loading, setLoading]       = useState(false);
    const [searchKey, setSearchKey]   = useState("");
    const [pagination, setPagination] = useState({current: 1,pageSize: 25,total: 0,});

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
    };

    const handleReset = () => {
        setSearchKey("");
        setPagination((prev) => ({ ...prev, current: 1 }));
    };

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
                    <Button type="link" size="small" icon={<EditOutlined />} onClick={() => navigate(`/edit/brand/${record.id}`)}>
                        Edit
                    </Button>
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
                            <Button danger icon={<DeleteOutlined />} onClick={() => navigate('/brand/trash')}>
                                Trash
                            </Button>
                            <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/create/brand')}>
                                Add Brand
                            </Button>
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
                            onChange={(e) => setSearchKey(e.target.value)}
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
