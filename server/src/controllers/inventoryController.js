import InventoryItem from '../models/InventoryItem.js';
import InventoryTransaction from '../models/InventoryTransaction.js';
import { adjustStock } from '../services/inventoryService.js';
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
        InventoryItem.find(filter).sort({ name: 1 }).skip(skip).limit(Number(limit)),
        InventoryItem.countDocuments(filter),
    ]);

    ApiResponse.success(res, 'Inventory items fetched', data, {
        page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)),
    });
});

export const getById = asyncHandler(async (req, res) => {
    const item = await InventoryItem.findById(req.params.id);
    if (!item) throw ApiError.notFound('Inventory item not found');
    ApiResponse.success(res, 'Inventory item fetched', item);
});

export const create = asyncHandler(async (req, res) => {
    const item = await InventoryItem.create(req.body);
    ApiResponse.created(res, 'Inventory item created', item);
});

export const update = asyncHandler(async (req, res) => {
    const item = await InventoryItem.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) throw ApiError.notFound('Inventory item not found');
    ApiResponse.success(res, 'Inventory item updated', item);
});

export const remove = asyncHandler(async (req, res) => {
    const item = await InventoryItem.findByIdAndDelete(req.params.id);
    if (!item) throw ApiError.notFound('Inventory item not found');
    ApiResponse.success(res, 'Inventory item deleted', item);
});

export const adjustStockHandler = asyncHandler(async (req, res) => {
    const { quantity, type, notes } = req.body;
    const { item, transaction } = await adjustStock(req.params.id, quantity, type, req.user._id, notes);
    ApiResponse.success(res, 'Stock adjusted', { item, transaction });
});

export const getTransactions = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const filter = { inventoryItemId: req.params.id };

    const [data, total] = await Promise.all([
        InventoryTransaction.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).populate('performedBy', 'name'),
        InventoryTransaction.countDocuments(filter),
    ]);

    ApiResponse.success(res, 'Stock transactions fetched', data, {
        page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)),
    });
});

export const getLowStock = asyncHandler(async (_req, res) => {
    const items = await InventoryItem.find({
        $expr: { $lt: ['$currentStock', '$minimumStockAlert'] },
    }).sort({ name: 1 });
    ApiResponse.success(res, 'Low stock items', items);
});
