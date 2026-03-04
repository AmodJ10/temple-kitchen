import { jest } from '@jest/globals';
import ApiError from '../../src/utils/ApiError.js';

// We dynamically import errorHandler since it imports ApiError
const { default: errorHandler } = await import('../../src/middleware/errorHandler.js');

describe('errorHandler middleware', () => {
    let mockReq, mockRes, mockNext;

    beforeEach(() => {
        mockReq = {};
        mockNext = jest.fn();
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
        };
        // Suppress console.error during tests
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should handle ApiError with correct status and message', () => {
        const err = ApiError.notFound('Event not found');
        errorHandler(err, mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(404);
        expect(mockRes.json).toHaveBeenCalledWith(
            expect.objectContaining({
                success: false,
                message: 'Event not found',
            })
        );
    });

    it('should handle generic Error as 500', () => {
        const err = new Error('Something broke');
        errorHandler(err, mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.json).toHaveBeenCalledWith(
            expect.objectContaining({
                success: false,
                message: 'Something broke',
            })
        );
    });

    it('should handle Mongoose ValidationError', () => {
        const err = {
            name: 'ValidationError',
            errors: {
                name: { path: 'name', message: 'Name is required' },
                email: { path: 'email', message: 'Must be valid email' },
            },
        };
        errorHandler(err, mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith(
            expect.objectContaining({
                success: false,
                message: 'Validation Error',
            })
        );
    });

    it('should handle duplicate key error (11000) as 409', () => {
        const err = {
            code: 11000,
            keyValue: { email: 'test@test.com' },
        };
        errorHandler(err, mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(409);
        expect(mockRes.json).toHaveBeenCalledWith(
            expect.objectContaining({
                message: 'Duplicate value for field: email',
            })
        );
    });

    it('should handle duplicate key error with undefined keyValue', () => {
        const err = { code: 11000 };
        errorHandler(err, mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(409);
        expect(mockRes.json).toHaveBeenCalledWith(
            expect.objectContaining({
                message: 'Duplicate value for field: unknown',
            })
        );
    });

    it('should handle CastError (invalid ObjectId)', () => {
        const err = {
            name: 'CastError',
            path: '_id',
            value: 'not-an-objectid',
        };
        errorHandler(err, mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith(
            expect.objectContaining({
                message: 'Invalid _id: not-an-objectid',
            })
        );
    });

    it('should handle JWT errors', () => {
        const err = { name: 'JsonWebTokenError' };
        errorHandler(err, mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith(
            expect.objectContaining({
                message: 'Invalid token',
            })
        );
    });

    it('should handle TokenExpiredError', () => {
        const err = { name: 'TokenExpiredError' };
        errorHandler(err, mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith(
            expect.objectContaining({
                message: 'Token expired',
            })
        );
    });

    it('should include stack trace in development', () => {
        const originalEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'development';

        const err = new Error('Debug me');
        err.stack = 'Error: Debug me\n    at test.js:1:1';
        errorHandler(err, mockReq, mockRes, mockNext);

        expect(mockRes.json).toHaveBeenCalledWith(
            expect.objectContaining({
                stack: expect.any(String),
            })
        );

        process.env.NODE_ENV = originalEnv;
    });
});
