import { DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import { Breadcrumb, Button, Card, Flex, Form, Input, InputNumber, Modal, Popconfirm, Select, Space, Table, Tag, Typography, message } from "antd";
import { useEffect, useState } from "react";
import useTitle from "../../../hooks/useTitle";
import { deleteData, getDatas, postData, putData } from "../../../services/request";

const { Title, Text } = Typography;

export default function Faq() {
    // Hook
    useTitle("FAQ List");

    // States
    const [faqs, setFaqs]               = useState([]);
    const [loading, setLoading]         = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingFaq, setEditingFaq]   = useState(null);
    const [submitLoading, setSubmitLoading] = useState(false);

    const [form] = Form.useForm();

    const fetchFaqs = async () => {
        setLoading(true);
        try {
            const response = await getDatas("/admin/faq");
            if (response?.success && response?.data) {
                // If it's directly an array
                setFaqs(Array.isArray(response.data) ? response.data : response.data?.items || []);
            } else {
                setFaqs([]);
            }
        } catch (error) {
            console.error("Failed to fetch faqs:", error);
            message.error(error?.response?.data?.message || "Failed to fetch FAQ data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFaqs();
    }, []);

    const handleAdd = () => {
        setEditingFaq(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleEdit = (record) => {
        setEditingFaq(record);
        form.setFieldsValue({
            question: record.question,
            answer: record.answer,
            position: record.position,
            status: record.status,
        });
        setIsModalVisible(true);
    };

    const handleDelete = async (id) => {
        try {
            const res = await deleteData(`/admin/faq/${id}`);
            if (res?.success !== false) {
                message.success(res?.message || "FAQ deleted successfully");
                setFaqs(prev => prev.filter(item => item.id !== id));
            } else {
                message.error(res?.message || "Failed to delete FAQ");
            }
        } catch (error) {
            console.error(error);
            message.error(error?.response?.data?.message || "An error occurred");
        }
    };

    const handleModalOk = async () => {
        try {
            const values = await form.validateFields();
            setSubmitLoading(true);

            if (editingFaq) {
                // Update
                const res = await putData(`/admin/faq/${editingFaq.id}`, values);
                if (res?.success !== false) {
                    message.success(res?.message || "FAQ updated successfully");
                    fetchFaqs();
                    setIsModalVisible(false);
                } else {
                    message.error(res?.message || "Failed to update FAQ");
                }
            } else {
                // Create
                const res = await postData("/admin/faq", values);
                if (res?.success !== false) {
                    message.success(res?.message || "FAQ created successfully");
                    fetchFaqs();
                    setIsModalVisible(false);
                } else {
                    message.error(res?.message || "Failed to create FAQ");
                }
            }
        } catch (error) {
            if (error.errorFields) {
                return; // Validation failed
            }
            console.error(error);
            message.error(error?.response?.data?.message || "An error occurred");
        } finally {
            setSubmitLoading(false);
        }
    };

    const columns = [
        {
            title: "SL",
            key: "sl",
            width: 60,
            render: (_, __, index) => index + 1,
        },
        {
            title: "Question",
            dataIndex: "question",
            key: "question",
            render: (text) => <Text strong>{text}</Text>,
        },
        {
            title: "Answer",
            dataIndex: "answer",
            key: "answer",
            ellipsis: true, // Answers could be long
        },
        {
            title: "Position",
            dataIndex: "position",
            key: "position",
            width: 100,
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            width: 100,
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
            title: "Action",
            key: "action",
            width: 140,
            render: (_, record) => (
                <Space size="small">
                    <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
                        Edit
                    </Button>

                    <Popconfirm 
                        title="Delete FAQ" 
                        description="Are you sure you want to delete this FAQ?" 
                        okText="Yes" 
                        cancelText="No" 
                        onConfirm={() => handleDelete(record.id)}
                    >
                        <Button type="link" danger size="small" icon={<DeleteOutlined />}>
                            Delete
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div className="faq-page">
            <Breadcrumb
                items={[
                    { title: "Dashboard" },
                    { title: "CMS" },
                    { title: "FAQ" },
                ]}
                style={{ marginBottom: 16 }}
            />

            <Card
                title={
                    <Flex justify="space-between" align="center" wrap="wrap" gap="small">
                        <Title level={4} style={{ margin: 0 }}>
                            FAQ List
                        </Title>
                        <Space>
                            <Button icon={<ReloadOutlined />} onClick={fetchFaqs} loading={loading}>
                                Refresh
                            </Button>
                            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                                Add FAQ
                            </Button>
                        </Space>
                    </Flex>
                }
            >
                <Table
                    columns={columns}
                    dataSource={faqs}
                    rowKey="id"
                    loading={loading}
                    scroll={{ x: 'max-content' }}
                    pagination={false} 
                />
            </Card>

            <Modal
                title={editingFaq ? "Edit FAQ" : "Add FAQ"}
                open={isModalVisible}
                onOk={handleModalOk}
                onCancel={() => setIsModalVisible(false)}
                confirmLoading={submitLoading}
                destroyOnClose
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="question"
                        label="Question"
                        rules={[{ required: true, message: "Please enter the question" }]}
                    >
                        <Input placeholder="Enter question" />
                    </Form.Item>

                    <Form.Item
                        name="answer"
                        label="Answer"
                        rules={[{ required: true, message: "Please enter the answer" }]}
                    >
                        <Input.TextArea rows={4} placeholder="Enter answer" />
                    </Form.Item>

                    <Form.Item
                        name="position"
                        label="Position"
                        rules={[{ required: true, message: "Please enter position" }]}
                        initialValue={1}
                    >
                        <InputNumber min={1} style={{ width: '100%' }} placeholder="E.g., 1, 2, 3" />
                    </Form.Item>

                    <Form.Item
                        name="status"
                        label="Status"
                        rules={[{ required: true, message: "Please select a status" }]}
                        initialValue="active"
                    >
                        <Select>
                            <Select.Option value="active">Active</Select.Option>
                            <Select.Option value="inactive">Inactive</Select.Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}