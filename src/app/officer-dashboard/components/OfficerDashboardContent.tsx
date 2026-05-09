'use client';
import React from 'react';
import { motion } from 'framer-motion';
import OfficerKPIGrid from './OfficerKPIGrid';
import OfficerChartsRow from './OfficerChartsRow';
import FraudAlertPanel from './FraudAlertPanel';
import BeneficiaryTable from './BeneficiaryTable';
import LiveStatusFeed from './LiveStatusFeed';

export default function OfficerDashboardContent() {
  return (
    <motion.div
      className="space-y-4 sm:space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Page Header */}
      <motion.div
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div>
          <h1 className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
            Officer Dashboard
          </h1>
          <p className="text-xs sm:text-sm mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
            08 May 2026 · Maharashtra Zone · 47 submissions pending review
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <select
            className="input-base text-sm py-2 flex-1 sm:flex-none sm:w-40"
            defaultValue="today"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
          </select>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="btn-primary text-sm whitespace-nowrap"
          >
            Export Report
          </motion.button>
        </div>
      </motion.div>
      {/* KPI Grid */}
      <OfficerKPIGrid />
      {/* Charts + Fraud Alerts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
        <div className="xl:col-span-2">
          <OfficerChartsRow />
        </div>
        <div>
          <FraudAlertPanel />
        </div>
      </div>
      {/* Live Status Feed */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1 }}
      >
        <LiveStatusFeed />
      </motion.div>
      {/* Beneficiary Table */}
      <BeneficiaryTable />
    </motion.div>
  );
}