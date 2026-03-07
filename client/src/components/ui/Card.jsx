import { motion } from 'framer-motion';

const Card = ({ children, className = '', onClick, hoverable = false }) => {
    return (
        <motion.div
            whileHover={hoverable ? { y: -1 } : {}}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            onClick={onClick}
            className={`
                bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)]
                transition-all duration-150 ease-out
                ${hoverable ? 'hover:border-[var(--color-text-muted)]/20' : ''}
                ${onClick ? 'cursor-pointer' : ''}
                ${className}
            `}
        >
            {children}
        </motion.div>
    );
};

export default Card;
