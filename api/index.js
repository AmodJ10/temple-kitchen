// Vercel Serverless Function — wraps the Express app
// Environment variables come from Vercel dashboard (no .env file needed)

import app from '../server/src/app.js';
import connectDB from '../server/src/config/db.js';
import { configureCloudinary } from '../server/src/config/cloudinary.js';

let isConnected = false;

export default async function handler(req, res) {
    if (!isConnected) {
        try {
            await connectDB();
            configureCloudinary();
            isConnected = true;
        } catch (error) {
            console.error('DB connection error:', error);
            return res.status(500).json({ success: false, message: 'Server initialization failed' });
        }
    }
    return app(req, res);
}
