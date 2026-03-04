import mongoose from 'mongoose';

const procurementItemSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        quantity: { type: Number, default: 0 },
        unit: { type: String, default: '' },
        ratePerUnit: { type: Number, default: 0 },
        totalPrice: { type: Number, default: 0 },
    },
    { _id: false }
);

const procurementSchema = new mongoose.Schema(
    {
        eventDayId: { type: mongoose.Schema.Types.ObjectId, ref: 'EventDay', required: true },
        eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
        vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
        vendorName: { type: String, required: true },
        vendorContact: { type: String, default: '' },
        items: [procurementItemSchema],
        grandTotal: { type: Number, default: 0 },
        paymentStatus: { type: String, enum: ['pending', 'partial', 'paid'], default: 'pending' },
        amountPaid: { type: Number, default: 0 },
        receiptUrl: { type: String, default: '' },
        receiptPublicId: { type: String, default: '' },
        notes: { type: String, default: '' },
    },
    { timestamps: true }
);

procurementSchema.index({ eventId: 1 });
procurementSchema.index({ eventDayId: 1 });

const Procurement = mongoose.model('Procurement', procurementSchema);
export default Procurement;
