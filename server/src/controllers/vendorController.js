import Vendor from '../models/Vendor.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getAll = asyncHandler(async (req, res) => {
    const { search, category, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (search) filter.name = { $regex: search, $options: 'i' };

    const skip = (Number(page) - 1) * Number(limit);
    const [data, total] = await Promise.all([
        Vendor.find(filter).sort({ name: 1 }).skip(skip).limit(Number(limit)),
        Vendor.countDocuments(filter),
    ]);

    ApiResponse.success(res, 'Vendors fetched', data, {
        page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)),
    });
});

export const getById = asyncHandler(async (req, res) => {
    const item = await Vendor.findById(req.params.id);
    if (!item) throw ApiError.notFound('Vendor not found');
    ApiResponse.success(res, 'Vendor fetched', item);
});

export const create = asyncHandler(async (req, res) => {
    const item = await Vendor.create(req.body);
    ApiResponse.created(res, 'Vendor created', item);
});

export const update = asyncHandler(async (req, res) => {
    const item = await Vendor.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) throw ApiError.notFound('Vendor not found');
    ApiResponse.success(res, 'Vendor updated', item);
});

export const remove = asyncHandler(async (req, res) => {
    const item = await Vendor.findByIdAndDelete(req.params.id);
    if (!item) throw ApiError.notFound('Vendor not found');
    ApiResponse.success(res, 'Vendor deleted', item);
});
