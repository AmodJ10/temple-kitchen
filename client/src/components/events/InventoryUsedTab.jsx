import { useState, useEffect, useMemo } from 'react';
import { PackageMinus, Plus, Edit2, Trash2, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { inventoryUsedAPI, inventoryAPI } from '../../api/endpoints';
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

const InventoryUsedForm = ({ event, selectedDayId, initial, onSubmit, onCancel, loading }) => {
    const [inventoryItems, setInventoryItems] = useState([]);
    const [form, setForm] = useState(initial || {
        inventoryItemId: '', itemName: '', quantityUsed: '', unit: '', sourceLocation: '', notes: ''
    });

    useEffect(() => {
        inventoryAPI.getAll().then(res => setInventoryItems(res.data.data)).catch(() => { });
    }, []);

    const selectedItem = useMemo(() => {
        return inventoryItems.find(i => i._id === form.inventoryItemId);
    }, [form.inventoryItemId, inventoryItems]);

    const handleChange = (field, value) => {
        let updates = { [field]: value };
        if (field === 'inventoryItemId' && value) {
            const item = inventoryItems.find(i => i._id === value);
            if (item) {
                updates.itemName = item.name;
                updates.unit = item.unit;
                // Don't auto-fill source location as it might be different, but could if we wanted
            }
        }
        setForm(prev => ({ ...prev, ...updates }));
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();

        // Validation: Warn if deducting more than available (though DB allows negative if logic isn't strict, but UI should warn)
        if (!initial && selectedItem && form.quantityUsed > selectedItem.currentStock) {
            if (!window.confirm(`Warning: You are deducting ${form.quantityUsed} ${form.unit}, but only ${selectedItem.currentStock} ${selectedItem.unit} is available in stock. The stock will go negative. Continue?`)) {
                return;
            }
        }

        onSubmit({
            ...form,
            eventId: event._id,
            eventDayId: selectedDayId,
        });
    };

    return (
        <form onSubmit={handleFormSubmit} className="space-y-6">
            <div className="space-y-4">
                <div>
                    <Select
                        label="Select Master Inventory Item"
                        value={form.inventoryItemId}
                        onChange={(e) => handleChange('inventoryItemId', e.target.value)}
                        options={[{ value: '', label: '-- Select Item --' }, ...inventoryItems.map(i => ({ value: i._id, label: `${i.name} (In stock: ${i.currentStock} ${i.unit})` }))]}
                        disabled={!!initial} // Disallow changing the item itself while editing, to prevent complex reversion logic bugs on the UI side
                        required
                    />
                    {selectedItem && !initial && (
                        <p className={`text-xs mt-1 font-medium ${selectedItem.currentStock <= selectedItem.minimumStockAlert ? 'text-red-500' : 'text-[var(--color-primary)]'}`}>
                            Current Stock: {selectedItem.currentStock} {selectedItem.unit}
                            {selectedItem.currentStock <= selectedItem.minimumStockAlert && ' (Low Stock Alert)'}
                        </p>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Quantity Used"
                        type="number"
                        min={0.01}
                        step="0.01"
                        value={form.quantityUsed || ''}
                        onChange={(e) => handleChange('quantityUsed', Number(e.target.value))}
                        required
                    />
                    <Select
                        label="Unit"
                        value={form.unit}
                        onChange={(e) => handleChange('unit', e.target.value)}
                        options={[{ value: '', label: 'Unit' }, ...UNIT_OPTIONS]}
                        required
                        disabled
                    />
                </div>

                <Input
                    label="Source Location / Store"
                    placeholder="e.g. Main Godown, Kitchen Shelf"
                    value={form.sourceLocation}
                    onChange={(e) => handleChange('sourceLocation', e.target.value)}
                />

                <div>
                    <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">Notes</label>
                    <textarea
                        value={form.notes}
                        onChange={(e) => handleChange('notes', e.target.value)}
                        rows={2}
                        className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] resize-none"
                        placeholder="Why was this used?..."
                    />
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-[var(--color-border)]">
                <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
                    Cancel
                </Button>
                <Button type="submit" loading={loading} disabled={!form.inventoryItemId || !form.quantityUsed}>
                    {initial ? 'Update Record' : 'Record Usage'}
                </Button>
            </div>
        </form>
    );
};

const InventoryUsedTab = ({ event, selectedDayId }) => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [deletingRecord, setDeletingRecord] = useState(null);

    const fetchRecords = async () => {
        if (!selectedDayId) return;
        setLoading(true);
        try {
            const res = await inventoryUsedAPI.getByEventDay(selectedDayId);
            setRecords(res.data.data || []);
        } catch (error) {
            toast.error('Failed to load inventory usage');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecords();
    }, [selectedDayId]);

    const handleSubmit = async (formData) => {
        setSubmitting(true);
        try {
            if (editingRecord) {
                await inventoryUsedAPI.update(editingRecord._id, formData);
                toast.success('Usage updated. Master stock adjusted.');
            } else {
                await inventoryUsedAPI.create(formData);
                toast.success('Usage recorded. Master stock deducted.');
            }
            setIsFormOpen(false);
            setEditingRecord(null);
            fetchRecords();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to record usage');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!deletingRecord) return;
        setSubmitting(true);
        try {
            await inventoryUsedAPI.remove(deletingRecord._id);
            toast.success('Record removed. Master stock restored.');
            setDeletingRecord(null);
            fetchRecords();
        } catch (error) {
            toast.error('Failed to remove record');
        } finally {
            setSubmitting(false);
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
                    <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Inventory Consumption</h3>
                    <p className="text-sm text-[var(--color-text-muted)] mt-1">
                        Deductions made here will irreversibly alter the master inventory stock.
                    </p>
                </div>
                <Button onClick={() => { setEditingRecord(null); setIsFormOpen(true); }}>
                    <Plus size={16} /> Record Usage
                </Button>
            </div>

            <Button onClick={() => { setEditingRecord(null); setIsFormOpen(true); }} className="w-full sm:hidden">
                <Plus size={16} /> Record Usage
            </Button>

            {loading ? (
                <div className="space-y-3">
                    <Skeleton className="h-24 w-full rounded-xl" />
                    <Skeleton className="h-24 w-full rounded-xl" />
                </div>
            ) : records.length === 0 ? (
                <EmptyState
                    icon={PackageMinus}
                    title="No inventory consumed"
                    description="Record ingredients or supplies used on this event day."
                    action={
                        <Button onClick={() => { setEditingRecord(null); setIsFormOpen(true); }}>
                            <Plus size={16} /> Record Usage
                        </Button>
                    }
                />
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {records.map((record) => (
                        <Card key={record._id} className="p-4 flex gap-4 items-start group">
                            <div className="w-10 h-10 rounded-full bg-[var(--color-bg-secondary)] flex items-center justify-center shrink-0">
                                <PackageMinus size={18} className="text-[var(--color-text-secondary)]" />
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className="font-semibold text-[var(--color-text-primary)] truncate">{record.itemName}</h4>
                                    <Badge color={record.inventoryItemId?.currentStock <= record.inventoryItemId?.minimumStockAlert ? '#EF4444' : '#2ECC71'}>
                                        In Stock: {record.inventoryItemId?.currentStock ?? '?'} {record.unit}
                                    </Badge>
                                </div>

                                <p className="text-2xl font-display font-medium text-[var(--color-primary)] mb-2">
                                    -{record.quantityUsed} <span className="text-sm text-[var(--color-text-muted)]">{record.unit}</span>
                                </p>

                                {record.sourceLocation && (
                                    <p className="text-xs text-[var(--color-text-muted)] mb-1">From: {record.sourceLocation}</p>
                                )}
                                {record.notes && (
                                    <p className="text-sm text-[var(--color-text-secondary)] italic">"{record.notes}"</p>
                                )}
                            </div>

                            <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => {
                                        setEditingRecord({
                                            ...record,
                                            inventoryItemId: record.inventoryItemId._id || record.inventoryItemId // handle populate
                                        });
                                        setIsFormOpen(true);
                                    }}
                                    className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-bg-secondary)] rounded-lg transition-colors"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button
                                    onClick={() => setDeletingRecord(record)}
                                    className="p-1.5 text-[var(--color-text-muted)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            <Modal
                isOpen={isFormOpen}
                onClose={() => !submitting && setIsFormOpen(false)}
                title={editingRecord ? "Edit Usage" : "Record Inventory Usage"}
                size="md"
            >
                <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-500/10 rounded-lg flex items-start gap-2 border border-yellow-200 dark:border-yellow-500/20">
                    <AlertTriangle size={16} className="text-yellow-600 mt-0.5 shrink-0" />
                    <p className="text-xs text-yellow-700 dark:text-yellow-500">
                        Recording usage here will immediately deduct stock from the master inventory list. Deleting this record will restore the stock.
                    </p>
                </div>

                <InventoryUsedForm
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
                title="Remove Usage Record"
                message={`Are you sure you want to delete the usage record for "${deletingRecord?.itemName}"? This will RESTORE ${deletingRecord?.quantityUsed} ${deletingRecord?.unit} back to the master inventory.`}
                confirmText="Delete & Restore Stock"
                danger
                loading={submitting}
            />
        </div>
    );
};

export default InventoryUsedTab;
