import { ClearOutlined, DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import { Breadcrumb, Button, Card, Flex, Form, Input, Modal, Popconfirm, Space, Table, Tag, Tooltip, Typography, message } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import usePermissions from "../../../hooks/usePermissions";
import useTitle from "../../../hooks/useTitle";
import { deleteData, getDatas, postData, putData } from "../../../services/request";

const { Title, Text } = Typography;

export default function Attribute() {
    // Hook
    useTitle("Attribute List");

    // Variable
    const {hasPermission} = usePermissions();
    const navigate        = useNavigate();

    // States
    const [attributes, setAttributes] = useState([]);
    const [loading, setLoading]       = useState(false);
    const [searchKey, setSearchKey]   = useState("");
    const [pagination, setPagination] = useState({current: 1,pageSize: 25,total: 0});

    // Modal States
    const [isModalOpen, setIsModalOpen]           = useState(false);
    const [editingAttribute, setEditingAttribute] = useState(null);
    const [submitting, setSubmitting]             = useState(false);
    const [form]                                  = Form.useForm();

    const fetchAttributes = async (page = 1, pageSize = 25, search = "") => {
        setLoading(true);
        try {
            const res = await getDatas("admin/attribute", {
                page: page,
                paginate_size: pageSize,
                search_key: search,
            });

            if (res && res?.success) {
                setAttributes(res.data.items || []);
                setPagination({
                    current : res.data.pagination?.current_page || page,
                    pageSize: res.data.pagination?.per_page || pageSize,
                    total   : res.data.pagination?.total || 0,
                });
            }
        } catch (error) {
            console.error("Failed to fetch attributes:", error);
            message.error(error?.response?.data?.message || "Failed to fetch attribute list.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAttributes(pagination.current, pagination.pageSize, searchKey);
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
            const res = await deleteData(`/admin/attribute/${id}`);
            if (res?.success) {
                message.success(res?.message || "Attribute deleted successfully");
                setAttributes((prev) => prev.filter((item) => item.id !== id));
            } else {
                message.error(res?.message || "Failed to delete attribute");
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
        fetchAttributes(pagination.current, pagination.pageSize, searchKey);
    };

    // Modal Handlers
    const showAddModal = () => {
        setEditingAttribute(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const showEditModal = (record) => {
        setEditingAttribute(record);
        form.setFieldsValue({
            name: record.name,
        });
        setIsModalOpen(true);
    };

    const handleModalCancel = () => {
        setIsModalOpen(false);
        form.resetFields();
    };

    const handleFormSubmit = async (values) => {
        setSubmitting(true);
        try {
            if (editingAttribute) {
                // Update
                const res = await putData(`/admin/attribute/${editingAttribute.id}`, values);
                if (res?.success) {
                    message.success(res?.message || "Attribute updated successfully");
                    setIsModalOpen(false);
                    fetchAttributes(pagination.current, pagination.pageSize, searchKey);
                } else {
                    message.error(res?.message || "Failed to update attribute");
                }
            } else {
                // Create
                const res = await postData("/admin/attribute", values);
                if (res?.success) {
                    message.success(res?.message || "Attribute created successfully");
                    setIsModalOpen(false);
                    fetchAttributes(pagination.current, pagination.pageSize, searchKey);
                } else {
                    message.error(res?.message || "Failed to create attribute");
                }
            }
        } catch (error) {
            console.error("Submit error:", error);
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
            title: "Attribute Name",
            dataIndex: "name",
            key: "name",
            width: 180,
            render: (text) => <Text strong>{text}</Text>,
        },
        {
            title: "Slug",
            dataIndex: "slug",
            key: "slug",
            width: 150,
            render: (slug) => <Tag color="blue">{slug}</Tag>,
        },
        {
            title: "Attribute Values",
            dataIndex: "attributeValues",
            key: "attributeValues",
            render: (values) => {
                if (!values || values.length === 0) {
                    return <Text type="secondary">No values</Text>;
                }
                const maxVisible = 6;
                const visibleValues = values.slice(0, maxVisible);
                const hiddenCount = values.length - maxVisible;

                return (
                    <Space wrap gap="4px">
                        {visibleValues.map((v) => (
                            <Tag color="cyan" key={v.id || v.attribute_value}>
                                {v.attribute_value}
                            </Tag>
                        ))}
                        {hiddenCount > 0 && (
                            <Tooltip title={values.slice(maxVisible).map((v) => v.attribute_value).join(", ")}>
                                <Tag color="geekblue">+{hiddenCount} more</Tag>
                            </Tooltip>
                        )}
                    </Space>
                );
            },
        },
        {
            title: "Created At",
            dataIndex: "created_at",
            key: "created_at",
            width: 180,
            render: (date) => (date ? new Date(date).toLocaleString() : "-"),
        },
        {
            title: "Action",
            key: "action",
            width: 150,
            render: (_, record) => (
                <Space size="small">
                    {hasPermission('attribute_update') && (
                        <Button type="link" size="small" icon={<EditOutlined />} onClick={() => showEditModal(record)}>
                            Edit
                        </Button>
                    )}

                    {hasPermission('attribute_delete') && (
                        <Popconfirm title="Delete Attribute" description={`Are you sure to delete "${record.name}"?`}  onConfirm={() => handleDelete(record.id)}
                            okText="Yes" cancelText="No"
                        >
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
        <div className="attribute-page">
            <Breadcrumb
                items={[
                    { title: "Dashboard" },
                    { title: "Product" },
                    { title: "Attribute" },
                ]}
                style={{ marginBottom: 16 }}
            />

            <Card
                title={
                    <Flex justify="space-between" align="center" wrap="wrap" gap="small">
                        <Title level={3} style={{ margin: 0 }}>
                            Attribute List
                        </Title>
                        <Space>
                            {hasPermission('attribute_delete') && (
                                <Button danger icon={<DeleteOutlined />} onClick={() => navigate('/attribute/trash')}>
                                    Trash
                                </Button>
                            )}
                            
                            {hasPermission('attribute_create') && (
                                <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal}>
                                    Add Attribute
                                </Button>
                            )}
                        </Space>
                    </Flex>
                }
            >
                <Flex justify="space-between" align="center" style={{ marginBottom: 16 }} wrap="wrap" gap="small">
                    <Space wrap gap="small">
                        <Input.Search
                            placeholder="Search attribute name..."
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

                {/* Attributes Table */}
                <Table
                    columns={columns}
                    dataSource={attributes}
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

            <Modal title={editingAttribute ? "Edit Attribute" : "Add Attribute"} open={isModalOpen} onCancel={handleModalCancel} footer={null}>
                <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
                    <Form.Item name="name" label="Attribute Name" rules={[{ required: true, message: "Please enter attribute name" }]}>
                        <Input placeholder="e.g. Color, Size, Material" />
                    </Form.Item>
                    
                    <Flex justify="flex-end" gap="small">
                        <Button onClick={handleModalCancel}>
                            Cancel
                        </Button>
                        <Button type="primary" htmlType="submit" loading={submitting}>
                            {editingAttribute ? "Update" : "Save"}
                        </Button>
                    </Flex>
                </Form>
            </Modal>
        </div>
    );
}
