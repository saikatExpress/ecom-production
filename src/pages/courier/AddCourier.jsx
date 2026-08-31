import { ArrowLeftOutlined, UploadOutlined } from "@ant-design/icons";
import { Breadcrumb, Button, Card, Col, Form, Input, message, Row, Select, Typography, Upload } from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useTitle from "../../hooks/useTitle";
import { postData } from "../../services/request";

const { Title } = Typography;

const AddCourier = () => {
    // Hook
    useTitle("Add Courier");

    // Variable
    const navigate = useNavigate();
    const [form]   = Form.useForm();

    // States
    const [loading, setLoading] = useState(false);
    const [fileList, setFileList] = useState([]);

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("name", values.name);
            formData.append("status", values.status);

            if (fileList.length > 0 && fileList[0].originFileObj) {
                formData.append("image", fileList[0].originFileObj);
            }

            const response = await postData("/admin/courier", formData);
            if (response?.success !== false) {
                message.success(response?.message || "Courier added successfully");
                navigate("/courier");
            } else {
                message.error(response?.message || "Failed to add courier");
            }
        } catch (error) {
            console.error("Failed to add courier:", error);
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

    return (
        <div>
            <Breadcrumb
                items={[
                    { title: "Dashboard" },
                    { title: "Courier" },
                    { title: "Add Courier" },
                ]}
                style={{ marginBottom: 16 }}
            />

            <Card
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}/>
                        <Title level={4} style={{ margin: 0 }}>Add New Courier</Title>
                    </div>
                }
            >
                <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{status: "active"}}>
                    <Row gutter={24}>
                        <Col span={24} md={16}>
                            <Card type="inner" title="Basic Information">
                                <Form.Item label="Courier Name" name="name" rules={[{ required: true, message: "Please enter courier name" }]}>
                                    <Input placeholder="Enter courier name (e.g. Pathao)" />
                                </Form.Item>

                                <Form.Item label="Status" name="status" rules={[{ required: true, message: "Please select status" }]}>
                                    <Select>
                                        <Select.Option value="active">Active</Select.Option>
                                        <Select.Option value="inactive">Inactive</Select.Option>
                                    </Select>
                                </Form.Item>
                            </Card>
                        </Col>

                        <Col span={24} md={8}>
                            <Card type="inner" title="Courier Logo / Image">
                                <Form.Item label="Upload Logo (Optional)">
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
                            Save Courier
                        </Button>
                    </div>
                </Form>
            </Card>
        </div>
    );
};

export default AddCourier;