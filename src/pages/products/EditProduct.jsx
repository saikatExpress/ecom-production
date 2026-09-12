import { AppstoreOutlined, ArrowLeftOutlined, CheckCircleFilled, DeleteOutlined, DollarOutlined, EditOutlined, FileTextOutlined, GlobalOutlined, InboxOutlined, LinkOutlined, PictureOutlined, PlusOutlined, SafetyCertificateOutlined, SaveOutlined, SyncOutlined, TagsOutlined, ThunderboltOutlined, UploadOutlined } from "@ant-design/icons";
import { Breadcrumb, Button, Card, Col, Flex, Form, Input, InputNumber, message, Progress, Radio, Row, Select, Space, Spin, Switch, Tooltip, Typography, Upload } from "antd";
import { useEffect, useRef, useState } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { useNavigate, useParams } from "react-router-dom";
import ProductAiChat from "../../components/product/ProductAiChat";
import useTitle from "../../hooks/useTitle";
import { getData, getDatas, postData } from "../../services/request";
import { handleFormErrors } from "../../utils/formUtils";
import "./ProductForm.css";

const { Title, Text } = Typography;
const { TextArea }    = Input;

const defaultValues = {
    status             : "active",
    discount_type      : "fixed",
    discount_amount    : 0,
    current_stock      : 0,
    total_sell_quantity: 0,
    free_shipping      : false,
};

