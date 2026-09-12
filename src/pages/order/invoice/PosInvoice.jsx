import React from 'react';

const PosInvoice = ({ order }) => {
    if (!order) return null;

    const styles = {
        container: {
            width: '80mm',
            margin: '0 auto',
            background: '#fff',
            color: '#000',
            fontFamily: 'monospace',
            fontSize: '12px',
            lineHeight: 1.4,
            padding: '5mm',
        },
        center: {
            textAlign: 'center',
        },
        divider: {
            borderTop: '1px dashed #000',
            margin: '8px 0',
        },
        flexBetween: {
            display: 'flex',
            justifyContent: 'space-between',
        },
        bold: {
            fontWeight: 'bold',
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.center}>
                <h2 style={{ margin: '0 0 5px 0', fontSize: '18px' }}>ECOM ERP</h2>
                <div>123 Commerce St, Tech City</div>
                <div>Phone: +880 1234 567890</div>
            </div>

            <div style={styles.divider}></div>
            
            <div>
                <div>INV: {order.invoice_number}</div>
                <div>Date: {new Date(order.order_date).toLocaleString('en-US', { hour12: true })}</div>
                <div>Customer: {order.customer_name}</div>
                <div>Phone: {order.phone_number}</div>
            </div>

            <div style={styles.divider}></div>

            {/* Items Header */}
            <div style={{ ...styles.flexBetween, ...styles.bold }}>
                <span style={{ width: '50%' }}>Item</span>
                <span style={{ width: '15%', textAlign: 'center' }}>Qty</span>
                <span style={{ width: '35%', textAlign: 'right' }}>Total</span>
            </div>
            
            <div style={styles.divider}></div>

            {/* Items List */}
            {order.details?.map(item => (
                <div key={item.id} style={{ marginBottom: 4 }}>
                    <div>{item.product_name}</div>
                    <div style={{ ...styles.flexBetween, fontSize: '11px', color: '#333' }}>
                        <span style={{ width: '50%' }}>৳{parseFloat(item.sell_price).toLocaleString()}</span>
                        <span style={{ width: '15%', textAlign: 'center' }}>x{item.quantity}</span>
                        <span style={{ width: '35%', textAlign: 'right' }}>৳{(parseFloat(item.sell_price) * parseFloat(item.quantity)).toLocaleString()}</span>
                    </div>
                </div>
            ))}

            <div style={styles.divider}></div>

            {/* Summary */}
            <div style={styles.flexBetween}>
                <span>Subtotal:</span>
                <span>৳{parseFloat(order.net_order_amount || 0).toLocaleString()}</span>
            </div>
            {parseFloat(order.delivery_charge || 0) > 0 && (
                <div style={styles.flexBetween}>
                    <span>Delivery:</span>
                    <span>৳{parseFloat(order.delivery_charge || 0).toLocaleString()}</span>
                </div>
            )}
            {parseFloat(order.additional_cost || 0) > 0 && (
                <div style={styles.flexBetween}>
                    <span>Addl Cost:</span>
                    <span>৳{parseFloat(order.additional_cost || 0).toLocaleString()}</span>
                </div>
            )}
            {(parseFloat(order.special_discount || 0) + parseFloat(order.coupon_discount || 0)) > 0 && (
                <div style={styles.flexBetween}>
                    <span>Discount:</span>
                    <span>-৳{(parseFloat(order.special_discount || 0) + parseFloat(order.coupon_discount || 0)).toLocaleString()}</span>
                </div>
            )}

            <div style={styles.divider}></div>

            <div style={{ ...styles.flexBetween, ...styles.bold, fontSize: '14px' }}>
                <span>TOTAL:</span>
                <span>৳{parseFloat(order.total_payable_amount || 0).toLocaleString()}</span>
            </div>

            <div style={{ ...styles.flexBetween, marginTop: 4 }}>
                <span>Paid:</span>
                <span>৳{parseFloat(order.advanced_payment || 0).toLocaleString()}</span>
            </div>
            <div style={{ ...styles.flexBetween, ...styles.bold }}>
                <span>DUE:</span>
                <span>৳{parseFloat(order.due || 0).toLocaleString()}</span>
            </div>

            <div style={styles.divider}></div>

            <div style={{ ...styles.center, marginTop: 10 }}>
                <strong>*** THANK YOU ***</strong>
                <div style={{ fontSize: '10px', marginTop: 4 }}>Please come again</div>
            </div>
        </div>
    );
};

export default PosInvoice;
