import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        type: { type: String, enum: ['utsav', 'meeting', 'shibir'], required: true },
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        totalDays: { type: Number, default: 1 },
        expectedHeadcount: { type: Number, default: 1 },
        status: { type: String, enum: ['upcoming', 'ongoing', 'completed', 'cancelled'], default: 'upcoming' },
        description: { type: String, default: '' },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    },
    { timestamps: true }
);

eventSchema.index({ status: 1, startDate: -1 });
eventSchema.index({ type: 1 });

const Event = mongoose.model('Event', eventSchema);
export default Event;