const stripHtml = (html) => (html || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

export default function EditProduct() {
    // Hook
    useTitle("Edit Product");

    // Variable
    const { id }   = useParams();
    const navigate = useNavigate();
    const [form]   = Form.useForm();

    // States
    const [loading, setLoading]                     = useState(true);
    const [submitting, setSubmitting]               = useState(false);
    const [categories, setCategories]               = useState([]);
    const [subCategories, setSubCategories]         = useState([]);
    const [brands, setBrands]                       = useState([]);
    const [attributes, setAttributes]               = useState([]);
    const [mainFileList, setMainFileList]           = useState([]);
    const [fileList, setFileList]                   = useState([]);
    const [deletedGalleryIds, setDeletedGalleryIds] = useState([]);
    const [hasVariants, setHasVariants]             = useState(false);
    const [formValues, setFormValues]               = useState({ ...defaultValues });
    const [activeSection, setActiveSection]         = useState("general");
    const sectionRefs                               = useRef({});

    const registerSection = (key) => (el) => {
        if (el && sectionRefs.current[key] !== el) sectionRefs.current[key] = el;
    };

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

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await getData(`/admin/product/${id}`);
                if (res?.success) {
                    const data  = res.data;
                    const values = {
                        name               : data.name,
                        sku                : data.sku,
                        category_id        : data.category?.id,
                        sub_category_id    : data.subCategory?.id,
                        brand_id           : data.brand?.id,
                        mrp                : data.mrp,
                        sell_price         : data.sell_price,
                        buy_price          : data.buy_price,
                        current_stock      : data.current_stock,
                        total_sell_quantity: data.total_sell_quantity,
                        free_shipping      : data.free_shipping === 1,
                        status             : data.status,
                        short_description  : data.short_description,
                        description        : data.description,
                        video_url          : data.video_url,
                        meta_title         : data.meta_title,
                        meta_keywords      : data.meta_keywords,
                        meta_description   : data.meta_description,
                    };

                    form.setFieldsValue(values);
                    setFormValues(values);

                    if (data.image) {
                        setMainFileList([{ uid: '-1', url: data.image, name: 'Main Image', status: 'done' }]);
                    }

                    if (data.gallery_images && data.gallery_images.length > 0) {
                        const galleries = data.gallery_images.map(g => ({
                            uid   : g.id.toString(),
                            url   : g.image,
                            name  : `Gallery Image ${g.id}`,
                            status: 'done',
                            dbId  : g.id
                        }));
                        setFileList(galleries);
                    }

                    if (data.variants && data.variants.length > 0) {
                        setHasVariants(true);
                        const formattedVariants = data.variants.map(v => ({
                            id               : v.id,
                            sku              : v.sku,
                            mrp              : v.mrp,
                            sell_price       : v.sell_price,
                            buy_price        : v.buy_price,
                            current_stock    : v.current_stock,
                            status           : v.status || 'active',
                            is_default       : v.is_default === 1,
                            short_description: v.short_description,
                            description      : v.description,
                            attribute_values : (v.attributeValues || v.attribute_values || []).map(av => av.id),
                            image            : v.img_path || v.image ? [{ uid: v.id.toString(), url: v.img_path || v.image, name: 'Variant Image', status: 'done' }] : []
                        }));
                        form.setFieldsValue({ variants: formattedVariants });
                    }
                }
            } catch (err) {
                console.log(err);
                message.error("Failed to fetch product data.");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchProduct();
        }
    }, [id, form]);

    const selectedCategoryId = Form.useWatch("category_id", form);

    useEffect(() => {
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
    }, [selectedCategoryId]);

    const filteredSubCategories = subCategories;

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) setActiveSection(entry.target.dataset.section);
                });
            },
            { rootMargin: "-15% 0px -70% 0px" }
        );

        Object.keys(sectionRefs.current).forEach((key) => {
            if (sectionRefs.current[key]) observer.observe(sectionRefs.current[key]);
        });

        return () => observer.disconnect();
    }, [hasVariants, loading]);

    const scrollToSection = (key) => {
        sectionRefs.current[key]?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const sections = [
        { key: "general",     label: "General Information", done: Boolean(formValues.name && formValues.category_id) },
        { key: "pricing",     label: "Pricing & Stock",     done: Boolean(formValues.mrp && formValues.sell_price) },
        { key: "media",       label: "Product Media",       done: mainFileList.length > 0 },
        { key: "description", label: "Descriptions",        done: Boolean(formValues.short_description && formValues.description) },
        { key: "seo",         label: "SEO & Meta Data",     done: Boolean(formValues.meta_title || formValues.meta_keywords || formValues.meta_description) },
    ];

    const progressPercent = Math.round((sections.filter((s) => s.done).length / sections.length) * 100);
    const requiredLeft    = (sections[0].done ? 0 : 1) + (sections[1].done ? 0 : 1);

    const handleValuesChange = (_changed, allValues) => {
        setFormValues(allValues);
    };

    const generateSku = () => {
        const now   = new Date();
        const rand  = Math.floor(1000 + Math.random() * 9000);
        const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}`;
        form.setFieldValue("sku", `SKU-${stamp}-${rand}`);
        message.success("SKU generated");
    };

    const discountUnit = formValues.discount_type === "percent" ? "%" : "৳";

    const handleSubmit = async (values) => {
        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('_method', 'PUT');

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

            if (deletedGalleryIds.length > 0) {
                deletedGalleryIds.forEach((deletedId) => {
                    formData.append("gallery_deleted_image_ids[]", deletedId);
                });
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

            const response = await postData(`admin/product/${id}`, formData);

            if (response?.success || response?.id) {
                message.success("Product updated successfully!");
                navigate("/products");
            } else {
                message.success("Product updated!");
                navigate("/products");
            }
        } catch (error) {
            console.error("Failed to update product:", error);
            message.error(error?.response?.data?.message || "Failed to update product.");
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

    if (loading) {
        return (
            <div className="product-form-page">
                <Breadcrumb
                    className="ap-breadcrumb"
                    items={[
                        { title: "Dashboard" },
                        { title: "Product", href: "/products" },
                        { title: "Edit Product" },
                    ]}
                />
                <div className="ap-page-loading">
                    <Spin size="large" />
                    <Text type="secondary">Loading product details...</Text>
                </div>
            </div>
        );
    }

    return (
        <div className="product-form-page">
            <Breadcrumb
                className="ap-breadcrumb"
                items={[
                    { title: "Dashboard" },
                    { title: "Product", href: "/products" },
                    { title: "Edit Product" },
                ]}
            />

            <Form form={form} layout="vertical" scrollToFirstError initialValues={{ ...defaultValues }} onValuesChange={handleValuesChange} onFinish={handleSubmit}>
                <div className="ap-toolbar">
                    <Flex className="ap-toolbar-inner" align="center" justify="space-between" wrap="wrap" gap={12}>
                        <Space align="center" size={12}>
                            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/products")} title="Back to product list"/>
                            <span className="ap-toolbar-badge">
                                <EditOutlined />
                            </span>
                            <div>
                                <Title level={4} className="ap-toolbar-title">
                                    Edit Product
                                </Title>
                                <Text type="secondary" className="ap-toolbar-sub">
                                    Update the product details below and save your changes
                                </Text>
                            </div>
                        </Space>

                        <Flex className="ap-toolbar-actions" align="center" gap={8} wrap="wrap">
                            <Button onClick={() => navigate("/products")}>Cancel</Button>
                            <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={submitting}>
                                Update Product
                            </Button>
                        </Flex>
                    </Flex>
                    <Progress
                        className="ap-toolbar-progress"
                        percent={progressPercent}
                        showInfo={false}
                        size={["100%", 5]}
                        strokeColor={{ "0%": "#1677ff", "100%": "#52c41a" }}
                    />
                </div>

                <Row gutter={[20, 20]}>
                    <Col xs={24} lg={16}>
                        <div ref={registerSection("general")} data-section="general">
                            <Card
                                className="ap-card"
                                title={
                                    <Space>
                                        <span className="ap-section-icon ap-section-icon--blue">
                                            <AppstoreOutlined />
                                        </span>
                                        <span>General Information</span>
                                    </Space>
                                }
                            >
                                <Form.Item label="Product Name" name="name" rules={[{ required: true, message: "Please enter product name" }]}>
                                    <Input
                                        placeholder="e.g. Stylish Sunglass"
                                        size="large"
                                        showCount
                                        maxLength={120}
                                        allowClear
                                    />
                                </Form.Item>

                                <Row gutter={16}>
                                    <Col xs={24} sm={12}>
                                        <Form.Item
                                            label="Category"
                                            name="category_id"
                                            rules={[{ required: true, message: "Please select category" }]}
                                        >
                                            <Select
                                                placeholder="Select Category"
                                                showSearch
                                                allowClear
                                                optionFilterProp="label"
                                                options={categories.map((c) => ({ label: c.name, value: c.id }))}
                                            />
                                        </Form.Item>
                                    </Col>

                                    <Col xs={24} sm={12}>
                                        <Form.Item label="Sub Category" name="sub_category_id">
                                            <Select
                                                placeholder="Select Sub Category"
                                                allowClear
                                                disabled={!selectedCategoryId}
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
                                            <Select
                                                placeholder="Select Brand"
                                                allowClear
                                                showSearch
                                                optionFilterProp="label"
                                                options={brands.map((b) => ({ label: b.name, value: b.id }))}
                                            />
                                        </Form.Item>
                                    </Col>

                                    <Col xs={24} sm={12}>
                                        <Form.Item
                                            label="SKU"
                                            name="sku"
                                            tooltip="Unique stock keeping unit. Leave empty to skip."
                                        >
                                            <Input
                                                placeholder="e.g. SKU-1002"
                                                spellCheck={false}
                                                suffix={
                                                    <Tooltip title="Generate SKU">
                                                        <SyncOutlined
                                                            onClick={generateSku}
                                                            style={{ cursor: "pointer", color: "#1677ff" }}
                                                        />
                                                    </Tooltip>
                                                }
                                            />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Card>
                        </div>

                        {/* Pricing & Inventory */}
                        <div ref={registerSection("pricing")} data-section="pricing">
                            <Card
                                className="ap-card"
                                title={
                                    <Space>
                                        <span className="ap-section-icon ap-section-icon--green">
                                            <DollarOutlined />
                                        </span>
                                        <span>Pricing & Inventory</span>
                                    </Space>
                                }
                            >
                                <Row gutter={16}>
                                    <Col xs={24} sm={8}>
                                        <Form.Item
                                            label="MRP"
                                            name="mrp"
                                            tooltip="Original price before any discount"
                                            rules={[{ required: true, message: "Please enter MRP" }]}
                                        >
                                            <InputNumber placeholder="0.00" prefix="৳" style={{ width: "100%" }} min={0} />
                                        </Form.Item>
                                    </Col>

                                    <Col xs={24} sm={8}>
                                        <Form.Item
                                            label="Selling Price"
                                            name="sell_price"
                                            tooltip="Final price the customer pays"
                                            rules={[{ required: true, message: "Please enter selling price" }]}
                                        >
                                            <InputNumber placeholder="0.00" prefix="৳" style={{ width: "100%" }} min={0} />
                                        </Form.Item>
                                    </Col>

                                    <Col xs={24} sm={8}>
                                        <Form.Item label="Buying Price" name="buy_price" tooltip="Your purchase cost">
                                            <InputNumber placeholder="0.00" prefix="৳" style={{ width: "100%" }} min={0} />
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
                                            <Switch checkedChildren="Yes" unCheckedChildren="No" />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Card>
                        </div>

                        {/* Product Media */}
                        <div ref={registerSection("media")} data-section="media">
                            <Card
                                className="ap-card"
                                title={
                                    <Space>
                                        <span className="ap-section-icon ap-section-icon--cyan">
                                            <PictureOutlined />
                                        </span>
                                        <span>Product Media</span>
                                    </Space>
                                }
                            >
                                <Form.Item
                                    label="Main Image"
                                    required
                                    tooltip="This is the primary image of the product."
                                >
                                    <Upload
                                        className="ap-main-upload"
                                        listType="picture-card"
                                        maxCount={1}
                                        fileList={mainFileList}
                                        onChange={({ fileList }) => setMainFileList(fileList)}
                                        beforeUpload={() => false}
                                    >
                                        {mainFileList.length < 1 && (
                                            <div>
                                                <PlusOutlined className="ap-main-upload-icon" />
                                                <div className="ap-main-upload-label">Upload Main Image</div>
                                                <div className="ap-main-upload-hint">JPG, PNG or WEBP · Max 5MB</div>
                                            </div>
                                        )}
                                    </Upload>
                                </Form.Item>

                                <Form.Item label="Gallery Images">
                                    <Upload.Dragger
                                        className="ap-gallery"
                                        multiple
                                        listType="picture-card"
                                        fileList={fileList}
                                        onChange={({ fileList }) => setFileList(fileList)}
                                        beforeUpload={() => false}
                                        onRemove={(file) => {
                                            if (file.dbId) {
                                                setDeletedGalleryIds(prev => [...prev, file.dbId]);
                                            }
                                        }}
                                    >
                                        <p className="ant-upload-drag-icon">
                                            <InboxOutlined style={{ fontSize: 40, color: "#1677ff" }} />
                                        </p>
                                        <p className="ant-upload-text">Click or drag images to this area to upload</p>
                                        <p className="ant-upload-hint">Support for PNG, JPG, WEBP formats</p>
                                    </Upload.Dragger>
                                    {fileList.length > 0 && (
                                        <div className="ap-gallery-note">
                                            <span>
                                                {fileList.length} image{fileList.length > 1 ? "s" : ""}{fileList.some((f) => f.dbId) ? " · removed images are deleted on save" : ""}
                                            </span>
                                            <Button
                                                type="link"
                                                size="small"
                                                onClick={() => {
                                                    fileList.filter((f) => f.dbId).forEach((f) => {
                                                        setDeletedGalleryIds(prev => [...prev, f.dbId]);
                                                    });
                                                    setFileList([]);
                                                }}
                                            >
                                                Remove all
                                            </Button>
                                        </div>
                                    )}
                                </Form.Item>

                                <Form.Item label="Video URL" name="video_url">
                                    <Input prefix={<LinkOutlined style={{ color: "#999" }} />} placeholder="e.g. https://youtube.com/watch?v=..." />
                                </Form.Item>
                            </Card>
                        </div>

                        {/* Descriptions */}
                        <div ref={registerSection("description")} data-section="description">
                            <Card
                                className="ap-card"
                                title={
                                    <Space>
                                        <span className="ap-section-icon ap-section-icon--purple">
                                            <FileTextOutlined />
                                        </span>
                                        <span>Product Descriptions</span>
                                    </Space>
                                }
                            >
                                <Form.Item label="Short Description" name="short_description" extra="One or two sentences that summarize the product.">
                                    <ReactQuill
                                        theme="snow"
                                        style={{ height: "140px", marginBottom: "50px" }}
                                        placeholder="Brief summary of the product..."
                                    />
                                </Form.Item>

                                <Form.Item label="Full Description" name="description" extra="Detailed specifications, features and benefits.">
                                    <ReactQuill
                                        theme="snow"
                                        style={{ height: "220px", marginBottom: "50px" }}
                                        placeholder="Detailed product specifications & features..."
                                    />
                                </Form.Item>
                            </Card>
                        </div>

                        {/* Variants */}
                        <div ref={registerSection("variants")} data-section="variants">
                            <Card
                                className="ap-card"
                                title={
                                    <Flex justify="space-between" align="center" wrap="wrap" gap={8}>
                                        <Space>
                                            <span className="ap-section-icon ap-section-icon--orange">
                                                <TagsOutlined />
                                            </span>
                                            <span>Product Variants</span>
                                        </Space>
                                        <Switch
                                            checked={hasVariants}
                                            onChange={(checked) => setHasVariants(checked)}
                                            checkedChildren="Enabled"
                                            unCheckedChildren="Disabled"
                                        />
                                    </Flex>
                                }
                            >
                                {!hasVariants ? (
                                    <Flex vertical align="center" gap={8} style={{ padding: "12px 0", textAlign: "center" }}>
                                        <TagsOutlined style={{ fontSize: 34, color: "#d9d9d9" }} />
                                        <Text type="secondary">
                                            Enable variants if this product has multiple sizes, colors, or options.
                                        </Text>
                                    </Flex>
                                ) : (
                                    <Form.List name="variants">
                                        {(fields, { add, remove }) => (
                                            <>
                                                {fields.map(({ key, name, ...restField }) => (
                                                    <Card
                                                        key={key}
                                                        type="inner"
                                                        className="ap-variant-card"
                                                        title={
                                                            <Space>
                                                                <span className="ap-variant-badge">{name + 1}</span>
                                                                <span>Variant</span>
                                                            </Space>
                                                        }
                                                        extra={
                                                            <Tooltip title="Remove variant">
                                                                <Button
                                                                    type="text"
                                                                    danger
                                                                    icon={<DeleteOutlined />}
                                                                    onClick={() => remove(name)}
                                                                />
                                                            </Tooltip>
                                                        }
                                                    >
                                                        <Form.Item {...restField} name={[name, "id"]} hidden>
                                                            <Input />
                                                        </Form.Item>

                                                        <Row gutter={16}>
                                                            <Col xs={24} sm={12}>
                                                                <Form.Item {...restField} label="Attribute Values" name={[name, "attribute_values"]}>
                                                                    <Select
                                                                        mode="multiple"
                                                                        placeholder="Select attributes (e.g. Size: M, Color: Blue)"
                                                                        optionFilterProp="label"
                                                                        options={allAttributeValueOptions}
                                                                    />
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
                                                                    <ReactQuill
                                                                        theme="snow"
                                                                        style={{ height: "120px", marginBottom: "50px" }}
                                                                        placeholder="Variant short description..."
                                                                    />
                                                                </Form.Item>
                                                            </Col>
                                                            <Col xs={24} sm={12}>
                                                                <Form.Item {...restField} label="Full Description" name={[name, "description"]}>
                                                                    <ReactQuill
                                                                        theme="snow"
                                                                        style={{ height: "120px", marginBottom: "50px" }}
                                                                        placeholder="Variant full description..."
                                                                    />
                                                                </Form.Item>
                                                            </Col>
                                                        </Row>
                                                    </Card>
                                                ))}

                                                <Button
                                                    className="ap-add-variant"
                                                    type="dashed"
                                                    onClick={() => add()}
                                                    block
                                                    icon={<PlusOutlined />}
                                                >
                                                    Add Variant
                                                </Button>
                                            </>
                                        )}
                                    </Form.List>
                                )}
                            </Card>
                        </div>
                    </Col>

                    {/* ── Sidebar ── */}
                    <Col xs={24} lg={8}>
                        <div className="ap-side">
                            {/* Quick Actions */}
                            <div className="ap-side-sticky">
                                <Card className="ap-card">
                                    <div className="ap-quick-head">
                                        <span className="ap-section-icon ap-section-icon--blue">
                                            <ThunderboltOutlined />
                                        </span>
                                        <Title level={5} className="ap-quick-title">
                                            Quick Actions
                                        </Title>
                                    </div>

                                    <Progress
                                        percent={progressPercent}
                                        size="small"
                                        strokeColor={{ from: "#1677ff", to: "#52c41a" }}
                                    />
                                    <Text type="secondary" className="ap-quick-hint">
                                        {requiredLeft === 0
                                            ? "All required fields are filled"
                                            : `${requiredLeft} required field${requiredLeft > 1 ? "s" : ""} remaining`}
                                    </Text>

                                    <div className="ap-progress-list">
                                        {sections.map((section) => (
                                            <div
                                                key={section.key}
                                                className={`ap-progress-item ${section.done ? "ap-done" : "ap-todo"} ${activeSection === section.key ? "ap-active" : ""}`}
                                                onClick={() => scrollToSection(section.key)}
                                            >
                                                <span className="ap-progress-dot">
                                                    {section.done && <CheckCircleFilled />}
                                                </span>
                                                <span className="ap-progress-label">{section.label}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <Button
                                        className="ap-save-big"
                                        type="primary"
                                        block
                                        htmlType="submit"
                                        loading={submitting}
                                        icon={<SaveOutlined />}
                                    >
                                        Update Product
                                    </Button>
                                    <Button className="ap-lesser-btn" block onClick={() => navigate("/products")}>
                                        Back to Product List
                                    </Button>
                                </Card>
                            </div>

                            {/* Publish Status */}
                            <Card
                                className="ap-card"
                                title={
                                    <Space>
                                        <span className="ap-section-icon ap-section-icon--green">
                                            <SafetyCertificateOutlined />
                                        </span>
                                        <span>Publish Status</span>
                                    </Space>
                                }
                            >
                                <Form.Item label="Status" name="status" style={{ marginBottom: 8 }}>
                                    <Radio.Group buttonStyle="solid" className="ap-status-group" size="large">
                                        <Radio.Button value="active">Active</Radio.Button>
                                        <Radio.Button value="inactive">Inactive</Radio.Button>
                                    </Radio.Group>
                                </Form.Item>

                                {formValues.status === "active" ? (
                                    <div className="ap-status-note ap-status-note--active">
                                        <SafetyCertificateOutlined className="ap-status-icon" />
                                        This product is <strong>visible</strong> on the storefront.
                                    </div>
                                ) : (
                                    <div className="ap-status-note ap-status-note--draft">
                                        <SafetyCertificateOutlined className="ap-status-icon" />
                                        This product is <strong>inactive</strong> and hidden from the storefront.
                                    </div>
                                )}
                            </Card>

                            {/* SEO & Meta Data */}
                            <Card
                                className="ap-card"
                                title={
                                    <Space>
                                        <span className="ap-section-icon ap-section-icon--purple">
                                            <GlobalOutlined />
                                        </span>
                                        <span>SEO & Meta Data</span>
                                    </Space>
                                }
                            >
                                <div className="ap-serp">
                                    <div className="ap-serp-url">
                                        yourstore.com/products/{formValues.sku ? String(formValues.sku).toLowerCase() : "your-product"}
                                    </div>
                                    <div className="ap-serp-title">
                                        {formValues.meta_title || "Your product title will appear here"}
                                    </div>
                                    <div className="ap-serp-desc">
                                        {stripHtml(formValues.meta_description).slice(0, 160) ||
                                            "Your meta description will be shown in search results..."}
                                    </div>
                                </div>

                                <Form.Item label="Meta Title" name="meta_title" tooltip="Best if kept under 60 characters">
                                    <Input placeholder="SEO Title" showCount maxLength={60} />
                                </Form.Item>

                                <Form.Item label="Meta Keywords" name="meta_keywords">
                                    <Input placeholder="e.g. sunglasses, fashion, eyewear" />
                                </Form.Item>

                                <Form.Item label="Meta Description" name="meta_description">
                                    <TextArea rows={4} showCount maxLength={160} placeholder="SEO Description..." />
                                </Form.Item>
                            </Card>
                        </div>
                    </Col>
                </Row>

                {/* ── Mobile bottom bar ── */}
                <div className="ap-mobile-bottombar">
                    <Button onClick={() => navigate("/products")}>Cancel</Button>
                    <Button type="primary" htmlType="submit" loading={submitting} icon={<SaveOutlined />}>
                        Update Product
                    </Button>
                </div>
            </Form>

            <ProductAiChat form={form} categories={categories} subCategories={filteredSubCategories} brands={brands} />
        </div>
    );
}