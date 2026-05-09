import React from 'react';
import { CreditCard, MapPin, CheckCircle } from 'lucide-react';

export default function BeneficiaryHeader() {
  return (
    <div className="card-base p-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold text-white shrink-0"
            style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}
          >
            PD
          </div>
          <div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>
              Priya Devi Sharma
            </h1>
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              Beneficiary ID: BEN-2026-04821 · Nashik District, Maharashtra
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <div
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border"
            style={{ background: 'var(--muted)', borderColor: 'var(--border)' }}
          >
            <CreditCard size={16} style={{ color: 'var(--primary)' }} />
            <div>
              <p className="text-[10px] font-semibold" style={{ color: 'var(--muted-foreground)' }}>LOAN ID</p>
              <p className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>KCC-2841</p>
            </div>
          </div>
          <div
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border"
            style={{ background: 'var(--muted)', borderColor: 'var(--border)' }}
          >
            <CreditCard size={16} style={{ color: 'var(--accent)' }} />
            <div>
              <p className="text-[10px] font-semibold" style={{ color: 'var(--muted-foreground)' }}>LOAN AMOUNT</p>
              <p className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>₹4,20,000</p>
            </div>
          </div>
          <div
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border"
            style={{ background: 'var(--muted)', borderColor: 'var(--border)' }}
          >
            <MapPin size={16} style={{ color: 'var(--warning)' }} />
            <div>
              <p className="text-[10px] font-semibold" style={{ color: 'var(--muted-foreground)' }}>SCHEME</p>
              <p className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>KCC 2025–26</p>
            </div>
          </div>
          <div
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border"
            style={{ background: 'rgba(16,185,129,0.06)', borderColor: 'rgba(16,185,129,0.2)' }}
          >
            <CheckCircle size={16} style={{ color: 'var(--accent)' }} />
            <div>
              <p className="text-[10px] font-semibold" style={{ color: 'var(--muted-foreground)' }}>STATUS</p>
              <p className="text-sm font-bold" style={{ color: 'var(--accent)' }}>Active</p>
            </div>
          </div>
        </div>
      </div>
      {/* Progress bar */}
      <div className="mt-5">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>Verification Progress</p>
          <p className="text-xs font-semibold" style={{ color: 'var(--accent)' }}>2 of 3 milestones verified</p>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: '66%', background: 'linear-gradient(90deg, var(--primary), var(--accent))' }}
          />
        </div>
        <div className="flex justify-between mt-1.5">
          {['Loan Disbursed', 'Asset Purchase', 'Final Verification']?.map((step, i) => (
            <p key={`progress-${step}`} className="text-[10px]" style={{ color: i < 2 ? 'var(--accent)' : 'var(--muted-foreground)' }}>
              {i < 2 ? '✓ ' : ''}{step}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}