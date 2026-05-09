import React from 'react';
import AppLayout from '@/components/AppLayout';
import FailedVerificationsContent from './components/FailedVerificationsContent';

export default function FailedVerificationsPage() {
  return (
    <AppLayout activePath="/failed-verifications">
      <FailedVerificationsContent />
    </AppLayout>
  );
}
