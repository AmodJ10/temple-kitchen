import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ResponsiveGridLayout } from 'react-grid-layout';
import {
    Calendar, Users, IndianRupee, ClipboardList,
    Plus, AlertTriangle, TrendingUp, ArrowRight,
    BarChart2, PieChart as PieChartIcon, Package,
    Lock, Unlock, RotateCcw, GripVertical,
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { dashboardAPI, taskAPI } from '../api/endpoints';
import { formatCurrency, formatDate, formatNumber, formatMonth, truncate } from '../utils/formatters';
import { EVENT_TYPES, PRIORITIES } from '../utils/constants';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';

import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

// ─── Storage key for persisting layout ──────────────────────────
const LAYOUT_STORAGE_KEY = 'temple-kitchen-dashboard-layouts-v2';

// ─── Default layouts per breakpoint ─────────────────────────────
const DEFAULT_LAYOUTS = {
    lg: [
        { i: 'metric-events', x: 0, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
        { i: 'metric-attendance', x: 3, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
        { i: 'metric-spend', x: 6, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
        { i: 'metric-tasks', x: 9, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
        { i: 'chart-monthly', x: 0, y: 2, w: 8, h: 6, minW: 4, minH: 4 },
        { i: 'chart-types', x: 8, y: 2, w: 4, h: 6, minW: 3, minH: 4 },
        { i: 'chart-inventory', x: 0, y: 8, w: 4, h: 6, minW: 3, minH: 4 },
        { i: 'upcoming-events', x: 4, y: 8, w: 4, h: 6, minW: 3, minH: 3 },
        { i: 'pending-tasks', x: 8, y: 8, w: 4, h: 6, minW: 3, minH: 3 },
        { i: 'low-stock', x: 0, y: 14, w: 6, h: 5, minW: 3, minH: 3 },
        { i: 'quick-actions', x: 6, y: 14, w: 6, h: 5, minW: 3, minH: 3 },
    ],
    md: [
        { i: 'metric-events', x: 0, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
        { i: 'metric-attendance', x: 3, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
        { i: 'metric-spend', x: 6, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
        { i: 'metric-tasks', x: 9, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
        { i: 'chart-monthly', x: 0, y: 2, w: 12, h: 6, minW: 6, minH: 4 },
        { i: 'chart-types', x: 0, y: 8, w: 6, h: 6, minW: 3, minH: 4 },
        { i: 'chart-inventory', x: 6, y: 8, w: 6, h: 6, minW: 3, minH: 4 },
        { i: 'upcoming-events', x: 0, y: 14, w: 6, h: 6, minW: 3, minH: 3 },
        { i: 'pending-tasks', x: 6, y: 14, w: 6, h: 6, minW: 3, minH: 3 },
        { i: 'low-stock', x: 0, y: 20, w: 6, h: 5, minW: 3, minH: 3 },
        { i: 'quick-actions', x: 6, y: 20, w: 6, h: 5, minW: 3, minH: 3 },
    ],
    sm: [
        { i: 'metric-events', x: 0, y: 0, w: 3, h: 2, minW: 3, minH: 2 },
        { i: 'metric-attendance', x: 3, y: 0, w: 3, h: 2, minW: 3, minH: 2 },
        { i: 'metric-spend', x: 0, y: 2, w: 3, h: 2, minW: 3, minH: 2 },
        { i: 'metric-tasks', x: 3, y: 2, w: 3, h: 2, minW: 3, minH: 2 },
        { i: 'chart-monthly', x: 0, y: 4, w: 6, h: 5, minW: 3, minH: 4 },
        { i: 'chart-types', x: 0, y: 9, w: 6, h: 5, minW: 3, minH: 4 },
        { i: 'chart-inventory', x: 0, y: 14, w: 6, h: 5, minW: 3, minH: 4 },
        { i: 'upcoming-events', x: 0, y: 19, w: 6, h: 5, minW: 3, minH: 3 },
        { i: 'pending-tasks', x: 0, y: 24, w: 6, h: 5, minW: 3, minH: 3 },
        { i: 'low-stock', x: 0, y: 29, w: 6, h: 5, minW: 3, minH: 3 },
        { i: 'quick-actions', x: 0, y: 34, w: 6, h: 5, minW: 3, minH: 3 },
    ],
};

// ─── Tooltip ─────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] p-3 rounded-lg shadow-lg z-50">
                <p className="font-semibold text-[var(--color-text-primary)] mb-2">{label}</p>
                {payload.map((entry, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color || entry.payload.fill }} />
                        <span className="text-[var(--color-text-secondary)]">{entry.name}:</span>
                        <span className="font-medium text-[var(--color-text-primary)]">
                            {formatNumber(entry.value)}
                        </span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

// ─── Widget wrapper with drag handle ─────────────────────────────
const DashWidget = ({ title, icon: Icon, iconColor, isEditing, children }) => (
    <Card className="h-full flex flex-col overflow-hidden">
        <div className="flex items-center gap-2 px-5 pt-4 pb-2 shrink-0">
            {isEditing && (
                <div className="drag-handle cursor-grab active:cursor-grabbing text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors -ml-1">
                    <GripVertical size={16} />
                </div>
            )}
            {Icon && (
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${iconColor || '#5B9BD5'}18`, color: iconColor }}>
                    <Icon size={15} />
                </div>
            )}
            {title && <h3 className="text-sm font-semibold text-[var(--color-text-primary)] truncate">{title}</h3>}
        </div>
        <div className="flex-1 min-h-0 px-5 pb-4 overflow-auto flex flex-col justify-center">
            {children}
        </div>
    </Card>
);

// ─── Metric mini-card ────────────────────────────────────────────
const MetricWidget = ({ icon: Icon, label, value, color, isEditing }) => (
    <Card className="h-full flex items-center overflow-hidden">
        <div className="flex items-center gap-4 px-5 py-3 w-full">
            {isEditing && (
                <div className="drag-handle cursor-grab active:cursor-grabbing text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors shrink-0">
                    <GripVertical size={16} />
                </div>
            )}
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}18`, color }}>
                <Icon size={22} />
            </div>
            <div className="min-w-0">
                <p className="text-xs text-[var(--color-text-muted)] truncate">{label}</p>
                <p className="text-xl font-bold font-mono text-[var(--color-text-primary)] truncate">{value}</p>
            </div>
        </div>
    </Card>
);

// ═════════════════════════════════════════════════════════════════
// DASHBOARD PAGE
// ═════════════════════════════════════════════════════════════════
const DashboardPage = () => {
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [pendingTasks, setPendingTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

    // Manually measure container width with ResizeObserver via callback ref
    const [gridWidth, setGridWidth] = useState(0);
    const observerRef = useRef(null);
    const containerRef = useCallback((node) => {
        // Cleanup previous observer
        if (observerRef.current) {
            observerRef.current.disconnect();
            observerRef.current = null;
        }
        if (node) {
            setGridWidth(node.offsetWidth);
            const obs = new ResizeObserver(() => setGridWidth(node.offsetWidth));
            obs.observe(node);
            observerRef.current = obs;
        }
    }, []);

    // Load saved layouts or use defaults
    const [layouts, setLayouts] = useState(() => {
        try {
            const saved = localStorage.getItem(LAYOUT_STORAGE_KEY);
            return saved ? JSON.parse(saved) : DEFAULT_LAYOUTS;
        } catch {
            return DEFAULT_LAYOUTS;
        }
    });

    // Apply static behavior to completely lock the dashboard when not editing
    const currentLayouts = useMemo(() => {
        const result = {};
        for (const [bp, l] of Object.entries(layouts)) {
            result[bp] = (l || []).map(item => ({ ...item, static: !isEditing }));
        }
        return result;
    }, [layouts, isEditing]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [dashRes, taskRes] = await Promise.all([
                    dashboardAPI.get(),
                    taskAPI.getPending(),
                ]);
                setData(dashRes.data.data);
                setPendingTasks(taskRes.data.data || []);
            } catch (err) {
                console.error('Dashboard load error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleLayoutChange = useCallback((_, allLayouts) => {
        setLayouts(allLayouts);
        localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(allLayouts));
    }, []);

    const resetLayout = useCallback(() => {
        setLayouts(DEFAULT_LAYOUTS);
        localStorage.removeItem(LAYOUT_STORAGE_KEY);
    }, []);

    if (loading) {
        return (
            <div className="page-container space-y-6">
                <Skeleton className="h-8 w-48" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Skeleton className="h-24" count={4} />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Skeleton className="h-64" count={2} />
                </div>
            </div>
        );
    }

    const metrics = data?.metrics || {};
    const charts = data?.charts || {};

    const monthData = (charts.eventsByMonth || []).map(d => ({
        name: formatMonth(d._id),
        Events: d.count
    }));

    const typeData = (charts.eventsByType || []).map(d => {
        const typeInfo = EVENT_TYPES.find(t => t.value === d._id);
        return {
            name: typeInfo?.label || d._id,
            value: d.count,
            color: typeInfo?.color || '#95A5A6'
        };
    });

    const inventoryData = (charts.topInventoryUsed || []).map(d => ({
        name: truncate(d._id, 15),
        Quantity: d.totalUsed
    }));

    return (
        <div className="page-container space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-[var(--color-text-primary)]">
                        Dashboard
                    </h1>
                    <p className="text-[var(--color-text-muted)] text-sm mt-1">Welcome to MSM Kitchen Management 🙏</p>
                </div>
                <div className="flex items-center gap-2">
                    {isEditing && (
                        <button
                            onClick={resetLayout}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-[var(--color-text-muted)] hover:bg-[var(--color-bg-secondary)] transition-colors"
                            title="Reset to default layout"
                        >
                            <RotateCcw size={14} />
                            Reset
                        </button>
                    )}
                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        className={`
                            flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200
                            ${isEditing
                                ? 'bg-[var(--color-primary)] text-white shadow-md'
                                : 'text-[var(--color-text-muted)] hover:bg-[var(--color-bg-secondary)]'
                            }
                        `}
                        title={isEditing ? 'Lock layout' : 'Edit layout'}
                    >
                        {isEditing ? <Unlock size={14} /> : <Lock size={14} />}
                        {isEditing ? 'Editing' : 'Edit Layout'}
                    </button>
                    <Button onClick={() => navigate('/events/new')}>
                        <Plus size={18} /> New Event
                    </Button>
                </div>
            </div>

            {isEditing && (
                <div className="bg-[var(--color-primary)]10 border border-[var(--color-primary)]30 rounded-xl px-4 py-2.5 text-sm text-[var(--color-primary)] flex items-center gap-2">
                    <GripVertical size={14} />
                    Drag widgets by their handles to rearrange. Resize from edges. Click <strong>Editing</strong> to lock.
                </div>
            )}

            {/* Grid Layout */}
            <div ref={containerRef}>
                {gridWidth > 0 && (
                    <ResponsiveGridLayout
                        className="layout"
                        width={gridWidth}
                        layouts={currentLayouts}
                        breakpoints={{ lg: 768, md: 480, sm: 0 }}
                        cols={{ lg: 12, md: 12, sm: 6 }}
                        rowHeight={40}
                        isDraggable={isEditing}
                        isResizable={isEditing}
                        draggableHandle=".drag-handle"
                        onLayoutChange={handleLayoutChange}
                        margin={[16, 16]}
                        containerPadding={[0, 0]}
                        useCSSTransforms={true}
                    >
                        {/* Metric Cards */}
                        <div key="metric-events">
                            <MetricWidget icon={Calendar} label="Events This Year" value={formatNumber(metrics.totalEvents)} color="#E8621A" isEditing={isEditing} />
                        </div>
                        <div key="metric-attendance">
                            <MetricWidget icon={Users} label="Total Attendance" value={formatNumber(metrics.totalHeadcount)} color="#3D8B37" isEditing={isEditing} />
                        </div>
                        <div key="metric-spend">
                            <MetricWidget icon={IndianRupee} label="Total Spend" value={formatCurrency(metrics.totalSpend)} color="#5B9BD5" isEditing={isEditing} />
                        </div>
                        <div key="metric-tasks">
                            <MetricWidget icon={ClipboardList} label="Pending Tasks" value={formatNumber(metrics.pendingTasks)} color={metrics.pendingTasks > 0 ? '#D9534F' : '#9C8060'} isEditing={isEditing} />
                        </div>

                        {/* Events by Month Chart */}
                        <div key="chart-monthly">
                            <DashWidget title="Events Over Year" icon={BarChart2} iconColor="#E8621A" isEditing={isEditing}>
                                <div className="w-full h-full min-h-[180px]">
                                    {monthData.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={monthData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" opacity={0.5} />
                                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} dy={8} />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} />
                                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--color-border)', opacity: 0.4 }} />
                                                <Bar dataKey="Events" fill="var(--color-primary)" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-[var(--color-text-muted)] text-sm">No event data available yet.</div>
                                    )}
                                </div>
                            </DashWidget>
                        </div>

                        {/* Events by Type Chart */}
                        <div key="chart-types">
                            <DashWidget title="Event Types" icon={PieChartIcon} iconColor="#3D8B37" isEditing={isEditing}>
                                <div className="w-full h-full min-h-[180px]">
                                    {typeData.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                                                <Tooltip content={<CustomTooltip />} />
                                                <Pie data={typeData} innerRadius="55%" outerRadius="75%" paddingAngle={3} dataKey="value" stroke="none">
                                                    {typeData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <Legend verticalAlign="bottom" height={32} iconType="circle"
                                                    formatter={(value) => <span className="text-xs font-medium text-[var(--color-text-secondary)]">{value}</span>}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-[var(--color-text-muted)] text-sm">No data yet.</div>
                                    )}
                                </div>
                            </DashWidget>
                        </div>

                        {/* Top Inventory */}
                        <div key="chart-inventory">
                            <DashWidget title="Top Ingredients Used" icon={Package} iconColor="#5B9BD5" isEditing={isEditing}>
                                <div className="w-full h-full min-h-[180px]">
                                    {inventoryData.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={inventoryData} layout="vertical" margin={{ top: 0, right: 15, left: 0, bottom: 0 }}>
                                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="var(--color-border)" opacity={0.5} />
                                                <XAxis type="number" hide />
                                                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={80} tick={{ fill: 'var(--color-text-secondary)', fontSize: 10, fontWeight: 500 }} />
                                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--color-border)', opacity: 0.4 }} />
                                                <Bar dataKey="Quantity" fill="#5B9BD5" radius={[0, 4, 4, 0]} barSize={20}>
                                                    {inventoryData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={index === 0 ? '#E8621A' : '#5B9BD5'} />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-[var(--color-text-muted)] text-sm">No usage data yet.</div>
                                    )}
                                </div>
                            </DashWidget>
                        </div>

                        {/* Upcoming Events */}
                        <div key="upcoming-events">
                            <DashWidget title="Upcoming Events" icon={Calendar} iconColor="#E8621A" isEditing={isEditing}>
                                {data?.upcomingEvents?.length > 0 ? (
                                    <div className="space-y-2">
                                        {data.upcomingEvents.map((event) => {
                                            const typeInfo = EVENT_TYPES.find((t) => t.value === event.type);
                                            return (
                                                <div
                                                    key={event._id}
                                                    onClick={() => navigate(`/events/${event._id}`)}
                                                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[var(--color-bg-secondary)] cursor-pointer transition-colors group"
                                                >
                                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${typeInfo?.color || '#5B9BD5'}18`, color: typeInfo?.color }}>
                                                        <Calendar size={16} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium text-sm text-[var(--color-text-primary)] truncate">{event.name}</p>
                                                        <p className="text-xs text-[var(--color-text-muted)]">{formatDate(event.startDate)} · {event.expectedHeadcount} people</p>
                                                    </div>
                                                    <ArrowRight size={14} className="text-[var(--color-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-[var(--color-text-muted)] text-sm py-4 text-center">No upcoming events</p>
                                )}
                            </DashWidget>
                        </div>

                        {/* Pending Tasks */}
                        <div key="pending-tasks">
                            <DashWidget title="Pending Tasks" icon={ClipboardList} iconColor="#D9534F" isEditing={isEditing}>
                                {pendingTasks.length > 0 ? (
                                    <div className="space-y-1.5">
                                        {pendingTasks.slice(0, 8).map((task) => {
                                            const p = PRIORITIES.find((pr) => pr.value === task.priority);
                                            return (
                                                <div key={task._id} className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-[var(--color-bg-secondary)] transition-colors">
                                                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: p?.color }} />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">{task.title}</p>
                                                        <p className="text-xs text-[var(--color-text-muted)]">{task.assignedToName || 'Unassigned'}</p>
                                                    </div>
                                                    <Badge color={p?.color}>{p?.label}</Badge>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-[var(--color-text-muted)] text-sm py-4 text-center">All tasks completed! 🎉</p>
                                )}
                            </DashWidget>
                        </div>

                        {/* Low Stock */}
                        <div key="low-stock">
                            <DashWidget title="Inventory Alerts" icon={AlertTriangle} iconColor="#D9534F" isEditing={isEditing}>
                                {data?.lowStockItems?.length > 0 ? (
                                    <div className="space-y-2">
                                        {data.lowStockItems.map((item) => (
                                            <div key={item._id} className="flex items-center justify-between p-2.5 rounded-xl bg-red-50 dark:bg-red-950/20">
                                                <div>
                                                    <p className="text-sm font-medium text-[var(--color-text-primary)]">{item.name}</p>
                                                    <p className="text-xs text-[var(--color-text-muted)]">Min: {item.minimumStockAlert} {item.unit}</p>
                                                </div>
                                                <Badge color="#D9534F">{item.currentStock} {item.unit}</Badge>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-[var(--color-text-muted)] text-sm py-4 text-center">All stock levels healthy ✅</p>
                                )}
                            </DashWidget>
                        </div>

                        {/* Quick Actions */}
                        <div key="quick-actions">
                            <DashWidget title="Quick Actions" icon={TrendingUp} iconColor="#3D8B37" isEditing={isEditing}>
                                <div className="grid grid-cols-2 gap-2">
                                    <Button variant="secondary" size="sm" className="justify-start text-xs" onClick={() => navigate('/events/new')}>
                                        <Calendar size={15} /> New Event
                                    </Button>
                                    <Button variant="secondary" size="sm" className="justify-start text-xs" onClick={() => navigate('/master/sevekaris')}>
                                        <Users size={15} /> Add Sevekari
                                    </Button>
                                    <Button variant="secondary" size="sm" className="justify-start text-xs" onClick={() => navigate('/master/inventory')}>
                                        <TrendingUp size={15} /> Update Stock
                                    </Button>
                                    <Button variant="secondary" size="sm" className="justify-start text-xs" onClick={() => navigate('/vendors')}>
                                        <IndianRupee size={15} /> Add Vendor
                                    </Button>
                                </div>
                            </DashWidget>
                        </div>
                    </ResponsiveGridLayout>
                )}
            </div>
        </div>
    );
};

export default DashboardPage;
