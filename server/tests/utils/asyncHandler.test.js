import { jest } from '@jest/globals';
import asyncHandler from '../../src/utils/asyncHandler.js';

describe('asyncHandler', () => {
    it('should call the wrapped function with req, res, next', async () => {
        const mockFn = jest.fn().mockResolvedValue(undefined);
        const req = {};
        const res = {};
        const next = jest.fn();

        const handler = asyncHandler(mockFn);
        await handler(req, res, next);

        expect(mockFn).toHaveBeenCalledWith(req, res, next);
        expect(next).not.toHaveBeenCalled();
    });

    it('should catch errors and pass them to next()', async () => {
        const error = new Error('DB connection failed');
        const mockFn = jest.fn().mockRejectedValue(error);
        const req = {};
        const res = {};
        const next = jest.fn();

        const handler = asyncHandler(mockFn);
        await handler(req, res, next);

        expect(next).toHaveBeenCalledWith(error);
    });

    it('should catch errors from async functions that throw', async () => {
        const error = new Error('Async throw');
        const mockFn = jest.fn().mockImplementation(async () => {
            throw error;
        });
        const req = {};
        const res = {};
        const next = jest.fn();

        const handler = asyncHandler(mockFn);
        await handler(req, res, next);

        expect(next).toHaveBeenCalledWith(error);
    });
});
