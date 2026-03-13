import Attendance from '../models/Attendance.js';
import { emitToEvent } from '../services/socketService.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getByEventDay = asyncHandler(async (req, res) => {
    const items = await Attendance.find({ eventDayId: req.params.eventDayId })
        .populate('sevekariId', 'name phone photoUrl')
        .sort({ sevekariName: 1 });
    ApiResponse.success(res, 'Attendance fetched', items);
});

export const getByEvent = asyncHandler(async (req, res) => {
    const items = await Attendance.find({ eventId: req.params.eventId })
        .populate('sevekariId', 'name phone photoUrl')
        .sort({ sevekariName: 1 });
    ApiResponse.success(res, 'Attendance fetched for event', items);
});

export const create = asyncHandler(async (req, res) => {
    // Check for duplicate
    const existing = await Attendance.findOne({
        eventDayId: req.body.eventDayId,
        $or: [
            { sevekariId: req.body.sevekariId },
            { sevekariId: null, sevekariName: req.body.sevekariName },
        ],
    });
    if (existing) throw ApiError.badRequest('Sevekari already marked present for this day');

    const record = await Attendance.create(req.body);
    emitToEvent(record.eventId, 'attendance:updated', { action: 'created', record });
    ApiResponse.created(res, 'Attendance marked', record);
});

export const bulkCreate = asyncHandler(async (req, res) => {
    const { eventDayId, eventId, sevekariIds } = req.body;
    const requestedRecords = Array.from(
        new Map(
            sevekariIds.map((sevekari) => [
                sevekari.id,
                {
                    eventDayId,
                    eventId,
                    sevekariId: sevekari.id,
                    sevekariName: sevekari.name,
                },
            ])
        ).values()
    );

    const existingAttendances = await Attendance.find({ eventDayId }).select('sevekariId sevekariName');
    const existingIds = new Set(
        existingAttendances
            .map((attendance) => attendance.sevekariId?.toString())
            .filter(Boolean)
    );
    const existingNames = new Set(
        existingAttendances
            .map((attendance) => attendance.sevekariName?.trim().toLowerCase())
            .filter(Boolean)
    );

    const recordsToCreate = requestedRecords.filter((record) => {
        const normalizedName = record.sevekariName.trim().toLowerCase();
        return !existingIds.has(record.sevekariId) && !existingNames.has(normalizedName);
    });

    let createdCount = 0;
    if (recordsToCreate.length > 0) {
        const result = await Attendance.bulkWrite(
            recordsToCreate.map((record) => ({
                updateOne: {
                    filter: {
                        eventDayId: record.eventDayId,
                        sevekariId: record.sevekariId,
                    },
                    update: { $setOnInsert: record },
                    upsert: true,
                },
            })),
            { ordered: false }
        );

        createdCount = result.upsertedCount || 0;
    }

    emitToEvent(eventId, 'attendance:updated', { action: 'bulk-created' });
    ApiResponse.created(res, `${createdCount} attendance records created`);
});

export const update = asyncHandler(async (req, res) => {
    const record = await Attendance.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!record) throw ApiError.notFound('Attendance record not found');
    emitToEvent(record.eventId, 'attendance:updated', { action: 'updated', record });
    ApiResponse.success(res, 'Attendance updated', record);
});

export const remove = asyncHandler(async (req, res) => {
    const record = await Attendance.findByIdAndDelete(req.params.id);
    if (!record) throw ApiError.notFound('Attendance record not found');
    emitToEvent(record.eventId, 'attendance:updated', { action: 'deleted', recordId: record._id });
    ApiResponse.success(res, 'Attendance removed', record);
});
