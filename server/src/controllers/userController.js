import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getAll = asyncHandler(async (req, res) => {
    const users = await User.find().select('-passwordHash').sort({ createdAt: -1 });
    ApiResponse.success(res, 'Users fetched', users);
});

export const updateRole = asyncHandler(async (req, res) => {
    const { role } = req.body;
    const validRoles = ['engineer', 'admin', 'user'];

    if (!validRoles.includes(role)) {
        throw ApiError.badRequest(`Invalid role. Must be one of: ${validRoles.join(', ')}`);
    }

    // Prevent self-role change
    if (req.params.id === req.user._id.toString()) {
        throw ApiError.badRequest('You cannot change your own role');
    }

    // Only engineers can assign engineer role
    if (role === 'engineer' && req.user.role !== 'engineer') {
        throw ApiError.forbidden('Only engineers can assign the engineer role');
    }

    const user = await User.findByIdAndUpdate(
        req.params.id,
        { role },
        { new: true, runValidators: true }
    ).select('-passwordHash');

    if (!user) throw ApiError.notFound('User not found');

    ApiResponse.success(res, 'Role updated', user);
});

export const remove = asyncHandler(async (req, res) => {
    // Prevent self-deletion
    if (req.params.id === req.user._id.toString()) {
        throw ApiError.badRequest('You cannot delete your own account');
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) throw ApiError.notFound('User not found');

    ApiResponse.success(res, 'User deleted', { _id: user._id });
});
