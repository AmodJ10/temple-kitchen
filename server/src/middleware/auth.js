import jwt from 'jsonwebtoken';
import ApiError from '../utils/ApiError.js';
import User from '../models/User.js';

const resolveUserFromAccessToken = async (token) => {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    const user = await User.findById(decoded.id).select('-passwordHash');
    if (!user) {
        throw ApiError.unauthorized('User no longer exists.');
    }

    return user;
};

export const protect = async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken;
        if (!token) {
            throw ApiError.unauthorized('Not authenticated. Please log in.');
        }

        req.user = await resolveUserFromAccessToken(token);
        next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return next(ApiError.unauthorized('Token expired. Please refresh.'));
        }
        next(error instanceof ApiError ? error : ApiError.unauthorized('Invalid token.'));
    }
};

export const attachUserIfAuthenticated = async (req, _res, next) => {
    const token = req.cookies?.accessToken;
    if (!token) {
        return next();
    }

    try {
        req.user = await resolveUserFromAccessToken(token);
    } catch (error) {
        if (!(error instanceof jwt.TokenExpiredError) && error instanceof ApiError && error.statusCode !== 401) {
            return next(error);
        }
    }

    next();
};

export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return next(ApiError.forbidden('You do not have permission to perform this action.'));
        }
        next();
    };
};
