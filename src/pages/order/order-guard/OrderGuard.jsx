import { SaveOutlined, SettingOutlined } from '@ant-design/icons';
import { Button, Card, Col, Divider, Form, Input, InputNumber, message, Row, Select, Spin, Switch, Typography } from 'antd';
import { useEffect, useState } from 'react';
import useTitle from '../../../hooks/useTitle';
import { getData, putData } from "../../../services/request";

const OrderGuard = () => {
    useTitle("Order Guard Setting");
    
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const timeUnitOptions = (
        <>
            <Select.Option value="minute">Minute</Select.Option>
            <Select.Option value="hour">Hour</Select.Option>
            <Select.Option value="day">Day</Select.Option>
            <Select.Option value="week">Week</Select.Option>
        </>
    );

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const res = await getData("/admin/order-guard-setting");
            if (res?.success && res?.data) {
                const formData = {
                    ...res.data,
                    auto_block_enabled: !!res.data.auto_block_enabled
                };
                form.setFieldsValue(formData);
            }
        } catch (error) {
            console.error(error);
            message.error('An error occurred while fetching data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onFinish = async (values) => {
        try {
            setSubmitting(true);
            const res = await putData("/admin/order-guard-setting", values);
            if (res?.success) {
                message.success(res?.message || 'Settings updated successfully');
            } else {
                if (res?.errors) {
                    const formErrors = Object.keys(res.errors).map(key => ({
                        name: key,
                        errors: res.errors[key]
                    }));
                    form.setFields(formErrors);
                }
                message.error(res?.message || 'Failed to update settings');
            }
        } catch (error) {
            console.error(error);
            if (error?.response?.data?.errors) {
                const resErrors = error.response.data.errors;
                const formErrors = Object.keys(resErrors).map(key => ({
                    name: key,
                    errors: resErrors[key]
                }));
                form.setFields(formErrors);
                message.error(error?.response?.data?.message || 'Validation failed');
            } else {
                message.error('An error occurred while updating settings');
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Card 
            title={
                <Typography.Title level={4} style={{ margin: 0 }}>
                    <SettingOutlined style={{ marginRight: '8px' }} />
                    Order Guard Settings
                </Typography.Title>
            } 
            bordered={false}
            style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
        >
            {loading ? (
                <div style={{ textAlign: 'center', padding: '50px' }}>
                    <Spin size="large" tip="Loading settings..." />
                </div>
            ) : (
                <Form form={form} layout="vertical" onFinish={onFinish}>
                    <Divider orientation="left" style={{ marginTop: 0 }}>Phone Order Limits</Divider>

                    <Row gutter={24}>
                        <Col xs={24} sm={12} md={8}>
                            <Form.Item label="Order Limit" name="phone_order_limit" rules={[{ required: true, message: 'Please input limit!' }]}>
                                <InputNumber style={{ width: '100%' }} min={1} size="large" placeholder="E.g. 5" />
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={12} md={8}>
                            <Form.Item label="Period Value" name="phone_order_period_value" rules={[{ required: true, message: 'Please input period value!' }]}>
                                <InputNumber style={{ width: '100%' }} min={1} size="large" placeholder="E.g. 1" />
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={12} md={8}>
                            <Form.Item label="Period Unit" name="phone_order_period_unit" rules={[{ required: true, message: 'Please select period unit!' }]}>
                                <Select size="large" placeholder="Select unit">{timeUnitOptions}</Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Divider orientation="left">IP Order Limits</Divider>

                    <Row gutter={24}>
                        <Col xs={24} sm={12} md={8}>
                            <Form.Item label="Order Limit" name="ip_order_limit" rules={[{ required: true, message: 'Please input limit!' }]}>
                                <InputNumber style={{ width: '100%' }} min={1} size="large" placeholder="E.g. 5" />
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={12} md={8}>
                            <Form.Item label="Period Value" name="ip_order_period_value" rules={[{ required: true, message: 'Please input period value!' }]}>
                                <InputNumber style={{ width: '100%' }} min={1} size="large" placeholder="E.g. 1" />
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={12} md={8}>
                            <Form.Item label="Period Unit" name="ip_order_period_unit" rules={[{ required: true, message: 'Please select period unit!' }]}>
                                <Select size="large" placeholder="Select unit">{timeUnitOptions}</Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Divider orientation="left">User Token Order Limits</Divider>

                    <Row gutter={24}>
                        <Col xs={24} sm={12} md={8}>
                            <Form.Item label="Order Limit" name="user_token_order_limit" rules={[{ required: true, message: 'Please input limit!' }]}>
                                <InputNumber style={{ width: '100%' }} min={1} size="large" placeholder="E.g. 5" />
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={12} md={8}>
                            <Form.Item label="Period Value" name="user_token_order_period_value" rules={[{ required: true, message: 'Please input period value!' }]}>
                                <InputNumber style={{ width: '100%' }} min={1} size="large" placeholder="E.g. 1" />
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={12} md={8}>
                            <Form.Item label="Period Unit" name="user_token_order_period_unit" rules={[{ required: true, message: 'Please select period unit!' }]}>
                                <Select size="large" placeholder="Select unit">{timeUnitOptions}</Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Divider orientation="left">Auto Block Settings</Divider>

                    <Row gutter={24}>
                        <Col xs={24} sm={12} md={6}>
                            <Form.Item label="Auto Block Enabled" name="auto_block_enabled" valuePropName="checked">
                                <Switch checkedChildren="Enabled" unCheckedChildren="Disabled" />
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={12} md={6}>
                            <Form.Item label="Block After Attempts" name="block_after_attempts">
                                <InputNumber style={{ width: '100%' }} min={1} size="large" placeholder="E.g. 3" />
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={12} md={6}>
                            <Form.Item label="Block Duration Value" name="block_duration_value">
                                <InputNumber style={{ width: '100%' }} min={1} size="large" placeholder="E.g. 24" />
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={12} md={6}>
                            <Form.Item label="Block Duration Unit" name="block_duration_unit">
                                <Select size="large" placeholder="Select unit">{timeUnitOptions}</Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={24}>
                        <Col xs={24}>
                            <Form.Item label="Block Message" name="block_message">
                                <Input.TextArea 
                                    rows={3} 
                                    size="large" 
                                    placeholder="Message shown to blocked users (e.g. You have been blocked for suspicious activity.)" 
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item style={{ marginTop: '16px' }}>
                        <Button type="primary" htmlType="submit" size="large" icon={<SaveOutlined />} loading={submitting}>
                            Save Settings
                        </Button>
                    </Form.Item>
                </Form>
            )}
        </Card>
    );
};

export default OrderGuard;