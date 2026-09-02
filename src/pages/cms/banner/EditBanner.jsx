import { ArrowLeftOutlined, UploadOutlined } from "@ant-design/icons";
import { Alert, Breadcrumb, Button, Card, Col, Form, Input, message, Row, Select, Spin, Typography, Upload } from "antd";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useTitle from "../../../hooks/useTitle";
import { getDatas, postData } from "../../../services/request";

const { Title } = Typography;

const EditBanner = () => {
    // Hook
    useTitle("Edit Banner");

    // Variable
    const navigate   = useNavigate();
    const { id }     = useParams();
    const [form]     = Form.useForm();
    const deviceType = Form.useWatch('device_type', form);

    // States
    const [loading, setLoading]               = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [fileList, setFileList]             = useState([]);
    const [sections, setSections]             = useState([]);

    useEffect(() => {
        const fetchSections = async () => {
            try {
                const res = await getDatas("/admin/section/list");
                if (res?.success && res?.data) {
                    setSections(res.data);
                }
            } catch (error) {
                console.error("Failed to load sections", error);
                message.error("Failed to load sections");
            }
        };

        const fetchBanner = async () => {
            if (!id) return;
            try {
                const res = await getDatas(`/admin/banner/${id}`);
                if (res?.success && res?.data) {
                    const banner = res.data;
                    form.setFieldsValue({
                        name       : banner.name,
                        section_id : banner.section?.id || banner.section_id,
                        link       : banner.link || "",
                        device_type: banner.device_type,
                        status     : banner.status,
                    });
                    
                    if (banner.image) {
                        setFileList([
                            {
                                uid   : '-1',
                                name  : 'existing-image.jpg',
                                status: 'done',
                                url   : banner.image,
                            }
                        ]);
                    }
                } else {
                    message.error(res?.message || "Failed to load banner data");
                    navigate("/banner");
                }
            } catch (error) {
                console.error("Failed to load banner", error);
                message.error("Failed to load banner data.");
                navigate("/banner");
            } finally {
                setInitialLoading(false);
            }
        };

        fetchSections();
        fetchBanner();
    }, [id, form, navigate]);

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("_method", "PUT");
            formData.append("name", values.name);
            formData.append("section_id", values.section_id);
            if (values.link) formData.append("link", values.link);
            formData.append("device_type", values.device_type);
            formData.append("status", values.status);

            if (fileList.length > 0 && fileList[0].originFileObj) {
                formData.append("image", fileList[0].originFileObj);
            }

            const response = await postData(`/admin/banner/${id}`, formData);
            if (response?.success !== false) {
                message.success(response?.message || "Banner updated successfully");
                navigate("/banner");
            } else {
                message.error(response?.message || "Failed to update banner");
            }
        } catch (error) {
            console.error("Failed to update banner:", error);
            message.error(error?.response?.data?.message || "An error occurred");
        } finally {
            setLoading(false);
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

    const getDeviceHint = () => {
        switch (deviceType) {
            case 'desktop':
                return "Recommended size for Desktop: 1920x800 px (Width x Height)";
            case 'tablet':
                return "Recommended size for Tablet: 768x500 px (Width x Height)";
            case 'mobile':
                return "Recommended size for Mobile: 480x600 px (Width x Height)";
            default:
                return "Select a device type to see recommended dimensions.";
        }
    };

    if (initialLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div>
            <Breadcrumb
                items={[
                    { title: "CMS" },
                    { title: "Banner" },
                    { title: "Edit Banner" },
                ]}
                style={{ marginBottom: 16 }}
            />

            <Card
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}/>
                        <Title level={4} style={{ margin: 0 }}>Edit Banner</Title>
                    </div>
                }
            >
                <Form form={form} layout="vertical" onFinish={onFinish}>
                    <Row gutter={24}>
                        <Col span={24} md={16}>
                            <Card type="inner" title="Basic Information">
                                <Form.Item label="Name" name="name" rules={[{ required: true, message: "Please enter banner name" }]}>
                                    <Input placeholder="Enter banner name (e.g. Summer Sale)" />
                                </Form.Item>

                                <Form.Item label="Section" name="section_id" rules={[{ required: true, message: "Please select a section" }]}>
                                    <Select placeholder="Select a Section">
                                        {sections.map((section) => (
                                            <Select.Option key={section.id} value={section.id}>
                                                {section.name}
                                            </Select.Option>
                                        ))}
                                    </Select>
                                </Form.Item>

                                <Form.Item label="Link URL" name="link">
                                    <Input placeholder="Enter redirect link (optional)" />
                                </Form.Item>

                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item label="Device Type" name="device_type" rules={[{ required: true, message: "Please select device type" }]}>
                                            <Select>
                                                <Select.Option value="desktop">Desktop</Select.Option>
                                                <Select.Option value="tablet">Tablet</Select.Option>
                                                <Select.Option value="mobile">Mobile</Select.Option>
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item label="Status" name="status" rules={[{ required: true, message: "Please select status" }]}>
                                            <Select>
                                                <Select.Option value="active">Active</Select.Option>
                                                <Select.Option value="inactive">Inactive</Select.Option>
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Card>
                        </Col>

                        <Col span={24} md={8}>
                            <Card type="inner" title="Banner Image">
                                <Alert 
                                    message="Image Dimensions" 
                                    description={getDeviceHint()} 
                                    type="info" 
                                    showIcon 
                                    style={{ marginBottom: 16 }}
                                />
                                
                                <Form.Item label="Upload Image (Leave empty to keep existing)">
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
                            </Card>
                        </Col>
                    </Row>

                    <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                        <Button onClick={() => navigate(-1)}>
                            Cancel
                        </Button>
                        <Button type="primary" htmlType="submit" loading={loading}>
                            Update Banner
                        </Button>
                    </div>
                </Form>
            </Card>
        </div>
    );
};

export default EditBanner;