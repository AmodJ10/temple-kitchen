import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, Phone, Mail, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { vendorAPI } from '../api/endpoints';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Card from '../components/ui/Card';

const VendorForm = ({ onSubmit, loading, initial, onClose }) => {
    const [form, setForm] = useState(initial || { name: '', contactNo: '', email: '', address: '', category: '', notes: '' });
    useEffect(() => { if (initial) setForm(initial); }, [initial]);
    const handleChange = (field) => (e) => setForm({ ...form, [field]: e.target.value });

    return (
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
            <Input label="Vendor Name *" value={form.name} onChange={handleChange('name')} required />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Contact Number" value={form.contactNo} onChange={handleChange('contactNo')} />
                <Input label="Email" type="email" value={form.email} onChange={handleChange('email')} />
            </div>
            <Input label="Address" value={form.address} onChange={handleChange('address')} />
            <Input label="Category" value={form.category} onChange={handleChange('category')} />
            <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">Notes</label>
                <textarea value={form.notes} onChange={handleChange('notes')} rows={2}
                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] resize-none" />
            </div>
            <div className="flex justify-end gap-3 pt-2">
                <Button variant="ghost" type="button" onClick={onClose}>Cancel</Button>
                <Button type="submit" loading={loading}>{initial ? 'Update' : 'Add Vendor'}</Button>
            </div>
        </form>
    );
};

const VendorsPage = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [saving, setSaving] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const fetchItems = async () => {
        try {
            setLoading(true);
            const params = {};
            if (search) params.search = search;
            const res = await vendorAPI.getAll(params);
            setItems(res.data.data || []);
        } catch { toast.error('Failed to load vendors'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchItems(); }, [search]);

    const handleSave = async (form) => {
        setSaving(true);
        try {
            if (editing) { await vendorAPI.update(editing._id, form); toast.success('Vendor updated'); }
            else { await vendorAPI.create(form); toast.success('Vendor added'); }
            setShowForm(false); setEditing(null); fetchItems();
        } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
        finally { setSaving(false); }
    };

    const handleDelete = async () => {
        try {
            await vendorAPI.remove(deleteTarget._id);
            toast.success('Vendor deleted');
            setDeleteTarget(null); fetchItems();
        } catch { toast.error('Delete failed'); }
    };

    return (
        <div className="page-container space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-[var(--color-text-primary)]">Vendors</h1>
                    <p className="text-[var(--color-text-muted)] text-sm mt-1">Manage your supplier database</p>
                </div>
                <Button onClick={() => { setEditing(null); setShowForm(true); }}><Plus size={18} /> Add Vendor</Button>
            </div>

            <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                <input value={search} onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" />
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-40" />)}
                </div>
            ) : items.length === 0 ? (
                <EmptyState title="No vendors found" description="Add suppliers to track procurements" />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.map((item, i) => (
                        <motion.div key={item._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                            <Card hoverable className="p-5">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="w-10 h-10 rounded-lg bg-[var(--color-primary)] flex items-center justify-center text-white font-bold">
                                        {item.name?.charAt(0)?.toUpperCase()}
                                    </div>
                                    <div className="flex gap-1">
                                        <button onClick={() => { setEditing(item); setShowForm(true); }}
                                            className="p-1.5 rounded-lg hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)]">
                                            <Edit2 size={14} />
                                        </button>
                                        <button onClick={() => setDeleteTarget(item)}
                                            className="p-1.5 rounded-lg hover:bg-red-50 text-red-400">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                                <h3 className="font-semibold text-[var(--color-text-primary)] mb-2">{item.name}</h3>
                                {item.category && <p className="text-xs text-[var(--color-primary)] mb-2">{item.category}</p>}
                                <div className="space-y-1 text-sm text-[var(--color-text-muted)]">
                                    {item.contactNo && <div className="flex items-center gap-2"><Phone size={12} />{item.contactNo}</div>}
                                    {item.email && <div className="flex items-center gap-2"><Mail size={12} />{item.email}</div>}
                                    {item.address && <div className="flex items-center gap-2"><MapPin size={12} /><span className="truncate">{item.address}</span></div>}
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}

            <Modal isOpen={showForm} onClose={() => { setShowForm(false); setEditing(null); }} title={editing ? 'Edit Vendor' : 'Add New Vendor'} size="lg">
                <VendorForm onSubmit={handleSave} loading={saving} initial={editing} onClose={() => { setShowForm(false); setEditing(null); }} />
            </Modal>

            <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
                title="Delete Vendor" message={`Delete "${deleteTarget?.name}"? This cannot be undone.`} confirmText="Delete" />
        </div>
    );
};

export default VendorsPage;
