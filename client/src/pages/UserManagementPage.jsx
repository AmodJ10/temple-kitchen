import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Trash2, Shield, ShieldCheck, Wrench, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { usersAPI, authAPI } from '../api/endpoints';
import useAuthStore from '../store/authStore';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import Card from '../components/ui/Card';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import ConfirmDialog from '../components/ui/ConfirmDialog';

const ROLE_CONFIG = {
    engineer: { label: 'Engineer', color: '#8B5CF6', icon: Wrench },
    admin: { label: 'Admin', color: '#3B82F6', icon: ShieldCheck },
    user: { label: 'User', color: '#6B7280', icon: Shield },
};

const RegisterForm = ({ onSubmit, loading, onClose }) => {
    const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' });
    const handleChange = (field) => (e) => setForm({ ...form, [field]: e.target.value });

    return (
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
            <Input label="Full Name" value={form.name} onChange={handleChange('name')} required placeholder="e.g. John Doe" />
            <Input label="Email" type="email" value={form.email} onChange={handleChange('email')} required placeholder="e.g. user@temple.org" />
            <Input label="Password" type="password" value={form.password} onChange={handleChange('password')} required
                placeholder="Min 6 characters" minLength={6} />
            <Select label="Role" value={form.role} onChange={handleChange('role')}
                options={[
                    { value: 'user', label: 'User (Read Only)' },
                    { value: 'admin', label: 'Admin (Full Access)' },
                    { value: 'engineer', label: 'Engineer (Early Access)' },
                ]}
            />
            <div className="flex justify-end gap-3 pt-2">
                <Button variant="ghost" type="button" onClick={onClose}>Cancel</Button>
                <Button type="submit" loading={loading}>Create User</Button>
            </div>
        </form>
    );
};

const UserManagementPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showRegister, setShowRegister] = useState(false);
    const [registering, setRegistering] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const currentUser = useAuthStore((s) => s.user);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await usersAPI.getAll();
            setUsers(res.data.data || []);
        } catch { toast.error('Failed to load users'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchUsers(); }, []);

    const handleRegister = async (form) => {
        setRegistering(true);
        try {
            await authAPI.register(form);
            toast.success(`User "${form.name}" created`);
            setShowRegister(false);
            fetchUsers();
        } catch (err) { toast.error(err.response?.data?.message || 'Failed to create user'); }
        finally { setRegistering(false); }
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            await usersAPI.updateRole(userId, newRole);
            toast.success('Role updated');
            fetchUsers();
        } catch (err) { toast.error(err.response?.data?.message || 'Failed to update role'); }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            await usersAPI.remove(deleteTarget._id);
            toast.success('User deleted');
            setDeleteTarget(null);
            fetchUsers();
        } catch (err) { toast.error(err.response?.data?.message || 'Failed to delete user'); }
    };

    const filtered = users.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="page-container space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="font-display text-2xl md:text-3xl font-bold text-[var(--color-text-primary)]">User Management</h1>
                    <p className="text-[var(--color-text-muted)] text-sm mt-1">Manage user accounts and roles</p>
                </div>
                <Button onClick={() => setShowRegister(true)}><UserPlus size={18} /> Add User</Button>
            </div>

            {/* Role Legend */}
            <div className="flex flex-wrap gap-3">
                {Object.entries(ROLE_CONFIG).map(([key, cfg]) => {
                    const Icon = cfg.icon;
                    const count = users.filter(u => u.role === key).length;
                    return (
                        <Card key={key} className="px-4 py-3 flex items-center gap-3">
                            <div className="p-2 rounded-lg" style={{ backgroundColor: `${cfg.color}15` }}>
                                <Icon size={18} style={{ color: cfg.color }} />
                            </div>
                            <div>
                                <p className="text-xs text-[var(--color-text-muted)]">{cfg.label}s</p>
                                <p className="text-lg font-bold font-mono text-[var(--color-text-primary)]">{count}</p>
                            </div>
                        </Card>
                    );
                })}
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                <input placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" />
            </div>

            {/* Users Table */}
            {loading ? (
                <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-16" />)}</div>
            ) : filtered.length === 0 ? (
                <EmptyState title="No users found" description={search ? 'Try a different search' : 'Register the first user'} />
            ) : (
                <div className="overflow-x-auto rounded-2xl border border-[var(--color-border)]">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-[var(--color-bg-secondary)]">
                                <th className="text-left py-3 px-4 font-medium text-[var(--color-text-secondary)]">User</th>
                                <th className="text-left py-3 px-4 font-medium text-[var(--color-text-secondary)]">Email</th>
                                <th className="text-left py-3 px-4 font-medium text-[var(--color-text-secondary)]">Role</th>
                                <th className="text-right py-3 px-4 font-medium text-[var(--color-text-secondary)]">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence>
                                {filtered.map((user, i) => {
                                    const isSelf = user._id === currentUser?._id;
                                    const roleCfg = ROLE_CONFIG[user.role] || ROLE_CONFIG.user;
                                    const RoleIcon = roleCfg.icon;
                                    return (
                                        <motion.tr
                                            key={user._id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: i * 0.03 }}
                                            className="border-t border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)] transition-colors"
                                        >
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                                                        style={{ backgroundColor: roleCfg.color }}>
                                                        {user.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <span className="font-medium text-[var(--color-text-primary)]">{user.name}</span>
                                                        {isSelf && <span className="ml-2 text-xs text-[var(--color-primary)]">(You)</span>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-[var(--color-text-muted)]">{user.email}</td>
                                            <td className="py-3 px-4">
                                                {isSelf ? (
                                                    <Badge color={roleCfg.color}>
                                                        <RoleIcon size={12} className="mr-1" /> {roleCfg.label}
                                                    </Badge>
                                                ) : (
                                                    <select
                                                        value={user.role}
                                                        onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                                        className="px-3 py-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] cursor-pointer"
                                                    >
                                                        <option value="user">User</option>
                                                        <option value="admin">Admin</option>
                                                        <option value="engineer">Engineer</option>
                                                    </select>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                {!isSelf && (
                                                    <button
                                                        onClick={() => setDeleteTarget(user)}
                                                        className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 text-red-400 hover:text-red-500 transition-colors"
                                                        title="Delete user"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            )}

            {/* Register Modal */}
            <Modal isOpen={showRegister} onClose={() => setShowRegister(false)} title="Register New User" size="md">
                <RegisterForm onSubmit={handleRegister} loading={registering} onClose={() => setShowRegister(false)} />
            </Modal>

            {/* Delete Confirm */}
            <ConfirmDialog
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                title="Delete User"
                message={`Are you sure you want to delete "${deleteTarget?.name}" (${deleteTarget?.email})? This cannot be undone.`}
                confirmText="Delete"
                danger
            />
        </div>
    );
};

export default UserManagementPage;
