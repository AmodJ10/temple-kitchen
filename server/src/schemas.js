import { z } from 'zod';

const emptyStringToUndefined = (value) => {
    if (typeof value !== 'string') {
        return value;
    }

    const trimmedValue = value.trim();
    return trimmedValue === '' ? undefined : trimmedValue;
};

const optionalIdSchema = z.preprocess(
    emptyStringToUndefined,
    z.string().min(1).optional()
);

const optionalDateSchema = z.preprocess(
    emptyStringToUndefined,
    z.string().or(z.date()).optional()
);

// ─── User Schemas ────────────────────────────────────────────────
export const userRoles = ['engineer', 'admin', 'user'];

export const registerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    email: z.string().trim().email('Invalid email address').transform((value) => value.toLowerCase()),
    password: z.string().min(8, 'Password must be at least 8 characters').max(128),
    role: z.enum(userRoles).default('user'),
});

export const loginSchema = z.object({
    email: z.string().trim().email('Invalid email address').transform((value) => value.toLowerCase()),
    password: z.string().min(1, 'Password is required'),
});

// ─── Sevekari Schemas ────────────────────────────────────────────
export const sevekariSchema = z.object({
    name: z.string().min(2, 'Name is required').max(100),
    phone: z.string().max(20).optional().default(''),
    email: z.string().email('Invalid email').optional().or(z.literal('')).default(''),
    address: z.string().max(500).optional().default(''),
    joinDate: z.string().or(z.date()).optional(),
    isActive: z.boolean().default(true),
    photoUrl: z.string().optional().default(''),
    notes: z.string().max(1000).optional().default(''),
});

// ─── Inventory Item Schemas ──────────────────────────────────────
export const inventoryItemSchema = z.object({
    name: z.string().min(1, 'Item name is required').max(200),
    unit: z.string().min(1, 'Unit is required').max(50),
    currentStock: z.number().min(0, 'Stock cannot be negative').default(0),
    minimumStockAlert: z.number().min(0).default(0),
    location: z.string().max(200).optional().default(''),
    category: z.string().max(100).optional().default(''),
    notes: z.string().max(1000).optional().default(''),
});

export const stockAdjustmentSchema = z.object({
    quantity: z.number(),
    type: z.enum(['addition', 'deduction', 'adjustment']),
    notes: z.string().max(500).optional().default(''),
});

// ─── Vendor Schemas ──────────────────────────────────────────────
export const vendorSchema = z.object({
    name: z.string().min(1, 'Vendor name is required').max(200),
    contactNo: z.string().max(20).optional().default(''),
    email: z.string().email('Invalid email').optional().or(z.literal('')).default(''),
    address: z.string().max(500).optional().default(''),
    category: z.string().max(100).optional().default(''),
    notes: z.string().max(1000).optional().default(''),
});

// ─── Event Schemas ───────────────────────────────────────────────
export const eventTypes = ['utsav', 'meeting', 'shibir'];
export const eventStatuses = ['upcoming', 'ongoing', 'completed', 'cancelled'];

export const eventSchema = z.object({
    name: z.string().min(1, 'Event name is required').max(300),
    type: z.enum(eventTypes),
    startDate: z.string().or(z.date()),
    endDate: z.string().or(z.date()),
    expectedHeadcount: z.number().int().min(1, 'Expected headcount must be at least 1').default(1),
    status: z.enum(eventStatuses).default('upcoming'),
    description: z.string().max(2000).optional().default(''),
}).refine(
    (d) => new Date(d.endDate) >= new Date(d.startDate),
    { message: 'End date must be on or after start date', path: ['endDate'] }
);

// ─── Event Day Schemas ───────────────────────────────────────────
export const eventDaySchema = z.object({
    eventId: z.string().min(1),
    dayNumber: z.number().int().min(1),
    date: z.string().or(z.date()),
    actualHeadcount: z.number().int().min(0).optional().default(0),
    notes: z.string().max(1000).optional().default(''),
});

// ─── Dish Schemas ────────────────────────────────────────────────
export const dishTypes = ['breakfast', 'lunch', 'dinner', 'beverage', 'snack'];

export const ingredientSchema = z.object({
    name: z.string().min(1, 'Ingredient name required'),
    quantity: z.number().min(0).default(0),
    unit: z.string().default(''),
});

export const dishSchema = z.object({
    eventDayId: z.string().min(1),
    eventId: z.string().min(1),
    order: z.number().int().min(0).optional().default(0),
    name: z.string().min(1, 'Dish name is required').max(200),
    type: z.enum(dishTypes),
    headcount: z.number().int().min(0).default(0),
    ingredients: z.array(ingredientSchema).default([]),
    totalYield: z.object({ amount: z.number().min(0).default(0), unit: z.string().default('') }).optional(),
    leftover: z.object({ amount: z.number().min(0).default(0), unit: z.string().default('') }).optional(),
    notes: z.string().max(1000).optional().default(''),
});

