import { CopyOutlined, LinkOutlined } from '@ant-design/icons';
import { Button, Input, message, Tooltip, Typography } from 'antd';

const { Text } = Typography;

const WebHook = ({ path }) => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
    
    const rawUrl = `${baseUrl}${path?.startsWith('/') ? path : '/' + path}`;
    const fullUrl = rawUrl.replace(/([^:]\/)\/+/g, "$1");

    const handleCopy = () => {
        navigator.clipboard.writeText(fullUrl);
        message.success("Webhook URL copied to clipboard!");
    };

    return (
        <div style={{ marginBottom: 24, padding: '16px', backgroundColor: '#f0f5ff', borderRadius: '8px', border: '1px dashed #adc6ff' }}>
            <Text strong style={{ display: 'block', marginBottom: 8, color: '#1677ff', fontSize: '15px' }}>
                <LinkOutlined style={{ marginRight: 6 }} /> 
                Webhook URL
            </Text>
            <div style={{ display: 'flex', gap: '8px' }}>
                <Input value={fullUrl} readOnly size="large" style={{ backgroundColor: '#ffffff', color: '#595959', fontWeight: 500 }} />
                <Tooltip title="Copy URL">
                    <Button type="primary" size="large" icon={<CopyOutlined />} onClick={handleCopy}>
                        Copy
                    </Button>
                </Tooltip>
            </div>
            <Text type="secondary" style={{ fontSize: 13, marginTop: 8, display: 'block' }}>
                Copy this Webhook URL and paste it in your Courier Dashboard to receive real-time parcel status updates.
            </Text>
        </div>
    );
};

export default WebHook;
