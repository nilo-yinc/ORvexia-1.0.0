import { motion } from 'framer-motion';
import { Card } from './Card';
import { TrendingUp, TrendingDown } from 'lucide-react';

export const MetricCard = ({ title, value, change, icon: Icon, index = 0 }) => {
  const isPositive = change >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              {title}
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {value}
            </p>
            {change !== undefined && (
              <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {isPositive ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span className="font-medium">
                  {Math.abs(change)}% {isPositive ? 'increase' : 'decrease'}
                </span>
              </div>
            )}
          </div>
          {Icon && (
            <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20">
              <Icon className="w-6 h-6 text-violet-600 dark:text-violet-400" />
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};