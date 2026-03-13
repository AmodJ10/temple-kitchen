import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, Users, UserCheck, UserX, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { sevekariAPI } from '../api/endpoints';
import { formatDate } from '../utils/formatters';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Pagination from '../components/ui/Pagination';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import useAuthStore from '../store/authStore';

const SevekariForm = ({ onSubmit, loading, initial, onClose }) => {
    const [form, setForm] = useState(initial || {
        name: '', phone: '', email: '', address: '', joinDate: new Date().toISOString().split('T')[0], isActive: true, notes: '',
    });

    useEffect(() => { if (initial) setForm(initial); }, [initial]);
    const handleChange = (field) => (e) => setForm({ ...form, [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

    return (
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
            <Input label="Full Name *" value={form.name} onChange={handleChange('name')} required />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Phone" value={form.phone} onChange={handleChange('phone')} />
                <Input label="Email" type="email" value={form.email} onChange={handleChange('email')} />
            </div>
            <Input label="Address" value={form.address} onChange={handleChange('address')} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Join Date" type="date" value={form.joinDate?.split('T')[0] || ''} onChange={handleChange('joinDate')} />
                <div className="flex items-center gap-3 pt-6">
                    <input type="checkbox" id="isActive" checked={form.isActive} onChange={handleChange('isActive')} className="w-4 h-4 rounded accent-[var(--color-primary)]" />
                    <label htmlFor="isActive" className="text-sm text-[var(--color-text-secondary)]">Active Sevekari</label>
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">Notes</label>
                <textarea value={form.notes} onChange={handleChange('notes')} rows={2}
                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] resize-none"
                    placeholder="Add seva preferences, availability, or special notes"
                />
            </div>
            <div className="flex justify-end gap-3 pt-2">
                <Button variant="ghost" type="button" onClick={onClose}>Cancel</Button>
                <Button type="submit" loading={loading}>{initial ? 'Update' : 'Add Sevekari'}</Button>
            </div>
        </form>
    );
};

const MasterSevekariPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [activeFilter, setActiveFilter] = useState(searchParams.get('isActive') || '');
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [saving, setSaving] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [hardDeleteTarget, setHardDeleteTarget] = useState(null);
    const canEdit = useAuthStore((s) => s.canEdit());
    const [page, setPage] = useState(1);
    const PAGE_SIZE = 25;

    useEffect(() => {
        setSearch(searchParams.get('search') || '');
        setActiveFilter(searchParams.get('isActive') || '');
    }, [searchParams]);

    useEffect(() => {
        const nextParams = new URLSearchParams(searchParams);

        search ? nextParams.set('search', search) : nextParams.delete('search');
        activeFilter ? nextParams.set('isActive', activeFilter) : nextParams.delete('isActive');

        if (nextParams.toString() !== searchParams.toString()) {
            setSearchParams(nextParams, { replace: true });
        }
    }, [activeFilter, search, searchParams, setSearchParams]);

    const fetchItems = async () => {
        try {
            setLoading(true);
            const params = {};
            if (search) params.search = search;
            if (activeFilter) params.isActive = activeFilter;
            const res = await sevekariAPI.getAll(params);
            setItems(res.data.data || []);
        } catch { toast.error('Failed to load sevekaris'); }
        finally { setLoading(false); }
    };

    useEffect(() => { setPage(1); fetchItems(); }, [search, activeFilter]);

    useEffect(() => { document.title = 'Sevekaris — MSM Kitchen'; }, []);

    const handleSave = async (form) => {
        setSaving(true);
        try {
            if (editing) { await sevekariAPI.update(editing._id, form); toast.success('Sevekari updated'); }
            else { await sevekariAPI.create(form); toast.success('Sevekari added 🙏'); }
            setShowForm(false); setEditing(null); fetchItems();
        } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
        finally { setSaving(false); }
    };

    const handleDelete = async () => {
        try {
            await sevekariAPI.remove(deleteTarget._id);
            toast.success('Sevekari deactivated');
            setDeleteTarget(null); fetchItems();
        } catch { toast.error('Failed to deactivate'); }
    };

    const handleHardDelete = async () => {
        try {
            await sevekariAPI.hardDelete(hardDeleteTarget._id);
            toast.success('Sevekari permanently deleted');
            setHardDeleteTarget(null); fetchItems();
        } catch (err) { toast.error(err.response?.data?.message || 'Failed to delete'); }
    };

    const pageItems = items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const stats = useMemo(() => {
        const active = items.filter((item) => item.isActive).length;
        const inactive = items.length - active;

        return [
            { label: 'Total Sevekaris', value: items.length, icon: Users },
            { label: 'Active', value: active, icon: UserCheck },
            { label: 'Inactive', value: inactive, icon: UserX },
        ];
    }, [items]);

    return (
        <div className="page-container space-y-6">
            <PageHeader
                title="Sevekaris"
                description="Master volunteer roster used for attendance and event assignments."
                eyebrow="Volunteer Operations"
                actions={canEdit ? <Button onClick={() => { setEditing(null); setShowForm(true); }}><Plus size={18} /> Add Sevekari</Button> : null}
            />

            <Card className="relative overflow-hidden border-[var(--color-primary)]/20 bg-gradient-to-br from-[var(--color-bg-card)] to-[var(--color-bg-secondary)] p-5 sm:p-6">
                <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-[var(--color-primary)]/10 blur-2xl" />
                <div className="pointer-events-none absolute -left-12 bottom-0 h-28 w-28 rounded-full bg-[var(--color-primary)]/10 blur-2xl" />
                <div className="relative space-y-4">
                    <div className="flex items-center gap-2 text-[var(--color-text-secondary)] text-sm">
                        <UserPlus size={16} />
                        <span>Roster health and availability</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {stats.map((stat, idx) => {
                            const Icon = stat.icon;
                            return (
                                <motion.div
                                    key={stat.label}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.04 }}
                                    className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] px-4 py-3"
                                >
                                    <div className="flex items-center gap-2 text-[var(--color-text-muted)] text-xs uppercase tracking-wide">
                                        <Icon size={14} />
                                        {stat.label}
                                    </div>
                                    <p className="mt-2 text-2xl font-semibold tracking-tight text-[var(--color-text-primary)]">{stat.value}</p>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </Card>

            <Card className="p-4 sm:p-5 space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                        <input value={search} onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name, phone, or email"
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" />
                    </div>
                    <div className="flex flex-wrap gap-2">
                    {['', 'true', 'false'].map((v) => (
                        <button key={v} onClick={() => setActiveFilter(v)}
                            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors border ${activeFilter === v
                                ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white'
                                : 'bg-[var(--color-bg-secondary)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)]/40'
                                }`}>
                            {v === '' ? 'All' : v === 'true' ? 'Active' : 'Inactive'}
                        </button>
                    ))}
                    </div>
                </div>
            </Card>

            {!loading && items.length > 0 && (
                <p className="text-sm text-[var(--color-text-muted)] -mt-2">
                    {items.length} sevekari{items.length !== 1 ? 's' : ''}
                    {activeFilter === 'true' ? ' (active)' : activeFilter === 'false' ? ' (inactive)' : ''}
                </p>
            )}
            {loading ? (
                <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-16" />)}</div>
            ) : items.length === 0 ? (
                <EmptyState title="No sevekaris found" description="Add your first volunteer to get started" />
            ) : (
                <>
                    <div className="overflow-x-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)]">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-[var(--color-bg-secondary)]">
                                    <th className="text-left py-3 px-4 font-medium text-[var(--color-text-secondary)]">Name</th>
                                    <th className="text-left py-3 px-4 font-medium text-[var(--color-text-secondary)] hidden sm:table-cell">Phone</th>
                                    <th className="text-left py-3 px-4 font-medium text-[var(--color-text-secondary)] hidden md:table-cell">Email</th>
                                    <th className="text-left py-3 px-4 font-medium text-[var(--color-text-secondary)] hidden lg:table-cell">Joined</th>
                                    <th className="text-left py-3 px-4 font-medium text-[var(--color-text-secondary)]">Status</th>
                                    <th className="text-right py-3 px-4 font-medium text-[var(--color-text-secondary)]">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pageItems.map((item, i) => (
                                    <motion.tr key={item._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                                        className="border-t border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)]/65 transition-colors">
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)]/90 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                                    {item.name?.charAt(0)?.toUpperCase()}
                                                </div>
                                                <span className="font-medium text-[var(--color-text-primary)]">{item.name}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-[var(--color-text-muted)] hidden sm:table-cell">{item.phone || '—'}</td>
                                        <td className="py-3 px-4 text-[var(--color-text-muted)] hidden md:table-cell">{item.email || '—'}</td>
                                        <td className="py-3 px-4 text-[var(--color-text-muted)] hidden lg:table-cell">{formatDate(item.joinDate)}</td>
                                        <td className="py-3 px-4">
                                            <Badge color={item.isActive ? '#3D8B37' : '#9C8060'}>
                                                {item.isActive ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                {canEdit && (
                                                    <>
                                                        <button onClick={() => { setEditing(item); setShowForm(true); }}
                                                            className="p-2 rounded-lg hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] transition-colors"
                                                            title="Edit">
                                                            <Edit2 size={16} />
                                                        </button>
                                                        {item.isActive && (
                                                            <button onClick={() => setDeleteTarget(item)}
                                                                className="p-2 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-950/20 text-orange-400 hover:text-orange-500 transition-colors"
                                                                title="Deactivate (reversible)">
                                                                <UserX size={16} />
                                                            </button>
                                                        )}
                                                        <div className="w-px h-5 bg-[var(--color-border)] mx-0.5" />
                                                        <button onClick={() => setHardDeleteTarget(item)}
                                                            className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 text-red-400 hover:text-red-500 transition-colors"
                                                            title="Delete permanently (cannot undo)">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <Pagination page={page} totalPages={Math.ceil(items.length / PAGE_SIZE)} totalItems={items.length} pageSize={PAGE_SIZE} onPageChange={setPage} />
                </>
            )}

            {canEdit && (
                <Modal isOpen={showForm} onClose={() => { setShowForm(false); setEditing(null); }} title={editing ? 'Edit Sevekari' : 'Add New Sevekari'} size="lg">
                    <SevekariForm onSubmit={handleSave} loading={saving} initial={editing} onClose={() => { setShowForm(false); setEditing(null); }} />
                </Modal>
            )}

            {canEdit && <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
                title="Deactivate Sevekari" message={`Are you sure you want to deactivate "${deleteTarget?.name}"? They will be marked as inactive.`} confirmText="Deactivate" />}

            {canEdit && <ConfirmDialog isOpen={!!hardDeleteTarget} onClose={() => setHardDeleteTarget(null)} onConfirm={handleHardDelete}
                title="Delete Sevekari Permanently" message={`Are you sure you want to permanently delete "${hardDeleteTarget?.name}"? This action cannot be undone and all associated data may be lost.`}
                confirmText="Delete Forever" danger />}
        </div>
    );
};

export default MasterSevekariPage;
