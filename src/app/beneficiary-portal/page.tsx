import React from 'react';
import AppLayout from '@/components/AppLayout';
import BeneficiaryPortalContent from './components/BeneficiaryPortalContent';

export default function BeneficiaryPortalPage() {
  return (
    <AppLayout activePath="/beneficiary-portal">
      <BeneficiaryPortalContent />
    </AppLayout>
  );
}