import { format, formatDistanceToNow, parseISO } from 'date-fns';

export const formatDate = (date) => {
    if (!date) return '—';
    const d = typeof date === 'string' ? parseISO(date) : date;
    return format(d, 'dd MMM yyyy');
};

export const formatDateTime = (date) => {
    if (!date) return '—';
    const d = typeof date === 'string' ? parseISO(date) : date;
    return format(d, 'dd MMM yyyy, hh:mm a');
};

export const formatTime = (date) => {
    if (!date) return '—';
    const d = typeof date === 'string' ? parseISO(date) : date;
    return format(d, 'hh:mm a');
};

export const formatRelative = (date) => {
    if (!date) return '—';
    const d = typeof date === 'string' ? parseISO(date) : date;
    return formatDistanceToNow(d, { addSuffix: true });
};

export const formatCurrency = (amount) => {
    if (amount == null) return '₹0';
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

export const formatNumber = (num) => {
    if (num == null) return '0';
    return new Intl.NumberFormat('en-IN').format(num);
};

export const truncate = (str, len = 50) => {
    if (!str) return '';
    return str.length > len ? str.slice(0, len) + '...' : str;
};

export const formatMonth = (monthIndex) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[monthIndex - 1] || '';
};
