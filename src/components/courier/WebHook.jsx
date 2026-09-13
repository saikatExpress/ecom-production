import React, { useState } from 'react';
import { Typography, Input, Button, message, Tooltip, Flex, Tag } from 'antd';
import { CopyOutlined, ApiTwoTone, CheckCircleOutlined, SyncOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;

const WebHook = ({ path }) => {
    const [copied, setCopied] = useState(false);

    // Generate the full webhook URL
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
    
    // Ensure clean concatenation
    const rawUrl = `${baseUrl}${path?.startsWith('/') ? path : '/' + path}`;
    const fullUrl = rawUrl.replace(/([^:]\/)\/+/g, "$1");

    const handleCopy = () => {
        navigator.clipboard.writeText(fullUrl);
        setCopied(true);
        message.success("Webhook URL copied to clipboard!");
        setTimeout(() => setCopied(false), 3000);
    };

    return (
        <div 
            style={{ 
                marginBottom: 32, 
                padding: '24px', 
                backgroundColor: '#f8faff', 
                borderRadius: '12px', 
                border: '1px solid #d6e4ff',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(22, 119, 255, 0.05)'
            }}
        >
            {/* Background decoration */}
            <div style={{ position: 'absolute', top: -20, right: -20, opacity: 0.05, transform: 'rotate(15deg)' }}>
                <ApiTwoTone style={{ fontSize: 140 }} />
            </div>

            <Flex justify="space-between" align="flex-start" style={{ marginBottom: 16, position: 'relative', zIndex: 1 }}>
                <div>
                    <Flex align="center" gap="small" style={{ marginBottom: 4 }}>
                        <ApiTwoTone twoToneColor="#1677ff" style={{ fontSize: 20 }} />
                        <Title level={5} style={{ margin: 0, color: '#1677ff' }}>Webhook Endpoint</Title>
                        <Tag icon={<SyncOutlined spin />} color="processing" style={{ borderRadius: 12, marginLeft: 8, border: 'none', backgroundColor: '#e6f4ff' }}>
                            Real-time Sync
                        </Tag>
                    </Flex>
                    <Text type="secondary" style={{ fontSize: 13, display: 'block', marginTop: 4 }}>
                        Configure this URL in your courier merchant panel to receive automatic parcel status updates directly to your system.
                    </Text>
                </div>
            </Flex>

            <Flex gap="small" style={{ position: 'relative', zIndex: 1 }}>
                <Input 
                    value={fullUrl} 
                    readOnly 
                    size="large" 
                    variant="filled"
                    style={{ 
                        backgroundColor: '#ffffff', 
                        color: '#000000', 
                        fontFamily: "'Courier New', Courier, monospace",
                        fontWeight: 600,
                        fontSize: 14,
                        border: '1px solid #adc6ff',
                        boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.02)'
                    }} 
                />
                <Tooltip title={copied ? "Copied!" : "Copy Webhook URL"}>
                    <Button 
                        type={copied ? "default" : "primary"} 
                        size="large" 
                        icon={copied ? <CheckCircleOutlined style={{ color: '#52c41a' }} /> : <CopyOutlined />} 
                        onClick={handleCopy}
                        style={{ 
                            minWidth: 120, 
                            fontWeight: 600,
                            borderColor: copied ? '#52c41a' : undefined,
                            color: copied ? '#52c41a' : undefined,
                            transition: 'all 0.3s ease'
                        }}
                    >
                        {copied ? "Copied" : "Copy URL"}
                    </Button>
                </Tooltip>
            </Flex>
        </div>
    );
};

export default WebHook;
