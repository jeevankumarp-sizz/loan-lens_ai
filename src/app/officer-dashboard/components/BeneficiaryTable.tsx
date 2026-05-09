'use client';
import React, { useState, useMemo } from 'react';
import { Search, Eye, CheckCircle, XCircle, ChevronUp, ChevronDown, ChevronsUpDown, FileText, FileSpreadsheet, Filter } from 'lucide-react';
import { StatusBadge, FraudBadge, GPSBadge } from '@/components/ui/StatusBadge';
import ApprovalModal from './ApprovalModal';
import EmptyState from '@/components/ui/EmptyState';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

type SortDir = 'asc' | 'desc' | null;

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

const initialSubmissions: Submission[] = [
  { id: 'sub-001', beneficiaryName: 'Priya Devi Sharma', loanId: 'KCC-2841', scheme: 'KCC', assetType: 'Tractor', submittedAt: '08 May 2026, 05:42', status: 'pending', fraudLevel: 'low', fraudScore: 4, gpsMatched: true, aiConfidence: 96, district: 'Nashik', amount: '₹4.2L' },
  { id: 'sub-002', beneficiaryName: 'Ramesh Yadav', loanId: 'PMAY-1192', scheme: 'PMAY-G', assetType: 'House Construction', submittedAt: '08 May 2026, 05:18', status: 'pending', fraudLevel: 'low', fraudScore: 8, gpsMatched: true, aiConfidence: 88, district: 'Pune', amount: '₹2.8L' },
  { id: 'sub-003', beneficiaryName: 'Sunita Kumari', loanId: 'MUDRA-4421', scheme: 'MUDRA', assetType: 'Sewing Machine', submittedAt: '08 May 2026, 04:55', status: 'processing', fraudLevel: 'medium', fraudScore: 42, gpsMatched: true, aiConfidence: 71, district: 'Aurangabad', amount: '₹80K' },
  { id: 'sub-004', beneficiaryName: 'Arjun Singh Chauhan', loanId: 'KCC-3305', scheme: 'KCC', assetType: 'Pump Set', submittedAt: '08 May 2026, 04:33', status: 'rejected', fraudLevel: 'high', fraudScore: 88, gpsMatched: false, aiConfidence: 12, district: 'Nagpur', amount: '₹1.5L' },
  { id: 'sub-005', beneficiaryName: 'Meena Bai', loanId: 'SHG-0814', scheme: 'SHG Loan', assetType: 'Goat Farm', submittedAt: '08 May 2026, 04:11', status: 'verified', fraudLevel: 'low', fraudScore: 3, gpsMatched: true, aiConfidence: 93, district: 'Solapur', amount: '₹60K' },
  { id: 'sub-006', beneficiaryName: 'Vikram Rathore', loanId: 'PMAY-3391', scheme: 'PMAY-G', assetType: 'House Renovation', submittedAt: '08 May 2026, 03:48', status: 'pending', fraudLevel: 'high', fraudScore: 91, gpsMatched: false, aiConfidence: 31, district: 'Latur', amount: '₹1.8L' },
  { id: 'sub-007', beneficiaryName: 'Kavita Deshmukh', loanId: 'KCC-2890', scheme: 'KCC', assetType: 'Irrigation Equipment', submittedAt: '08 May 2026, 03:22', status: 'verified', fraudLevel: 'low', fraudScore: 6, gpsMatched: true, aiConfidence: 91, district: 'Kolhapur', amount: '₹3.1L' },
  { id: 'sub-008', beneficiaryName: 'Deepak Nair', loanId: 'MUDRA-5512', scheme: 'MUDRA', assetType: 'Welding Machine', submittedAt: '08 May 2026, 02:59', status: 'processing', fraudLevel: 'medium', fraudScore: 37, gpsMatched: true, aiConfidence: 68, district: 'Thane', amount: '₹1.2L' },
  { id: 'sub-009', beneficiaryName: 'Shanta Bai Patil', loanId: 'PM-0612', scheme: 'PM Kisan', assetType: 'Seed Purchase', submittedAt: '08 May 2026, 02:31', status: 'verified', fraudLevel: 'low', fraudScore: 2, gpsMatched: true, aiConfidence: 97, district: 'Sangli', amount: '₹2K' },
  { id: 'sub-010', beneficiaryName: 'Raju Mahato', loanId: 'KCC-2901', scheme: 'KCC', assetType: 'Tractor Attachment', submittedAt: '08 May 2026, 02:08', status: 'pending', fraudLevel: 'medium', fraudScore: 51, gpsMatched: true, aiConfidence: 74, district: 'Jalgaon', amount: '₹1.9L' },
  { id: 'sub-011', beneficiaryName: 'Lalita Devi', loanId: 'NABARD-112', scheme: 'NABARD', assetType: 'Cold Storage Unit', submittedAt: '07 May 2026, 18:44', status: 'verified', fraudLevel: 'low', fraudScore: 5, gpsMatched: true, aiConfidence: 89, district: 'Ahmednagar', amount: '₹8.5L' },
  { id: 'sub-012', beneficiaryName: 'Suresh Kumar Gupta', loanId: 'PMAY-4102', scheme: 'PMAY-G', assetType: 'House Foundation', submittedAt: '07 May 2026, 17:22', status: 'pending', fraudLevel: 'high', fraudScore: 78, gpsMatched: false, aiConfidence: 41, district: 'Beed', amount: '₹2.4L' },
];

