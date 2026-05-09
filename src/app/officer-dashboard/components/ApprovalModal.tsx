'use client';
import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, ShieldAlert, MapPin, Brain, ScanText, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { StatusBadge, FraudBadge, GPSBadge } from '@/components/ui/StatusBadge';
import AppImage from '@/components/ui/AppImage';

interface Submission {
  id: string;
  beneficiaryName: string;
  loanId: string;
  scheme: string;
  assetType: string;
  submittedAt: string;
  status: 'verified' | 'pending' | 'processing' | 'rejected';
  fraudLevel: 'low' | 'medium' | 'high';
  fraudScore: number;
  gpsMatched: boolean;
  aiConfidence: number;
  district: string;
  amount: string;
}

interface ApprovalModalProps {
  isOpen: boolean;
  submission: Submission | null;
  action: 'approve' | 'reject';
  onClose: () => void;
  onConfirm: () => void;
}

const aiEvidenceItems = [
{ icon: Brain, label: 'Asset Detected', value: 'Tractor (Mahindra 265 DI)', status: 'success' as const },
{ icon: ShieldCheck, label: 'AI Confidence Score', value: '96% — High Confidence', status: 'success' as const },
{ icon: ShieldAlert, label: 'Fraud Risk Score', value: '4% — Low Risk', status: 'success' as const },
{ icon: MapPin, label: 'GPS Validation', value: 'Matched within 1.2km radius', status: 'success' as const },
{ icon: ScanText, label: 'OCR Invoice Match', value: 'Invoice ₹4.18L — Loan ₹4.2L ✓', status: 'success' as const },
{ icon: AlertTriangle, label: 'Duplicate Check', value: 'No duplicate images found', status: 'success' as const }];


export default function ApprovalModal({ isOpen, submission, action, onClose, onConfirm }: ApprovalModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setRemarks('');
    } else {
      document.body.style.overflow = '';
    }
    return () => {document.body.style.overflow = '';};
  }, [isOpen]);

  if (!isOpen || !submission) return null;

  const isApprove = action === 'approve';

  const handleConfirm = async () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onConfirm();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div
        className="relative card-base shadow-card-hover w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in">
        
        {/* Modal Header */}
        <div className="sticky top-0 z-10 px-6 py-4 border-b flex items-center justify-between" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isApprove ? 'bg-green-50' : 'bg-red-50'}`}>
              {isApprove ?
              <CheckCircle size={18} style={{ color: 'var(--accent)' }} /> :
              <XCircle size={18} style={{ color: 'var(--destructive)' }} />
              }
            </div>
            <div>
              <h2 className="text-base font-bold" style={{ color: 'var(--foreground)' }}>
                {isApprove ? 'Approve Verification' : 'Reject Submission'}
              </h2>
              <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                {submission.loanId} · {submission.beneficiaryName}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-muted transition-colors">
            <X size={16} style={{ color: 'var(--muted-foreground)' }} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Beneficiary Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
            { label: 'Beneficiary', value: submission.beneficiaryName },
            { label: 'Loan ID', value: submission.loanId },
            { label: 'Scheme', value: submission.scheme },
            { label: 'Loan Amount', value: submission.amount }].
            map((item) =>
            <div key={`modal-info-${item.label}`} className="rounded-xl p-3" style={{ background: 'var(--muted)' }}>
                <p className="text-[10px] font-semibold tracking-wide mb-1" style={{ color: 'var(--muted-foreground)' }}>
                  {item.label.toUpperCase()}
                </p>
                <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{item.value}</p>
              </div>
            )}
          </div>

          {/* Asset Image Preview */}
          <div>
            <p className="text-xs font-semibold tracking-wide mb-2" style={{ color: 'var(--muted-foreground)' }}>
              SUBMITTED ASSET IMAGE
            </p>
            <div className="rounded-2xl overflow-hidden border relative" style={{ borderColor: 'var(--border)' }}>
              <AppImage
                src="https://img.rocket.new/generatedImages/rocket_gen_img_12b6ec6f4-1778221955438.png"
                alt="Tractor asset photograph submitted by beneficiary as loan utilization proof"
                width={600}
                height={280}
                className="w-full object-cover"
                style={{ height: '180px' }} />
              
              <div className="absolute top-3 right-3 flex gap-2">
                <span className="badge-base status-verified text-[10px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                  GPS Tagged
                </span>
                <span className="badge-base text-[10px]" style={{ background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none' }}>
                  08 May 2026 05:42 IST
                </span>
              </div>
            </div>
          </div>

          {/* AI Evidence */}
          <div>
            <p className="text-xs font-semibold tracking-wide mb-3" style={{ color: 'var(--muted-foreground)' }}>
              AI VERIFICATION EVIDENCE
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {aiEvidenceItems.map((item) =>
              <div
                key={`evidence-${item.label}`}
                className="flex items-start gap-3 rounded-xl p-3 border"
                style={{ background: 'var(--muted)', borderColor: 'var(--border)' }}>
                
                  <div className="w-7 h-7 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                    <item.icon size={14} style={{ color: 'var(--accent)' }} />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold" style={{ color: 'var(--muted-foreground)' }}>{item.label}</p>
                    <p className="text-xs font-medium mt-0.5" style={{ color: 'var(--foreground)' }}>{item.value}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Status badges */}
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={submission.status} />
            <FraudBadge level={submission.fraudLevel} score={submission.fraudScore} />
            <GPSBadge matched={submission.gpsMatched} />
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--foreground)' }}>
              Officer Remarks {!isApprove && <span style={{ color: 'var(--destructive)' }}>*</span>}
            </label>
            <p className="text-xs mb-2" style={{ color: 'var(--muted-foreground)' }}>
              {isApprove ?
              'Optional note for audit trail' :
              'Required — explain the reason for rejection so the beneficiary can resubmit correctly'}
            </p>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={3}
              placeholder={isApprove ? 'e.g. Asset clearly visible, GPS coordinates match field visit record' : 'e.g. GPS coordinates are 48km from the loan site — beneficiary must re-upload from the actual asset location'}
              className="input-base resize-none text-xs" />
            
          </div>
        </div>

        {/* Modal Footer */}
        <div className="sticky bottom-0 px-6 py-4 border-t flex items-center justify-between gap-3" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
            This action will be recorded in the audit log.
          </p>
          <div className="flex gap-3">
            <button onClick={onClose} className="btn-outline text-sm px-4 py-2">
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={isLoading || !isApprove && !remarks.trim()}
              className={`inline-flex items-center justify-center gap-2 px-5 py-2 rounded-xl font-semibold text-sm text-white transition-all duration-150 active:scale-95 disabled:opacity-60 min-w-[120px] ${
              isApprove ? 'btn-accent' : 'bg-destructive hover:bg-red-700'}`
              }>
              
              {isLoading ?
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> :

              <>
                  {isApprove ? <CheckCircle size={15} /> : <XCircle size={15} />}
                  {isApprove ? 'Approve Loan' : 'Reject Submission'}
                </>
              }
            </button>
          </div>
        </div>
      </div>
    </div>);

}