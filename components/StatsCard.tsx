
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  className?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({ label, value, icon: Icon, color, className = '' }) => {
  return (
    <div className={`bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center gap-2 ${className}`}>
      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center text-white mb-1`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        <p className="text-xs text-gray-500 font-medium uppercase">{label}</p>
      </div>
    </div>
  );
};