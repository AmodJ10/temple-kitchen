import Task from '../models/Task.js';
import { emitToEvent } from '../services/socketService.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getByEvent = asyncHandler(async (req, res) => {
    const tasks = await Task.find({ eventId: req.params.eventId })
        .populate('assignedTo', 'name photoUrl')
        .sort({ priority: -1, order: 1 });
    ApiResponse.success(res, 'Tasks fetched', tasks);
});

export const getAllPending = asyncHandler(async (_req, res) => {
    const tasks = await Task.find({ status: { $in: ['todo', 'in-progress'] } })
        .populate('eventId', 'name')
        .populate('assignedTo', 'name')
        .sort({ priority: -1, dueDate: 1 });
    ApiResponse.success(res, 'Pending tasks fetched', tasks);
});

export const create = asyncHandler(async (req, res) => {
    const task = await Task.create(req.body);
    emitToEvent(task.eventId, 'task:updated', { action: 'created', task });
    ApiResponse.created(res, 'Task created', task);
});

export const update = asyncHandler(async (req, res) => {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!task) throw ApiError.notFound('Task not found');
    emitToEvent(task.eventId, 'task:updated', { action: 'updated', task });
    ApiResponse.success(res, 'Task updated', task);
});

export const updateStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const task = await Task.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true });
    if (!task) throw ApiError.notFound('Task not found');
    emitToEvent(task.eventId, 'task:updated', { action: 'status-changed', task });
    ApiResponse.success(res, 'Task status updated', task);
});

export const remove = asyncHandler(async (req, res) => {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) throw ApiError.notFound('Task not found');
    emitToEvent(task.eventId, 'task:updated', { action: 'deleted', taskId: task._id });
    ApiResponse.success(res, 'Task deleted', task);
});
