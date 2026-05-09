'use client';
import React, { useState } from 'react';
import { Eye, Download, ChevronDown, ChevronUp } from 'lucide-react';
import { StatusBadge, FraudBadge, GPSBadge } from '@/components/ui/StatusBadge';

interface HistoryRow {
  id: string;
  submissionId: string;
  milestone: string;
  assetType: string;
  submittedAt: string;
  status: 'verified' | 'pending' | 'processing' | 'rejected';
  fraudLevel: 'low' | 'medium' | 'high';
  fraudScore: number;
  gpsMatched: boolean;
  aiConfidence: number;
  officerName: string | null;
  remarks: string | null;
}

const history: HistoryRow[] = [
  { id: 'hist-001', submissionId: 'SUB-2026-04201', milestone: 'Milestone 1', assetType: 'Tractor Booking Receipt', submittedAt: '22 Mar 2026, 10:14', status: 'verified', fraudLevel: 'low', fraudScore: 3, gpsMatched: true, aiConfidence: 94, officerName: 'Rajesh Kumar', remarks: 'Booking receipt clearly visible. Amount matches loan disbursement.' },
  { id: 'hist-002', submissionId: 'SUB-2026-06812', milestone: 'Milestone 2', assetType: 'Tractor Delivery', submittedAt: '10 Apr 2026, 14:32', status: 'verified', fraudLevel: 'low', fraudScore: 5, gpsMatched: true, aiConfidence: 94, officerName: 'Rajesh Kumar', remarks: 'Tractor visible in field. GPS coordinates match farm location.' },
  { id: 'hist-003', submissionId: 'SUB-2026-07104', milestone: 'Milestone 2 (Retry)', assetType: 'Tractor in Field', submittedAt: '08 Apr 2026, 09:05', status: 'rejected', fraudLevel: 'medium', fraudScore: 38, gpsMatched: false, aiConfidence: 61, officerName: 'Rajesh Kumar', remarks: 'Image blurry. GPS coordinates do not match the registered farm address. Please retake from the actual field location.' },
  { id: 'hist-004', submissionId: 'SUB-2026-08421', milestone: 'Milestone 3', assetType: 'Tractor', submittedAt: '08 May 2026, 05:42', status: 'pending', fraudLevel: 'low', fraudScore: 4, gpsMatched: true, aiConfidence: 96, officerName: null, remarks: null },
];

