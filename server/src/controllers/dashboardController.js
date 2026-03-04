import Event from '../models/Event.js';
import Task from '../models/Task.js';
import Attendance from '../models/Attendance.js';
import Procurement from '../models/Procurement.js';
import InventoryItem from '../models/InventoryItem.js';
import InventoryUsed from '../models/InventoryUsed.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getDashboard = asyncHandler(async (_req, res) => {
    const currentYear = new Date().getFullYear();
    const yearStart = new Date(currentYear, 0, 1);
    const yearEnd = new Date(currentYear, 11, 31, 23, 59, 59);

    const [
        totalEvents,
        totalHeadcount,
        totalSpend,
        pendingTasks,
        upcomingEvents,
        lowStockItems,
        eventsByMonth,
        eventsByType,
        topInventoryUsed,
    ] = await Promise.all([
        Event.countDocuments({ startDate: { $gte: yearStart, $lte: yearEnd } }),
        Attendance.distinct('sevekariId', { createdAt: { $gte: yearStart, $lte: yearEnd } }).then(ids => ids.length),
        Procurement.aggregate([
            { $match: { createdAt: { $gte: yearStart, $lte: yearEnd } } },
            { $group: { _id: null, total: { $sum: '$grandTotal' } } },
        ]),
        Task.countDocuments({ status: { $in: ['todo', 'in-progress'] } }),
        Event.find({ status: 'upcoming' }).sort({ startDate: 1 }).limit(3).lean(),
        InventoryItem.find({ $expr: { $lt: ['$currentStock', '$minimumStockAlert'] } }).limit(50).lean(),
        Event.aggregate([
            { $match: { startDate: { $gte: yearStart, $lte: yearEnd } } },
            { $group: { _id: { $month: '$startDate' }, count: { $sum: 1 } } },
            { $sort: { _id: 1 } },
        ]),
        Event.aggregate([
            { $match: { startDate: { $gte: yearStart, $lte: yearEnd } } },
            { $group: { _id: '$type', count: { $sum: 1 } } },
        ]),
        InventoryUsed.aggregate([
            { $group: { _id: '$itemName', totalUsed: { $sum: '$quantityUsed' } } },
            { $sort: { totalUsed: -1 } },
            { $limit: 5 },
        ]),
    ]);

    ApiResponse.success(res, 'Dashboard data', {
        metrics: {
            totalEvents,
            totalHeadcount,
            totalSpend: totalSpend[0]?.total || 0,
            pendingTasks,
        },
        upcomingEvents,
        lowStockItems,
        charts: {
            eventsByMonth,
            eventsByType,
            topInventoryUsed,
        },
    });
});
