'use client';
import React from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';

const confidenceBands = [
  { band: '95–100%', count: 4820, color: '#059669' },
  { band: '90–95%', count: 3640, color: '#10B981' },
  { band: '80–90%', count: 2180, color: '#F59E0B' },
  { band: '70–80%', count: 980, color: '#F97316' },
  { band: '<70%', count: 342, color: '#EF4444' },
];

const assetAccuracy = [
  { asset: 'Tractor', accuracy: 97 },
  { asset: 'Housing', accuracy: 94 },
  { asset: 'Livestock', accuracy: 91 },
  { asset: 'Pump', accuracy: 96 },
  { asset: 'Solar', accuracy: 93 },
  { asset: 'Vehicle', accuracy: 89 },
];

interface TooltipPayload { name: string; value: number; }
interface CustomTooltipProps { active?: boolean; payload?: TooltipPayload[]; label?: string; }

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="card-base shadow-card-hover p-3">
      <p className="text-xs font-semibold mb-1" style={{ color: 'var(--foreground)' }}>{label}</p>
      <p className="text-sm font-bold tabular-nums" style={{ color: 'var(--primary)' }}>{payload[0].value.toLocaleString()}</p>
    </div>
  );
}

export default function AIConfidenceChart() {
  return (
    <div className="space-y-5">
      {/* Confidence band bars */}
      <div>
        <p className="text-[10px] font-semibold mb-3" style={{ color: 'var(--muted-foreground)' }}>CONFIDENCE SCORE DISTRIBUTION</p>
        <div className="space-y-2">
          {confidenceBands.map((b) => {
            const pct = (b.count / 11962) * 100;
            return (
              <div key={b.band} className="flex items-center gap-2">
                <span className="text-[10px] w-16 shrink-0 tabular-nums" style={{ color: 'var(--muted-foreground)' }}>{b.band}</span>
                <div className="flex-1 h-4 rounded-full overflow-hidden" style={{ background: 'var(--muted)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, background: b.color }}
                  />
                </div>
                <span className="text-[10px] w-10 text-right tabular-nums font-semibold" style={{ color: b.color }}>
                  {b.count.toLocaleString()}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Asset accuracy radar */}
      <div>
        <p className="text-[10px] font-semibold mb-2" style={{ color: 'var(--muted-foreground)' }}>ACCURACY BY ASSET TYPE (%)</p>
        <ResponsiveContainer width="100%" height={160}>
          <RadarChart data={assetAccuracy} margin={{ top: 0, right: 10, bottom: 0, left: 10 }}>
            <PolarGrid stroke="var(--border)" />
            <PolarAngleAxis dataKey="asset" tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }} />
            <Radar name="Accuracy" dataKey="accuracy" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.15} strokeWidth={2} />
            <Tooltip
              formatter={(value: number) => [`${value}%`, 'Accuracy']}
              contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', fontSize: '11px' }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
