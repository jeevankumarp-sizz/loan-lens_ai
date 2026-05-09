'use client';
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,  } from 'recharts';

const data = [
  { scheme: 'KCC', approved: 342, rejected: 18, pending: 24 },
  { scheme: 'PMAY-G', approved: 218, rejected: 31, pending: 12 },
  { scheme: 'MUDRA', approved: 187, rejected: 9, pending: 19 },
  { scheme: 'PM Kisan', approved: 295, rejected: 7, pending: 8 },
  { scheme: 'SHG Loan', approved: 124, rejected: 14, pending: 6 },
  { scheme: 'NABARD', approved: 65, rejected: 4, pending: 3 },
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
    <div className="card-base shadow-card-hover p-3">
      <p className="text-xs font-semibold mb-2" style={{ color: 'var(--foreground)' }}>{label}</p>
      {payload.map((p) => (
        <div key={`bar-tooltip-${p.name}`} className="flex items-center justify-between gap-4 text-xs mb-1">
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

export default function LoanCategoryChart() {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barSize={12} barGap={2}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis
          dataKey="scheme"
          tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="approved" name="Approved" radius={[4, 4, 0, 0]} fill="var(--accent)" />
        <Bar dataKey="rejected" name="Rejected" radius={[4, 4, 0, 0]} fill="var(--destructive)" />
        <Bar dataKey="pending" name="Pending" radius={[4, 4, 0, 0]} fill="var(--warning)" />
      </BarChart>
    </ResponsiveContainer>
  );
}