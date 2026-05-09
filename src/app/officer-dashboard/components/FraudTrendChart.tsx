'use client';
import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const data = [
  { date: '08 Apr', verified: 38, fraudAlerts: 2, pending: 5 },
  { date: '10 Apr', verified: 45, fraudAlerts: 1, pending: 8 },
  { date: '12 Apr', verified: 52, fraudAlerts: 3, pending: 6 },
  { date: '14 Apr', verified: 41, fraudAlerts: 5, pending: 9 },
  { date: '16 Apr', verified: 60, fraudAlerts: 2, pending: 7 },
  { date: '18 Apr', verified: 55, fraudAlerts: 4, pending: 11 },
  { date: '20 Apr', verified: 48, fraudAlerts: 6, pending: 4 },
  { date: '22 Apr', verified: 63, fraudAlerts: 1, pending: 8 },
  { date: '24 Apr', verified: 71, fraudAlerts: 3, pending: 6 },
  { date: '26 Apr', verified: 58, fraudAlerts: 2, pending: 10 },
  { date: '28 Apr', verified: 66, fraudAlerts: 4, pending: 5 },
  { date: '30 Apr', verified: 74, fraudAlerts: 1, pending: 7 },
  { date: '02 May', verified: 69, fraudAlerts: 3, pending: 9 },
  { date: '04 May', verified: 82, fraudAlerts: 2, pending: 6 },
  { date: '06 May', verified: 77, fraudAlerts: 5, pending: 8 },
  { date: '08 May', verified: 85, fraudAlerts: 6, pending: 12 },
];

interface TooltipPayload {
  name: string;
  value: number;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="card-base shadow-card-hover p-3 min-w-[160px]">
      <p className="text-xs font-semibold mb-2" style={{ color: 'var(--foreground)' }}>{label}</p>
      {payload.map((p) => (
        <div key={`tooltip-${p.name}`} className="flex items-center justify-between gap-4 text-xs mb-1">
          <span className="flex items-center gap-1.5" style={{ color: 'var(--muted-foreground)' }}>
            <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            {p.name}
          </span>
          <span className="font-semibold tabular-nums" style={{ color: 'var(--foreground)' }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function FraudTrendChart() {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="gradVerified" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.2} />
            <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gradFraud" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--destructive)" stopOpacity={0.2} />
            <stop offset="95%" stopColor="var(--destructive)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
          axisLine={false}
          tickLine={false}
          interval={3}
        />
        <YAxis
          tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: '11px', color: 'var(--muted-foreground)', paddingTop: '8px' }}
        />
        <Area
          type="monotone"
          dataKey="verified"
          name="Verified"
          stroke="var(--accent)"
          strokeWidth={2}
          fill="url(#gradVerified)"
        />
        <Area
          type="monotone"
          dataKey="fraudAlerts"
          name="Fraud Alerts"
          stroke="var(--destructive)"
          strokeWidth={2}
          fill="url(#gradFraud)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}