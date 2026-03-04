import { io } from 'socket.io-client';

// With Vite proxy handling /socket.io, we connect to the same origin.
// In production, set VITE_SOCKET_URL to the actual server URL.
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || '';

/**
 * Singleton Socket.io client instance with auto-reconnect.
 * Reconnects with exponential backoff up to 10s.
 */
let socket = null;

export const getSocket = () => {
    if (!socket) {
        socket = io(SOCKET_URL, {
            withCredentials: true,
            autoConnect: false,
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 10000,
            transports: ['websocket', 'polling'],
        });

        socket.on('connect', () => {
            console.log('🔌 Socket connected:', socket.id);
        });

        socket.on('disconnect', (reason) => {
            console.log('🔌 Socket disconnected:', reason);
        });

        socket.on('connect_error', (err) => {
            console.warn('Socket connection error:', err.message);
        });
    }
    return socket;
};

/**
 * Connect the socket (call once on app init after auth).
 */
export const connectSocket = () => {
    const s = getSocket();
    if (!s.connected) {
        s.connect();
    }
};

/**
 * Disconnect the socket (call on logout).
 */
export const disconnectSocket = () => {
    if (socket?.connected) {
        socket.disconnect();
    }
};

/**
 * Join an event room for real-time updates.
 */
export const joinEventRoom = (eventId) => {
    const s = getSocket();
    if (s.connected) {
        s.emit('join:event', eventId);
    }
};

/**
 * Leave an event room.
 */
export const leaveEventRoom = (eventId) => {
    const s = getSocket();
    if (s.connected) {
        s.emit('leave:event', eventId);
    }
};

export default getSocket;
