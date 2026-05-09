'use client';
import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon: React.ReactNode;
  iconBg?: string;
  alert?: boolean;
  warning?: boolean;
  featured?: boolean;
  className?: string;
}

export default function MetricCard({
  label,
  value,
  subValue,
  trend,
  trendValue,
  icon,
  iconBg = 'bg-primary/10',
  alert = false,
  warning = false,
  featured = false,
  className = '',
}: MetricCardProps) {
  const cardBg = alert
    ? 'bg-red-50 border-red-100'
    : warning
    ? 'bg-amber-50 border-amber-100' :'card-base';

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor =
    trend === 'up' ? 'text-accent' : trend === 'down' ? 'text-destructive' : 'text-muted-foreground';

  return (
    <div
      className={`${cardBg} rounded-2xl border p-5 transition-all duration-200 hover:shadow-card-hover ${
        featured ? 'col-span-2' : ''
      } ${className}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
          {icon}
        </div>
        {trend && trendValue && (
          <div className={`flex items-center gap-1 text-xs font-semibold ${trendColor}`}>
            <TrendIcon size={12} />
            <span>{trendValue}</span>
          </div>
        )}
      </div>
      <div>
        <p
          className={`tabular-nums font-bold mb-1 ${featured ? 'text-4xl' : 'text-2xl'}`}
          style={{ color: alert ? 'var(--destructive)' : warning ? 'var(--warning)' : 'var(--foreground)' }}
        >
          {value}
        </p>
        <p className="text-xs font-500 tracking-wide" style={{ color: 'var(--muted-foreground)' }}>
          {label}
        </p>
        {subValue && (
          <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>
            {subValue}
          </p>
        )}
      </div>
    </div>
  );
}