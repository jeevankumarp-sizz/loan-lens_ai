'use client';
import React, { useState } from 'react';
import { ShieldCheck, Lock, FileText, Award, X, MapPin, Brain, WifiOff, Globe } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

const badges = [
  { icon: ShieldCheck, label: 'RBI Guidelines Compliant', color: 'text-primary', bg: 'bg-blue-50' },
  { icon: Lock, label: 'AES-256 Data Encryption', color: 'text-accent', bg: 'bg-green-50' },
  { icon: FileText, label: 'NABARD Audit Ready', color: 'text-purple-600', bg: 'bg-purple-50' },
  { icon: Award, label: 'ISO 27001 Aligned', color: 'text-amber-600', bg: 'bg-amber-50' },
];

const complianceStandards = [
  { icon: ShieldCheck, label: 'RBI Guidelines Compliant', desc: 'Fully aligned with Reserve Bank of India lending norms', color: 'text-primary', bg: 'bg-blue-50' },
  { icon: FileText, label: 'NABARD Audit Ready', desc: 'Complete audit trail for NABARD scheme verifications', color: 'text-purple-600', bg: 'bg-purple-50' },
  { icon: MapPin, label: 'GPS Geo-Tag Verification', desc: 'Cryptographically signed geo-coordinates on every submission', color: 'text-amber-600', bg: 'bg-amber-50' },
  { icon: Brain, label: 'AI Fraud Detection', desc: 'ML-based duplicate image and GPS mismatch detection', color: 'text-primary', bg: 'bg-blue-50' },
  { icon: Lock, label: 'AES-256 Encryption', desc: 'Military-grade encryption for all data at rest and in transit', color: 'text-accent', bg: 'bg-green-50' },
  { icon: WifiOff, label: 'Offline Sync Support', desc: 'Field submissions work without internet, sync when connected', color: 'text-orange-600', bg: 'bg-orange-50' },
  { icon: Globe, label: 'Multilingual Accessibility', desc: 'Supports English, हिन्दी, తెలుగు and regional languages', color: 'text-teal-600', bg: 'bg-teal-50' },
];

export default function ComplianceSection() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <section id="compliance" className="py-16 sm:py-20 border-t" style={{ borderColor: 'var(--border)', background: 'var(--card)' }}>
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div>
            <span
              className="badge-base text-xs px-3 py-1 mb-4 inline-flex"
              style={{ background: 'rgba(16,185,129,0.06)', color: 'var(--accent)', borderColor: 'rgba(16,185,129,0.2)' }}
            >
              Government Grade Security
            </span>
            <h2 className="text-2xl sm:text-hero-md font-extrabold mb-4" style={{ color: 'var(--foreground)' }}>
              Built for India&apos;s{' '}
              <span className="text-gradient-accent">regulatory framework</span>
            </h2>
            <p className="text-sm sm:text-base mb-6 leading-relaxed" style={{ color: 'var(--secondary-foreground)' }}>
              LoanLens AI is designed from the ground up to meet the compliance requirements of Indian government lending schemes — from PMAY to PM Kisan to MUDRA — with full audit trail support.
            </p>
            <div className="space-y-3">
              {[
                'Complete digital audit trail for every verification decision',
                'Role-based access control for officers, managers, and auditors',
                'Immutable submission records with cryptographic timestamps',
                'Data residency within Indian cloud infrastructure',
              ]?.map((item) => (
                <div key={`compliance-${item?.substring(0, 20)}`} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldCheck size={12} className="text-accent" />
                  </div>
                  <p className="text-sm" style={{ color: 'var(--secondary-foreground)' }}>{item}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mt-6 sm:mt-8">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link href="/officer-dashboard" className="btn-primary w-full sm:w-auto justify-center">
                  Explore Officer Console
                </Link>
              </motion.div>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="btn-outline w-full sm:w-auto justify-center"
                onClick={() => setModalOpen(true)}
              >
                View Compliance Standards
              </motion.button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {badges?.map((badge) => (
              <motion.div
                key={`compliance-badge-${badge?.label}`}
                className="card-base p-4 sm:p-5 flex flex-col items-center text-center gap-3"
                whileHover={{ scale: 1.04, y: -2 }}
                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              >
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center ${badge?.bg}`}>
                  <badge.icon size={20} className={badge?.color} />
                </div>
                <p className="text-xs sm:text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{badge?.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      {/* Compliance Standards Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setModalOpen(false)}
          >
            <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }} />
            <motion.div
              className="relative rounded-2xl shadow-card-hover w-full max-w-lg overflow-hidden"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              onClick={(e) => e?.stopPropagation()}
            >
              <div className="flex items-center justify-between px-5 sm:px-6 py-4 sm:py-5 border-b" style={{ borderColor: 'var(--border)' }}>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <ShieldCheck size={18} className="text-accent" />
                    <h3 className="text-base font-bold" style={{ color: 'var(--foreground)' }}>Compliance Standards</h3>
                  </div>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Government-grade regulatory alignment</p>
                </div>
                <button onClick={() => setModalOpen(false)} className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-muted transition-colors" style={{ color: 'var(--muted-foreground)', background: 'none', border: 'none', cursor: 'pointer' }}>
                  <X size={16} />
                </button>
              </div>
              <div className="px-5 sm:px-6 py-4 sm:py-5 space-y-3 max-h-[60vh] overflow-y-auto">
                {complianceStandards?.map((std, i) => (
                  <motion.div
                    key={std?.label}
                    className="flex items-start gap-3 p-3 rounded-xl"
                    style={{ background: 'var(--background)', border: '1px solid var(--border)' }}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.22, delay: i * 0.05 }}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${std?.bg}`}>
                      <std.icon size={18} className={std?.color} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{std?.label}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{std?.desc}</p>
                    </div>
                    <span className="ml-auto shrink-0 text-accent text-sm font-bold">✓</span>
                  </motion.div>
                ))}
              </div>
              <div className="px-5 sm:px-6 py-4 border-t flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3" style={{ borderColor: 'var(--border)' }}>
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Last audited: Q1 2025 · CERT-In Verified</p>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Link href="/officer-dashboard" className="btn-primary text-sm px-4 py-2" onClick={() => setModalOpen(false)}>
                    Explore Console
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}