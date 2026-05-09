import React from 'react';
import { Upload, Cpu, ClipboardCheck, BadgeCheck } from 'lucide-react';

const steps = [
  {
    step: '01',
    icon: Upload,
    title: 'Beneficiary Uploads Proof',
    description:
      'The beneficiary photographs the purchased asset using their mobile phone. GPS coordinates and timestamp are automatically captured and embedded.',
    color: 'text-primary',
    bg: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  {
    step: '02',
    icon: Cpu,
    title: 'AI Processes the Submission',
    description:
      'YOLOv8 detects the asset type, OCR scans the invoice, imagehash checks for duplicate fraud, and GPS metadata is validated against the loan location.',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    borderColor: 'border-purple-200',
  },
  {
    step: '03',
    icon: ClipboardCheck,
    title: 'Officer Reviews AI Report',
    description:
      'The loan officer receives an AI evidence packet — asset detection result, confidence score, GPS match, and OCR invoice data — for informed decision-making.',
    color: 'text-accent',
    bg: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  {
    step: '04',
    icon: BadgeCheck,
    title: 'Loan Utilization Confirmed',
    description:
      'Approved verifications are recorded in the audit log. Rejected cases trigger beneficiary notifications with required corrective actions.',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    borderColor: 'border-amber-200',
  },
];

export default function WorkflowSection() {
  return (
    <section id="workflow" className="py-16 sm:py-20 border-t" style={{ borderColor: 'var(--border)', background: 'var(--card)' }}>
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-10">
        <div className="text-center mb-10 sm:mb-14">
          <span
            className="badge-base text-xs px-3 py-1 mb-4 inline-flex"
            style={{ background: 'rgba(16,185,129,0.06)', color: 'var(--accent)', borderColor: 'rgba(16,185,129,0.2)' }}
          >
            Verification Workflow
          </span>
          <h2 className="text-2xl sm:text-hero-md font-extrabold mb-4" style={{ color: 'var(--foreground)' }}>
            From upload to approval{' '}
            <span className="text-gradient-accent">in under 2 minutes</span>
          </h2>
          <p className="text-sm sm:text-base max-w-xl mx-auto" style={{ color: 'var(--secondary-foreground)' }}>
            Our AI-driven pipeline eliminates weeks of manual field visits with automated verification that&apos;s faster, more consistent, and fully auditable.
          </p>
        </div>

        <div className="relative">
          {/* Connector line — desktop only */}
          <div
            className="absolute top-10 left-0 right-0 h-0.5 hidden lg:block"
            style={{ background: 'linear-gradient(90deg, var(--primary), var(--accent))', margin: '0 12.5%' }}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-6">
            {steps?.map((step, idx) => (
              <div key={`step-${step?.step}`} className="relative flex flex-col items-center text-center">
                <div
                  className={`relative w-20 h-20 rounded-2xl flex items-center justify-center border-2 mb-5 z-10 ${step?.bg} ${step?.borderColor}`}
                  style={{ background: 'var(--card)' }}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${step?.bg}`}>
                    <step.icon size={24} className={step?.color} />
                  </div>
                  <span
                    className="absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-extrabold text-white"
                    style={{ background: 'var(--primary)' }}
                  >
                    {idx + 1}
                  </span>
                </div>
                <h3 className="text-sm font-bold mb-2" style={{ color: 'var(--foreground)' }}>{step?.title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>{step?.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}