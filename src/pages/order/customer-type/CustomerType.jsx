import { DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import { Breadcrumb, Button, Card, Flex, Form, Input, InputNumber, Modal, Popconfirm, Select, Space, Table, Tag, Typography, message } from "antd";
import { useEffect, useState } from "react";
import useTitle from "../../../hooks/useTitle";
import { deleteData, getDatas, postData, putData } from "../../../services/request";

const { Title, Text } = Typography;

const CustomerType = () => {
    // Hook
    useTitle("All Customer Type");

    // States
    const [customerTypes, setCustomerTypes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchKey, setSearchKey] = useState("");

    // Modal States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [form] = Form.useForm();

    const fetchCustomerTypes = async (search = "") => {
        setLoading(true);
        try {
            const response = await getDatas("/admin/customer-type", { search_key: search });
            
            if (response?.success && response?.data) {
                setCustomerTypes(response.data);
            } else if (Array.isArray(response)) {
                setCustomerTypes(response);
            } else if (response?.data && Array.isArray(response.data)) {
                setCustomerTypes(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch customer types:", error);
            message.error(error?.response?.data?.message || "Failed to fetch customer types.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomerTypes(searchKey);
    }, [searchKey]);

    const handleSearch = (value) => {
        setSearchKey(value);
    };

    const handleRefresh = () => {
        fetchCustomerTypes(searchKey);
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
            order_range: record.order_range ?? record.orderRange ?? 0,
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
                order_range: values.order_range,
                status: values.status,
            };

            let res;
            if (editingRecord) {
                res = await putData(`/admin/customer-type/${editingRecord.id}`, payload);
            } else {
                res = await postData("/admin/customer-type", payload);
            }

            if (res?.success || res?.id || res?.name) {
                message.success(`Customer type ${editingRecord ? 'updated' : 'created'} successfully!`);
                setIsModalOpen(false);
                fetchCustomerTypes(searchKey);
            } else {
                message.error(res?.message || `Failed to ${editingRecord ? 'update' : 'create'} customer type`);
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
            const res = await deleteData(`/admin/customer-type/${id}`);
            if (res?.success) {
                message.success(res?.message || "Customer type deleted successfully");
                fetchCustomerTypes(searchKey);
            } else {
                message.error(res?.message || "Failed to delete customer type");
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
            title: "Order Range",
            key: "order_range",
            render: (_, record) => {
                const range = record.order_range ?? record.orderRange;
                return (
                    <Tag color="purple">
                        {range !== undefined && range !== null ? String(range) : "N/A"}
                    </Tag>
                );
            },
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
            title: "Action",
            key: "action",
            width: 150,
            render: (_, record) => (
                <Space size="small">
                    <Button type="link" size="small" icon={<EditOutlined />} onClick={() => showEditModal(record)}>
                        Edit
                    </Button>
                    <Popconfirm title="Delete Customer Type" description={`Are you sure to delete "${record.name}"?`} okText="Yes" cancelText="No" onConfirm={() => handleDelete(record.id)}>
                        <Button type="link" danger size="small" icon={<DeleteOutlined />}>
                            Delete
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div className="customer-type-page">
            <Breadcrumb
                items={[
                    { title: "Dashboard" },
                    { title: "Order" },
                    { title: "Customer Type" },
                ]}
                style={{ marginBottom: 16 }}
            />

            <Card
                title={
                    <Flex justify="space-between" align="center" wrap="wrap" gap="small">
                        <Title level={3} style={{ margin: 0 }}>
                            Customer Type List
                        </Title>
                        <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal}>
                            Add Customer Type
                        </Button>
                    </Flex>
                }
            >
                <Flex justify="space-between" align="center" style={{ marginBottom: 16 }} wrap="wrap" gap="small">
                    <Input.Search
                        placeholder="Search customer type..."
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
                    dataSource={customerTypes}
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
                title={editingRecord ? "Edit Customer Type" : "Add Customer Type"} 
                open={isModalOpen} 
                onCancel={handleModalCancel} 
                footer={null}
            >
                <Form form={form} layout="vertical" onFinish={handleFormSubmit} initialValues={{ status: 'active', order_range: 0 }}>
                    <Form.Item name="name" label="Customer Type Name" rules={[{ required: true, message: "Please enter customer type name" }]}>
                        <Input placeholder="e.g. Regular Customer" />
                    </Form.Item>
                    
                    <Form.Item name="order_range" label="Order Range" rules={[{ required: true, message: "Please enter order range" }]}>
                        <InputNumber min={0} style={{ width: '100%' }} placeholder="e.g. 2" />
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

export default CustomerType;