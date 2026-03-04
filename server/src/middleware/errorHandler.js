import ApiError from '../utils/ApiError.js';

const errorHandler = (err, req, res, _next) => {
    let error = err;

    // ─── Type-specific error transforms (check original err, not wrapped) ───

    // Mongoose Validation Error
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map((e) => ({
            field: e.path,
            message: e.message,
        }));
        error = ApiError.badRequest('Validation Error', errors);
    }

    // Mongoose Duplicate Key Error — return 409 Conflict
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue || {})[0] || 'unknown';
        error = new ApiError(409, `Duplicate value for field: ${field}`);
    }

    // Mongoose CastError (invalid ObjectId)
    if (err.name === 'CastError') {
        error = ApiError.badRequest(`Invalid ${err.path}: ${err.value}`);
    }

    // JWT Errors
    if (err.name === 'JsonWebTokenError') {
        error = ApiError.unauthorized('Invalid token');
    }
    if (err.name === 'TokenExpiredError') {
        error = ApiError.unauthorized('Token expired');
    }

    // ─── Fallback: wrap unknown errors as ApiError ───
    if (!(error instanceof ApiError)) {
        const statusCode = error.statusCode || 500;
        const message = error.message || 'Internal Server Error';
        error = new ApiError(statusCode, message);
    }

    const statusCode = error.statusCode || 500;

    // Log server errors
    if (statusCode >= 500) {
        console.error('🔥 Server Error:', err);
    }

    res.status(statusCode).json({
        success: false,
        message: error.message,
        errors: error.errors || [],
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};

export default errorHandler;
