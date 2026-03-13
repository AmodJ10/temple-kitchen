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

    const targetUser = await User.findById(req.params.id);
    if (!targetUser) throw ApiError.notFound('User not found');

    // Admins cannot alter other admins or engineers
    if (req.user.role === 'admin' && (targetUser.role === 'engineer' || targetUser.role === 'admin')) {
        throw ApiError.forbidden('Admins cannot change the role of engineers or other admins');
    }

    // Only engineers can assign engineer role
    if (role === 'engineer' && req.user.role !== 'engineer') {
        throw ApiError.forbidden('Only engineers can assign the engineer role');
    }

    targetUser.role = role;
    await targetUser.save();

    const user = await User.findById(req.params.id).select('-passwordHash');

    ApiResponse.success(res, 'Role updated', user);
});

export const remove = asyncHandler(async (req, res) => {
    // Prevent self-deletion
    if (req.params.id === req.user._id.toString()) {
        throw ApiError.badRequest('You cannot delete your own account');
    }

    const userToDelete = await User.findById(req.params.id);
    if (!userToDelete) throw ApiError.notFound('User not found');

    // Only engineers can delete engineers
    if (userToDelete.role === 'engineer' && req.user.role !== 'engineer') {
        throw ApiError.forbidden('Admins cannot delete engineers. Only an engineer can delete another engineer.');
    }

    await userToDelete.deleteOne();

    ApiResponse.success(res, 'User deleted', { _id: userToDelete._id });
});
