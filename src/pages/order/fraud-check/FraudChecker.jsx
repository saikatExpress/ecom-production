import { ArrowLeftOutlined, InboxOutlined, PhoneOutlined, SafetyCertificateOutlined, SearchOutlined, WarningOutlined } from '@ant-design/icons';
import { Avatar, Button, Card, Col, Divider, Flex, Form, Input, message, Progress, Row, Space, Spin, Statistic, Tag, Typography } from 'antd';
import { useState } from 'react';
import useTitle from './../../../hooks/useTitle';
import { postData } from './../../../services/request';

const { Title, Text } = Typography;

const FraudChecker = () => {
    // Hook
    useTitle("Fraud Checker");
    
    // State
    const [loading, setLoading]             = useState(false);
    const [result, setResult]               = useState(null);
    const [searchedPhone, setSearchedPhone] = useState("");

    const onFinish = async (values) => {
        if (!values.phone) {
            message.warning("অনুগ্রহ করে একটি ফোন নম্বর দিন");
            return;
        }

        setLoading(true);
        try {
            const res = await postData("/admin/fraud-cheker", { phone: values.phone });
            
            if (res?.success) {
                setResult(res.data);
                setSearchedPhone(values.phone);
                message.success("ডেটা সফলভাবে পাওয়া গেছে");
            } else {
                message.error(res?.message || "কোনো ডেটা পাওয়া যায়নি");
                setResult(null);
            }
        } catch (error) {
            console.error("Fraud check error:", error);
            message.error("সার্ভার এরর, দয়া করে আবার চেষ্টা করুন");
            setResult(null);
        } finally {
            setLoading(false);
        }
    };

    const renderSummary = () => {
        if (!result || !result.data || !result.data.summary) return null;
        
        const summary = result.data.summary;
        const total = summary.total_parcel || 0;
        const success = summary.success_parcel || 0;
        const cancelled = summary.cancelled_parcel || 0;
        const ratio = parseFloat(summary.success_ratio || 0);

        let statusConfig = {
            type: "error",
            icon: <WarningOutlined />,
            title: "গ্রাহকটি ঝুঁকিপূর্ণ!",
            desc: "এই গ্রাহকের পার্সেল রিসিভ করার হার খুবই কম। কুরিয়ার চার্জ অগ্রিম নেওয়া উচিত।",
            color: "#cf1322",
            tagColor: "error"
        };

        if (total === 0) {
            statusConfig = {
                type: "info",
                icon: <InboxOutlined />,
                title: "নতুন গ্রাহক",
                desc: "এই গ্রাহকের কোনো পূর্ববর্তী কুরিয়ার রেকর্ড পাওয়া যায়নি।",
                color: "#0958d9",
                tagColor: "processing"
            };
        } else if (ratio >= 80) {
            statusConfig = {
                type: "success",
                icon: <SafetyCertificateOutlined />,
                title: "গ্রাহকটি অত্যন্ত বিশ্বস্ত",
                desc: "গ্রাহকের পার্সেল রিসিভ করার রেকর্ড খুব ভালো। নিশ্চিন্তে ডেলিভারি করতে পারেন।",
                color: "#389e0d",
                tagColor: "success"
            };
        } else if (ratio >= 50) {
            statusConfig = {
                type: "warning",
                icon: <WarningOutlined />,
                title: "গ্রাহকটি মোটামুটি বিশ্বস্ত",
                desc: "গ্রাহকের পার্সেল রিসিভ করার রেকর্ড মধ্যম সারির। সতর্কতা অবলম্বন করা ভালো।",
                color: "#d48806",
                tagColor: "warning"
            };
        }

        return (
            <Card style={{ marginBottom: 24, borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', borderTop: `4px solid ${statusConfig.color}` }}>
                <Row gutter={[24, 24]} align="middle">
                    <Col xs={24} md={14}>
                        <Space direction="vertical" size="small">
                            <Tag color="blue" style={{ fontSize: 14, padding: '4px 12px', borderRadius: 20 }}>
                                <PhoneOutlined /> {searchedPhone}
                            </Tag>
                            <Title level={3} style={{ margin: 0, color: statusConfig.color }}>
                                {statusConfig.icon} {statusConfig.title}
                            </Title>
                            <Text type="secondary" style={{ fontSize: 16 }}>{statusConfig.desc}</Text>
                        </Space>
                    </Col>
                    
                    <Col xs={24} md={10}>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Card size="small" style={{ backgroundColor: '#fafafa', textAlign: 'center', borderColor: '#e6f4ff' }}>
                                    <Statistic title={<span style={{ fontWeight: 'bold' }}>মোট পার্সেল</span>} value={total} valueStyle={{ color: '#1677ff', fontWeight: 'bold' }} />
                                </Card>
                            </Col>
                            <Col span={12}>
                                <Card size="small" style={{ backgroundColor: '#fafafa', textAlign: 'center', borderColor: '#f6ffed' }}>
                                    <Statistic title={<span style={{ fontWeight: 'bold' }}>সফল ডেলিভারি</span>} value={success} valueStyle={{ color: '#52c41a', fontWeight: 'bold' }} />
                                </Card>
                            </Col>
                            <Col span={12} style={{ marginTop: 16 }}>
                                <Card size="small" style={{ backgroundColor: '#fafafa', textAlign: 'center', borderColor: '#fff2f0' }}>
                                    <Statistic title={<span style={{ fontWeight: 'bold' }}>ক্যান্সেল হয়েছে</span>} value={cancelled} valueStyle={{ color: '#ff4d4f', fontWeight: 'bold' }} />
                                </Card>
                            </Col>
                            <Col span={12} style={{ marginTop: 16 }}>
                                <Card size="small" style={{ backgroundColor: '#fafafa', textAlign: 'center', borderColor: '#fffbe6' }}>
                                    <Statistic title={<span style={{ fontWeight: 'bold' }}>সাকসেস রেট</span>} value={ratio} precision={2} suffix="%" valueStyle={{ color: '#faad14', fontWeight: 'bold' }} />
                                </Card>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </Card>
        );
    };

    const renderCouriers = () => {
        if (!result || !result.data) return null;
        
        const couriers = Object.entries(result.data).filter(([key, val]) => key !== 'summary' && typeof val === 'object');
        
        couriers.sort((a, b) => b[1].total_parcel - a[1].total_parcel);

        return (
            <div>
                <Title level={4} style={{ marginBottom: 16 }}>
                    কুরিয়ার অনুযায়ী ডেটা
                </Title>
                <Row gutter={[16, 16]}>
                    {couriers.map(([key, data]) => (
                        <Col xs={24} sm={12} lg={8} key={key}>
                            <Card hoverable size="small" style={{ borderRadius: 8, height: '100%', opacity: data.total_parcel === 0 ? 0.6 : 1 }}>
                                <Flex align="center" gap="middle" style={{ marginBottom: 16 }}>
                                    <Avatar src={data.logo} shape="square" size={48} style={{ backgroundColor: '#fff', border: '1px solid #f0f0f0', padding: 4 }} />
                                    <div>
                                        <Text strong style={{ fontSize: 16, display: 'block' }}>{data.name}</Text>
                                        <Text type="secondary" style={{ fontSize: 12 }}>
                                            {data.total_parcel === 0 ? 'কোনো রেকর্ড নেই' : 'রেকর্ড পাওয়া গেছে'}
                                        </Text>
                                    </div>
                                </Flex>
                                
                                <Divider style={{ margin: '12px 0' }} />
                                
                                <Row justify="space-between" style={{ marginBottom: 8, textAlign: 'center' }}>
                                    <Col span={8}>
                                        <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>মোট</Text>
                                        <Text strong>{data.total_parcel}</Text>
                                    </Col>
                                    <Col span={8}>
                                        <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>সফল</Text>
                                        <Text strong style={{ color: '#52c41a' }}>{data.success_parcel}</Text>
                                    </Col>
                                    <Col span={8}>
                                        <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>ক্যান্সেল</Text>
                                        <Text strong style={{ color: '#ff4d4f' }}>{data.cancelled_parcel}</Text>
                                    </Col>
                                </Row>
                                
                                <div style={{ marginTop: 12 }}>
                                    <Flex justify="space-between" style={{ marginBottom: 4 }}>
                                        <Text style={{ fontSize: 12 }}>সাকসেস রেট</Text>
                                        <Text strong style={{ fontSize: 12 }}>{parseFloat(data.success_ratio).toFixed(2)}%</Text>
                                    </Flex>
                                    <Progress 
                                        percent={parseFloat(data.success_ratio)} 
                                        strokeColor={parseFloat(data.success_ratio) >= 80 ? '#52c41a' : parseFloat(data.success_ratio) >= 50 ? '#faad14' : '#ff4d4f'}
                                        showInfo={false}
                                        size="small"
                                    />
                                </div>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </div>
        );
    };

    return (
        <div style={{ padding: '0 0 24px 0' }}>
            <Flex align="center" gap="small" style={{ marginBottom: 16 }}>
                <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => window.history.back()} style={{ fontSize: 16, fontWeight: 500 }}>
                    Back
                </Button>
            </Flex>

            <Card 
                style={{ 
                    marginBottom: 24, 
                    borderRadius: 16, 
                    border: 'none', 
                    boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
                    background: 'linear-gradient(145deg, #ffffff 0%, #f0f5ff 100%)'
                }}
            >
                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                    <Title level={2} style={{ margin: 0, color: '#1677ff', fontWeight: 800 }}>
                        <SafetyCertificateOutlined style={{ marginRight: 8 }} /> ফ্রড চেকার (Fraud Checker)
                    </Title>
                    <Text type="secondary" style={{ display: 'block', marginTop: 8, fontSize: 16 }}>
                        গ্রাহকের ফোন নম্বর দিয়ে তার পূর্ববর্তী কুরিয়ার রেকর্ড যাচাই করুন
                    </Text>
                    
                    <Form onFinish={onFinish} style={{ maxWidth: 600, margin: '32px auto 0' }}>
                        <Flex gap="small">
                            <Form.Item name="phone" rules={[{ required: true, message: 'ফোন নম্বর প্রদান করুন' }]} style={{ flex: 1, margin: 0 }}>
                                <Input 
                                    size="large" 
                                    prefix={<PhoneOutlined style={{ color: '#bfbfbf' }} />} 
                                    placeholder="ফোন নম্বর লিখুন (যেমন: 017XXXXXXX)" 
                                    allowClear
                                    style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
                                />
                            </Form.Item>
                            <Form.Item style={{ margin: 0 }}>
                                <Button 
                                    type="primary" 
                                    htmlType="submit" 
                                    size="large" 
                                    icon={<SearchOutlined />} 
                                    loading={loading}
                                    style={{ borderRadius: 8, fontWeight: 'bold', padding: '0 32px', boxShadow: '0 4px 12px rgba(22, 119, 255, 0.3)' }}
                                >
                                    যাচাই করুন
                                </Button>
                            </Form.Item>
                        </Flex>
                    </Form>
                </div>
            </Card>

            {loading && (
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                    <Spin size="large" tip={<div style={{ marginTop: 12, fontWeight: 500, color: '#1677ff' }}>তথ্য যাচাই করা হচ্ছে...</div>} />
                </div>
            )}

            {!loading && result && (
                <div style={{ animation: 'fadeIn 0.5s ease-in-out' }}>
                    {renderSummary()}
                    {renderCouriers()}
                </div>
            )}
            
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default FraudChecker;