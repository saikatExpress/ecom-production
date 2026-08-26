import { ArrowLeftOutlined, SaveOutlined, UploadOutlined } from '@ant-design/icons';
import { Button, Card, Col, Form, Input, message, Row, Select, Space, Spin, Upload } from "antd";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useTitle from "../../../hooks/useTitle";
import { getData, getDatas, postData } from "../../../services/request";

export default function EditManagement() {
    // Hook
    useTitle('Edit Management');

    // Variable
    const { id }   = useParams();
    const navigate = useNavigate();
    const [form]   = Form.useForm();
    
    const [roles, setRoles]                   = useState([]);
    const [categories, setCategories]         = useState([]);
    const [loading, setLoading]               = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [fileList, setFileList]             = useState([]);
    const [previewImage, setPreviewImage]     = useState('');
    const [userData, setUserData]             = useState(null);

    useEffect(() => {
        if (id) {
            fetchInitialData();
        }
    }, [id]);

    const fetchInitialData = async () => {
        try {
            setInitialLoading(true);
            const [roleRes, catRes, userRes] = await Promise.all([
                getDatas('/admin/role/list'),
                getDatas('/admin/user-category/list'),
                getData(`/admin/user/${id}`)
            ]);
            
            if (roleRes?.success) setRoles(roleRes.data || []);
            if (catRes?.success) setCategories(catRes.data || []);
            
            if (userRes?.success) {
                const user = userRes.data;
                setUserData(user);
                
                form.setFieldsValue({
                    username        : user.username,
                    email           : user.email,
                    phone_number    : user.phone_number,
                    status          : user.status,
                    user_category_id: user.user_category?.id,
                    role_ids        : user.roles?.map(r => r.id) || [],
                });
                
                if (user.image) {
                    setPreviewImage(user.image);
                }
            }
        } catch (error) {
            console.error(error);
            message.error('Failed to load user data');
        } finally {
            setInitialLoading(false);
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
            formData.append('status', values.status);
            
            // Laravel override method to PUT for file uploads
            formData.append('_method', 'PUT');
            
            if (values.password) {
                formData.append('password', values.password);
            }
            
            if (values.role_ids && values.role_ids.length > 0) {
                values.role_ids.forEach(role_id => {
                    formData.append('role_ids[]', role_id);
                });
            }
            
            if (fileList.length > 0 && fileList[0]) {
                formData.append('image', fileList[0]);
            }

            const res = await postData(`/admin/user/${id}`, formData);
            
            if (res?.success) {
                message.success('Management user updated successfully!');
                navigate('/management/list');
            } else {
                message.error(res?.message || 'Failed to update user');
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
        if (userData?.image) {
            setPreviewImage(userData.image);
        } else {
            setPreviewImage('');
        }
    };

    const uploadProps = {
        onRemove: handleRemove,
        beforeUpload: beforeUpload,
        fileList,
        maxCount: 1,
        accept: "image/*"
    };

    if (initialLoading) {
        return (
            <Card style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <Spin size="large" />
            </Card>
        );
    }

    return (
        <Card 
            title="Edit Management User" 
            extra={
                <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/managemet/list')}>
                    Back to List
                </Button>
            }
            bordered={false}
        >
            <Form form={form} layout="vertical" onFinish={onFinish}>
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
                        <Form.Item name="password" label="Password" help="Leave blank to keep current password">
                            <Input.Password placeholder="Enter new password" />
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
                        <Form.Item label="Profile Image" help="Upload a new image to replace the current one">
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
                            Update Management
                        </Button>
                        <Button htmlType="button" onClick={() => navigate('/users/list')}>
                            Cancel
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
        </Card>
    );
}