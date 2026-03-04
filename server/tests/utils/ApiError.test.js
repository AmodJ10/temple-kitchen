import { jest } from '@jest/globals';
import ApiError from '../../src/utils/ApiError.js';

describe('ApiError', () => {
    it('should create an error with statusCode and message', () => {
        const error = new ApiError(400, 'Bad request');
        expect(error).toBeInstanceOf(Error);
        expect(error).toBeInstanceOf(ApiError);
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe('Bad request');
        expect(error.success).toBe(false);
        expect(error.errors).toEqual([]);
    });

    it('should accept optional errors array', () => {
        const errors = [{ field: 'name', message: 'required' }];
        const error = new ApiError(422, 'Validation Error', errors);
        expect(error.errors).toEqual(errors);
    });

    describe('static factory methods', () => {
        it('badRequest returns 400', () => {
            const err = ApiError.badRequest('Invalid input');
            expect(err.statusCode).toBe(400);
            expect(err.message).toBe('Invalid input');
        });

        it('unauthorized returns 401', () => {
            const err = ApiError.unauthorized();
            expect(err.statusCode).toBe(401);
            expect(err.message).toBe('Unauthorized');
        });

        it('unauthorized accepts custom message', () => {
            const err = ApiError.unauthorized('Token expired');
            expect(err.message).toBe('Token expired');
        });

        it('forbidden returns 403', () => {
            const err = ApiError.forbidden();
            expect(err.statusCode).toBe(403);
            expect(err.message).toBe('Forbidden');
        });

        it('notFound returns 404', () => {
            const err = ApiError.notFound();
            expect(err.statusCode).toBe(404);
            expect(err.message).toBe('Resource not found');
        });

        it('notFound accepts custom message', () => {
            const err = ApiError.notFound('Event not found');
            expect(err.statusCode).toBe(404);
            expect(err.message).toBe('Event not found');
        });

        it('internal returns 500', () => {
            const err = ApiError.internal();
            expect(err.statusCode).toBe(500);
            expect(err.message).toBe('Internal server error');
        });
    });
});
