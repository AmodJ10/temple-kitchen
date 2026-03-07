import { useState, useEffect, useMemo } from 'react';
import { Users, UserPlus, CheckCircle, Clock, Trash2, Search, Filter, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { attendanceAPI, sevekariAPI } from '../../api/endpoints';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import EmptyState from '../ui/EmptyState';
import Skeleton from '../ui/Skeleton';
import Modal from '../ui/Modal';
import ConfirmDialog from '../ui/ConfirmDialog';
import { formatTime } from '../../utils/formatters';

const ROLES = ['Cooking', 'Serving', 'Cleaning', 'Decor', 'Coordination', 'Other'];

const AttendanceTab = ({ event, selectedDayId }) => {
    const [attendees, setAttendees] = useState([]);
    const [allSevekaris, setAllSevekaris] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Add Sevekari State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSevekaris, setSelectedSevekaris] = useState(new Set());

    // Edit Role State
    const [editingRole, setEditingRole] = useState(null); // stores attendance record ID
    const [roleInput, setRoleInput] = useState('');

    // Delete State
    const [deletingRecord, setDeletingRecord] = useState(null);

    const fetchData = async () => {
        if (!selectedDayId) return;
        setLoading(true);
        try {
            const [attRes, sevRes] = await Promise.all([
                attendanceAPI.getByEventDay(selectedDayId),
                sevekariAPI.getAll()
            ]);
            setAttendees(attRes.data.data || []);
            setAllSevekaris(sevRes.data.data || []);
        } catch (error) {
            toast.error('Failed to load attendance data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        setSelectedSevekaris(new Set());
        setSearchQuery('');
    }, [selectedDayId]);

    const handleBulkAdd = async () => {
        if (selectedSevekaris.size === 0) return;
        setSubmitting(true);
        try {
            const sevekariIds = Array.from(selectedSevekaris).map(id => {
                const s = allSevekaris.find(sev => sev._id === id);
                return { id: s._id, name: s.name };
            });

            await attendanceAPI.bulkCreate({
                eventId: event._id,
                eventDayId: selectedDayId,
                sevekariIds
            });

            toast.success('Sevekaris added to attendance sheet');
            setIsAddModalOpen(false);
            setSelectedSevekaris(new Set());
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add sevekaris');
        } finally {
            setSubmitting(false);
        }
    };

    const handleTimeMark = async (record, type) => {
        try {
            const now = new Date().toISOString();
            const updates = {};
            if (type === 'in') updates.checkInTime = now;
            if (type === 'out') updates.checkOutTime = now;

            // Optimistic update
            setAttendees(prev => prev.map(a => a._id === record._id ? { ...a, ...updates } : a));

            await attendanceAPI.update(record._id, updates);
            toast.success(`Check-${type} marked`);
            fetchData(); // sync
        } catch (error) {
            toast.error(`Failed to mark check-${type}`);
            fetchData(); // revert optimistic
        }
    };

    const handleSaveRole = async (record) => {
        try {
            await attendanceAPI.update(record._id, { role: roleInput });
            toast.success('Role updated');
            setEditingRole(null);
            fetchData();
        } catch (error) {
            toast.error('Failed to update role');
        }
    };

    const handleDelete = async () => {
        if (!deletingRecord) return;
        setSubmitting(true);
        try {
            await attendanceAPI.remove(deletingRecord._id);
            toast.success('Removed from attendance');
            setDeletingRecord(null);
            fetchData();
        } catch (error) {
            toast.error('Failed to remove record');
        } finally {
            setSubmitting(false);
        }
    };

    const toggleSevekariSelection = (id) => {
        setSelectedSevekaris(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) newSet.delete(id);
            else newSet.add(id);
            return newSet;
        });
    };

    const availableSevekaris = useMemo(() => {
        const attendeeIds = new Set(attendees.map(a => a.sevekariId?._id || a.sevekariId));
        return allSevekaris.filter(s =>
            !attendeeIds.has(s._id) &&
            (s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (s.phone && s.phone.includes(searchQuery)))
        );
    }, [allSevekaris, attendees, searchQuery]);

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
                    <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Attendance Sheet</h3>
                    <p className="text-sm text-[var(--color-text-muted)] mt-1">
                        Total present: {attendees.filter(a => a.checkInTime).length} / {attendees.length} assigned
                    </p>
                </div>
                <Button onClick={() => setIsAddModalOpen(true)}>
                    <UserPlus size={16} /> Assign Sevekaris
                </Button>
            </div>

            <Button onClick={() => setIsAddModalOpen(true)} className="w-full sm:hidden">
                <UserPlus size={16} /> Assign Sevekaris
            </Button>

            {loading ? (
                <div className="space-y-3">
                    <Skeleton className="h-16 w-full rounded-xl" />
                    <Skeleton className="h-16 w-full rounded-xl" />
                    <Skeleton className="h-16 w-full rounded-xl" />
                </div>
            ) : attendees.length === 0 ? (
                <EmptyState
                    icon={Users}
                    title="No sevekaris assigned"
                    description="Assign sevekaris to this event day to track their attendance and roles."
                    action={
                        <Button onClick={() => setIsAddModalOpen(true)}>
                            <UserPlus size={16} /> Assign Sevekaris
                        </Button>
                    }
                />
            ) : (
                <Card className="overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-xs uppercase tracking-wider text-[var(--color-text-muted)]">
                                    <th className="px-4 py-3 font-medium">Sevekari</th>
                                    <th className="px-4 py-3 font-medium">Role</th>
                                    <th className="px-4 py-3 font-medium text-center">Check In</th>
                                    <th className="px-4 py-3 font-medium text-center">Check Out</th>
                                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--color-border)]">
                                {attendees.map((record) => (
                                    <tr key={record._id} className="hover:bg-[var(--color-bg-secondary)]/50 transition-colors">
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-[var(--color-text-primary)]">{record.sevekariName}</p>
                                        </td>
                                        <td className="px-4 py-3">
                                            {editingRole === record._id ? (
                                                <div className="flex items-center gap-2">
                                                    <select
                                                        className="px-2 py-1 text-sm rounded bg-[var(--color-bg-card)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)] w-32"
                                                        value={roleInput}
                                                        onChange={(e) => setRoleInput(e.target.value)}
                                                        autoFocus
                                                    >
                                                        <option value="">Select Role</option>
                                                        {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                                                    </select>
                                                    <button onClick={() => handleSaveRole(record)} className="text-green-500 hover:text-green-600">
                                                        <CheckCircle size={16} />
                                                    </button>
                                                    <button onClick={() => setEditingRole(null)} className="text-[var(--color-text-muted)] hover:text-red-500">
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div
                                                    className="flex items-center gap-2 cursor-pointer group"
                                                    onClick={() => { setEditingRole(record._id); setRoleInput(record.role || ''); }}
                                                >
                                                    {record.role ? (
                                                        <Badge color="rgba(155, 89, 182, 0.2)" className="text-purple-400 border border-purple-500/20">{record.role}</Badge>
                                                    ) : (
                                                        <span className="text-sm text-[var(--color-text-muted)] italic">No role</span>
                                                    )}
                                                    <span className="opacity-0 group-hover:opacity-100 text-[var(--color-text-muted)] text-xs">Edit</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {record.checkInTime ? (
                                                <div className="inline-flex items-center gap-1.5 text-sm font-medium text-green-500 dark:text-green-400 bg-green-50 dark:bg-green-500/10 px-2.5 py-1 rounded-md">
                                                    <Clock size={14} />
                                                    {formatTime(record.checkInTime)}
                                                </div>
                                            ) : (
                                                <Button size="sm" variant="outline" onClick={() => handleTimeMark(record, 'in')}>
                                                    Mark In
                                                </Button>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {!record.checkInTime ? (
                                                <span className="text-sm text-[var(--color-text-muted)]">-</span>
                                            ) : record.checkOutTime ? (
                                                <div className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-2.5 py-1 rounded-md">
                                                    <Clock size={14} />
                                                    {formatTime(record.checkOutTime)}
                                                </div>
                                            ) : (
                                                <Button size="sm" variant="outline" onClick={() => handleTimeMark(record, 'out')}>
                                                    Mark Out
                                                </Button>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button
                                                onClick={() => setDeletingRecord(record)}
                                                className="p-1.5 text-[var(--color-text-muted)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

            {/* Bulk Add Modal */}
            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Assign Sevekaris" size="md">
                <div className="space-y-4">
                    <Input

                        icon={Search}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />

                    <div className="max-h-60 overflow-y-auto border border-[var(--color-border)] rounded-xl divide-y divide-[var(--color-border)]">
                        {availableSevekaris.length === 0 ? (
                            <p className="p-4 text-center text-sm text-[var(--color-text-muted)]">No sevekaris found.</p>
                        ) : (
                            availableSevekaris.map(sev => (
                                <label key={sev._id} className="flex items-center gap-3 p-3 hover:bg-[var(--color-bg-secondary)] cursor-pointer transition-colors">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                                        checked={selectedSevekaris.has(sev._id)}
                                        onChange={() => toggleSevekariSelection(sev._id)}
                                    />
                                    <div>
                                        <p className="text-sm font-medium text-[var(--color-text-primary)]">{sev.name}</p>
                                        {sev.phone && <p className="text-xs text-[var(--color-text-muted)]">{sev.phone}</p>}
                                    </div>
                                </label>
                            ))
                        )}
                    </div>

                    <div className="flex justify-between items-center pt-2">
                        <span className="text-sm font-medium text-[var(--color-text-secondary)]">
                            {selectedSevekaris.size} selected
                        </span>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setIsAddModalOpen(false)} disabled={submitting}>Cancel</Button>
                            <Button onClick={handleBulkAdd} loading={submitting} disabled={selectedSevekaris.size === 0}>
                                Assign Selected
                            </Button>
                        </div>
                    </div>
                </div>
            </Modal>

            <ConfirmDialog
                isOpen={!!deletingRecord}
                onClose={() => setDeletingRecord(null)}
                onConfirm={handleDelete}
                title="Remove from Attendance"
                message={`Are you sure you want to remove "${deletingRecord?.sevekariName}" from this day's attendance sheet?`}
                confirmText="Remove"
                danger
                loading={submitting}
            />
        </div>
    );
};

export default AttendanceTab;
