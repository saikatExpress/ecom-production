import { DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import { Tag as AntTag, Breadcrumb, Button, Card, Col, Flex, Form, Input, Modal, Popconfirm, Row, Select, Space, Table, Typography, message } from "antd";
import { useCallback, useEffect, useState } from "react";
import usePermissions from "../../../hooks/usePermissions";
import useTitle from "../../../hooks/useTitle";
import { deleteData, getDatas, postData } from "../../../services/request";

const { Title, Text } = Typography;

export default function Tag() {
    // Hook
    useTitle("Blog Tag List");

    // Variable
    const {hasPermission} = usePermissions(); 

    // States
    const [tags, setTags]             = useState([]);
    const [loading, setLoading]       = useState(false);
    const [searchKey, setSearchKey]   = useState("");
    const [pagination, setPagination] = useState({ current: 1, pageSize: 25, total: 0 });

    // Modal & Form States
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [submitting, setSubmitting]         = useState(false);
    const [editingId, setEditingId]           = useState(null);
    const [form]                              = Form.useForm();

    const fetchTags = useCallback(async (page = 1, pageSize = 25, search = "") => {
        setLoading(true);
        try {
            const response = await getDatas("/admin/tag", {
                page: page,
                paginate_size: pageSize,
                search_key: search
            });

            if (response?.success && response?.data) {
                const fetchedItems = Array.isArray(response.data) ? response.data : (response.data.items || []);
                setTags(fetchedItems);
                
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
                setTags([]);
            }
        } catch (error) {
            console.error("Failed to fetch tags:", error);
            message.error(error?.response?.data?.message || "Failed to fetch tag data.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTags(pagination.current, pagination.pageSize, searchKey);
    }, [fetchTags, pagination.current, pagination.pageSize, searchKey]);

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
        fetchTags(pagination.current, pagination.pageSize, searchKey);
    };

    const handleDelete = async (id) => {
        try {
            const res = await deleteData(`/admin/tag/${id}`);
            if (res?.success !== false) {
                message.success(res?.message || "Tag deleted successfully");
                setTags(prev => prev.filter(item => item.id !== id));
                setPagination(prev => ({ ...prev, total: Math.max(0, prev.total - 1) }));
            } else {
                message.error(res?.message || "Failed to delete tag");
            }
        } catch (error) {
            console.error(error);
            message.error(error?.response?.data?.message || "An error occurred");
        }
    };

    // Modal Handlers
    const showAddModal = () => {
        setEditingId(null);
        form.resetFields();
        form.setFieldsValue({ status: "active" });
        setIsModalVisible(true);
    };

    const showEditModal = (record) => {
        setEditingId(record.id);
        form.setFieldsValue({
            name: record.name,
            status: record.status
        });
        setIsModalVisible(true);
    };

    const handleModalCancel = () => {
        setIsModalVisible(false);
        form.resetFields();
    };

    const handleModalSubmit = async (values) => {
        setSubmitting(true);
        try {
            let res;
            if (editingId) {
                const payload = { ...values, _method: 'PUT' };
                res = await postData(`/admin/tag/${editingId}`, payload);
            } else {
                res = await postData("/admin/tag", values);
            }

            if (res?.success !== false) {
                message.success(res?.message || `Tag ${editingId ? 'updated' : 'created'} successfully!`);
                setIsModalVisible(false);
                fetchTags(pagination.current, pagination.pageSize, searchKey);
            } else {
                message.error(res?.message || `Failed to ${editingId ? 'update' : 'create'} tag`);
            }
        } catch (error) {
            console.error(error);
            message.error(error?.response?.data?.message || "An error occurred");
        } finally {
            setSubmitting(false);
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
            title: "Tag Name",
            dataIndex: "name",
            key: "name",
            render: (text) => <Text strong>{text}</Text>,
        },
        {
            title: "Slug",
            dataIndex: "slug",
            key: "slug",
            render: (slug) => <AntTag color="blue">{slug}</AntTag>,
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (status) => {
                const isActive = status?.toLowerCase() === "active";
                return (
                    <AntTag color={isActive ? "success" : "error"} style={{ textTransform: "capitalize" }}>
                        {status || "inactive"}
                    </AntTag>
                );
            },
        },
        {
            title: "Action",
            key: "action",
            width: 150,
            render: (_, record) => (
                <Space size="small">
                    {hasPermission('tag_update') && (
                        <Button type="link" size="small" icon={<EditOutlined />} onClick={() => showEditModal(record)}>
                            Edit
                        </Button>
                    )}

                    {hasPermission('tag_delete') && (
                        <Popconfirm title="Delete Tag" description={`Are you sure to delete "${record.name}"?`} okText="Yes" cancelText="No" onConfirm={() => handleDelete(record.id)}>
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
        <div className="blog-tag-page">
            <Breadcrumb
                items={[
                    { title: "Dashboard" },
                    { title: "Blog" },
                    { title: "Tag" },
                ]}
                style={{ marginBottom: 16 }}
            />

            <Card
                title={
                    <Flex justify="space-between" align="center" wrap="wrap" gap="small">
                        <Title level={3} style={{ margin: 0 }}>
                            Tag List
                        </Title>
                        {hasPermission('tag_create') && (
                            <Space>
                                <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal}>
                                    Add Tag
                                </Button>
                            </Space>
                        )}
                    </Flex>
                }
            >
                <Flex justify="space-between" align="center" style={{ marginBottom: 16 }} wrap="wrap" gap="small">
                    <Input.Search
                        placeholder="Search tag..."
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
                    dataSource={tags}
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

            <Modal
                title={editingId ? "Edit Tag" : "Add New Tag"}
                open={isModalVisible}
                onCancel={handleModalCancel}
                footer={null}
                destroyOnClose
            >
                <Form form={form} layout="vertical" onFinish={handleModalSubmit}>
                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item name="name" label="Tag Name" rules={[{ required: true, message: 'Please enter tag name' }]}>
                                <Input placeholder="e.g. Smartphone" />
                            </Form.Item>
                        </Col>
                        
                        <Col span={24}>
                            <Form.Item name="status" label="Status" rules={[{ required: true, message: 'Please select status' }]}>
                                <Select>
                                    <Select.Option value="active">Active</Select.Option>
                                    <Select.Option value="inactive">Inactive</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item style={{ textAlign: "right", marginTop: 16, marginBottom: 0 }}>
                        <Space>
                            <Button onClick={handleModalCancel}>Cancel</Button>
                            <Button type="primary" htmlType="submit" loading={submitting}>
                                {editingId ? "Update" : "Save"}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}