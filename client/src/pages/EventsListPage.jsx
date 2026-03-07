import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Search, Calendar, Users as UsersIcon, LayoutGrid, List, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import { eventAPI } from '../api/endpoints';
import { formatDate, formatNumber } from '../utils/formatters';
import { EVENT_TYPES, EVENT_STATUSES } from '../utils/constants';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';

const EventForm = ({ onSubmit, loading, initial }) => {
    const [form, setForm] = useState(initial || {
        name: '', type: 'utsav', startDate: '', endDate: '', expectedHeadcount: 50, description: '',
    });

    useEffect(() => {
        if (initial) setForm(initial);
    }, [initial]);

    const handleChange = (field) => (e) => {
        let value = e.target.value;
        if (field === 'expectedHeadcount') {
            value = value === '' ? '' : Number(value);
        }
        setForm({ ...form, [field]: value });
    };

    return (
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
            <Input label="Event Name" value={form.name} onChange={handleChange('name')} required />
            <Select label="Event Type" value={form.type} onChange={handleChange('type')}
                options={EVENT_TYPES.map((t) => ({ value: t.value, label: t.label }))} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Start Date" type="date" value={form.startDate} onChange={handleChange('startDate')} required />
                <Input label="End Date" type="date" value={form.endDate} onChange={handleChange('endDate')} required />
            </div>
            <Input label="Expected Headcount" type="number" min={1} value={form.expectedHeadcount} onChange={handleChange('expectedHeadcount')} required />
            <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">Description</label>
                <textarea
                    value={form.description} onChange={handleChange('description')} rows={3}
                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] resize-none"
                   
                />
            </div>
            <div className="flex justify-end gap-3 pt-2">
                <Button type="submit" loading={loading}>
                    {initial ? 'Update Event' : 'Create Event'}
                </Button>
            </div>
        </form>
    );
};

const EventsListPage = () => {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [creating, setCreating] = useState(false);
    const [viewMode, setViewMode] = useState('cards');
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const params = {};
            if (search) params.search = search;
            if (typeFilter) params.type = typeFilter;
            if (statusFilter) params.status = statusFilter;
            const res = await eventAPI.getAll(params);
            setEvents(res.data.data || []);
        } catch (err) {
            toast.error('Failed to load events');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchEvents(); }, [search, typeFilter, statusFilter]);

    const handleCreate = async (form) => {
        setCreating(true);
        try {
            const res = await eventAPI.create(form);
            toast.success('Event created! 🎉');
            setShowCreate(false);
            navigate(`/events/${res.data.data.event._id}`);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create event');
        } finally {
            setCreating(false);
        }
    };

    return (
        <div className="page-container space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-[var(--color-text-primary)]">Events</h1>
                    <p className="text-[var(--color-text-muted)] text-sm mt-1">Manage all your temple events</p>
                </div>
                <Button onClick={() => setShowCreate(true)}>
                    <Plus size={18} /> New Event
                </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 items-center">
                <div className="relative flex-1 w-full">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                    <input
                       
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    />
                </div>
                <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
                    options={EVENT_TYPES.map((t) => ({ value: t.value, label: t.label }))} />
                <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                    options={EVENT_STATUSES.map((s) => ({ value: s.value, label: s.label }))} />
                <div className="flex gap-1 p-1 rounded-xl bg-[var(--color-bg-secondary)]">
                    <button onClick={() => setViewMode('cards')}
                        className={`p-2 rounded-lg transition-colors ${viewMode === 'cards' ? 'bg-[var(--color-bg-card)] shadow-sm text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'}`}>
                        <LayoutGrid size={18} />
                    </button>
                    <button onClick={() => setViewMode('table')}
                        className={`p-2 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-[var(--color-bg-card)] shadow-sm text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'}`}>
                        <List size={18} />
                    </button>
                </div>
            </div>

            {/* Events List */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => <Skeleton key={i} className="h-40" />)}
                </div>
            ) : events.length === 0 ? (
                <EmptyState
                    title="No events found"
                    description="Create your first event to get started"
                    icon={Calendar}
                    action={<Button onClick={() => setShowCreate(true)}><Plus size={16} /> Create Event</Button>}
                />
            ) : viewMode === 'cards' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {events.map((event, index) => {
                        const typeInfo = EVENT_TYPES.find((t) => t.value === event.type);
                        const statusInfo = EVENT_STATUSES.find((s) => s.value === event.status);
                        return (
                            <motion.div
                                key={event._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Card hoverable onClick={() => navigate(`/events/${event._id}`)} className="p-5">
                                    <div className="flex items-start justify-between mb-3">
                                        <Badge color={typeInfo?.color}>{typeInfo?.label}</Badge>
                                        <Badge color={statusInfo?.color}>{statusInfo?.label}</Badge>
                                    </div>
                                    <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2 truncate">{event.name}</h3>
                                    <div className="space-y-1.5 text-sm text-[var(--color-text-muted)]">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={14} />
                                            <span>{formatDate(event.startDate)}{event.totalDays > 1 ? ` — ${formatDate(event.endDate)}` : ''}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <UsersIcon size={14} />
                                            <span>{formatNumber(event.expectedHeadcount)} expected</span>
                                        </div>
                                    </div>
                                    {event.totalDays > 1 && (
                                        <div className="mt-3 text-xs bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] px-2 py-1 rounded-lg inline-block">
                                            {event.totalDays} days
                                        </div>
                                    )}
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>
            ) : (
                /* Table View */
                <div className="overflow-x-auto rounded-xl border border-[var(--color-border)]">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-[var(--color-bg-secondary)]">
                                <th className="text-left py-3 px-4 font-medium text-[var(--color-text-secondary)]">Name</th>
                                <th className="text-left py-3 px-4 font-medium text-[var(--color-text-secondary)]">Type</th>
                                <th className="text-left py-3 px-4 font-medium text-[var(--color-text-secondary)]">Date</th>
                                <th className="text-left py-3 px-4 font-medium text-[var(--color-text-secondary)]">Headcount</th>
                                <th className="text-left py-3 px-4 font-medium text-[var(--color-text-secondary)]">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {events.map((event) => {
                                const typeInfo = EVENT_TYPES.find((t) => t.value === event.type);
                                const statusInfo = EVENT_STATUSES.find((s) => s.value === event.status);
                                return (
                                    <tr key={event._id} onClick={() => navigate(`/events/${event._id}`)}
                                        className="border-t border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)] cursor-pointer transition-colors">
                                        <td className="py-3 px-4 font-medium text-[var(--color-text-primary)]">{event.name}</td>
                                        <td className="py-3 px-4"><Badge color={typeInfo?.color}>{typeInfo?.label}</Badge></td>
                                        <td className="py-3 px-4 text-[var(--color-text-muted)]">{formatDate(event.startDate)}</td>
                                        <td className="py-3 px-4 text-[var(--color-text-muted)] font-mono">{formatNumber(event.expectedHeadcount)}</td>
                                        <td className="py-3 px-4"><Badge color={statusInfo?.color}>{statusInfo?.label}</Badge></td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Create Event Modal */}
            <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create New Event" size="lg">
                <EventForm onSubmit={handleCreate} loading={creating} />
            </Modal>
        </div>
    );
};

export default EventsListPage;
