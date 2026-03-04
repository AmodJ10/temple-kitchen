import mongoose from 'mongoose';
import dns from 'dns';

// Use Google DNS to resolve MongoDB Atlas SRV records
dns.setServers(['8.8.8.8', '8.8.4.4']);

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3000;

const connectDB = async () => {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        console.error('MONGODB_URI is not defined in environment variables');
        process.exit(1);
    }

    const options = {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
    };

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            const conn = await mongoose.connect(uri, options);
            console.log(`✅ MongoDB connected: ${conn.connection.host}`);
            return conn;
        } catch (error) {
            console.error(`❌ MongoDB connection attempt ${attempt}/${MAX_RETRIES} failed:`, error.message);
            if (attempt === MAX_RETRIES) {
                console.error('All MongoDB connection attempts failed. Exiting.');
                process.exit(1);
            }
            const delay = RETRY_DELAY_MS * Math.pow(2, attempt - 1);
            console.log(`Retrying in ${delay / 1000}s...`);
            await new Promise((resolve) => setTimeout(resolve, delay));
        }
    }
};
export default connectDB;
