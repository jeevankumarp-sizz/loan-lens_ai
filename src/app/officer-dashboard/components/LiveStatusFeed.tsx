'use client';
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Clock, XCircle, Activity, Wifi, WifiOff, TrendingUp } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';


type StatusType = 'pending' | 'verified' | 'rejected';

interface StatusEvent {
  id: string;
  loanId: string;
  beneficiary: string;
  fromStatus: StatusType;
  toStatus: StatusType;
  district: string;
  scheme: string;
  timestamp: string;
  amount: string;
}

const SIMULATED_EVENTS: Omit<StatusEvent, 'timestamp' | 'id'>[] = [
  { loanId: 'KCC-2841', beneficiary: 'Priya Devi Sharma', fromStatus: 'pending', toStatus: 'verified', district: 'Nashik', scheme: 'KCC', amount: '₹4.2L' },
  { loanId: 'PMAY-1192', beneficiary: 'Ramesh Yadav', fromStatus: 'pending', toStatus: 'verified', district: 'Pune', scheme: 'PMAY-G', amount: '₹2.8L' },
  { loanId: 'KCC-3305', beneficiary: 'Arjun Singh Chauhan', fromStatus: 'pending', toStatus: 'rejected', district: 'Nagpur', scheme: 'KCC', amount: '₹1.5L' },
  { loanId: 'PMAY-3391', beneficiary: 'Vikram Rathore', fromStatus: 'pending', toStatus: 'rejected', district: 'Latur', scheme: 'PMAY-G', amount: '₹1.8L' },
  { loanId: 'MUDRA-4421', beneficiary: 'Sunita Kumari', fromStatus: 'pending', toStatus: 'verified', district: 'Aurangabad', scheme: 'MUDRA', amount: '₹80K' },
  { loanId: 'KCC-2901', beneficiary: 'Raju Mahato', fromStatus: 'pending', toStatus: 'verified', district: 'Jalgaon', scheme: 'KCC', amount: '₹1.9L' },
  { loanId: 'PMAY-4102', beneficiary: 'Suresh Kumar Gupta', fromStatus: 'pending', toStatus: 'rejected', district: 'Beed', scheme: 'PMAY-G', amount: '₹2.4L' },
  { loanId: 'SHG-0814', beneficiary: 'Meena Bai', fromStatus: 'pending', toStatus: 'verified', district: 'Solapur', scheme: 'SHG Loan', amount: '₹60K' },
  { loanId: 'NABARD-112', beneficiary: 'Lalita Devi', fromStatus: 'pending', toStatus: 'verified', district: 'Ahmednagar', scheme: 'NABARD', amount: '₹8.5L' },
  { loanId: 'MUDRA-5512', beneficiary: 'Deepak Nair', fromStatus: 'pending', toStatus: 'rejected', district: 'Thane', scheme: 'MUDRA', amount: '₹1.2L' },
];

const statusConfig: Record<StatusType, {
  label: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  border: string;
  ringColor: string;
  dotColor: string;
}> = {
  pending: {
    label: 'Pending',
    icon: Clock,
    color: '#d97706',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    ringColor: 'rgba(217,119,6,0.15)',
    dotColor: 'bg-amber-400',
  },
  verified: {
    label: 'Verified',
    icon: CheckCircle,
    color: '#16a34a',
    bg: 'bg-green-50',
    border: 'border-green-200',
    ringColor: 'rgba(22,163,74,0.15)',
    dotColor: 'bg-green-500',
  },
  rejected: {
    label: 'Rejected',
    icon: XCircle,
    color: '#dc2626',
    bg: 'bg-red-50',
    border: 'border-red-200',
    ringColor: 'rgba(220,38,38,0.15)',
    dotColor: 'bg-red-500',
  },
};

function formatTime(date: Date): string {
  const h = date.getHours().toString().padStart(2, '0');
  const m = date.getMinutes().toString().padStart(2, '0');
  const s = date.getSeconds().toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
}

interface AnimatedCounterProps {
  value: number;
  color: string;
}

