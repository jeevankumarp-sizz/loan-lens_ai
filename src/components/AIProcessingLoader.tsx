'use client';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, MapPin, ShieldCheck, Brain, FileText, CheckCircle2 } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';


const PROCESSING_STEPS = [
  { id: 1, icon: Upload, label: 'Uploading Asset', description: 'Securely uploading your photo...' },
  { id: 2, icon: Brain, label: 'Detecting Asset', description: 'Gemini Vision analyzing image...' },
  { id: 3, icon: MapPin, label: 'Verifying GPS', description: 'Validating location coordinates...' },
  { id: 4, icon: ShieldCheck, label: 'Running Fraud Check', description: 'Checking for anomalies...' },
  { id: 5, icon: FileText, label: 'Generating AI Report', description: 'Compiling verification data...' },
  { id: 6, icon: CheckCircle2, label: 'Verification Complete', description: 'Sending to officer review...' },
];

interface AIProcessingLoaderProps {
  currentStep: number; // 1-6
  processingText?: string;
}

export default function AIProcessingLoader({ currentStep, processingText }: AIProcessingLoaderProps) {
  return (
    <div className="py-6 space-y-5">
      {/* Animated AI brain */}
      <div className="flex items-center justify-center">
        <div className="relative">
          <motion.div
            animate={{ scale: [1, 1.08, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-20 h-20 rounded-3xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.12), rgba(16,185,129,0.12))' }}
          >
            <span className="text-3xl">🤖</span>
          </motion.div>
          {/* Orbit rings */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 rounded-3xl border-2 border-dashed"
            style={{ borderColor: 'rgba(37,99,235,0.25)' }}
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
            className="absolute -inset-3 rounded-3xl border border-dashed"
            style={{ borderColor: 'rgba(16,185,129,0.2)' }}
          />
        </div>
      </div>

      {/* Current step text */}
      <div className="text-center">
        <p className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>
          AI Verification in Progress
        </p>
        <AnimatePresence mode="wait">
          <motion.p
            key={processingText}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="text-xs mt-1"
            style={{ color: 'var(--primary)' }}
          >
            {processingText || PROCESSING_STEPS[Math.min(currentStep - 1, 5)]?.description}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Steps list */}
      <div className="space-y-2">
        {PROCESSING_STEPS.map((step, idx) => {
          const isDone = currentStep > step.id;
          const isActive = currentStep === step.id;
          const Icon = step.icon;

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="flex items-center gap-3"
            >
              {/* Step indicator */}
              <div className="relative shrink-0">
                <motion.div
                  animate={isActive ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="w-7 h-7 rounded-full flex items-center justify-center"
                  style={{
                    background: isDone
                      ? 'var(--accent)'
                      : isActive
                      ? 'var(--primary)'
                      : 'var(--border)',
                  }}
                >
                  {isDone ? (
                    <CheckCircle2 size={14} className="text-white" />
                  ) : (
                    <Icon size={12} style={{ color: isActive ? 'white' : 'var(--muted-foreground)' }} />
                  )}
                </motion.div>
                {isActive && (
                  <motion.div
                    animate={{ scale: [1, 1.8], opacity: [0.5, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="absolute inset-0 rounded-full"
                    style={{ background: 'var(--primary)' }}
                  />
                )}
              </div>

              {/* Step label */}
              <div className="flex-1">
                <p
                  className="text-xs font-semibold"
                  style={{
                    color: isDone ? 'var(--accent)' : isActive ? 'var(--foreground)' : 'var(--muted-foreground)',
                  }}
                >
                  {step.label}
                </p>
              </div>

              {/* Status */}
              <div className="shrink-0">
                {isDone && (
                  <span className="text-[10px] font-bold" style={{ color: 'var(--accent)' }}>
                    Done
                  </span>
                )}
                {isActive && (
                  <motion.span
                    animate={{ opacity: [1, 0.4, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="text-[10px] font-bold"
                    style={{ color: 'var(--primary)' }}
                  >
                    Processing...
                  </motion.span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: 'linear-gradient(90deg, var(--primary), var(--accent))' }}
          animate={{ width: `${(currentStep / 6) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </div>
  );
}
