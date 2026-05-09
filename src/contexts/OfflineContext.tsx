'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface OfflineContextType {
  isOnline: boolean;
  queueCount: number;
  addToQueue: () => void;
  clearQueue: () => void;
}

const OfflineContext = createContext<OfflineContextType>({
  isOnline: true,
  queueCount: 0,
  addToQueue: () => {},
  clearQueue: () => {},
});

export function OfflineProvider({ children }: { children: ReactNode }) {
  const [isOnline, setIsOnline] = useState(true);
  const [queueCount, setQueueCount] = useState(0);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Auto-sync queued items
      if (queueCount > 0) {
        setTimeout(() => setQueueCount(0), 2000);
      }
    };
    const handleOffline = () => setIsOnline(false);

    setIsOnline(navigator.onLine);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [queueCount]);

  const addToQueue = () => setQueueCount((c) => c + 1);
  const clearQueue = () => setQueueCount(0);

  return (
    <OfflineContext.Provider value={{ isOnline, queueCount, addToQueue, clearQueue }}>
      {children}
    </OfflineContext.Provider>
  );
}

export function useOffline() {
  return useContext(OfflineContext);
}
