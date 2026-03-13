import { io } from 'socket.io-client';

const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1', '::1']);

const resolveDevServerUrl = (configuredUrl) => {
    if (!configuredUrl || !import.meta.env.DEV) {
        return configuredUrl || '';
    }

    try {
        const parsedUrl = new URL(configuredUrl, globalThis.location?.origin);
        const currentHostname = globalThis.location?.hostname;

        if (LOCAL_HOSTNAMES.has(parsedUrl.hostname) && LOCAL_HOSTNAMES.has(currentHostname || '')) {
            return '';
        }

        return parsedUrl.origin;
    } catch {
        return configuredUrl;
    }
};

// In development, prefer Vite's same-origin proxy to avoid cross-origin
// websocket/cookie issues even if localhost backend URLs are present in .env.
const SOCKET_URL = resolveDevServerUrl(import.meta.env.VITE_SOCKET_URL?.trim());

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
