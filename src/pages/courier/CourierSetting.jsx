import { ArrowLeftOutlined, HomeOutlined, PictureOutlined, ReloadOutlined, SettingOutlined } from '@ant-design/icons';
import { Avatar, Breadcrumb, Button, Card, Flex, Image, Switch, Table, Tag, Typography, message } from 'antd';
import { useEffect, useState } from 'react';
import useTitle from './../../hooks/useTitle';
import { getDatas, postData } from './../../services/request';

const { Title } = Typography;

const CourierSetting = () => {
    // Hook
    useTitle("Courier Settings");

    // State
    const [couriers, setCouriers] = useState([]);
    const [loading, setLoading] = useState(false);

    // Fetch data
    const fetchCouriers = async () => {
        setLoading(true);
        try {
            const res = await getDatas("/admin/courier");
            if (res?.success && res?.data?.items) {
                setCouriers(res.data.items);
            } else if (res?.data && Array.isArray(res.data)) {
                setCouriers(res.data);
            } else if (res && Array.isArray(res)) {
                setCouriers(res);
            } else {
                setCouriers([]);
            }
        } catch (error) {
            console.error("Fetch couriers error:", error);
            message.error("Failed to load couriers.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCouriers();
    }, []);

    // Handle Switch
    const handleDefaultChange = async (checked, record) => {
        const is_default = checked ? 1 : 0;
        
        // Optimistic update for UI responsiveness
        setCouriers(prev => prev.map(c => 
            c.id === record.id ? { ...c, is_default } : c
        ));

        try {
            const res = await postData(`/admin/courier-setting/${record.id}/default-update`, { is_default });
            if (res?.success) {
                message.success(res?.message || "Default status updated successfully");
                // Refetch to sync state, in case backend toggled others to false (only 1 default allowed)
                fetchCouriers();
            } else {
                message.error(res?.message || "Failed to update default status");
                fetchCouriers(); // Revert
            }
        } catch (error) {
            console.error("Update default error:", error);
            message.error(error?.response?.data?.message || "An error occurred while updating.");
            fetchCouriers(); // Revert
        }
    };

    const columns = 
    [
        {
            title: 'SL',
            key: 'sl',
            width: 80,
            align: 'center',
            render: (_, __, index) => index + 1,
        },
        {
            title: "Image",
            dataIndex: "image",
            key: "image",
            width: 80,
            render: (image) =>
                image ? (
                    <Image src={image} alt="Courier" width={40} height={40} style={{ objectFit: "contain", borderRadius: 4 }} fallback="https://via.placeholder.com/40" />
                ) : (
                    <Avatar shape="square" icon={<PictureOutlined />} size={40} />
                ),
        },
        {
            title: 'Courier Name',
            dataIndex: 'name',
            key: 'name',
            render: (text) => <strong style={{ color: '#1677ff' }}>{text || 'N/A'}</strong>,
        },
        {
            title: 'Orders Count',
            dataIndex: 'orders_count',
            key: 'orders_count',
            align: 'center',
            width: 120,
            render: (count) => <Tag color="purple">{count ?? 0}</Tag>,
        },
        {
            title: 'Status',
            key: 'status',
            width: 150,
            render: (_, record) => {
                const isActive = record.status === 'active' || record.is_active === 1;
                return (
                    <Tag color={isActive ? 'green' : 'blue'}>
                        {isActive ? 'Active' : (record.status || 'Active')}
                    </Tag>
                );
            }
        },
        {
            title: 'Action (Set Default)',
            key: 'action',
            width: 200,
            align: 'center',
            render: (_, record) => (
                <Switch 
                    checked={record.is_default === 1 || record.is_default === true} 
                    onChange={(checked) => handleDefaultChange(checked, record)}
                    checkedChildren="Yes"
                    unCheckedChildren="No"
                    style={{ backgroundColor: (record.is_default === 1 || record.is_default === true) ? '#52c41a' : undefined }}
                />
            )
        }
    ];

    return (
        <div style={{ padding: '0 0 24px 0' }}>
            <Breadcrumb
                items={[
                    { title: <><HomeOutlined /> Dashboard</> },
                    { title: "Courier" },
                    { title: "Courier Settings" },
                ]}
                style={{ marginBottom: 16 }}
            />

            <Card 
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <SettingOutlined style={{ color: '#1677ff', fontSize: '24px' }} />
                        <Title level={3} style={{ margin: 0 }}>Courier Settings</Title>
                    </div>
                }
                extra={
                    <Flex gap="small">
                        <Button 
                            icon={<ArrowLeftOutlined />} 
                            onClick={() => window.history.back()}
                        >
                            Back
                        </Button>
                        <Button 
                            type="primary" 
                            icon={<ReloadOutlined />} 
                            onClick={fetchCouriers}
                            loading={loading}
                        >
                            Refresh
                        </Button>
                    </Flex>
                }
                style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: 'none' }}
                headStyle={{ borderBottom: '1px solid #f0f0f0', padding: '16px 24px' }}
                bodyStyle={{ padding: '24px' }}
            >
                <Table 
                    columns={columns} 
                    dataSource={couriers} 
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 50, hideOnSinglePage: true }}
                    bordered
                    size="middle"
                    rowClassName={(record) => (record.is_default === 1 || record.is_default === true) ? 'default-courier-row' : ''}
                />
            </Card>
            
            <style>{`
                .default-courier-row {
                    background-color: #f6ffed;
                }
                .default-courier-row:hover > td {
                    background-color: #f6ffed !important;
                }
            `}</style>
        </div>
    );
};

export default CourierSetting;