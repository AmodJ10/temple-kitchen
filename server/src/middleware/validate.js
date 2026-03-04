import ApiError from '../utils/ApiError.js';

/**
 * Middleware factory that validates request body/query/params against a Zod schema.
 * @param {import('zod').ZodSchema} schema - Zod schema to validate against
 * @param {'body'|'query'|'params'} source - Which part of the request to validate
 */
const validate = (schema, source = 'body') => {
    return (req, _res, next) => {
        const result = schema.safeParse(req[source]);
        if (!result.success) {
            const errors = result.error.issues.map((issue) => ({
                field: issue.path.join('.'),
                message: issue.message,
            }));
            return next(ApiError.badRequest('Validation failed', errors));
        }
        req[source] = result.data; // Replace with parsed/coerced data
        next();
    };
};

export default validate;
