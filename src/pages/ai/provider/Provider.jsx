import { ArrowLeftOutlined, DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import { Breadcrumb, Button, Card, Flex, Input, Space, Table, Tag, Typography, message } from "antd";
import { useEffect, useState } from "react";
import usePermissions from "../../../hooks/usePermissions";
import useTitle from "../../../hooks/useTitle";
import { getDatas } from "../../../services/request";

const { Title, Text } = Typography;
const { Search } = Input;

const Provider = () => {
    // Hook
    useTitle("Provider List");

    // Variable
    const {hasPermission} = usePermissions();

    // States
    const [providers, setProviders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({ search_key: "" });
    const [tableParams, setTableParams] = useState({
        pagination: {
            current: 1,
            pageSize: 25,
            total: 0
        },
    });

    const fetchProviders = async (page = 1, pageSize = 25, searchKey = filters.search_key) => {
        setLoading(true);
        try {
            const params = {
                page: page,
                paginate_size: pageSize,
            };
            if (searchKey) {
                params.search_key = searchKey;
            }
            const res = await getDatas("/admin/provider", params);
            if (res?.success && res?.data) {
                setProviders(res.data.items || res.data || []);
                if (res.data.pagination) {
                    setTableParams({
                        pagination: {
                            current: res.data.pagination.current_page,
                            pageSize: res.data.pagination.per_page,
                            total: res.data.pagination.total,
                        }
                    });
                }
            } else {
                setProviders([]);
            }
        } catch (error) {
            console.error("Failed to fetch providers", error);
            message.error("Failed to load providers");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProviders(tableParams.pagination.current, tableParams.pagination.pageSize);
    }, []);

    const handleTableChange = (pagination) => {
        fetchProviders(pagination.current, pagination.pageSize);
    };

    const handleRefresh = () => {
        fetchProviders(tableParams.pagination.current, tableParams.pagination.pageSize);
    };

    const columns = 
    [
        {
            title: 'SL',
            key: 'sl',
            width: 60,
            align: 'center',
            render: (_, __, index) => (tableParams.pagination.current - 1) * tableParams.pagination.pageSize + index + 1,
        },
        {
            title: 'Provider Name',
            dataIndex: 'name',
            key: 'name',
            render: (text) => <Text strong>{text}</Text>
        },
        {
            title: 'Slug',
            dataIndex: 'slug',
            key: 'slug',
            render: (slug) => <Text type="secondary">{slug}</Text>
        },
        {
            title: 'Default',
            dataIndex: 'is_default',
            key: 'is_default',
            align: 'center',
            render: (is_default) => (
                is_default === 1 
                ? <Tag color="blue">Default</Tag> 
                : <Tag color="default">No</Tag>
            )
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            align: 'center',
            render: (status) => (
                <Tag color={status === 'active' ? 'success' : 'error'} style={{ textTransform: 'capitalize' }}>
                    {status}
                </Tag>
            )
        },
        {
            title: 'Action',
            key: 'action',
            align: 'center',
            render: (_, record) => (
                <Space>
                    {hasPermission('ai_update') && (
                        <Button type="link" size="small" icon={<EditOutlined />}>
                            Edit
                        </Button>
                    )}

                    {hasPermission('ai_delete') && (
                        <Button type="link" danger size="small" icon={<DeleteOutlined />}>
                            Delete
                        </Button>
                    )}
                </Space>
            )
        }
    ];

    return (
        <div className="provider-page" style={{ padding: '0 0 24px 0' }}>

            <Breadcrumb
                items={[
                    { title: "Dashboard" },
                    { title: "AI Setup" },
                    { title: "Providers" },
                ]}
                style={{ marginBottom: 16 }}
            />

            <Card 
                title={
                    <Flex justify="space-between" align="center" wrap="wrap" gap="small">
                        <Title level={4} style={{ margin: 0 }}>AI Provider List</Title>
                        <Space>
                            <Search 
                                placeholder="Search by name..." 
                                allowClear 
                                onSearch={(value) => {
                                    setFilters({ search_key: value });
                                    fetchProviders(1, tableParams.pagination.pageSize, value);
                                }}
                                style={{ width: 250 }}
                            />
                            <Button icon={<ArrowLeftOutlined />} onClick={() => window.history.back()}>
                                Back
                            </Button>
                            <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading}>
                                Refresh
                            </Button>
                            {hasPermission('ai_create') && (
                                <Button type="primary" icon={<PlusOutlined />}>
                                    Create Provider
                                </Button>
                            )}
                        </Space>
                    </Flex>
                }
                bordered={false}
                style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
            >
                <Table 
                    columns={columns} 
                    dataSource={providers} 
                    rowKey="id" 
                    loading={loading}
                    onChange={handleTableChange}
                    bordered
                    pagination={{
                        ...tableParams.pagination,
                        showSizeChanger: true,
                        pageSizeOptions: ['25', '50', '100'],
                        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} providers`,
                    }}
                />
            </Card>
        </div>
    );
};

export default Provider;