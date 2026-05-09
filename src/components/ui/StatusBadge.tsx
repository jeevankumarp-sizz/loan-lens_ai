import React from 'react';

type StatusType = 'verified' | 'pending' | 'processing' | 'rejected';
type FraudLevel = 'low' | 'medium' | 'high';

interface StatusBadgeProps {
  status: StatusType;
  size?: 'sm' | 'md';
}

interface FraudBadgeProps {
  level: FraudLevel;
  score?: number;
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config: Record<StatusType, { label: string; className: string; dot: string }> = {
    verified: { label: 'Verified', className: 'status-verified', dot: 'bg-accent' },
    pending: { label: 'Pending Review', className: 'status-pending', dot: 'bg-primary' },
    processing: { label: 'AI Processing', className: 'status-processing', dot: 'bg-warning' },
    rejected: { label: 'Rejected', className: 'status-rejected', dot: 'bg-destructive' },
  };
  const c = config[status];
  return (
    <span
      className={`badge-base ${c.className} ${size === 'sm' ? 'text-[10px] px-2 py-0.5' : ''}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}

export function FraudBadge({ level, score }: FraudBadgeProps) {
  const config: Record<FraudLevel, { label: string; className: string }> = {
    low: { label: 'Low Risk', className: 'fraud-low' },
    medium: { label: 'Medium Risk', className: 'fraud-medium' },
    high: { label: 'High Risk', className: 'fraud-high' },
  };
  const c = config[level];
  return (
    <span className={`badge-base ${c.className}`}>
      {score !== undefined && <span className="font-bold tabular-nums">{score}%</span>}
      {c.label}
    </span>
  );
}

export function GPSBadge({ matched }: { matched: boolean }) {
  return (
    <span className={`badge-base ${matched ? 'status-verified' : 'status-rejected'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${matched ? 'bg-accent' : 'bg-destructive'}`} />
      {matched ? 'GPS Matched' : 'GPS Mismatch'}
    </span>
  );
}