// ─── Procurement Schemas ─────────────────────────────────────────
export const paymentStatuses = ['pending', 'partial', 'paid'];

export const procurementItemSchema = z.object({
    name: z.string().min(1, 'Item name required'),
    quantity: z.number().min(0).default(0),
    unit: z.string().default(''),
    ratePerUnit: z.number().min(0).default(0),
    totalPrice: z.number().min(0).default(0),
});

export const procurementSchema = z.object({
    eventDayId: z.string().min(1),
    eventId: z.string().min(1),
    vendorId: z.string().optional().default(''),
    vendorName: z.string().min(1, 'Vendor name required'),
    vendorContact: z.string().optional().default(''),
    items: z.array(procurementItemSchema).min(1, 'At least one item required'),
    grandTotal: z.number().min(0).default(0),
    paymentStatus: z.enum(paymentStatuses).default('pending'),
    amountPaid: z.number().min(0).default(0),
    receiptUrl: z.string().optional().default(''),
    receiptPublicId: z.string().optional().default(''),
    notes: z.string().max(1000).optional().default(''),
});

// ─── Attendance Schemas ──────────────────────────────────────────
export const attendanceSchema = z.object({
    eventDayId: z.string().min(1),
    eventId: z.string().min(1),
    sevekariId: z.string().min(1),
    sevekariName: z.string().default(''),
    role: z.string().max(100).optional().default(''),
    checkInTime: z.string().or(z.date()).optional(),
    checkOutTime: z.string().or(z.date()).optional(),
    notes: z.string().max(500).optional().default(''),
});

export const attendanceBulkSchema = z.object({
    eventDayId: z.string().min(1),
    eventId: z.string().min(1),
    sevekariIds: z.array(
        z.object({
            id: z.string().min(1),
            name: z.string().min(1),
        })
    ).min(1, 'At least one sevekari is required'),
});

// ─── Inventory Used Schemas ──────────────────────────────────────
export const inventoryUsedSchema = z.object({
    eventDayId: z.string().min(1),
    eventId: z.string().min(1),
    inventoryItemId: z.string().min(1),
    itemName: z.string().default(''),
    quantityUsed: z.number().min(0, 'Quantity must be positive'),
    unit: z.string().default(''),
    sourceLocation: z.string().max(200).optional().default(''),
    notes: z.string().max(500).optional().default(''),
});

// ─── Meeting Schemas ─────────────────────────────────────────────
export const meetingTypes = ['pre-event', 'post-event', 'standalone'];
export const priorities = ['high', 'medium', 'low'];

export const actionableSchema = z.object({
    title: z.string().min(1, 'Actionable title required'),
    description: z.string().optional().default(''),
    assignedTo: optionalIdSchema,
    dueDate: optionalDateSchema,
    priority: z.enum(priorities).default('medium'),
});

export const meetingSchema = z.object({
    eventId: z.string().min(1),
    eventDayId: z.string().optional().default(''),
    meetingType: z.enum(meetingTypes),
    title: z.string().min(1, 'Meeting title required').max(300),
    date: z.string().or(z.date()),
    attendees: z.array(z.string()).default([]),
    agenda: z.string().max(5000).optional().default(''),
    discussions: z.string().max(10000).optional().default(''),
    decisions: z.string().max(5000).optional().default(''),
    actionables: z.array(actionableSchema).default([]),
    notes: z.string().max(5000).optional().default(''),
});

// ─── Task Schemas ────────────────────────────────────────────────
export const taskStatuses = ['todo', 'in-progress', 'done', 'cancelled'];
export const taskSources = ['meeting', 'manual'];

export const taskSchema = z.object({
    eventId: z.string().min(1),
    title: z.string().min(1, 'Task title required').max(300),
    description: z.string().max(2000).optional().default(''),
    howTo: z.string().max(5000).optional().default(''),
    assignedTo: optionalIdSchema,
    assignedToName: z.string().optional().default(''),
    dueDate: optionalDateSchema,
    priority: z.enum(priorities).default('medium'),
    status: z.enum(taskStatuses).default('todo'),
    source: z.enum(taskSources).default('manual'),
    meetingActionableRef: z.string().optional().default(''),
    order: z.number().int().min(0).optional().default(0),
});

export const attendanceUpdateSchema = attendanceSchema.partial();
export const dishUpdateSchema = dishSchema.partial();
export const meetingUpdateSchema = meetingSchema.partial();
export const taskUpdateSchema = taskSchema.partial();

export const taskStatusUpdateSchema = z.object({
    status: z.enum(taskStatuses),
});

export const taskReorderSchema = z.object({
    tasks: z.array(
        z.object({
            id: z.string().min(1),
            status: z.enum(taskStatuses),
            order: z.number().int().min(0),
        })
    ).min(1, 'At least one task is required'),
});

export const dishReorderSchema = z.object({
    orderedIds: z.array(z.string().min(1)).min(1, 'At least one dish id is required'),
});
