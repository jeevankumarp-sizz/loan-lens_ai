'use client';
import React from 'react';
import { ShieldAlert, Clock } from 'lucide-react';

const alerts = [
  {
    id: 'fraud-alert-001',
    loanId: 'KCC-2847',
    beneficiary: 'Mohan Lal Verma',
    type: 'GPS Mismatch',
    detail: 'Upload location 48km from loan site',
    severity: 'high' as const,
    time: '2 min ago',
    scheme: 'KCC',
    amount: '₹1.5L',
    district: 'Nagpur',
  },
  {
    id: 'fraud-alert-002',
    loanId: 'PMAY-3391',
    beneficiary: 'Savita Devi',
    type: 'Duplicate Image',
    detail: 'Hash match with submission #PMAY-2801',
    severity: 'high' as const,
    time: '14 min ago',
    scheme: 'PMAY-G',
    amount: '₹1.8L',
    district: 'Latur',
  },
  {
    id: 'fraud-alert-003',
    loanId: 'MUDRA-5512',
    beneficiary: 'Rajkumar Patel',
    type: 'Low AI Confidence',
    detail: 'Asset confidence 23% — unrecognized object',
    severity: 'medium' as const,
    time: '31 min ago',
    scheme: 'MUDRA',
    amount: '₹1.2L',
    district: 'Thane',
  },
  {
    id: 'fraud-alert-004',
    loanId: 'KCC-2901',
    beneficiary: 'Anand Sharma',
    type: 'OCR Mismatch',
    detail: 'Invoice amount ₹2.4L vs loan ₹80K',
    severity: 'medium' as const,
    time: '1 hr ago',
    scheme: 'KCC',
    amount: '₹80K',
    district: 'Jalgaon',
  },
  {
    id: 'fraud-alert-005',
    loanId: 'SHG-0814',
    beneficiary: 'Geeta Rani',
    type: 'Timestamp Anomaly',
    detail: 'Photo taken 3 days before loan approval',
    severity: 'medium' as const,
    time: '2 hr ago',
    scheme: 'SHG Loan',
    amount: '₹60K',
    district: 'Solapur',
  },
  {
    id: 'fraud-alert-006',
    loanId: 'PMAY-4102',
    beneficiary: 'Suresh Gupta',
    type: 'GPS Mismatch',
    detail: 'Upload location outside district boundary',
    severity: 'high' as const,
    time: '3 hr ago',
    scheme: 'PMAY-G',
    amount: '₹2.4L',
    district: 'Beed',
  },
];

const severityConfig = {
  high: { bg: 'bg-red-50', border: 'border-red-100', dot: 'bg-destructive', icon: 'text-destructive' },
  medium: { bg: 'bg-amber-50', border: 'border-amber-100', dot: 'bg-warning', icon: 'text-warning' },
};

export default function FraudAlertPanel() {
  return (
    <div className="card-base p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center">
            <ShieldAlert size={16} style={{ color: 'var(--destructive)' }} />
          </div>
          <div>
            <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Fraud Alerts</h3>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>6 active · Requires action</p>
          </div>
        </div>
        <span className="badge-base fraud-high text-xs">6 Active</span>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto">
        {alerts.map((alert) => {
          const config = severityConfig[alert.severity];
          return (
            <div
              key={alert.id}
              className={`rounded-xl border p-3 cursor-pointer hover:shadow-card transition-all duration-150 ${config.bg} ${config.border}`}
            >
              <div className="flex items-start gap-2 flex-1 min-w-0">
                <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${config.dot}`} />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold" style={{ color: 'var(--foreground)' }}>{alert.type}</span>
                    <span className="text-[10px] font-mono" style={{ color: 'var(--muted-foreground)' }}>{alert.loanId}</span>
                  </div>
                  <p className="text-xs truncate mt-0.5" style={{ color: 'var(--secondary-foreground)' }}>
                    {alert.beneficiary}
                  </p>
                  <p className="text-[11px] mt-1 leading-tight" style={{ color: 'var(--muted-foreground)' }}>
                    {alert.detail}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2" style={{ color: 'var(--muted-foreground)' }}>
                <Clock size={10} />
                <span className="text-[10px]">{alert.time}</span>
              </div>
            </div>
          );
        })}
      </div>

      <button className="mt-4 w-full btn-outline text-xs py-2">
        View All Fraud Alerts
      </button>
    </div>
  );
}