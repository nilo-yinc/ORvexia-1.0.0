import { motion } from 'framer-motion';

export const Card = ({ children, className = '', hover = true, glass = false }) => {
  const baseClass = glass ? 'glass-card' : 'bg-white dark:bg-gray-900 rounded-2xl shadow-lg';
  const hoverClass = hover ? 'hover:shadow-2xl hover:-translate-y-1' : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`${baseClass} ${hoverClass} transition-all duration-300 ${className}`}
    >
      {children}
    </motion.div>
  );
};

export const GlassCard = ({ children, className = '' }) => {
  return <Card glass={true} className={className}>{children}</Card>;
};