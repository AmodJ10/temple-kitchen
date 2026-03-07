import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, AlertTriangle, History } from 'lucide-react';
import toast from 'react-hot-toast';
import { inventoryAPI } from '../api/endpoints';
import { formatDate, formatNumber } from '../utils/formatters';
import { INVENTORY_CATEGORIES, UNIT_OPTIONS } from '../utils/constants';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Card from '../components/ui/Card';

const InventoryForm = ({ onSubmit, loading, initial, onClose }) => {
    const [form, setForm] = useState(initial || {
        name: '', unit: 'kg', currentStock: '', minimumStockAlert: '', location: '', category: '', notes: '',
    });
    useEffect(() => { if (initial) setForm(initial); }, [initial]);
    const handleChange = (field) => (e) => setForm({ ...form, [field]: e.target.type === 'number' ? Number(e.target.value) : e.target.value });

    return (
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
            <Input label="Item Name *" value={form.name} onChange={handleChange('name')} required />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Select label="Unit *" value={form.unit} onChange={handleChange('unit')} options={[{ value: '', label: 'Select unit' }, ...UNIT_OPTIONS]} required />
                <Input label="Current Stock" type="number" min={0} step="any" value={form.currentStock} onChange={handleChange('currentStock')} />
                <Input label="Min Stock Alert" type="number" min={0} step="any" value={form.minimumStockAlert} onChange={handleChange('minimumStockAlert')} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select label="Category" value={form.category} onChange={handleChange('category')}
                    options={INVENTORY_CATEGORIES.map(c => ({ value: c, label: c }))} />
                <Input label="Storage Location" value={form.location} onChange={handleChange('location')} />
            </div>
            <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">Notes</label>
                <textarea value={form.notes} onChange={handleChange('notes')} rows={2}
                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] resize-none" />
            </div>
            <div className="flex justify-end gap-3 pt-2">
                <Button variant="ghost" type="button" onClick={onClose}>Cancel</Button>
                <Button type="submit" loading={loading}>{initial ? 'Update' : 'Add Item'}</Button>
            </div>
        </form>
    );
};

const StockAdjustForm = ({ item, onSubmit, loading, onClose }) => {
    const [form, setForm] = useState({ quantity: 0, type: 'addition', notes: '' });

    return (
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
            <div className="p-3 bg-[var(--color-bg-secondary)] rounded-xl">
                <p className="text-sm text-[var(--color-text-muted)]">Current Stock</p>
                <p className="text-xl font-bold font-mono text-[var(--color-text-primary)]">{item.currentStock} {item.unit}</p>
            </div>
            <Select label="Adjustment Type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                options={[{ value: 'addition', label: 'Add Stock' }, { value: 'deduction', label: 'Deduct Stock' }, { value: 'adjustment', label: 'Set New Level' }]} />
            <Input label="Quantity" type="number" min={0} step="any" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} required />
            <Input label="Reason / Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            <div className="flex justify-end gap-3 pt-2">
                <Button variant="ghost" type="button" onClick={onClose}>Cancel</Button>
                <Button type="submit" loading={loading}>Adjust Stock</Button>
            </div>
        </form>
    );
};

