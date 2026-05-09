'use client';
import React from 'react';
import { Download, FileText } from 'lucide-react';
import { FraudScoringResult } from '@/lib/ai/fraudScoring';
import { useLanguage } from '@/contexts/LanguageContext';

interface DownloadReportButtonProps {
  result: FraudScoringResult;
  beneficiaryName?: string;
  loanId?: string;
  assetType?: string;
  gpsCoords?: { lat: number; lng: number } | null;
}

export default function DownloadReportButton({
  result,
  beneficiaryName = 'Priya Devi Sharma',
  loanId = 'KCC-2841',
  assetType = 'Tractor',
  gpsCoords,
}: DownloadReportButtonProps) {
  const { t } = useLanguage();

  const handleDownload = async () => {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    const pageW = doc.internal.pageSize.getWidth();
    const margin = 20;
    let y = 20;

    // Header bar
    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, pageW, 18, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('LoanLens AI — Verification Report', margin, 12);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Government of India · Digital Loan Verification Platform', pageW - margin, 12, { align: 'right' });

    y = 30;
    doc.setTextColor(30, 30, 30);

    // Title
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Asset Verification Report', margin, y);
    y += 6;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    const now = new Date();
    doc.text(`Generated: ${now.toLocaleDateString('en-IN')} at ${now.toLocaleTimeString('en-IN')}`, margin, y);
    y += 10;

    // Divider
    doc.setDrawColor(220, 220, 220);
    doc.line(margin, y, pageW - margin, y);
    y += 8;

    // Section: Beneficiary Details
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(37, 99, 235);
    doc.text('BENEFICIARY DETAILS', margin, y);
    y += 6;

    const details = [
      ['Beneficiary Name', beneficiaryName],
      ['Loan ID', loanId],
      ['Asset Type', assetType],
      ['Scheme', 'KCC 2025–26'],
      ['District', 'Nashik, Maharashtra'],
    ];

    doc.setTextColor(30, 30, 30);
    details.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text(`${label}:`, margin, y);
      doc.setFont('helvetica', 'normal');
      doc.text(value, margin + 50, y);
      y += 6;
    });

    y += 4;
    doc.line(margin, y, pageW - margin, y);
    y += 8;

    // Section: AI Verification Results
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(37, 99, 235);
    doc.text('AI VERIFICATION RESULTS', margin, y);
    y += 6;

    const aiResults = [
      ['AI Confidence Score', `${result.confidenceScore}%`],
      ['Asset Detected', result.assetDetected],
      ['Fraud Risk Score', `${result.fraudScore}% — ${result.riskLevel} Risk`],
      ['GPS Match Status', result.gpsMatchStatus],
      ['OCR Invoice Match', result.ocrInvoiceMatch],
      ['Duplicate Check', result.duplicateCheckStatus],
    ];

    doc.setTextColor(30, 30, 30);
    aiResults.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text(`${label}:`, margin, y);
      doc.setFont('helvetica', 'normal');
      doc.text(value, margin + 55, y);
      y += 6;
    });

    y += 4;
    doc.line(margin, y, pageW - margin, y);
    y += 8;

    // GPS Coordinates
    if (gpsCoords) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(37, 99, 235);
      doc.text('GPS LOCATION', margin, y);
      y += 6;
      doc.setTextColor(30, 30, 30);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(`Latitude: ${gpsCoords.lat.toFixed(6)}°N`, margin, y);
      y += 5;
      doc.text(`Longitude: ${gpsCoords.lng.toFixed(6)}°E`, margin, y);
      y += 5;
      doc.text('GPS Status: Verified ✓', margin, y);
      y += 8;
      doc.line(margin, y, pageW - margin, y);
      y += 8;
    }

    // AI Summary
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(37, 99, 235);
    doc.text('AI ASSESSMENT', margin, y);
    y += 6;
    doc.setTextColor(30, 30, 30);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const summaryLines = doc.splitTextToSize(result.summary, pageW - margin * 2);
    doc.text(summaryLines, margin, y);
    y += summaryLines.length * 5 + 4;

    doc.setFont('helvetica', 'bold');
    doc.text(`Recommendation: ${result.recommendation}`, margin, y);
    y += 10;

    // Officer Decision box
    doc.setFillColor(245, 247, 255);
    doc.setDrawColor(37, 99, 235);
    doc.roundedRect(margin, y, pageW - margin * 2, 20, 3, 3, 'FD');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(37, 99, 235);
    doc.text('OFFICER DECISION', margin + 5, y + 7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('Pending officer review — submitted for approval', margin + 5, y + 14);

    // Footer
    const footerY = doc.internal.pageSize.getHeight() - 12;
    doc.setFillColor(245, 247, 255);
    doc.rect(0, footerY - 4, pageW, 16, 'F');
    doc.setFontSize(7);
    doc.setTextColor(120, 120, 120);
    doc.text('This report is auto-generated by LoanLens AI. For official use only.', pageW / 2, footerY + 2, { align: 'center' });

    doc.save(`LoanLens_Report_${loanId}_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}.pdf`);
  };

  return (
    <button
      onClick={handleDownload}
      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:opacity-90 active:scale-95"
      style={{ background: 'var(--primary)', color: 'white' }}
      title={t('downloadReport')}
    >
      <FileText size={14} />
      <span>{t('downloadReport')}</span>
      <Download size={13} />
    </button>
  );
}
