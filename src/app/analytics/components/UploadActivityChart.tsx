'use client';
import React from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data30D = [
  { date: '08 Apr', uploads: 48, processed: 44, queue: 4 },
  { date: '10 Apr', uploads: 62, processed: 58, queue: 6 },
  { date: '12 Apr', uploads: 55, processed: 52, queue: 3 },
  { date: '14 Apr', uploads: 71, processed: 65, queue: 8 },
  { date: '16 Apr', uploads: 83, processed: 79, queue: 5 },
  { date: '18 Apr', uploads: 68, processed: 64, queue: 7 },
  { date: '20 Apr', uploads: 92, processed: 87, queue: 9 },
  { date: '22 Apr', uploads: 76, processed: 73, queue: 4 },
  { date: '24 Apr', uploads: 88, processed: 84, queue: 6 },
  { date: '26 Apr', uploads: 95, processed: 91, queue: 5 },
  { date: '28 Apr', uploads: 102, processed: 98, queue: 7 },
  { date: '30 Apr', uploads: 87, processed: 83, queue: 4 },
  { date: '02 May', uploads: 110, processed: 105, queue: 8 },
  { date: '04 May', uploads: 118, processed: 112, queue: 10 },
  { date: '06 May', uploads: 98, processed: 94, queue: 6 },
  { date: '08 May', uploads: 125, processed: 119, queue: 12 },
];

const data7D = data30D.slice(-7);
const data90D = [
  ...data30D,
  { date: '10 May', uploads: 130, processed: 124, queue: 9 },
  { date: '15 May', uploads: 142, processed: 136, queue: 11 },
  { date: '20 May', uploads: 138, processed: 132, queue: 8 },
  { date: '25 May', uploads: 155, processed: 148, queue: 13 },
  { date: '30 May', uploads: 162, processed: 156, queue: 10 },
  { date: '05 Jun', uploads: 148, processed: 142, queue: 9 },
];

interface TooltipPayload { name: string; value: number; color: string; }
interface CustomTooltipProps { active?: boolean; payload?: TooltipPayload[]; label?: string; }

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="card-base shadow-card-hover p-3 min-w-[160px]">
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

export default function UploadActivityChart({ range }: Props) {
  const chartData = range === '7D' ? data7D : range === '90D' ? data90D : data30D;

  return (
    <ResponsiveContainer width="100%" height={240}>
      <ComposedChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
        <YAxis tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: '11px', color: 'var(--muted-foreground)', paddingTop: '8px' }} />
        <Bar dataKey="uploads" name="Total Uploads" fill="var(--primary)" fillOpacity={0.2} radius={[3, 3, 0, 0]} barSize={16} />
        <Bar dataKey="processed" name="AI Processed" fill="var(--accent)" fillOpacity={0.7} radius={[3, 3, 0, 0]} barSize={16} />
        <Line type="monotone" dataKey="queue" name="Queue Depth" stroke="var(--warning)" strokeWidth={2} dot={false} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
