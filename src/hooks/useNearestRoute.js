
import { useLocation } from 'react-router-dom';

export const KNOWN_ROUTES = [
    { path: '/dashboard',              label: 'Dashboard' },

    // User / Management
    { path: '/management/list',        label: 'Management List' },
    { path: '/add/management',         label: 'Add Management' },
    { path: '/management/trash',       label: 'Management Trash' },
    { path: '/employee/list',          label: 'Employee List' },
    { path: '/employee/trash',         label: 'Employee Trash' },
    { path: '/add/employee',           label: 'Add Employee' },
    { path: '/role',                   label: 'Role List' },
    { path: '/customer',               label: 'Customer List' },

    // Products
    { path: '/products',               label: 'Product List' },
    { path: '/products/add',           label: 'Add Product' },
    { path: '/categories',               label: 'Category List' },
    { path: '/category/trash',         label: 'Category Trash' },
    { path: '/create/category',           label: 'Add Category' },
    { path: '/sub-categories',         label: 'Sub-Category List' },
    { path: '/subcategory/trash',      label: 'Sub-Category Trash' },
    { path: '/add/subcategory',        label: 'Add Sub-Category' },
    { path: '/edit/subcategory/:id',   label: 'Edit Sub-Category' },
    { path: '/brands',                 label: 'Brand List' },
    { path: '/brand/trash',            label: 'Brand Trash' },
    { path: '/create/brand',           label: 'Add Brand' },
    { path: '/edit/brand/:id',         label: 'Edit Brand' },
    { path: '/attribute',              label: 'Attribute List' },
    { path: '/attribute/trash',        label: 'Attribute Trash' },
    { path: '/attribute-value',        label: 'Attribute Value' },

    // Orders
    { path: '/orders',                 label: 'Add Order' },
    { path: '/orders',                 label: 'Order List' },
    { path: '/coupons',                label: 'Coupon List' },
    { path: '/coupon/trash',           label: 'Coupon Trash' },
    { path: '/coupon/add',             label: 'Add Coupon' },
    { path: '/coupon/edit/:id',        label: 'Edit Coupon' },
    { path: '/courier',                label: 'Courier List' },
    { path: '/create/courier',         label: 'Add Courier' },
    { path: '/trash/courier',           label: 'Courier Trash' },
    { path: '/status',                 label: 'Order Status List' },
    { path: '/create/status',          label: 'Add Order Status' },
    { path: '/edit/status/:id',        label: 'Edit Order Status' },
    { path: '/trash/status',           label: 'Order Status Trash' },
    { path: '/cancel-reason',          label: 'Cancel Reason' },
    { path: '/customer-type',          label: 'Customer Type' },
    { path: '/delivery-gateway',       label: 'Delivery Gateway' },
    { path: '/delivery-gateway/add',   label: 'Add Delivery Gateway' },
    { path: '/payment-gateway',        label: 'Payment Gateway' },
    { path: '/create/payment-gateway', label: 'Add Payment Gateway' },
    { path: '/order/source',           label: 'Order Source' },
    { path: '/create/order-source',    label: 'Add Order Source' },
    { path: '/order-guard',            label: 'Order Guard' },

    // Blog
    { path: '/blog',                   label: 'Blog List' },
    { path: '/create/blog',            label: 'Add Blog' },
    { path: '/edit/blog/:id',          label: 'Edit Blog' },
    { path: '/trash/blog',             label: 'Blog Trash' },
    { path: '/blog-category',          label: 'Blog Category' },
    { path: '/create/blog-category',   label: 'Add Blog Category' },
    { path: '/edit/blog-category/:id', label: 'Edit Blog Category' },
    { path: '/blog-tag',               label: 'Blog Tag' },

    // CMS
    { path: '/banner',                 label: 'Banner List' },
    { path: '/banner/add',             label: 'Add Banner' },
    { path: '/banner/trash',           label: 'Banner Trash' },
    { path: '/slider',                 label: 'Slider List' },
    { path: '/slider/add',             label: 'Add Slider' },
    { path: '/slider/trash',           label: 'Slider Trash' },
    { path: '/section',                label: 'Section List' },
    { path: '/section/add',            label: 'Add Section' },
    { path: '/section/trash',          label: 'Section Trash' },
    { path: '/about-us',               label: 'About Us' },
    { path: '/contact-us',             label: 'Contact Us' },
    { path: '/faq',                    label: 'FAQ' },
    { path: '/privacy-policy',         label: 'Privacy Policy' },
    { path: '/terms-condition',        label: 'Terms & Condition' },
    { path: '/shipping-policy',        label: 'Shipping Policy' },
    { path: '/return-refund-policy',   label: 'Return & Refund Policy' },

    // Courier
    { path: '/courier',                label: 'Courier List' },
    { path: '/courier/add',            label: 'Add Courier' },
    { path: '/courier/trash',          label: 'Courier Trash' },

    // Report
    { path: '/report/order',           label: 'Order Report' },
    { path: '/report/product',         label: 'Product Report' },
    { path: '/report/customer',        label: 'Customer Report' },
    { path: '/report/courier',         label: 'Courier Report' },

    // Auth
    { path: '/login',                  label: 'Login' },
    { path: '/forgot-password',        label: 'Forgot Password' },
];

function levenshtein(a, b) {
    const m = a.length, n = b.length;
    const dp = Array.from({ length: m + 1 }, (_, i) =>
        Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
    );
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            dp[i][j] = a[i - 1] === b[j - 1]
                ? dp[i - 1][j - 1]
                : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
        }
    }
    return dp[m][n];
}

export function findNearestRoute(wrongPath) {
    const normalize = (p) =>
        p.replace(/\/:[^/]+/g, '').replace(/\/\d+/g, '').toLowerCase();

    const target = normalize(wrongPath);

    let bestMatch = null;
    let bestScore = Infinity;

    for (const route of KNOWN_ROUTES) {
        const candidate = normalize(route.path);
        
        let dist = levenshtein(target, candidate);
        
        if (target.includes('subcategory') && candidate.includes('sub-categor')) {
            dist -= 10; 
        } else if (target.includes('coupon') && candidate.includes('coupon')) {
            if (candidate === '/coupons') {
                dist -= 20;
            } else {
                dist -= 10;
            }
        } else if (target.includes('sourc') && candidate.includes('source')) {
            if (target.includes('edit') && candidate === '/order/source') {
                dist -= 20; 
            } else {
                dist -= 10;
            }
        } else if (target.includes('statu') && candidate.includes('status')) {
            if (candidate === '/status') {
                dist -= 20;
            } else {
                dist -= 10;
            }
        } else if (target.includes('blo') && candidate.includes('blog')) {
            if (candidate === '/blog-category' || candidate === '/blog') {
                dist -= 20;
            } else {
                dist -= 10;
            }
        }

        if (route.path.includes(':')) {
            continue;
        }

        if (dist < bestScore) {
            bestScore = dist;
            bestMatch = { ...route, score: dist };
        }
    }

    const threshold = Math.max(4, Math.floor(target.length * 0.6));
    if (bestScore <= threshold) return bestMatch;
    return null;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useNearestRoute() {
    const { pathname } = useLocation();
    return findNearestRoute(pathname);
}
