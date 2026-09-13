import { Form, Input, InputNumber, Modal, Select, message } from "antd";
import { useEffect, useState } from "react";
import { patchData } from "../../services/request";
import { handleFormErrors } from './../../utils/formUtils';

export default function ProductQuickEditModal({ visible, onClose, product, onSuccess }) {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (visible && product) {
            form.setFieldsValue({
                name: product.name,
                sku: product.sku,
                mrp: product.mrp,
                sell_price: product.sell_price,
                current_stock: product.current_stock,
                status: product.status || "active",
            });
        } else {
            form.resetFields();
        }
    }, [visible, product, form]);

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);
            const res = await patchData(`/admin/product/quick-edit/${product.id}`, values);
            if (res?.success) {
                message.success(res?.message || "Product updated successfully");
                onSuccess(res.data || { ...product, ...values });
                onClose();
            } else {
                message.error(res?.message || "Failed to update product");
            }
        } catch (error) {
            if (error?.errorFields) {
                return;
            }
            console.error("Quick edit error:", error);
            message.error(error?.response?.data?.message || "An error occurred during quick edit.");
            handleFormErrors(error, form, message.error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Quick Edit Product"
            open={visible}
            onCancel={onClose}
            onOk={handleOk}
            confirmLoading={loading}
            destroyOnClose
        >
            <Form form={form} layout="vertical">
                <Form.Item name="name" label="Product Name" rules={[{ required: true, message: 'Please enter product name' }]}>
                    <Input placeholder="Enter product name" />
                </Form.Item>
                <Form.Item name="sku" label="SKU" rules={[{ required: true, message: 'Please enter SKU' }]}>
                    <Input placeholder="Enter SKU" />
                </Form.Item>
                <Form.Item name="mrp" label="MRP">
                    <InputNumber style={{ width: '100%' }} placeholder="Enter MRP" />
                </Form.Item>
                <Form.Item name="sell_price" label="Sell Price" rules={[{ required: true, message: 'Please enter sell price' }]}>
                    <InputNumber style={{ width: '100%' }} placeholder="Enter sell price" />
                </Form.Item>
                <Form.Item name="current_stock" label="Current Stock" rules={[{ required: true, message: 'Please enter current stock' }]}>
                    <InputNumber style={{ width: '100%' }} placeholder="Enter current stock" />
                </Form.Item>
                <Form.Item name="status" label="Status" rules={[{ required: true, message: 'Please select status' }]}>
                    <Select placeholder="Select Status">
                        <Select.Option value="active">Active</Select.Option>
                        <Select.Option value="inactive">Inactive</Select.Option>
                    </Select>
                </Form.Item>
            </Form>
        </Modal>
    );
}
