'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useOffline } from '@/contexts/OfflineContext';
import { useLanguage } from '@/contexts/LanguageContext';

export default function OfflineBanner() {
  const { isOnline, queueCount } = useOffline();
  const { t } = useLanguage();
  const [showRestored, setShowRestored] = useState(false);

  useEffect(() => {
    if (isOnline && queueCount === 0) {
      setShowRestored(true);
      const timer = setTimeout(() => setShowRestored(false), 3000);
      return () => clearTimeout(timer);
    } else {
      setShowRestored(false);
    }
  }, [isOnline, queueCount]);

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          key="offline"
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -40 }}
          transition={{ duration: 0.3 }}
          className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-3 px-4 py-2.5 text-white text-sm font-medium"
          style={{ background: 'linear-gradient(90deg, #b45309, #d97706)' }}
        >
          <WifiOff size={15} />
          <span>
            <strong>{t('offlineMode')}</strong> — {t('offlineSyncMsg')}
          </span>
          {queueCount > 0 && (
            <span className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full text-xs">
              <RefreshCw size={11} className="animate-spin" />
              {queueCount} {t('itemsInQueue')}
            </span>
          )}
        </motion.div>
      )}
      {showRestored && (
        <motion.div
          key="online-restored"
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -40 }}
          transition={{ duration: 0.3 }}
          className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 px-4 py-2 text-white text-xs font-medium"
          style={{ background: 'var(--accent)' }}
        >
          <Wifi size={13} />
          <span>Connection restored — all uploads synced</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
