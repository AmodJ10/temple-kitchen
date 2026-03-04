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
    stockAdjustmentSchema,
} from '../../../shared/index.js';

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
                password: '12345',
            });
            expect(result.success).toBe(false);
        });

        it('should default role to viewer', () => {
            const result = registerSchema.safeParse({
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123',
            });
            expect(result.data.role).toBe('viewer');
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
    });
});
