import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ShoppingBag, Receipt, Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { procurementAPI, vendorAPI } from '../../api/endpoints';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { UNIT_OPTIONS } from '../../utils/constants';
import Card from '../ui/Card';
import Modal from '../ui/Modal';
import Badge from '../ui/Badge';
import EmptyState from '../ui/EmptyState';
import ConfirmDialog from '../ui/ConfirmDialog';
import Skeleton from '../ui/Skeleton';
import { formatCurrency, formatDate } from '../../utils/formatters';

const PAYMENT_STATUSES = [
    { value: 'pending', label: 'Pending', color: '#F1C40F' },
    { value: 'partial', label: 'Partial', color: '#3498DB' },
    { value: 'paid', label: 'Paid', color: '#2ECC71' }
];

const ProcurementForm = ({ event, selectedDayId, initial, onSubmit, onCancel, loading }) => {
    const [vendors, setVendors] = useState([]);
    const [form, setForm] = useState(initial || {
        vendorId: '', vendorName: '', vendorContact: '',
        items: [], grandTotal: '', paymentStatus: 'pending', amountPaid: '', notes: ''
    });

    useEffect(() => {
        vendorAPI.getAll().then(res => setVendors(res.data.data)).catch(() => { });
    }, []);

    const handleChange = (field, value) => {
        let updates = { [field]: value };
        if (field === 'vendorId' && value) {
            const vendor = vendors.find(v => v._id === value);
            if (vendor) {
                updates.vendorName = vendor.name;
                updates.vendorContact = vendor.contactNo;
            }
        }
        setForm(prev => ({ ...prev, ...updates }));
    };

    const handleAddItem = () => {
        setForm(prev => ({
            ...prev,
            items: [...prev.items, { name: '', quantity: '', unit: '', ratePerUnit: '', totalPrice: '' }]
        }));
    };

    const handleRemoveItem = (index) => {
        setForm(prev => {
            const newItems = prev.items.filter((_, i) => i !== index);
            const grandTotal = newItems.reduce((sum, item) => sum + item.totalPrice, 0);
            return { ...prev, items: newItems, grandTotal };
        });
    };

    const handleItemChange = (index, field, value) => {
        setForm(prev => {
            const newItems = [...prev.items];
            const item = newItems[index];
            item[field] = value;

            // Auto-calculate totalPrice
            if (field === 'quantity' || field === 'ratePerUnit') {
                item.totalPrice = Number((item.quantity * item.ratePerUnit).toFixed(2));
            } else if (field === 'totalPrice') {
                // If they manually override total price, don't auto-calculate it
            }

            const grandTotal = newItems.reduce((sum, i) => sum + i.totalPrice, 0);
            return { ...prev, items: newItems, grandTotal };
        });
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        onSubmit({
            ...form,
            eventId: event._id,
            eventDayId: selectedDayId,
        });
    };

    return (
        <form onSubmit={handleFormSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                    label="Select Existing Vendor (Optional)"
                    value={form.vendorId}
                    onChange={(e) => handleChange('vendorId', e.target.value)}
                    options={[{ value: '', label: 'Custom Vendor' }, ...vendors.map(v => ({ value: v._id, label: v.name }))]}
                />
                <Input
                    label="Vendor Name"
                    value={form.vendorName}
                    onChange={(e) => handleChange('vendorName', e.target.value)}
                    required
                />
            </div>

            <div className="bg-[var(--color-bg-secondary)] p-4 rounded-xl space-y-4 border border-[var(--color-border)]">
                <div className="flex items-center justify-between">
                    <h4 className="font-medium text-[var(--color-text-primary)]">Procured Items</h4>
                    <Button type="button" size="sm" variant="outline" onClick={handleAddItem}>
                        <Plus size={14} /> Add Item
                    </Button>
                </div>

                {form.items.length === 0 ? (
                    <p className="text-sm text-[var(--color-text-muted)] italic">No items listed. Required.</p>
                ) : (
                    <div className="space-y-3">
                        {/* Column Headers for Items */}
                        <div className="hidden sm:flex items-center gap-2 px-2 pb-1 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider pr-[42px]">
                            <div className="flex-1 min-w-[120px]">Item Name</div>
                            <div className="w-20 shrink-0 text-center">Qty</div>
                            <div className="w-24 shrink-0 text-center">Unit</div>
                            <div className="w-24 shrink-0 text-center">Rate</div>
                            <div className="w-24 shrink-0 text-center">Total</div>
                        </div>

                        {form.items.map((item, idx) => (
                            <div key={idx} className="flex flex-wrap sm:flex-nowrap items-center gap-2">
                                <div className="flex-1 w-full sm:w-auto min-w-[120px]">
                                    <Input
                                        placeholder="Item Name"
                                        value={item.name}
                                        onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="w-full sm:w-20 shrink-0">
                                    <Input
                                        type="number" min={0} step="0.01" placeholder="Qty"
                                        value={item.quantity === '' ? '' : item.quantity}
                                        onChange={(e) => handleItemChange(idx, 'quantity', e.target.value === '' ? '' : Number(e.target.value))}
                                        required
                                    />
                                </div>
                                <div className="w-full sm:w-24 shrink-0">
                                    <Select
                                        value={item.unit}
                                        onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                                        options={[{ value: '', label: 'Unit' }, ...UNIT_OPTIONS]}
                                        required
                                    />
                                </div>
                                <div className="w-full sm:w-24 shrink-0">
                                    <Input
                                        type="number" min={0} step="0.01" placeholder="Rate/Unit"
                                        value={item.ratePerUnit === '' ? '' : item.ratePerUnit}
                                        onChange={(e) => handleItemChange(idx, 'ratePerUnit', e.target.value === '' ? '' : Number(e.target.value))}
                                        required
                                    />
                                </div>
                                <div className="w-full sm:w-24 shrink-0">
                                    <Input
                                        type="number" min={0} step="0.01" placeholder="Total"
                                        value={item.totalPrice}
                                        onChange={(e) => handleItemChange(idx, 'totalPrice', Number(e.target.value))}
                                        required
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveItem(idx)}
                                    className="p-2 text-[var(--color-text-muted)] hover:text-red-500 rounded-lg shrink-0"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-[var(--color-border)] pt-4">
                <Input
                    label="Grand Total (₹)"
                    type="number" min={0} step="0.01"
                    value={form.grandTotal}
                    onChange={(e) => handleChange('grandTotal', Number(e.target.value))}
                    required
                    readOnly
                    className="bg-transparent"
                />
                <Select
                    label="Payment Status"
                    value={form.paymentStatus}
                    onChange={(e) => handleChange('paymentStatus', e.target.value)}
                    options={PAYMENT_STATUSES.map(t => ({ value: t.value, label: t.label }))}
                />
                <Input
                    label="Amount Paid (₹)"
                    type="number" min={0} step="0.01"
                    value={form.amountPaid}
                    onChange={(e) => handleChange('amountPaid', Number(e.target.value))}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">Notes</label>
                <textarea
                    value={form.notes}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    rows={2}
                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] resize-none"
                    placeholder="Invoice numbers, delivery details..."
                />
            </div>

            <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
                    Cancel
                </Button>
                <Button type="submit" loading={loading} disabled={form.items.length === 0}>
                    {initial ? 'Update Record' : 'Save Record'}
                </Button>
            </div>
        </form>
    );
};

const ProcurementTab = ({ event, selectedDayId }) => {
    const [procurements, setProcurements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [deletingRecord, setDeletingRecord] = useState(null);

    const [uploadingId, setUploadingId] = useState(null);
    const fileInputId = 'receipt-upload';

    const fetchProcurements = async () => {
        if (!selectedDayId) return;
        setLoading(true);
        try {
            const res = await procurementAPI.getByEventDay(selectedDayId);
            setProcurements(res.data.data || []);
        } catch (error) {
            toast.error('Failed to load procurements');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProcurements();
    }, [selectedDayId]);

    const handleSubmit = async (formData) => {
        setSubmitting(true);
        try {
            if (editingRecord) {
                await procurementAPI.update(editingRecord._id, formData);
                toast.success('Record updated');
            } else {
                await procurementAPI.create(formData);
                toast.success('Record added');
            }
            setIsFormOpen(false);
            setEditingRecord(null);
            fetchProcurements();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save record');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!deletingRecord) return;
        setSubmitting(true);
        try {
            await procurementAPI.remove(deletingRecord._id);
            toast.success('Record removed');
            setDeletingRecord(null);
            fetchProcurements();
        } catch (error) {
            toast.error('Failed to delete record');
        } finally {
            setSubmitting(false);
        }
    };

    const handleFileUpload = async (e, recordId) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingId(recordId);
        try {
            await procurementAPI.uploadReceipt(recordId, file);
            toast.success('Receipt uploaded successfully');
            fetchProcurements();
        } catch (error) {
            toast.error('Failed to upload receipt');
        } finally {
            setUploadingId(null);
        }
    };

    if (!selectedDayId) {
        return (
            <Card className="p-8 text-center text-[var(--color-text-muted)]">
                <p>No event day selected.</p>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center hidden sm:flex">
                <div>
                    <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Vendor Procurements</h3>
                    <p className="text-sm text-[var(--color-text-muted)] mt-1">
                        Total items: {procurements.reduce((sum, p) => sum + p.items.length, 0)} •
                        Total cost: {formatCurrency(procurements.reduce((sum, p) => sum + p.grandTotal, 0))}
                    </p>
                </div>
                <Button onClick={() => { setEditingRecord(null); setIsFormOpen(true); }}>
                    <Plus size={16} /> Add Purchase
                </Button>
            </div>

            <Button onClick={() => { setEditingRecord(null); setIsFormOpen(true); }} className="w-full sm:hidden">
                <Plus size={16} /> Add Purchase
            </Button>

            {loading ? (
                <div className="space-y-3">
                    <Skeleton className="h-40 w-full rounded-xl" />
                    <Skeleton className="h-40 w-full rounded-xl" />
                </div>
            ) : procurements.length === 0 ? (
                <EmptyState
                    icon={ShoppingBag}
                    title="No purchases recorded"
                    description="Track vendor bills and receipts for this event day"
                    action={
                        <Button onClick={() => { setEditingRecord(null); setIsFormOpen(true); }}>
                            <Plus size={16} /> Add Purchase
                        </Button>
                    }
                />
            ) : (
                <div className="space-y-4">
                    {procurements.map((record) => {
                        const statusInfo = PAYMENT_STATUSES.find(s => s.value === record.paymentStatus);
                        return (
                            <Card key={record._id} className="p-5 flex flex-col md:flex-row gap-5">
                                <div className="flex-1 space-y-3">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-semibold text-lg text-[var(--color-text-primary)]">{record.vendorName}</h4>
                                            <Badge color={statusInfo?.color}>{statusInfo?.label}</Badge>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xl font-medium text-[var(--color-text-primary)]">{formatCurrency(record.grandTotal)}</p>
                                            <p className="text-xs text-[var(--color-text-muted)]">Paid: {formatCurrency(record.amountPaid)}</p>
                                        </div>
                                    </div>

                                    <div className="bg-[var(--color-bg-secondary)] rounded-lg p-3">
                                        <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Items</p>
                                        <div className="space-y-1">
                                            {record.items.map((item, i) => (
                                                <div key={i} className="flex justify-between text-sm text-[var(--color-text-secondary)]">
                                                    <span>{item.name} ({item.quantity} {item.unit})</span>
                                                    <span>{formatCurrency(item.totalPrice)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {record.notes && (
                                        <p className="text-sm text-[var(--color-text-muted)] italic">Note: {record.notes}</p>
                                    )}
                                </div>

                                <div className="flex flex-row md:flex-col items-center justify-end gap-2 border-t md:border-t-0 md:border-l border-[var(--color-border)] pt-4 md:pt-0 md:pl-4">
                                    {record.receiptUrl ? (
                                        <a
                                            href={record.receiptUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[var(--color-primary)] hover:bg-[var(--color-bg-secondary)] rounded-lg transition-colors w-full justify-center md:justify-start"
                                        >
                                            <Receipt size={16} /> View Receipt
                                        </a>
                                    ) : (
                                        <label className={`flex items-center gap-2 px-3 py-2 text-sm font-medium border border-dashed border-[var(--color-border)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] text-[var(--color-text-muted)] rounded-lg cursor-pointer transition-colors w-full justify-center md:justify-start ${uploadingId === record._id ? 'opacity-50 pointer-events-none' : ''}`}>
                                            <Upload size={16} />
                                            {uploadingId === record._id ? 'Uploading...' : 'Upload Receipt'}
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*,.pdf"
                                                onChange={(e) => handleFileUpload(e, record._id)}
                                                disabled={uploadingId === record._id}
                                            />
                                        </label>
                                    )}
                                    <button
                                        onClick={() => { setEditingRecord(record); setIsFormOpen(true); }}
                                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-bg-secondary)] rounded-lg transition-colors w-full justify-center md:justify-start"
                                    >
                                        <Edit2 size={16} /> Edit Details
                                    </button>
                                    <button
                                        onClick={() => setDeletingRecord(record)}
                                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[var(--color-text-muted)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors w-full justify-center md:justify-start"
                                    >
                                        <Trash2 size={16} /> Delete Record
                                    </button>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}

            <Modal
                isOpen={isFormOpen}
                onClose={() => !submitting && setIsFormOpen(false)}
                title={editingRecord ? "Edit Purchase" : "Record Purchase"}
                size="lg"
            >
                <ProcurementForm
                    event={event}
                    selectedDayId={selectedDayId}
                    initial={editingRecord}
                    onSubmit={handleSubmit}
                    onCancel={() => setIsFormOpen(false)}
                    loading={submitting}
                />
            </Modal>

            <ConfirmDialog
                isOpen={!!deletingRecord}
                onClose={() => setDeletingRecord(null)}
                onConfirm={handleDelete}
                title="Delete Record"
                message={`Are you sure you want to delete the purchase record from "${deletingRecord?.vendorName}"?`}
                confirmText="Delete"
                danger
                loading={submitting}
            />
        </div>
    );
};

export default ProcurementTab;
