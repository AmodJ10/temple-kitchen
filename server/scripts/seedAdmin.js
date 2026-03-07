import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns';

dns.setServers(['8.8.8.8', '8.8.4.4']);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['engineer', 'admin', 'user'], default: 'user' },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to DB');

        const passwordHash = await bcrypt.hash('admin123', 12);

        // Seed admin user
        await User.findOneAndUpdate(
            { email: 'admin@temple.org' },
            { name: 'System Admin', email: 'admin@temple.org', passwordHash, role: 'admin' },
            { upsert: true, new: true }
        );
        console.log('✅ Admin user created/updated: admin@temple.org / admin123');

        // Seed engineer user
        await User.findOneAndUpdate(
            { email: 'engineer@msm.org' },
            { name: 'Lead Engineer', email: 'engineer@msm.org', passwordHash, role: 'engineer' },
            { upsert: true, new: true }
        );
        console.log('✅ Engineer user created/updated: engineer@msm.org / admin123');

    } catch (error) {
        console.error('❌ Error seeding:', error);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
};

seedAdmin();
