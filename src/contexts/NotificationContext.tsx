'use client';
import React, { createContext, useContext, useState, ReactNode } from 'react';

export type NotificationType = 'fraud' | 'upload' | 'verified' | 'pending';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (n: Omit<Notification, 'id' | 'read' | 'timestamp'>) => void;
  markAllRead: () => void;
  markRead: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  addNotification: () => {},
  markAllRead: () => {},
  markRead: () => {},
});

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    type: 'fraud',
    title: 'Fraud Alert',
    message: 'High fraud risk detected for Vikram Rathore (PMAY-3391) — Score: 91%',
    timestamp: '2 min ago',
    read: false,
  },
  {
    id: 'notif-2',
    type: 'upload',
    title: 'Upload Successful',
    message: 'Priya Devi Sharma submitted asset proof for KCC-2841',
    timestamp: '8 min ago',
    read: false,
  },
  {
    id: 'notif-3',
    type: 'verified',
    title: 'Verification Approved',
    message: 'Meena Bai (SHG-0814) verified successfully — AI Confidence: 93%',
    timestamp: '15 min ago',
    read: false,
  },
  {
    id: 'notif-4',
    type: 'pending',
    title: 'Pending Review',
    message: '4 submissions require officer action in Nashik district',
    timestamp: '32 min ago',
    read: true,
  },
  {
    id: 'notif-5',
    type: 'fraud',
    title: 'Fraud Alert',
    message: 'Duplicate image hash detected for Arjun Singh Chauhan (KCC-3305)',
    timestamp: '1 hr ago',
    read: true,
  },
];

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const addNotification = (n: Omit<Notification, 'id' | 'read' | 'timestamp'>) => {
    const newNotif: Notification = {
      ...n,
      id: `notif-${Date.now()}`,
      read: false,
      timestamp: 'Just now',
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, addNotification, markAllRead, markRead }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}
