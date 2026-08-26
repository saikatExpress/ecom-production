import { ArrowLeftOutlined, DeleteOutlined, ReloadOutlined, UndoOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Button, Card, Input, Modal, Select, Space, Table, Tag, message } from "antd";
import dayjs from 'dayjs';
import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import useTitle from "../../../hooks/useTitle";
import { deleteData, getDatas, patchData } from "../../../services/request";

export default function ManagementTrash() {
    // Hook
    useTitle('Management Trash List');

    // Variable
    const navigate = useNavigate();

    // States
    const [trashData, setTrashData]   = useState([]);
    const [loading, setLoading]       = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 25, total: 0 });
    const [filters, setFilters]       = useState({ search_key: '', status: '' });

    const getManagementTrash = async (page = 1, paginate_size = 25, search_key = filters.search_key, status = filters.status) => {
        try {
            setLoading(true);

            const params = {
                user_category_id: 2,
                page,
                paginate_size
            };
            
            if (search_key) params.search_key = search_key;
            if (status) params.status = status;

            const res = await getDatas('/admin/user/trash', params);

            if (res && res?.success) {
                setTrashData(res?.data?.items || []);
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

    useEffect(() => {
        getManagementTrash(pagination.current, pagination.pageSize, filters.search_key, filters.status);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSearch = (value) => {
        setFilters(prev => ({ ...prev, search_key: value }));
        getManagementTrash(1, pagination.pageSize, value, filters.status);
    };

    const handleStatusChange = (value) => {
        setFilters(prev => ({ ...prev, status: value }));
        getManagementTrash(1, pagination.pageSize, filters.search_key, value);
    };

    const handleTableChange = (newPagination) => {
        getManagementTrash(newPagination.current, newPagination.pageSize, filters.search_key, filters.status);
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
            title: 'Deleted By',
            key: 'deleted_by',
            render: (_, record) => record?.deleted_by?.username || 'N/A',
        },
        {
            title: 'Deleted At',
            dataIndex: 'deleted_at',
            key: 'deleted_at',
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
                    <Button type="primary" icon={<UndoOutlined />} size="small" onClick={() => handleRestore(record.id)}>
                        Restore
                    </Button>
                    <Button danger icon={<DeleteOutlined />} size="small" onClick={() => handlePermanentDelete(record.id)}>
                        Permanent Delete
                    </Button>
                </Space>
            ),
        }
    ];

    const handleRestore = (id) => {
        Modal.confirm({
            title: 'Are you sure you want to restore this user?',
            content: 'This user will be moved back to the active user list.',
            okText: 'Yes, Restore',
            cancelText: 'No',
            onOk: async () => {
                try {
                    const res = await patchData(`/admin/user/${id}/restore`);
                    if (res?.success) {
                        message.success(res?.message || 'Restored successfully');
                        setTrashData(prev => prev.filter(item => item.id !== id));
                        setPagination(prev => ({ ...prev, total: prev.total - 1 }));
                    } else {
                        message.error(res?.message || 'Failed to restore');
                    }
                } catch (error) {
                    console.error(error);
                    message.error('An error occurred while restoring');
                }
            }
        });
    };

    const handlePermanentDelete = (id) => {
        Modal.confirm({
            title: 'Are you sure you want to permanently delete this user?',
            content: 'This action cannot be undone. All data will be lost forever.',
            okText: 'Yes, Delete Permanently',
            okType: 'danger',
            cancelText: 'No',
            onOk: async () => {
                try {
                    const res = await deleteData(`/admin/user/permanent-delete/${id}`);
                    if (res?.success) {
                        message.success(res?.message || 'Deleted permanently');
                        setTrashData(prev => prev.filter(item => item.id !== id));
                        setPagination(prev => ({ ...prev, total: prev.total - 1 }));
                    } else {
                        message.error(res?.message || 'Failed to delete permanently');
                    }
                } catch (error) {
                    console.error(error);
                    message.error('An error occurred while deleting permanently');
                }
            }
        });
    };

    const renderHeader = () => (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: 16 }}>
            <Space wrap>
                <Input.Search placeholder="Search username, phone..." onSearch={handleSearch} allowClear style={{ width: 250 }}/>

                <Select placeholder="Filter by Status" allowClear onChange={handleStatusChange} style={{ width: 150 }} value={filters.status || undefined}
                    options={[{ value: 'active', label: 'Active' },{ value: 'inactive', label: 'Inactive' }]}/>
            </Space>
            <Space wrap>
                <Button icon={<ReloadOutlined />} onClick={() => getManagementTrash(pagination.current, pagination.pageSize, filters.search_key, filters.status)}>
                    Refresh
                </Button>
                <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/management/list')}>
                    Back to List
                </Button>
            </Space>
        </div>
    );
    
    return (
        <Space direction="vertical" size="large" style={{ display: 'flex', width: '100%' }}>
            <Card>
                {renderHeader()}
                <Table
                    columns={columns}
                    dataSource={trashData}
                    rowKey="id"
                    loading={loading}
                    scroll={{ x: 'max-content', y: 'calc(100vh - 300px)' }}
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