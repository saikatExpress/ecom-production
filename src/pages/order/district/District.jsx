import { DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import { Breadcrumb, Button, Card, Collapse, Flex, Form, Input, Modal, Pagination, Popconfirm, Select, Space, Table, Tag, Typography, message } from "antd";
import { useEffect, useMemo, useState } from "react";
import usePermissions from "../../../hooks/usePermissions";
import useTitle from "../../../hooks/useTitle";
import { deleteData, getDatas, postData, putData } from "../../../services/request";
import { handleFormErrors } from "../../../utils/formUtils";

const { Title, Text } = Typography;

const District = () => {
    // Hook
    useTitle("All District");

    // Variable
    const { hasPermission } = usePermissions();

    // States
    const [districts, setDistricts]         = useState([]);
    const [loading, setLoading]             = useState(false);
    const [searchKey, setSearchKey]         = useState("");
    const [filterStatus, setFilterStatus]   = useState(null);
    const [pagination, setPagination]       = useState({ current_page: 1, per_page: 25, total: 0 });
    const [isModalOpen, setIsModalOpen]     = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [submitting, setSubmitting]       = useState(false);
    const [form]                            = Form.useForm();

    const fetchDistricts = async (search = "", status = null, page = 1, perPage = 25) => {
        setLoading(true);
        try {
            const params = { 
                search_key: search, 
                page, 
                paginate_size: perPage 
            };
            
            if (status) {
                params.status = status;
            }

            const response = await getDatas("/admin/district", params);
            
            if (response?.success && response?.data) {
                if (response.data.items) {
                    setDistricts(response.data.items);
                    if (response.data.pagination) {
                        setPagination(response.data.pagination);
                    }
                } else if (Array.isArray(response.data)) {
                    setDistricts(response.data);
                }
            } else if (Array.isArray(response)) {
                setDistricts(response);
            }
        } catch (error) {
            console.error("Failed to fetch districts:", error);
            message.error(error?.response?.data?.message || "Failed to fetch districts.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDistricts(searchKey, filterStatus, pagination.current_page, pagination.per_page);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchKey, filterStatus]);

    const handleSearch = (value) => {
        setSearchKey(value);
        setPagination(prev => ({ ...prev, current_page: 1 }));
    };

    const handleFilterStatus = (value) => {
        setFilterStatus(value);
        setPagination(prev => ({ ...prev, current_page: 1 }));
    };

    const handleRefresh = () => {
        fetchDistricts(searchKey, filterStatus, pagination.current_page, pagination.per_page);
    };

    const handlePageChange = (page, pageSize) => {
        setPagination(prev => ({ ...prev, current_page: page, per_page: pageSize }));
        fetchDistricts(searchKey, filterStatus, page, pageSize);
    };

    const groupedDistricts = useMemo(() => {
        const groups = {};
        districts.forEach(district => {
            const divName = district.division_name || "Others";
            if (!groups[divName]) {
                groups[divName] = [];
            }
            groups[divName].push(district);
        });
        return groups;
    }, [districts]);

    const showAddModal = () => {
        setEditingRecord(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const showEditModal = (record) => {
        setEditingRecord(record);
        form.setFieldsValue({
            division_name: record.division_name,
            district_name: record.district_name,
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
                division_name: values.division_name,
                district_name: values.district_name,
                status: values.status,
            };

            let res;
            if (editingRecord) {
                res = await putData(`/admin/district/${editingRecord.id}`, payload);
            } else {
                res = await postData("/admin/district", payload);
            }

            if (res?.success || res?.id || res?.district_name) {
                message.success(`District ${editingRecord ? 'updated' : 'created'} successfully!`);
                setIsModalOpen(false);
                fetchDistricts(searchKey, filterStatus, pagination.current_page, pagination.per_page);
            } else {
                message.error(res?.message || `Failed to ${editingRecord ? 'update' : 'create'} district`);
            }
        } catch (error) {
            console.error("Submit error:", error);
            message.error(error?.response?.data?.message || "An error occurred");
            handleFormErrors(error, form, message.error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            const res = await deleteData(`/admin/district/${id}`);
            if (res?.success) {
                message.success(res?.message || "District deleted successfully");
                fetchDistricts(searchKey, filterStatus, pagination.current_page, pagination.per_page);
            } else {
                message.error(res?.message || "Failed to delete district");
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
            title: "District Name",
            dataIndex: "district_name",
            key: "district_name",
            render: (text) => <Text strong>{text}</Text>,
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
                    {hasPermission('district_update') && (
                        <Button type="link" size="small" icon={<EditOutlined />} onClick={() => showEditModal(record)}>
                            Edit
                        </Button>
                    )}

                    {hasPermission('district_delete') && (
                        <Popconfirm title="Delete District" description={`Are you sure to delete "${record.district_name}"?`} okText="Yes" cancelText="No" onConfirm={() => handleDelete(record.id)}>
                            <Button type="link" danger size="small" icon={<DeleteOutlined />}>
                                Delete
                            </Button>
                        </Popconfirm>
                    )}
                </Space>
            ),
        },
    ];

    const collapseItems = Object.keys(groupedDistricts).map(division => ({
        key: division,
        label: <Text strong>{division} Division ({groupedDistricts[division].length})</Text>,
        children: (
            <Table
                columns={columns}
                dataSource={groupedDistricts[division]}
                rowKey="id"
                pagination={false}
                size="small"
            />
        )
    }));

    return (
        <div className="district-page">
            <Breadcrumb
                items={[
                    { title: "Dashboard" },
                    { title: "Order" },
                    { title: "District" },
                ]}
                style={{ marginBottom: 16 }}
            />

            <Card
                title={
                    <Flex justify="space-between" align="center" wrap="wrap" gap="small">
                        <Title level={3} style={{ margin: 0 }}>
                            District List
                        </Title>
                        {hasPermission('district_create') && (
                            <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal}>
                                Add District
                            </Button>
                        )}
                    </Flex>
                }
            >
                <Flex justify="space-between" align="center" style={{ marginBottom: 16 }} wrap="wrap" gap="small">
                    <Space size="middle" wrap>
                        <Input.Search placeholder="Search district..." allowClear enterButton={<SearchOutlined />} style={{ maxWidth: 320 }} onSearch={handleSearch}/>

                        <Select placeholder="Filter by Status" allowClear style={{ width: 150 }} onChange={handleFilterStatus} value={filterStatus}>
                            <Select.Option value="active">Active</Select.Option>
                            <Select.Option value="inactive">Inactive</Select.Option>
                        </Select>
                    </Space>
                    <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading}>
                        Refresh
                    </Button>
                </Flex>

                {loading ? (
                    <Table loading={true} columns={[]} dataSource={[]} />
                ) : (
                    <>
                        {Object.keys(groupedDistricts).length > 0 ? (
                            <Collapse items={collapseItems} defaultActiveKey={Object.keys(groupedDistricts)} />
                        ) : (
                            <Table columns={columns} dataSource={[]} pagination={false} />
                        )}

                        {pagination && pagination.total > 0 && (
                            <Flex justify="flex-end" style={{ marginTop: 16 }}>
                                <Pagination
                                    current={pagination.current_page}
                                    pageSize={pagination.per_page}
                                    total={pagination.total}
                                    onChange={handlePageChange}
                                    showSizeChanger
                                    pageSizeOptions={["10", "25", "50", "100"]}
                                    showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} items`}
                                />
                            </Flex>
                        )}
                    </>
                )}
            </Card>

            <Modal title={editingRecord ? "Edit District" : "Add District"} open={isModalOpen} onCancel={handleModalCancel} footer={null}>
                <Form form={form} layout="vertical" onFinish={handleFormSubmit} initialValues={{ status: 'active' }}>
                    <Form.Item name="division_name" label="Division Name" rules={[{ required: true, message: "Please enter division name" }]}>
                        <Input placeholder="e.g. Dhaka" />
                    </Form.Item>

                    <Form.Item name="district_name" label="District Name" rules={[{ required: true, message: "Please enter district name" }]}>
                        <Input placeholder="e.g. Gazipur" />
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

export default District;