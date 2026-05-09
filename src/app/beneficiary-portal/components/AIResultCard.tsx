'use client';
import React from 'react';
import {
  Brain,
  ShieldCheck,
  MapPin,
  ScanText,
  Copy,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  ShieldAlert,
  ShieldX,
} from 'lucide-react';
import { FraudScoringResult } from '@/lib/ai/fraudScoring';

interface AIResultCardProps {
  onUploadAnother: () => void;
  result: FraudScoringResult;
}

function getRiskColor(riskLevel: FraudScoringResult['riskLevel']) {
  switch (riskLevel) {
    case 'Low': return { bg: 'rgba(16,185,129,0.06)', border: 'rgba(16,185,129,0.2)', text: 'var(--accent)' };
    case 'Medium': return { bg: 'rgba(245,158,11,0.06)', border: 'rgba(245,158,11,0.2)', text: '#D97706' };
    case 'High': return { bg: 'rgba(239,68,68,0.06)', border: 'rgba(239,68,68,0.2)', text: 'var(--destructive)' };
    case 'Critical': return { bg: 'rgba(127,29,29,0.08)', border: 'rgba(127,29,29,0.3)', text: '#7F1D1D' };
  }
}

function getRiskIcon(riskLevel: FraudScoringResult['riskLevel']) {
  switch (riskLevel) {
    case 'Low': return CheckCircle;
    case 'Medium': return ShieldAlert;
    case 'High': return ShieldAlert;
    case 'Critical': return ShieldX;
  }
}

function getStatusColor(status: string) {
  if (['Verified', 'Success', 'Clean', 'Approve'].includes(status)) return 'var(--accent)';
  if (['Mismatch', 'Failed', 'Duplicate Detected', 'Reject'].includes(status)) return 'var(--destructive)';
  return '#D97706';
}

export default function AIResultCard({ onUploadAnother, result }: AIResultCardProps) {
  const riskColors = getRiskColor(result.riskLevel);
  const RiskIcon = getRiskIcon(result.riskLevel);

  const resultItems = [
    {
      id: 'result-asset',
      icon: Brain,
      label: 'Asset Detected',
      value: result.assetDetected,
      detail: `Gemini Vision — ${result.confidenceScore}% confidence`,
      statusText: `${result.confidenceScore}%`,
    },
    {
      id: 'result-fraud',
      icon: ShieldCheck,
      label: 'Fraud Risk Score',
      value: `${result.fraudScore}% — ${result.riskLevel} Risk`,
      detail: result.duplicateCheckStatus,
      statusText: result.riskLevel,
    },
    {
      id: 'result-gps',
      icon: MapPin,
      label: 'GPS Match',
      value: `${result.gpsMatchStatus}`,
      detail: result.gpsVariance,
      statusText: result.gpsMatchStatus,
    },
    {
      id: 'result-ocr',
      icon: ScanText,
      label: 'OCR Invoice Match',
      value: result.ocrInvoiceMatch,
      detail: result.ocrMatchStatus,
      statusText: result.ocrMatchStatus,
    },
  ];

  const submissionId = `SUB-2026-${Math.floor(10000 + Math.random() * 90000)}`;

  return (
    <div className="space-y-4 animate-slide-up">
      {/* Header */}
      <div
        className="rounded-2xl p-4 border"
        style={{ background: riskColors.bg, borderColor: riskColors.border }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: riskColors.bg }}>
            <RiskIcon size={20} style={{ color: riskColors.text }} />
          </div>
          <div>
            <p className="text-sm font-bold" style={{ color: riskColors.text }}>
              AI Verification Complete — {result.riskLevel} Risk
            </p>
            <p className="text-xs" style={{ color: 'var(--secondary-foreground)' }}>
              Submission ID: {submissionId} · Sent to officer for final approval
            </p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-2xl font-extrabold tabular-nums" style={{ color: riskColors.text }}>
              {result.confidenceScore}%
            </p>
            <p className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>AI Confidence</p>
          </div>
        </div>
      </div>

      {/* Result items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {resultItems.map((item) => (
          <div
            key={item.id}
            className="rounded-xl border p-3 flex items-start gap-3"
            style={{ background: 'var(--muted)', borderColor: 'var(--border)' }}
          >
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
              <item.icon size={15} style={{ color: 'var(--primary)' }} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold tracking-wide" style={{ color: 'var(--muted-foreground)' }}>
                {item.label.toUpperCase()}
              </p>
              <p className="text-xs font-semibold mt-0.5" style={{ color: 'var(--foreground)' }}>
                {item.value}
              </p>
              <p className="text-[11px] mt-0.5" style={{ color: getStatusColor(item.statusText) }}>
                {item.detail}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Metadata flags */}
      {result.metadataFlags.length > 0 && (
        <div
          className="rounded-xl border p-3 space-y-1"
          style={{ background: 'rgba(239,68,68,0.04)', borderColor: 'rgba(239,68,68,0.15)' }}
        >
          <p className="text-[10px] font-semibold tracking-wide" style={{ color: 'var(--destructive)' }}>
            METADATA FLAGS DETECTED
          </p>
          {result.metadataFlags.map((flag, i) => (
            <p key={`flag-${i}`} className="text-xs flex items-start gap-2" style={{ color: 'var(--foreground)' }}>
              <span style={{ color: 'var(--destructive)' }}>⚠</span> {flag}
            </p>
          ))}
        </div>
      )}

      {/* AI Summary */}
      <div
        className="flex items-start gap-3 rounded-xl p-3 border"
        style={{ background: 'rgba(37,99,235,0.04)', borderColor: 'rgba(37,99,235,0.15)' }}
      >
        <AlertTriangle size={14} style={{ color: 'var(--primary)' }} className="shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-semibold mb-0.5" style={{ color: 'var(--foreground)' }}>
            AI Assessment
          </p>
          <p className="text-xs" style={{ color: 'var(--secondary-foreground)' }}>
            {result.summary}{' '}
            <span className="font-semibold">
              Recommendation: {result.recommendation}.
            </span>
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={onUploadAnother} className="btn-outline text-sm flex-1 gap-2">
          <RefreshCw size={14} />
          Upload Another
        </button>
        <button
          className="btn-primary text-sm flex-1 gap-2"
          onClick={() => navigator.clipboard?.writeText(submissionId)}
        >
          <Copy size={14} />
          Copy Submission ID
        </button>
      </div>
    </div>
  );
}