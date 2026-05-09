'use client';
import React, { useState } from 'react';
import dynamic from 'next/dynamic';

const FraudTrendChart = dynamic(() => import('./FraudTrendChart'), { ssr: false });
const LoanCategoryChart = dynamic(() => import('./LoanCategoryChart'), { ssr: false });

export default function OfficerChartsRow() {
  const [activeTab, setActiveTab] = useState<'fraud' | 'category'>('fraud');

  return (
    <div className="card-base p-5 h-full">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
            {activeTab === 'fraud' ? 'Fraud Detection Trend' : 'Loan Category Breakdown'}
          </h3>
          <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
            {activeTab === 'fraud' ? 'Last 30 days · Daily fraud alerts vs verified' : 'Approval rates by scheme category'}
          </p>
        </div>
        <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'var(--muted)' }}>
          {(['fraud', 'category'] as const).map((tab) => (
            <button
              key={`chart-tab-${tab}`}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                activeTab === tab ? 'bg-card shadow-card text-foreground' : 'text-muted-foreground'
              }`}
            >
              {tab === 'fraud' ? 'Fraud Trend' : 'By Category'}
            </button>
          ))}
        </div>
      </div>
      {activeTab === 'fraud' ? <FraudTrendChart /> : <LoanCategoryChart />}
    </div>
  );
}