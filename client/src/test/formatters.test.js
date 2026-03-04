import { describe, it, expect } from 'vitest';
import {
    formatDate,
    formatDateTime,
    formatTime,
    formatRelative,
    formatCurrency,
    formatNumber,
    truncate,
    formatMonth,
} from '../utils/formatters';

describe('formatters', () => {
    describe('formatDate', () => {
        it('should format ISO date string', () => {
            const result = formatDate('2026-03-05T12:00:00.000Z');
            expect(result).toMatch(/05 Mar 2026/);
        });

        it('should format Date object', () => {
            const d = new Date(2026, 2, 5); // March 5, 2026
            const result = formatDate(d);
            expect(result).toMatch(/05 Mar 2026/);
        });

        it('should return dash for null', () => {
            expect(formatDate(null)).toBe('—');
        });

        it('should return dash for undefined', () => {
            expect(formatDate(undefined)).toBe('—');
        });
    });

    describe('formatCurrency', () => {
        it('should format as INR', () => {
            const result = formatCurrency(15000);
            expect(result).toContain('15,000');
            expect(result).toContain('₹');
        });

        it('should return ₹0 for null', () => {
            expect(formatCurrency(null)).toBe('₹0');
        });

        it('should handle zero', () => {
            expect(formatCurrency(0)).toBe('₹0');
        });

        it('should handle large numbers', () => {
            const result = formatCurrency(1250000);
            expect(result).toContain('12,50,000'); // Indian number system
        });
    });

    describe('formatNumber', () => {
        it('should format with Indian number system', () => {
            expect(formatNumber(100000)).toBe('1,00,000');
        });

        it('should return 0 for null', () => {
            expect(formatNumber(null)).toBe('0');
        });
    });

    describe('truncate', () => {
        it('should truncate long strings', () => {
            const long = 'A'.repeat(100);
            const result = truncate(long, 10);
            expect(result).toBe('A'.repeat(10) + '...');
        });

        it('should not truncate short strings', () => {
            expect(truncate('Hello', 10)).toBe('Hello');
        });

        it('should return empty string for falsy input', () => {
            expect(truncate(null)).toBe('');
            expect(truncate(undefined)).toBe('');
            expect(truncate('')).toBe('');
        });
    });

    describe('formatMonth', () => {
        it('should return month name from 1-based index', () => {
            expect(formatMonth(1)).toBe('Jan');
            expect(formatMonth(6)).toBe('Jun');
            expect(formatMonth(12)).toBe('Dec');
        });

        it('should return empty string for invalid index', () => {
            expect(formatMonth(0)).toBe('');
            expect(formatMonth(13)).toBe('');
        });
    });
});
