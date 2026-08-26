import { CheckCircleOutlined, DeleteOutlined, EditOutlined, PlusOutlined, StopOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Button, Card, Col, Input, Row, Select, Space, Statistic, Table, Tag } from "antd";
import dayjs from 'dayjs';
import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import useTitle from "../../../hooks/useTitle";
import { getDatas } from "../../../services/request";

export default function Management() {
    // Hook
    useTitle('Management List');

    // Variable
    const navigate = useNavigate();

    // States
    const [management, setManagement]       = useState([]);
    const [loading, setLoading]             = useState(false);
    const [pagination, setPagination]       = useState({current: 1,pageSize: 25,total: 0});
    const [filters, setFilters]             = useState({search_key: '',status: ''});
    const [activeCount, setActiveCount]     = useState(0);
    const [inactiveCount, setInactiveCount] = useState(0);

    const getManagement = async (page = 1, paginate_size = 25, search_key = filters.search_key, status = filters.status) => {
        try {
            setLoading(true);

            const params = {
                user_category_id: 2,
                page,
                paginate_size
            };
            
            if (search_key) params.search_key = search_key;
            if (status) params.status = status;

            const res = await getDatas('/admin/user', params);

            if(res && res?.success){
                setManagement(res?.data?.items || []);
                setPagination({
                    current: res?.data?.pagination?.current_page || page,
                    pageSize: res?.data?.pagination?.per_page || paginate_size,
                    total: res?.data?.pagination?.total || 0,
                });
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    const fetchCounts = async () => {
        try {
            const [activeRes, inactiveRes] = await Promise.all([
                getDatas('/admin/user', { user_category_id: 2, status: 'active', paginate_size: 1, page: 1 }),
                getDatas('/admin/user', { user_category_id: 2, status: 'inactive', paginate_size: 1, page: 1 })
            ]);
            
            if (activeRes?.success) setActiveCount(activeRes?.data?.pagination?.total || 0);
            if (inactiveRes?.success) setInactiveCount(inactiveRes?.data?.pagination?.total || 0);
        } catch (error) {
            console.error("Error fetching counts", error);
        }
    };

    useEffect(() => {
        getManagement(pagination.current, pagination.pageSize, filters.search_key, filters.status);
        fetchCounts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSearch = (value) => {
        setFilters(prev => ({ ...prev, search_key: value }));
        getManagement(1, pagination.pageSize, value, filters.status);
    };

    const handleStatusChange = (value) => {
        setFilters(prev => ({ ...prev, status: value }));
        getManagement(1, pagination.pageSize, filters.search_key, value);
    };

    const handleTableChange = (newPagination) => {
        getManagement(newPagination.current, newPagination.pageSize, filters.search_key, filters.status);
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
                    <Button type="primary" icon={<EditOutlined />} size="small" onClick={() => navigate(`/edit/management/${record.id}`)}>
                        Edit
                    </Button>
                    <Button danger icon={<DeleteOutlined />} size="small">
                        Delete
                    </Button>
                </Space>
            ),
        }
    ];

    const renderHeader = () => (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: 16 }}>
            <Space wrap>
                <Input.Search placeholder="Search username, phone..." onSearch={handleSearch} allowClear style={{ width: 250 }}/>

                <Select placeholder="Filter by Status" allowClear onChange={handleStatusChange} style={{ width: 150 }}
                    options={[{ value: 'active', label: 'Active' },{ value: 'inactive', label: 'Inactive' }]}/>
            </Space>
            <Space wrap>
                <Button danger icon={<DeleteOutlined />}>
                    Trash
                </Button>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/add/management')}>
                    Add Admin
                </Button>
            </Space>
        </div>
    );
    
    return (
        <Space direction="vertical" size="large" style={{ display: 'flex' }}>
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                    <Card 
                        bordered={false}
                        style={{
                            background: 'linear-gradient(to right, #ffffff, #f0fdf4)',
                            borderRadius: '12px',
                            borderLeft: '5px solid #52c41a',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                        }}
                    >
                        <Statistic
                            title={<span style={{ fontSize: '16px', fontWeight: 600, color: '#8c8c8c' }}>Active Users</span>}
                            value={activeCount}
                            prefix={<CheckCircleOutlined style={{ color: '#52c41a', marginRight: '8px' }} />}
                            valueStyle={{ fontSize: '28px', fontWeight: 'bold', color: '#3f8600' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12}>
                    <Card 
                        bordered={false}
                        style={{
                            background: 'linear-gradient(to right, #ffffff, #fff1f0)',
                            borderRadius: '12px',
                            borderLeft: '5px solid #ff4d4f',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                        }}
                    >
                        <Statistic
                            title={<span style={{ fontSize: '16px', fontWeight: 600, color: '#8c8c8c' }}>Inactive Users</span>}
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
                    dataSource={management}
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
        </Space>
    );
}
