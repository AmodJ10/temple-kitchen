import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowLeft, Utensils, ShoppingBag, Users, Package,
    MessageSquare, ClipboardList, FileText, BarChart3,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { eventAPI } from '../api/endpoints';
import { formatDate } from '../utils/formatters';
import { EVENT_TYPES, EVENT_STATUSES } from '../utils/constants';
import useEventSocket from '../hooks/useEventSocket';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Card from '../components/ui/Card';
import Skeleton from '../components/ui/Skeleton';
import DishesTab from '../components/events/DishesTab';
import ProcurementTab from '../components/events/ProcurementTab';
import AttendanceTab from '../components/events/AttendanceTab';
import InventoryUsedTab from '../components/events/InventoryUsedTab';
import MeetingsTab from '../components/events/MeetingsTab';
import TasksTab from '../components/events/TasksTab';
import ReportTab from '../components/events/ReportTab';

const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'dishes', label: 'Dishes', icon: Utensils },
    { id: 'procurement', label: 'Procurement', icon: ShoppingBag },
    { id: 'attendance', label: 'Attendance', icon: Users },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'meetings', label: 'Meetings', icon: MessageSquare },
    { id: 'tasks', label: 'Tasks', icon: ClipboardList },
    { id: 'report', label: 'Report', icon: FileText },
];

const EventDetailPage = () => {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [event, setEvent] = useState(null);
    const [eventDays, setEventDays] = useState([]);
    const [activeTab, setActiveTab] = useState('overview');
    const [selectedDayId, setSelectedDayId] = useState(null);

    // Socket.io: join event room, listen for real-time updates, leave on unmount
    useEventSocket(eventId);

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await eventAPI.getById(eventId);
                setEvent(res.data.data.event);
                setEventDays(res.data.data.eventDays || []);
                if (res.data.data.eventDays?.length > 0) {
                    setSelectedDayId(res.data.data.eventDays[0]._id);
                }
            } catch (err) {
                toast.error('Failed to load event');
                navigate('/events');
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [eventId]);

    if (loading) {
        return (
            <div className="page-container space-y-4">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-96 w-full" />
            </div>
        );
    }

    if (!event) return null;

    const typeInfo = EVENT_TYPES.find((t) => t.value === event.type);
    const statusInfo = EVENT_STATUSES.find((s) => s.value === event.status);

    return (
        <div className="page-container space-y-6">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <button onClick={() => navigate('/events')} className="flex items-center gap-1 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] mb-3 transition-colors">
                    <ArrowLeft size={16} /> Back to events
                </button>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                        <h1 className="font-display text-2xl md:text-3xl font-bold text-[var(--color-text-primary)]">{event.name}</h1>
                        <div className="flex items-center gap-3 mt-2">
                            <Badge color={typeInfo?.color}>{typeInfo?.label}</Badge>
                            <Badge color={statusInfo?.color}>{statusInfo?.label}</Badge>
                            <span className="text-sm text-[var(--color-text-muted)]">
                                {formatDate(event.startDate)}{event.totalDays > 1 ? ` — ${formatDate(event.endDate)}` : ''}
                            </span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Day Selector (multi-day events) */}
            {eventDays.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {eventDays.map((day) => (
                        <button
                            key={day._id}
                            onClick={() => setSelectedDayId(day._id)}
                            className={`
                px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200
                ${selectedDayId === day._id
                                    ? 'bg-[var(--color-primary)] text-white shadow-sm'
                                    : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border)]'
                                }
              `}
                        >
                            Day {day.dayNumber} • {formatDate(day.date)}
                        </button>
                    ))}
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-1 overflow-x-auto pb-1 border-b border-[var(--color-border)]">
                {tabs.map(({ id, label, icon: Icon }) => (
                    <button
                        key={id}
                        onClick={() => setActiveTab(id)}
                        className={`
              flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-xl whitespace-nowrap transition-all duration-200
              ${activeTab === id
                                ? 'bg-[var(--color-bg-card)] text-[var(--color-primary)] border border-[var(--color-border)] border-b-transparent -mb-px'
                                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)]'
                            }
            `}
                    >
                        <Icon size={16} />
                        <span className="hidden sm:inline">{label}</span>
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
                {activeTab === 'overview' && (
                    <Card className="p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div>
                                <p className="text-sm text-[var(--color-text-muted)]">Event Name</p>
                                <p className="text-lg font-semibold text-[var(--color-text-primary)]">{event.name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-[var(--color-text-muted)]">Expected Headcount</p>
                                <p className="text-lg font-semibold text-[var(--color-text-primary)]">{event.expectedHeadcount}</p>
                            </div>
                            <div>
                                <p className="text-sm text-[var(--color-text-muted)]">Total Days</p>
                                <p className="text-lg font-semibold text-[var(--color-text-primary)]">{event.totalDays}</p>
                            </div>
                            {event.description && (
                                <div className="sm:col-span-2 lg:col-span-3">
                                    <p className="text-sm text-[var(--color-text-muted)] mb-1">Description</p>
                                    <p className="text-[var(--color-text-secondary)]">{event.description}</p>
                                </div>
                            )}
                        </div>
                    </Card>
                )}

                {activeTab === 'dishes' && (
                    <DishesTab event={event} selectedDayId={selectedDayId} />
                )}

                {activeTab === 'procurement' && (
                    <ProcurementTab event={event} selectedDayId={selectedDayId} />
                )}

                {activeTab === 'attendance' && (
                    <AttendanceTab event={event} selectedDayId={selectedDayId} />
                )}

                {activeTab === 'inventory' && (
                    <InventoryUsedTab event={event} selectedDayId={selectedDayId} />
                )}

                {activeTab === 'meetings' && (
                    <MeetingsTab event={event} selectedDayId={selectedDayId} />
                )}

                {activeTab === 'tasks' && (
                    <TasksTab event={event} selectedDayId={selectedDayId} />
                )}

                {activeTab === 'report' && (
                    <ReportTab event={event} />
                )}
            </motion.div>
        </div>
    );
};

export default EventDetailPage;
