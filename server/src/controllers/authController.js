import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

const generateAccessToken = (user) =>
    jwt.sign({ id: user._id, role: user.role }, process.env.JWT_ACCESS_SECRET, { expiresIn: '15m' });

const generateRefreshToken = (user) =>
    jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

// SameSite 'strict' blocks cookies on cross-origin dev setup (5173→5000); use 'lax' in dev
const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    path: '/',
};

export const register = asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body;

    const existing = await User.findOne({ email });
    if (existing) throw ApiError.badRequest('Email already registered');

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, passwordHash, role });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.cookie('accessToken', accessToken, { ...COOKIE_OPTIONS, maxAge: 15 * 60 * 1000 });
    res.cookie('refreshToken', refreshToken, { ...COOKIE_OPTIONS, maxAge: 7 * 24 * 60 * 60 * 1000 });

    ApiResponse.created(res, 'Registration successful', {
        user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    });
});

export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) throw ApiError.unauthorized('Invalid email or password');

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) throw ApiError.unauthorized('Invalid email or password');

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.cookie('accessToken', accessToken, { ...COOKIE_OPTIONS, maxAge: 15 * 60 * 1000 });
    res.cookie('refreshToken', refreshToken, { ...COOKIE_OPTIONS, maxAge: 7 * 24 * 60 * 60 * 1000 });

    ApiResponse.success(res, 'Login successful', {
        user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    });
});

export const logout = asyncHandler(async (_req, res) => {
    res.clearCookie('accessToken', COOKIE_OPTIONS);
    res.clearCookie('refreshToken', COOKIE_OPTIONS);
    ApiResponse.success(res, 'Logged out successfully');
});

export const refreshToken = asyncHandler(async (req, res) => {
    const token = req.cookies?.refreshToken;
    if (!token) throw ApiError.unauthorized('No refresh token');

    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch {
        res.clearCookie('accessToken', COOKIE_OPTIONS);
        res.clearCookie('refreshToken', COOKIE_OPTIONS);
        throw ApiError.unauthorized('Session expired. Please log in again.');
    }

    const user = await User.findById(decoded.id);
    if (!user) {
        res.clearCookie('accessToken', COOKIE_OPTIONS);
        res.clearCookie('refreshToken', COOKIE_OPTIONS);
        throw ApiError.unauthorized('User not found');
    }

    const newAccessToken = generateAccessToken(user);
    res.cookie('accessToken', newAccessToken, { ...COOKIE_OPTIONS, maxAge: 15 * 60 * 1000 });

    ApiResponse.success(res, 'Token refreshed', {
        user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    });
});

export const getMe = asyncHandler(async (req, res) => {
    ApiResponse.success(res, 'Current user', {
        user: { _id: req.user._id, name: req.user.name, email: req.user.email, role: req.user.role },
    });
});
