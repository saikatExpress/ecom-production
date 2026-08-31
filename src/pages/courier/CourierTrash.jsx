import { ArrowLeftOutlined, ClearOutlined, DeleteOutlined, PictureOutlined, ReloadOutlined, SearchOutlined, UndoOutlined } from '@ant-design/icons';
import { Avatar, Breadcrumb, Button, Card, Flex, Image, Input, Modal, Space, Table, Tag, Typography, message } from "antd";
import dayjs from 'dayjs';
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useTitle from "../../hooks/useTitle";
import { deleteData, getDatas, patchData } from "../../services/request";

const { Title, Text } = Typography;

const CourierTrash = () => {
    // Hook
    useTitle("Courier Trash List");

    // Variable
    const navigate = useNavigate();

    // States
    const [couriers, setCouriers]     = useState([]);
    const [loading, setLoading]       = useState(false);
    const [searchKey, setSearchKey]   = useState("");
    const [pagination, setPagination] = useState({current: 1,pageSize: 25,total: 0,});

    const fetchCouriers = async (page = 1, pageSize = 25) => {
        setLoading(true);
        try {
            const params = {
                page: page,
                paginate_size: pageSize,
            };

            if (searchKey) params.search_key = searchKey;

            const response = await getDatas("/admin/courier/trash", params);

            if (response?.success && response?.data) {
                setCouriers(response.data.items || []);
                setPagination({
                    current: response.data.pagination?.current_page || page,
                    pageSize: response.data.pagination?.per_page || pageSize,
                    total: response.data.pagination?.total || 0,
                });
            }
        } catch (error) {
            console.error("Failed to fetch couriers:", error);
            message.error(error?.response?.data?.message || "Failed to fetch trash data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCouriers(pagination.current, pagination.pageSize);
    }, [pagination.current, pagination.pageSize, searchKey]);

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
        setPagination((prev) => ({ ...prev, current: 1 }));
    };

    const handleRefresh = () => {
        fetchCouriers(pagination.current, pagination.pageSize);
    };

    const handleRestore = (id) => {
        Modal.confirm({
            title: 'Are you sure you want to restore this courier?',
            content: 'This courier will be moved back to the active list.',
            okText: 'Yes, Restore',
            cancelText: 'No',
            onOk: async () => {
                try {
                    const res = await patchData(`/admin/courier/${id}/restore`);
                    if (res?.success) {
                        message.success(res?.message || 'Restored successfully');
                        setCouriers(prev => prev.filter(item => item.id !== id));
                        setPagination(prev => ({ ...prev, total: Math.max(0, prev.total - 1) }));
                    } else {
                        message.error(res?.message || 'Failed to restore courier');
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
            title: 'Are you sure you want to permanently delete this courier?',
            content: 'This action cannot be undone. All data will be lost forever.',
            okText: 'Yes, Delete Permanently',
            okType: 'danger',
            cancelText: 'No',
            onOk: async () => {
                try {
                    const res = await deleteData(`/admin/courier/permanent-delete/${id}`);
                    if (res?.success) {
                        message.success(res?.message || 'Deleted permanently');
                        setCouriers(prev => prev.filter(item => item.id !== id));
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
                    <Image src={image} alt={record.name} width={40} height={40} style={{ objectFit: "contain", borderRadius: 4 }} fallback="https://via.placeholder.com/40" />
                ) : (
                    <Avatar shape="square" icon={<PictureOutlined />} size={40} />
                ),
        },
        {
            title: "Name",
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
            title: "Default",
            dataIndex: "is_default",
            key: "is_default",
            render: (isDefault) => (
                isDefault ? <Tag color="blue">Default</Tag> : <Tag>No</Tag>
            )
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
        <div className="courier-trash-page">
            <Breadcrumb
                items={[
                    { title: "Dashboard" },
                    { title: "Couriers" },
                    { title: "Trash" },
                ]}
                style={{ marginBottom: 16 }}
            />

            <Card
                title={
                    <Flex justify="space-between" align="center" wrap="wrap" gap="small">
                        <Title level={3} style={{ margin: 0 }}>
                            Courier Trash List
                        </Title>
                        <Space>
                            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
                                Back to Couriers
                            </Button>
                        </Space>
                    </Flex>
                }
            >
                {/* Search & Actions Toolbar */}
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

                        {/* Reset Filters */}
                        {searchKey && (
                            <Button icon={<ClearOutlined />} onClick={handleResetFilters}>
                                Reset
                            </Button>
                        )}
                    </Space>

                    <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading}>
                        Refresh
                    </Button>
                </Flex>

                {/* Couriers Table */}
                <Table
                    columns={columns}
                    dataSource={couriers}
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
};

export default CourierTrash;