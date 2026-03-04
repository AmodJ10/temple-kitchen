import mongoose from 'mongoose';

const sevekariSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        phone: { type: String, default: '' },
        email: { type: String, default: '', lowercase: true, trim: true },
        address: { type: String, default: '' },
        joinDate: { type: Date, default: Date.now },
        isActive: { type: Boolean, default: true },
        photoUrl: { type: String, default: '' },
        notes: { type: String, default: '' },
    },
    { timestamps: true }
);

sevekariSchema.index({ name: 'text' });
sevekariSchema.index({ isActive: 1 });

const Sevekari = mongoose.model('Sevekari', sevekariSchema);
export default Sevekari;
