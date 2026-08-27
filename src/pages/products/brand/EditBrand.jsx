import { CloseOutlined, PlusOutlined, SaveOutlined } from '@ant-design/icons';
import { Button, Card, Col, Form, Input, Row, Select, Space, Spin, Upload, message } from "antd";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useTitle from "../../../hooks/useTitle";
import { getData, postData } from "../../../services/request";

const EditBrand = () => {
    // Hook
    useTitle("Edit Brand");

    // Variable
    const { id }   = useParams();
    const navigate = useNavigate();
    const [form]   = Form.useForm();

    // State
    const [loading, setLoading]       = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Fetch Initial Data
    useEffect(() => {
        const fetchBrand = async () => {
            try {
                const res = await getData(`/admin/brand/${id}`);
                if (res?.success) {
                    const brand = res.data;
                    
                    let initialFileList = [];
                    const imageUrl = brand.img_url || brand.img_path || brand.image; 
                    if (imageUrl) {
                        initialFileList = [
                            {
                                uid: '-1',
                                name: 'Existing Image',
                                status: 'done',
                                url: imageUrl,
                            }
                        ];
                    }

                    form.setFieldsValue({
                        name   : brand.name,
                        status : brand.status,
                        image  : initialFileList
                    });
                } else {
                    message.error("Failed to load brand details");
                }
            } catch (error) {
                console.error(error);
                message.error("An error occurred while fetching brand data");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchBrand();
        }
    }, [id, form]);

    const normFile = (e) => {
        if (Array.isArray(e)) {
            return e;
        }
        return e?.fileList;
    };

    const onFinish = async (values) => {
        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('name', values.name);
            formData.append('status', values.status);
            
            formData.append('_method', 'PUT');
            
            if (values.image && values.image.length > 0) {
                if (values.image[0].originFileObj) {
                    formData.append('image', values.image[0].originFileObj);
                }
            }

            const res = await postData(`/admin/brand/${id}`, formData);
            
            if (res?.success) {
                message.success(res?.message || "Brand updated successfully!");
                navigate(-1);
            } else {
                message.error(res?.message || "Failed to update brand");
            }
        } catch (error) {
            console.error(error);
            message.error(error?.response?.data?.message || "An error occurred");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '100px 0' }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <Space direction="vertical" size="large" style={{ display: 'flex', width: '100%' }}>
            <Form form={form} layout="vertical" onFinish={onFinish}>
                <Card 
                    title="Edit Brand" 
                    extra={
                        <Space>
                            <Button icon={<CloseOutlined />} onClick={() => navigate(-1)}>
                                Cancel
                            </Button>
                            <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={submitting}>
                                Update Brand
                            </Button>
                        </Space>
                    }
                    bordered={false}
                >
                    <Row gutter={16}>
                        <Col xs={24} md={12}>
                            <Form.Item name="name" label="Brand Name" rules={[{ required: true, message: 'Please enter brand name' }]}>
                                <Input placeholder="e.g. Samsung" />
                            </Form.Item>
                        </Col>
                        
                        <Col xs={24} md={12}>
                            <Form.Item name="status" label="Status" rules={[{ required: true, message: 'Please select status' }]}>
                                <Select>
                                    <Select.Option value="active">Active</Select.Option>
                                    <Select.Option value="inactive">Inactive</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>

                        <Col xs={24}>
                            <Form.Item name="image" label="Brand Logo / Image" valuePropName="fileList" getValueFromEvent={normFile}
                                extra="Leave unchanged to keep the existing image."
                            >
                                <Upload name="image" listType="picture-card" maxCount={1} beforeUpload={() => false} accept="image/*">
                                    <div>
                                        <PlusOutlined />
                                        <div style={{ marginTop: 8 }}>Upload New</div>
                                    </div>
                                </Upload>
                            </Form.Item>
                        </Col>
                    </Row>
                </Card>
            </Form>
        </Space>
    );
};

export default EditBrand;