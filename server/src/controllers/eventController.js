import mongoose from 'mongoose';
import Event from '../models/Event.js';
import EventDay from '../models/EventDay.js';
import Dish from '../models/Dish.js';
import Procurement from '../models/Procurement.js';
import Attendance from '../models/Attendance.js';
import InventoryUsed from '../models/InventoryUsed.js';
import Task from '../models/Task.js';
import Meeting from '../models/Meeting.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getAll = asyncHandler(async (req, res) => {
    const { type, status, search, sortBy = 'startDate', order = 'desc', page = 1, limit = 20 } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (search) filter.name = { $regex: search, $options: 'i' };

    const sortOrder = order === 'asc' ? 1 : -1;
    const sortField = ['startDate', 'name', 'expectedHeadcount'].includes(sortBy) ? sortBy : 'startDate';

    const skip = (Number(page) - 1) * Number(limit);
    const [data, total] = await Promise.all([
        Event.find(filter).sort({ [sortField]: sortOrder }).skip(skip).limit(Number(limit)).populate('createdBy', 'name'),
        Event.countDocuments(filter),
    ]);

    ApiResponse.success(res, 'Events fetched', data, {
        page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)),
    });
});

export const getById = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id).populate('createdBy', 'name');
    if (!event) throw ApiError.notFound('Event not found');

    const eventDays = await EventDay.find({ eventId: event._id }).sort({ dayNumber: 1 });
    ApiResponse.success(res, 'Event fetched', { event, eventDays });
});

// FIX B1: Event + EventDays creation wrapped in transaction for atomicity
export const create = asyncHandler(async (req, res) => {
    const { startDate, endDate, ...rest } = req.body;
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Calculate total days
    const diffTime = Math.abs(end - start);
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const [event] = await Event.create(
            [{
                ...rest,
                startDate: start,
                endDate: end,
                totalDays,
                createdBy: req.user._id,
            }],
            { session }
        );

        // Auto-generate event day documents
        const eventDayDocs = [];
        for (let i = 0; i < totalDays; i++) {
            const dayDate = new Date(start);
            dayDate.setDate(dayDate.getDate() + i);
            eventDayDocs.push({
                eventId: event._id,
                dayNumber: i + 1,
                date: dayDate,
            });
        }
        await EventDay.insertMany(eventDayDocs, { session });

        await session.commitTransaction();

        const createdDays = await EventDay.find({ eventId: event._id }).sort({ dayNumber: 1 });
        ApiResponse.created(res, 'Event created', { event, eventDays: createdDays });
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
});

export const update = asyncHandler(async (req, res) => {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!event) throw ApiError.notFound('Event not found');
    ApiResponse.success(res, 'Event updated', event);
});

export const remove = asyncHandler(async (req, res) => {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) throw ApiError.notFound('Event not found');
    // Cascade delete all child records
    await Promise.all([
        EventDay.deleteMany({ eventId: event._id }),
        Dish.deleteMany({ eventId: event._id }),
        Procurement.deleteMany({ eventId: event._id }),
        Attendance.deleteMany({ eventId: event._id }),
        InventoryUsed.deleteMany({ eventId: event._id }),
        Task.deleteMany({ eventId: event._id }),
        Meeting.deleteMany({ eventId: event._id }),
    ]);
    ApiResponse.success(res, 'Event deleted', event);
});

export const updateEventDay = asyncHandler(async (req, res) => {
    const day = await EventDay.findByIdAndUpdate(req.params.dayId, req.body, { new: true, runValidators: true });
    if (!day) throw ApiError.notFound('Event day not found');
    ApiResponse.success(res, 'Event day updated', day);
});
