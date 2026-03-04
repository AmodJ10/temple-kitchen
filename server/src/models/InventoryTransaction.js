import mongoose from 'mongoose';

const inventoryTransactionSchema = new mongoose.Schema(
    {
        inventoryItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'InventoryItem', required: true },
        eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
        type: { type: String, enum: ['addition', 'deduction', 'adjustment'], required: true },
        quantity: { type: Number, required: true },
        previousStock: { type: Number, required: true },
        newStock: { type: Number, required: true },
        performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        notes: { type: String, default: '' },
    },
    { timestamps: true }
);

inventoryTransactionSchema.index({ inventoryItemId: 1, createdAt: -1 });

const InventoryTransaction = mongoose.model('InventoryTransaction', inventoryTransactionSchema);
export default InventoryTransaction;
