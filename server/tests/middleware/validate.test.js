import { jest } from '@jest/globals';
import validate from '../../src/middleware/validate.js';
import { z } from 'zod';

describe('validate middleware', () => {
    let mockReq, mockRes, mockNext;

    beforeEach(() => {
        mockReq = { body: {}, query: {}, params: {} };
        mockRes = {};
        mockNext = jest.fn();
    });

    it('should call next() on valid input', () => {
        const schema = z.object({
            name: z.string().min(1),
            email: z.string().email(),
        });

        mockReq.body = { name: 'Test User', email: 'test@example.com' };
        validate(schema)(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalledWith();
        // Req body should be replaced with parsed data
        expect(mockReq.body).toEqual({ name: 'Test User', email: 'test@example.com' });
    });

    it('should call next(ApiError) on invalid input', () => {
        const schema = z.object({
            name: z.string().min(2, 'Name too short'),
        });

        mockReq.body = { name: '' };
        validate(schema)(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalledWith(
            expect.objectContaining({
                statusCode: 400,
                message: 'Validation failed',
            })
        );
    });

    it('should validate query params when source is "query"', () => {
        const schema = z.object({
            page: z.string().optional(),
        });

        mockReq.query = { page: '2' };
        validate(schema, 'query')(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalledWith();
        expect(mockReq.query).toEqual({ page: '2' });
    });

    it('should strip unknown fields (Zod default)', () => {
        const schema = z.object({
            name: z.string(),
        });

        mockReq.body = { name: 'Test', extraField: 'should be stripped' };
        validate(schema)(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalledWith();
        expect(mockReq.body).toEqual({ name: 'Test' });
        expect(mockReq.body.extraField).toBeUndefined();
    });

    it('should return multiple validation errors', () => {
        const schema = z.object({
            name: z.string().min(1, 'Name required'),
            email: z.string().email('Invalid email'),
        });

        mockReq.body = { name: '', email: 'bad' };
        validate(schema)(mockReq, mockRes, mockNext);

        const error = mockNext.mock.calls[0][0];
        expect(error.statusCode).toBe(400);
        expect(error.errors.length).toBeGreaterThanOrEqual(2);
    });
});
