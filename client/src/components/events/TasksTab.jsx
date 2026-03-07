import { useState, useEffect } from 'react';
import { ClipboardList, Plus, Trash2, Edit2, Calendar, GripVertical, User } from 'lucide-react';
import {
    DndContext,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    useDroppable,
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
    arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import toast from 'react-hot-toast';
import { taskAPI, sevekariAPI } from '../../api/endpoints';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Card from '../ui/Card';
import Modal from '../ui/Modal';
import Badge from '../ui/Badge';
import ConfirmDialog from '../ui/ConfirmDialog';
import Skeleton from '../ui/Skeleton';
import { formatDate } from '../../utils/formatters';

const COLUMNS = [
    { id: 'todo', title: 'To Do', color: '#E8621A' },        // Saffron
    { id: 'in-progress', title: 'In Progress', color: '#5B9BD5' },
    { id: 'done', title: 'Done', color: '#2ECC71' }          // Green
];

const SortableTask = ({ task, onEdit, onDelete }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: task._id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 10 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} className="touch-none mt-3 relative group">
            <Card className="p-3 border-[var(--color-border)] hover:border-[var(--color-primary)] transition-all">
                <div className="flex justify-between items-start gap-2 mb-2">
                    <div className="flex items-start gap-2">
                        <button
                            className="mt-0.5 text-[var(--color-text-muted)] cursor-grab active:cursor-grabbing hover:text-[var(--color-primary)] shrink-0"
                            {...attributes}
                            {...listeners}
                        >
                            <GripVertical size={16} />
                        </button>
                        <h5 className="font-medium text-sm text-[var(--color-text-primary)] leading-tight">{task.title}</h5>
                    </div>
                    <Badge color={task.priority === 'high' ? '#E74C3C' : task.priority === 'medium' ? '#F39C12' : '#95A5A6'} className="shrink-0 text-[10px] px-1.5 py-0 h-4">
                        {task.priority.toUpperCase()}
                    </Badge>
                </div>

                {task.description && (
                    <p className="text-xs text-[var(--color-text-secondary)] mb-2 line-clamp-2 pl-6">{task.description}</p>
                )}

                <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pl-6">
                    <div className="flex items-center gap-3 text-xs text-[var(--color-text-muted)]">
                        {task.assignedToName && (
                            <span className="flex items-center gap-1 bg-[var(--color-bg-secondary)] px-1.5 py-0.5 rounded text-[var(--color-text-primary)] font-medium">
                                <User size={12} /> {task.assignedToName}
                            </span>
                        )}
                        {task.dueDate && (
                            <span className={`flex items-center gap-1 ${new Date(task.dueDate) < new Date() && task.status !== 'done' ? 'text-red-500' : ''}`}>
                                <Calendar size={12} /> {formatDate(task.dueDate)}
                            </span>
                        )}
                    </div>
                </div>

                <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-[var(--color-bg-card)] p-1 rounded-md shadow-sm border border-[var(--color-border)]">
                    <button onClick={() => onEdit(task)} className="p-1 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] rounded transition-colors"><Edit2 size={12} /></button>
                    <button onClick={() => onDelete(task)} className="p-1 text-[var(--color-text-muted)] hover:text-red-500 rounded transition-colors"><Trash2 size={12} /></button>
                </div>
            </Card>
        </div>
    );
};

const DroppableColumn = ({ column, tasks, onEdit, onDelete }) => {
    const { setNodeRef } = useDroppable({
        id: column.id,
    });

    return (
        <div ref={setNodeRef} className="flex flex-col h-full bg-[var(--color-bg-secondary)] rounded-xl py-3 px-3 min-h-[300px]">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: column.color }} />
                    <h4 className="font-semibold text-sm text-[var(--color-text-primary)] uppercase tracking-wider">{column.title}</h4>
                </div>
                <Badge className="bg-[var(--color-bg-card)] text-[var(--color-text-muted)] text-xs border border-[var(--color-border)] font-bold">{tasks.length}</Badge>
            </div>

            <SortableContext
                id={column.id}
                items={tasks.map(t => t._id)}
                strategy={verticalListSortingStrategy}
            >
                <div className="flex-1">
                    {tasks.map(task => (
                        <SortableTask key={task._id} task={task} onEdit={onEdit} onDelete={onDelete} />
                    ))}
                </div>
            </SortableContext>
        </div>
    );
};

