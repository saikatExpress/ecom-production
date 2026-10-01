import { PlusOutlined, SettingOutlined, UploadOutlined } from "@ant-design/icons";
import { Breadcrumb, Button, Card, Flex, message, Modal, Table, Tag, Typography, Form, Select, Input, Switch, InputNumber, ColorPicker, Upload } from "antd";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import useTitle from "../../hooks/useTitle";
import { getDatas, postData } from "../../services/request";
import { fetchAllSettings } from "../../features/setting/settingThunk";

const { Title, Text } = Typography;

const groupOptions = [
    { label: 'General', value: 'general' },
    { label: 'Logo', value: 'logo' },
    { label: 'Theme', value: 'theme' },
    { label: 'Product', value: 'product' },
    { label: 'Top Header', value: 'top_header' },
    { label: 'Header & Footer', value: 'header-footer' },
    { label: 'Checkout', value: 'checkout' },
    { label: 'Seo', value: 'seo' }
];

const typeOptions = [
    { label: 'String', value: 'string' },
    { label: 'Textarea', value: 'textarea' },
    { label: 'Boolean', value: 'boolean' },
    { label: 'URL', value: 'url' },
    { label: 'Number', value: 'number' },
    { label: 'Select', value: 'select' },
    { label: 'Color', value: 'color' },
    { label: 'Image', value: 'image' },
];

