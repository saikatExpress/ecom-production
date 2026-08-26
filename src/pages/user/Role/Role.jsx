import { CheckCircleOutlined, CloseCircleOutlined, DeleteOutlined, EditOutlined, ExclamationCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Card, Collapse, Modal, Space, Spin, Table, Tabs, Tag, Typography, message } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useTitle from "../../../hooks/useTitle";
import { deleteData, getDatas } from "../../../services/request";

const { Title, Text } = Typography;
const { confirm } = Modal;

const Role = () => {
    // Hook
    useTitle("Roles & Permissions");

    // Variable
    const navigate = useNavigate();

    // State
    const [roles, setRoles]                   = useState([]);
    const [allPermissions, setAllPermissions] = useState([]);
    const [loading, setLoading]               = useState(false);
    const [activeTab, setActiveTab]           = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            const [rolesRes, permissionsRes] = await Promise.all([
                getDatas("/admin/role"),
                getDatas("/admin/permission")
            ]);
            
            if (rolesRes?.success) {
                setRoles(rolesRes.data || []);
                // Set the first tab as active initially
                if (rolesRes.data?.length > 0 && !activeTab) {
                    setActiveTab(rolesRes.data[0].id.toString());
                }
            }
            if (permissionsRes?.success) {
                setAllPermissions(permissionsRes.data || []);
            }
        } catch (error) {
            console.error(error);
            message.error("Failed to fetch data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleDelete = (role) => {
        confirm({
            title: `Are you sure you want to delete the role "${role.display_name}"?`,
            icon: <ExclamationCircleOutlined />,
            content: 'This action cannot be undone.',
            okText: 'Yes, Delete',
            okType: 'danger',
            cancelText: 'No',
            onOk: async () => {
                try {
                    const res = await deleteData(`/admin/role/${role.id}`);
                    if (res?.success) {
                        message.success(res?.message || "Role deleted successfully");
                        fetchData();
                    } else {
                        message.error(res?.message || "Failed to delete role");
                    }
                } catch (error) {
                    console.error(error);
                    message.error(error?.response?.data?.message || "An error occurred while deleting");
                }
            }
        });
    };

    const renderRolePermissions = (role) => {
        // Get an array of permission IDs that this role has
        const rolePermissionIds = role.permissions?.map(p => p.id) || [];

        const columns = 
        [
            {
                title: 'Resource',
                dataIndex: 'resource',
                key: 'resource',
                width: '25%',
                render: (text) => (
                    <Text strong style={{ textTransform: 'capitalize' }}>
                        {text.replace(/_/g, ' ')}
                    </Text>
                )
            },
            {
                title: 'Assigned Permissions',
                dataIndex: 'permissions',
                key: 'permissions',
                render: (perms) => (
                    <Space wrap size={[8, 8]}>
                        {perms.map(perm => {
                            const isAssigned = rolePermissionIds.includes(perm.id);
                            return (
                                <Tag 
                                    key={perm.id} 
                                    color={isAssigned ? 'green' : 'default'}
                                    style={{ 
                                        padding: '4px 8px', 
                                        borderRadius: '4px', 
                                        borderStyle: isAssigned ? 'solid' : 'dashed',
                                        opacity: isAssigned ? 1 : 0.6
                                    }}
                                >
                                    {isAssigned ? <CheckCircleOutlined style={{ marginRight: 4 }} /> : <CloseCircleOutlined style={{ marginRight: 4 }} />}
                                    {perm.display_name}
                                </Tag>
                            );
                        })}
                    </Space>
                )
            }
        ];

        return (
            <div style={{ padding: '0 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid #f0f0f0' }}>
                    <div>
                        <Title level={4} style={{ margin: 0, color: '#1890ff' }}>{role.display_name}</Title>
                        <Text type="secondary" style={{ fontSize: '14px' }}>
                            {role.description || 'No description provided for this role.'}
                        </Text>
                        <div style={{ marginTop: 8 }}>
                            <Tag color="blue">{role.permissions?.length || 0} Permissions Granted</Tag>
                        </div>
                    </div>
                    <Space>
                        <Button type="primary" icon={<EditOutlined />} onClick={() => navigate(`/role/edit/${role.id}`)}>
                            Edit Role
                        </Button>
                        <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(role)}>
                            Delete Role
                        </Button>
                    </Space>
                </div>
                
                <Collapse defaultActiveKey={allPermissions.map(m => m.module)} ghost expandIconPosition="end">
                    {allPermissions.map((moduleGroup) => (
                        <Collapse.Panel 
                            key={moduleGroup.module} 
                            header={
                                <Title level={5} style={{ margin: 0, textTransform: 'capitalize', color: '#595959' }}>
                                    {moduleGroup.module.replace(/_/g, ' ')} Module
                                </Title>
                            }
                            style={{ marginBottom: 16, background: '#fafafa', borderRadius: '8px', border: '1px solid #f0f0f0' }}
                        >
                            <Table 
                                columns={columns} 
                                dataSource={moduleGroup.resources} 
                                rowKey="resource"
                                pagination={false}
                                bordered
                                size="small"
                                style={{ background: '#fff' }}
                            />
                        </Collapse.Panel>
                    ))}
                </Collapse>
            </div>
        );
    };

    return (
        <Card 
            title={<Title level={4} style={{ margin: 0 }}>Role Management</Title>} 
            bordered={false}
            extra={
                <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/role/create')}>
                    Add Role
                </Button>
            }
        >
            {loading ? (
                <div style={{ textAlign: 'center', padding: '100px 0' }}>
                    <Spin size="large" />
                </div>
            ) : (
                <Tabs 
                    tabPosition="left"
                    activeKey={activeTab} 
                    onChange={setActiveTab}
                    items={roles.map(role => ({
                        key: role.id.toString(),
                        label: role.display_name,
                        children: renderRolePermissions(role)
                    }))}
                />
            )}
        </Card>
    );
};

export default Role;