export default function UploadHistoryTable() {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  return (
    <div className="card-base overflow-hidden">
      <div className="px-4 sm:px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Upload History</h3>
        <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
          All submissions for Loan KCC-2841 · {history.length} total
        </p>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden divide-y" style={{ borderColor: 'var(--border)' }}>
        {history.map((row) => (
          <div key={row.id}>
            <div
              className="px-4 py-3 space-y-2 cursor-pointer hover:bg-muted/30 transition-colors"
              onClick={() => setExpandedRow(expandedRow === row.id ? null : row.id)}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs font-mono font-semibold" style={{ color: 'var(--primary)' }}>{row.submissionId}</p>
                  <p className="text-xs font-medium mt-0.5" style={{ color: 'var(--foreground)' }}>{row.milestone} · {row.assetType}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <StatusBadge status={row.status} size="sm" />
                  {expandedRow === row.id ? <ChevronUp size={13} style={{ color: 'var(--muted-foreground)' }} /> : <ChevronDown size={13} style={{ color: 'var(--muted-foreground)' }} />}
                </div>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <div className="h-1.5 w-12 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                    <div className="h-full rounded-full" style={{ width: `${row.aiConfidence}%`, background: row.aiConfidence >= 80 ? 'var(--accent)' : row.aiConfidence >= 60 ? 'var(--warning)' : 'var(--destructive)' }} />
                  </div>
                  <span className="text-xs font-semibold" style={{ color: row.aiConfidence >= 80 ? 'var(--accent)' : row.aiConfidence >= 60 ? 'var(--warning)' : 'var(--destructive)' }}>{row.aiConfidence}%</span>
                </div>
                <FraudBadge level={row.fraudLevel} score={row.fraudScore} />
                <GPSBadge matched={row.gpsMatched} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px]" style={{ color: 'var(--muted-foreground)' }}>{row.submittedAt}</span>
                {row.officerName && <span className="text-xs" style={{ color: 'var(--secondary-foreground)' }}>{row.officerName}</span>}
              </div>
            </div>
            {expandedRow === row.id && row.remarks && (
              <div className="px-4 py-3 border-t" style={{ background: 'var(--muted)', borderColor: 'var(--border)' }}>
                <div className="flex items-start gap-3">
                  <div className={`w-1 self-stretch rounded-full ${row.status === 'verified' ? 'bg-accent' : row.status === 'rejected' ? 'bg-destructive' : 'bg-primary'}`} />
                  <div>
                    <p className="text-[10px] font-semibold tracking-wide mb-1" style={{ color: 'var(--muted-foreground)' }}>OFFICER REMARKS — {row.officerName}</p>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--secondary-foreground)' }}>{row.remarks}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
              {['Submission ID', 'Milestone', 'Asset Type', 'Submitted', 'AI Confidence', 'Fraud Risk', 'GPS', 'Status', 'Officer', ''].map((col) => (
                <th key={`history-col-${col}`} className="px-4 py-3 text-left text-[11px] font-semibold tracking-wide whitespace-nowrap" style={{ color: 'var(--muted-foreground)' }}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {history.map((row) => (
              <React.Fragment key={row.id}>
                <tr className="group hover:bg-muted/30 transition-colors duration-100 cursor-pointer" onClick={() => setExpandedRow(expandedRow === row.id ? null : row.id)}>
                  <td className="px-4 py-3"><span className="text-xs font-mono font-semibold" style={{ color: 'var(--primary)' }}>{row.submissionId}</span></td>
                  <td className="px-4 py-3"><span className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>{row.milestone}</span></td>
                  <td className="px-4 py-3"><span className="text-xs" style={{ color: 'var(--secondary-foreground)' }}>{row.assetType}</span></td>
                  <td className="px-4 py-3"><span className="text-[11px] whitespace-nowrap" style={{ color: 'var(--muted-foreground)' }}>{row.submittedAt}</span></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <div className="h-1.5 w-14 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                        <div className="h-full rounded-full" style={{ width: `${row.aiConfidence}%`, background: row.aiConfidence >= 80 ? 'var(--accent)' : row.aiConfidence >= 60 ? 'var(--warning)' : 'var(--destructive)' }} />
                      </div>
                      <span className="text-xs font-semibold tabular-nums" style={{ color: row.aiConfidence >= 80 ? 'var(--accent)' : row.aiConfidence >= 60 ? 'var(--warning)' : 'var(--destructive)' }}>{row.aiConfidence}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3"><FraudBadge level={row.fraudLevel} score={row.fraudScore} /></td>
                  <td className="px-4 py-3"><GPSBadge matched={row.gpsMatched} /></td>
                  <td className="px-4 py-3"><StatusBadge status={row.status} size="sm" /></td>
                  <td className="px-4 py-3"><span className="text-xs" style={{ color: 'var(--secondary-foreground)' }}>{row.officerName ?? '—'}</span></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button title="View submission details" className="p-1.5 rounded-lg hover:bg-muted transition-colors opacity-0 group-hover:opacity-100" onClick={(e) => e.stopPropagation()}><Eye size={13} style={{ color: 'var(--muted-foreground)' }} /></button>
                      <button title="Download AI report" className="p-1.5 rounded-lg hover:bg-muted transition-colors opacity-0 group-hover:opacity-100" onClick={(e) => e.stopPropagation()}><Download size={13} style={{ color: 'var(--muted-foreground)' }} /></button>
                      {expandedRow === row.id ? <ChevronUp size={13} style={{ color: 'var(--muted-foreground)' }} /> : <ChevronDown size={13} style={{ color: 'var(--muted-foreground)' }} />}
                    </div>
                  </td>
                </tr>
                {expandedRow === row.id && row.remarks && (
                  <tr style={{ background: 'var(--muted)' }}>
                    <td colSpan={10} className="px-4 py-3">
                      <div className="flex items-start gap-3">
                        <div className={`w-1 self-stretch rounded-full ${row.status === 'verified' ? 'bg-accent' : row.status === 'rejected' ? 'bg-destructive' : 'bg-primary'}`} />
                        <div>
                          <p className="text-[10px] font-semibold tracking-wide mb-1" style={{ color: 'var(--muted-foreground)' }}>OFFICER REMARKS — {row.officerName}</p>
                          <p className="text-xs leading-relaxed" style={{ color: 'var(--secondary-foreground)' }}>{row.remarks}</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}