const AllSetting = () => {
    useTitle("All Settings");
    const dispatch = useDispatch();

    const [form] = Form.useForm();
    const selectedType = Form.useWatch('type', form);

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [settings, setSettings] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 20 });

    const handleTableChange = (newPagination) => {
        setPagination(newPagination);
    };

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const res = await getDatas("/admin/setting");
            if (res?.success && res?.data) {
                // Flatten the grouped data into a single array
                const flattened = [];
                Object.keys(res.data).forEach((groupName) => {
                    const groupItems = res.data[groupName];
                    if (Array.isArray(groupItems)) {
                        flattened.push(...groupItems);
                    }
                });
                setSettings(flattened);
            }
        } catch (error) {
            console.error("Failed to fetch settings:", error);
            message.error("Failed to load settings.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const onFinish = async (values) => {
        setSubmitting(true);
        try {
            let payload;
            if (values.type === 'image' && values.value?.fileList?.[0]) {
                payload = new FormData();
                payload.append('group_name', values.group_name);
                payload.append('setting_key', values.setting_key);
                payload.append('label', values.label);
                payload.append('type', values.type);
                payload.append('value', values.value.fileList[0].originFileObj);
            } else {
                let finalValue = values.value;
                if (values.type === 'color' && typeof finalValue === 'object') {
                    finalValue = finalValue.toHexString();
                }
                payload = { ...values, value: finalValue };
            }

            const res = await postData("/admin/setting", payload);
            if (res?.success) {
                message.success('Setting created successfully!');
                setIsModalOpen(false);
                form.resetFields();
                fetchSettings();
                dispatch(fetchAllSettings());
            } else {
                message.error(res?.message || 'Failed to create setting');
            }
        } catch (error) {
            console.error("Create setting error:", error);
            message.error('An error occurred while saving.');
        } finally {
            setSubmitting(false);
        }
    };

    const columns = 
    [
        {
            title: 'SL',
            key: 'sl',
            width: 70,
            render: (text, record, index) => (pagination.current - 1) * pagination.pageSize + index + 1,
        },
        {
            title: 'Group',
            dataIndex: 'group_name',
            key: 'group_name',
            render: (text) => <Tag color="blue">{text?.toUpperCase()}</Tag>,
        },
        {
            title: 'Label',
            dataIndex: 'label',
            key: 'label',
            render: (text) => <Text strong>{text}</Text>,
        },
        {
            title: 'Setting Key',
            dataIndex: 'setting_key',
            key: 'setting_key',
            render: (text) => <Text code>{text}</Text>,
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            render: (text) => <Tag color="purple">{text}</Tag>,
        },
        {
            title: 'Value',
            dataIndex: 'value',
            key: 'value',
            render: (text, record) => {
                if (record.type === 'image') {
                    return <img src={text} alt="preview" style={{ maxHeight: 30, maxWidth: 100, objectFit: 'contain' }} />;
                }
                if (record.type === 'color') {
                    return (
                        <Flex align="center" gap={8}>
                            <div style={{ width: 16, height: 16, background: text, borderRadius: 4, border: '1px solid #d9d9d9' }} />
                            <span>{text}</span>
                        </Flex>
                    );
                }
                if (typeof text === 'boolean' || text === 1 || text === 0 || text === '1' || text === '0' || text === true || text === false) {
                    const isTrue = text === true || text === 1 || text === '1';
                    return <Tag color={isTrue ? 'green' : 'red'}>{isTrue ? 'True' : 'False'}</Tag>;
                }
                return (
                    <div style={{ maxWidth: 250, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {String(text)}
                    </div>
                );
            }
        },
    ];

    return (
        <div style={{ margin: 5 }}>
            <div style={{
                background  : 'linear-gradient(135deg, #1677ff 0%, #0958d9 100%)',
                padding     : '16px 24px',
                borderRadius: 10,
                marginBottom: 20,
                boxShadow   : '0 4px 15px rgba(22, 119, 255, 0.3)',
                display     : 'flex',
                justifyContent: 'space-between',
                alignItems  : 'center'
            }}>
                <div>
                    <Breadcrumb
                        items={[
                            { title: <span style={{ color: 'rgba(255,255,255,0.7)' }}>Dashboard</span> },
                            { title: <span style={{ color: 'rgba(255,255,255,0.7)' }}>Settings</span> },
                            { title: <span style={{ color: '#fff' }}>All Settings</span> },
                        ]}
                        separator={<span style={{ color: 'rgba(255,255,255,0.5)' }}>/</span>}
                    />
                    <Title level={4} style={{ margin: '8px 0 0', color: '#fff' }}>
                        <SettingOutlined style={{ marginRight: 8 }} />
                        All Settings
                    </Title>
                </div>
                
                <Button 
                    type="primary" 
                    icon={<PlusOutlined />} 
                    size="large"
                    onClick={() => setIsModalOpen(true)}
                    style={{
                        background: 'rgba(255,255,255,0.2)',
                        borderColor: 'transparent',
                        boxShadow: 'none'
                    }}
                >
                    Create Setting
                </Button>
            </div>

            <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <Table 
                    columns={columns} 
                    dataSource={settings} 
                    rowKey="id" 
                    loading={loading}
                    pagination={pagination}
                    onChange={handleTableChange}
                    scroll={{ x: 800 }}
                />
            </Card>

            <Modal 
                title="Create New Setting" 
                open={isModalOpen} 
                onCancel={() => {
                    setIsModalOpen(false);
                    form.resetFields();
                }}
                footer={null}
                destroyOnClose
            >
                <Form layout="vertical" form={form} onFinish={onFinish} initialValues={{ type: 'string' }}>
                    <Form.Item name="group_name" label="Group Name" rules={[{ required: true, message: 'Please select a group' }]}>
                        <Select options={groupOptions} placeholder="Select Group" />
                    </Form.Item>
                    
                    <Form.Item name="setting_key" label="Setting Key" rules={[{ required: true, message: 'Please enter setting key' }]}>
                        <Input placeholder="e.g., site_name" />
                    </Form.Item>
                    
                    <Form.Item name="label" label="Label" rules={[{ required: true, message: 'Please enter label' }]}>
                        <Input placeholder="e.g., Site Name" />
                    </Form.Item>
                    
                    <Form.Item name="type" label="Type" rules={[{ required: true, message: 'Please select type' }]}>
                        <Select options={typeOptions} placeholder="Select Type" />
                    </Form.Item>
                    
                    {selectedType && (
                        <Form.Item 
                            name="value" 
                            label="Value" 
                            valuePropName={selectedType === 'boolean' ? 'checked' : 'value'}
                            getValueFromEvent={selectedType === 'image' ? (e) => e : undefined}
                            rules={[{ required: true, message: 'Please provide a value' }]}
                        >
                            {selectedType === 'string' || selectedType === 'url' || selectedType === 'select' ? <Input placeholder="Enter value" /> :
                             selectedType === 'textarea' ? <Input.TextArea rows={3} placeholder="Enter value" /> :
                             selectedType === 'boolean' ? <Switch /> :
                             selectedType === 'number' ? <InputNumber style={{ width: '100%' }} placeholder="Enter number" /> :
                             selectedType === 'color' ? <ColorPicker format="hex" showText /> :
                             selectedType === 'image' ? (
                                <Upload beforeUpload={() => false} maxCount={1}>
                                    <Button icon={<UploadOutlined />}>Select Image</Button>
                                </Upload>
                             ) : <Input />}
                        </Form.Item>
                    )}

                    <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                        <Button onClick={() => setIsModalOpen(false)} style={{ marginRight: 8 }}>Cancel</Button>
                        <Button type="primary" htmlType="submit" loading={submitting}>Create</Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default AllSetting;