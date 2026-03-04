import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
    {
        eventDayId: { type: mongoose.Schema.Types.ObjectId, ref: 'EventDay', required: true },
        eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
        sevekariId: { type: mongoose.Schema.Types.ObjectId, ref: 'Sevekari', required: true },
        sevekariName: { type: String, default: '' },
        role: { type: String, default: '' },
        checkInTime: { type: Date },
        checkOutTime: { type: Date },
        notes: { type: String, default: '' },
    },
    { timestamps: true }
);

attendanceSchema.index({ eventId: 1 });
attendanceSchema.index({ eventDayId: 1, sevekariId: 1 }, { unique: true });
attendanceSchema.index({ sevekariId: 1 });

const Attendance = mongoose.model('Attendance', attendanceSchema);
export default Attendance;
