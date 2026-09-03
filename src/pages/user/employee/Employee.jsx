import { CheckCircleOutlined, DeleteOutlined, DesktopOutlined, EditOutlined, HistoryOutlined, MobileOutlined, PlusOutlined, ReloadOutlined, StopOutlined, UserOutlined, WarningOutlined } from '@ant-design/icons';
import { Avatar, Button, Card, Col, Input, message, Modal, Row, Select, Space, Spin, Statistic, Table, Tag, Tooltip, Typography } from "antd";
import dayjs from 'dayjs';
import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import usePermissions from '../../../hooks/usePermissions';
import useTitle from "../../../hooks/useTitle";
import { deleteData, getData, getDatas } from "../../../services/request";

export default function Employee() {
    // Hook
    useTitle('Employee List');

    // Variable
    const navigate = useNavigate();
    const {hasPermission} = usePermissions();

    // States
    const [employee, setEmployee]           = useState([]);
    const [loading, setLoading]             = useState(false);
    const [pagination, setPagination]       = useState({current: 1,pageSize: 25,total: 0});
    const [filters, setFilters]             = useState({search_key: '',status: 'active'});
    const [activeCount, setActiveCount]     = useState(0);
    const [inactiveCount, setInactiveCount] = useState(0);
    const [historyModalVisible, setHistoryModalVisible] = useState(false);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    const handleShowHistory = async (record) => {
        setHistoryModalVisible(true);
        setHistoryLoading(true);
        setSelectedUser(null);
        try {
            const res = await getData(`/admin/user/${record.id}`);
            if (res?.success) {
                setSelectedUser(res.data);
            } else {
                message.error(res?.message || 'Failed to fetch user history');
                setHistoryModalVisible(false);
            }
        } catch (error) {
            console.error(error);
            message.error('An error occurred while fetching history');
            setHistoryModalVisible(false);
        } finally {
            setHistoryLoading(false);
        }
    };

    const getEmployee = async (page = 1, paginate_size = 25, search_key = filters.search_key, status = filters.status) => {
        try {
            setLoading(true);

            const params = {
                user_category_id: 3,
                page,
                paginate_size
            };
            
            if (search_key) params.search_key = search_key;
            if (status) params.status = status;

            const res = await getDatas('/admin/user', params);

            if(res && res?.success){
                setEmployee(res?.data?.items || []);
                setPagination({
                    current: res?.data?.pagination?.current_page || page,
                    pageSize: res?.data?.pagination?.per_page || paginate_size,
                    total: res?.data?.pagination?.total || 0,
                });
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    const fetchCounts = async () => {
        try {
            const [activeRes, inactiveRes] = await Promise.all([
                getDatas('/admin/user', { user_category_id: 3, status: 'active', paginate_size: 1, page: 1 }),
                getDatas('/admin/user', { user_category_id: 3, status: 'inactive', paginate_size: 1, page: 1 })
            ]);
            
            if (activeRes?.success) setActiveCount(activeRes?.data?.pagination?.total || 0);
            if (inactiveRes?.success) setInactiveCount(inactiveRes?.data?.pagination?.total || 0);
        } catch (error) {
            console.error("Error fetching counts", error);
        }
    };

    useEffect(() => {
        getEmployee(pagination.current, pagination.pageSize, filters.search_key, filters.status);
        fetchCounts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSearch = (value) => {
        setFilters(prev => ({ ...prev, search_key: value }));
        getEmployee(1, pagination.pageSize, value, filters.status);
    };

    const handleStatusChange = (value) => {
        setFilters(prev => ({ ...prev, status: value }));
        getEmployee(1, pagination.pageSize, filters.search_key, value);
    };

    const handleTableChange = (newPagination) => {
        getEmployee(newPagination.current, newPagination.pageSize, filters.search_key, filters.status);
    };

    const handleDelete = (record) => {
        Modal.confirm({
            title: 'Are you sure you want to delete this user?',
            content: 'This action cannot be undone.',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk: async () => {
                try {
                    const res = await deleteData(`/admin/user/${record.id}`);
                    if (res?.success) {
                        message.success(res?.message || 'Deleted successfully');
                        setEmployee(prev => prev.filter(item => item.id !== record.id));
                        setPagination(prev => ({ ...prev, total: prev.total - 1 }));
                        
                        if (record.status === 'active') {
                            setActiveCount(prev => prev - 1);
                        } else if (record.status === 'inactive') {
                            setInactiveCount(prev => prev - 1);
                        }
                    } else {
                        message.error(res?.message || 'Failed to delete');
                    }
                } catch (error) {
                    console.error(error);
                    message.error('An error occurred while deleting');
                }
            }
        });
    };

    const columns = 
    [
        {
            title: 'SL',
            key: 'sl',
            render: (_, __, index) => (pagination.current - 1) * pagination.pageSize + index + 1,
        },
        {
            title: 'Image',
            dataIndex: 'image',
            key: 'image',
            render: (image, record) => (
                <Avatar 
                    src={image ? image : `https://ui-avatars.com/api/?name=${encodeURIComponent(record.username)}&background=random`}
                    icon={!image ? <UserOutlined /> : null}
                    size="large"
                />
            )
        },
        {
            title: 'Username',
            dataIndex: 'username',
            key: 'username',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Phone Number',
            dataIndex: 'phone_number',
            key: 'phone_number',
        },
        {
            title: 'Category',
            key: 'category',
            render: (_, record) => record?.user_category?.name,
        },
        {
            title: 'Role',
            key: 'roles',
            render: (_, record) => (
                record?.roles?.map(role => role.display_name).join(', ')
            ),
        },
        {
            title : 'Last Login',
            dataIndex : 'last_login_at',
            key : 'last_login_at',
            render: (value) => value ? dayjs(value).format('DD MMMM, YY, hh:mm A') : 'N/A',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={status === 'active' ? 'green' : 'red'}>
                    {status?.toUpperCase()}
                </Tag>
            ),
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button icon={<HistoryOutlined />} size="small" onClick={() => handleShowHistory(record)}>
                        History
                    </Button>
                    {hasPermission('user_update') && (
                        <Button type="primary" icon={<EditOutlined />} size="small" onClick={() => navigate(`/edit/employee/${record.id}`)}>
                            Edit
                        </Button>
                    )}
                    {hasPermission('user_delete') && (
                        <Button danger icon={<DeleteOutlined />} size="small" onClick={() => handleDelete(record)}>
                            Delete
                        </Button>
                    )}
                </Space>
            ),
        }
    ];

    const historyColumns = 
    [
        {
            title: 'Login Time',
            dataIndex: 'login_at',
            key: 'login_at',
            render: (date) => dayjs(date).format('DD MMM, YYYY hh:mm A'),
            width: 180,
        },
        {
            title: 'IP Address',
            dataIndex: 'ip_address',
            key: 'ip_address',
            render: (ip) => <Tag color="blue">{ip}</Tag>,
            width: 140,
        },
        {
            title: 'System & Browser',
            key: 'system',
            render: (_, record) => (
                <Space direction="vertical" size="small">
                    <Typography.Text>
                        {record.device === 'Mobile' ? <MobileOutlined /> : <DesktopOutlined />} {record.platform} {record.platform_version && `(${record.platform_version})`}
                    </Typography.Text>
                    <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
                        {record.browser}
                    </Typography.Text>
                </Space>
            ),
            width: 200,
        },
        {
            title: 'Status',
            key: 'status',
            render: (_, record) => (
                record.success ? (
                    <Tag icon={<CheckCircleOutlined />} color="success">Success</Tag>
                ) : (
                    <Tooltip title={record.failure_reason}>
                        <Tag icon={<WarningOutlined />} color="error">Failed</Tag>
                    </Tooltip>
                )
            ),
            width: 120,
        },
        {
            title: 'Logout Time',
            dataIndex: 'logout_at',
            key: 'logout_at',
            render: (date) => date ? dayjs(date).format('DD MMM, YYYY hh:mm A') : <Tag color="default">Active</Tag>,
            width: 180,
        },
    ];

    const renderHeader = () => (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: 16 }}>
            <Space wrap>
                <Input.Search placeholder="Search username, phone..." onSearch={handleSearch} allowClear style={{ width: 250 }}/>

                <Select placeholder="Filter by Status" allowClear onChange={handleStatusChange} style={{ width: 150 }} value={filters.status || undefined}
                    options={[{ value: 'active', label: 'Active' },{ value: 'inactive', label: 'Inactive' }]}/>
            </Space>
            <Space wrap>
                <Button icon={<ReloadOutlined />} onClick={() => {
                    getEmployee(pagination.current, pagination.pageSize, filters.search_key, filters.status);
                    fetchCounts();
                }}>
                    Refresh
                </Button>
                
                {hasPermission('user_delete') && (
                    <Button danger icon={<DeleteOutlined />} onClick={() => navigate('/employee/trash')}>
                        Trash
                    </Button>
                )}

                {hasPermission('user_create') && (
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/add/employee')}>
                        Add Employee
                    </Button>
                )}
            </Space>
        </div>
    );
    
    return (
        <Space direction="vertical" size="large" style={{ display: 'flex' }}>
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                    <Card 
                        bordered={false}
                        onClick={() => handleStatusChange(filters.status === 'active' ? '' : 'active')}
                        style={{
                            cursor: 'pointer',
                            background: 'linear-gradient(to right, #ffffff, #f0fdf4)',
                            borderRadius: '12px',
                            borderLeft: '5px solid #52c41a',
                            boxShadow: filters.status === 'active' ? '0 4px 12px rgba(82, 196, 26, 0.4)' : '0 2px 8px rgba(0,0,0,0.08)',
                            transform: filters.status === 'active' ? 'scale(1.02)' : 'scale(1)',
                            transition: 'all 0.3s'
                        }}
                    >
                        <Statistic
                            title={<span style={{ fontSize: '16px', fontWeight: 600, color: '#8c8c8c' }}>Active Employees</span>}
                            value={activeCount}
                            prefix={<CheckCircleOutlined style={{ color: '#52c41a', marginRight: '8px' }} />}
                            valueStyle={{ fontSize: '28px', fontWeight: 'bold', color: '#3f8600' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12}>
                    <Card 
                        bordered={false}
                        onClick={() => handleStatusChange(filters.status === 'inactive' ? '' : 'inactive')}
                        style={{
                            cursor      : 'pointer',
                            background  : 'linear-gradient(to right, #ffffff, #fff1f0)',
                            borderRadius: '12px',
                            borderLeft  : '5px solid #ff4d4f',
                            boxShadow   : filters.status === 'inactive' ? '0 4px 12px rgba(255, 77, 79, 0.4)': '0 2px 8px rgba(0,0,0,0.08)',
                            transform   : filters.status === 'inactive' ? 'scale(1.02)'                      : 'scale(1)',
                            transition  : 'all 0.3s'
                        }}
                    >
                        <Statistic
                            title={<span style={{ fontSize: '16px', fontWeight: 600, color: '#8c8c8c' }}>Inactive Employees</span>}
                            value={inactiveCount}
                            prefix={<StopOutlined style={{ color: '#ff4d4f', marginRight: '8px' }} />}
                            valueStyle={{ fontSize: '28px', fontWeight: 'bold', color: '#cf1322' }}
                        />
                    </Card>
                </Col>
            </Row>

            <Card>
                {renderHeader()}
                <Table
                    columns={columns}
                    dataSource={employee}
                    rowKey="id"
                    loading={loading}
                    scroll={{ x: 'max-content', y: 'calc(100vh - 360px)' }}
                    pagination={{
                        ...pagination,
                        showSizeChanger: true,
                        pageSizeOptions: ['25', '50', '100', '150', '200', '250', '300', '350', '400'],
                        responsive: true,
                    }}
                    onChange={handleTableChange}
                />
            </Card>

            <Modal
                title={
                    <Space>
                        <HistoryOutlined style={{ color: '#1890ff' }} />
                        <Typography.Text strong style={{ fontSize: '18px' }}>User Login History</Typography.Text>
                    </Space>
                }
                open={historyModalVisible}
                onCancel={() => setHistoryModalVisible(false)}
                footer={null}
                width={1000}
                centered
                destroyOnClose
            >
                {historyLoading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
                        <Spin size="large" tip="Loading history..." />
                    </div>
                ) : selectedUser ? (
                    <Space direction="vertical" size="large" style={{ width: '100%', marginTop: '16px' }}>
                        <Card bordered={false} style={{ background: '#f8fafc', borderRadius: '12px' }}>
                            <Row gutter={[24, 24]} align="middle">
                                <Col>
                                    <Avatar
                                        src={selectedUser.image ? selectedUser.image : `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedUser.username)}&background=random`}
                                        size={80}
                                        icon={!selectedUser.image && <UserOutlined />}
                                    />
                                </Col>
                                <Col flex="auto">
                                    <Typography.Title level={4} style={{ margin: 0 }}>
                                        {selectedUser.username}
                                    </Typography.Title>
                                    <Space wrap size="middle" style={{ marginTop: '8px' }}>
                                        <Typography.Text type="secondary">{selectedUser.email}</Typography.Text>
                                        <Typography.Text type="secondary">{selectedUser.phone_number}</Typography.Text>
                                        <Tag color={selectedUser.status === 'active' ? 'green' : 'red'}>
                                            {selectedUser.status?.toUpperCase()}
                                        </Tag>
                                    </Space>
                                </Col>
                            </Row>
                        </Card>

                        <Typography.Title level={5}>Authentication Logs</Typography.Title>
                        <Table 
                            columns={historyColumns} 
                            dataSource={selectedUser.loginHistories} 
                            rowKey="id"
                            pagination={{ pageSize: 10 }}
                            scroll={{ y: 400 }}
                            size="middle"
                            bordered={false}
                        />
                    </Space>
                ) : (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
                        <Typography.Text type="secondary">No history found</Typography.Text>
                    </div>
                )}
            </Modal>
        </Space>
    );
}