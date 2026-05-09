import React from 'react';
import BeneficiaryHeader from './BeneficiaryHeader';
import LoanStatusTimeline from './LoanStatusTimeline';
import AssetUploadZone from './AssetUploadZone';
import UploadHistoryTable from './UploadHistoryTable';

export default function BeneficiaryPortalContent() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <BeneficiaryHeader />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
        {/* Upload + AI Result */}
        <div className="xl:col-span-2 space-y-4 sm:space-y-6">
          <AssetUploadZone />
        </div>

        {/* Loan Status Timeline */}
        <div>
          <LoanStatusTimeline />
        </div>
      </div>

      {/* Upload History */}
      <UploadHistoryTable />
    </div>
  );
}