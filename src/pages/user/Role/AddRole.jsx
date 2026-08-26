import { CloseOutlined, SaveOutlined } from '@ant-design/icons';
import { Button, Card, Checkbox, Col, Collapse, Form, Input, Row, Space, Spin, message } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useTitle from "../../../hooks/useTitle";
import { getDatas, postData } from "../../../services/request";

// Custom Permissions Selector component
const PermissionsSelector = ({ value = [], onChange, permissionsData = [] }) => {

    const handleCheckAll = (perms, checked) => {
        const ids = perms.map(p => p.id);
        if (checked) {
            onChange([...new Set([...value, ...ids])]);
        } else {
            onChange(value.filter(id => !ids.includes(id)));
        }
    };

    const handleSingleCheck = (permId, checked) => {
        if (checked) {
            onChange([...value, permId]);
        } else {
            onChange(value.filter(id => id !== permId));
        }
    };

    return (
        <Collapse defaultActiveKey={permissionsData.map(m => m.module)} ghost expandIconPosition="end" style={{ background: '#fff' }}>
            {permissionsData.map((moduleGroup) => {
                const allModulePerms = moduleGroup.resources.flatMap(res => res.permissions);
                const isModuleAllChecked = allModulePerms.length > 0 && allModulePerms.every(p => value.includes(p.id));
                const isModuleIndeterminate = allModulePerms.some(p => value.includes(p.id)) && !isModuleAllChecked;

                return (
                    <Collapse.Panel 
                        key={moduleGroup.module} 
                        header={
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingRight: 16 }}>
                                <span style={{ fontWeight: 'bold', fontSize: '16px', textTransform: 'capitalize', color: '#1890ff' }}>
                                    {moduleGroup.module.replace(/_/g, ' ')} Module
                                </span>
                                <Checkbox 
                                    onClick={(e) => e.stopPropagation()} 
                                    checked={isModuleAllChecked}
                                    indeterminate={isModuleIndeterminate}
                                    onChange={(e) => handleCheckAll(allModulePerms, e.target.checked)}
                                >
                                    Select All in Module
                                </Checkbox>
                            </div>
                        }
                        style={{ borderBottom: '1px solid #f0f0f0', border: '1px solid #e8e8e8', marginBottom: 16, borderRadius: 8, background: '#fafafa' }}
                    >
                        <Row gutter={[16, 16]}>
                            {moduleGroup.resources.map(res => {
                                const isResAllChecked = res.permissions.length > 0 && res.permissions.every(p => value.includes(p.id));
                                const isResIndeterminate = res.permissions.some(p => value.includes(p.id)) && !isResAllChecked;

                                return (
                                    <Col xs={24} md={12} xl={8} key={res.resource}>
                                        <Card 
                                            size="small"
                                            bordered={true}
                                            style={{ height: '100%', borderColor: isResAllChecked ? '#91d5ff' : '#f0f0f0' }}
                                            headStyle={{ background: isResAllChecked ? '#e6f7ff' : '#fff', borderBottom: '1px solid #f0f0f0' }}
                                            title={
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span style={{ textTransform: 'capitalize', color: '#595959' }}>
                                                        {res.resource.replace(/_/g, ' ')}
                                                    </span>
                                                    <Checkbox 
                                                        checked={isResAllChecked}
                                                        indeterminate={isResIndeterminate}
                                                        onChange={(e) => handleCheckAll(res.permissions, e.target.checked)}
                                                    >
                                                        Check All
                                                    </Checkbox>
                                                </div>
                                            }
                                        >
                                            <Space wrap size={[16, 12]}>
                                                {res.permissions.map(perm => (
                                                    <Checkbox
                                                        key={perm.id}
                                                        checked={value.includes(perm.id)}
                                                        onChange={(e) => handleSingleCheck(perm.id, e.target.checked)}
                                                    >
                                                        {perm.display_name}
                                                    </Checkbox>
                                                ))}
                                            </Space>
                                        </Card>
                                    </Col>
                                );
                            })}
                        </Row>
                    </Collapse.Panel>
                );
            })}
        </Collapse>
    );
};

const AddRole = () => {
    // Hook
    useTitle("Create Role With Permissions");

    // Variable
    const navigate = useNavigate();
    const [form]   = Form.useForm();

    // State
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading]         = useState(true);
    const [submitting, setSubmitting]   = useState(false);

    useEffect(() => {
        const fetchPermissions = async () => {
            try {
                const res = await getDatas("/admin/permission");
                if (res?.success) {
                    setPermissions(res.data || []);
                } else {
                    message.error("Failed to load permissions");
                }
            } catch (error) {
                console.error(error);
                message.error("An error occurred while fetching permissions");
            } finally {
                setLoading(false);
            }
        };

        fetchPermissions();
    }, []);

    const onFinish = async (values) => {
        setSubmitting(true);
        try {
            const payload = {
                name          : values.name,
                display_name  : values.display_name,
                description   : values.description,
                permission_ids: values.permission_ids || []
            };

            const res = await postData("/admin/role", payload);
            
            if (res?.success) {
                message.success(res?.message || "Role created successfully!");
                navigate(-1);
            } else {
                message.error(res?.message || "Failed to create role");
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
                    title="Create New Role" 
                    extra={
                        <Space>
                            <Button icon={<CloseOutlined />} onClick={() => navigate(-1)}>
                                Cancel
                            </Button>
                            <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={submitting}>
                                Save Role
                            </Button>
                        </Space>
                    }
                    bordered={false}
                >
                    <Row gutter={16}>
                        <Col xs={24} md={12}>
                            <Form.Item name="display_name" label="Display Name" rules={[{ required: true, message: 'Please enter a display name (e.g. Manager)' }]}>
                                <Input placeholder="Enter display name" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item name="name" label="System Name" rules={[{ required: true, message: 'Please enter a system name (e.g. manager)' }]} help="Used internally. Should be lowercase without spaces.">
                                <Input placeholder="Enter system name" />
                            </Form.Item>
                        </Col>
                        <Col xs={24}>
                            <Form.Item name="description" label="Description" style={{ marginBottom: 0 }}>
                                <Input.TextArea placeholder="Brief description of the role..." rows={2} />
                            </Form.Item>
                        </Col>
                    </Row>
                </Card>

                <Card title="Assign Permissions" bordered={false} style={{ marginTop: 16 }}>
                    <Form.Item name="permission_ids" style={{ marginBottom: 0 }}>
                        <PermissionsSelector permissionsData={permissions} />
                    </Form.Item>
                </Card>
            </Form>
        </Space>
    );
};

export default AddRole;