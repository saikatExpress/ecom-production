import { ArrowLeftOutlined, UploadOutlined } from "@ant-design/icons";
import { Breadcrumb, Button, Card, Col, Form, Input, Row, Select, Upload, message } from "antd";
import { useEffect, useState } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { useNavigate } from "react-router-dom";
import useTitle from "../../hooks/useTitle";
import { getDatas, postData } from "../../services/request";

export default function AddBlog() {
    // Hook
    useTitle("Add Blog");

    // Variable
    const navigate = useNavigate();
    const [form]   = Form.useForm();

    // States
    const [loading, setLoading]       = useState(false);
    const [categories, setCategories] = useState([]);
    const [tags, setTags]             = useState([]);
    const [fileList, setFileList]     = useState([]);

    useEffect(() => {
        const fetchFilters = async () => {
            try {
                const catRes = await getDatas("/admin/blog-category/list");
                if (catRes?.success) setCategories(catRes.data);

                const tagRes = await getDatas("/admin/tag/list");
                if (tagRes?.success) setTags(tagRes.data);
            } catch (error) {
                console.error("Failed to load options", error);
            }
        };
        fetchFilters();
    }, []);

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("title", values.title);
            formData.append("category_id", values.category_id);
            if (values.excerpt) formData.append("excerpt", values.excerpt);
            if (values.content) formData.append("content", values.content);

            if (values.tag_ids && values.tag_ids.length > 0) {
                values.tag_ids.forEach((tagId) => {
                    formData.append("tag_ids[]", tagId);
                });
            }

            if (values.meta_title) formData.append("meta_title", values.meta_title);
            if (values.meta_keywords) {
                const keywords = Array.isArray(values.meta_keywords)
                    ? values.meta_keywords.join(",")
                    : values.meta_keywords;
                formData.append("meta_keywords", keywords);
            }
            if (values.meta_description) formData.append("meta_description", values.meta_description);

            formData.append("status", values.status);

            if (fileList.length > 0) {
                formData.append("image", fileList[0].originFileObj);
            }

            const response = await postData("/admin/blog", formData);
            if (response?.success !== false) {
                message.success(response?.message || "Blog added successfully");
                navigate("/blog");
            } else {
                message.error(response?.message || "Failed to add blog");
            }
        } catch (error) {
            console.error("Failed to add blog:", error);
            message.error(error?.response?.data?.message || "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = ({ fileList: newFileList }) => {
        setFileList(newFileList);
    };

    return (
        <div>
            <Breadcrumb
                items={[
                    { title: "Dashboard" },
                    { title: "Blog", href: "/blog" },
                    { title: "Add Blog" },
                ]}
                style={{ marginBottom: 16 }}
            />

            <Card
                title={
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span>Add New Blog</span>
                        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/blog")}>
                            Back to Blogs
                        </Button>
                    </div>
                }
            >
                <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ status: "active" }}>
                    <Row gutter={16}>
                        <Col xs={24} md={16}>
                            <Card type="inner" title="Basic Information" style={{ marginBottom: 16 }}>
                                <Form.Item name="title" label="Blog Title" rules={[{ required: true, message: "Please enter blog title!" }]}>
                                    <Input placeholder="Enter blog title" />
                                </Form.Item>

                                <Form.Item name="excerpt" label="Excerpt (Short Description)">
                                    <ReactQuill theme="snow" style={{ height: 120, marginBottom: 50 }} placeholder="Write a short excerpt..." />
                                </Form.Item>

                                <Form.Item name="content" label="Content" rules={[{ required: true, message: "Please enter blog content!" }]}>
                                    <ReactQuill theme="snow" style={{ height: 250, marginBottom: 50 }} placeholder="Write the main content..." />
                                </Form.Item>
                            </Card>

                            <Card type="inner" title="SEO Settings">
                                <Form.Item name="meta_title" label="Meta Title">
                                    <Input placeholder="Enter meta title" />
                                </Form.Item>
                                
                                <Form.Item name="meta_keywords" label="Meta Keywords">
                                    <Select mode="tags" placeholder="Type and press enter for tags" />
                                </Form.Item>

                                <Form.Item name="meta_description" label="Meta Description">
                                    <Input.TextArea rows={3} placeholder="Enter meta description" />
                                </Form.Item>
                            </Card>
                        </Col>

                        <Col xs={24} md={8}>
                            <Card type="inner" title="Categorization & Status">
                                <Form.Item name="category_id" label="Category" rules={[{ required: true, message: "Please select a category!" }]}>
                                    <Select placeholder="Select category" options={categories.map((c) => ({ label: c.name, value: c.id }))} />
                                </Form.Item>

                                <Form.Item name="tag_ids" label="Tags">
                                    <Select mode="multiple" placeholder="Select tags" options={tags.map((t) => ({ label: t.name, value: t.id }))}/>
                                </Form.Item>

                                <Form.Item name="status" label="Status" rules={[{ required: true, message: "Please select status!" }]}>
                                    <Select
                                        options={[
                                            { label: "Active", value: "active" },
                                            { label: "Inactive", value: "inactive" },
                                        ]}
                                    />
                                </Form.Item>
                            </Card>

                            <Card type="inner" title="Featured Image" style={{ marginTop: 16 }}>
                                <Form.Item
                                    name="image"
                                >
                                    <Upload
                                        listType="picture-card"
                                        fileList={fileList}
                                        onChange={handleFileChange}
                                        beforeUpload={() => false}
                                        maxCount={1}
                                    >
                                        {fileList.length < 1 && (
                                            <div>
                                                <UploadOutlined />
                                                <div style={{ marginTop: 8 }}>Upload</div>
                                            </div>
                                        )}
                                    </Upload>
                                </Form.Item>
                            </Card>
                            
                            <Button type="primary" htmlType="submit" loading={loading} block size="large" style={{ marginTop: 16 }}>
                                Publish Blog
                            </Button>
                        </Col>
                    </Row>
                </Form>
            </Card>
        </div>
    );
}