import { ArrowLeftOutlined, SaveOutlined } from "@ant-design/icons";
import { Breadcrumb, Button, Card, Col, Flex, Form, Input, Row, Select, Spin, message } from "antd";
import { useEffect, useState } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { useNavigate } from "react-router-dom";
import useTitle from "../../../hooks/useTitle";
import { getData, putData } from "../../../services/request";

const quillModules = {
    toolbar: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        [{ 'font': [] }],
        [{ 'size': ['small', false, 'large', 'huge'] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
        [{ 'align': [] }],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'script': 'sub' }, { 'script': 'super' }],
        ['link', 'image', 'video'],
        ['clean']
    ],
};

const quillFormats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'align', 'color', 'background', 'script',
    'link', 'image', 'video'
];

export default function AboutUs() {
    // Hook
    useTitle("About Us");

    // Variable
    const navigate = useNavigate();
    const [form]   = Form.useForm();

    // States
    const [loading, setLoading]         = useState(false);
    const [pageLoading, setPageLoading] = useState(true);

    const fetchPageData = async () => {
        setPageLoading(true);
        try {
            const response = await getData("/admin/pages/about-us");
            
            if (response?.success && response?.data) {
                form.setFieldsValue({
                    name            : response.data.name,
                    content         : response.data.content,
                    meta_title      : response.data.meta_title,
                    meta_description: response.data.meta_description,
                    meta_keywords   : response.data.meta_keywords,
                    status          : response.data.status,
                });
            }
        } catch (error) {
            console.error("Failed to fetch page data:", error);
            message.error(error?.response?.data?.message || "Failed to fetch data");
        } finally {
            setPageLoading(false);
        }
    };

    useEffect(() => {
        fetchPageData();
    }, []);

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const res = await putData("/admin/pages/about-us", values);
            if (res?.success !== false) {
                message.success(res?.message || "Page updated successfully");
            } else {
                message.error(res?.message || "Failed to update page");
            }
        } catch (error) {
            console.error("Submit error:", error);
            message.error(error?.response?.data?.message || "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="about-us-page">
            <Breadcrumb
                items={[
                    { title: "Dashboard" },
                    { title: "CMS" },
                    { title: "About Us" },
                ]}
                style={{ marginBottom: 16 }}
            />

            <Spin spinning={pageLoading}>
                <Card
                    title={
                        <Flex justify="space-between" align="center" wrap="wrap" gap="small">
                            <h3 style={{ margin: 0 }}>About Us Settings</h3>
                            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
                                Back
                            </Button>
                        </Flex>
                    }
                >
                    <Form form={form} layout="vertical" onFinish={onFinish}>
                        <Row gutter={[16, 16]}>
                            <Col xs={24} lg={16}>
                                <Card title="Basic Information" size="small" bordered={false}>
                                    <Form.Item name="name" label="Page Name" rules={[{ required: true, message: "Please enter the page name" }]}>
                                        <Input placeholder="Enter page name" />
                                    </Form.Item>

                                    <Form.Item name="content" label="Content" rules={[{ required: true, message: "Please enter the content" }]}>
                                        <ReactQuill theme="snow" modules={quillModules} formats={quillFormats} style={{ height: '400px', marginBottom: '40px' }}/>
                                    </Form.Item>
                                </Card>
                            </Col>

                            <Col xs={24} lg={8}>
                                <Card title="SEO & Status" size="small" bordered={false}>
                                    <Form.Item name="status" label="Status" rules={[{ required: true, message: "Please select status" }]} initialValue="active">
                                        <Select>
                                            <Select.Option value="active">Active</Select.Option>
                                            <Select.Option value="inactive">Inactive</Select.Option>
                                        </Select>
                                    </Form.Item>

                                    <Form.Item name="meta_title" label="Meta Title">
                                        <Input placeholder="Enter meta title" />
                                    </Form.Item>

                                    <Form.Item name="meta_description" label="Meta Description">
                                        <Input.TextArea rows={3} placeholder="Enter meta description" />
                                    </Form.Item>

                                    <Form.Item name="meta_keywords" label="Meta Keywords">
                                        <Input placeholder="Enter meta keywords" />
                                    </Form.Item>
                                    
                                    <Form.Item>
                                        <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading} block>
                                            Save Changes
                                        </Button>
                                    </Form.Item>
                                </Card>
                            </Col>
                        </Row>
                    </Form>
                </Card>
            </Spin>
        </div>
    );
}