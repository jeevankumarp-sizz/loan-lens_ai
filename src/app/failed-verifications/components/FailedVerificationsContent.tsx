'use client';
import React, { useState } from 'react';
import {
  XCircle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  MapPin,
  FileText,
  Brain,
  Clock,
  Filter,
  Download,
  Search,
} from 'lucide-react';
import { toast } from 'sonner';

interface AIReason {
  category: 'GPS' | 'OCR' | 'Asset' | 'Metadata' | 'Duplicate';
  label: string;
  detail: string;
  confidence: number;
  severity: 'critical' | 'high' | 'medium';
}

interface FailedVerification {
  id: string;
  loanId: string;
  beneficiaryName: string;
  scheme: string;
  assetType: string;
  district: string;
  amount: string;
  failedAt: string;
  fraudScore: number;
  aiConfidence: number;
  failureReasons: AIReason[];
  retryCount: number;
  status: 'failed' | 'retrying' | 'escalated';
}

const failedVerifications: FailedVerification[] = [
  {
    id: 'fv-001',
    loanId: 'KCC-3305',
    beneficiaryName: 'Arjun Singh Chauhan',
    scheme: 'KCC',
    assetType: 'Pump Set',
    district: 'Nagpur',
    amount: '₹1.5L',
    failedAt: '08 May 2026, 04:33',
    fraudScore: 88,
    aiConfidence: 12,
    retryCount: 1,
    status: 'failed',
    failureReasons: [
      {
        category: 'GPS',
        label: 'GPS Location Mismatch',
        detail: 'Upload coordinates are 795km from the registered loan disbursement site. Expected: Nagpur district. Detected: Rajasthan border region.',
        confidence: 97,
        severity: 'critical',
      },
      {
        category: 'Asset',
        label: 'Asset Not Recognized',
        detail: 'AI model confidence for "Pump Set" is only 12%. The image appears to show a generic metal structure, not an agricultural pump set as declared.',
        confidence: 88,
        severity: 'critical',
      },
      {
        category: 'Metadata',
        label: 'Image Timestamp Anomaly',
        detail: 'EXIF data shows the photo was taken 14 months before the loan application date. This suggests a recycled or pre-existing image.',
        confidence: 91,
        severity: 'high',
      },
    ],
  },
  {
    id: 'fv-002',
    loanId: 'PMAY-3391',
    beneficiaryName: 'Vikram Rathore',
    scheme: 'PMAY-G',
    assetType: 'House Renovation',
    district: 'Latur',
    amount: '₹1.8L',
    failedAt: '08 May 2026, 03:48',
    fraudScore: 91,
    aiConfidence: 31,
    retryCount: 0,
    status: 'failed',
    failureReasons: [
      {
        category: 'Duplicate',
        label: 'Duplicate Image Detected',
        detail: 'Perceptual hash match (98.4% similarity) found with submission PMAY-2801 filed by a different beneficiary in Osmanabad district on 12 Feb 2026.',
        confidence: 98,
        severity: 'critical',
      },
      {
        category: 'GPS',
        label: 'GPS Outside District Boundary',
        detail: 'Coordinates fall outside Latur district boundary by 42km. Location resolves to Osmanabad district, not the declared loan site.',
        confidence: 94,
        severity: 'critical',
      },
      {
        category: 'OCR',
        label: 'Invoice Amount Discrepancy',
        detail: 'OCR extracted invoice total of ₹4.2L does not match declared loan utilization of ₹1.8L. Variance of ₹2.4L flagged for manual review.',
        confidence: 86,
        severity: 'high',
      },
    ],
  },
  {
    id: 'fv-003',
    loanId: 'PMAY-4102',
    beneficiaryName: 'Suresh Kumar Gupta',
    scheme: 'PMAY-G',
    assetType: 'House Foundation',
    district: 'Beed',
    amount: '₹2.4L',
    failedAt: '07 May 2026, 17:22',
    fraudScore: 78,
    aiConfidence: 41,
    retryCount: 2,
    status: 'escalated',
    failureReasons: [
      {
        category: 'Asset',
        label: 'Asset Category Mismatch',
        detail: 'Image shows a completed single-storey structure, but the loan is for "House Foundation" (initial stage). Construction appears to predate the loan by an estimated 8–12 months.',
        confidence: 79,
        severity: 'high',
      },
      {
        category: 'OCR',
        label: 'Missing Invoice Documentation',
        detail: 'No readable invoice or receipt found in the uploaded image. OCR returned 0 characters. Proper documentation is required for PMAY-G scheme compliance.',
        confidence: 95,
        severity: 'high',
      },
      {
        category: 'Metadata',
        label: 'Compressed Image Quality',
        detail: 'File size is 18KB — unusually small for a construction site photo. Heavy compression may indicate the image was downloaded from the internet or screenshot from another source.',
        confidence: 72,
        severity: 'medium',
      },
    ],
  },
  {
    id: 'fv-004',
    loanId: 'MUDRA-5512',
    beneficiaryName: 'Deepak Nair',
    scheme: 'MUDRA',
    assetType: 'Welding Machine',
    district: 'Thane',
    amount: '₹1.2L',
    failedAt: '08 May 2026, 02:59',
    fraudScore: 37,
    aiConfidence: 68,
    retryCount: 0,
    status: 'failed',
    failureReasons: [
      {
        category: 'OCR',
        label: 'Partial Invoice Match',
        detail: 'OCR detected brand name "Esab" and partial serial number, but the model number and purchase date are illegible. Partial match score: 54%. Full invoice scan required.',
        confidence: 68,
        severity: 'medium',
      },
      {
        category: 'Metadata',
        label: 'Metadata Inconsistency',
        detail: 'Image GPS metadata is stripped. Camera model metadata is absent. These fields are typically present in genuine field photos taken on a smartphone.',
        confidence: 61,
        severity: 'medium',
      },
    ],
  },
];