const ALL_DISTRICTS = ['Nashik', 'Pune', 'Aurangabad', 'Nagpur', 'Solapur', 'Latur', 'Kolhapur', 'Thane', 'Sangli', 'Jalgaon', 'Ahmednagar', 'Beed'];

type SortKey = keyof Submission;

export default function BeneficiaryTable() {
  const { t } = useLanguage();
  const [submissions, setSubmissions] = useState<Submission[]>(initialSubmissions);
  const [updatedIds, setUpdatedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [schemeFilter, setSchemeFilter] = useState('all');
  const [fraudFilter, setFraudFilter] = useState('all');
  const [districtFilter, setDistrictFilter] = useState('all');
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [showFilters, setShowFilters] = useState(false);
  const [approvalModal, setApprovalModal] = useState<{ open: boolean; submission: Submission | null; action: 'approve' | 'reject' }>({
    open: false, submission: null, action: 'approve',
  });

  const filtered = useMemo(() => {
    let rows = submissions;
    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.beneficiaryName.toLowerCase().includes(q) ||
          r.loanId.toLowerCase().includes(q) ||
          r.district.toLowerCase().includes(q) ||
          r.assetType.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'all') rows = rows.filter((r) => r.status === statusFilter);
    if (schemeFilter !== 'all') rows = rows.filter((r) => r.scheme === schemeFilter);
    if (fraudFilter !== 'all') rows = rows.filter((r) => r.fraudLevel === fraudFilter);
    if (districtFilter !== 'all') rows = rows.filter((r) => r.district === districtFilter);
    if (sortKey && sortDir) {
      rows = [...rows].sort((a, b) => {
        const aVal = a[sortKey];
        const bVal = b[sortKey];
        const cmp = typeof aVal === 'string' ? aVal.localeCompare(bVal as string) : (aVal as number) - (bVal as number);
        return sortDir === 'asc' ? cmp : -cmp;
      });
    }
    return rows;
  }, [submissions, search, statusFilter, schemeFilter, fraudFilter, districtFilter, sortKey, sortDir]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : d === 'desc' ? null : 'asc'));
      if (sortDir === 'desc') setSortKey(null);
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === paginated.length) setSelected(new Set());
    else setSelected(new Set(paginated.map((r) => r.id)));
  };

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sortKey !== k) return <ChevronsUpDown size={12} style={{ color: 'var(--muted-foreground)' }} />;
    return sortDir === 'asc' ? (
      <ChevronUp size={12} style={{ color: 'var(--primary)' }} />
    ) : (
      <ChevronDown size={12} style={{ color: 'var(--primary)' }} />
    );
  };

  const openApproval = (submission: Submission, action: 'approve' | 'reject') => {
    setApprovalModal({ open: true, submission, action });
  };

  const handleApprovalConfirm = () => {
    const { submission, action } = approvalModal;
    if (!submission) return;

    const newStatus: Submission['status'] = action === 'approve' ? 'verified' : 'rejected';

    setSubmissions((prev) =>
      prev.map((s) => (s.id === submission.id ? { ...s, status: newStatus } : s))
    );
    setUpdatedIds((prev) => new Set([...prev, submission.id]));
    setTimeout(() => {
      setUpdatedIds((prev) => {
        const next = new Set(prev);
        next.delete(submission.id);
        return next;
      });
    }, 2000);

    toast.success(
      action === 'approve'
        ? `Loan ${submission.loanId} approved successfully`
        : `Loan ${submission.loanId} rejected`,
      { duration: 3000 }
    );
    setApprovalModal({ open: false, submission: null, action: 'approve' });
  };

  const activeFiltersCount = [statusFilter, schemeFilter, fraudFilter, districtFilter].filter(f => f !== 'all').length;

  const exportCSV = () => {
    const headers = [
      'Loan ID', 'Beneficiary Name', 'Scheme', 'Asset Type', 'District',
      'Amount', 'AI Confidence (%)', 'Fraud Score', 'Fraud Level',
      'GPS Matched', 'Status', 'Submitted At',
    ];
    let rows = filtered.map((r) => [
      r.loanId, r.beneficiaryName, r.scheme, r.assetType, r.district,
      r.amount, r.aiConfidence, r.fraudScore, r.fraudLevel,
      r.gpsMatched ? 'Yes' : 'No', r.status, r.submittedAt,
    ]);
    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `beneficiary-submissions-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported successfully');
  };

  const exportPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) { toast.error('Please allow pop-ups to export PDF'); return; }
    let rows = filtered.map((r) => `
      <tr>
        <td>${r.loanId}</td><td>${r.beneficiaryName}</td><td>${r.scheme}</td>
        <td>${r.assetType}</td><td>${r.district}</td><td>${r.amount}</td>
        <td>${r.aiConfidence}%</td><td>${r.fraudScore} (${r.fraudLevel})</td>
        <td>${r.gpsMatched ? '✓' : '✗'}</td><td>${r.status}</td><td>${r.submittedAt}</td>
      </tr>`).join('');
    printWindow.document.write(`<!DOCTYPE html>
<html><head><meta charset="utf-8"/><title>Beneficiary Submissions Report</title>
<style>body{font-family:Arial,sans-serif;font-size:11px;color:#111;margin:24px}h2{font-size:16px;margin-bottom:4px}p.meta{font-size:10px;color:#555;margin-bottom:16px}table{width:100%;border-collapse:collapse}th{background:#1e40af;color:#fff;padding:6px 8px;text-align:left;font-size:10px}td{padding:5px 8px;border-bottom:1px solid #e5e7eb}tr:nth-child(even) td{background:#f8fafc}@media print{body{margin:0}}</style>
</head><body>
<h2>Beneficiary Submissions — Government Compliance Report</h2>
<p class="meta">Generated: ${new Date().toLocaleString()} | Total records: ${filtered.length}</p>
<table><thead><tr><th>Loan ID</th><th>Beneficiary</th><th>Scheme</th><th>Asset Type</th><th>District</th><th>Amount</th><th>AI Conf.</th><th>Fraud Risk</th><th>GPS</th><th>Status</th><th>Submitted At</th></tr></thead>
<tbody>${rows}</tbody></table></body></html>`);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); printWindow.close(); }, 400);
    toast.success('PDF export initiated');
  };

  return (
    <motion.div
      className="card-base overflow-hidden"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Table Header */}
      <div className="px-4 sm:px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
        {/* Top row: title + export buttons */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Beneficiary Submissions</h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
              {filtered.length} submissions · {submissions.filter((s) => s.status === 'pending').length} pending action
            </p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button onClick={exportCSV} className="btn-outline text-xs py-2 px-2.5 gap-1 flex items-center" title="Export CSV">
              <FileSpreadsheet size={13} />
              <span className="hidden sm:inline">CSV</span>
            </button>
            <button onClick={exportPDF} className="btn-outline text-xs py-2 px-2.5 gap-1 flex items-center" title="Export PDF">
              <FileText size={13} />
              <span className="hidden sm:inline">PDF</span>
            </button>
          </div>
        </div>

        {/* Search + Filter toggle row */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }} />
            <input
              type="text"
              placeholder={t('searchBeneficiaries')}
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="input-base pl-8 text-xs w-full py-2"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-colors hover:bg-muted shrink-0"
            style={{ borderColor: activeFiltersCount > 0 ? 'var(--primary)' : 'var(--border)', color: activeFiltersCount > 0 ? 'var(--primary)' : 'var(--secondary-foreground)' }}
          >
            <Filter size={13} />
            <span className="hidden sm:inline">Filters</span>
            {activeFiltersCount > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white" style={{ background: 'var(--primary)' }}>
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {/* Collapsible filter row */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
                <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="input-base text-xs py-2 flex-1 min-w-[120px]">
                  <option value="all">{t('allStatus')}</option>
                  <option value="pending">{t('pending')}</option>
                  <option value="processing">{t('processing')}</option>
                  <option value="verified">{t('verified')}</option>
                  <option value="rejected">{t('rejected')}</option>
                </select>
                <select value={schemeFilter} onChange={(e) => { setSchemeFilter(e.target.value); setPage(1); }} className="input-base text-xs py-2 flex-1 min-w-[110px]">
                  <option value="all">{t('allSchemes')}</option>
                  <option value="KCC">KCC</option>
                  <option value="PMAY-G">PMAY-G</option>
                  <option value="MUDRA">MUDRA</option>
                  <option value="PM Kisan">PM Kisan</option>
                  <option value="SHG Loan">SHG Loan</option>
                  <option value="NABARD">NABARD</option>
                </select>
                <select value={fraudFilter} onChange={(e) => { setFraudFilter(e.target.value); setPage(1); }} className="input-base text-xs py-2 flex-1 min-w-[110px]">
                  <option value="all">{t('allRiskLevels')}</option>
                  <option value="low">{t('lowRisk')}</option>
                  <option value="medium">{t('mediumRisk')}</option>
                  <option value="high">{t('highRisk')}</option>
                </select>
                <select value={districtFilter} onChange={(e) => { setDistrictFilter(e.target.value); setPage(1); }} className="input-base text-xs py-2 flex-1 min-w-[120px]">
                  <option value="all">{t('allDistricts')}</option>
                  {ALL_DISTRICTS.map((d) => <option key={`district-${d}`} value={d}>{d}</option>)}
                </select>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={() => { setStatusFilter('all'); setSchemeFilter('all'); setFraudFilter('all'); setDistrictFilter('all'); setSearch(''); }}
                    className="text-xs font-semibold transition-colors hover:opacity-70 px-2"
                    style={{ color: 'var(--destructive)' }}
                  >
                    Clear all
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 sm:px-5 py-2.5 border-b flex flex-wrap items-center gap-2 sm:gap-3"
          style={{ background: 'rgba(37,99,235,0.04)', borderColor: 'var(--border)' }}
        >
          <span className="text-xs font-semibold" style={{ color: 'var(--primary)' }}>{selected.size} selected</span>
          <button onClick={() => { toast.success(`${selected.size} submissions approved`); setSelected(new Set()); }} className="btn-accent text-xs py-1.5 px-3">Approve Selected</button>
          <button onClick={() => { toast.error(`${selected.size} submissions rejected`); setSelected(new Set()); }} className="text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors hover:bg-red-50" style={{ color: 'var(--destructive)', borderColor: 'var(--destructive)' }}>Reject Selected</button>
          <button onClick={() => setSelected(new Set())} className="ml-auto text-xs" style={{ color: 'var(--muted-foreground)' }}>Clear</button>
        </motion.div>
      )}

      {/* Mobile Card View (< md) */}
      <div className="md:hidden">
        {paginated.length === 0 ? (
          <EmptyState title="No submissions found" description="Try adjusting your search or filter criteria." />
        ) : (
          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            <AnimatePresence>
              {paginated.map((row, rowIdx) => {
                const isJustUpdated = updatedIds.has(row.id);
                return (
                  <motion.div
                    key={row.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0, backgroundColor: isJustUpdated ? (row.status === 'verified' ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)') : 'transparent' }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: rowIdx * 0.03, duration: 0.25 }}
                    className="px-4 py-3 space-y-2"
                  >
                    {/* Row 1: Name + Status */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0" style={{ background: 'var(--muted)', color: 'var(--secondary-foreground)' }}>
                          {row.beneficiaryName.split(' ').slice(0, 2).map((n) => n[0]).join('')}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate" style={{ color: 'var(--foreground)' }}>{row.beneficiaryName}</p>
                          <p className="text-xs font-mono" style={{ color: 'var(--primary)' }}>{row.loanId}</p>
                        </div>
                      </div>
                      <motion.div key={`status-${row.id}-${row.status}`} initial={isJustUpdated ? { scale: 0.8, opacity: 0 } : false} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 25 }}>
                        <StatusBadge status={row.status} size="sm" />
                      </motion.div>
                    </div>
                    {/* Row 2: Scheme + District + Amount */}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                      <span>{row.scheme}</span>
                      <span>{row.assetType}</span>
                      <span>{row.district}</span>
                      <span className="font-semibold" style={{ color: 'var(--foreground)' }}>{row.amount}</span>
                    </div>
                    {/* Row 3: AI Confidence + Fraud + GPS */}
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <div className="h-1.5 w-14 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                          <div className="h-full rounded-full" style={{ width: `${row.aiConfidence}%`, background: row.aiConfidence >= 80 ? 'var(--accent)' : row.aiConfidence >= 60 ? 'var(--warning)' : 'var(--destructive)' }} />
                        </div>
                        <span className="text-xs font-semibold tabular-nums" style={{ color: row.aiConfidence >= 80 ? 'var(--accent)' : row.aiConfidence >= 60 ? 'var(--warning)' : 'var(--destructive)' }}>{row.aiConfidence}%</span>
                      </div>
                      <FraudBadge level={row.fraudLevel} score={row.fraudScore} />
                      <GPSBadge matched={row.gpsMatched} />
                    </div>
                    {/* Row 4: Time + Actions */}
                    <div className="flex items-center justify-between">
                      <span className="text-[11px]" style={{ color: 'var(--muted-foreground)' }}>{row.submittedAt}</span>
                      <div className="flex items-center gap-1">
                        <button title="View AI Evidence" className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                          <Eye size={14} style={{ color: 'var(--muted-foreground)' }} />
                        </button>
                        {row.status === 'pending' && (
                          <>
                            <button title="Approve" onClick={() => openApproval(row, 'approve')} className="p-1.5 rounded-lg hover:bg-green-50 transition-colors">
                              <CheckCircle size={14} style={{ color: 'var(--accent)' }} />
                            </button>
                            <button title="Reject" onClick={() => openApproval(row, 'reject')} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors">
                              <XCircle size={14} style={{ color: 'var(--destructive)' }} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Desktop Table View (>= md) */}
      <div className="hidden md:block overflow-x-auto">
        {paginated.length === 0 ? (
          <EmptyState title="No submissions found" description="Try adjusting your search or filter criteria to find beneficiary submissions." />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
                <th className="w-10 px-4 py-3">
                  <input type="checkbox" checked={selected.size === paginated.length && paginated.length > 0} onChange={toggleAll} className="rounded" />
                </th>
                {[
                  { label: 'Beneficiary', key: 'beneficiaryName' as SortKey },
                  { label: 'Loan ID', key: 'loanId' as SortKey },
                  { label: 'Scheme', key: 'scheme' as SortKey },
                  { label: 'Asset Type', key: 'assetType' as SortKey },
                  { label: 'District', key: 'district' as SortKey },
                  { label: 'Amount', key: 'amount' as SortKey },
                  { label: 'AI Confidence', key: 'aiConfidence' as SortKey },
                  { label: 'Fraud Risk', key: 'fraudScore' as SortKey },
                  { label: 'GPS', key: 'gpsMatched' as SortKey },
                  { label: 'Status', key: 'status' as SortKey },
                  { label: 'Submitted', key: 'submittedAt' as SortKey },
                  { label: 'Actions', key: null },
                ].map((col) => (
                  <th
                    key={`col-${col.label}`}
                    className={`px-4 py-3 text-left text-[11px] font-semibold tracking-wide whitespace-nowrap ${col.key ? 'cursor-pointer hover:bg-muted/80 select-none' : ''}`}
                    style={{ color: 'var(--muted-foreground)' }}
                    onClick={col.key ? () => toggleSort(col.key!) : undefined}
                  >
                    <span className="flex items-center gap-1">{col.label}{col.key && <SortIcon k={col.key} />}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
              <AnimatePresence>
                {paginated.map((row, rowIdx) => {
                  const isJustUpdated = updatedIds.has(row.id);
                  return (
                    <motion.tr
                      key={row.id}
                      layout
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0, backgroundColor: isJustUpdated ? (row.status === 'verified' ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)') : row.fraudLevel === 'high' ? 'rgba(239,68,68,0.02)' : 'transparent' }}
                      exit={{ opacity: 0, x: 8 }}
                      transition={{ delay: rowIdx * 0.03, duration: 0.25 }}
                      className="group hover:bg-muted/30 transition-colors duration-100"
                    >
                      <td className="px-4 py-3"><input type="checkbox" checked={selected.has(row.id)} onChange={() => toggleSelect(row.id)} className="rounded" /></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0" style={{ background: 'var(--muted)', color: 'var(--secondary-foreground)' }}>
                            {row.beneficiaryName.split(' ').slice(0, 2).map((n) => n[0]).join('')}
                          </div>
                          <span className="text-sm font-medium whitespace-nowrap" style={{ color: 'var(--foreground)' }}>{row.beneficiaryName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3"><span className="text-xs font-mono font-semibold" style={{ color: 'var(--primary)' }}>{row.loanId}</span></td>
                      <td className="px-4 py-3"><span className="text-xs" style={{ color: 'var(--secondary-foreground)' }}>{row.scheme}</span></td>
                      <td className="px-4 py-3"><span className="text-xs" style={{ color: 'var(--foreground)' }}>{row.assetType}</span></td>
                      <td className="px-4 py-3"><span className="text-xs" style={{ color: 'var(--secondary-foreground)' }}>{row.district}</span></td>
                      <td className="px-4 py-3"><span className="text-xs font-semibold tabular-nums" style={{ color: 'var(--foreground)' }}>{row.amount}</span></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <div className="h-1.5 w-16 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                            <div className="h-full rounded-full" style={{ width: `${row.aiConfidence}%`, background: row.aiConfidence >= 80 ? 'var(--accent)' : row.aiConfidence >= 60 ? 'var(--warning)' : 'var(--destructive)' }} />
                          </div>
                          <span className="text-xs font-semibold tabular-nums" style={{ color: row.aiConfidence >= 80 ? 'var(--accent)' : row.aiConfidence >= 60 ? 'var(--warning)' : 'var(--destructive)' }}>{row.aiConfidence}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3"><FraudBadge level={row.fraudLevel} score={row.fraudScore} /></td>
                      <td className="px-4 py-3"><GPSBadge matched={row.gpsMatched} /></td>
                      <td className="px-4 py-3">
                        <motion.div key={`status-${row.id}-${row.status}`} initial={isJustUpdated ? { scale: 0.8, opacity: 0 } : false} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 25 }}>
                          <StatusBadge status={row.status} size="sm" />
                        </motion.div>
                      </td>
                      <td className="px-4 py-3"><span className="text-[11px] whitespace-nowrap" style={{ color: 'var(--muted-foreground)' }}>{row.submittedAt}</span></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                          <button title="View AI Evidence" className="p-1.5 rounded-lg hover:bg-muted transition-colors"><Eye size={14} style={{ color: 'var(--muted-foreground)' }} /></button>
                          {row.status === 'pending' && (
                            <>
                              <button title="Approve Submission" onClick={() => openApproval(row, 'approve')} className="p-1.5 rounded-lg hover:bg-green-50 transition-colors"><CheckCircle size={14} style={{ color: 'var(--accent)' }} /></button>
                              <button title="Reject Submission" onClick={() => openApproval(row, 'reject')} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"><XCircle size={14} style={{ color: 'var(--destructive)' }} /></button>
                            </>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      <div className="px-4 sm:px-5 py-3 border-t flex flex-wrap items-center justify-between gap-3" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--muted-foreground)' }}>
          <span>Show</span>
          <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }} className="input-base text-xs py-1 w-16">
            {[5, 8, 12, 20].map((n) => <option key={`pagesize-${n}`} value={n}>{n}</option>)}
          </select>
          <span>of {filtered.length}</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-all disabled:opacity-40 hover:bg-muted" style={{ borderColor: 'var(--border)', color: 'var(--secondary-foreground)' }}>Prev</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button key={`page-${p}`} onClick={() => setPage(p)} className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${page === p ? 'text-white shadow-primary' : 'hover:bg-muted'}`} style={{ background: page === p ? 'var(--primary)' : 'transparent', color: page === p ? 'white' : 'var(--secondary-foreground)' }}>{p}</button>
          ))}
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-all disabled:opacity-40 hover:bg-muted" style={{ borderColor: 'var(--border)', color: 'var(--secondary-foreground)' }}>Next</button>
        </div>
      </div>

      <ApprovalModal
        isOpen={approvalModal.open}
        submission={approvalModal.submission}
        action={approvalModal.action}
        onClose={() => setApprovalModal({ open: false, submission: null, action: 'approve' })}
        onConfirm={handleApprovalConfirm}
      />
    </motion.div>
  );
}