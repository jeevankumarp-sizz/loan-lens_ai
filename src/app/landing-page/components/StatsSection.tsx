import React from 'react';

const stats = [
  { value: '2.4L+', label: 'Beneficiaries Verified', suffix: '' },
  { value: '₹8,200Cr', label: 'Loan Amount Monitored', suffix: '' },
  { value: '94.7%', label: 'AI Detection Accuracy', suffix: '' },
  { value: '3,800+', label: 'Fraud Cases Prevented', suffix: '' },
  { value: '120+', label: 'Government Schemes', suffix: '' },
  { value: '18 States', label: 'Active Coverage', suffix: '' },
];

export default function StatsSection() {
  return (
    <section className="py-12 border-y" style={{ borderColor: 'var(--border)', background: 'var(--card)' }}>
      <div className="max-w-screen-xl mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {stats?.map((stat) => (
            <div key={`stat-${stat?.label}`} className="text-center">
              <p className="text-2xl font-extrabold tabular-nums text-gradient-primary">
                {stat?.value}
              </p>
              <p className="text-xs mt-1 font-medium" style={{ color: 'var(--muted-foreground)' }}>
                {stat?.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}