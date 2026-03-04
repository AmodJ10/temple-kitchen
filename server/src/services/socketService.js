import { getIO } from '../config/socket.js';

/**
 * Emit a real-time event to all clients in an event room.
 * Safely catches errors so socket failures never crash the server.
 */
export const emitToEvent = (eventId, eventName, data) => {
    try {
        const io = getIO();
        io.to(`event:${eventId}`).emit(eventName, data);
    } catch (error) {
        console.error('Socket emit error (non-fatal):', error.message);
    }
};