const MasterInventoryPage = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [saving, setSaving] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [adjustItem, setAdjustItem] = useState(null);
    const [adjusting, setAdjusting] = useState(false);

    const fetchItems = async () => {
        try {
            setLoading(true);
            const params = {};
            if (search) params.search = search;
            if (categoryFilter) params.category = categoryFilter;
            const res = await inventoryAPI.getAll(params);
            setItems(res.data.data || []);
        } catch { toast.error('Failed to load inventory'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchItems(); }, [search, categoryFilter]);

    const handleSave = async (form) => {
        setSaving(true);
        try {
            if (editing) { await inventoryAPI.update(editing._id, form); toast.success('Item updated'); }
            else { await inventoryAPI.create(form); toast.success('Item added'); }
            setShowForm(false); setEditing(null); fetchItems();
        } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
        finally { setSaving(false); }
    };

    const handleAdjust = async (form) => {
        setAdjusting(true);
        try {
            await inventoryAPI.adjustStock(adjustItem._id, form);
            toast.success('Stock adjusted');
            setAdjustItem(null); fetchItems();
        } catch (err) { toast.error(err.response?.data?.message || 'Adjustment failed'); }
        finally { setAdjusting(false); }
    };

    const handleDelete = async () => {
        try {
            await inventoryAPI.remove(deleteTarget._id);
            toast.success('Item deleted');
            setDeleteTarget(null); fetchItems();
        } catch { toast.error('Delete failed'); }
    };

    return (
        <div className="page-container space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-[var(--color-text-primary)]">Inventory</h1>
                    <p className="text-[var(--color-text-muted)] text-sm mt-1">Master inventory with stock tracking</p>
                </div>
                <Button onClick={() => { setEditing(null); setShowForm(true); }}><Plus size={18} /> Add Item</Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                    <input value={search} onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" />
                </div>
                <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
                    options={INVENTORY_CATEGORIES.map(c => ({ value: c, label: c }))} />
            </div>

            {loading ? (
                <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-16" />)}</div>
            ) : items.length === 0 ? (
                <EmptyState title="No inventory items" description="Add ingredients and supplies to track stock" />
            ) : (
                <div className="overflow-x-auto rounded-xl border border-[var(--color-border)]">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-[var(--color-bg-secondary)]">
                                <th className="text-left py-3 px-4 font-medium text-[var(--color-text-secondary)]">Item</th>
                                <th className="text-left py-3 px-4 font-medium text-[var(--color-text-secondary)] hidden md:table-cell">Category</th>
                                <th className="text-right py-3 px-4 font-medium text-[var(--color-text-secondary)]">Stock</th>
                                <th className="text-left py-3 px-4 font-medium text-[var(--color-text-secondary)] hidden lg:table-cell">Location</th>
                                <th className="text-right py-3 px-4 font-medium text-[var(--color-text-secondary)]">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, i) => {
                                const isLow = item.currentStock < item.minimumStockAlert;
                                return (
                                    <motion.tr key={item._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                                        className={`border-t border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)] transition-colors ${isLow ? 'bg-red-50/50 dark:bg-red-950/10' : ''}`}>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2">
                                                {isLow && <AlertTriangle size={14} className="text-red-500 shrink-0" />}
                                                <span className="font-medium text-[var(--color-text-primary)]">{item.name}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-[var(--color-text-muted)] hidden md:table-cell">{item.category || '—'}</td>
                                        <td className="py-3 px-4 text-right">
                                            <span className={`font-mono font-bold ${isLow ? 'text-red-500' : 'text-[var(--color-text-primary)]'}`}>
                                                {formatNumber(item.currentStock)}
                                            </span>
                                            <span className="text-[var(--color-text-muted)] text-xs ml-1">{item.unit}</span>
                                        </td>
                                        <td className="py-3 px-4 text-[var(--color-text-muted)] hidden lg:table-cell">{item.location || '—'}</td>
                                        <td className="py-3 px-4 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button onClick={() => setAdjustItem(item)} title="Adjust stock"
                                                    className="p-1.5 rounded-lg hover:bg-[var(--color-bg-secondary)] text-[var(--color-primary)] transition-colors">
                                                    <History size={16} />
                                                </button>
                                                <button onClick={() => { setEditing(item); setShowForm(true); }}
                                                    className="p-1.5 rounded-lg hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] transition-colors">
                                                    <Edit2 size={16} />
                                                </button>
                                                <button onClick={() => setDeleteTarget(item)}
                                                    className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-colors">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            <Modal isOpen={showForm} onClose={() => { setShowForm(false); setEditing(null); }} title={editing ? 'Edit Item' : 'Add Inventory Item'} size="lg">
                <InventoryForm onSubmit={handleSave} loading={saving} initial={editing} onClose={() => { setShowForm(false); setEditing(null); }} />
            </Modal>

            <Modal isOpen={!!adjustItem} onClose={() => setAdjustItem(null)} title={`Adjust Stock — ${adjustItem?.name}`} size="md">
                {adjustItem && <StockAdjustForm item={adjustItem} onSubmit={handleAdjust} loading={adjusting} onClose={() => setAdjustItem(null)} />}
            </Modal>

            <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
                title="Delete Item" message={`Delete "${deleteTarget?.name}" from inventory? This cannot be undone.`} confirmText="Delete" />
        </div>
    );
};

export default MasterInventoryPage;