const TaskForm = ({ event, initial, onSubmit, onCancel, loading }) => {
    const [sevekaris, setSevekaris] = useState([]);
    const [form, setForm] = useState(initial || {
        title: '', description: '', howTo: '', assignedTo: '', dueDate: '', priority: 'medium', status: 'todo'
    });

    useEffect(() => {
        sevekariAPI.getAll().then(res => setSevekaris(res.data.data)).catch(() => { });
    }, []);

    const handleChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();

        // Find assignedToName
        let assignedToName = form.assignedToName || '';
        if (form.assignedTo && form.assignedTo !== initial?.assignedTo) {
            const s = sevekaris.find(sev => sev._id === form.assignedTo);
            if (s) assignedToName = s.name;
        }

        onSubmit({
            ...form,
            eventId: event._id,
            assignedToName
        });
    };

    return (
        <form onSubmit={handleFormSubmit} className="space-y-4">
            <Input
                label="Task Title"
                value={form.title}
                onChange={(e) => handleChange('title', e.target.value)}
                required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                    label="Assigned To (Sevekari)"
                    value={form.assignedTo || ''}
                    onChange={(e) => handleChange('assignedTo', e.target.value)}
                    options={[{ value: '', label: 'Unassigned' }, ...sevekaris.map(s => ({ value: s._id, label: s.name }))]}
                />
                <Input
                    label="Due Date"
                    type="date"
                    value={form.dueDate ? form.dueDate.split('T')[0] : ''}
                    onChange={(e) => handleChange('dueDate', e.target.value ? new Date(e.target.value).toISOString() : '')}
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                    label="Priority"
                    value={form.priority}
                    onChange={(e) => handleChange('priority', e.target.value)}
                    options={[
                        { value: 'low', label: 'Low' },
                        { value: 'medium', label: 'Medium' },
                        { value: 'high', label: 'High' }
                    ]}
                />
                <Select
                    label="Status"
                    value={form.status}
                    onChange={(e) => handleChange('status', e.target.value)}
                    options={[
                        { value: 'todo', label: 'To Do' },
                        { value: 'in-progress', label: 'In Progress' },
                        { value: 'done', label: 'Done' }
                    ]}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">Description</label>
                <textarea
                    value={form.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    rows={2}
                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] resize-none"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">How-To / Instructions</label>
                <textarea
                    value={form.howTo}
                    onChange={(e) => handleChange('howTo', e.target.value)}
                    rows={3}

                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] resize-none"
                />
            </div>

            <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
                    Cancel
                </Button>
                <Button type="submit" loading={loading}>
                    {initial ? 'Update Task' : 'Create Task'}
                </Button>
            </div>
        </form>
    );
};

