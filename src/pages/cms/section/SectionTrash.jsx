import { ArrowLeftOutlined, DeleteOutlined, PictureOutlined, ReloadOutlined, SearchOutlined, UndoOutlined } from '@ant-design/icons';
import { Avatar, Breadcrumb, Button, Card, Flex, Image, Input, Modal, Space, Table, Tag, Typography, message } from "antd";
import dayjs from 'dayjs';
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import usePermissions from '../../../hooks/usePermissions';
import useTitle from "../../../hooks/useTitle";
import { deleteData, getDatas, patchData } from "../../../services/request";

const { Title, Text } = Typography;

export default function SectionTrash() {
    // Hook
    useTitle("Section Trash List");

    // Variable
    const navigate        = useNavigate();
    const {hasPermission} = usePermissions();

    // States
    const [sections, setSections]     = useState([]);
    const [loading, setLoading]       = useState(false);
    const [searchKey, setSearchKey]   = useState("");
    const [pagination, setPagination] = useState({current: 1, pageSize: 25, total: 0});

    const fetchSections = useCallback(async (page = 1, pageSize = 25, search = "") => {
        setLoading(true);
        try {
            const response = await getDatas("/admin/section/trash", {page: page, paginate_size: pageSize, search_key: search});

            if (response?.success && response?.data) {
                setSections(response.data.items || []);
                setPagination({
                    current: response.data.pagination?.current_page || page,
                    pageSize: response.data.pagination?.per_page || pageSize,
                    total: response.data.pagination?.total || 0,
                });
            } else if (response?.data?.items) {
                setSections(response.data.items || []);
                setPagination({
                    current: response.data.pagination?.current_page || page,
                    pageSize: response.data.pagination?.per_page || pageSize,
                    total: response.data.pagination?.total || 0,
                });
            }
        } catch (error) {
            console.error("Failed to fetch sections:", error);
            message.error(error?.response?.data?.message || "Failed to fetch trash data.");
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

    const handleRestore = (id) => {
        Modal.confirm({
            title: 'Are you sure you want to restore this section?',
            content: 'This section will be moved back to the active section list.',
            okText: 'Yes, Restore',
            cancelText: 'No',
            onOk: async () => {
                try {
                    const res = await patchData(`/admin/section/${id}/restore`);
                    if (res?.success) {
                        message.success(res?.message || 'Restored successfully');
                        setSections(prev => prev.filter(item => item.id !== id));
                        setPagination(prev => ({ ...prev, total: Math.max(0, prev.total - 1) }));
                    } else {
                        message.error(res?.message || 'Failed to restore section');
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
            title: 'Are you sure you want to permanently delete this section?',
            content: 'This action cannot be undone. All data will be lost forever.',
            okText: 'Yes, Delete Permanently',
            okType: 'danger',
            cancelText: 'No',
            onOk: async () => {
                try {
                    const res = await deleteData(`/admin/section/permanent-delete/${id}`);
                    if (res?.success) {
                        message.success(res?.message || 'Deleted permanently');
                        setSections(prev => prev.filter(item => item.id !== id));
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
            render: (image) =>
                image ? (
                    <Image src={image} alt="Section" width={40} height={40} style={{ objectFit: "cover", borderRadius: 4 }}/>
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
                    {hasPermission('section_read') && (
                        <Button type="primary" icon={<UndoOutlined />} size="small" onClick={() => handleRestore(record.id)}>
                            Restore
                        </Button>
                    )}

                    {hasPermission('section_delete') && (
                        <Button danger icon={<DeleteOutlined />} size="small" onClick={() => handlePermanentDelete(record.id)}>
                            Permanent Delete
                        </Button>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <div className="section-trash-page">
            <Breadcrumb
                items={[
                    { title: "Dashboard" },
                    { title: "CMS" },
                    { title: "Section" },
                    { title: "Trash" },
                ]}
                style={{ marginBottom: 16 }}
            />

            <Card
                title={
                    <Flex justify="space-between" align="center" wrap="wrap" gap="small">
                        <Title level={3} style={{ margin: 0 }}>
                            Section Trash List
                        </Title>
                        <Space>
                            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/section')}>
                                Back to Section List
                            </Button>
                        </Space>
                    </Flex>
                }
            >
                <Flex justify="space-between" align="center" style={{ marginBottom: 16 }} wrap="wrap" gap="small">
                    <Input.Search placeholder="Search trash..." allowClear enterButton={<SearchOutlined />} style={{ maxWidth: 320 }} onSearch={handleSearch}/>

                    <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading}>
                        Refresh
                    </Button>
                </Flex>

                <Table
                    columns={columns}
                    dataSource={sections}
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