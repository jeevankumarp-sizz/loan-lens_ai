'use client';
import React from 'react';
import MetricCard from '@/components/ui/MetricCard';
import { motion } from 'framer-motion';
import {
  FileCheck,
  Clock,
  ShieldAlert,
  Users,
  Brain,
  Upload,
} from 'lucide-react';

export default function OfficerKPIGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-4">
      {[
        {
          featured: true,
          label: 'Total Loans Verified This Month',
          value: '1,284',
          subValue: '↑ 18.4% vs last month',
          trend: 'up' as const,
          trendValue: '+18.4%',
          icon: <FileCheck size={20} style={{ color: 'var(--primary)' }} />,
          iconBg: 'bg-blue-50',
          className: 'xl:col-span-2',
        },
        {
          label: 'Pending Reviews',
          value: '47',
          subValue: '12 added in last 2 hrs',
          trend: 'up' as const,
          trendValue: '+12',
          icon: <Clock size={20} style={{ color: 'var(--warning)' }} />,
          iconBg: 'bg-amber-50',
          warning: true,
        },
        {
          label: 'Active Fraud Alerts',
          value: '6',
          subValue: '4 GPS mismatch · 2 duplicate',
          trend: 'down' as const,
          trendValue: '-2 vs yesterday',
          icon: <ShieldAlert size={20} style={{ color: 'var(--destructive)' }} />,
          iconBg: 'bg-red-50',
          alert: true,
        },
        {
          label: 'Approved Beneficiaries',
          value: '1,231',
          subValue: '96.1% approval rate',
          trend: 'up' as const,
          trendValue: '+3.2%',
          icon: <Users size={20} style={{ color: 'var(--accent)' }} />,
          iconBg: 'bg-green-50',
        },
        {
          label: 'AI Detection Accuracy',
          value: '94.7%',
          subValue: 'Above 90% SLA target',
          trend: 'up' as const,
          trendValue: '+0.3%',
          icon: <Brain size={20} style={{ color: '#9333ea' }} />,
          iconBg: 'bg-purple-50',
        },
        {
          label: 'Daily Uploads',
          value: '318',
          subValue: 'Peak: 11:00–13:00 IST',
          trend: 'neutral' as const,
          trendValue: 'Stable',
          icon: <Upload size={20} style={{ color: 'var(--muted-foreground)' }} />,
          iconBg: 'bg-slate-50',
        },
      ].map((card, idx) => (
        <motion.div
          key={`kpi-${idx}`}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.06, duration: 0.3 }}
          whileHover={{ y: -2, transition: { duration: 0.15 } }}
          className={card.className}
        >
          <MetricCard
            featured={card.featured}
            label={card.label}
            value={card.value}
            subValue={card.subValue}
            trend={card.trend}
            trendValue={card.trendValue}
            icon={card.icon}
            iconBg={card.iconBg}
            warning={card.warning}
            alert={card.alert}
          />
        </motion.div>
      ))}
    </div>
  );
}