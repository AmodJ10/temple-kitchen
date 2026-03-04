import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff } from 'lucide-react';
import useOnlineStatus from '../../hooks/useOnlineStatus';

/**
 * A slim banner that slides down from the top when the browser goes offline.
 * Automatically disappears when connectivity is restored.
 */
const OfflineBanner = () => {
    const isOnline = useOnlineStatus();

    return (
        <AnimatePresence>
            {!isOnline && (
                <motion.div
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -50, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="fixed top-0 left-0 right-0 z-[999] bg-red-600 text-white text-center py-2 px-4 text-sm font-medium flex items-center justify-center gap-2 shadow-lg"
                >
                    <WifiOff size={16} />
                    You are offline. Some features may be unavailable.
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default OfflineBanner;
