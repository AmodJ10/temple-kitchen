import Dish from '../models/Dish.js';
import { emitToEvent } from '../services/socketService.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getByEventDay = asyncHandler(async (req, res) => {
    const dishes = await Dish.find({ eventDayId: req.params.eventDayId }).sort({ order: 1 });
    ApiResponse.success(res, 'Dishes fetched', dishes);
});

export const getByEvent = asyncHandler(async (req, res) => {
    const dishes = await Dish.find({ eventId: req.params.eventId }).sort({ order: 1 });
    ApiResponse.success(res, 'Dishes fetched for event', dishes);
});

export const create = asyncHandler(async (req, res) => {
    // Get current max order for this event day
    const maxOrder = await Dish.findOne({ eventDayId: req.body.eventDayId }).sort({ order: -1 }).select('order');
    req.body.order = (maxOrder?.order ?? -1) + 1;

    const dish = await Dish.create(req.body);
    emitToEvent(dish.eventId, 'dish:updated', { action: 'created', dish });
    ApiResponse.created(res, 'Dish created', dish);
});

export const update = asyncHandler(async (req, res) => {
    const dish = await Dish.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!dish) throw ApiError.notFound('Dish not found');
    emitToEvent(dish.eventId, 'dish:updated', { action: 'updated', dish });
    ApiResponse.success(res, 'Dish updated', dish);
});

export const remove = asyncHandler(async (req, res) => {
    const dish = await Dish.findByIdAndDelete(req.params.id);
    if (!dish) throw ApiError.notFound('Dish not found');
    emitToEvent(dish.eventId, 'dish:updated', { action: 'deleted', dishId: dish._id });
    ApiResponse.success(res, 'Dish deleted', dish);
});

export const reorder = asyncHandler(async (req, res) => {
    const { orderedIds } = req.body; // Array of dish IDs in new order
    const bulkOps = orderedIds.map((id, index) => ({
        updateOne: { filter: { _id: id }, update: { order: index } },
    }));
    await Dish.bulkWrite(bulkOps);
    ApiResponse.success(res, 'Dishes reordered');
});
