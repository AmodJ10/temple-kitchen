import mongoose from 'mongoose';

const vendorSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        contactNo: { type: String, default: '' },
        email: { type: String, default: '', lowercase: true, trim: true },
        address: { type: String, default: '' },
        category: { type: String, default: '' },
        notes: { type: String, default: '' },
    },
    { timestamps: true }
);

vendorSchema.index({ name: 'text' });

const Vendor = mongoose.model('Vendor', vendorSchema);
export default Vendor;
