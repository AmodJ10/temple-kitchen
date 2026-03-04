import mongoose from 'mongoose';
import InventoryUsed from '../models/InventoryUsed.js';
import { adjustStock, reverseDeduction } from '../services/inventoryService.js';
import { emitToEvent } from '../services/socketService.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getByEventDay = asyncHandler(async (req, res) => {
    const items = await InventoryUsed.find({ eventDayId: req.params.eventDayId })
        .populate('inventoryItemId', 'name currentStock unit minimumStockAlert')
        .sort({ createdAt: -1 });
    ApiResponse.success(res, 'Inventory used fetched', items);
});

export const getByEvent = asyncHandler(async (req, res) => {
    const items = await InventoryUsed.find({ eventId: req.params.eventId })
        .populate('inventoryItemId', 'name currentStock unit minimumStockAlert')
        .sort({ createdAt: -1 });
    ApiResponse.success(res, 'Inventory used fetched for event', items);
});

// FIX A4: create + stock deduction must be atomic to prevent phantom records
export const create = asyncHandler(async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const [record] = await InventoryUsed.create([req.body], { session });

        // Deduct from master inventory within the same session
        await adjustStock(req.body.inventoryItemId, req.body.quantityUsed, 'deduction', req.user._id, `Used in event`, req.body.eventId, session);

        await session.commitTransaction();
        emitToEvent(record.eventId, 'inventory:updated', { action: 'created', record });
        ApiResponse.created(res, 'Inventory usage recorded & stock deducted', record);
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
});

export const update = asyncHandler(async (req, res) => {
    const existing = await InventoryUsed.findById(req.params.id);
    if (!existing) throw ApiError.notFound('Inventory used record not found');

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        // Reverse previous deduction
        await reverseDeduction(existing.inventoryItemId, existing.quantityUsed, req.user._id, 'Edit reversal', existing.eventId, session);

        // Apply update and new deduction
        const updated = await InventoryUsed.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true, session });
        await adjustStock(updated.inventoryItemId, updated.quantityUsed, 'deduction', req.user._id, 'Updated usage', updated.eventId, session);

        await session.commitTransaction();
        emitToEvent(updated.eventId, 'inventory:updated', { action: 'updated', record: updated });
        ApiResponse.success(res, 'Inventory usage updated', updated);
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
});

export const remove = asyncHandler(async (req, res) => {
    const record = await InventoryUsed.findByIdAndDelete(req.params.id);
    if (!record) throw ApiError.notFound('Inventory used record not found');

    // Reverse deduction
    await reverseDeduction(record.inventoryItemId, record.quantityUsed, req.user._id, 'Record deleted', record.eventId);

    emitToEvent(record.eventId, 'inventory:updated', { action: 'deleted', recordId: record._id });
    ApiResponse.success(res, 'Inventory usage removed & stock restored', record);
});
