import Sevekari from '../models/Sevekari.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getAll = asyncHandler(async (req, res) => {
    const { search, isActive, page = 1, limit = 50 } = req.query;
    const filter = {};

    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (search) filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
    ];

    const skip = (Number(page) - 1) * Number(limit);
    const [data, total] = await Promise.all([
        Sevekari.find(filter).sort({ name: 1 }).skip(skip).limit(Number(limit)),
        Sevekari.countDocuments(filter),
    ]);

    ApiResponse.success(res, 'Sevekaris fetched', data, {
        page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)),
    });
});

export const getById = asyncHandler(async (req, res) => {
    const item = await Sevekari.findById(req.params.id);
    if (!item) throw ApiError.notFound('Sevekari not found');
    ApiResponse.success(res, 'Sevekari fetched', item);
});

export const create = asyncHandler(async (req, res) => {
    const item = await Sevekari.create(req.body);
    ApiResponse.created(res, 'Sevekari created', item);
});

export const update = asyncHandler(async (req, res) => {
    const item = await Sevekari.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) throw ApiError.notFound('Sevekari not found');
    ApiResponse.success(res, 'Sevekari updated', item);
});

export const remove = asyncHandler(async (req, res) => {
    // Soft delete
    const item = await Sevekari.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!item) throw ApiError.notFound('Sevekari not found');
    ApiResponse.success(res, 'Sevekari deactivated', item);
});

export const hardDelete = asyncHandler(async (req, res) => {
    const item = await Sevekari.findByIdAndDelete(req.params.id);
    if (!item) throw ApiError.notFound('Sevekari not found');
    ApiResponse.success(res, 'Sevekari permanently deleted', { _id: item._id });
});
