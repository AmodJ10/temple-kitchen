import Meeting from '../models/Meeting.js';
import Task from '../models/Task.js';
import Sevekari from '../models/Sevekari.js';
import { emitToEvent } from '../services/socketService.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getByEvent = asyncHandler(async (req, res) => {
    const meetings = await Meeting.find({ eventId: req.params.eventId })
        .populate('attendees', 'name phone')
        .populate('actionables.assignedTo', 'name')
        .sort({ date: 1 });
    ApiResponse.success(res, 'Meetings fetched', meetings);
});

export const create = asyncHandler(async (req, res) => {
    const meeting = await Meeting.create(req.body);

    // FIX G1: batch-fetch sevekari names to avoid N+1 queries
    if (req.body.actionables && req.body.actionables.length > 0) {
        const assignedIds = req.body.actionables
            .filter(a => a.assignedTo)
            .map(a => a.assignedTo);
        const sevekaris = assignedIds.length > 0
            ? await Sevekari.find({ _id: { $in: assignedIds } }).select('name').lean()
            : [];
        const nameMap = {};
        sevekaris.forEach(s => { nameMap[s._id.toString()] = s.name; });

        const tasks = req.body.actionables.map(actionable => ({
            eventId: req.body.eventId,
            title: actionable.title,
            description: actionable.description || '',
            assignedTo: actionable.assignedTo || undefined,
            assignedToName: actionable.assignedTo ? (nameMap[actionable.assignedTo] || '') : '',
            dueDate: actionable.dueDate || undefined,
            priority: actionable.priority || 'medium',
            source: 'meeting',
            meetingActionableRef: meeting._id.toString(),
        }));
        await Task.insertMany(tasks);
    }

    emitToEvent(meeting.eventId, 'meeting:updated', { action: 'created', meeting });
    ApiResponse.created(res, 'Meeting created & tasks auto-generated', meeting);
});

export const update = asyncHandler(async (req, res) => {
    const meeting = await Meeting.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!meeting) throw ApiError.notFound('Meeting not found');
    emitToEvent(meeting.eventId, 'meeting:updated', { action: 'updated', meeting });
    ApiResponse.success(res, 'Meeting updated', meeting);
});

export const remove = asyncHandler(async (req, res) => {
    const meeting = await Meeting.findByIdAndDelete(req.params.id);
    if (!meeting) throw ApiError.notFound('Meeting not found');
    emitToEvent(meeting.eventId, 'meeting:updated', { action: 'deleted', meetingId: meeting._id });
    ApiResponse.success(res, 'Meeting deleted', meeting);
});
