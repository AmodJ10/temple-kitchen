import { config } from 'dotenv';
config(); // Load env vars FIRST

import { createServer } from 'http';
import mongoose from 'mongoose';
import app from './app.js';
import connectDB from './config/db.js';
import { configureCloudinary } from './config/cloudinary.js';
import { initSocket } from './config/socket.js';

// ─── Validate Environment Variables ──────────────────────────────
const requiredEnvVars = ['MONGODB_URI', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'];
for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        console.error(`❌ Missing required environment variable: ${envVar}`);
        process.exit(1);
    }
}

const PORT = process.env.PORT || 5000;
let httpServer;

const startServer = async () => {
    try {
        await connectDB();
        configureCloudinary();

        httpServer = createServer(app);
        initSocket(httpServer);

        httpServer.listen(PORT, () => {
            console.log(`🚀 MSM Kitchen Server running on port ${PORT}`);
            console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

// ─── Crash Prevention ────────────────────────────────────────────
process.on('uncaughtException', (error) => {
    console.error('💥 Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason) => {
    console.error('💥 Unhandled Rejection:', reason);
    process.exit(1);
});

// ─── Graceful Shutdown ───────────────────────────────────────────
const gracefulShutdown = async (signal) => {
    console.log(`\n${signal} received. Shutting down gracefully...`);
    if (httpServer) {
        httpServer.close(() => console.log('HTTP server closed.'));
    }
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
    process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

startServer();
