import { DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import { Breadcrumb, Button, Card, Flex, Form, Input, Modal, Popconfirm, Select, Space, Table, Tag, Typography, message } from "antd";
import React, { useEffect, useState } from "react";
import useTitle from "../../../hooks/useTitle";
import { deleteData, getDatas, postData, putData } from "../../../services/request";

const { Title, Text } = Typography;

const CancelReason = () => {
    // Hook
    useTitle("All Cancel Reason");

    // States
    const [cancelReasons, setCancelReasons] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchKey, setSearchKey] = useState("");

    // Modal States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [form] = Form.useForm();

    const fetchCancelReasons = async (search = "") => {
        setLoading(true);
        try {
            const response = await getDatas("/admin/cancel-reason", { search_key: search });
            
            if (response?.success && response?.data) {
                setCancelReasons(response.data);
            } else if (Array.isArray(response)) {
                setCancelReasons(response);
            } else if (response?.data && Array.isArray(response.data)) {
                setCancelReasons(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch cancel reasons:", error);
            message.error(error?.response?.data?.message || "Failed to fetch cancel reasons.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCancelReasons(searchKey);
    }, [searchKey]);

    const handleSearch = (value) => {
        setSearchKey(value);
    };

    const handleRefresh = () => {
        fetchCancelReasons(searchKey);
    };

    // Modal Handlers
    const showAddModal = () => {
        setEditingRecord(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const showEditModal = (record) => {
        setEditingRecord(record);
        form.setFieldsValue({
            name: record.name,
            status: record.status || "active",
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
            const payload = {
                name: values.name,
                status: values.status,
            };

            let res;
            if (editingRecord) {
                res = await putData(`/admin/cancel-reason/${editingRecord.id}`, payload);
            } else {
                res = await postData("/admin/cancel-reason", payload);
            }

            if (res?.success || res?.id || res?.name) {
                message.success(`Cancel reason ${editingRecord ? 'updated' : 'created'} successfully!`);
                setIsModalOpen(false);
                fetchCancelReasons(searchKey);
            } else {
                message.error(res?.message || `Failed to ${editingRecord ? 'update' : 'create'} cancel reason`);
            }
        } catch (error) {
            console.error("Submit error:", error);
            message.error(error?.response?.data?.message || "An error occurred");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            const res = await deleteData(`/admin/cancel-reason/${id}`);
            if (res?.success) {
                message.success(res?.message || "Cancel reason deleted successfully");
                fetchCancelReasons(searchKey);
            } else {
                message.error(res?.message || "Failed to delete cancel reason");
            }
        } catch (error) {
            console.error(error);
            message.error(error?.response?.data?.message || "An error occurred");
        }
    };

    const columns = [
        {
            title: "SL",
            key: "sl",
            width: 70,
            render: (_, __, index) => index + 1,
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
            title: "Status",
            key: "status",
            render: (_, record) => {
                const status = record.status;
                const safeStatus = String(status ?? "").trim().toLowerCase();
                const isActive = safeStatus === "active" || safeStatus === "1" || safeStatus === "true";
                
                return (
                    <Tag color={isActive ? "success" : "error"} style={{ textTransform: "capitalize" }}>
                        {status !== undefined && status !== null ? String(status) : "Inactive"}
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
                    <Button type="link" size="small" icon={<EditOutlined />} onClick={() => showEditModal(record)}>
                        Edit
                    </Button>
                    <Popconfirm title="Delete Cancel Reason" description={`Are you sure to delete "${record.name}"?`} okText="Yes" cancelText="No" onConfirm={() => handleDelete(record.id)}>
                        <Button type="link" danger size="small" icon={<DeleteOutlined />}>
                            Delete
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div className="cancel-reason-page">
            <Breadcrumb
                items={[
                    { title: "Dashboard" },
                    { title: "Order" },
                    { title: "Cancel Reason" },
                ]}
                style={{ marginBottom: 16 }}
            />

            <Card
                title={
                    <Flex justify="space-between" align="center" wrap="wrap" gap="small">
                        <Title level={3} style={{ margin: 0 }}>
                            Cancel Reason List
                        </Title>
                        <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal}>
                            Add Cancel Reason
                        </Button>
                    </Flex>
                }
            >
                <Flex justify="space-between" align="center" style={{ marginBottom: 16 }} wrap="wrap" gap="small">
                    <Input.Search
                        placeholder="Search cancel reason..."
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
                    dataSource={cancelReasons}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        showSizeChanger: true,
                        pageSizeOptions: ["10", "25", "50", "100"],
                        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                    }}
                />
            </Card>

            {/* Add / Edit Modal */}
            <Modal 
                title={editingRecord ? "Edit Cancel Reason" : "Add Cancel Reason"} 
                open={isModalOpen} 
                onCancel={handleModalCancel} 
                footer={null}
            >
                <Form form={form} layout="vertical" onFinish={handleFormSubmit} initialValues={{ status: 'active' }}>
                    <Form.Item name="name" label="Reason Name" rules={[{ required: true, message: "Please enter cancel reason name" }]}>
                        <Input placeholder="e.g. Customer changed mind" />
                    </Form.Item>
                    
                    <Form.Item name="status" label="Status" rules={[{ required: true, message: "Please select status" }]}>
                        <Select placeholder="Select status">
                            <Select.Option value="active">Active</Select.Option>
                            <Select.Option value="inactive">Inactive</Select.Option>
                        </Select>
                    </Form.Item>
                    
                    <Flex justify="flex-end" gap="small" style={{ marginTop: 24 }}>
                        <Button onClick={handleModalCancel}>
                            Cancel
                        </Button>
                        <Button type="primary" htmlType="submit" loading={submitting}>
                            {editingRecord ? "Update" : "Save"}
                        </Button>
                    </Flex>
                </Form>
            </Modal>
        </div>
    );
};

export default CancelReason;