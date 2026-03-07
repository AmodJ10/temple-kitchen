import { useState, useEffect } from 'react';
import { MessageSquare, Plus, Edit2, Trash2, Users, Calendar, CheckSquare, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { meetingAPI, sevekariAPI } from '../../api/endpoints';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Card from '../ui/Card';
import Modal from '../ui/Modal';
import Badge from '../ui/Badge';
import EmptyState from '../ui/EmptyState';
import ConfirmDialog from '../ui/ConfirmDialog';
import Skeleton from '../ui/Skeleton';
import { formatDate } from '../../utils/formatters';

const MEETING_TYPES = [
    { value: 'pre-event', label: 'Pre-Event Planning' },
    { value: 'post-event', label: 'Post-Event Review' },
    { value: 'standalone', label: 'Standalone Meeting' }
];

const PRIORITIES = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' }
];

const MeetingForm = ({ event, initial, onSubmit, onCancel, loading }) => {
    const [sevekaris, setSevekaris] = useState([]);
    const [form, setForm] = useState(initial || {
        meetingType: 'pre-event', title: '', date: new Date().toISOString().slice(0, 16),
        attendees: [], agenda: '', discussions: '', decisions: '', actionables: []
    });

    useEffect(() => {
        sevekariAPI.getAll().then(res => setSevekaris(res.data.data)).catch(() => { });
    }, []);

    const handleChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleAttendeeToggle = (id) => {
        setForm(prev => {
            const newAttendees = prev.attendees.includes(id)
                ? prev.attendees.filter(a => a !== id)
                : [...prev.attendees, id];
            return { ...prev, attendees: newAttendees };
        });
    };

    const handleAddActionable = () => {
        setForm(prev => ({
            ...prev,
            actionables: [...prev.actionables, { title: '', description: '', howTo: '', assignedTo: '', dueDate: '', priority: 'medium' }]
        }));
    };

    const handleRemoveActionable = (index) => {
        setForm(prev => ({
            ...prev,
            actionables: prev.actionables.filter((_, i) => i !== index)
        }));
    };

    const handleActionableChange = (index, field, value) => {
        setForm(prev => {
            const newActionables = [...prev.actionables];
            newActionables[index][field] = value;
            return { ...prev, actionables: newActionables };
        });
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        onSubmit({
            ...form,
            eventId: event._id,
        });
    };

    return (
        <form onSubmit={handleFormSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                    label="Meeting Title"
                    value={form.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    required
                />
                <Select
                    label="Meeting Type"
                    value={form.meetingType}
                    onChange={(e) => handleChange('meetingType', e.target.value)}
                    options={MEETING_TYPES}
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                    label="Date & Time"
                    type="datetime-local"
                    value={form.date.slice(0, 16)}
                    onChange={(e) => handleChange('date', new Date(e.target.value).toISOString())}
                    required
                />
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">Attendees (Sevekaris)</label>
                    <div className="max-h-40 overflow-y-auto border border-[var(--color-border)] rounded-xl p-2 bg-[var(--color-bg-card)] flex flex-col gap-1">
                        {sevekaris.map(sev => (
                            <label key={sev._id} className="flex items-center gap-2 p-1.5 hover:bg-[var(--color-bg-secondary)] rounded cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={form.attendees.includes(sev._id)}
                                    onChange={() => handleAttendeeToggle(sev._id)}
                                    className="rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                                />
                                <span className="text-sm text-[var(--color-text-primary)]">{sev.name}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">Agenda / Notes</label>
                    <textarea
                        value={form.agenda}
                        onChange={(e) => handleChange('agenda', e.target.value)}
                        rows={3}
                        className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] resize-none"
                    />
                </div>
            </div>

            <div className="bg-[var(--color-bg-secondary)] p-4 rounded-xl space-y-4 border border-[var(--color-border)]">
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="font-medium text-[var(--color-text-primary)]">Actionables (Tasks)</h4>
                        <p className="text-xs text-[var(--color-text-muted)]">These will be automatically created in the Tasks Board.</p>
                    </div>
                    <Button type="button" size="sm" variant="outline" onClick={handleAddActionable}>
                        <Plus size={14} /> Add Task
                    </Button>
                </div>

                {form.actionables.length === 0 ? (
                    <p className="text-sm text-[var(--color-text-muted)] italic">No tasks assigned from this meeting.</p>
                ) : (
                    <div className="space-y-4">
                        {form.actionables.map((act, idx) => (
                            <div key={idx} className="bg-[var(--color-bg-card)] p-3 rounded-lg border border-[var(--color-border)] relative">
                                <button
                                    type="button"
                                    onClick={() => handleRemoveActionable(idx)}
                                    className="absolute top-2 right-2 p-1 text-[var(--color-text-muted)] hover:text-red-500 rounded-md"
                                >
                                    <X size={16} />
                                </button>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3 pr-6">
                                    <Input
                                       
                                        value={act.title}
                                        onChange={(e) => handleActionableChange(idx, 'title', e.target.value)}
                                        required
                                    />
                                    <Select
                                        value={act.assignedTo}
                                        onChange={(e) => handleActionableChange(idx, 'assignedTo', e.target.value)}
                                        options={[{ value: '', label: 'Unassigned' }, ...sevekaris.map(s => ({ value: s._id, label: s.name }))]}
                                    />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <Input
                                        type="date"
                                        value={act.dueDate ? act.dueDate.split('T')[0] : ''}
                                        onChange={(e) => handleActionableChange(idx, 'dueDate', e.target.value ? new Date(e.target.value).toISOString() : '')}
                                    />
                                    <Select
                                        value={act.priority}
                                        onChange={(e) => handleActionableChange(idx, 'priority', e.target.value)}
                                        options={PRIORITIES}
                                    />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                                    <textarea
                                       
                                        value={act.description || ''}
                                        onChange={(e) => handleActionableChange(idx, 'description', e.target.value)}
                                        rows={2}
                                        className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] resize-none"
                                    />
                                    <textarea
                                       
                                        value={act.howTo || ''}
                                        onChange={(e) => handleActionableChange(idx, 'howTo', e.target.value)}
                                        rows={2}
                                        className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] resize-none"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
                    Cancel
                </Button>
                <Button type="submit" loading={loading} disabled={form.actionables.some(a => !a.title)}>
                    {initial ? 'Update Meeting' : 'Save Meeting'}
                </Button>
            </div>
        </form>
    );
};

const MeetingsTab = ({ event }) => {
    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingMeeting, setEditingMeeting] = useState(null);
    const [deletingMeeting, setDeletingMeeting] = useState(null);

    const fetchMeetings = async () => {
        setLoading(true);
        try {
            const res = await meetingAPI.getByEvent(event._id);
            setMeetings(res.data.data || []);
        } catch (error) {
            toast.error('Failed to load meetings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (event?._id) fetchMeetings();
    }, [event?._id]);

    const handleSubmit = async (formData) => {
        setSubmitting(true);
        try {
            if (editingMeeting) {
                await meetingAPI.update(editingMeeting._id, formData);
                toast.success('Meeting updated');
            } else {
                await meetingAPI.create(formData);
                toast.success('Meeting logged and tasks created');
            }
            setIsFormOpen(false);
            setEditingMeeting(null);
            fetchMeetings();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to log meeting');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!deletingMeeting) return;
        setSubmitting(true);
        try {
            await meetingAPI.remove(deletingMeeting._id);
            toast.success('Meeting deleted');
            setDeletingMeeting(null);
            fetchMeetings();
        } catch (error) {
            toast.error('Failed to delete meeting');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center hidden sm:flex">
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Meetings & Minutes</h3>
                <Button onClick={() => { setEditingMeeting(null); setIsFormOpen(true); }}>
                    <Plus size={16} /> Log Meeting
                </Button>
            </div>

            <Button onClick={() => { setEditingMeeting(null); setIsFormOpen(true); }} className="w-full sm:hidden">
                <Plus size={16} /> Log Meeting
            </Button>

            {loading ? (
                <div className="space-y-3">
                    <Skeleton className="h-40 w-full rounded-xl" />
                    <Skeleton className="h-40 w-full rounded-xl" />
                </div>
            ) : meetings.length === 0 ? (
                <EmptyState
                    icon={MessageSquare}
                    title="No meetings logged"
                    description="Record planning meetings and action items for this event."
                    action={
                        <Button onClick={() => { setEditingMeeting(null); setIsFormOpen(true); }}>
                            <Plus size={16} /> Log Meeting
                        </Button>
                    }
                />
            ) : (
                <div className="space-y-4">
                    {meetings.map((meeting) => (
                        <Card key={meeting._id} className="p-5">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-semibold text-lg text-[var(--color-text-primary)]">{meeting.title}</h4>
                                        <Badge color="var(--color-primary)">{MEETING_TYPES.find(t => t.value === meeting.meetingType)?.label}</Badge>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-[var(--color-text-muted)]">
                                        <span className="flex items-center gap-1.5"><Calendar size={14} /> {formatDate(meeting.date)}</span>
                                        <span className="flex items-center gap-1.5"><Users size={14} /> {meeting.attendees.length} Attendees</span>
                                        {meeting.actionables.length > 0 && (
                                            <span className="flex items-center gap-1.5 text-[var(--color-primary)]"><CheckSquare size={14} /> {meeting.actionables.length} Action Items</span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            setEditingMeeting({
                                                ...meeting,
                                                attendees: meeting.attendees.map(a => a._id || a),
                                                actionables: meeting.actionables.map(a => ({
                                                    ...a,
                                                    assignedTo: a.assignedTo?._id || a.assignedTo || ''
                                                }))
                                            });
                                            setIsFormOpen(true);
                                        }}
                                        className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-bg-secondary)] rounded-lg transition-colors"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => setDeletingMeeting(meeting)}
                                        className="p-1.5 text-[var(--color-text-muted)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            {meeting.agenda && (
                                <div className="mb-4">
                                    <p className="text-sm font-medium text-[var(--color-text-secondary)] mb-1">Agenda / Notes</p>
                                    <p className="text-sm text-[var(--color-text-primary)] bg-[var(--color-bg-secondary)] p-3 rounded-lg">{meeting.agenda}</p>
                                </div>
                            )}

                            {meeting.attendees.length > 0 && (
                                <div className="mb-4">
                                    <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Attendees</p>
                                    <div className="flex flex-wrap gap-2">
                                        {meeting.attendees.map(a => (
                                            <Badge key={a._id} variant="outline">{a.name}</Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {meeting.actionables.length > 0 && (
                                <div>
                                    <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Generated Action Items</p>
                                    <div className="space-y-2">
                                        {meeting.actionables.map((act, i) => (
                                            <div key={i} className="flex flex-wrap sm:flex-nowrap justify-between items-center gap-2 text-sm bg-[var(--color-bg-card)] border border-[var(--color-border)] p-2 rounded-lg">
                                                <div className="flex items-center gap-2">
                                                    <CheckSquare size={14} className="text-[var(--color-text-muted)]" />
                                                    <span className="font-medium text-[var(--color-text-primary)]">{act.title}</span>
                                                </div>
                                                <div className="flex items-center gap-3 text-xs text-[var(--color-text-muted)]">
                                                    <span>{act.assignedTo?.name || 'Unassigned'}</span>
                                                    <span>{act.priority.toUpperCase()}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </Card>
                    ))}
                </div>
            )}

            <Modal
                isOpen={isFormOpen}
                onClose={() => !submitting && setIsFormOpen(false)}
                title={editingMeeting ? "Edit Meeting Details" : "Log New Meeting"}
                size="lg"
            >
                <MeetingForm
                    event={event}
                    initial={editingMeeting}
                    onSubmit={handleSubmit}
                    onCancel={() => setIsFormOpen(false)}
                    loading={submitting}
                />
            </Modal>

            <ConfirmDialog
                isOpen={!!deletingMeeting}
                onClose={() => setDeletingMeeting(null)}
                onConfirm={handleDelete}
                title="Delete Meeting"
                message={`Are you sure you want to delete "${deletingMeeting?.title}"? This will NOT delete the tasks generated from it.`}
                confirmText="Delete"
                danger
                loading={submitting}
            />
        </div>
    );
};

export default MeetingsTab;
