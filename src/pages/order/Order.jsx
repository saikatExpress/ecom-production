import { CalendarOutlined, ClearOutlined, DeleteOutlined, DollarOutlined, EditOutlined, EnvironmentOutlined, EyeOutlined, FilterOutlined, HistoryOutlined, InfoCircleOutlined, PhoneOutlined, PlusOutlined, PrinterOutlined, ReloadOutlined, SearchOutlined, ShoppingCartOutlined, WhatsAppOutlined } from "@ant-design/icons";
import { Breadcrumb, Button, Card, Col, DatePicker, Dropdown, Flex, Form, Input, InputNumber, Modal, Popconfirm, Row, Select, Space, Table, Tabs, Tag, Tooltip, Typography, message } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import usePermissions from "../../hooks/usePermissions";
import useTitle from "../../hooks/useTitle";
import { deleteData, getDatas, postData, putData } from "../../services/request";
import OrderPreview from "../../components/order/OrderPreview";
import OrderHistory from "../../components/order/OrderHistory";
import NormalInvoice from "./invoice/NormalInvoice";
import A5Invoice from "./invoice/A5Invoice";
import PosInvoice from "./invoice/PosInvoice";

const { Title, Text } = Typography;

const Order = () => {
    // Hook
    useTitle("Order List");

    // Variable
    const navigate          = useNavigate();
    const { hasPermission } = usePermissions();
    const [form]            = Form.useForm();
    const [noteForm]        = Form.useForm();

    // States
    const [orders, setOrders]                 = useState([]);
    const [statuses, setStatuses]             = useState([]);
    const [loading, setLoading]               = useState(false);
    const [totalAllOrders, setTotalAllOrders] = useState(0);
    const [showAdvanced, setShowAdvanced]         = useState(false);
    const [customerTypes, setCustomerTypes]       = useState([]);
    const [districts, setDistricts]               = useState([]);
    const [deliveryGateways, setDeliveryGateways] = useState([]);
    const [paymentGateways, setPaymentGateways]   = useState([]);
    const [couriers, setCouriers]                 = useState([]);
    const [users, setUsers]                       = useState([]);
    const [previewOpen, setPreviewOpen]           = useState(false);
    const [previewId, setPreviewId]               = useState(null);

    // Note states
    const [noteModalOpen, setNoteModalOpen]         = useState(false);
    const [noteOrderId, setNoteOrderId]             = useState(null);
    const [addingNote, setAddingNote]               = useState(false);
    const [viewNoteModalOpen, setViewNoteModalOpen] = useState(false);
    const [viewNotes, setViewNotes]                 = useState([]);
    const [notesLoading, setNotesLoading]           = useState(false);
    
    // History states
    const [historyModalOpen, setHistoryModalOpen] = useState(false);
    const [historyOrderId, setHistoryOrderId]     = useState(null);

    // Print states
    const [printModalOpen, setPrintModalOpen] = useState(false);
    const [printType, setPrintType]           = useState(null);
    const [printOrderData, setPrintOrderData] = useState(null);

    // Selection state
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);

    const [filters, setFilters] = useState({
        search_key         : '',
        status_id          : null,
        paid_status        : null,
        customer_type_id   : null,
        delivery_gateway_id: null,
        payment_gateway_id : null,
        district_id        : null,
        courier_id         : null,
        assign_user_id     : null,
        prepared_by        : null,
        date_from          : null,
        date_to            : null,
        min_amount         : null,
        max_amount         : null,
        sort_by            : 'id',
        sort_direction     : 'desc'
    });

    const [pagination, setPagination] = useState({ current_page: 1, per_page: 25, total: 0 });

    const fetchOrders = async (currentFilters, page = 1, perPage = 25) => {
        setLoading(true);
        try {
            const params = {
                paginate_size: perPage,
                page: page,
                ...currentFilters
            };

            Object.keys(params).forEach(key => {
                if (params[key] === null || params[key] === '') {
                    delete params[key];
                }
            });

            const res = await getDatas("/admin/order", params);

            if (res?.success && res?.data) {
                if (res.data.items) {
                    setOrders(res.data.items);
                }
                if (res.data.pagination) {
                    setPagination(res.data.pagination);
                    if (!currentFilters.status_id) {
                        setTotalAllOrders(res.data.pagination.total);
                    }
                }
                if (res.data.statuses) {
                    setStatuses(res.data.statuses);
                }
            }
        } catch (error) {
            console.error("Failed to fetch orders:", error);
            message.error(error?.response?.data?.message || "Failed to fetch orders.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchDropdownData = async () => {
            try {
                const [customerTypesRes, districtsRes, deliveryGatewaysRes, paymentGatewaysRes, couriersRes, usersRes] = await Promise.all([
                    getDatas("/admin/customer-type/list"),
                    getDatas("/admin/district/list"),
                    getDatas("/admin/delivery-gateway/list"),
                    getDatas("/admin/payment-gateway/list"),
                    getDatas("/admin/courier/list"),
                    getDatas("/admin/user/list")
                ]);

                if (customerTypesRes?.success && customerTypesRes?.data) {
                    setCustomerTypes(customerTypesRes.data);
                }
                
                if (districtsRes?.success && districtsRes?.data) {
                    setDistricts(districtsRes.data);
                }

                if (deliveryGatewaysRes?.success && deliveryGatewaysRes?.data) {
                    setDeliveryGateways(deliveryGatewaysRes.data);
                }

                if (paymentGatewaysRes?.success && paymentGatewaysRes?.data) {
                    setPaymentGateways(paymentGatewaysRes.data);
                }

                if (couriersRes?.success && couriersRes?.data) {
                    setCouriers(couriersRes.data);
                }

                if (usersRes?.success && usersRes?.data) {
                    setUsers(usersRes.data);
                }
            } catch (error) {
                console.error("Failed to fetch dropdown data:", error);
            }
        };
        fetchDropdownData();
    }, []);

    useEffect(() => {
        fetchOrders(filters, pagination.current_page, pagination.per_page);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters.status_id]);

    const handleTableChange = (paginationOpts, filtersOpts, sorter) => {
        let newSortBy = filters.sort_by;
        let newSortDir = filters.sort_direction;

        if (sorter.field) {
            newSortBy = sorter.field;
            newSortDir = sorter.order === 'ascend' ? 'asc' : 'desc';
        }

        setFilters(prev => ({
            ...prev,
            sort_by: newSortBy,
            sort_direction: newSortDir
        }));

        fetchOrders({ ...filters, sort_by: newSortBy, sort_direction: newSortDir }, paginationOpts.current, paginationOpts.pageSize);
    };

    const handleFilterSubmit = (values) => {
        const date_from = values.dateRange ? values.dateRange[0].format('YYYY-MM-DD') : null;
        const date_to = values.dateRange ? values.dateRange[1].format('YYYY-MM-DD') : null;

        const newFilters = {
            ...filters,
            ...values,
            date_from,
            date_to
        };
        delete newFilters.dateRange;

        setFilters(newFilters);
        fetchOrders(newFilters, 1, pagination.per_page);
    };

    const handleReset = () => {
        form.resetFields();
        const resetFilters = {
            search_key: '',
            status_id: filters.status_id,
            sort_by: 'id',
            sort_direction: 'desc'
        };
        setFilters(resetFilters);
        fetchOrders(resetFilters, 1, pagination.per_page);
    };

    let activeMainTab = 'all';
    if (filters.status_id) {
        if ([4, 13, 14].includes(filters.status_id)) {
            activeMainTab = '4';
        } else if ([9, 10, 11, 12].includes(filters.status_id)) {
            activeMainTab = 'rnd';
        } else {
            activeMainTab = filters.status_id.toString();
        }
    }

    const handleMainTabChange = (key) => {
        if (key === 'all') {
            setFilters(prev => ({ ...prev, status_id: null }));
        } else if (key === 'rnd') {
            const firstRnd = statuses.find(s => [9, 10, 11, 12].includes(s.id));
            setFilters(prev => ({ ...prev, status_id: firstRnd ? firstRnd.id : 9 }));
        } else if (key === '4') {
            setFilters(prev => ({ ...prev, status_id: 4 }));
        } else {
            setFilters(prev => ({ ...prev, status_id: parseInt(key, 10) }));
        }
    };

    const handleSubTabChange = (key) => {
        setFilters(prev => ({ ...prev, status_id: parseInt(key, 10) }));
    };

    const handleDeleteRow = async (id) => {
        try {
            const res = await deleteData(`/admin/order/${id}`);
            if (res?.success) {
                message.success("Order deleted successfully!");
                setOrders(prev => prev.filter(order => order.id !== id));
            } else {
                message.error(res?.message || "Failed to delete order");
            }
        } catch (error) {
            console.error("Failed to delete order:", error);
            message.error("An error occurred while deleting the order.");
        }
    };

    const handleViewNote = async (orderId) => {
        setViewNoteModalOpen(true);
        setNotesLoading(true);
        try {
            const res = await getDatas("/admin/note", { order_id: orderId });
            if (res?.success) {
                // If it's a single object, wrap in array, or if it's an array, set directly
                const noteData = res.data;
                setViewNotes(Array.isArray(noteData) ? noteData : [noteData]);
            }
        } catch (error) {
            console.error(error);
            message.error("Failed to fetch notes");
        } finally {
            setNotesLoading(false);
        }
    };

    const [editNoteId, setEditNoteId] = useState(null);

    const handleAddNote = async (values) => {
        setAddingNote(true);
        try {
            let res;
            if (editNoteId) {
                res = await putData(`/admin/note/${editNoteId}`, { note: values.note });
            } else {
                res = await postData("/admin/note", { order_id: noteOrderId, note: values.note });
            }
            if (res?.success) {
                message.success(`Note ${editNoteId ? 'updated' : 'added'} successfully`);
                setNoteModalOpen(false);
                noteForm.resetFields();
                setEditNoteId(null);
                
                if (viewNoteModalOpen && noteOrderId) {
                    handleViewNote(noteOrderId);
                }
            } else {
                message.error(res?.message || `Failed to ${editNoteId ? 'update' : 'add'} note`);
            }
        } catch (error) {
            console.error(error);
            message.error(`Failed to ${editNoteId ? 'update' : 'add'} note`);
        } finally {
            setAddingNote(false);
        }
    };

    const handleDeleteNote = async (noteId) => {
        try {
            const res = await deleteData(`/admin/note/${noteId}`);
            if (res?.success) {
                message.success("Note deleted successfully");
                if (noteOrderId) {
                    handleViewNote(noteOrderId);
                }
            } else {
                message.error(res?.message || "Failed to delete note");
            }
        } catch (error) {
            console.error(error);
            message.error("Failed to delete note");
        }
    };

    // ─── Tab Builder ─────────────────────────────────────────
    const buildTabLabel = (s, active) => (
        <span style={{
            background  : active ? s.bg_color  : 'transparent',
            color       : active ? s.text_color: '#555',
            padding     : '4px 14px',
            borderRadius: 20,
            fontWeight  : 600,
            fontSize    : 13,
            transition  : 'all 0.3s ease',
            display     : 'inline-flex',
            alignItems  : 'center',
            gap         : 6,
            border      : active ? 'none'      : '1px solid #e8e8e8',
        }}>
            {s.icon && <i className={`ti ${s.icon}`} style={{ fontSize: 16 }} />}
            {s.name}
            <span style={{
                background  : active ? 'rgba(255,255,255,0.25)': '#f0f0f0',
                color       : active ? s.text_color            : '#888',
                padding     : '0 7px',
                borderRadius: 10,
                fontSize    : 11,
                fontWeight  : 700,
                lineHeight  : '18px',
            }}>
                {s.total_orders}
            </span>
        </span>
    );

    const mainTabItems = 
    [
        {
            key: 'all',
            label: (
                <span style={{
                    background  : activeMainTab === 'all' ? 'linear-gradient(135deg, #1677ff, #4096ff)': 'transparent',
                    color       : activeMainTab === 'all' ? '#fff'                                     : '#555',
                    padding     : '4px 14px',
                    borderRadius: 20,
                    fontWeight  : 600,
                    fontSize    : 13,
                    display     : 'inline-flex',
                    alignItems  : 'center',
                    gap         : 6,
                    border      : activeMainTab === 'all' ? 'none'                                     : '1px solid #e8e8e8',
                    transition  : 'all 0.3s ease',
                }}>
                    <ShoppingCartOutlined />
                    All Orders
                    <span style={{
                        background  : activeMainTab === 'all' ? 'rgba(255,255,255,0.25)': '#f0f0f0',
                        color       : activeMainTab === 'all' ? '#fff'                  : '#888',
                        padding     : '0 7px',
                        borderRadius: 10,
                        fontSize    : 11,
                        fontWeight  : 700,
                        lineHeight  : '18px',
                    }}>
                        {totalAllOrders}
                    </span>
                </span>
            )
        }
    ];

    [1, 2, 3, 4, 5, 6, 7, 8].forEach(id => {
        const s = statuses.find(st => st.id === id);
        if (s) {
            mainTabItems.push({ key: s.id.toString(), label: buildTabLabel(s, activeMainTab === s.id.toString()) });
        }
    });

    const rndStatus = statuses.find(s => [9, 10, 11, 12].includes(s.id));
    const rndBg = rndStatus?.bg_color || '#9C27B0';
    const rndTotalOrders = statuses.filter(s => [9, 10, 11, 12].includes(s.id)).reduce((sum, s) => sum + s.total_orders, 0);
    mainTabItems.push({
        key: 'rnd',
        label: (
            <span style={{
                background  : activeMainTab === 'rnd' ? rndBg : 'transparent',
                color       : activeMainTab === 'rnd' ? '#fff': '#555',
                padding     : '4px 14px',
                borderRadius: 20,
                fontWeight  : 600,
                fontSize    : 13,
                display     : 'inline-flex',
                alignItems  : 'center',
                gap         : 6,
                border      : activeMainTab === 'rnd' ? 'none': '1px solid #e8e8e8',
                transition  : 'all 0.3s ease',
            }}>
                R & D
                <span style={{
                    background  : activeMainTab === 'rnd' ? 'rgba(255,255,255,0.25)': '#f0f0f0',
                    color       : activeMainTab === 'rnd' ? '#fff'                  : '#888',
                    padding     : '0 7px',
                    borderRadius: 10,
                    fontSize    : 11,
                    fontWeight  : 700,
                    lineHeight  : '18px',
                }}>
                    {rndTotalOrders}
                </span>
            </span>
        )
    });

    let subTabItems = [];
    if (activeMainTab === '4') {
        subTabItems = [4, 13, 14].map(id => {
            const s = statuses.find(st => st.id === id);
            if (s) return {
                key: s.id.toString(),
                label: buildTabLabel(s, filters.status_id === s.id)
            };
            return null;
        }).filter(Boolean);
    } else if (activeMainTab === 'rnd') {
        subTabItems = [9, 10, 11, 12].map(id => {
            const s = statuses.find(st => st.id === id);
            if (s) return {
                key: s.id.toString(),
                label: buildTabLabel(s, filters.status_id === s.id)
            };
            return null;
        }).filter(Boolean);
    }

    const slStart = (pagination.current_page - 1) * pagination.per_page + 1;

    const columns = 
    [
        {
            title: '#',
            key: 'sl',
            width: 50,
            align: 'center',
            render: (_, __, index) => (
                <Text type="secondary" style={{ fontSize: 12, fontWeight: 600 }}>{slStart + index}</Text>
            )
        },
        {
            title: 'Order Info',
            key: 'order_info',
            width: 280,
            render: (_, record) => {
                const firstProduct = record.details?.[0];
                const extraCount = record.details?.length > 1 ? record.details.length - 1 : 0;
                
                return (
                    <Flex gap={10} align="flex-start">
                        {firstProduct?.product_img_path ? (
                            <div style={{
                                width: 45,
                                height: 45,
                                borderRadius: 6,
                                overflow: 'hidden',
                                flexShrink: 0,
                                border: '1px solid #e8e8e8'
                            }}>
                                <img src={firstProduct.product_img_path} alt="product" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                        ) : (
                            <div style={{
                                width: 45,
                                height: 45,
                                borderRadius: 6,
                                background: '#f5f5f5',
                                flexShrink: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1px solid #e8e8e8'
                            }}>
                                <ShoppingCartOutlined style={{ color: '#bfbfbf', fontSize: 20 }} />
                            </div>
                        )}
                        <div style={{ lineHeight: 1.4, overflow: 'hidden' }}>
                            <div style={{ marginBottom: 2, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Text strong copyable={{ text: record.invoice_number }} style={{ fontSize: 13, color: '#1677ff' }}>
                                    {record.invoice_number}
                                </Text>
                                <Dropdown
                                    menu={{
                                        items: [
                                            { key: 'normal', label: 'Normal Invoice' },
                                            { key: 'a5', label: 'A5 Invoice' },
                                            { key: 'pos', label: 'Pos Invoice' },
                                        ],
                                        onClick: ({ key }) => {
                                            setPrintType(key);
                                            setPrintOrderData([record]);
                                            setPrintModalOpen(true);
                                        }
                                    }}
                                    trigger={['click']}
                                    disabled={record.status_id === 1}
                                >
                                    <Button 
                                        type="text" 
                                        size="small" 
                                        icon={<PrinterOutlined />} 
                                        style={{ color: record.status_id === 1 ? '#bfbfbf' : '#52c41a', padding: 0, height: 'auto' }} 
                                        disabled={record.status_id === 1}
                                    />
                                </Dropdown>
                                <Tooltip title="View Order History">
                                    <Button 
                                        type="text" 
                                        size="small" 
                                        icon={<HistoryOutlined />} 
                                        onClick={() => {
                                            setHistoryOrderId(record.id);
                                            setHistoryModalOpen(true);
                                        }}
                                        style={{ color: '#555', padding: 0, height: 'auto' }} 
                                    />
                                </Tooltip>
                            </div>
                            {firstProduct && (
                                <div style={{ 
                                    whiteSpace: 'nowrap', 
                                    overflow: 'hidden', 
                                    textOverflow: 'ellipsis',
                                    fontSize: 12,
                                    color: '#333'
                                }}>
                                    {firstProduct.product_name}
                                    {extraCount > 0 && <Text type="secondary" style={{ fontSize: 11, marginLeft: 4 }}>+{extraCount}</Text>}
                                </div>
                            )}
                            <div style={{ marginTop: 2 }}>
                                <Text type="secondary" style={{ fontSize: 11 }}>
                                    <CalendarOutlined style={{ marginRight: 4 }} />
                                    {new Date(record.order_date).toLocaleString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}
                                </Text>
                            </div>
                        </div>
                    </Flex>
                );
            }
        },
        {
            title: 'Customer',
            key: 'customer',
            width: 220,
            render: (_, record) => (
                <Flex gap={10} align="flex-start">
                    <div style={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: 14,
                        flexShrink: 0,
                    }}>
                        {record.customer_name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div style={{ lineHeight: 1.4 }}>
                        <div>
                            <Text strong style={{ fontSize: 13 }}>{record.customer_name}</Text>
                            {record.customer_type?.name && (
                                <sup style={{
                                    marginLeft: 4,
                                    color: '#52c41a',
                                    fontWeight: 600,
                                    fontSize: 10,
                                    background: '#f6ffed',
                                    padding: '0 4px',
                                    borderRadius: 4,
                                    border: '1px solid #b7eb8f'
                                }}>
                                    {record.customer_type.name}
                                </sup>
                            )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2, flexWrap: 'wrap' }}>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                                <PhoneOutlined style={{ marginRight: 4 }} />{record.phone_number}
                            </Text>
                            <Tooltip title="WhatsApp">
                                <Button 
                                    type="text" 
                                    size="small" 
                                    icon={<WhatsAppOutlined />} 
                                    style={{ color: '#25D366', padding: 0, height: 'auto' }} 
                                    onClick={() => {
                                        const phone = record.phone_number?.startsWith('0') ? '88' + record.phone_number : record.phone_number;
                                        const msg = `Hello ${record.customer_name},\n\nRegarding your order ${record.invoice_number} (Amount: ৳${record.total_payable_amount}).\n\nPlease let us know if you need any assistance!`;
                                        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
                                    }}
                                />
                            </Tooltip>
                            <Tooltip title="More Info">
                                <Button type="text" size="small" icon={<InfoCircleOutlined />} style={{ color: '#1677ff', padding: 0, height: 'auto' }} />
                            </Tooltip>
                        </div>
                        {record.shipping_address && (
                            <div>
                                <Text type="secondary" style={{ fontSize: 11 }}>
                                    <EnvironmentOutlined style={{ marginRight: 4 }} />{record.shipping_address?.length > 25 ? record.shipping_address.substring(0, 25) + '...' : record.shipping_address}
                                </Text>
                            </div>
                        )}
                    </div>
                </Flex>
            )
        },
        {
            title: 'Amount',
            dataIndex: 'total_payable_amount',
            key: 'total_payable_amount',
            sorter: true,
            align: 'right',
            width: 160,
            render: (amount, record) => {
                const discount = parseFloat(record.special_discount || 0) + parseFloat(record.coupon_discount || 0);
                const advance = parseFloat(record.advanced_payment || 0);
                const delivery = parseFloat(record.delivery_charge || 0);
                const additional = parseFloat(record.additional_cost || 0);

                return (
                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                        <div style={{ fontSize: 11, color: '#888', lineHeight: '1.4', textAlign: 'right', width: '100%' }}>
                            <div>Net: ৳{parseFloat(record.net_order_amount || 0).toLocaleString()}</div>
                            {delivery > 0 && <div>+ Del: ৳{delivery.toLocaleString()}</div>}
                            {additional > 0 && <div>+ Add: ৳{additional.toLocaleString()}</div>}
                            {discount > 0 && <div style={{ color: '#ff4d4f' }}>- Disc: ৳{discount.toLocaleString()}</div>}
                            {advance > 0 && <div style={{ color: '#52c41a' }}>- Adv: ৳{advance.toLocaleString()}</div>}
                        </div>
                        <div style={{ 
                            fontWeight: 700, 
                            fontSize: 14, 
                            color: '#1a1a1a', 
                            marginTop: 4, 
                            paddingTop: 4, 
                            borderTop: '1px dashed #d9d9d9',
                            width: '100%',
                            textAlign: 'right'
                        }}>
                            ৳{parseFloat(amount || 0).toLocaleString()}
                        </div>
                        {parseFloat(record.due) > 0 ? (
                            <Tag color="red" style={{ marginTop: 4, fontSize: 11, borderRadius: 4, marginInlineEnd: 0 }}>
                                Due: ৳{parseFloat(record.due).toLocaleString()}
                            </Tag>
                        ) : (
                            <Tag color="green" style={{ marginTop: 4, fontSize: 11, borderRadius: 4, marginInlineEnd: 0 }}>
                                Paid
                            </Tag>
                        )}
                    </div>
                );
            }
        },
        {
            title: 'Payment',
            dataIndex: 'paid_status',
            key: 'paid_status',
            align: 'center',
            width: 100,
            render: (status) => {
                const config = {
                    paid: { color: '#52c41a', bg: '#f6ffed', border: '#b7eb8f', label: 'Paid' },
                    partial: { color: '#faad14', bg: '#fffbe6', border: '#ffe58f', label: 'Partial' },
                    unpaid: { color: '#ff4d4f', bg: '#fff2f0', border: '#ffccc7', label: 'Unpaid' },
                };
                const c = config[status] || config.unpaid;
                return (
                    <span style={{
                        display: 'inline-block',
                        padding: '2px 10px',
                        borderRadius: 12,
                        fontSize: 12,
                        fontWeight: 600,
                        color: c.color,
                        background: c.bg,
                        border: `1px solid ${c.border}`,
                        textTransform: 'capitalize',
                    }}>
                        {c.label}
                    </span>
                );
            }
        },
        {
            title: 'Courier',
            key: 'courier',
            width: 160,
            render: (_, record) => {
                if (!record.courier?.name && !record.consignment_id && !record.tracking_code) {
                    return <Text type="secondary" style={{ fontSize: 12 }}>N/A</Text>;
                }
                return (
                    <div style={{ lineHeight: 1.4 }}>
                        {record.courier?.name && (
                            <div>
                                <Tag color="blue" style={{ margin: 0, fontSize: 11, borderRadius: 4, fontWeight: 600 }}>
                                    {record.courier.name}
                                </Tag>
                            </div>
                        )}
                        {record.consignment_id && (
                            <div style={{ marginTop: 6 }}>
                                <Text type="secondary" style={{ fontSize: 10, display: 'block', marginBottom: 2, textTransform: 'uppercase', letterSpacing: 0.5 }}>Consignment ID</Text>
                                <Text strong copyable={{ text: record.consignment_id }} style={{ 
                                    fontSize: 12, 
                                    background: '#f0f5ff', 
                                    color: '#1677ff', 
                                    padding: '2px 6px', 
                                    borderRadius: 4, 
                                    border: '1px solid #d6e4ff',
                                    display: 'inline-block'
                                }}>
                                    {record.consignment_id}
                                </Text>
                            </div>
                        )}
                        {record.tracking_code && (
                            <div style={{ marginTop: 6 }}>
                                <Text type="secondary" style={{ fontSize: 10, display: 'block', marginBottom: 2, textTransform: 'uppercase', letterSpacing: 0.5 }}>Tracking Code</Text>
                                <Text strong copyable={{ text: record.tracking_code }} style={{ 
                                    fontSize: 12, 
                                    background: '#fffbe6', 
                                    color: '#faad14', 
                                    padding: '2px 6px', 
                                    borderRadius: 4, 
                                    border: '1px solid #ffe58f',
                                    display: 'inline-block'
                                }}>
                                    {record.tracking_code}
                                </Text>
                            </div>
                        )}
                    </div>
                );
            }
        },
        {
            title: 'Status',
            key: 'status',
            align: 'center',
            width: 130,
            render: (_, record) => {
                const s = statuses.find(st => st.id === record.status_id);
                if (s) {
                    return (
                        <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            padding: '2px 10px',
                            borderRadius: 12,
                            fontSize: 12,
                            fontWeight: 600,
                            color: s.text_color || '#333',
                            background: s.bg_color || '#f0f0f0',
                        }}>
                            {s.icon && <i className={`ti ${s.icon}`} style={{ fontSize: 14 }} />}
                            {record.current_status?.name}
                        </span>
                    );
                }
                return <Tag>{record.current_status?.name}</Tag>;
            }
        },
        {
            title: 'Note',
            key: 'note',
            align: 'center',
            width: 90,
            render: (_, record) => (
                <Space size={4}>
                    <Tooltip title="View Notes">
                        <Button
                            type="primary"
                            ghost
                            size="small"
                            shape="circle"
                            icon={<EyeOutlined />}
                            onClick={() => handleViewNote(record.id)}
                        />
                    </Tooltip>
                    <Tooltip title="Add Note">
                        <Button
                            type="primary"
                            size="small"
                            shape="circle"
                            icon={<PlusOutlined />}
                            onClick={() => {
                                setNoteOrderId(record.id);
                                noteForm.setFieldsValue({ note: '' });
                                setNoteModalOpen(true);
                            }}
                        />
                    </Tooltip>
                </Space>
            )
        },
        {
            title: 'Action',
            key: 'action',
            align: 'center',
            width: 140,
            fixed: 'right',
            render: (_, record) => (
                <Space size={0}>
                    {hasPermission('order_read') && (
                        <Tooltip title="View Order">
                            <Button
                                type="text"
                                size="small"
                                icon={<EyeOutlined />}
                                onClick={() => {
                                    setPreviewId(record.id);
                                    setPreviewOpen(true);
                                }}
                                style={{ color: '#1677ff' }}
                            />
                        </Tooltip>
                    )}
                    {hasPermission('order_update') && (
                        <Tooltip title="Edit Order">
                            <Button
                                type="text"
                                size="small"
                                icon={<EditOutlined />}
                                onClick={() => navigate(`/edit/order/${record.id}`)}
                                style={{ color: '#52c41a' }}
                            />
                        </Tooltip>
                    )}
                    {hasPermission('order_delete') && (
                        <Popconfirm
                            title="Delete this order?"
                            description="This order will be moved to trash."
                            onConfirm={() => handleDeleteRow(record.id)}
                            okText="Delete"
                            cancelText="Cancel"
                            okButtonProps={{ danger: true }}
                        >
                            <Tooltip title="Delete Order">
                                <Button
                                    type="text"
                                    size="small"
                                    danger
                                    icon={<DeleteOutlined />}
                                />
                            </Tooltip>
                        </Popconfirm>
                    )}
                </Space>
            )
        }
    ];

    return (
        <div style={{ margin: 5 }}>
            <Card
                size="small"
                style={{
                    marginBottom: 16,
                    borderRadius: 10,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                }}
                styles={{ body: { padding: '16px 24px' } }}
            >
                <Flex justify="space-between" align="center" wrap="wrap" gap={12}>
                    <div>
                        <Breadcrumb
                            items={[
                                { title: <span style={{ color: 'rgba(255,255,255,0.7)' }}>Dashboard</span> },
                                { title: <span style={{ color: 'rgba(255,255,255,0.7)' }}>Order</span> },
                                { title: <span style={{ color: '#fff' }}>Order List</span> },
                            ]}
                            separator={<span style={{ color: 'rgba(255,255,255,0.5)' }}>/</span>}
                        />
                        <Title level={4} style={{ margin: '4px 0 0', color: '#fff' }}>
                            <ShoppingCartOutlined style={{ marginRight: 8 }} />
                            Order Management
                        </Title>
                    </div>
                    <Flex gap={8} wrap="wrap">
                        {hasPermission('order_delete') && (
                            <Button
                                icon={<DeleteOutlined />}
                                onClick={() => navigate('/trash/order', {
                                    state: { fromPage: 'Order List Page', fromAction: 'Click "Trash" Button' }
                                })}
                                style={{
                                    background: 'rgba(255,255,255,0.15)',
                                    borderColor: 'rgba(255,255,255,0.3)',
                                    color: '#fff',
                                }}
                            >
                                Trash
                            </Button>
                        )}
                        {hasPermission('order_create') && (
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={() => navigate('/add/order', {
                                    state: { fromPage: 'Order List Page', fromAction: 'Click "Add Order" Button' }
                                })}
                                style={{
                                    background: '#fff',
                                    color: '#764ba2',
                                    fontWeight: 600,
                                    border: 'none',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                }}
                            >
                                Add Order
                            </Button>
                        )}
                    </Flex>
                </Flex>
            </Card>

            <Card size="small" style={{ marginBottom: 16, borderRadius: 10 }} styles={{ body: { padding: '16px 20px' } }}>
                <Form form={form} onFinish={handleFilterSubmit} layout="vertical" size="middle">
                    <Row gutter={[16, 0]}>
                        <Col xs={24} sm={12} md={8} lg={6}>
                            <Form.Item name="search_key" label={<Text strong style={{ fontSize: 12 }}><SearchOutlined /> Search</Text>} style={{ marginBottom: 12 }}>
                                <Input placeholder="Invoice, Name, Phone..." allowClear />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={6}>
                            <Form.Item name="dateRange" label={<Text strong style={{ fontSize: 12 }}><CalendarOutlined /> Order Date</Text>} style={{ marginBottom: 12 }}>
                                <DatePicker.RangePicker style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={6}>
                            <Form.Item name="paid_status" label={<Text strong style={{ fontSize: 12 }}><DollarOutlined /> Paid Status</Text>} style={{ marginBottom: 12 }}>
                                <Select placeholder="All" allowClear>
                                    <Select.Option value="paid">✅ Paid</Select.Option>
                                    <Select.Option value="partial">⚠️ Partial</Select.Option>
                                    <Select.Option value="unpaid">❌ Unpaid</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={24} lg={6}>
                            <Form.Item label=" " style={{ marginBottom: 12 }}>
                                <Flex gap={8} wrap="wrap">
                                    <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                                        Search
                                    </Button>
                                    <Button icon={<ClearOutlined />} onClick={handleReset}>
                                        Clear
                                    </Button>
                                    <Button
                                        icon={<FilterOutlined />}
                                        type={showAdvanced ? 'primary' : 'default'}
                                        ghost={showAdvanced}
                                        onClick={() => setShowAdvanced(!showAdvanced)}
                                    >
                                        More
                                    </Button>
                                    <Tooltip title="Refresh">
                                        <Button
                                            icon={<ReloadOutlined spin={loading} />}
                                            onClick={() => fetchOrders(filters, pagination.current_page, pagination.per_page)}
                                        />
                                    </Tooltip>
                                </Flex>
                            </Form.Item>
                        </Col>
                    </Row>

                    {showAdvanced && (
                        <div style={{
                            background: '#fafafa',
                            borderRadius: 8,
                            padding: '16px 16px 4px',
                            marginBottom: 12,
                            border: '1px dashed #d9d9d9',
                        }}>
                            <Text type="secondary" strong style={{ fontSize: 12, display: 'block', marginBottom: 12 }}>
                                <FilterOutlined /> ADVANCED FILTERS
                            </Text>
                            <Row gutter={[16, 0]}>
                                <Col xs={12} sm={8} md={6} lg={4}>
                                    <Form.Item name="min_amount" label={<Text style={{ fontSize: 12 }}>Min Amount</Text>} style={{ marginBottom: 12 }}>
                                        <InputNumber placeholder="Min" style={{ width: '100%' }} min={0} />
                                    </Form.Item>
                                </Col>
                                <Col xs={12} sm={8} md={6} lg={4}>
                                    <Form.Item name="max_amount" label={<Text style={{ fontSize: 12 }}>Max Amount</Text>} style={{ marginBottom: 12 }}>
                                        <InputNumber placeholder="Max" style={{ width: '100%' }} min={0} />
                                    </Form.Item>
                                </Col>
                                <Col xs={12} sm={8} md={6} lg={4}>
                                    <Form.Item name="district_id" label={<Text style={{ fontSize: 12 }}>District</Text>} style={{ marginBottom: 12 }}>
                                        <Select
                                            placeholder="Select District"
                                            allowClear
                                            showSearch
                                            optionFilterProp="children"
                                            filterOption={(input, option) =>
                                                (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                                            }
                                        >
                                            {districts.map(district => (
                                                <Select.Option key={district.id} value={district.id}>
                                                    {district.district_name}
                                                </Select.Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col xs={12} sm={8} md={6} lg={4}>
                                    <Form.Item name="customer_type_id" label={<Text style={{ fontSize: 12 }}>Customer Type</Text>} style={{ marginBottom: 12 }}>
                                        <Select placeholder="Select Type" allowClear>
                                            {customerTypes.map(type => (
                                                <Select.Option key={type.id} value={type.id}>
                                                    {type.name}
                                                </Select.Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col xs={12} sm={8} md={6} lg={4}>
                                    <Form.Item name="delivery_gateway_id" label={<Text style={{ fontSize: 12 }}>Del. Gateway</Text>} style={{ marginBottom: 12 }}>
                                        <Select placeholder="Select Gateway" allowClear>
                                            {deliveryGateways.map(gateway => (
                                                <Select.Option key={gateway.id} value={gateway.id}>
                                                    {gateway.name} (৳{gateway.delivery_fee})
                                                </Select.Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col xs={12} sm={8} md={6} lg={4}>
                                    <Form.Item name="payment_gateway_id" label={<Text style={{ fontSize: 12 }}>Pay. Gateway</Text>} style={{ marginBottom: 12 }}>
                                        <Select placeholder="Select Gateway" allowClear>
                                            {paymentGateways.map(gateway => (
                                                <Select.Option key={gateway.id} value={gateway.id}>
                                                    {gateway.name}
                                                </Select.Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col xs={12} sm={8} md={6} lg={4}>
                                    <Form.Item name="courier_id" label={<Text style={{ fontSize: 12 }}>Courier</Text>} style={{ marginBottom: 12 }}>
                                        <Select placeholder="Select Courier" allowClear>
                                            {couriers.map(courier => (
                                                <Select.Option key={courier.id} value={courier.id}>
                                                    {courier.name}
                                                </Select.Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>

                                <Col xs={12} sm={8} md={6} lg={4}>
                                    <Form.Item name="assign_user_id" label={<Text style={{ fontSize: 12 }}>Assigned User</Text>} style={{ marginBottom: 12 }}>
                                        <Select
                                            placeholder="Select User"
                                            allowClear
                                            showSearch
                                            optionFilterProp="children"
                                            filterOption={(input, option) =>
                                                (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                                            }
                                        >
                                            {users.map(user => (
                                                <Select.Option key={user.id} value={user.id}>
                                                    {user.username}
                                                </Select.Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col xs={12} sm={8} md={6} lg={4}>
                                    <Form.Item name="prepared_by" label={<Text style={{ fontSize: 12 }}>Prepared By</Text>} style={{ marginBottom: 12 }}>
                                        <Select
                                            placeholder="Select User"
                                            allowClear
                                            showSearch
                                            optionFilterProp="children"
                                            filterOption={(input, option) =>
                                                (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                                            }
                                        >
                                            {users.map(user => (
                                                <Select.Option key={user.id} value={user.id}>
                                                    {user.username}
                                                </Select.Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                            </Row>
                        </div>
                    )}
                </Form>
            </Card>

            <Card style={{ borderRadius: 10 }} styles={{ body: { padding: '12px 20px 20px' } }}>
                <div style={{
                    overflowX: 'auto',
                    whiteSpace: 'nowrap',
                    paddingBottom: 4,
                    marginBottom: 8,
                }}>
                    <Tabs
                        activeKey={activeMainTab}
                        items={mainTabItems}
                        onChange={handleMainTabChange}
                        tabBarStyle={{ marginBottom: 0 }}
                        style={{ minWidth: 'fit-content' }}
                    />
                </div>

                {subTabItems.length > 0 && (
                    <div style={{
                        background: '#fafafa',
                        borderRadius: 8,
                        padding: '8px 12px',
                        marginBottom: 12,
                    }}>
                        <Tabs
                            activeKey={filters.status_id ? filters.status_id.toString() : ''}
                            items={subTabItems}
                            onChange={handleSubTabChange}
                            type="card"
                            size="small"
                            tabBarStyle={{ marginBottom: 0 }}
                        />
                    </div>
                )}

                <Flex justify="space-between" align="center" style={{ marginBottom: 12 }}>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                        Showing <Text strong>{orders.length}</Text> of <Text strong>{pagination.total}</Text> orders
                    </Text>
                    {selectedRowKeys.length > 0 && (
                        <Flex gap={8} align="center">
                            <Tag color="blue" style={{ margin: 0, padding: '4px 10px', fontSize: 13 }}>
                                {selectedRowKeys.length} Selected
                            </Tag>
                            <Dropdown menu={{ items: [{ key: 'paid', label: 'Paid' }, { key: 'unpaid', label: 'Unpaid' }, { key: 'partial', label: 'Partial' }] }}>
                                <Button size="small">Payment Status</Button>
                            </Dropdown>
                            <Dropdown menu={{ items: statuses.map(s => ({ key: s.id, label: s.name })) }}>
                                <Button size="small">Order Status</Button>
                            </Dropdown>
                            <Dropdown menu={{ items: users.map(u => ({ key: u.id, label: u.username })) }}>
                                <Button size="small">Order Assign</Button>
                            </Dropdown>
                            <Dropdown menu={{ 
                                items: [{ key: 'normal', label: 'Normal Invoice' }, { key: 'a5', label: 'A5 Invoice' }, { key: 'pos', label: 'Pos Invoice' }],
                                onClick: ({ key }) => {
                                    const selectedOrders = orders.filter(o => selectedRowKeys.includes(o.id));
                                    setPrintType(key);
                                    setPrintOrderData(selectedOrders);
                                    setPrintModalOpen(true);
                                }
                            }}>
                                <Button size="small" icon={<PrinterOutlined />}>Print Invoice</Button>
                            </Dropdown>
                            <Button size="small">Export CSV</Button>
                            <Popconfirm title="Delete selected orders?" okText="Yes" cancelText="No">
                                <Button size="small" danger icon={<DeleteOutlined />}>Bulk Delete</Button>
                            </Popconfirm>
                        </Flex>
                    )}
                </Flex>

                <Table
                    rowSelection={{
                        selectedRowKeys,
                        onChange: (newSelectedRowKeys) => setSelectedRowKeys(newSelectedRowKeys),
                    }}
                    columns={columns}
                    dataSource={orders}
                    rowKey="id"
                    loading={loading}
                    onChange={handleTableChange}
                    scroll={{ x: 1000 }}
                    size="middle"
                    rowClassName={(_, index) => index % 2 === 0 ? '' : 'ant-table-row-alt'}
                    pagination={{
                        current: pagination.current_page,
                        pageSize: pagination.per_page,
                        total: pagination.total,
                        showSizeChanger: true,
                        pageSizeOptions: ["10", "25", "50", "100"],
                        showTotal: (total, range) => (
                            <Text type="secondary" style={{ fontSize: 13 }}>
                                {range[0]}-{range[1]} of <Text strong>{total}</Text> orders
                            </Text>
                        ),
                        style: { marginTop: 16 },
                    }}
                />
            </Card>

            <style>{`
                .ant-table-row-alt {
                    background: #fafbff !important;
                }
                .ant-table-row:hover td {
                    background: #f0f5ff !important;
                }
                .ant-tabs-tab {
                    padding: 6px 4px !important;
                }
                .ant-tabs-tab + .ant-tabs-tab {
                    margin: 0 0 0 4px !important;
                }
                .ant-tabs-ink-bar {
                    display: none !important;
                }
                .ant-table-thead > tr > th {
                    background: #f8f9fe !important;
                    font-weight: 700 !important;
                    font-size: 12px !important;
                    text-transform: uppercase !important;
                    letter-spacing: 0.5px !important;
                    color: #555 !important;
                    border-bottom: 2px solid #e8e8e8 !important;
                }
                .ant-card {
                    box-shadow: 0 1px 3px rgba(0,0,0,0.06) !important;
                }
            `}</style>
            
            <OrderPreview 
                open={previewOpen} 
                onClose={() => setPreviewOpen(false)} 
                orderId={previewId} 
            />

            <Modal
                title={editNoteId ? "Edit Note" : "Add Note"}
                open={noteModalOpen}
                onCancel={() => {
                    setNoteModalOpen(false);
                    setEditNoteId(null);
                    noteForm.resetFields();
                }}
                footer={null}
                destroyOnClose
            >
                <Form
                    form={noteForm}
                    layout="vertical"
                    onFinish={handleAddNote}
                >
                    <Form.Item
                        name="note"
                        label="Note Content"
                        rules={[{ required: true, message: 'Please write a note' }]}
                    >
                        <Input.TextArea rows={4} placeholder="Write your note here..." />
                    </Form.Item>
                    <Flex justify="flex-end" gap={10}>
                        <Button onClick={() => {
                            setNoteModalOpen(false);
                            setEditNoteId(null);
                            noteForm.resetFields();
                        }}>Cancel</Button>
                        <Button type="primary" htmlType="submit" loading={addingNote}>
                            {editNoteId ? "Update" : "Submit"}
                        </Button>
                    </Flex>
                </Form>
            </Modal>

            <Modal
                title="View Notes"
                open={viewNoteModalOpen}
                onCancel={() => setViewNoteModalOpen(false)}
                footer={null}
                destroyOnClose
                bodyStyle={{ maxHeight: '60vh', overflowY: 'auto' }}
            >
                {notesLoading ? (
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>Loading notes...</div>
                ) : viewNotes && viewNotes.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {viewNotes.map((noteItem, index) => (
                            <div key={index} style={{ padding: 12, background: '#f8f9fa', borderRadius: 8, border: '1px solid #e8e8e8' }}>
                                <Flex justify="space-between" align="flex-start">
                                    <div style={{ fontSize: 13, color: '#333', flex: 1, whiteSpace: 'pre-wrap' }}>{noteItem.note}</div>
                                    <Space size={4} style={{ marginLeft: 12 }}>
                                        <Tooltip title="Edit Note">
                                            <Button 
                                                type="text" 
                                                size="small" 
                                                icon={<EditOutlined />} 
                                                onClick={() => {
                                                    setEditNoteId(noteItem.id);
                                                    setNoteOrderId(noteItem.order_id);
                                                    noteForm.setFieldsValue({ note: noteItem.note });
                                                    setNoteModalOpen(true);
                                                }}
                                                style={{ color: '#1677ff' }}
                                            />
                                        </Tooltip>
                                        <Popconfirm
                                            title="Delete this note?"
                                            onConfirm={() => handleDeleteNote(noteItem.id)}
                                            okText="Yes"
                                            cancelText="No"
                                        >
                                            <Tooltip title="Delete Note">
                                                <Button 
                                                    type="text" 
                                                    size="small" 
                                                    danger 
                                                    icon={<DeleteOutlined />} 
                                                />
                                            </Tooltip>
                                        </Popconfirm>
                                    </Space>
                                </Flex>
                                <div style={{ fontSize: 11, color: '#888', marginTop: 8, borderTop: '1px solid #eee', paddingTop: 8 }}>
                                    {noteItem.created_at ? new Date(noteItem.created_at).toLocaleString() : 'N/A'} 
                                    {noteItem.created_by?.username && ` • By ${noteItem.created_by.username}`}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '20px 0', color: '#888' }}>
                        No notes found for this order.
                    </div>
                )}
            </Modal>

            <OrderHistory 
                open={historyModalOpen}
                onClose={() => setHistoryModalOpen(false)}
                orderId={historyOrderId}
            />

            <Modal
                title={
                    <Flex justify="space-between" align="center" style={{ paddingRight: 30 }}>
                        <span>Print Invoice</span>
                        <Button type="primary" icon={<PrinterOutlined />} onClick={() => window.print()}>Print Now</Button>
                    </Flex>
                }
                open={printModalOpen}
                onCancel={() => setPrintModalOpen(false)}
                footer={null}
                width={printType === 'normal' ? 850 : printType === 'a5' ? 650 : 400}
                destroyOnClose
                bodyStyle={{ padding: '24px 0', background: '#f0f2f5', overflowX: 'auto' }}
                className="print-modal"
            >
                <div id="printable-area">
                    {printOrderData && printOrderData.map((order, index) => (
                        <div key={order.id} style={{ pageBreakAfter: index === printOrderData.length - 1 ? 'auto' : 'always', marginBottom: index === printOrderData.length - 1 ? 0 : 24 }}>
                            {printType === 'normal' && <NormalInvoice order={order} />}
                            {printType === 'a5' && <A5Invoice order={order} />}
                            {printType === 'pos' && <PosInvoice order={order} />}
                        </div>
                    ))}
                </div>
            </Modal>
            <style>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .print-modal {
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                        margin: 0 !important;
                        padding: 0 !important;
                    }
                    .print-modal .ant-modal-content {
                        box-shadow: none !important;
                        border: none !important;
                        padding: 0 !important;
                        background: transparent !important;
                    }
                    .print-modal .ant-modal-header,
                    .print-modal .ant-modal-close {
                        display: none !important;
                    }
                    #printable-area, #printable-area * {
                        visibility: visible;
                    }
                    #printable-area {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                }
            `}</style>
        </div>
    );
};

export default Order;