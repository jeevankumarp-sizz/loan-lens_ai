import React from 'react';
import AppLayout from '@/components/AppLayout';
import OfficerDashboardContent from './components/OfficerDashboardContent';

export default function OfficerDashboardPage() {
  return (
    <AppLayout activePath="/officer-dashboard">
      <OfficerDashboardContent />
    </AppLayout>
  );
}