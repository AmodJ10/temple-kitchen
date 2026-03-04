import mongoose from 'mongoose';

const actionableSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        description: { type: String, default: '' },
        assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Sevekari' },
        dueDate: { type: Date },
        priority: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
    },
    { _id: true }
);

const meetingSchema = new mongoose.Schema(
    {
        eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
        eventDayId: { type: mongoose.Schema.Types.ObjectId, ref: 'EventDay' },
        meetingType: { type: String, enum: ['pre-event', 'post-event', 'standalone'], required: true },
        title: { type: String, required: true, trim: true },
        date: { type: Date, required: true },
        attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Sevekari' }],
        agenda: { type: String, default: '' },
        discussions: { type: String, default: '' },
        decisions: { type: String, default: '' },
        actionables: [actionableSchema],
        notes: { type: String, default: '' },
    },
    { timestamps: true }
);

meetingSchema.index({ eventId: 1 });

const Meeting = mongoose.model('Meeting', meetingSchema);
export default Meeting;
