import mongoose from 'mongoose';

const ingredientSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        quantity: { type: Number, default: 0 },
        unit: { type: String, default: '' },
    },
    { _id: false }
);

const dishSchema = new mongoose.Schema(
    {
        eventDayId: { type: mongoose.Schema.Types.ObjectId, ref: 'EventDay', required: true },
        eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
        order: { type: Number, default: 0 },
        name: { type: String, required: true, trim: true },
        type: { type: String, enum: ['breakfast', 'lunch', 'dinner', 'beverage', 'snack'], required: true },
        headcount: { type: Number, default: 0 },
        ingredients: [ingredientSchema],
        totalYield: {
            amount: { type: Number, default: 0 },
            unit: { type: String, default: '' },
        },
        leftover: {
            amount: { type: Number, default: 0 },
            unit: { type: String, default: '' },
        },
        notes: { type: String, default: '' },
    },
    { timestamps: true }
);

dishSchema.index({ eventId: 1 });
dishSchema.index({ eventDayId: 1, order: 1 });

const Dish = mongoose.model('Dish', dishSchema);
export default Dish;
