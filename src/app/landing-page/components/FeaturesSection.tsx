import React from 'react';
import {
  Brain,
  MapPin,
  UserCheck,
  WifiOff,
  ScanText,
  Smartphone,
  BarChart3,
  Radio,
} from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'AI Fraud Detection',
    description:
      'YOLOv8 object detection identifies assets in uploaded images with 94%+ accuracy. Duplicate image hashing prevents reuse fraud across submissions.',
    color: 'text-primary',
    bg: 'bg-blue-50',
    badge: 'Core AI',
  },
  {
    icon: MapPin,
    title: 'Geo-Tag Verification',
    description:
      'GPS coordinates embedded in every upload are cross-validated against the loan disbursement location within a configurable radius threshold.',
    color: 'text-accent',
    bg: 'bg-green-50',
    badge: 'Location',
  },
  {
    icon: UserCheck,
    title: 'Remote Officer Approval',
    description:
      'Loan officers review AI-generated evidence packets from anywhere — approve, reject, or escalate with a full digital audit trail.',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    badge: 'Workflow',
  },
  {
    icon: WifiOff,
    title: 'Offline Sync Support',
    description:
      'Beneficiaries in low-connectivity rural areas can queue uploads offline. Submissions sync automatically when connectivity is restored.',
    color: 'text-orange-500',
    bg: 'bg-orange-50',
    badge: 'Resilience',
  },
  {
    icon: ScanText,
    title: 'OCR Invoice Scanning',
    description:
      'pytesseract extracts invoice text to match vendor names, amounts, and dates against loan disbursement records automatically.',
    color: 'text-cyan-600',
    bg: 'bg-cyan-50',
    badge: 'OCR',
  },
  {
    icon: Smartphone,
    title: 'Beneficiary Mobile Login',
    description:
      'OTP-based authentication requires no passwords. Works on basic Android phones with 2G connectivity for maximum rural reach.',
    color: 'text-rose-500',
    bg: 'bg-rose-50',
    badge: 'Access',
  },
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    description:
      'District-level fraud heatmaps, approval velocity charts, and AI confidence trends give officers real-time operational visibility.',
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
    badge: 'Insights',
  },
  {
    icon: Radio,
    title: 'Real-Time Monitoring',
    description:
      'Live submission feed with instant fraud score alerts. Officers receive push notifications for high-risk cases the moment they are detected.',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    badge: 'Live',
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-16 sm:py-20" style={{ background: 'var(--background)' }}>
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-10">
        <div className="text-center mb-10 sm:mb-14">
          <span
            className="badge-base text-xs px-3 py-1 mb-4 inline-flex"
            style={{ background: 'rgba(37,99,235,0.06)', color: 'var(--primary)', borderColor: 'rgba(37,99,235,0.15)' }}
          >
            Platform Capabilities
          </span>
          <h2 className="text-2xl sm:text-hero-md font-extrabold mb-4" style={{ color: 'var(--foreground)' }}>
            Everything needed for{' '}
            <span className="text-gradient-primary">end-to-end verification</span>
          </h2>
          <p className="text-sm sm:text-base max-w-xl mx-auto" style={{ color: 'var(--secondary-foreground)' }}>
            From AI-powered asset detection to offline rural uploads — LoanLens AI covers the entire loan utilization verification lifecycle.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {features?.map((feature) => (
            <div
              key={`feature-${feature?.title}`}
              className="card-base p-5 sm:p-6 group hover:shadow-card-hover transition-all duration-200 hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${feature?.bg}`}>
                  <feature.icon size={20} className={feature?.color} />
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>
                  {feature?.badge}
                </span>
              </div>
              <h3 className="text-sm font-bold mb-2" style={{ color: 'var(--foreground)' }}>{feature?.title}</h3>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>{feature?.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}