import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  iconColor?: string;
  badge?: {
    text: string;
    type: 'success' | 'warning' | 'info' | 'neutral';
  };
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = 'text-emerald-600',
  badge,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`relative bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:border-slate-300 hover:shadow-md' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-extrabold tracking-tight text-slate-900">{value}</h3>
          </div>
          {subtitle && <p className="text-xs text-slate-500 font-medium">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-xl bg-slate-50 border border-slate-100 shadow-2xs ${iconColor}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {badge && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
              badge.type === 'success'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : badge.type === 'warning'
                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                : badge.type === 'info'
                ? 'bg-sky-50 text-sky-700 border border-sky-200'
                : 'bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            {badge.text}
          </span>
        </div>
      )}
    </div>
  );
};

