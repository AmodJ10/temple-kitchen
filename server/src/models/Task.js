import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
    {
        eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
        title: { type: String, required: true, trim: true },
        description: { type: String, default: '' },
        howTo: { type: String, default: '' },
        assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Sevekari' },
        assignedToName: { type: String, default: '' },
        dueDate: { type: Date },
        priority: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
        status: { type: String, enum: ['todo', 'in-progress', 'done', 'cancelled'], default: 'todo' },
        source: { type: String, enum: ['meeting', 'manual'], default: 'manual' },
        meetingActionableRef: { type: String, default: '' },
        order: { type: Number, default: 0 },
    },
    { timestamps: true }
);

taskSchema.index({ eventId: 1, status: 1, priority: -1 });

const Task = mongoose.model('Task', taskSchema);
export default Task;
