import { Server } from 'socket.io';

let io;

export const initSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: process.env.CLIENT_URL || 'http://localhost:5173',
            methods: ['GET', 'POST'],
            credentials: true,
        },
    });

    const isDev = process.env.NODE_ENV !== 'production';

    io.on('connection', (socket) => {
        if (isDev) console.log(`🔌 Socket connected: ${socket.id}`);

        // Join event room for real-time updates
        socket.on('join:event', (eventId) => {
            socket.join(`event:${eventId}`);
            if (isDev) console.log(`Socket ${socket.id} joined event:${eventId}`);
        });

        socket.on('leave:event', (eventId) => {
            socket.leave(`event:${eventId}`);
        });

        // FIX F2: Handle socket-level errors
        socket.on('error', (err) => {
            console.error(`Socket error on ${socket.id}:`, err.message);
        });

        socket.on('disconnect', () => {
            if (isDev) console.log(`🔌 Socket disconnected: ${socket.id}`);
        });
    });

    // FIX F2: Handle server-level socket errors
    io.engine.on('connection_error', (err) => {
        console.error('Socket.io connection error:', err.message);
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized');
    }
    return io;
};
