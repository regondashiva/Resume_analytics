import React from 'react';
import { motion } from 'framer-motion';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number;
  color: 'blue' | 'purple' | 'pink' | 'green';
}

const colorMap = {
  blue: 'from-blue-500 to-blue-600',
  purple: 'from-purple-500 to-purple-600',
  pink: 'from-pink-500 to-pink-600',
  green: 'from-green-500 to-green-600',
};

export default function KPICard({ title, value, icon, trend, color }: KPICardProps) {
  return (
    <motion.div
      className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all"
      whileHover={{ y: -4 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
            {title}
          </p>
          <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
            {value}
          </h3>
          {trend !== undefined && (
            <p className={`text-sm mt-2 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend > 0 ? '+' : ''}{trend}% from last month
            </p>
          )}
        </div>
        <div className={`bg-gradient-to-br ${colorMap[color]} p-3 rounded-xl`}>
          <div className="text-white">{icon}</div>
        </div>
      </div>
    </motion.div>
  );
}
