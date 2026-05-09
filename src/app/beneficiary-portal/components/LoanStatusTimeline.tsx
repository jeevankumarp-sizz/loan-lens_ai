import React from 'react';
import { CheckCircle, Clock, Circle, CreditCard, Upload, ShieldCheck, BadgeCheck } from 'lucide-react';

const timelineEvents = [
  {
    id: 'event-001',
    icon: CreditCard,
    title: 'Loan Sanctioned',
    detail: 'KCC loan of ₹4,20,000 approved by Canara Bank Nashik',
    date: '12 Mar 2026',
    status: 'done' as const,
  },
  {
    id: 'event-002',
    icon: CreditCard,
    title: 'Amount Disbursed',
    detail: '₹4,20,000 credited to account ending 8821',
    date: '15 Mar 2026',
    status: 'done' as const,
  },
  {
    id: 'event-003',
    icon: Upload,
    title: 'Milestone 1 Upload',
    detail: 'Tractor booking receipt uploaded and verified',
    date: '22 Mar 2026',
    status: 'done' as const,
  },
  {
    id: 'event-004',
    icon: ShieldCheck,
    title: 'Milestone 2 Verified',
    detail: 'Tractor delivery confirmed — AI confidence 94%',
    date: '10 Apr 2026',
    status: 'done' as const,
  },
  {
    id: 'event-005',
    icon: Upload,
    title: 'Milestone 3 Submitted',
    detail: 'Final asset proof uploaded — awaiting officer review',
    date: '08 May 2026',
    status: 'current' as const,
  },
  {
    id: 'event-006',
    icon: BadgeCheck,
    title: 'Final Verification',
    detail: 'Officer review and loan closure confirmation',
    date: 'Pending',
    status: 'upcoming' as const,
  },
];

export default function LoanStatusTimeline() {
  return (
    <div className="card-base p-5 h-full">
      <div className="mb-4">
        <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
          Loan Journey
        </h3>
        <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
          KCC-2841 · Full verification timeline
        </p>
      </div>

      <div className="relative">
        {/* Vertical line */}
        <div
          className="absolute left-4 top-4 bottom-4 w-0.5"
          style={{ background: 'var(--border)' }}
        />

        <div className="space-y-5">
          {timelineEvents.map((event) => {
            const Icon = event.icon;
            return (
              <div key={event.id} className="flex items-start gap-4 relative">
                {/* Icon */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 border-2 ${
                    event.status === 'done'
                      ? 'bg-green-50 border-green-200'
                      : event.status === 'current' ?'bg-blue-50 border-blue-300' :'bg-card border-border'
                  }`}
                >
                  {event.status === 'done' ? (
                    <CheckCircle size={14} style={{ color: 'var(--accent)' }} />
                  ) : event.status === 'current' ? (
                    <Clock size={14} style={{ color: 'var(--primary)' }} />
                  ) : (
                    <Circle size={14} style={{ color: 'var(--muted-foreground)' }} />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pb-1">
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className={`text-xs font-semibold ${
                        event.status === 'upcoming' ? 'opacity-50' : ''
                      }`}
                      style={{ color: event.status === 'current' ? 'var(--primary)' : 'var(--foreground)' }}
                    >
                      {event.title}
                    </p>
                    <span
                      className={`text-[10px] shrink-0 ${event.status === 'upcoming' ? 'opacity-50' : ''}`}
                      style={{ color: 'var(--muted-foreground)' }}
                    >
                      {event.date}
                    </span>
                  </div>
                  <p
                    className={`text-[11px] mt-0.5 leading-relaxed ${event.status === 'upcoming' ? 'opacity-50' : ''}`}
                    style={{ color: 'var(--muted-foreground)' }}
                  >
                    {event.detail}
                  </p>
                  {event.status === 'current' && (
                    <span
                      className="inline-flex items-center gap-1 text-[10px] font-semibold mt-1 px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(37,99,235,0.08)', color: 'var(--primary)' }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-slow" />
                      In Progress
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}