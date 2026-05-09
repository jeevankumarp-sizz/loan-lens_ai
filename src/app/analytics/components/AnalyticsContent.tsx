'use client';
import React, { useState } from 'react';
import { Download, RefreshCw, TrendingUp, TrendingDown, ShieldAlert, CheckCircle2, BarChart2, MapPin } from 'lucide-react';
import FraudTrendsChart from './FraudTrendsChart';
import ApprovalRatesChart from './ApprovalRatesChart';
import LoanCategoryBreakdown from './LoanCategoryBreakdown';
import GeographicHeatmap from './GeographicHeatmap';
import AIConfidenceChart from './AIConfidenceChart';
import UploadActivityChart from './UploadActivityChart';

const kpis = [
  {
    label: 'Total Verifications',
    value: '12,847',
    change: '+18.4%',
    up: true,
    icon: CheckCircle2,
    color: 'var(--accent)',
    bg: 'rgba(16,185,129,0.08)',
  },
  {
    label: 'Fraud Detected',
    value: '342',
    change: '-6.2%',
    up: false,
    icon: ShieldAlert,
    color: 'var(--destructive)',
    bg: 'rgba(239,68,68,0.08)',
  },
  {
    label: 'Approval Rate',
    value: '91.3%',
    change: '+2.1%',
    up: true,
    icon: TrendingUp,
    color: 'var(--primary)',
    bg: 'rgba(37,99,235,0.08)',
  },
  {
    label: 'Avg AI Confidence',
    value: '94.7%',
    change: '+1.3%',
    up: true,
    icon: BarChart2,
    color: '#7C3AED',
    bg: 'rgba(124,58,237,0.08)',
  },
];

const timeRanges = ['7D', '30D', '90D', '1Y'];

export default function AnalyticsContent() {
  const [activeRange, setActiveRange] = useState('30D');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--foreground)' }}>
            Advanced Analytics
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
            Fraud trends, approval rates, loan categories & geographic insights
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          {/* Time Range Selector */}
          <div className="flex items-center gap-1 p-1 rounded-xl border" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
            {timeRanges?.map((r) => (
              <button
                key={r}
                onClick={() => setActiveRange(r)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150"
                style={{
                  background: activeRange === r ? 'var(--primary)' : 'transparent',
                  color: activeRange === r ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
                }}
              >
                {r}
              </button>
            ))}
          </div>
          <button className="btn-outline flex items-center gap-1.5 text-xs px-3 py-2">
            <RefreshCw size={13} />
            Refresh
          </button>
          <button className="btn-primary flex items-center gap-1.5 text-xs px-3 py-2">
            <Download size={13} />
            Export
          </button>
        </div>
      </div>
      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis?.map((kpi) => (
          <div key={kpi?.label} className="card-base p-4 flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: kpi?.bg }}>
              <kpi.icon size={18} style={{ color: kpi?.color }} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium truncate" style={{ color: 'var(--muted-foreground)' }}>{kpi?.label}</p>
              <p className="text-xl font-bold tabular-nums mt-0.5" style={{ color: 'var(--foreground)' }}>{kpi?.value}</p>
              <span
                className="text-xs font-semibold flex items-center gap-0.5 mt-0.5"
                style={{ color: kpi?.up ? 'var(--accent)' : 'var(--destructive)' }}
              >
                {kpi?.up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                {kpi?.change} vs last period
              </span>
            </div>
          </div>
        ))}
      </div>
      {/* Row 1: Fraud Trends + Approval Rates */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="card-base p-5 lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Fraud Detection Trends</h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>Daily fraud alerts vs verified submissions</p>
            </div>
            <span className="badge-base fraud-high text-[10px]">
              <ShieldAlert size={10} /> Live
            </span>
          </div>
          <FraudTrendsChart range={activeRange} />
        </div>
        <div className="card-base p-5 lg:col-span-2">
          <div className="mb-4">
            <h2 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Approval Success Rates</h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>Monthly approval vs rejection breakdown</p>
          </div>
          <ApprovalRatesChart />
        </div>
      </div>
      {/* Row 2: Loan Categories + AI Confidence */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="card-base p-5 lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Loan Category Breakdown</h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>Approved, rejected & pending by scheme</p>
            </div>
          </div>
          <LoanCategoryBreakdown />
        </div>
        <div className="card-base p-5 lg:col-span-2">
          <div className="mb-4">
            <h2 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>AI Confidence Distribution</h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>Score bands across all verifications</p>
          </div>
          <AIConfidenceChart />
        </div>
      </div>
      {/* Row 3: Geographic Heatmap (full width) */}
      <div className="card-base p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold flex items-center gap-1.5" style={{ color: 'var(--foreground)' }}>
              <MapPin size={14} style={{ color: 'var(--primary)' }} />
              Geographic Verification Heatmap
            </h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
              Verification density and fraud concentration by state/region
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--muted-foreground)' }}>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm" style={{ background: 'var(--accent)' }} /> High Activity
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm" style={{ background: 'var(--warning)' }} /> Medium
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm" style={{ background: 'var(--destructive)' }} /> Fraud Zone
            </span>
          </div>
        </div>
        <GeographicHeatmap />
      </div>
      {/* Row 4: Upload Activity */}
      <div className="card-base p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Upload Activity & Processing Volume</h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>Daily uploads, AI processing completions, and queue depth</p>
          </div>
        </div>
        <UploadActivityChart range={activeRange} />
      </div>
    </div>
  );
}
