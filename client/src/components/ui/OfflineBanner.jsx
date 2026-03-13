import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff } from 'lucide-react';
import useOnlineStatus from '../../hooks/useOnlineStatus';

const OfflineBanner = () => {
    const isOnline = useOnlineStatus();

    return (
        <AnimatePresence>
            {!isOnline && (
                <motion.div
                    initial={{ y: -40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -40, opacity: 0 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="fixed top-0 left-0 right-0 z-[999] bg-red-500/90 backdrop-blur-sm text-white text-center py-2 px-4 text-xs font-medium flex items-center justify-center gap-2"
                >
                    <WifiOff size={14} />
                    You are offline. Some features may be unavailable.
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default OfflineBanner;
