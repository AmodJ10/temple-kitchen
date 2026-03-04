import mongoose from 'mongoose';

const inventoryItemSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        unit: { type: String, required: true },
        currentStock: { type: Number, default: 0, min: 0 },
        minimumStockAlert: { type: Number, default: 0, min: 0 },
        location: { type: String, default: '' },
        category: { type: String, default: '' },
        notes: { type: String, default: '' },
        lastUpdated: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

inventoryItemSchema.index({ name: 'text', category: 1 });

const InventoryItem = mongoose.model('InventoryItem', inventoryItemSchema);
export default InventoryItem;