const categoryIcons: Record<AIReason['category'], React.ReactNode> = {
  GPS: <MapPin size={13} />,
  OCR: <FileText size={13} />,
  Asset: <Brain size={13} />,
  Metadata: <Clock size={13} />,
  Duplicate: <AlertTriangle size={13} />,
};

const severityColors: Record<AIReason['severity'], { bg: string; text: string; border: string }> = {
  critical: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  high: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  medium: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-100' },
};

const statusConfig = {
  failed: { label: 'Failed', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  retrying: { label: 'Retrying', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  escalated: { label: 'Escalated', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
};

function ConfidenceBar({ value, severity }: { value: number; severity: AIReason['severity'] }) {
  const color = severity === 'critical' ? 'bg-red-500' : severity === 'high' ? 'bg-amber-500' : 'bg-yellow-400';
  return (
    <div className="flex items-center gap-2 mt-1.5">
      <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-[11px] font-semibold tabular-nums" style={{ color: 'var(--muted-foreground)' }}>
        {value}% confidence
      </span>
    </div>
  );
}

function VerificationCard({ item }: { item: FailedVerification }) {
  const [expanded, setExpanded] = useState(false);
  const [retrying, setRetrying] = useState(false);

  const handleRetry = () => {
    setRetrying(true);
    setTimeout(() => {
      setRetrying(false);
      toast.success(`Retry initiated for ${item.loanId} — queued for AI re-analysis`, { duration: 3500 });
    }, 1800);
  };

  const handleEscalate = () => {
    toast.warning(`${item.loanId} escalated to senior officer for manual review`, { duration: 3500 });
  };

  const sc = statusConfig[item.status];

  return (
    <div className="card-base overflow-hidden">
      {/* Card Header */}
      <div className="px-5 py-4 flex flex-wrap items-start gap-4">
        {/* Left: Identity */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>
              {item.beneficiaryName}
            </span>
            <span
              className="text-[10px] font-mono px-2 py-0.5 rounded-md"
              style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}
            >
              {item.loanId}
            </span>
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${sc.bg} ${sc.text} ${sc.border}`}
            >
              {sc.label}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
              {item.scheme} · {item.assetType}
            </span>
            <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
              {item.district} · {item.amount}
            </span>
            <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
              Failed {item.failedAt}
            </span>
          </div>
        </div>

        {/* Right: Scores */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="text-center">
            <div
              className="text-lg font-bold tabular-nums"
              style={{ color: item.fraudScore >= 75 ? 'var(--destructive)' : item.fraudScore >= 40 ? '#d97706' : 'var(--foreground)' }}
            >
              {item.fraudScore}
            </div>
            <div className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>Fraud Score</div>
          </div>
          <div className="text-center">
            <div
              className="text-lg font-bold tabular-nums"
              style={{ color: item.aiConfidence < 40 ? 'var(--destructive)' : item.aiConfidence < 70 ? '#d97706' : '#16a34a' }}
            >
              {item.aiConfidence}%
            </div>
            <div className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>AI Confidence</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold tabular-nums" style={{ color: 'var(--foreground)' }}>
              {item.failureReasons.length}
            </div>
            <div className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>Flags</div>
          </div>
        </div>
      </div>

      {/* Failure Reason Pills */}
      <div className="px-5 pb-3 flex flex-wrap gap-2">
        {item.failureReasons.map((reason, i) => {
          const sc = severityColors[reason.severity];
          return (
            <span
              key={i}
              className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full border ${sc.bg} ${sc.text} ${sc.border}`}
            >
              {categoryIcons[reason.category]}
              {reason.label}
            </span>
          );
        })}
      </div>

      {/* Expandable AI Reasons */}
      <div className="border-t" style={{ borderColor: 'var(--border)' }}>
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full px-5 py-3 flex items-center justify-between text-xs font-semibold transition-colors hover:bg-gray-50"
          style={{ color: 'var(--primary)' }}
        >
          <span className="flex items-center gap-1.5">
            <Brain size={13} />
            View AI Confidence Breakdown ({item.failureReasons.length} reasons)
          </span>
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {expanded && (
          <div className="px-5 pb-4 space-y-3 border-t" style={{ borderColor: 'var(--border)' }}>
            <p className="text-[11px] pt-3" style={{ color: 'var(--muted-foreground)' }}>
              AI analysis performed by LoanLens fraud detection engine. Each flag below contributed to the verification failure.
            </p>
            {item.failureReasons.map((reason, i) => {
              const sc = severityColors[reason.severity];
              return (
                <div
                  key={i}
                  className={`rounded-xl border p-3.5 ${sc.bg} ${sc.border}`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${sc.bg} border ${sc.border}`}>
                      <span className={sc.text}>{categoryIcons[reason.category]}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs font-bold ${sc.text}`}>{reason.label}</span>
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full uppercase tracking-wide ${sc.bg} ${sc.text} border ${sc.border}`}
                        >
                          {reason.severity}
                        </span>
                      </div>
                      <p className="text-xs mt-1.5 leading-relaxed" style={{ color: 'var(--secondary-foreground)' }}>
                        {reason.detail}
                      </p>
                      <ConfidenceBar value={reason.confidence} severity={reason.severity} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Actions */}
      <div
        className="px-5 py-3 border-t flex items-center justify-between gap-3 flex-wrap"
        style={{ borderColor: 'var(--border)', background: 'var(--muted)' }}
      >
        <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
          {item.retryCount > 0 ? (
            <span>Retried {item.retryCount}× · {item.status === 'escalated' ? 'Escalated to senior officer' : 'Awaiting re-analysis'}</span>
          ) : (
            <span>No retry attempts yet</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleEscalate}
            className="btn-outline text-xs py-1.5 px-3"
            disabled={item.status === 'escalated'}
          >
            {item.status === 'escalated' ? 'Escalated' : 'Escalate'}
          </button>
          <button
            onClick={handleRetry}
            disabled={retrying || item.status === 'escalated'}
            className="btn-primary text-xs py-1.5 px-4 flex items-center gap-1.5 disabled:opacity-60"
          >
            <RefreshCw size={12} className={retrying ? 'animate-spin' : ''} />
            {retrying ? 'Retrying…' : 'Retry Verification'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function FailedVerificationsContent() {
  const [search, setSearch] = useState('');
  const [schemeFilter, setSchemeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = failedVerifications.filter((item) => {
    const q = search.toLowerCase();
    const matchSearch =
      !search ||
      item.beneficiaryName.toLowerCase().includes(q) ||
      item.loanId.toLowerCase().includes(q) ||
      item.district.toLowerCase().includes(q);
    const matchScheme = schemeFilter === 'all' || item.scheme === schemeFilter;
    const matchStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchSearch && matchScheme && matchStatus;
  });

  const criticalCount = failedVerifications.filter((v) =>
    v.failureReasons.some((r) => r.severity === 'critical')
  ).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
            Failed Verifications
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
            {failedVerifications.length} failed · {criticalCount} with critical AI flags · Officer review required
          </p>
        </div>
        <button className="btn-outline text-sm flex items-center gap-1.5">
          <Download size={14} />
          Export Report
        </button>
      </div>

      {/* Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Failed', value: failedVerifications.length, color: 'var(--destructive)' },
          { label: 'Critical Flags', value: criticalCount, color: '#dc2626' },
          { label: 'Escalated', value: failedVerifications.filter((v) => v.status === 'escalated').length, color: '#7c3aed' },
          { label: 'Avg AI Confidence', value: `${Math.round(failedVerifications.reduce((s, v) => s + v.aiConfidence, 0) / failedVerifications.length)}%`, color: '#d97706' },
        ].map((stat) => (
          <div key={stat.label} className="card-base px-4 py-3">
            <div className="text-xl font-bold tabular-nums" style={{ color: stat.color }}>
              {stat.value}
            </div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48 max-w-72">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }} />
          <input
            type="text"
            placeholder="Search name, loan ID, district…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-base pl-8 text-xs w-full py-2"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} style={{ color: 'var(--muted-foreground)' }} />
          <select
            value={schemeFilter}
            onChange={(e) => setSchemeFilter(e.target.value)}
            className="input-base text-xs py-2 w-32"
          >
            <option value="all">All Schemes</option>
            <option value="KCC">KCC</option>
            <option value="PMAY-G">PMAY-G</option>
            <option value="MUDRA">MUDRA</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-base text-xs py-2 w-32"
          >
            <option value="all">All Status</option>
            <option value="failed">Failed</option>
            <option value="retrying">Retrying</option>
            <option value="escalated">Escalated</option>
          </select>
        </div>
        <span className="text-xs ml-auto" style={{ color: 'var(--muted-foreground)' }}>
          {filtered.length} result{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Cards */}
      {filtered.length === 0 ? (
        <div className="card-base p-12 text-center">
          <XCircle size={32} className="mx-auto mb-3" style={{ color: 'var(--muted-foreground)' }} />
          <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>No failed verifications found</p>
          <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>Adjust your filters to see results</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((item) => (
            <VerificationCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
