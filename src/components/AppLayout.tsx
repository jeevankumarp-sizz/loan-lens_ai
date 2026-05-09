'use client';
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import AppTopbar from './AppTopbar';
import OfflineBanner from './OfflineBanner';

interface AppLayoutProps {
  children: React.ReactNode;
  activePath: string;
}

export default function AppLayout({ children, activePath }: AppLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--background)' }}>
      <OfflineBanner />
      <Sidebar
        activePath={activePath}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <AppTopbar onMenuToggle={() => setMobileMenuOpen(true)} />
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-4 sm:py-6">
          <div className="max-w-screen-2xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}