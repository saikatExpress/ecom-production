import { ArrowLeftOutlined, DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined, UploadOutlined } from "@ant-design/icons";
import { Breadcrumb, Button, Card, Col, Flex, Form, Image, Input, Modal, Popconfirm, Row, Select, Space, Table, Tag, Typography, Upload, message } from "antd";
import { useEffect, useState } from "react";
import usePermissions from "../../../hooks/usePermissions";
import useTitle from "../../../hooks/useTitle";
import { deleteData, getDatas, postData } from "../../../services/request";
import { handleFormErrors } from "../../../utils/formUtils";

const { Title, Text } = Typography;
const { Search } = Input;

const Provider = () => {
    // Hook
    useTitle("Provider List");

    // Variable
    const {hasPermission} = usePermissions();

    // States
    const [providers, setProviders]           = useState([]);
    const [loading, setLoading]               = useState(false);
    const [filters, setFilters]               = useState({ search_key: "" });
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [submitting, setSubmitting]         = useState(false);
    const [editingId, setEditingId]           = useState(null);
    const [fileList, setFileList]             = useState([]);
    const [form]                              = Form.useForm();
    const [tableParams, setTableParams] = useState({
        pagination: {
            current: 1,
            pageSize: 25,
            total: 0
        },
    });

    const showAddModal = () => {
        setEditingId(null);
        form.resetFields();
        setFileList([]);
        form.setFieldsValue({ status: "active" });
        setIsModalVisible(true);
    };

    const showEditModal = (record) => {
        setEditingId(record.id);
        form.setFieldsValue({
            name: record.name,
            status: record.status
        });
        if (record.image) {
            setFileList([
                {
                    uid: '-1',
                    name: 'image',
                    status: 'done',
                    url: record.image,
                }
            ]);
        } else {
            setFileList([]); 
        }
        setIsModalVisible(true);
    };

    const handleModalCancel = () => {
        setIsModalVisible(false);
        form.resetFields();
        setFileList([]);
    };

    const handleModalSubmit = async (values) => {
        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append("name", values.name);
            formData.append("status", values.status);

            if (fileList.length > 0) {
                formData.append("image", fileList[0].originFileObj);
            }

            let res;
            if (editingId) {
                formData.append("_method", "PUT");
                res = await postData(`/admin/provider/${editingId}`, formData);
            } else {
                res = await postData("/admin/provider", formData);
            }

            if (res?.success !== false) {
                message.success(res?.message || `Provider ${editingId ? 'updated' : 'created'} successfully!`);
                setIsModalVisible(false);
                fetchProviders(tableParams.pagination.current, tableParams.pagination.pageSize);
            } else {
                message.error(res?.message || `Failed to ${editingId ? 'update' : 'create'} provider`);
            }
        } catch (error) {
            console.error(error);
            message.error(error?.response?.data?.message || "An error occurred");
            handleFormErrors(error, form, message.error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleFileChange = ({ fileList: newFileList }) => {
        setFileList(newFileList);
    };

    const beforeUpload = (file) => {
        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/webp';
        if (!isJpgOrPng) {
            message.error('You can only upload JPG/PNG/WEBP file!');
        }
        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
            message.error('Image must smaller than 2MB!');
        }
        return false;
    };

    const handleDelete = async (id) => {
        try {
            const res = await deleteData(`/admin/provider/${id}`);
            if (res?.success !== false) {
                message.success(res?.message || "Provider deleted successfully");
                fetchProviders(tableParams.pagination.current, tableParams.pagination.pageSize);
            } else {
                message.error(res?.message || "Failed to delete provider");
            }
        } catch (error) {
            console.error(error);
            message.error(error?.response?.data?.message || "An error occurred");
        }
    };

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
                            current : res.data.pagination.current_page,
                            pageSize: res.data.pagination.per_page,
                            total   : res.data.pagination.total,
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
            title: 'Image',
            dataIndex: 'image',
            key: 'image',
            align: 'center',
            width: 80,
            render: (image) => (
                image ? <Image src={image} alt="Provider" width={40} height={40} style={{ objectFit: 'cover', borderRadius: '4px' }} /> : <Text type="secondary">N/A</Text>
            )
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
                is_default === 1 ? <Tag color="blue">Default</Tag> : <Tag color="default">No</Tag>
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
                        <Button type="link" size="small" icon={<EditOutlined />} onClick={() => showEditModal(record)}>
                            Edit
                        </Button>
                    )}

                    {hasPermission('ai_delete') && (
                        <Popconfirm title="Delete Provider" description={`Are you sure to delete "${record.name}"?`} okText="Yes" cancelText="No" onConfirm={() => handleDelete(record.id)}>
                            <Button type="link" danger size="small" icon={<DeleteOutlined />}>
                                Delete
                            </Button>
                        </Popconfirm>
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
                                <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal}>
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

            <Modal title={editingId ? "Edit Provider" : "Create Provider"} open={isModalVisible} onCancel={handleModalCancel} footer={null} destroyOnClose>
                <Form form={form} layout="vertical" onFinish={handleModalSubmit}>
                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item name="name" label="Provider Name" rules={[{ required: true, message: 'Please enter provider name' }]}>
                                <Input placeholder="e.g. OpenAI" />
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

                        <Col span={24}>
                            <Form.Item label="Upload Image">
                                <Upload
                                    listType="picture-card"
                                    fileList={fileList}
                                    onChange={handleFileChange}
                                    beforeUpload={beforeUpload}
                                    maxCount={1}
                                    accept="image/png, image/jpeg, image/webp"
                                >
                                    {fileList.length < 1 && (
                                        <div>
                                            <UploadOutlined />
                                            <div style={{ marginTop: 8 }}>Upload</div>
                                        </div>
                                    )}
                                </Upload>
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
};

export default Provider;