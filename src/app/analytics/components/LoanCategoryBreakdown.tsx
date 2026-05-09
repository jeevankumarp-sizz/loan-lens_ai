'use client';
import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const schemeData = [
  { scheme: 'KCC', approved: 342, rejected: 18, pending: 24, total: 384 },
  { scheme: 'PMAY-G', approved: 218, rejected: 31, pending: 12, total: 261 },
  { scheme: 'MUDRA', approved: 187, rejected: 9, pending: 19, total: 215 },
  { scheme: 'PM Kisan', approved: 295, rejected: 7, pending: 8, total: 310 },
  { scheme: 'SHG Loan', approved: 124, rejected: 14, pending: 6, total: 144 },
  { scheme: 'NABARD', approved: 65, rejected: 4, pending: 3, total: 72 },
];

const assetData = [
  { scheme: 'Tractor', approved: 198, rejected: 12, pending: 15, total: 225 },
  { scheme: 'Pump Set', approved: 156, rejected: 8, pending: 10, total: 174 },
  { scheme: 'Housing', approved: 218, rejected: 31, pending: 12, total: 261 },
  { scheme: 'Livestock', approved: 142, rejected: 6, pending: 9, total: 157 },
  { scheme: 'Solar', approved: 89, rejected: 4, pending: 7, total: 100 },
  { scheme: 'Vehicle', approved: 76, rejected: 9, pending: 5, total: 90 },
];

interface TooltipPayload { name: string; value: number; color: string; }
interface CustomTooltipProps { active?: boolean; payload?: TooltipPayload[]; label?: string; }

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="card-base shadow-card-hover p-3">
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

export default function LoanCategoryBreakdown() {
  const [view, setView] = useState<'scheme' | 'asset'>('scheme');
  const data = view === 'scheme' ? schemeData : assetData;

  return (
    <div>
      <div className="flex items-center gap-1 mb-4 p-1 rounded-xl border w-fit" style={{ background: 'var(--muted)', borderColor: 'var(--border)' }}>
        {(['scheme', 'asset'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className="px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all duration-150"
            style={{
              background: view === v ? 'var(--card)' : 'transparent',
              color: view === v ? 'var(--primary)' : 'var(--muted-foreground)',
              boxShadow: view === v ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            By {v === 'scheme' ? 'Scheme' : 'Asset Type'}
          </button>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barSize={14} barGap={2}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="scheme" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '11px', color: 'var(--muted-foreground)', paddingTop: '8px' }} />
          <Bar dataKey="approved" name="Approved" radius={[4, 4, 0, 0]} fill="var(--accent)" />
          <Bar dataKey="rejected" name="Rejected" radius={[4, 4, 0, 0]} fill="var(--destructive)" />
          <Bar dataKey="pending" name="Pending" radius={[4, 4, 0, 0]} fill="var(--warning)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
