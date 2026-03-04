import mongoose from 'mongoose';

const inventoryUsedSchema = new mongoose.Schema(
    {
        eventDayId: { type: mongoose.Schema.Types.ObjectId, ref: 'EventDay', required: true },
        eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
        inventoryItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'InventoryItem', required: true },
        itemName: { type: String, default: '' },
        quantityUsed: { type: Number, required: true, min: 0 },
        unit: { type: String, default: '' },
        sourceLocation: { type: String, default: '' },
        notes: { type: String, default: '' },
    },
    { timestamps: true }
);

inventoryUsedSchema.index({ eventId: 1 });
inventoryUsedSchema.index({ eventDayId: 1 });
inventoryUsedSchema.index({ inventoryItemId: 1 });

const InventoryUsed = mongoose.model('InventoryUsed', inventoryUsedSchema);
export default InventoryUsed;
