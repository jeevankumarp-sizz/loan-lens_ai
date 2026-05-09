'use client';
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const data = [
  { name: 'Approved', value: 91.3, color: 'var(--accent)' },
  { name: 'Rejected', value: 5.4, color: 'var(--destructive)' },
  { name: 'Pending', value: 3.3, color: 'var(--warning)' },
];

const monthlyData = [
  { month: 'Jan', rate: 88.2 },
  { month: 'Feb', rate: 89.5 },
  { month: 'Mar', rate: 90.1 },
  { month: 'Apr', rate: 91.3 },
  { month: 'May', rate: 91.8 },
];

interface TooltipPayload { name: string; value: number; }
interface CustomTooltipProps { active?: boolean; payload?: TooltipPayload[]; }

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="card-base shadow-card-hover p-3">
      <p className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>{payload[0].name}</p>
      <p className="text-sm font-bold tabular-nums mt-0.5" style={{ color: 'var(--foreground)' }}>{payload[0].value}%</p>
    </div>
  );
}

export default function ApprovalRatesChart() {
  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={52}
            outerRadius={80}
            paddingAngle={3}
            dataKey="value"
            strokeWidth={0}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend + Stats */}
      <div className="space-y-2">
        {data.map((item) => (
          <div key={item.name} className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-xs" style={{ color: 'var(--muted-foreground)' }}>
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: item.color }} />
              {item.name}
            </span>
            <span className="text-xs font-bold tabular-nums" style={{ color: 'var(--foreground)' }}>{item.value}%</span>
          </div>
        ))}
      </div>

      {/* Trend mini */}
      <div className="pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
        <p className="text-[10px] font-semibold mb-2" style={{ color: 'var(--muted-foreground)' }}>MONTHLY APPROVAL TREND</p>
        <div className="flex items-end gap-1.5 h-10">
          {monthlyData.map((d) => (
            <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full rounded-t-sm transition-all duration-300"
                style={{
                  height: `${((d.rate - 86) / 6) * 100}%`,
                  minHeight: '4px',
                  background: 'var(--primary)',
                  opacity: d.month === 'May' ? 1 : 0.45,
                }}
              />
              <span className="text-[9px]" style={{ color: 'var(--muted-foreground)' }}>{d.month}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
