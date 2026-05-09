import React from 'react';
import { CheckCircle, AlertTriangle, Clock, TrendingUp } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';


const rows = [
  { name: 'Priya Devi', loan: 'KCC-2841', asset: 'Tractor', score: 96, status: 'verified' },
  { name: 'Ramesh Yadav', loan: 'PMAY-1192', asset: 'House', score: 88, status: 'pending' },
  { name: 'Sunita Kumari', loan: 'MUDRA-4421', asset: 'Sewing Machine', score: 71, status: 'processing' },
  { name: 'Arjun Singh', loan: 'KCC-3305', asset: 'Pump Set', score: 12, status: 'rejected' },
];

const statusConfig = {
  verified: { label: 'Verified', bg: 'bg-green-50', text: 'text-green-700', icon: CheckCircle },
  pending: { label: 'Pending', bg: 'bg-blue-50', text: 'text-blue-700', icon: Clock },
  processing: { label: 'Processing', bg: 'bg-orange-50', text: 'text-orange-700', icon: TrendingUp },
  rejected: { label: 'Rejected', bg: 'bg-red-50', text: 'text-red-700', icon: AlertTriangle },
};

export default function DashboardPreview() {
  return (
    <div
      className="rounded-2xl border shadow-card-hover overflow-hidden"
      style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
    >
      {/* Header */}
      <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
        <div>
          <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Verification Queue</p>
          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>12 pending · 4 alerts</p>
        </div>
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
        </div>
      </div>

      {/* Mini KPI row */}
      <div className="grid grid-cols-3 border-b" style={{ borderColor: 'var(--border)' }}>
        {[
          { label: 'Verified', value: '1,284', color: 'text-accent' },
          { label: 'Pending', value: '47', color: 'text-primary' },
          { label: 'Fraud Alerts', value: '6', color: 'text-destructive' },
        ].map((kpi) => (
          <div key={`kpi-${kpi.label}`} className="px-4 py-3 text-center border-r last:border-r-0" style={{ borderColor: 'var(--border)' }}>
            <p className={`text-lg font-bold tabular-nums ${kpi.color}`}>{kpi.value}</p>
            <p className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
        {rows.map((row) => {
          const s = statusConfig[row.status as keyof typeof statusConfig];
          const Icon = s.icon;
          return (
            <div
              key={`preview-${row.loan}`}
              className="flex items-center justify-between px-5 py-3 hover:bg-muted/40 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold"
                  style={{ background: 'var(--muted)', color: 'var(--secondary-foreground)' }}
                >
                  {row.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div>
                  <p className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>{row.name}</p>
                  <p className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>{row.loan} · {row.asset}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="text-[10px] font-bold tabular-nums px-1.5 py-0.5 rounded"
                  style={{
                    background: row.score > 70 ? 'var(--muted)' : '#FEF2F2',
                    color: row.score > 70 ? 'var(--foreground)' : 'var(--destructive)',
                  }}
                >
                  {row.score}%
                </span>
                <span className={`flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${s.bg} ${s.text}`}>
                  <Icon size={10} />
                  {s.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}