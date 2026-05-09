'use client';
import React, { useState } from 'react';
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';

const stateData = [
  { name: 'Uttar Pradesh', verifications: 2840, fraudRate: 3.2, approved: 2650, size: 2840 },
  { name: 'Maharashtra', verifications: 2210, fraudRate: 2.8, approved: 2080, size: 2210 },
  { name: 'Rajasthan', verifications: 1890, fraudRate: 4.1, approved: 1720, size: 1890 },
  { name: 'Bihar', verifications: 1650, fraudRate: 5.6, approved: 1480, size: 1650 },
  { name: 'Madhya Pradesh', verifications: 1420, fraudRate: 3.8, approved: 1310, size: 1420 },
  { name: 'Gujarat', verifications: 1180, fraudRate: 1.9, approved: 1130, size: 1180 },
  { name: 'Tamil Nadu', verifications: 980, fraudRate: 2.1, approved: 940, size: 980 },
  { name: 'Karnataka', verifications: 870, fraudRate: 2.4, approved: 830, size: 870 },
  { name: 'Andhra Pradesh', verifications: 760, fraudRate: 3.5, approved: 710, size: 760 },
  { name: 'Odisha', verifications: 640, fraudRate: 4.8, approved: 580, size: 640 },
  { name: 'Punjab', verifications: 520, fraudRate: 1.6, approved: 505, size: 520 },
  { name: 'Haryana', verifications: 480, fraudRate: 2.2, approved: 460, size: 480 },
  { name: 'Jharkhand', verifications: 390, fraudRate: 5.1, approved: 345, size: 390 },
  { name: 'Chhattisgarh', verifications: 340, fraudRate: 4.3, approved: 305, size: 340 },
  { name: 'Assam', verifications: 290, fraudRate: 3.9, approved: 260, size: 290 },
  { name: 'West Bengal', verifications: 680, fraudRate: 3.1, approved: 625, size: 680 },
];

function getFraudColor(rate: number): string {
  if (rate >= 5) return '#EF4444';
  if (rate >= 4) return '#F97316';
  if (rate >= 3) return '#F59E0B';
  if (rate >= 2) return '#10B981';
  return '#059669';
}

interface CustomContentProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  name?: string;
  verifications?: number;
  fraudRate?: number;
}

function CustomContent({ x = 0, y = 0, width = 0, height = 0, name, verifications, fraudRate }: CustomContentProps) {
  const color = getFraudColor(fraudRate ?? 0);
  const showLabel = width > 60 && height > 40;
  const showSub = width > 80 && height > 60;

  return (
    <g>
      <rect
        x={x + 1}
        y={y + 1}
        width={width - 2}
        height={height - 2}
        rx={6}
        ry={6}
        fill={color}
        fillOpacity={0.15}
        stroke={color}
        strokeWidth={1.5}
        strokeOpacity={0.4}
      />
      {showLabel && (
        <text
          x={x + width / 2}
          y={y + height / 2 - (showSub ? 8 : 0)}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={showSub ? 11 : 9}
          fontWeight={600}
          fill={color}
        >
          {name && name.length > 12 ? name.split(' ')[0] : name}
        </text>
      )}
      {showSub && (
        <text
          x={x + width / 2}
          y={y + height / 2 + 10}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={9}
          fill={color}
          fillOpacity={0.8}
        >
          {verifications?.toLocaleString()} verified
        </text>
      )}
    </g>
  );
}

interface TooltipPayload {
  payload?: {
    name: string;
    verifications: number;
    fraudRate: number;
    approved: number;
  };
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length || !payload[0]?.payload) return null;
  const d = payload[0].payload;
  const color = getFraudColor(d.fraudRate);
  return (
    <div className="card-base shadow-card-hover p-3 min-w-[180px]">
      <p className="text-xs font-bold mb-2" style={{ color: 'var(--foreground)' }}>{d.name}</p>
      <div className="space-y-1 text-xs">
        <div className="flex justify-between gap-4">
          <span style={{ color: 'var(--muted-foreground)' }}>Verifications</span>
          <span className="font-semibold tabular-nums" style={{ color: 'var(--foreground)' }}>{d.verifications.toLocaleString()}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span style={{ color: 'var(--muted-foreground)' }}>Approved</span>
          <span className="font-semibold tabular-nums" style={{ color: 'var(--accent)' }}>{d.approved.toLocaleString()}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span style={{ color: 'var(--muted-foreground)' }}>Fraud Rate</span>
          <span className="font-semibold tabular-nums" style={{ color }}>{d.fraudRate}%</span>
        </div>
      </div>
    </div>
  );
}

export default function GeographicHeatmap() {
  const [sortBy, setSortBy] = useState<'verifications' | 'fraudRate'>('verifications');

  const sorted = [...stateData].sort((a, b) =>
    sortBy === 'verifications' ? b.verifications - a.verifications : b.fraudRate - a.fraudRate
  );

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Sort by:</span>
        {(['verifications', 'fraudRate'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setSortBy(s)}
            className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-150"
            style={{
              background: sortBy === s ? 'var(--primary)' : 'var(--muted)',
              color: sortBy === s ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
            }}
          >
            {s === 'verifications' ? 'Volume' : 'Fraud Rate'}
          </button>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <Treemap
          data={sorted}
          dataKey="size"
          aspectRatio={4 / 3}
          content={<CustomContent />}
        >
          <Tooltip content={<CustomTooltip />} />
        </Treemap>
      </ResponsiveContainer>

      {/* Legend scale */}
      <div className="flex items-center gap-2 mt-3 flex-wrap">
        <span className="text-[10px] font-semibold" style={{ color: 'var(--muted-foreground)' }}>FRAUD RATE:</span>
        {[
          { label: '<2% Low', color: '#059669' },
          { label: '2–3% Moderate', color: '#10B981' },
          { label: '3–4% Elevated', color: '#F59E0B' },
          { label: '4–5% High', color: '#F97316' },
          { label: '>5% Critical', color: '#EF4444' },
        ].map((l) => (
          <span key={l.label} className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--muted-foreground)' }}>
            <span className="w-2.5 h-2.5 rounded-sm" style={{ background: l.color }} />
            {l.label}
          </span>
        ))}
      </div>
    </div>
  );
}
