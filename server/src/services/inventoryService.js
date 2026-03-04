import mongoose from 'mongoose';
import InventoryItem from '../models/InventoryItem.js';
import InventoryTransaction from '../models/InventoryTransaction.js';
import ApiError from '../utils/ApiError.js';

/**
 * Adjust inventory stock within a MongoDB transaction for atomicity.
 * @param {string} inventoryItemId
 * @param {number} quantity - positive number; sign determined by type
 * @param {'addition'|'deduction'|'adjustment'} type
 * @param {string} performedBy - user ID
 * @param {string} notes
 * @param {string} [eventId]
 * @param {import('mongoose').ClientSession} [externalSession] - reuse caller's session for true atomicity
 * @returns {Promise<{item: object, transaction: object}>}
 */
export const adjustStock = async (inventoryItemId, quantity, type, performedBy, notes = '', eventId = null, externalSession = null) => {
    const ownSession = !externalSession;
    const session = externalSession || await mongoose.startSession();
    if (ownSession) session.startTransaction();

    try {
        const item = await InventoryItem.findById(inventoryItemId).session(session);
        if (!item) {
            throw ApiError.notFound('Inventory item not found');
        }

        const previousStock = item.currentStock;
        let newStock;

        switch (type) {
            case 'addition':
                newStock = previousStock + quantity;
                break;
            case 'deduction':
                newStock = previousStock - quantity;
                break;
            case 'adjustment':
                newStock = quantity; // Direct set
                break;
            default:
                throw ApiError.badRequest('Invalid transaction type');
        }

        if (newStock < 0) {
            newStock = 0; // Don't block but floor at zero
        }

        item.currentStock = newStock;
        item.lastUpdated = new Date();
        await item.save({ session });

        const transaction = await InventoryTransaction.create(
            [
                {
                    inventoryItemId,
                    eventId,
                    type,
                    quantity,
                    previousStock,
                    newStock,
                    performedBy,
                    notes,
                },
            ],
            { session }
        );

        if (ownSession) await session.commitTransaction();
        return { item, transaction: transaction[0] };
    } catch (error) {
        if (ownSession) await session.abortTransaction();
        throw error;
    } finally {
        if (ownSession) session.endSession();
    }
};

/**
 * Reverse a previous stock deduction (for edit/delete of inventoryUsed records).
 */
export const reverseDeduction = async (inventoryItemId, quantity, performedBy, notes = '', eventId = null, externalSession = null) => {
    return adjustStock(inventoryItemId, quantity, 'addition', performedBy, `Reversal: ${notes}`, eventId, externalSession);
};
