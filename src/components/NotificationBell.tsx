'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Bell, ShieldAlert, Upload, CheckCircle, Clock, X } from 'lucide-react';
import { useNotifications, NotificationType } from '@/contexts/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '@/components/ui/AppIcon';


const typeConfig: Record<NotificationType, { icon: React.ElementType; color: string; bg: string }> = {
  fraud: { icon: ShieldAlert, color: 'var(--destructive)', bg: 'rgba(239,68,68,0.08)' },
  upload: { icon: Upload, color: 'var(--primary)', bg: 'rgba(37,99,235,0.08)' },
  verified: { icon: CheckCircle, color: 'var(--accent)', bg: 'rgba(16,185,129,0.08)' },
  pending: { icon: Clock, color: '#D97706', bg: 'rgba(245,158,11,0.08)' },
};

export default function NotificationBell() {
  const { notifications, unreadCount, markAllRead, markRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl transition-all duration-150 hover:bg-muted"
        title="Notifications"
      >
        <Bell size={18} style={{ color: 'var(--muted-foreground)' }} />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-bold text-white px-1"
            style={{ background: 'var(--destructive)' }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-80 rounded-2xl border shadow-xl z-50 overflow-hidden"
            style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-2">
                <Bell size={14} style={{ color: 'var(--primary)' }} />
                <span className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>Notifications</span>
                {unreadCount > 0 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white" style={{ background: 'var(--destructive)' }}>
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-[11px] font-semibold transition-colors hover:opacity-70"
                    style={{ color: 'var(--primary)' }}
                  >
                    Mark all read
                  </button>
                )}
                <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-muted transition-colors">
                  <X size={13} style={{ color: 'var(--muted-foreground)' }} />
                </button>
              </div>
            </div>

            {/* Notifications list */}
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-8 text-center">
                  <Bell size={24} className="mx-auto mb-2" style={{ color: 'var(--muted-foreground)' }} />
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>No new notifications</p>
                </div>
              ) : (
                notifications.map((notif) => {
                  const cfg = typeConfig[notif.type];
                  const Icon = cfg.icon;
                  return (
                    <motion.button
                      key={notif.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      onClick={() => markRead(notif.id)}
                      className="w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted border-b last:border-0"
                      style={{
                        borderColor: 'var(--border)',
                        background: notif.read ? 'transparent' : 'rgba(37,99,235,0.02)',
                      }}
                    >
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                        style={{ background: cfg.bg }}
                      >
                        <Icon size={14} style={{ color: cfg.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-semibold truncate" style={{ color: 'var(--foreground)' }}>
                            {notif.title}
                          </p>
                          {!notif.read && (
                            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: 'var(--primary)' }} />
                          )}
                        </div>
                        <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                          {notif.message}
                        </p>
                        <p className="text-[10px] mt-1" style={{ color: 'var(--muted-foreground)' }}>
                          {notif.timestamp}
                        </p>
                      </div>
                    </motion.button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
