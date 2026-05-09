'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AppLogo from './ui/AppLogo';
import {
  LayoutDashboard,
  Users,
  ShieldAlert,
  BarChart3,
  FileCheck,
  MapPin,
  Settings,
  ChevronLeft,
  ChevronRight,
  Bell,
  LogOut,
  Building2,
  Upload,
  XCircle,
  X,
} from 'lucide-react';

const navGroups = [
  {
    label: 'OVERVIEW',
    items: [
      { href: '/officer-dashboard', icon: LayoutDashboard, label: 'Officer Dashboard', badge: null },
      { href: '/beneficiary-login', icon: Upload, label: 'Beneficiary Login', badge: null },
    ],
  },
  {
    label: 'MANAGEMENT',
    items: [
      { href: '/officer-dashboard', icon: Users, label: 'Beneficiaries', badge: '12' },
      { href: '/officer-dashboard', icon: ShieldAlert, label: 'Fraud Alerts', badge: '4' },
      { href: '/officer-dashboard', icon: FileCheck, label: 'Verifications', badge: null },
      { href: '/failed-verifications', icon: XCircle, label: 'Failed Verifications', badge: '4' },
    ],
  },
  {
    label: 'ANALYTICS',
    items: [
      { href: '/analytics', icon: BarChart3, label: 'Analytics', badge: null },
      { href: '/officer-dashboard', icon: MapPin, label: 'Geo Heatmap', badge: null },
      { href: '/officer-dashboard', icon: Building2, label: 'Schemes', badge: null },
    ],
  },
];

interface SidebarProps {
  activePath: string;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function Sidebar({ activePath, mobileOpen = false, onMobileClose }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  // Close mobile sidebar on route change
  useEffect(() => {
    if (mobileOpen && onMobileClose) {
      onMobileClose();
    }
  }, [activePath]); // eslint-disable-line react-hooks/exhaustive-deps

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b shrink-0" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <AppLogo size={32} />
          {!collapsed && (
            <span className="font-bold text-sm text-foreground truncate tracking-tight">
              LoanLens AI
            </span>
          )}
        </div>
        {/* Mobile close button */}
        {mobileOpen && onMobileClose && (
          <button
            onClick={onMobileClose}
            className="lg:hidden p-1.5 rounded-lg hover:bg-muted transition-colors ml-auto"
          >
            <X size={18} style={{ color: 'var(--muted-foreground)' }} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-4">
        {navGroups.map((group) => (
          <div key={`group-${group.label}`}>
            {!collapsed && (
              <p className="text-[10px] font-semibold tracking-widest px-3 mb-2" style={{ color: 'var(--muted-foreground)' }}>
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = activePath === item.href || (item.href !== '/' && activePath.startsWith(item.href));
                return (
                  <Link
                    key={`nav-${item.label}`}
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    className={`sidebar-item-hover flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                      isActive ? 'nav-link-active' : ''
                    }`}
                    style={{ color: isActive ? 'var(--primary)' : 'var(--secondary-foreground)' }}
                  >
                    <item.icon
                      size={18}
                      className="shrink-0"
                      style={{ color: isActive ? 'var(--primary)' : 'var(--muted-foreground)' }}
                    />
                    {!collapsed && (
                      <>
                        <span className="flex-1 truncate">{item.label}</span>
                        {item.badge && (
                          <span
                            className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                            style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
                          >
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div className="border-t px-2 py-3 space-y-0.5" style={{ borderColor: 'var(--border)' }}>
        <button
          className="sidebar-item-hover flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium w-full transition-all duration-200"
          style={{ color: 'var(--secondary-foreground)' }}
        >
          <Bell size={18} style={{ color: 'var(--muted-foreground)' }} />
          {!collapsed && <span>Notifications</span>}
        </button>
        <button
          className="sidebar-item-hover flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium w-full transition-all duration-200"
          style={{ color: 'var(--secondary-foreground)' }}
        >
          <Settings size={18} style={{ color: 'var(--muted-foreground)' }} />
          {!collapsed && <span>Settings</span>}
        </button>
        <button
          className="sidebar-item-hover flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium w-full transition-all duration-200"
          style={{ color: 'var(--destructive)' }}
        >
          <LogOut size={18} style={{ color: 'var(--destructive)' }} />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>

      {/* Collapse Toggle — desktop only */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="hidden lg:flex absolute -right-3.5 top-20 z-10 items-center justify-center w-7 h-7 rounded-full border shadow-card transition-all duration-200 hover:shadow-card-hover"
        style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
      >
        {collapsed ? (
          <ChevronRight size={13} style={{ color: 'var(--muted-foreground)' }} />
        ) : (
          <ChevronLeft size={13} style={{ color: 'var(--muted-foreground)' }} />
        )}
      </button>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className="relative hidden lg:flex flex-col border-r shrink-0 transition-all duration-300 ease-in-out"
        style={{
          width: collapsed ? '64px' : '240px',
          background: 'var(--card)',
          borderColor: 'var(--border)',
        }}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={onMobileClose}
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={`lg:hidden fixed inset-y-0 left-0 z-50 flex flex-col border-r transition-transform duration-300 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          width: '260px',
          background: 'var(--card)',
          borderColor: 'var(--border)',
        }}
      >
        <SidebarContent />
      </aside>
    </>
  );
}