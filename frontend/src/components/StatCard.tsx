import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<any>;
  description?: string;
  trend?: {
    value: string | number;
    isPositive: boolean;
  };
  type?: 'default' | 'income' | 'expense';
  delay?: number;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  description,
  trend,
  type = 'default',
  delay = 0,
}) => {
  const getTypeStyles = () => {
    switch (type) {
      case 'income':
        return {
          iconBg: 'bg-income-50 dark:bg-income-500/10 text-income-500',
          hoverBorder: 'hover:border-income-500/30 dark:hover:border-income-500/20',
        };
      case 'expense':
        return {
          iconBg: 'bg-expense-50 dark:bg-expense-500/10 text-expense-500',
          hoverBorder: 'hover:border-expense-500/30 dark:hover:border-expense-500/20',
        };
      default:
        return {
          iconBg: 'bg-brand-50 dark:bg-brand-500/10 text-brand-500',
          hoverBorder: 'hover:border-brand-500/30 dark:hover:border-brand-500/20',
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`glass-panel bg-white/60 dark:bg-darkbg-900/60 rounded-2xl p-5 shadow-premium ${styles.hoverBorder} border border-slate-200/50 dark:border-zinc-800/50 transition-all duration-300`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
          {title}
        </span>
        <div className={`p-2.5 rounded-xl ${styles.iconBg} transition-colors`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-4">
        <h3 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-white font-sans">
          {value}
        </h3>
        
        {(trend || description) && (
          <div className="mt-2.5 flex items-center gap-2">
            {trend && (
              <span
                className={`inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-lg ${
                  trend.isPositive
                    ? 'bg-income-50 dark:bg-income-500/10 text-income-500'
                    : 'bg-expense-50 dark:bg-expense-500/10 text-expense-500'
                }`}
              >
                {trend.isPositive ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : (
                  <ArrowDownRight className="h-3 w-3" />
                )}
                {trend.value}
              </span>
            )}
            {description && (
              <span className="text-xs text-slate-400 dark:text-zinc-500 font-medium">
                {description}
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default StatCard;
