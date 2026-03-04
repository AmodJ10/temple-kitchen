/**
 * Wraps async route handlers to catch errors and pass to Express error middleware.
 * Prevents unhandled promise rejections from crashing the server.
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
