import { jest } from '@jest/globals';
import ApiResponse from '../../src/utils/ApiResponse.js';

describe('ApiResponse', () => {
    let mockRes;

    beforeEach(() => {
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
            send: jest.fn().mockReturnThis(),
        };
    });

    describe('constructor', () => {
        it('should set success=true for status < 400', () => {
            const resp = new ApiResponse(200, 'OK', { id: 1 });
            expect(resp.success).toBe(true);
            expect(resp.message).toBe('OK');
            expect(resp.data).toEqual({ id: 1 });
        });

        it('should set success=false for status >= 400', () => {
            const resp = new ApiResponse(400, 'Bad');
            expect(resp.success).toBe(false);
        });

        it('should include pagination when provided', () => {
            const pagination = { page: 1, limit: 10, total: 100, pages: 10 };
            const resp = new ApiResponse(200, 'OK', [], pagination);
            expect(resp.pagination).toEqual(pagination);
        });

        it('should omit pagination when null', () => {
            const resp = new ApiResponse(200, 'OK', []);
            expect(resp.pagination).toBeUndefined();
        });
    });

    describe('static success()', () => {
        it('should respond with 200 and proper envelope', () => {
            ApiResponse.success(mockRes, 'Fetched', { items: [] });
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    message: 'Fetched',
                    data: { items: [] },
                })
            );
        });

        it('should include pagination when provided', () => {
            const pagination = { page: 2, limit: 20, total: 50, pages: 3 };
            ApiResponse.success(mockRes, 'List', [], pagination);
            expect(mockRes.json).toHaveBeenCalledWith(
                expect.objectContaining({ pagination })
            );
        });
    });

    describe('static created()', () => {
        it('should respond with 201', () => {
            ApiResponse.created(mockRes, 'Created', { _id: 'abc' });
            expect(mockRes.status).toHaveBeenCalledWith(201);
            expect(mockRes.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    message: 'Created',
                    data: { _id: 'abc' },
                })
            );
        });
    });

    describe('static noContent()', () => {
        it('should respond with 204 and no body', () => {
            ApiResponse.noContent(mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(204);
            expect(mockRes.send).toHaveBeenCalled();
        });
    });
});
