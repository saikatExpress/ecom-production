import { ArrowUpOutlined, BranchesOutlined, CarOutlined, CheckCircleOutlined, CheckOutlined, ClockCircleOutlined, CloseCircleOutlined, ContainerOutlined, DollarOutlined, DownloadOutlined, FileTextOutlined, InboxOutlined, MoreOutlined, PauseCircleOutlined, PlusCircleOutlined, RetweetOutlined, ShoppingCartOutlined, SyncOutlined, UndoOutlined, WarningOutlined } from '@ant-design/icons';
import { Avatar, Button, Card, Col, List, Progress, Row, Select, Space, Statistic, Table, Tag, Timeline, Typography } from 'antd';
import useTitle from '../../hooks/useTitle';

const { Title, Text } = Typography;

// Demo Data
const recentOrders = [
    { id: '#ORD-7231', customer: 'John Doe', product: 'iPhone 15 Pro Max', amount: 1199.00, status: 'Processing', date: 'Today, 10:45 AM' },
    { id: '#ORD-7230', customer: 'Jane Smith', product: 'MacBook Air M2', amount: 1099.00, status: 'Shipped', date: 'Today, 09:12 AM' },
    { id: '#ORD-7229', customer: 'Michael Johnson', product: 'Sony WH-1000XM5', amount: 348.00, status: 'Delivered', date: 'Yesterday' },
    { id: '#ORD-7228', customer: 'Emily Davis', product: 'Apple Watch Series 9', amount: 399.00, status: 'Pending', date: 'Yesterday' },
    { id: '#ORD-7227', customer: 'Robert Wilson', product: 'iPad Pro 11"', amount: 799.00, status: 'Cancelled', date: 'Aug 28, 2026' },
];

const topProducts = [
    { id: 1, name: 'iPhone 15 Pro Max', sales: 124, revenue: '148,676', image: 'https://ui-avatars.com/api/?name=iP&background=1677ff&color=fff' },
    { id: 2, name: 'MacBook Pro 14"', sales: 98, revenue: '195,902', image: 'https://ui-avatars.com/api/?name=MB&background=52c41a&color=fff' },
    { id: 3, name: 'Sony WH-1000XM5', sales: 210, revenue: '73,080', image: 'https://ui-avatars.com/api/?name=So&background=faad14&color=fff' },
    { id: 4, name: 'Apple Watch Series 9', sales: 145, revenue: '57,855', image: 'https://ui-avatars.com/api/?name=AW&background=eb2f96&color=fff' },
    { id: 5, name: 'Samsung Galaxy S24', sales: 85, revenue: '84,915', image: 'https://ui-avatars.com/api/?name=SG&background=722ed1&color=fff' },
];

const orderStatuses = [
    { id: 1, name: "New Order", bg_color: "#ddb063", text_color: "#ffffff", icon: <PlusCircleOutlined />, count: 145, amount: 25000 },
    { id: 2, name: "Approved", bg_color: "#06d14a", text_color: "#ffffff", icon: <CheckCircleOutlined />, count: 98, amount: 18000 },
    { id: 3, name: "Invoiced", bg_color: "#CDDC39", text_color: "#ffffff", icon: <FileTextOutlined />, count: 45, amount: 8000 },
    { id: 4, name: "In Courier", bg_color: "#673AB7", text_color: "#ffffff", icon: <CarOutlined />, count: 120, amount: 22000 },
    { id: 5, name: "On Hold", bg_color: "#C98209", text_color: "#ffffff", icon: <PauseCircleOutlined />, count: 12, amount: 1500 },
    { id: 6, name: "Stock Pending", bg_color: "#673AB7", text_color: "#ffffff", icon: <InboxOutlined />, count: 34, amount: 6000 },
    { id: 7, name: "Delivered", bg_color: "#4CAF50", text_color: "#ffffff", icon: <CheckOutlined />, count: 850, amount: 150000 },
    { id: 8, name: "Canceled", bg_color: "#F44336", text_color: "#ffffff", icon: <CloseCircleOutlined />, count: 23, amount: 4500 },
    { id: 9, name: "Pending Returned", bg_color: "#9C27B0", text_color: "#ffffff", icon: <UndoOutlined />, count: 8, amount: 1200 },
    { id: 10, name: "Returned", bg_color: "#9C27B0", text_color: "#ffffff", icon: <RetweetOutlined />, count: 15, amount: 2500 },
    { id: 11, name: "Damaged", bg_color: "#9C27B0", text_color: "#ffffff", icon: <WarningOutlined />, count: 4, amount: 800 },
    { id: 12, name: "Partial Returned", bg_color: "#9C27B0", text_color: "#ffffff", icon: <BranchesOutlined />, count: 6, amount: 900 },
    { id: 13, name: "Courier Pending", bg_color: "#b07027", text_color: "#ffffff", icon: <ClockCircleOutlined />, count: 55, amount: 11000 },
    { id: 14, name: "Courier Received", bg_color: "#b07027", text_color: "#ffffff", icon: <ContainerOutlined />, count: 40, amount: 9000 },
];

