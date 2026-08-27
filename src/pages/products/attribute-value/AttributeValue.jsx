import { ClearOutlined, DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import { Breadcrumb, Button, Card, Flex, Form, Input, Modal, Popconfirm, Select, Space, Table, Tag, Typography, message } from "antd";
import { useEffect, useState } from "react";
import usePermissions from "../../../hooks/usePermissions";
import useTitle from "../../../hooks/useTitle";
import { deleteData, getDatas, postData, putData } from "../../../services/request";

const { Title, Text } = Typography;

export default function AttributeValue() {
    // Hook
    useTitle("Attribute Value List");

    // Variable
    const {hasPermission} = usePermissions();

    // States
    const [attributeValues, setAttributeValues] = useState([]);
    const [attributesList, setAttributesList]   = useState([]);
    const [loading, setLoading]                 = useState(false);
    
    // Filters
    const [searchKey, setSearchKey]       = useState("");
    const [attributeId, setAttributeId]   = useState(undefined);
    const [pagination, setPagination]     = useState({current: 1,pageSize: 25,total: 0});

    // Modal States
    const [isModalOpen, setIsModalOpen]                     = useState(false);
    const [editingAttributeValue, setEditingAttributeValue] = useState(null);
    const [submitting, setSubmitting]                       = useState(false);
    const [form]                                            = Form.useForm();

    // Fetch Attribute Filter List
    useEffect(() => {
        const fetchAttributeList = async () => {
            try {
                const res = await getDatas("/admin/attribute/list");
                if (res?.data) {
                    setAttributesList(Array.isArray(res.data) ? res.data : (res.data.items || []));
                }
            } catch (err) {
                console.log("Could not load attributes for filter:", err);
            }
        };

        fetchAttributeList();
    }, []);

    const fetchAttributeValues = async (page = 1, pageSize = 25) => {
        setLoading(true);
        try {
            const params = {
                page: page,
                paginate_size: pageSize,
            };

            if (searchKey) params.search_key = searchKey;
            if (attributeId) params.attribute_id = attributeId;

            const res = await getDatas("admin/attribute-value", params);

            if (res && res?.success) {
                setAttributeValues(res.data.items || []);
                setPagination({
                    current : res.data.pagination?.current_page || page,
                    pageSize: res.data.pagination?.per_page || pageSize,
                    total   : res.data.pagination?.total || 0,
                });
            }
        } catch (error) {
            console.error("Failed to fetch attribute values:", error);
            message.error(error?.response?.data?.message || "Failed to fetch attribute value list.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAttributeValues(pagination.current, pagination.pageSize);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pagination.current, pagination.pageSize, searchKey, attributeId]);

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
        setAttributeId(undefined);
        setPagination((prev) => ({ ...prev, current: 1 }));
    };

    const handleRefresh = () => {
        fetchAttributeValues(pagination.current, pagination.pageSize);
    };

    const handleDelete = async (id) => {
        try {
            const res = await deleteData(`/admin/attribute-value/${id}`);
            if (res?.success) {
                message.success(res?.message || "Attribute value deleted successfully");
                setAttributeValues((prev) => prev.filter((item) => item.id !== id));
            } else {
                message.error(res?.message || "Failed to delete attribute value");
            }
        } catch (error) {
            console.error("Delete error:", error);
            message.error(error?.response?.data?.message || "An error occurred during deletion");
        }
    };

    // Modal Handlers
    const showAddModal = () => {
        setEditingAttributeValue(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const showEditModal = (record) => {
        setEditingAttributeValue(record);
        form.setFieldsValue({
            attribute_id: record.attribute_id,
            attribute_value: record.attribute_value,
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
            if (editingAttributeValue) {
                const res = await putData(`/admin/attribute-value/${editingAttributeValue.id}`, values);
                if (res?.success) {
                    message.success(res?.message || "Attribute value updated successfully");
                    setIsModalOpen(false);
                    fetchAttributeValues(pagination.current, pagination.pageSize);
                } else {
                    message.error(res?.message || "Failed to update attribute value");
                }
            } else {
                const res = await postData("/admin/attribute-value", values);
                if (res?.success) {
                    message.success(res?.message || "Attribute value created successfully");
                    setIsModalOpen(false);
                    fetchAttributeValues(pagination.current, pagination.pageSize);
                } else {
                    message.error(res?.message || "Failed to create attribute value");
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
            title: "Attribute",
            key: "attribute",
            render: (_, record) => (
                <Tag color="blue">{record.attribute?.name || "N/A"}</Tag>
            ),
        },
        {
            title: "Value",
            dataIndex: "attribute_value",
            key: "attribute_value",
            render: (text) => <Text strong>{text}</Text>,
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
                    {hasPermission('attribute_value_update') && (
                        <Button type="link" size="small" icon={<EditOutlined />} onClick={() => showEditModal(record)}>
                            Edit
                        </Button>
                    )}

                    {hasPermission('attribute_value_delete') && (
                        <Popconfirm 
                            title="Delete Attribute Value" 
                            description={`Are you sure to delete "${record.attribute_value}"?`} 
                            onConfirm={() => handleDelete(record.id)}
                            okText="Yes" 
                            cancelText="No"
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
        <div className="attribute-value-page">
            <Breadcrumb
                items={[
                    { title: "Dashboard" },
                    { title: "Product" },
                    { title: "Attribute Values" },
                ]}
                style={{ marginBottom: 16 }}
            />

            <Card
                title={
                    <Flex justify="space-between" align="center" wrap="wrap" gap="small">
                        <Title level={3} style={{ margin: 0 }}>
                            Attribute Value List
                        </Title>

                        <Space>
                            {hasPermission('attribute_value_create') && (
                                <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal}>
                                    Add Attribute Value
                                </Button>
                            )}
                        </Space>
                    </Flex>
                }
            >
                <Flex justify="space-between" align="center" style={{ marginBottom: 16 }} wrap="wrap" gap="small">
                    <Space wrap gap="small">
                        <Input.Search
                            placeholder="Search value..."
                            allowClear
                            enterButton={<SearchOutlined />}
                            style={{ width: 280 }}
                            value={searchKey}
                            onChange={(e) => setSearchKey(e.target.value)}
                            onSearch={handleSearchSubmit}
                        />

                        {/* Filter by Attribute */}
                        <Select
                            placeholder="Filter by Attribute"
                            allowClear
                            style={{ width: 200 }}
                            value={attributeId}
                            onChange={(val) => {
                                setAttributeId(val);
                                setPagination((prev) => ({ ...prev, current: 1 }));
                            }}
                            options={attributesList.map((attr) => ({
                                label: attr.name,
                                value: attr.id,
                            }))}
                        />

                        {/* Reset Filters */}
                        {(searchKey || attributeId) && (
                            <Button icon={<ClearOutlined />} onClick={handleResetFilters}>
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
                    dataSource={attributeValues}
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

            <Modal title={editingAttributeValue ? "Edit Attribute Value" : "Add Attribute Value"} open={isModalOpen} onCancel={handleModalCancel} footer={null}>
                <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
                    <Form.Item name="attribute_id" label="Attribute" rules={[{ required: true, message: "Please select an attribute" }]}>
                        <Select
                            placeholder="Select Attribute"
                            options={attributesList.map((attr) => ({
                                label: attr.name,
                                value: attr.id,
                            }))}
                        />
                    </Form.Item>

                    <Form.Item name="value" label="Attribute Value" rules={[{ required: true, message: "Please enter the value" }]}>
                        <Input placeholder="e.g. Red, XL, 64GB" />
                    </Form.Item>
                    
                    <Flex justify="flex-end" gap="small">
                        <Button onClick={handleModalCancel}>
                            Cancel
                        </Button>
                        <Button type="primary" htmlType="submit" loading={submitting}>
                            {editingAttributeValue ? "Update" : "Save"}
                        </Button>
                    </Flex>
                </Form>
            </Modal>
        </div>
    );
}
