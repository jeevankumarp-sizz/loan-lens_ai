'use client';
import React from 'react';
import {
  ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

const data30D = [
  { date: '08 Apr', verified: 38, fraudAlerts: 4, flagged: 7 },
  { date: '10 Apr', verified: 45, fraudAlerts: 2, flagged: 5 },
  { date: '12 Apr', verified: 52, fraudAlerts: 6, flagged: 9 },
  { date: '14 Apr', verified: 41, fraudAlerts: 8, flagged: 12 },
  { date: '16 Apr', verified: 60, fraudAlerts: 3, flagged: 6 },
  { date: '18 Apr', verified: 55, fraudAlerts: 5, flagged: 8 },
  { date: '20 Apr', verified: 48, fraudAlerts: 9, flagged: 14 },
  { date: '22 Apr', verified: 63, fraudAlerts: 2, flagged: 4 },
  { date: '24 Apr', verified: 71, fraudAlerts: 4, flagged: 7 },
  { date: '26 Apr', verified: 58, fraudAlerts: 3, flagged: 5 },
  { date: '28 Apr', verified: 66, fraudAlerts: 7, flagged: 11 },
  { date: '30 Apr', verified: 74, fraudAlerts: 1, flagged: 3 },
  { date: '02 May', verified: 69, fraudAlerts: 5, flagged: 8 },
  { date: '04 May', verified: 82, fraudAlerts: 3, flagged: 6 },
  { date: '06 May', verified: 77, fraudAlerts: 6, flagged: 10 },
  { date: '08 May', verified: 85, fraudAlerts: 4, flagged: 7 },
];

const data7D = data30D.slice(-7);
const data90D = [
  ...data30D,
  { date: '10 May', verified: 90, fraudAlerts: 3, flagged: 5 },
  { date: '15 May', verified: 95, fraudAlerts: 5, flagged: 8 },
  { date: '20 May', verified: 88, fraudAlerts: 7, flagged: 11 },
  { date: '25 May', verified: 102, fraudAlerts: 2, flagged: 4 },
  { date: '30 May', verified: 110, fraudAlerts: 4, flagged: 6 },
  { date: '05 Jun', verified: 98, fraudAlerts: 6, flagged: 9 },
];

interface TooltipPayload { name: string; value: number; color: string; }
interface CustomTooltipProps { active?: boolean; payload?: TooltipPayload[]; label?: string; }

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="card-base shadow-card-hover p-3 min-w-[170px]">
      <p className="text-xs font-semibold mb-2" style={{ color: 'var(--foreground)' }}>{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center justify-between gap-4 text-xs mb-1">
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

interface Props { range: string; }

export default function FraudTrendsChart({ range }: Props) {
  const chartData = range === '7D' ? data7D : range === '90D' ? data90D : data30D;

  return (
    <ResponsiveContainer width="100%" height={260}>
      <ComposedChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="gradVerifiedFull" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.18} />
            <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gradFraudFull" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--destructive)" stopOpacity={0.18} />
            <stop offset="95%" stopColor="var(--destructive)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
        <YAxis tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: '11px', color: 'var(--muted-foreground)', paddingTop: '8px' }} />
        <Area type="monotone" dataKey="verified" name="Verified" stroke="var(--accent)" strokeWidth={2} fill="url(#gradVerifiedFull)" />
        <Area type="monotone" dataKey="fraudAlerts" name="Fraud Alerts" stroke="var(--destructive)" strokeWidth={2} fill="url(#gradFraudFull)" />
        <Line type="monotone" dataKey="flagged" name="Flagged" stroke="var(--warning)" strokeWidth={2} dot={false} strokeDasharray="4 2" />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
