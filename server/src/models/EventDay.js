import mongoose from 'mongoose';

const eventDaySchema = new mongoose.Schema(
    {
        eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
        dayNumber: { type: Number, required: true },
        date: { type: Date, required: true },
        actualHeadcount: { type: Number, default: 0 },
        notes: { type: String, default: '' },
    },
    { timestamps: true }
);

eventDaySchema.index({ eventId: 1, dayNumber: 1 });

const EventDay = mongoose.model('EventDay', eventDaySchema);
export default EventDay;
