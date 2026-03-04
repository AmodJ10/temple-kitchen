import Procurement from '../models/Procurement.js';
import { cloudinary } from '../config/cloudinary.js';
import { emitToEvent } from '../services/socketService.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

// Helper: compute item totals and grand total
const computeProcurementTotals = (body) => {
    if (body.items) {
        body.items = body.items.map((item) => ({
            ...item,
            totalPrice: item.quantity * item.ratePerUnit,
        }));
        body.grandTotal = body.items.reduce((sum, item) => sum + item.totalPrice, 0);
    }
    return body;
};

export const getByEventDay = asyncHandler(async (req, res) => {
    const items = await Procurement.find({ eventDayId: req.params.eventDayId }).sort({ createdAt: -1 });
    ApiResponse.success(res, 'Procurements fetched', items);
});

export const getByEvent = asyncHandler(async (req, res) => {
    const items = await Procurement.find({ eventId: req.params.eventId }).sort({ createdAt: -1 });
    ApiResponse.success(res, 'Event procurements fetched', items);
});

export const create = asyncHandler(async (req, res) => {
    computeProcurementTotals(req.body);
    const procurement = await Procurement.create(req.body);
    emitToEvent(procurement.eventId, 'procurement:updated', { action: 'created', procurement });
    ApiResponse.created(res, 'Procurement created', procurement);
});

export const update = asyncHandler(async (req, res) => {
    computeProcurementTotals(req.body);
    const procurement = await Procurement.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!procurement) throw ApiError.notFound('Procurement not found');
    emitToEvent(procurement.eventId, 'procurement:updated', { action: 'updated', procurement });
    ApiResponse.success(res, 'Procurement updated', procurement);
});

export const remove = asyncHandler(async (req, res) => {
    const procurement = await Procurement.findByIdAndDelete(req.params.id);
    if (!procurement) throw ApiError.notFound('Procurement not found');

    // Delete receipt from Cloudinary if exists
    if (procurement.receiptPublicId) {
        try { await cloudinary.uploader.destroy(procurement.receiptPublicId); } catch (e) { /* non-fatal */ }
    }

    emitToEvent(procurement.eventId, 'procurement:updated', { action: 'deleted', procurementId: procurement._id });
    ApiResponse.success(res, 'Procurement deleted', procurement);
});

export const uploadReceipt = asyncHandler(async (req, res) => {
    if (!req.file) throw ApiError.badRequest('No file uploaded');

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: 'temple-kitchen/receipts', resource_type: 'image' },
            (error, uploadResult) => {
                if (error) reject(error);
                else resolve(uploadResult);
            }
        );
        stream.end(req.file.buffer);
    });

    const procurement = await Procurement.findByIdAndUpdate(
        req.params.id,
        { receiptUrl: result.secure_url, receiptPublicId: result.public_id },
        { new: true }
    );
    if (!procurement) throw ApiError.notFound('Procurement not found');

    ApiResponse.success(res, 'Receipt uploaded', procurement);
});
