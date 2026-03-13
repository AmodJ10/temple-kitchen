import { jest } from '@jest/globals';
import {
    registerSchema,
    loginSchema,
    eventSchema,
    sevekariSchema,
    inventoryItemSchema,
    vendorSchema,
    dishSchema,
    procurementSchema,
    taskSchema,
    taskReorderSchema,
    stockAdjustmentSchema,
} from '../../src/schemas.js';

describe('Shared Zod Schemas', () => {
    describe('registerSchema', () => {
        it('should accept valid registration data', () => {
            const result = registerSchema.safeParse({
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123',
            });
            expect(result.success).toBe(true);
        });

        it('should reject short name', () => {
            const result = registerSchema.safeParse({
                name: 'A',
                email: 'test@example.com',
                password: 'password123',
            });
            expect(result.success).toBe(false);
        });

        it('should reject invalid email', () => {
            const result = registerSchema.safeParse({
                name: 'Test User',
                email: 'notanemail',
                password: 'password123',
            });
            expect(result.success).toBe(false);
        });

        it('should reject short password', () => {
            const result = registerSchema.safeParse({
                name: 'Test User',
                email: 'test@example.com',
                password: '1234567',
            });
            expect(result.success).toBe(false);
        });

        it('should normalize emails and default role to user', () => {
            const result = registerSchema.safeParse({
                name: 'Test User',
                email: 'TEST@EXAMPLE.COM',
                password: 'password123',
            });
            expect(result.data.email).toBe('test@example.com');
            expect(result.data.role).toBe('user');
        });
    });

    describe('loginSchema', () => {
        it('should accept valid login data', () => {
            const result = loginSchema.safeParse({
                email: 'test@example.com',
                password: 'x',
            });
            expect(result.success).toBe(true);
        });

        it('should reject empty password', () => {
            const result = loginSchema.safeParse({
                email: 'test@example.com',
                password: '',
            });
            expect(result.success).toBe(false);
        });
    });

    describe('eventSchema', () => {
        const validEvent = {
            name: 'Test Utsav',
            type: 'utsav',
            startDate: '2026-01-01',
            endDate: '2026-01-03',
            expectedHeadcount: 500,
        };

        it('should accept valid event', () => {
            const result = eventSchema.safeParse(validEvent);
            expect(result.success).toBe(true);
        });

        it('should reject invalid event type', () => {
            const result = eventSchema.safeParse({ ...validEvent, type: 'party' });
            expect(result.success).toBe(false);
        });

        it('should reject headcount < 1', () => {
            const result = eventSchema.safeParse({ ...validEvent, expectedHeadcount: 0 });
            expect(result.success).toBe(false);
        });

        it('should default status to upcoming', () => {
            const result = eventSchema.safeParse(validEvent);
            expect(result.data.status).toBe('upcoming');
        });
    });

    describe('inventoryItemSchema', () => {
        it('should accept valid inventory item', () => {
            const result = inventoryItemSchema.safeParse({
                name: 'Rice',
                unit: 'kg',
                currentStock: 100,
            });
            expect(result.success).toBe(true);
        });

        it('should reject negative stock', () => {
            const result = inventoryItemSchema.safeParse({
                name: 'Rice',
                unit: 'kg',
                currentStock: -5,
            });
            expect(result.success).toBe(false);
        });

        it('should require name and unit', () => {
            const result = inventoryItemSchema.safeParse({});
            expect(result.success).toBe(false);
        });
    });

    describe('stockAdjustmentSchema', () => {
        it('should accept valid adjustment', () => {
            const result = stockAdjustmentSchema.safeParse({
                quantity: 10,
                type: 'addition',
            });
            expect(result.success).toBe(true);
        });

        it('should reject invalid type', () => {
            const result = stockAdjustmentSchema.safeParse({
                quantity: 10,
                type: 'removal',
            });
            expect(result.success).toBe(false);
        });
    });

    describe('taskSchema', () => {
        it('should accept valid task', () => {
            const result = taskSchema.safeParse({
                eventId: '507f1f77bcf86cd799439011',
                title: 'Prepare kitchen',
            });
            expect(result.success).toBe(true);
        });

        it('should default status to "todo"', () => {
            const result = taskSchema.safeParse({
                eventId: '507f1f77bcf86cd799439011',
                title: 'Buy supplies',
            });
            expect(result.data.status).toBe('todo');
        });

        it('should default source to "manual"', () => {
            const result = taskSchema.safeParse({
                eventId: '507f1f77bcf86cd799439011',
                title: 'Buy supplies',
            });
            expect(result.data.source).toBe('manual');
        });

        it('should normalize blank optional assignment fields', () => {
            const result = taskSchema.safeParse({
                eventId: '507f1f77bcf86cd799439011',
                title: 'Review burners',
                assignedTo: '',
                dueDate: '',
            });

            expect(result.success).toBe(true);
            expect(result.data.assignedTo).toBeUndefined();
            expect(result.data.dueDate).toBeUndefined();
        });
    });

    describe('taskReorderSchema', () => {
        it('should accept valid task reorder payload', () => {
            const result = taskReorderSchema.safeParse({
                tasks: [
                    { id: '507f1f77bcf86cd799439011', status: 'todo', order: 0 },
                    { id: '507f1f77bcf86cd799439012', status: 'done', order: 1 },
                ],
            });

            expect(result.success).toBe(true);
        });

        it('should reject empty task reorder payload', () => {
            const result = taskReorderSchema.safeParse({ tasks: [] });
            expect(result.success).toBe(false);
        });
    });
});
