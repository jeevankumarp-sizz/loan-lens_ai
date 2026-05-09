'use client';
import React from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Zap, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import DashboardPreview from './DashboardPreview';

const trustBadges = [
  { icon: ShieldCheck, text: 'RBI Compliant', color: 'text-accent' },
  { icon: Zap, text: 'AI-Powered Verification', color: 'text-primary' },
  { icon: MapPin, text: 'GPS Geo-Tagged', color: 'text-warning' },
];

const aiStatusItems = [
  { label: 'Tractor Detected', verified: true },
  { label: 'GPS Verified', verified: true },
  { label: 'OCR Invoice Matched', verified: true },
];

function smoothScrollTo(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

export default function HeroSection() {
  return (
    <section className="relative pt-24 sm:pt-28 pb-16 sm:pb-20 overflow-hidden gradient-hero">
      {/* Background blobs */}
      <div className="absolute top-20 left-10 w-96 h-96 blob-primary pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 blob-accent pointer-events-none" />
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left */}
          <motion.div
            className="space-y-5 sm:space-y-6"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
          >
            {/* Pill badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium border-gradient">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse-slow" />
              <span style={{ color: 'var(--foreground)' }}>Trusted by 120+ Government Schemes</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-hero-xl font-extrabold tracking-tight" style={{ color: 'var(--foreground)' }}>
              AI-Powered{' '}
              <span className="text-gradient-primary">Loan Utilization</span>{' '}
              Verification Platform
            </h1>

            <p className="text-base sm:text-lg leading-relaxed" style={{ color: 'var(--secondary-foreground)', maxWidth: '520px' }}>
              Designed for Government Lending Ecosystems — Built for NABARD, PMAY &amp; Rural Schemes. AI-Powered Rural Verification Infrastructure for India&apos;s government lending ecosystem.
            </p>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-3 sm:gap-4">
              {trustBadges?.map((badge) => (
                <div key={`badge-${badge?.text}`} className="flex items-center gap-2 text-sm font-medium">
                  <badge.icon size={16} className={badge?.color} />
                  <span style={{ color: 'var(--secondary-foreground)' }}>{badge?.text}</span>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 pt-2">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} style={{ display: 'inline-flex' }}>
                <Link
                  href="/officer-dashboard"
                  className="btn-primary px-6 py-3 text-base w-full sm:w-auto justify-center"
                  style={{ boxShadow: '0 0 0 0 rgba(37,99,235,0)', transition: 'box-shadow 0.25s ease' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 0 18px 4px rgba(37,99,235,0.35)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 0 0 0 rgba(37,99,235,0)'; }}
                >
                  Launch Dashboard
                  <ArrowRight size={16} />
                </Link>
              </motion.div>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="btn-outline px-6 py-3 text-base gap-2 w-full sm:w-auto justify-center"
                onClick={() => smoothScrollTo('workflow')}
              >
                See Verification Workflow
              </motion.button>
            </div>

            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
              Compliant with NABARD, PMAY, PM Kisan guidelines · Government-grade security
            </p>
          </motion.div>

          {/* Right — Dashboard Preview */}
          <div className="relative hidden lg:block">
            <motion.div
              className="animate-float"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
            >
              <DashboardPreview />
            </motion.div>

            {/* Floating AI card */}
            <motion.div
              className="absolute -bottom-4 -left-8 glass-card rounded-2xl p-4 shadow-card-hover animate-slide-up"
              style={{ animationDelay: '0.3s' }}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              whileHover={{ scale: 1.03 }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                  <ShieldCheck size={20} className="text-accent" />
                </div>
                <div>
                  <p className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>AI Verified</p>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Tractor · 96% confidence</p>
                </div>
                <span className="badge-base status-verified ml-2">✓ Approved</span>
              </div>
            </motion.div>

            {/* Floating fraud alert */}
            <motion.div
              className="absolute -top-4 -right-4 glass-card rounded-2xl p-3 shadow-card-hover"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              whileHover={{ scale: 1.03 }}
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-destructive animate-pulse-slow" />
                <p className="text-xs font-semibold" style={{ color: 'var(--destructive)' }}>Fraud Alert Detected</p>
              </div>
              <p className="text-[11px] mt-0.5" style={{ color: 'var(--muted-foreground)' }}>GPS mismatch · Loan #KCC-2847</p>
            </motion.div>

            {/* Live AI Verification Status Card */}
            <motion.div
              className="absolute top-1/2 -right-6 -translate-y-1/2 rounded-2xl p-4 shadow-card-hover"
              style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.22)', minWidth: '180px' }}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              whileHover={{ scale: 1.04 }}
            >
              <div className="flex items-center gap-1.5 mb-2.5">
                <motion.span className="w-2 h-2 rounded-full bg-accent" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }} />
                <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: 'var(--accent)' }}>Live Verification</p>
              </div>
              <div className="space-y-1.5">
                {aiStatusItems.map((item) => (
                  <div key={item.label} className="flex items-center gap-2">
                    <span className="text-accent text-xs">✔</span>
                    <p className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>{item.label}</p>
                  </div>
                ))}
              </div>
              <div className="mt-2.5 pt-2 border-t" style={{ borderColor: 'rgba(255,255,255,0.15)' }}>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                  <p className="text-[11px] font-semibold" style={{ color: 'var(--foreground)' }}>Fraud Risk: <span className="text-accent">Low</span></p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}