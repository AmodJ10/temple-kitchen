import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GripVertical, Plus, Edit2, Trash2, Utensils, X, ChevronDown } from 'lucide-react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import toast from 'react-hot-toast';
import { dishAPI } from '../../api/endpoints';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Card from '../ui/Card';
import Modal from '../ui/Modal';
import Badge from '../ui/Badge';
import EmptyState from '../ui/EmptyState';
import ConfirmDialog from '../ui/ConfirmDialog';
import Skeleton from '../ui/Skeleton';
import { UNIT_OPTIONS } from '../../utils/constants';
import useAuthStore from '../../store/authStore';

const DISH_TYPES = [
    { value: 'breakfast', label: 'Breakfast', color: '#E8621A' },
    { value: 'lunch', label: 'Lunch', color: '#3D8B37' },
    { value: 'dinner', label: 'Dinner', color: '#5B9BD5' },
    { value: 'beverage', label: 'Beverage', color: '#9B59B6' },
    { value: 'snack', label: 'Snack', color: '#F1C40F' }
];

const SortableDishItem = ({ dish, onEdit, onDelete, isExpanded, onToggle, canEdit }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: dish._id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 10 : 1,
    };

    const typeInfo = DISH_TYPES.find(t => t.value === dish.type);

    return (
        <div ref={setNodeRef} style={style} className="relative group">
            <div
                className={`bg-[var(--color-bg-card)] border border-[var(--color-border)] ${isExpanded ? 'rounded-t-xl border-b-0' : 'rounded-xl'
                    } p-4 flex items-center gap-4 hover:shadow-sm transition-all cursor-pointer`}
                onClick={onToggle}
            >
                {canEdit && (
                    <button
                        className="text-[var(--color-text-muted)] cursor-grab active:cursor-grabbing hover:text-[var(--color-text-primary)]"
                        {...attributes}
                        {...listeners}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <GripVertical size={20} />
                    </button>
                )}

                <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h4 className="font-semibold text-[var(--color-text-primary)] truncate">{dish.name}</h4>
                        <Badge color={typeInfo?.color}>{typeInfo?.label}</Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--color-text-muted)]">
                        <span>Headcount: {dish.headcount}</span>
                        {dish.totalYield?.amount > 0 && (
                            <span>Yield: {dish.totalYield.amount} {dish.totalYield.unit}</span>
                        )}
                        <span>Ingredients: {dish.ingredients?.length || 0} items</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {canEdit && <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={(e) => { e.stopPropagation(); onEdit(dish); }}
                            className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-bg-secondary)] rounded-lg transition-colors"
                        >
                            <Edit2 size={16} />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onDelete(dish); }}
                            className="p-1.5 text-[var(--color-text-muted)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>}
                    <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="text-[var(--color-text-muted)]"
                    >
                        <ChevronDown size={18} />
                    </motion.div>
                </div>
            </div>

            <AnimatePresence initial={false}>
                {isExpanded && (
                    <motion.div
                        key="details"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className="overflow-hidden"
                    >
                        <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] border-t-0 rounded-b-xl px-4 pb-4 pt-2 space-y-4">
                            {/* Ingredients Table */}
                            {dish.ingredients?.length > 0 ? (
                                <div>
                                    <h5 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">Ingredients</h5>
                                    <div className="rounded-lg border border-[var(--color-border)] overflow-hidden">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="bg-[var(--color-bg-secondary)]">
                                                    <th className="text-left py-2 px-3 font-medium text-[var(--color-text-secondary)]">Item</th>
                                                    <th className="text-right py-2 px-3 font-medium text-[var(--color-text-secondary)]">Qty</th>
                                                    <th className="text-left py-2 px-3 font-medium text-[var(--color-text-secondary)]">Unit</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {dish.ingredients.map((ing, idx) => (
                                                    <tr key={idx} className="border-t border-[var(--color-border)]">
                                                        <td className="py-2 px-3 text-[var(--color-text-primary)]">{ing.name}</td>
                                                        <td className="py-2 px-3 text-right font-mono text-[var(--color-text-primary)]">{ing.quantity}</td>
                                                        <td className="py-2 px-3 text-[var(--color-text-muted)]">{ing.unit}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-[var(--color-text-muted)] italic">No ingredients listed.</p>
                            )}

                            {/* Yield & Leftover */}
                            <div className="flex flex-wrap gap-6">
                                {dish.totalYield?.amount > 0 && (
                                    <div>
                                        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Total Yield</span>
                                        <p className="text-sm font-medium text-[var(--color-text-primary)] mt-0.5">{dish.totalYield.amount} {dish.totalYield.unit}</p>
                                    </div>
                                )}
                                {dish.leftover?.amount > 0 && (
                                    <div>
                                        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Leftover</span>
                                        <p className="text-sm font-medium text-orange-500 mt-0.5">{dish.leftover.amount} {dish.leftover.unit}</p>
                                    </div>
                                )}
                                <div>
                                    <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Headcount</span>
                                    <p className="text-sm font-medium text-[var(--color-text-primary)] mt-0.5">{dish.headcount}</p>
                                </div>
                            </div>

                            {/* Notes */}
                            {dish.notes && (
                                <div>
                                    <h5 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-1">Notes</h5>
                                    <p className="text-sm text-[var(--color-text-secondary)] bg-[var(--color-bg-secondary)] rounded-lg p-3">{dish.notes}</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const DishForm = ({ event, selectedDayId, initial, onSubmit, onCancel, loading }) => {
    const [form, setForm] = useState(initial || {
        name: '', type: 'lunch', headcount: '',
        totalYield: { amount: '', unit: 'kg' },
        leftover: { amount: '', unit: 'kg' },
        ingredients: [], notes: ''
    });

    const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

    const handleAddIngredient = () => {
        setForm(prev => ({
            ...prev,
            ingredients: [...prev.ingredients, { name: '', quantity: '', unit: '' }]
        }));
    };

    const handleRemoveIngredient = (index) => {
        setForm(prev => ({
            ...prev,
            ingredients: prev.ingredients.filter((_, i) => i !== index)
        }));
    };

    const handleIngredientChange = (index, field, value) => {
        setForm(prev => {
            const newIngredients = [...prev.ingredients];
            newIngredients[index] = { ...newIngredients[index], [field]: value };
            return { ...prev, ingredients: newIngredients };
        });
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        onSubmit({
            ...form,
            headcount: Number(form.headcount || 0),
            totalYield: { ...form.totalYield, amount: Number(form.totalYield?.amount || 0) },
            leftover: { ...form.leftover, amount: Number(form.leftover?.amount || 0) },
            ingredients: form.ingredients.map((ingredient) => ({
                ...ingredient,
                quantity: Number(ingredient.quantity || 0),
            })),
            eventId: event._id,
            eventDayId: selectedDayId,
        });
    };

    return (
        <form onSubmit={handleFormSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                    label="Dish Name"
                    value={form.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    required
                />
                <Select
                    label="Type"
                    value={form.type}
                    onChange={(e) => handleChange('type', e.target.value)}
                    options={DISH_TYPES.map(t => ({ value: t.value, label: t.label }))}
                />
                <Input
                    label="Headcount"
                    type="number"
                    min={0}
                    value={form.headcount}
                    onChange={(e) => handleChange('headcount', e.target.value === '' ? '' : Number(e.target.value))}
                    required
                />
            </div>

            <div className="bg-[var(--color-bg-secondary)] p-4 rounded-xl space-y-4 border border-[var(--color-border)]">
                <div className="flex items-center justify-between">
                    <h4 className="font-medium text-[var(--color-text-primary)]">Ingredients</h4>
                    <Button type="button" size="sm" variant="outline" onClick={handleAddIngredient}>
                        <Plus size={14} /> Add Ingredient
                    </Button>
                </div>

                {form.ingredients.length === 0 ? (
                    <p className="text-sm text-[var(--color-text-muted)] italic">No ingredients added.</p>
                ) : (
                    <div className="space-y-3">
                        {form.ingredients.map((ing, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                                <div className="flex-1">
                                    <Input
                                        placeholder="Ingredient name"
                                        value={ing.name}
                                        onChange={(e) => handleIngredientChange(idx, 'name', e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="w-24">
                                    <Input
                                        type="number"
                                        min={0}
                                        step="0.01"
                                        placeholder="Quantity"
                                        value={ing.quantity === '' ? '' : ing.quantity}
                                        onChange={(e) => handleIngredientChange(idx, 'quantity', e.target.value === '' ? '' : Number(e.target.value))}
                                        required
                                    />
                                </div>
                                <div className="w-28">
                                    <Select
                                        value={ing.unit}
                                        onChange={(e) => handleIngredientChange(idx, 'unit', e.target.value)}
                                        options={[{ value: '', label: 'Unit' }, ...UNIT_OPTIONS]}
                                        required
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveIngredient(idx)}
                                    className="p-2 text-[var(--color-text-muted)] hover:text-red-500 rounded-lg shrink-0 mt-[26px]"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-3 gap-4">
                <Input
                    label="Yield Amount"
                    type="number"
                    min={0}
                    step="0.1"
                    value={form.totalYield?.amount ?? ''}
                    onChange={(e) => handleChange('totalYield', { ...form.totalYield, amount: e.target.value === '' ? '' : Number(e.target.value) })}
                />
                <Input
                    label="Leftover"
                    type="number"
                    min={0}
                    step="0.1"
                    value={form.leftover?.amount ?? ''}
                    onChange={(e) => handleChange('leftover', { ...form.leftover, amount: e.target.value === '' ? '' : Number(e.target.value) })}
                />
                <Select
                    label="Unit"
                    value={form.totalYield?.unit || ''}
                    onChange={(e) => {
                        handleChange('totalYield', { ...form.totalYield, unit: e.target.value });
                        handleChange('leftover', { ...form.leftover, unit: e.target.value });
                    }}
                    options={[{ value: '', label: 'Select unit' }, ...UNIT_OPTIONS]}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">Notes / Instructions</label>
                <textarea
                    value={form.notes}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] resize-none"
                    placeholder="Add recipe notes, service timing, or prep instructions"
                />
            </div>

            <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
                    Cancel
                </Button>
                <Button type="submit" loading={loading}>
                    {initial ? 'Update Dish' : 'Add Dish'}
                </Button>
            </div>
        </form>
    );
};

const DishesTab = ({ event, selectedDayId }) => {
    const [dishes, setDishes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [expandedDishId, setExpandedDishId] = useState(null);
    const canEdit = useAuthStore((s) => s.canEdit());

    // Modal states
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingDish, setEditingDish] = useState(null);
    const [deletingDish, setDeletingDish] = useState(null);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const fetchDishes = async () => {
        if (!selectedDayId) return;
        setLoading(true);
        try {
            const res = await dishAPI.getByEventDay(selectedDayId);
            setDishes(res.data.data.sort((a, b) => a.order - b.order) || []);
        } catch (error) {
            toast.error('Failed to load dishes');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDishes();
    }, [selectedDayId]);

    const handleDragEnd = async (event) => {
        if (!canEdit) return;
        const { active, over } = event;

        if (!over) return;

        if (active.id !== over.id) {
            setDishes((items) => {
                const oldIndex = items.findIndex((i) => i._id === active.id);
                const newIndex = items.findIndex((i) => i._id === over.id);
                const newItems = arrayMove(items, oldIndex, newIndex);

                // Fire and forget API call to save new order
                const orderedIds = newItems.map(item => item._id);
                dishAPI.reorder({ orderedIds }).catch(() => toast.error('Failed to save order'));

                return newItems;
            });
        }
    };

    const handleSubmit = async (formData) => {
        setSubmitting(true);
        try {
            if (editingDish) {
                await dishAPI.update(editingDish._id, formData);
                toast.success('Dish updated');
            } else {
                await dishAPI.create({ ...formData, order: dishes.length });
                toast.success('Dish added');
            }
            setIsFormOpen(false);
            setEditingDish(null);
            fetchDishes();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save dish');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!deletingDish) return;
        setSubmitting(true);
        try {
            await dishAPI.remove(deletingDish._id);
            toast.success('Dish removed');
            setDeletingDish(null);
            fetchDishes();
        } catch (error) {
            toast.error('Failed to delete dish');
        } finally {
            setSubmitting(false);
        }
    };

    if (!selectedDayId) {
        return (
            <Card className="p-8 text-center text-[var(--color-text-muted)]">
                <p>No event day selected. This event may have no days generated yet.</p>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center hidden sm:flex">
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Dishes Planned</h3>
                {canEdit && <Button onClick={() => { setEditingDish(null); setIsFormOpen(true); }}>
                    <Plus size={16} /> Add Dish
                </Button>}
            </div>

            {canEdit && <Button onClick={() => { setEditingDish(null); setIsFormOpen(true); }} className="w-full sm:hidden">
                <Plus size={16} /> Add Dish
            </Button>}

            {loading ? (
                <div className="space-y-3">
                    <Skeleton className="h-20 w-full rounded-xl" />
                    <Skeleton className="h-20 w-full rounded-xl" />
                    <Skeleton className="h-20 w-full rounded-xl" />
                </div>
            ) : dishes.length === 0 ? (
                <EmptyState
                    icon={Utensils}
                    title="No dishes planned"
                    description="Add dishes and ingredients for this event day"
                    action={canEdit ? (
                        <Button onClick={() => { setEditingDish(null); setIsFormOpen(true); }}>
                            <Plus size={16} /> Add Dish
                        </Button>
                    ) : null}
                />
            ) : (
                <DndContext
                    sensors={canEdit ? sensors : []}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={dishes.map(d => d._id)}
                        strategy={verticalListSortingStrategy}
                    >
                        <div className="space-y-3">
                            {dishes.map((dish) => (
                                <SortableDishItem
                                    key={dish._id}
                                    dish={dish}
                                    canEdit={canEdit}
                                    isExpanded={expandedDishId === dish._id}
                                    onToggle={() => setExpandedDishId(expandedDishId === dish._id ? null : dish._id)}
                                    onEdit={(d) => { setEditingDish(d); setIsFormOpen(true); }}
                                    onDelete={(d) => setDeletingDish(d)}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            )}

            {canEdit && <Modal
                isOpen={isFormOpen}
                onClose={() => !submitting && setIsFormOpen(false)}
                title={editingDish ? "Edit Dish" : "Add Dish"}
                size="lg"
            >
                <DishForm
                    event={event}
                    selectedDayId={selectedDayId}
                    initial={editingDish}
                    onSubmit={handleSubmit}
                    onCancel={() => setIsFormOpen(false)}
                    loading={submitting}
                />
            </Modal>}

            {canEdit && <ConfirmDialog
                isOpen={!!deletingDish}
                onClose={() => setDeletingDish(null)}
                onConfirm={handleDelete}
                title="Remove Dish"
                message={`Are you sure you want to remove "${deletingDish?.name}"? You will lose its ingredient list.`}
                confirmText="Remove"
                danger
                loading={submitting}
            />}
        </div>
    );
};

export default DishesTab;