function AnimatedCounter({ value, color }: AnimatedCounterProps) {
  const [displayed, setDisplayed] = useState(value);
  const prevRef = useRef(value);

  useEffect(() => {
    if (value !== prevRef.current) {
      prevRef.current = value;
      setDisplayed(value);
    }
  }, [value]);

  return (
    <AnimatePresence mode="popLayout">
      <motion.span
        key={displayed}
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 10, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="text-xl font-bold tabular-nums"
        style={{ color }}
      >
        {displayed}
      </motion.span>
    </AnimatePresence>
  );
}

export default function LiveStatusFeed() {
  const [events, setEvents] = useState<StatusEvent[]>([]);
  const [isLive, setIsLive] = useState(true);
  const [pulse, setPulse] = useState(false);
  const [counts, setCounts] = useState({ pending: 47, verified: 0, rejected: 0 });
  const eventIndexRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleNext = (live: boolean) => {
    if (!live) return;
    const delay = 3000 + Math.random() * 2500;
    timerRef.current = setTimeout(() => {
      const idx = eventIndexRef.current % SIMULATED_EVENTS.length;
      const base = SIMULATED_EVENTS[idx];
      const now = new Date();
      const newEvent: StatusEvent = {
        ...base,
        id: `evt-${Date.now()}-${idx}`,
        timestamp: formatTime(now),
      };

      setEvents((prev) => [newEvent, ...prev].slice(0, 10));
      setCounts((prev) => ({
        pending: Math.max(0, prev.pending - 1),
        verified: newEvent.toStatus === 'verified' ? prev.verified + 1 : prev.verified,
        rejected: newEvent.toStatus === 'rejected' ? prev.rejected + 1 : prev.rejected,
      }));
      setPulse(true);
      setTimeout(() => setPulse(false), 700);
      eventIndexRef.current += 1;
      scheduleNext(true);
    }, delay);
  };

  useEffect(() => {
    scheduleNext(true);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleLive = () => {
    setIsLive((prev) => {
      const next = !prev;
      if (!next && timerRef.current) clearTimeout(timerRef.current);
      if (next) scheduleNext(true);
      return next;
    });
  };

  const totalProcessed = counts.verified + counts.rejected;
  const verifiedPct = totalProcessed > 0 ? Math.round((counts.verified / totalProcessed) * 100) : 0;

  return (
    <div className="card-base p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
            <Activity size={17} style={{ color: 'var(--primary)' }} />
          </div>
          <div>
            <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
              Live Submission Status
            </h3>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
              Real-time animated state transitions
            </p>
          </div>
        </div>
        <button
          onClick={toggleLive}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all duration-200 border ${
            isLive
              ? 'bg-green-50 border-green-200 text-green-700' :'bg-gray-50 border-gray-200 text-gray-500'
          }`}
        >
          {isLive ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <Wifi size={11} />
              Live
            </>
          ) : (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
              <WifiOff size={11} />
              Paused
            </>
          )}
        </button>
      </div>

      {/* Animated pulse bar */}
      <AnimatePresence>
        {pulse && (
          <motion.div
            key="pulse-bar"
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="h-0.5 rounded-full origin-left -mt-2"
            style={{ background: 'linear-gradient(90deg, var(--primary), #60a5fa)' }}
          />
        )}
      </AnimatePresence>

      {/* Status Counter Cards */}
      <div className="grid grid-cols-3 gap-3">
        {((['pending', 'verified', 'rejected'] as StatusType[])).map((status) => {
          const conf = statusConfig[status];
          const Icon = conf.icon;
          const count = counts[status];
          return (
            <motion.div
              key={status}
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className={`rounded-xl border p-3 ${conf.bg} ${conf.border} flex flex-col gap-1`}
            >
              <div className="flex items-center justify-between">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: conf.ringColor }}
                >
                  <Icon size={14} style={{ color: conf.color }} />
                </div>
                {status === 'pending' && isLive && (
                  <span className={`w-2 h-2 rounded-full ${conf.dotColor} animate-pulse`} />
                )}
              </div>
              <AnimatedCounter value={count} color={conf.color} />
              <span className="text-[11px] font-medium" style={{ color: conf.color }}>
                {conf.label}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Approval rate progress bar */}
      {totalProcessed > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border p-3 flex flex-col gap-2"
          style={{ borderColor: 'var(--border)', background: 'var(--muted)' }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <TrendingUp size={13} style={{ color: 'var(--primary)' }} />
              <span className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>
                Approval Rate
              </span>
            </div>
            <span className="text-xs font-bold tabular-nums" style={{ color: '#16a34a' }}>
              {verifiedPct}%
            </span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #16a34a, #4ade80)' }}
              initial={{ width: 0 }}
              animate={{ width: `${verifiedPct}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>
          <div className="flex justify-between text-[10px]" style={{ color: 'var(--muted-foreground)' }}>
            <span>{counts.verified} verified</span>
            <span>{counts.rejected} rejected</span>
          </div>
        </motion.div>
      )}

      {/* Events list */}
      <div className="flex flex-col gap-2 max-h-[340px] overflow-y-auto pr-0.5">
        <AnimatePresence initial={false}>
          {events.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-10 gap-2"
            >
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <Activity size={18} style={{ color: 'var(--muted-foreground)' }} />
              </div>
              <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                Waiting for status updates…
              </p>
            </motion.div>
          ) : (
            events.map((evt) => {
              const toConf = statusConfig[evt.toStatus];
              const fromConf = statusConfig[evt.fromStatus];
              const ToIcon = toConf.icon;
              return (
                <motion.div
                  key={evt.id}
                  layout
                  initial={{ opacity: 0, y: -14, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.94, height: 0 }}
                  transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                  className={`rounded-xl border p-3 ${toConf.bg} ${toConf.border}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5 flex-1 min-w-0">
                      {/* Status icon */}
                      <motion.div
                        initial={{ scale: 0, rotate: -20 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 20, delay: 0.05 }}
                        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                        style={{ background: toConf.ringColor }}
                      >
                        <ToIcon size={14} style={{ color: toConf.color }} />
                      </motion.div>

                      <div className="min-w-0 flex-1">
                        {/* Name + Loan ID */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-bold" style={{ color: 'var(--foreground)' }}>
                            {evt.beneficiary}
                          </span>
                          <span
                            className="text-[10px] font-mono px-1.5 py-0.5 rounded-md"
                            style={{ background: 'rgba(0,0,0,0.06)', color: 'var(--muted-foreground)' }}
                          >
                            {evt.loanId}
                          </span>
                        </div>

                        {/* Transition pill row */}
                        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                          {/* From status */}
                          <span
                            className="text-[10px] px-2 py-0.5 rounded-full font-semibold border"
                            style={{
                              background: fromConf.ringColor,
                              color: fromConf.color,
                              borderColor: fromConf.color + '40',
                            }}
                          >
                            {fromConf.label}
                          </span>

                          {/* Arrow */}
                          <motion.span
                            initial={{ opacity: 0, x: -4 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-[11px] font-bold"
                            style={{ color: 'var(--muted-foreground)' }}
                          >
                            →
                          </motion.span>

                          {/* To status */}
                          <motion.span
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 20, delay: 0.12 }}
                            className="text-[10px] px-2 py-0.5 rounded-full font-semibold border"
                            style={{
                              background: toConf.ringColor,
                              color: toConf.color,
                              borderColor: toConf.color + '40',
                            }}
                          >
                            {toConf.label}
                          </motion.span>

                          <span className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>
                            · {evt.district} · {evt.scheme}
                          </span>
                        </div>

                        {/* Amount */}
                        <div className="mt-1">
                          <span className="text-[10px] font-semibold tabular-nums" style={{ color: toConf.color }}>
                            {evt.amount}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Timestamp */}
                    <span
                      className="text-[10px] font-mono shrink-0 mt-0.5"
                      style={{ color: 'var(--muted-foreground)' }}
                    >
                      {evt.timestamp}
                    </span>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