export default function Dashboard() {
    useTitle('Dashboard - Store Overview');

    const columns = [
        {
            title: 'Order ID',
            dataIndex: 'id',
            key: 'id',
            render: (text) => <Text strong>{text}</Text>,
        },
        {
            title: 'Customer',
            dataIndex: 'customer',
            key: 'customer',
        },
        {
            title: 'Product',
            dataIndex: 'product',
            key: 'product',
        },
        {
            title: 'Amount',
            dataIndex: 'amount',
            key: 'amount',
            render: (amount) => `৳${amount.toFixed(2)}`,
        },
        {
            title: 'Status',
            key: 'status',
            dataIndex: 'status',
            render: (status) => {
                let color = 'default';
                let icon = null;
                if (status === 'Delivered') { color = 'success'; icon = <CheckCircleOutlined />; }
                if (status === 'Processing') { color = 'processing'; icon = <SyncOutlined spin />; }
                if (status === 'Shipped') { color = 'geekblue'; icon = <ArrowUpOutlined />; }
                if (status === 'Pending') { color = 'warning'; icon = <ClockCircleOutlined />; }
                if (status === 'Cancelled') { color = 'error'; icon = <CloseCircleOutlined />; }
                return <Tag color={color} icon={icon}>{status}</Tag>;
            },
        },
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
        },
    ];

    return (
        <Space direction="vertical" size="large" style={{ display: 'flex', width: '100%' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <Title level={2} style={{ margin: 0, fontWeight: 700 }}>Dashboard Overview</Title>
                    <Text type="secondary">Welcome back! Here is what's happening with your store today.</Text>
                </div>
                <Button type="primary" size="large" icon={<DownloadOutlined />}>
                    Download Report
                </Button>
            </div>

            {/* Top Cards */}
            <Row gutter={[16, 16]}>
                {/* Total Orders Card */}
                <Col xs={24} lg={8}>
                    <Card 
                        title={
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <div style={{ backgroundColor: '#f6ffed', padding: '8px', borderRadius: '50%', marginRight: '12px' }}>
                                    <ShoppingCartOutlined style={{ fontSize: '18px', color: '#52c41a' }} />
                                </div>
                                <Text strong style={{ fontSize: '16px' }}>Total Orders</Text>
                            </div>
                        } 
                        bordered={false} 
                        style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
                    >
                        <Row gutter={[16, 24]}>
                            <Col span={12}>
                                <Statistic title={<Text type="secondary">Today</Text>} value={145} valueStyle={{ fontWeight: 600, fontSize: '20px' }} />
                            </Col>
                            <Col span={12}>
                                <Statistic title={<Text type="secondary">This Month</Text>} value={3420} valueStyle={{ fontWeight: 600, fontSize: '20px' }} />
                            </Col>
                            <Col span={12}>
                                <Statistic title={<Text type="secondary">This Year</Text>} value={41520} valueStyle={{ fontWeight: 600, fontSize: '20px' }} />
                            </Col>
                            <Col span={12}>
                                <Statistic title={<Text type="secondary">All Time</Text>} value={124500} valueStyle={{ fontWeight: 600, fontSize: '20px' }} />
                            </Col>
                        </Row>
                    </Card>
                </Col>

                {/* Total Sales Card */}
                <Col xs={24} lg={8}>
                    <Card 
                        title={
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <div style={{ backgroundColor: '#e6f4ff', padding: '8px', borderRadius: '50%', marginRight: '12px' }}>
                                    <DollarOutlined style={{ fontSize: '18px', color: '#1677ff' }} />
                                </div>
                                <Text strong style={{ fontSize: '16px' }}>Total Sales</Text>
                            </div>
                        } 
                        bordered={false} 
                        style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
                    >
                        <Row gutter={[16, 24]}>
                            <Col span={12}>
                                <Statistic title={<Text type="secondary">Today</Text>} value={4250.50} prefix="৳" precision={2} valueStyle={{ fontWeight: 600, fontSize: '20px' }} />
                            </Col>
                            <Col span={12}>
                                <Statistic title={<Text type="secondary">This Month</Text>} value={124500.00} prefix="৳" precision={2} valueStyle={{ fontWeight: 600, fontSize: '20px' }} />
                            </Col>
                            <Col span={12}>
                                <Statistic title={<Text type="secondary">This Year</Text>} value={1452000.00} prefix="৳" precision={2} valueStyle={{ fontWeight: 600, fontSize: '20px' }} />
                            </Col>
                            <Col span={12}>
                                <Statistic title={<Text type="secondary">All Time</Text>} value={4245500.00} prefix="৳" precision={2} valueStyle={{ fontWeight: 600, fontSize: '20px' }} />
                            </Col>
                        </Row>
                    </Card>
                </Col>

                {/* Total Incomplete Card */}
                <Col xs={24} lg={8}>
                    <Card 
                        title={
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <div style={{ backgroundColor: '#fff1f0', padding: '8px', borderRadius: '50%', marginRight: '12px' }}>
                                    <CloseCircleOutlined style={{ fontSize: '18px', color: '#f5222d' }} />
                                </div>
                                <Text strong style={{ fontSize: '16px' }}>Total Incomplete</Text>
                            </div>
                        } 
                        bordered={false} 
                        style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
                    >
                        <Row gutter={[16, 24]}>
                            <Col span={12}>
                                <Statistic title={<Text type="secondary">Today</Text>} value={320.00} prefix="৳" precision={2} valueStyle={{ color: '#f5222d', fontWeight: 600, fontSize: '20px' }} />
                            </Col>
                            <Col span={12}>
                                <Statistic title={<Text type="secondary">This Month</Text>} value={4150.00} prefix="৳" precision={2} valueStyle={{ color: '#f5222d', fontWeight: 600, fontSize: '20px' }} />
                            </Col>
                            <Col span={12}>
                                <Statistic title={<Text type="secondary">This Year</Text>} value={24500.00} prefix="৳" precision={2} valueStyle={{ color: '#f5222d', fontWeight: 600, fontSize: '20px' }} />
                            </Col>
                            <Col span={12}>
                                <Statistic title={<Text type="secondary">All Time</Text>} value={82400.00} prefix="৳" precision={2} valueStyle={{ color: '#f5222d', fontWeight: 600, fontSize: '20px' }} />
                            </Col>
                        </Row>
                    </Card>
                </Col>
            </Row>

            {/* Order Status Breakdown */}
            <Card 
                title={<Title level={5} style={{ margin: 0 }}>Order Status Breakdown</Title>}
                bordered={false} 
                style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
                extra={
                    <Select defaultValue="this_month" style={{ width: 130 }}>
                        <Select.Option value="today">Today</Select.Option>
                        <Select.Option value="yesterday">Yesterday</Select.Option>
                        <Select.Option value="this_week">This Week</Select.Option>
                        <Select.Option value="this_month">This Month</Select.Option>
                        <Select.Option value="this_year">This Year</Select.Option>
                        <Select.Option value="custom">Custom</Select.Option>
                    </Select>
                }
            >
                <Row gutter={[16, 16]}>
                    {orderStatuses.map(status => (
                        <Col xs={12} sm={8} md={6} lg={4} xl={4} key={status.id}>
                            <div style={{
                                backgroundColor: status.bg_color,
                                padding: '16px 8px',
                                borderRadius: '8px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                textAlign: 'center',
                                height: '100%',
                                minHeight: '130px',
                                boxShadow: 'inset 0 -3px 0 rgba(0,0,0,0.1)'
                            }}>
                                <div style={{ fontSize: '28px', marginBottom: '8px', color: status.text_color }}>
                                    {status.icon}
                                </div>
                                <Text style={{ color: status.text_color, fontWeight: 600, fontSize: '13px', marginBottom: '4px', lineHeight: 1.2 }}>
                                    {status.name}
                                </Text>
                                <Text style={{ color: status.text_color, fontSize: '20px', fontWeight: 'bold' }}>
                                    {status.count}
                                </Text>
                                <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: '12px', marginTop: '2px' }}>
                                    ৳{status.amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                </Text>
                            </div>
                        </Col>
                    ))}
                </Row>
            </Card>

            {/* Main Content Row */}
            <Row gutter={[16, 16]}>
                {/* Recent Orders */}
                <Col xs={24} xl={16}>
                    <Card 
                        title={<Title level={5} style={{ margin: 0 }}>Recent Orders</Title>}
                        bordered={false} 
                        style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', height: '100%' }}
                        extra={<Button type="link">View All</Button>}
                    >
                        <Table 
                            columns={columns} 
                            dataSource={recentOrders} 
                            pagination={false} 
                            rowKey="id" 
                            scroll={{ x: 700 }}
                        />
                    </Card>
                </Col>

                {/* Top Products */}
                <Col xs={24} xl={8}>
                    <Card 
                        title={<Title level={5} style={{ margin: 0 }}>Top Selling Products</Title>}
                        bordered={false} 
                        style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', height: '100%' }}
                        extra={<Button type="text" icon={<MoreOutlined />} />}
                    >
                        <List
                            itemLayout="horizontal"
                            dataSource={topProducts}
                            renderItem={item => (
                                <List.Item style={{ padding: '12px 0' }}>
                                    <List.Item.Meta
                                        avatar={<Avatar shape="square" size={48} src={item.image} style={{ borderRadius: '8px' }} />}
                                        title={<Text strong style={{ fontSize: '15px' }}>{item.name}</Text>}
                                        description={<Text type="secondary">{item.sales} Sales</Text>}
                                    />
                                    <div style={{ textAlign: 'right' }}>
                                        <Text strong style={{ fontSize: '15px' }}>৳{item.revenue}</Text>
                                    </div>
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Bottom Row */}
            <Row gutter={[16, 16]}>
                {/* Store Goals */}
                <Col xs={24} xl={12}>
                    <Card 
                        title={<Title level={5} style={{ margin: 0 }}>Store Goals & Targets</Title>}
                        bordered={false} 
                        style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', height: '100%' }}
                    >
                        <div style={{ marginBottom: '28px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <Text strong>Monthly Revenue Target</Text>
                                <Text strong style={{ color: '#1677ff' }}>৳124,500 / ৳150,000</Text>
                            </div>
                            <Progress percent={83} strokeColor={{ '0%': '#1677ff', '100%': '#52c41a' }} status="active" />
                        </div>
                        
                        <div style={{ marginBottom: '28px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <Text strong>New Customer Acquisition</Text>
                                <Text strong style={{ color: '#faad14' }}>425 / 500</Text>
                            </div>
                            <Progress percent={85} strokeColor="#faad14" status="active" />
                        </div>

                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <Text strong>Order Fulfillment Rate</Text>
                                <Text strong style={{ color: '#52c41a' }}>1,750 / 1,842</Text>
                            </div>
                            <Progress percent={95} strokeColor="#52c41a" />
                        </div>
                    </Card>
                </Col>

                {/* Recent Activities */}
                <Col xs={24} xl={12}>
                    <Card 
                        title={<Title level={5} style={{ margin: 0 }}>Recent Activities</Title>}
                        bordered={false} 
                        style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', height: '100%' }}
                    >
                        <Timeline
                            items={[
                                {
                                    color: 'green',
                                    children: (
                                        <>
                                            <Text strong>New Order #ORD-7231</Text>
                                            <br />
                                            <Text type="secondary">John Doe placed an order for ৳1199.00</Text>
                                            <br />
                                            <Text type="secondary" style={{ fontSize: '12px' }}>10 mins ago</Text>
                                        </>
                                    ),
                                },
                                {
                                    color: 'blue',
                                    children: (
                                        <>
                                            <Text strong>Order Shipped</Text>
                                            <br />
                                            <Text type="secondary">Order #ORD-7230 has been handed over to FedEx</Text>
                                            <br />
                                            <Text type="secondary" style={{ fontSize: '12px' }}>1 hour ago</Text>
                                        </>
                                    ),
                                },
                                {
                                    color: 'red',
                                    children: (
                                        <>
                                            <Text strong>Low Stock Alert</Text>
                                            <br />
                                            <Text type="secondary">Sony WH-1000XM5 is running low (5 left in stock)</Text>
                                            <br />
                                            <Text type="secondary" style={{ fontSize: '12px' }}>3 hours ago</Text>
                                        </>
                                    ),
                                },
                                {
                                    color: 'purple',
                                    children: (
                                        <>
                                            <Text strong>New Customer Registration</Text>
                                            <br />
                                            <Text type="secondary">Michael Johnson created an account</Text>
                                            <br />
                                            <Text type="secondary" style={{ fontSize: '12px' }}>Yesterday, 04:30 PM</Text>
                                        </>
                                    ),
                                }
                            ]}
                        />
                    </Card>
                </Col>
            </Row>
        </Space>
    );
}