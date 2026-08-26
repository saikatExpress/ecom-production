import { ArrowLeftOutlined, SaveOutlined, UploadOutlined } from '@ant-design/icons';
import { Button, Card, Col, Form, Input, message, Row, Select, Space, Upload } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useTitle from "../../../hooks/useTitle";
import { getDatas, postData } from "../../../services/request";

export default function AddEmployee() {
    // Hook
    useTitle('Add Employee');

    // Variable
    const navigate = useNavigate();

    const [form]                          = Form.useForm();
    const [roles, setRoles]               = useState([]);
    const [categories, setCategories]     = useState([]);
    const [loading, setLoading]           = useState(false);
    const [fileList, setFileList]         = useState([]);
    const [previewImage, setPreviewImage] = useState('');

    useEffect(() => {
        fetchDependencies();
    }, []);

    const fetchDependencies = async () => {
        try {
            const [roleRes, catRes] = await Promise.all([
                getDatas('/admin/role/list'),
                getDatas('/admin/user-category/list')
            ]);
            
            if (roleRes?.success) {
                setRoles(roleRes.data || []);
            }
            if (catRes?.success) {
                setCategories(catRes.data || []);
            }
        } catch (error) {
            console.error(error);
            message.error('Failed to load form dependencies');
        }
    };

    const onFinish = async (values) => {
        try {
            setLoading(true);
            const formData = new FormData();
            
            formData.append('user_category_id', values.user_category_id);
            formData.append('username', values.username);
            formData.append('email', values.email);
            formData.append('phone_number', values.phone_number);
            formData.append('password', values.password);
            formData.append('status', values.status);
            
            if (values.role_ids && values.role_ids.length > 0) {
                values.role_ids.forEach(role_id => {
                    formData.append('role_ids[]', role_id);
                });
            }
            
            if (fileList.length > 0 && fileList[0]) {
                formData.append('image', fileList[0]);
            }

            const res = await postData('/admin/user', formData);
            
            if (res?.success) {
                message.success('Employee created successfully!');
                navigate('/employee/list');
            } else {
                message.error(res?.message || 'Failed to create employee');
            }
            
        } catch (error) {
            console.error(error);
            message.error(error?.response?.data?.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const beforeUpload = (file) => {
        setFileList([file]);
        
        const reader = new FileReader();
        reader.onload = (e) => {
            setPreviewImage(e.target.result);
        };
        reader.readAsDataURL(file);
        
        return false;
    };

    const handleRemove = () => {
        setFileList([]);
        setPreviewImage('');
    };

    const uploadProps = {
        onRemove: handleRemove,
        beforeUpload: beforeUpload,
        fileList,
        maxCount: 1,
        accept: "image/*"
    };

    return (
        <Card title="Create Employee" 
            extra={
                <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/employee/list')}>
                    Back to List
                </Button>
            }
            bordered={false}
        >
            <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ status: 'active', user_category_id: 3 }}>
                <Row gutter={16}>
                    <Col xs={24} md={12}>
                        <Form.Item name="username" label="Username" rules={[{ required: true, message: 'Please enter username' }]}>
                            <Input placeholder="Enter username" />
                        </Form.Item>
                    </Col>
                    
                    <Col xs={24} md={12}>
                        <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Please enter email' },{ type: 'email', message: 'Please enter a valid email' }]}>
                            <Input placeholder="Enter email address" />
                        </Form.Item>
                    </Col>
                    
                    <Col xs={24} md={12}>
                        <Form.Item name="phone_number" label="Phone Number" rules={[{ required: true, message: 'Please enter phone number' }]}>
                            <Input placeholder="Enter phone number" />
                        </Form.Item>
                    </Col>
                    
                    <Col xs={24} md={12}>
                        <Form.Item name="password" label="Password" rules={[{ required: true, message: 'Please enter password' }]}>
                            <Input.Password placeholder="Enter password" />
                        </Form.Item>
                    </Col>
                    
                    <Col xs={24} md={12}>
                        <Form.Item name="user_category_id" label="User Category" rules={[{ required: true, message: 'Please select a category' }]}>
                            <Select placeholder="Select category" allowClear>
                                {categories.map(cat => (
                                    <Select.Option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    
                    <Col xs={24} md={12}>
                        <Form.Item name="role_ids" label="Roles" rules={[{ required: true, message: 'Please select at least one role' }]}>
                            <Select mode="multiple" placeholder="Select roles" allowClear>
                                {roles.map(role => (
                                    <Select.Option key={role.id} value={role.id}>
                                        {role.display_name}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    
                    <Col xs={24} md={12}>
                        <Form.Item name="status" label="Status" rules={[{ required: true, message: 'Please select status' }]}>
                            <Select placeholder="Select status">
                                <Select.Option value="active">Active</Select.Option>
                                <Select.Option value="inactive">Inactive</Select.Option>
                            </Select>
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                        <Form.Item label="Profile Image">
                            <Upload {...uploadProps}>
                                <Button icon={<UploadOutlined />}>Select Image</Button>
                            </Upload>
                            {previewImage && (
                                <div style={{ marginTop: 12 }}>
                                    <img src={previewImage} alt="Preview" 
                                        style={{ 
                                            maxWidth    : '120px',
                                            maxHeight   : '120px',
                                            borderRadius: '8px',
                                            border      : '1px solid #d9d9d9',
                                            padding     : '4px',
                                            objectFit   : 'cover'
                                        }} 
                                    />
                                </div>
                            )}
                        </Form.Item>
                    </Col>
                </Row>
                
                <Form.Item style={{ marginTop: 16 }}>
                    <Space>
                        <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
                            Save Employee
                        </Button>
                        <Button htmlType="button" onClick={() => form.resetFields()}>
                            Reset
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
        </Card>
    );
}