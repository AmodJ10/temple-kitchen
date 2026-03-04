import { motion } from 'framer-motion';

const Card = ({ children, className = '', onClick, hoverable = false }) => {
    return (
        <motion.div
            whileHover={hoverable ? { y: -2, boxShadow: '0 8px 24px var(--color-shadow)' } : {}}
            transition={{ duration: 0.2 }}
            onClick={onClick}
            className={`
        bg-[var(--color-bg-card)] rounded-2xl border border-[var(--color-border)]
        shadow-card transition-shadow duration-200
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
        >
            {children}
        </motion.div>
    );
};

export default Card;
