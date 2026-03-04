import { describe, it, expect } from 'vitest';
import {
    EVENT_TYPES,
    EVENT_STATUSES,
    DISH_TYPES,
    PAYMENT_STATUSES,
    PRIORITIES,
    TASK_STATUSES,
    INVENTORY_CATEGORIES,
} from '../utils/constants';

describe('constants', () => {
    describe('EVENT_TYPES', () => {
        it('should have exactly 3 types', () => {
            expect(EVENT_TYPES).toHaveLength(3);
        });

        it('should include utsav, meeting, shibir', () => {
            const values = EVENT_TYPES.map(t => t.value);
            expect(values).toContain('utsav');
            expect(values).toContain('meeting');
            expect(values).toContain('shibir');
        });

        it('each type should have value, label, and color', () => {
            EVENT_TYPES.forEach(t => {
                expect(t).toHaveProperty('value');
                expect(t).toHaveProperty('label');
                expect(t).toHaveProperty('color');
                expect(t.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
            });
        });
    });

    describe('EVENT_STATUSES', () => {
        it('should have 4 statuses', () => {
            expect(EVENT_STATUSES).toHaveLength(4);
        });

        it('should include upcoming, ongoing, completed, cancelled', () => {
            const values = EVENT_STATUSES.map(s => s.value);
            expect(values).toEqual(['upcoming', 'ongoing', 'completed', 'cancelled']);
        });
    });

    describe('DISH_TYPES', () => {
        it('should have 5 types', () => {
            expect(DISH_TYPES).toHaveLength(5);
        });

        it('should include all meal types', () => {
            const values = DISH_TYPES.map(d => d.value);
            expect(values).toContain('breakfast');
            expect(values).toContain('lunch');
            expect(values).toContain('dinner');
            expect(values).toContain('beverage');
            expect(values).toContain('snack');
        });
    });

    describe('PAYMENT_STATUSES', () => {
        it('should have 3 statuses', () => {
            expect(PAYMENT_STATUSES).toHaveLength(3);
        });
    });

    describe('PRIORITIES', () => {
        it('should have 3 levels', () => {
            expect(PRIORITIES).toHaveLength(3);
        });

        it('should be ordered high, medium, low', () => {
            const values = PRIORITIES.map(p => p.value);
            expect(values).toEqual(['high', 'medium', 'low']);
        });
    });

    describe('TASK_STATUSES', () => {
        it('should include all status values', () => {
            const values = TASK_STATUSES.map(s => s.value);
            expect(values).toEqual(['todo', 'in-progress', 'done', 'cancelled']);
        });
    });

    describe('INVENTORY_CATEGORIES', () => {
        it('should be a non-empty array of strings', () => {
            expect(INVENTORY_CATEGORIES.length).toBeGreaterThan(0);
            INVENTORY_CATEGORIES.forEach(cat => {
                expect(typeof cat).toBe('string');
            });
        });

        it('should include common categories', () => {
            expect(INVENTORY_CATEGORIES).toContain('Grains');
            expect(INVENTORY_CATEGORIES).toContain('Spices');
            expect(INVENTORY_CATEGORIES).toContain('Other');
        });
    });
});
