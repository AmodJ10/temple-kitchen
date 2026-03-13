import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, Phone, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import { vendorAPI } from '../api/endpoints';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Badge from '../components/ui/Badge';
import Pagination from '../components/ui/Pagination';
import PageHeader from '../components/ui/PageHeader';
import useAuthStore from '../store/authStore';

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
                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] resize-none"
                    placeholder="Add payment terms, delivery areas, or vendor notes" />
            </div>
            <div className="flex justify-end gap-3 pt-2">
                <Button variant="ghost" type="button" onClick={onClose}>Cancel</Button>
                <Button type="submit" loading={loading}>{initial ? 'Update' : 'Add Vendor'}</Button>
            </div>
        </form>
    );
};

const VendorsPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [saving, setSaving] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const canEdit = useAuthStore((s) => s.canEdit());
    const [page, setPage] = useState(1);
    const PAGE_SIZE = 25;

    useEffect(() => {
        setSearch(searchParams.get('search') || '');
    }, [searchParams]);

    useEffect(() => { document.title = 'Vendors — MSM Kitchen'; }, []);

    useEffect(() => {
        const nextParams = new URLSearchParams(searchParams);

        search ? nextParams.set('search', search) : nextParams.delete('search');

        if (nextParams.toString() !== searchParams.toString()) {
            setSearchParams(nextParams, { replace: true });
        }
    }, [search, searchParams, setSearchParams]);

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

    useEffect(() => {
        setPage(1);
    }, [search]);

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

    const pageItems = items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    return (
        <div className="page-container space-y-6">
            <PageHeader
                title="Vendors"
                description="Manage supplier records used during event procurement."
                actions={canEdit ? <Button onClick={() => { setEditing(null); setShowForm(true); }}><Plus size={18} /> Add Vendor</Button> : null}
            />

            <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                <input value={search} onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search vendors by name or category"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" />
            </div>

            {!loading && items.length > 0 && (
                <p className="text-sm text-[var(--color-text-muted)] -mt-2">
                    {items.length} vendor{items.length !== 1 ? 's' : ''}{search ? ' matching search' : ''}
                </p>
            )}

            {loading ? (
                <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-14" />)}</div>
            ) : items.length === 0 ? (
                <EmptyState title="No vendors found" description="Add suppliers to track procurements" />
            ) : (
                <div className="overflow-x-auto rounded-xl border border-[var(--color-border)]">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-[var(--color-bg-secondary)]">
                                <th className="text-left py-3 px-4 font-medium text-[var(--color-text-secondary)]">Vendor</th>
                                <th className="text-left py-3 px-4 font-medium text-[var(--color-text-secondary)] hidden sm:table-cell">Category</th>
                                <th className="text-left py-3 px-4 font-medium text-[var(--color-text-secondary)] hidden md:table-cell">Contact</th>
                                <th className="text-left py-3 px-4 font-medium text-[var(--color-text-secondary)] hidden lg:table-cell">Email</th>
                                <th className="text-right py-3 px-4 font-medium text-[var(--color-text-secondary)]">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pageItems.map((item, i) => (
                                <motion.tr key={item._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                                    className="border-t border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)] transition-colors">
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-md bg-[var(--color-primary)] flex items-center justify-center text-white text-xs font-bold shrink-0">
                                                {item.name?.charAt(0)?.toUpperCase()}
                                            </div>
                                            <span className="font-medium text-[var(--color-text-primary)]">{item.name}</span>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 hidden sm:table-cell">
                                        {item.category
                                            ? <Badge color="#6B7280">{item.category}</Badge>
                                            : <span className="text-[var(--color-text-muted)]">—</span>}
                                    </td>
                                    <td className="py-3 px-4 text-[var(--color-text-muted)] hidden md:table-cell">
                                        {item.contactNo
                                            ? <span className="flex items-center gap-1.5"><Phone size={12} />{item.contactNo}</span>
                                            : '—'}
                                    </td>
                                    <td className="py-3 px-4 text-[var(--color-text-muted)] hidden lg:table-cell">
                                        {item.email
                                            ? <span className="flex items-center gap-1.5"><Mail size={12} />{item.email}</span>
                                            : '—'}
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                        {canEdit && (
                                            <div className="flex items-center justify-end gap-1">
                                                <button onClick={() => { setEditing(item); setShowForm(true); }}
                                                    className="p-2 rounded-lg hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] transition-colors"
                                                    title="Edit">
                                                    <Edit2 size={16} />
                                                </button>
                                                <button onClick={() => setDeleteTarget(item)}
                                                    className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 text-red-400 hover:text-red-500 transition-colors"
                                                    title="Delete">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <Pagination
                page={page}
                totalPages={Math.ceil(items.length / PAGE_SIZE)}
                totalItems={items.length}
                pageSize={PAGE_SIZE}
                onPageChange={setPage}
            />

            {canEdit && (
                <Modal isOpen={showForm} onClose={() => { setShowForm(false); setEditing(null); }} title={editing ? 'Edit Vendor' : 'Add New Vendor'} size="lg">
                    <VendorForm onSubmit={handleSave} loading={saving} initial={editing} onClose={() => { setShowForm(false); setEditing(null); }} />
                </Modal>
            )}

            {canEdit && <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
                title="Delete Vendor" message={`Delete "${deleteTarget?.name}"? This cannot be undone.`} confirmText="Delete" />}
        </div>
    );
};

export default VendorsPage;