const TasksTab = ({ event }) => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [deletingTask, setDeletingTask] = useState(null);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const fetchTasks = async () => {
        setLoading(true);
        try {
            const res = await taskAPI.getByEvent(event._id);
            setTasks(res.data.data.sort((a, b) => a.order - b.order) || []);
        } catch (error) {
            toast.error('Failed to load tasks');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (event?._id) fetchTasks();
    }, [event?._id]);

    const handleDragOver = (e) => {
        const { active, over } = e;
        if (!over) return;

        const activeTask = tasks.find(t => t._id === active.id);
        const overTask = tasks.find(t => t._id === over.id);
        const overColumnId = overTask ? overTask.status : over.id;

        if (!activeTask || activeTask.status === overColumnId) return;

        setTasks((prev) => {
            const activeIndex = prev.findIndex(t => t._id === active.id);
            const overIndex = overTask ? prev.findIndex(t => t._id === over.id) : prev.length;

            const newTasks = [...prev];
            newTasks[activeIndex] = { ...activeTask, status: overColumnId };
            return arrayMove(newTasks, activeIndex, overIndex);
        });
    };

    const handleDragEnd = async (e) => {
        const { active, over } = e;
        if (!over) return;

        const activeTask = tasks.find(t => t._id === active.id);
        const overTask = tasks.find(t => t._id === over.id);
        const overColumnId = overTask ? overTask.status : over.id;

        setTasks((prev) => {
            const activeIndex = prev.findIndex(t => t._id === active.id);
            const overIndex = overTask ? prev.findIndex(t => t._id === over.id) : prev.length;

            if (activeIndex !== overIndex) {
                return arrayMove(prev, activeIndex, overIndex);
            }
            return prev;
        });

        // Try to update DB. The visual state was already adjusted by handleDragOver or onDragEnd arrayMove
        if (activeTask && activeTask.status !== overColumnId) {
            try {
                await taskAPI.update(active.id, { status: overColumnId });
                toast.success('Task status updated');
            } catch (error) {
                toast.error('Failed to move task');
                fetchTasks();
            }
        }
    };

    const handleSubmit = async (formData) => {
        setSubmitting(true);
        try {
            if (editingTask) {
                await taskAPI.update(editingTask._id, formData);
                toast.success('Task updated');
            } else {
                await taskAPI.create({ ...formData, order: tasks.length });
                toast.success('Task created');
            }
            setIsFormOpen(false);
            setEditingTask(null);
            fetchTasks();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save task');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!deletingTask) return;
        setSubmitting(true);
        try {
            await taskAPI.remove(deletingTask._id);
            toast.success('Task deleted');
            setDeletingTask(null);
            fetchTasks();
        } catch (error) {
            toast.error('Failed to delete task');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center hidden sm:flex">
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Preparation Tasks Kanban</h3>
                <Button onClick={() => { setEditingTask(null); setIsFormOpen(true); }}>
                    <Plus size={16} /> New Task
                </Button>
            </div>

            <Button onClick={() => { setEditingTask(null); setIsFormOpen(true); }} className="w-full sm:hidden">
                <Plus size={16} /> New Task
            </Button>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Skeleton className="h-[400px] w-full rounded-xl" />
                    <Skeleton className="h-[400px] w-full rounded-xl" />
                    <Skeleton className="h-[400px] w-full rounded-xl" />
                </div>
            ) : (
                <div className="overflow-x-auto pb-4 custom-scrollbar">
                    <div className="inline-grid grid-flow-col auto-cols-[300px] gap-6 min-w-full">
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCorners}
                            onDragOver={handleDragOver}
                            onDragEnd={handleDragEnd}
                        >
                            {COLUMNS.map(column => (
                                <DroppableColumn
                                    key={column.id}
                                    column={column}
                                    tasks={tasks.filter(t => t.status === column.id)}
                                    onEdit={t => { setEditingTask(t); setIsFormOpen(true); }}
                                    onDelete={t => setDeletingTask(t)}
                                />
                            ))}
                        </DndContext>
                    </div>
                </div>
            )}

            <Modal
                isOpen={isFormOpen}
                onClose={() => !submitting && setIsFormOpen(false)}
                title={editingTask ? "Edit Task" : "Create Task"}
                size="md"
            >
                <TaskForm
                    event={event}
                    initial={editingTask}
                    onSubmit={handleSubmit}
                    onCancel={() => setIsFormOpen(false)}
                    loading={submitting}
                />
            </Modal>

            <ConfirmDialog
                isOpen={!!deletingTask}
                onClose={() => setDeletingTask(null)}
                onConfirm={handleDelete}
                title="Delete Task"
                message={`Are you sure you want to delete "${deletingTask?.title}"?`}
                confirmText="Delete"
                danger
                loading={submitting}
            />
        </div>
    );
};

export default TasksTab;
