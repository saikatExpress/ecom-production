import { AppstoreOutlined, ArrowLeftOutlined, DeleteOutlined, DollarOutlined, FileTextOutlined, GlobalOutlined, InboxOutlined, PictureOutlined, PlusOutlined, SaveOutlined, TagsOutlined, UploadOutlined } from "@ant-design/icons";
import { Breadcrumb, Button, Card, Col, Flex, Form, Input, InputNumber, message, Radio, Row, Select, Space, Switch, Typography, Upload } from "antd";
import { useEffect, useState } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { useNavigate } from "react-router-dom";
import ProductAiChat from "../../components/product/ProductAiChat";
import useTitle from "../../hooks/useTitle";
import { getDatas, postData } from "../../services/request";
import { handleFormErrors } from "../../utils/formUtils";

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function AddProduct() {
    // Hook
    useTitle("Add Product");

    // Variable
    const navigate = useNavigate();
    const [form]   = Form.useForm();

    // States
    const [submitting, setSubmitting]       = useState(false);
    const [categories, setCategories]       = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [brands, setBrands]               = useState([]);
    const [attributes, setAttributes]       = useState([]);
    const [mainFileList, setMainFileList]   = useState([]);
    const [fileList, setFileList]           = useState([]);
    const [hasVariants, setHasVariants]     = useState(false);

    useEffect(() => {
        const fetchDropdowns = async () => {
            try {
                const catRes = await getDatas("/admin/category/list");
                if (catRes?.data) setCategories(catRes.data);
            } catch (err) {
                console.log("Could not load categories:", err);
            }

            try {
                const brandRes = await getDatas("/admin/brand/list");
                if (brandRes?.data) setBrands(brandRes.data);
            } catch (err) {
                console.log("Could not load brands:", err);
            }

            try {
                const attrRes = await getDatas("admin/attribute", { paginate_size: 100 });
                if (attrRes?.data?.items) setAttributes(attrRes.data.items);
            } catch (err) {
                console.log("Could not load attributes:", err);
            }
        };

        fetchDropdowns();
    }, []);

    const selectedCategoryId = Form.useWatch("category_id", form);

    // Fetch subcategories when category changes
    useEffect(() => {
        // Clear the previously selected subcategory
        form.setFieldsValue({ sub_category_id: undefined });

        if (!selectedCategoryId) {
            setSubCategories([]);
            return;
        }

        const fetchSubCategories = async () => {
            try {
                const subCatRes = await getDatas("admin/subcategory/list", { category_id: selectedCategoryId });
                if (subCatRes?.data) setSubCategories(subCatRes.data);
            } catch (err) {
                console.log("Could not load subcategories:", err);
            }
        };

        fetchSubCategories();
    }, [selectedCategoryId, form]);

    // Use fetched subcategories directly
    const filteredSubCategories = subCategories;

    // Handle form submit
    const handleSubmit = async (values) => {
        setSubmitting(true);
        try {
            const formData = new FormData();

            // Append basic form fields
            Object.keys(values).forEach((key) => {
                if (key === "gallery_images" || key === "variants" || key === "image") return;
                if (values[key] !== undefined && values[key] !== null) {
                    let val = values[key];
                    if (typeof val === 'boolean') {
                        val = val ? 1 : 0;
                    }
                    formData.append(key, val);
                }
            });

            if (mainFileList.length > 0 && mainFileList[0].originFileObj) {
                formData.append("image", mainFileList[0].originFileObj);
            }

            fileList.forEach((file) => {
                if (file.originFileObj) {
                    formData.append("gallery_images[]", file.originFileObj);
                }
            });

            if (hasVariants && values.variants && values.variants.length > 0) {
                values.variants.forEach((variant, index) => {
                    Object.keys(variant).forEach((vKey) => {
                        if (vKey === "attribute_values" && Array.isArray(variant[vKey])) {
                            variant[vKey].forEach((attrValId) => {
                                formData.append(`variants[${index}][attribute_values][]`, attrValId);
                            });
                        } else if (vKey === "image" && variant[vKey] && variant[vKey].length > 0) {
                            if (variant[vKey][0].originFileObj) {
                                formData.append(`variants[${index}][image]`, variant[vKey][0].originFileObj);
                            }
                        } else if (variant[vKey] !== undefined && variant[vKey] !== null) {
                            let val = variant[vKey];
                            if (typeof val === 'boolean') {
                                val = val ? 1 : 0;
                            }
                            formData.append(`variants[${index}][${vKey}]`, val);
                        }
                    });
                });
            }

            const response = await postData("admin/product", formData);

            if (response?.success || response?.id) {
                message.success("Product created successfully!");
                navigate("/products");
            } else {
                message.success("Product created!");
                navigate("/products");
            }
        } catch (error) {
            console.error("Failed to create product:", error);
            message.error(error?.response?.data?.message || "Failed to create product.");
            handleFormErrors(error, form, message.error);
        } finally {
            setSubmitting(false);
        }
    };

    const allAttributeValueOptions = attributes.flatMap((attr) =>
        (attr.attributeValues || []).map((val) => ({
            label: `${attr.name}: ${val.attribute_value}`,
            value: val.id,
        }))
    );

    return (
        <div className="add-product-page">
            <Breadcrumb
                items={[
                    { title: "Dashboard" },
                    { title: "Product", href: "/products" },
                    { title: "Add Product" },
                ]}
                style={{ marginBottom: 16 }}
            />

            <Form
                form={form}
                layout="vertical"
                initialValues={{
                    status: "active",
                    discount_type: "fixed",
                    discount_amount: 0,
                    current_stock: 0,
                    free_shipping: false,
                }}
                onFinish={handleSubmit}
            >
                <Card style={{ marginBottom: 24 }}>
                    <Flex justify="space-between" align="center" wrap="wrap" gap="small">
                        <Space align="center">
                            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/products")}>
                                Back
                            </Button>
                            <Title level={3} style={{ margin: 0 }}>
                                Create New Product
                            </Title>
                        </Space>
                        <Space>
                            <Button onClick={() => navigate("/products")}>Cancel</Button>
                            <Button type="primary" icon={<SaveOutlined />} loading={submitting} htmlType="submit">
                                Save Product
                            </Button>
                        </Space>
                    </Flex>
                </Card>

                <Row gutter={[24, 24]}>
                    <Col xs={24} lg={16}>
                        <Card
                            title={
                                <Space>
                                    <AppstoreOutlined />
                                    <span>General Information</span>
                                </Space>
                            }
                            style={{ marginBottom: 24 }}
                        >
                            <Form.Item label="Product Name" name="name" rules={[{ required: true, message: "Please enter product name" }]}>
                                <Input placeholder="e.g. Stylish Sunglass" size="large" />
                            </Form.Item>

                            <Row gutter={16}>
                                <Col xs={24} sm={12}>
                                    <Form.Item label="Category" name="category_id" rules={[{ required: true, message: "Please select category" }]}>
                                        <Select placeholder="Select Category" showSearch optionFilterProp="label" options={categories.map((c) => ({ label: c.name, value: c.id }))}/>
                                    </Form.Item>
                                </Col>

                                <Col xs={24} sm={12}>
                                    <Form.Item label="Sub Category" name="sub_category_id">
                                        <Select
                                            placeholder="Select Sub Category"
                                            allowClear
                                            showSearch
                                            optionFilterProp="label"
                                            options={filteredSubCategories.map((sc) => ({ label: sc.name, value: sc.id }))}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col xs={24} sm={12}>
                                    <Form.Item label="Brand" name="brand_id">
                                        <Select placeholder="Select Brand" allowClear showSearch optionFilterProp="label" options={brands.map((b) => ({ label: b.name, value: b.id }))}/>
                                    </Form.Item>
                                </Col>

                                <Col xs={24} sm={12}>
                                    <Form.Item label="SKU" name="sku">
                                        <Input placeholder="e.g. SKU-1002" />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Card>

                        <Card
                            title={
                                <Space>
                                    <DollarOutlined />
                                    <span>Pricing & Inventory</span>
                                </Space>
                            }
                            style={{ marginBottom: 24 }}
                        >
                            <Row gutter={16}>
                                <Col xs={24} sm={8}>
                                    <Form.Item label="MRP (Original Price)" name="mrp" rules={[{ required: true, message: "Please enter MRP" }]}>
                                        <InputNumber placeholder="0.00" prefix="৳" style={{ width: "100%" }} min={0}/>
                                    </Form.Item>
                                </Col>

                                <Col xs={24} sm={8}>
                                    <Form.Item label="Selling Price" name="sell_price" rules={[{ required: true, message: "Please enter selling price" }]}>
                                        <InputNumber placeholder="0.00" prefix="৳" style={{ width: "100%" }} min={0}/>
                                    </Form.Item>
                                </Col>

                                <Col xs={24} sm={8}>
                                    <Form.Item label="Buying Price" name="buy_price">
                                        <InputNumber placeholder="0.00" prefix="৳" style={{ width: "100%" }} min={0}/>
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col xs={24} sm={8}>
                                    <Form.Item label="Current Stock" name="current_stock">
                                        <InputNumber placeholder="0" style={{ width: "100%" }} min={0} />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={8}>
                                    <Form.Item label="Total Sell Quantity" name="total_sell_quantity">
                                        <InputNumber placeholder="0" style={{ width: "100%" }} min={0} />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={8}>
                                    <Form.Item label="Free Shipping" name="free_shipping" valuePropName="checked">
                                        <Switch />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Card>

                        <Card
                            title={
                                <Space>
                                    <FileTextOutlined />
                                    <span>Product Descriptions</span>
                                </Space>
                            }
                            style={{ marginBottom: 24 }}
                        >
                            <Form.Item label="Short Description" name="short_description">
                                <ReactQuill theme="snow" style={{ height: '150px', marginBottom: '50px' }} placeholder="Brief summary of the product..." />
                            </Form.Item>

                            <Form.Item label="Full Description" name="description">
                                <ReactQuill theme="snow" style={{ height: '250px', marginBottom: '50px' }} placeholder="Detailed product specifications & features..." />
                            </Form.Item>
                        </Card>

                        <Card
                            title={
                                <Space>
                                    <PictureOutlined />
                                    <span>Product Media</span>
                                </Space>
                            }
                            style={{ marginBottom: 24 }}
                        >
                            <Form.Item label="Main Image" required tooltip="This is the primary image of the product.">
                                <Upload listType="picture-card" maxCount={1} fileList={mainFileList} onChange={({ fileList }) => setMainFileList(fileList)} beforeUpload={() => false}>
                                    {mainFileList.length < 1 && (
                                        <div>
                                            <PlusOutlined />
                                            <div style={{ marginTop: 8 }}>Upload Main</div>
                                        </div>
                                    )}
                                </Upload>
                            </Form.Item>

                            <Form.Item label="Gallery Images">
                                <Upload.Dragger multiple listType="picture-card" fileList={fileList} onChange={({ fileList }) => setFileList(fileList)} beforeUpload={() => false}>
                                    <p className="ant-upload-drag-icon">
                                        <InboxOutlined style={{ fontSize: 36, color: "#1677ff" }} />
                                    </p>
                                    <p className="ant-upload-text">Click or drag images to this area to upload</p>
                                    <p className="ant-upload-hint">Support for PNG, JPG, JPEG formats</p>
                                </Upload.Dragger>
                            </Form.Item>

                            <Form.Item label="Video URL" name="video_url">
                                <Input placeholder="e.g. https://youtube.com/watch?v=..." />
                            </Form.Item>
                        </Card>

                        <Card
                            title={
                                <Flex justify="space-between" align="center">
                                    <Space>
                                        <TagsOutlined />
                                        <span>Product Variants</span>
                                    </Space>
                                    <Switch checked={hasVariants} onChange={(checked) => setHasVariants(checked)} checkedChildren="Enabled" unCheckedChildren="Disabled"/>
                                </Flex>
                            }
                            style={{ marginBottom: 24 }}
                        >
                            {!hasVariants ? (
                                <Text type="secondary">
                                    Enable variants if this product has multiple sizes, colors, or options.
                                </Text>
                            ) : (
                                <Form.List name="variants">
                                    {(fields, { add, remove }) => (
                                        <>
                                            {fields.map(({ key, name, ...restField }) => (
                                                <Card
                                                    key={key}
                                                    type="inner"
                                                    title={`Variant #${name + 1}`}
                                                    extra={
                                                        <Button type="text" danger icon={<DeleteOutlined />} onClick={() => remove(name)}/>
                                                    }
                                                    style={{ marginBottom: 16 }}
                                                >
                                                    <Row gutter={16}>
                                                        <Col xs={24} sm={12}>
                                                            <Form.Item {...restField} label="Attribute Values" name={[name, "attribute_values"]}>
                                                                <Select mode="multiple" placeholder="Select attributes (e.g. Size: M, Color: Blue)" options={allAttributeValueOptions}/>
                                                            </Form.Item>
                                                        </Col>
                                                        <Col xs={24} sm={12}>
                                                            <Form.Item {...restField} label="Variant SKU" name={[name, "sku"]}>
                                                                <Input placeholder="Variant SKU" />
                                                            </Form.Item>
                                                        </Col>
                                                    </Row>

                                                    <Row gutter={16}>
                                                        <Col xs={24} sm={6}>
                                                            <Form.Item {...restField} label="MRP" name={[name, "mrp"]} rules={[{ required: true, message: "MRP is required" }]}>
                                                                <InputNumber placeholder="0.00" prefix="৳" style={{ width: "100%" }} />
                                                            </Form.Item>
                                                        </Col>

                                                        <Col xs={24} sm={6}>
                                                            <Form.Item {...restField} label="Selling Price" name={[name, "sell_price"]} rules={[{ required: true, message: "Selling price is required" }]}>
                                                                <InputNumber placeholder="0.00" prefix="৳" style={{ width: "100%" }} />
                                                            </Form.Item>
                                                        </Col>

                                                        <Col xs={24} sm={6}>
                                                            <Form.Item {...restField} label="Buying Price" name={[name, "buy_price"]}>
                                                                <InputNumber placeholder="0.00" prefix="৳" style={{ width: "100%" }} />
                                                            </Form.Item>
                                                        </Col>

                                                        <Col xs={24} sm={6}>
                                                            <Form.Item {...restField} label="Stock" name={[name, "current_stock"]}>
                                                                <InputNumber placeholder="0" style={{ width: "100%" }} min={0} />
                                                            </Form.Item>
                                                        </Col>
                                                    </Row>

                                                    <Row gutter={16}>
                                                        <Col xs={24} sm={8}>
                                                            <Form.Item {...restField} label="Variant Status" name={[name, "status"]} initialValue="active" rules={[{ required: true, message: "Status is required" }]}>
                                                                <Select
                                                                    options={[
                                                                        { label: "Active", value: "active" },
                                                                        { label: "Inactive", value: "inactive" },
                                                                    ]}
                                                                />
                                                            </Form.Item>
                                                        </Col>
                                                        <Col xs={24} sm={8}>
                                                            <Form.Item {...restField} label="Default Variant" name={[name, "is_default"]} valuePropName="checked" initialValue={false}>
                                                                <Switch />
                                                            </Form.Item>
                                                        </Col>
                                                        <Col xs={24} sm={8}>
                                                            <Form.Item {...restField} label="Variant Image" name={[name, "image"]} valuePropName="fileList" getValueFromEvent={(e) => Array.isArray(e) ? e : e?.fileList}>
                                                                <Upload maxCount={1} beforeUpload={() => false} listType="picture">
                                                                    <Button icon={<UploadOutlined />}>Upload Image</Button>
                                                                </Upload>
                                                            </Form.Item>
                                                        </Col>
                                                    </Row>

                                                    <Row gutter={16}>
                                                        <Col xs={24} sm={12}>
                                                            <Form.Item {...restField} label="Short Description" name={[name, "short_description"]}>
                                                                <ReactQuill theme="snow" style={{ height: '150px', marginBottom: '50px' }} placeholder="Variant short description..." />
                                                            </Form.Item>
                                                        </Col>
                                                        <Col xs={24} sm={12}>
                                                            <Form.Item {...restField} label="Full Description" name={[name, "description"]}>
                                                                <ReactQuill theme="snow" style={{ height: '150px', marginBottom: '50px' }} placeholder="Variant full description..." />
                                                            </Form.Item>
                                                        </Col>
                                                    </Row>
                                                </Card>
                                            ))}

                                            <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                                Add Variant
                                            </Button>
                                        </>
                                    )}
                                </Form.List>
                            )}
                        </Card>
                    </Col>

                    <Col xs={24} lg={8}>
                        <Card title="Publish Status" style={{ marginBottom: 24 }}>
                            <Form.Item label="Status" name="status">
                                <Radio.Group buttonStyle="solid">
                                    <Radio.Button value="active">Active</Radio.Button>
                                    <Radio.Button value="inactive">Inactive</Radio.Button>
                                </Radio.Group>
                            </Form.Item>
                        </Card>

                        <Card
                            title={
                                <Space>
                                    <GlobalOutlined />
                                    <span>SEO & Meta Data</span>
                                </Space>
                            }
                        >
                            <Form.Item label="Meta Title" name="meta_title">
                                <Input placeholder="SEO Title" />
                            </Form.Item>

                            <Form.Item label="Meta Keywords" name="meta_keywords">
                                <Input placeholder="e.g. sunglasses, fashion, eyewear" />
                            </Form.Item>

                            <Form.Item label="Meta Description" name="meta_description">
                                <TextArea rows={3} placeholder="SEO Description..." />
                            </Form.Item>
                        </Card>
                    </Col>
                </Row>
            </Form>

            <ProductAiChat form={form} categories={categories} subCategories={filteredSubCategories} brands={brands} />
        </div>
    );
}
