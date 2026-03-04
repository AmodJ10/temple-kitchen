import { useState, useEffect } from 'react';

/**
 * Hook that tracks browser online/offline status.
 * Returns true when the browser is online, false when offline.
 */
const useOnlineStatus = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const goOnline = () => setIsOnline(true);
        const goOffline = () => setIsOnline(false);

        window.addEventListener('online', goOnline);
        window.addEventListener('offline', goOffline);

        return () => {
            window.removeEventListener('online', goOnline);
            window.removeEventListener('offline', goOffline);
        };
    }, []);

    return isOnline;
};

export default useOnlineStatus;
