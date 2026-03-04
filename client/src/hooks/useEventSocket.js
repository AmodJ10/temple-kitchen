import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getSocket, joinEventRoom, leaveEventRoom } from '../utils/socket';

/**
 * Hook that joins an event Socket.io room on mount, leaves on unmount,
 * and invalidates the correct React Query cache keys when real-time
 * events arrive. This ensures the UI stays in sync across all tabs/users
 * without needing manual refreshes.
 *
 * @param {string} eventId - The MongoDB _id of the event to subscribe to
 */
const useEventSocket = (eventId) => {
    const queryClient = useQueryClient();
    const eventIdRef = useRef(eventId);
    eventIdRef.current = eventId;

    useEffect(() => {
        if (!eventId) return;

        const socket = getSocket();

        // Join room
        joinEventRoom(eventId);

        // ─── Real-time event listeners ───────────────────────────
        const handleDishUpdate = () => {
            queryClient.invalidateQueries({ queryKey: ['dishes', eventIdRef.current] });
        };

        const handleProcurementUpdate = () => {
            queryClient.invalidateQueries({ queryKey: ['procurements', eventIdRef.current] });
        };

        const handleAttendanceUpdate = () => {
            queryClient.invalidateQueries({ queryKey: ['attendance', eventIdRef.current] });
        };

        const handleInventoryUpdate = () => {
            queryClient.invalidateQueries({ queryKey: ['inventoryUsed', eventIdRef.current] });
            // Also invalidate master inventory since stock changed
            queryClient.invalidateQueries({ queryKey: ['inventory'] });
        };

        const handleMeetingUpdate = () => {
            queryClient.invalidateQueries({ queryKey: ['meetings', eventIdRef.current] });
        };

        const handleTaskUpdate = () => {
            queryClient.invalidateQueries({ queryKey: ['tasks', eventIdRef.current] });
            // Also invalidate global pending tasks (dashboard)
            queryClient.invalidateQueries({ queryKey: ['tasks', 'pending'] });
        };

        socket.on('dish:updated', handleDishUpdate);
        socket.on('procurement:updated', handleProcurementUpdate);
        socket.on('attendance:updated', handleAttendanceUpdate);
        socket.on('inventory:updated', handleInventoryUpdate);
        socket.on('meeting:updated', handleMeetingUpdate);
        socket.on('task:updated', handleTaskUpdate);

        // ─── Cleanup ─────────────────────────────────────────────
        return () => {
            leaveEventRoom(eventId);
            socket.off('dish:updated', handleDishUpdate);
            socket.off('procurement:updated', handleProcurementUpdate);
            socket.off('attendance:updated', handleAttendanceUpdate);
            socket.off('inventory:updated', handleInventoryUpdate);
            socket.off('meeting:updated', handleMeetingUpdate);
            socket.off('task:updated', handleTaskUpdate);
        };
    }, [eventId, queryClient]);
};

export default useEventSocket;
