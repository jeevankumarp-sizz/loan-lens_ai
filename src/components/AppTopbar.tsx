'use client';
import React, { useState } from 'react';
import { Search, RefreshCw, Menu } from 'lucide-react';
import AppImage from './ui/AppImage';
import NotificationBell from './NotificationBell';
import LanguageSwitcher from './LanguageSwitcher';

interface AppTopbarProps {
  onMenuToggle?: () => void;
}

export default function AppTopbar({ onMenuToggle }: AppTopbarProps) {
  const [lastUpdated] = useState('08 May 2026, 06:22 IST');

  return (
    <header
      className="h-16 flex items-center justify-between px-4 lg:px-8 border-b shrink-0 gap-3"
      style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
    >
      {/* Left: Hamburger (mobile) + Search */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {/* Mobile hamburger */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors shrink-0"
          aria-label="Open navigation menu"
        >
          <Menu size={20} style={{ color: 'var(--foreground)' }} />
        </button>

        {/* Search — hidden on small mobile, visible from sm */}
        <div className="relative hidden sm:block">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }} />
          <input
            type="text"
            placeholder="Search beneficiaries, loans..."
            className="input-base pl-9 w-44 md:w-64 text-sm"
            style={{ background: 'var(--muted)', border: 'none' }}
          />
        </div>
        <div className="hidden md:flex items-center gap-1.5 text-xs" style={{ color: 'var(--muted-foreground)' }}>
          <RefreshCw size={12} />
          <span className="hidden lg:inline">Updated {lastUpdated}</span>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Language Switcher */}
        <LanguageSwitcher />

        {/* Notification Bell */}
        <NotificationBell />

        {/* User */}
        <div className="flex items-center gap-2 cursor-pointer group ml-1">
          <div className="w-8 h-8 rounded-full overflow-hidden border-2 shrink-0" style={{ borderColor: 'var(--border)' }}>
            <AppImage
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=officer1"
              alt="Officer avatar — male government official"
              width={32}
              height={32}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Rajesh Kumar</p>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Senior Loan Officer</p>
          </div>
        </div>
      </div>
    </header>
  );
}