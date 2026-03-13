import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowLeft, Utensils, ShoppingBag, Users, Package,
    MessageSquare, ClipboardList, FileText, BarChart3, CheckCircle2,
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

const DishesTab = lazy(() => import('../components/events/DishesTab'));
const ProcurementTab = lazy(() => import('../components/events/ProcurementTab'));
const AttendanceTab = lazy(() => import('../components/events/AttendanceTab'));
const InventoryUsedTab = lazy(() => import('../components/events/InventoryUsedTab'));
const MeetingsTab = lazy(() => import('../components/events/MeetingsTab'));
const TasksTab = lazy(() => import('../components/events/TasksTab'));
const ReportTab = lazy(() => import('../components/events/ReportTab'));

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

const executionTabs = tabs.filter((tab) => tab.id !== 'overview');

const TabLoader = () => (
    <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
    </div>
);

const EventDetailPage = () => {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [event, setEvent] = useState(null);
    const [eventDays, setEventDays] = useState([]);
    const validTabIds = useMemo(() => new Set(tabs.map((tab) => tab.id)), []);
    const requestedTab = searchParams.get('tab');
    const requestedDayId = searchParams.get('day');
    const activeTab = validTabIds.has(requestedTab) ? requestedTab : 'overview';
    const [selectedDayId, setSelectedDayId] = useState(null);
    const [loadedTabs, setLoadedTabs] = useState(() => new Set([activeTab]));

    // Socket.io: join event room, listen for real-time updates, leave on unmount
    useEventSocket(eventId);

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await eventAPI.getById(eventId);
                const nextEvent = res.data.data.event;
                const nextEventDays = res.data.data.eventDays || [];

                setEvent(nextEvent);
                setEventDays(nextEventDays);
                document.title = `${nextEvent.name} — MSM Kitchen`;
            } catch (err) {
                toast.error('Failed to load event');
                navigate('/events');
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [eventId, navigate]);

    useEffect(() => {
        if (eventDays.length === 0) {
            setSelectedDayId(null);
            return;
        }

        const hasRequestedDay = requestedDayId && eventDays.some((day) => day._id === requestedDayId);
        const nextSelectedDayId = hasRequestedDay ? requestedDayId : eventDays[0]._id;

        setSelectedDayId((currentSelectedDayId) => (
            currentSelectedDayId === nextSelectedDayId ? currentSelectedDayId : nextSelectedDayId
        ));
    }, [eventDays, requestedDayId]);

    const updateEventSearchParams = (nextTab, nextDayId) => {
        const nextParams = new URLSearchParams(searchParams);

        if (nextTab === 'overview') {
            nextParams.delete('tab');
        } else {
            nextParams.set('tab', nextTab);
        }

        if (nextDayId) {
            nextParams.set('day', nextDayId);
        } else {
            nextParams.delete('day');
        }

        const currentSerialized = searchParams.toString();
        const nextSerialized = nextParams.toString();

        if (currentSerialized !== nextSerialized) {
            setSearchParams(nextParams, { replace: true });
        }
    };

    useEffect(() => {
        updateEventSearchParams(activeTab, selectedDayId);
    }, [activeTab, searchParams, selectedDayId, setSearchParams]);

    useEffect(() => {
        setLoadedTabs((currentLoadedTabs) => {
            if (currentLoadedTabs.has(activeTab)) {
                return currentLoadedTabs;
            }

            const nextLoadedTabs = new Set(currentLoadedTabs);
            nextLoadedTabs.add(activeTab);
            return nextLoadedTabs;
        });
    }, [activeTab]);

    const handleTabChange = (tabId) => {
        updateEventSearchParams(tabId, selectedDayId);
    };

    const handleDayChange = (dayId) => {
        setSelectedDayId(dayId);
        updateEventSearchParams(activeTab, dayId);
    };

    const showTabPanel = (tabId) => loadedTabs.has(tabId) || activeTab === tabId;

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
    const activeExecutionIndex = executionTabs.findIndex((tab) => tab.id === activeTab);
    const executionProgress = activeExecutionIndex >= 0
        ? Math.round(((activeExecutionIndex + 1) / executionTabs.length) * 100)
        : 0;

    return (
        <div className="page-container space-y-6">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <button onClick={() => navigate('/events')} className="flex items-center gap-1 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] mb-3 transition-colors">
                    <ArrowLeft size={16} /> Back to events
                </button>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-[var(--color-text-primary)]">{event.name}</h1>
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

            {/* Sticky execution context */}
            <div className="sticky sticky-content-offset z-10 -mx-1 px-1">
                <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)]/95 backdrop-blur-sm shadow-sm p-3 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                        <p className="text-xs uppercase tracking-[0.12em] text-[var(--color-text-muted)]">Execution Flow</p>
                        {activeExecutionIndex >= 0 ? (
                            <span className="text-xs font-medium text-[var(--color-text-secondary)]">
                                Stage {activeExecutionIndex + 1} of {executionTabs.length} • {executionProgress}%
                            </span>
                        ) : (
                            <span className="text-xs font-medium text-[var(--color-text-secondary)]">Overview</span>
                        )}
                    </div>
                    {activeExecutionIndex >= 0 && (
                        <div className="h-1.5 rounded-full bg-[var(--color-bg-secondary)] overflow-hidden">
                            <div className="h-full rounded-full bg-[var(--color-primary)] transition-all duration-300" style={{ width: `${executionProgress}%` }} />
                        </div>
                    )}

                    {eventDays.length > 1 && (
                        <div className="flex gap-2 overflow-x-auto pb-1">
                            {eventDays.map((day) => (
                                <button
                                    key={day._id}
                                    onClick={() => handleDayChange(day._id)}
                                    className={`
                                        px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200
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
                    <div className="relative">
                        <div className="flex gap-1 overflow-x-auto pb-1 border-b border-[var(--color-border)] [&::-webkit-scrollbar]:hidden">
                    {tabs.map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            onClick={() => handleTabChange(id)}
                            className={`
                  flex items-center gap-2 px-3 py-2.5 text-sm font-medium rounded-t-xl whitespace-nowrap transition-all duration-200
                  ${activeTab === id
                                    ? 'bg-[var(--color-bg-card)] text-[var(--color-primary)] border border-[var(--color-border)] border-b-transparent -mb-px'
                                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)]'
                                }
                `}
                        >
                            <Icon size={16} />
                            <span>{label}</span>
                            {id === activeTab && id !== 'overview' ? <CheckCircle2 size={14} /> : null}
                        </button>
                    ))}
                        </div>
                        <div className="pointer-events-none absolute right-0 top-0 bottom-1 w-12 bg-gradient-to-l from-[var(--color-bg-card)] to-transparent" />
                    </div>
                </div>
            </div>

            {/* Tab Content */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
                {showTabPanel('overview') && (
                    <Card className={`p-6 ${activeTab === 'overview' ? 'block' : 'hidden'}`}>
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

                {showTabPanel('dishes') && (
                    <div className={activeTab === 'dishes' ? 'block' : 'hidden'}>
                        <Suspense fallback={<TabLoader />}>
                            <DishesTab event={event} selectedDayId={selectedDayId} />
                        </Suspense>
                    </div>
                )}

                {showTabPanel('procurement') && (
                    <div className={activeTab === 'procurement' ? 'block' : 'hidden'}>
                        <Suspense fallback={<TabLoader />}>
                            <ProcurementTab event={event} selectedDayId={selectedDayId} />
                        </Suspense>
                    </div>
                )}

                {showTabPanel('attendance') && (
                    <div className={activeTab === 'attendance' ? 'block' : 'hidden'}>
                        <Suspense fallback={<TabLoader />}>
                            <AttendanceTab event={event} selectedDayId={selectedDayId} />
                        </Suspense>
                    </div>
                )}

                {showTabPanel('inventory') && (
                    <div className={activeTab === 'inventory' ? 'block' : 'hidden'}>
                        <Suspense fallback={<TabLoader />}>
                            <InventoryUsedTab event={event} selectedDayId={selectedDayId} />
                        </Suspense>
                    </div>
                )}

                {showTabPanel('meetings') && (
                    <div className={activeTab === 'meetings' ? 'block' : 'hidden'}>
                        <Suspense fallback={<TabLoader />}>
                            <MeetingsTab event={event} selectedDayId={selectedDayId} />
                        </Suspense>
                    </div>
                )}

                {showTabPanel('tasks') && (
                    <div className={activeTab === 'tasks' ? 'block' : 'hidden'}>
                        <Suspense fallback={<TabLoader />}>
                            <TasksTab event={event} selectedDayId={selectedDayId} />
                        </Suspense>
                    </div>
                )}

                {showTabPanel('report') && (
                    <div className={activeTab === 'report' ? 'block' : 'hidden'}>
                        <Suspense fallback={<TabLoader />}>
                            <ReportTab event={event} />
                        </Suspense>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default EventDetailPage;
