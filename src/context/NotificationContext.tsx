import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { notificationService, type AppNotification } from '@/services/notificationService';
import { notificationSocket } from '@/services/socket';

export interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  loading: boolean;
  fetchNotifications: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  removeNotification: (id: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const userId = user?.id;
  const [notifications, setNotifications] = useState<AppNotification[]>(() =>
    notificationService.getLocalNotifications()
  );
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!userId) {
      setNotifications([]);
      return;
    }
    setLoading(true);
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Initial load when user signs in
  useEffect(() => {
    if (userId) {
      fetchNotifications();
      notificationService.connectSocket();
    } else {
      setNotifications([]);
    }
  }, [userId, fetchNotifications]);

  // Subscribe to service-level listener & socket events
  useEffect(() => {
    const unsubscribeService = notificationService.subscribe((list) => {
      setNotifications(list);
    });

    const handleSocketNew = (newNotif: AppNotification) => {
      notificationService.addNotification(newNotif);
    };

    notificationSocket.on('notification:new', handleSocketNew);

    return () => {
      unsubscribeService();
      notificationSocket.off('notification:new', handleSocketNew);
    };
  }, []);

  // Web Push Auto-Registration (if permitted)
  useEffect(() => {
    if (!userId) return;
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.ready.then(async (reg) => {
        try {
          const sub = await reg.pushManager.getSubscription();
          if (sub) {
            const rawSub = sub.toJSON();
            if (rawSub.endpoint && rawSub.keys) {
              await notificationService.subscribePushNotification({
                endpoint: rawSub.endpoint,
                keys: {
                  p256dh: rawSub.keys.p256dh,
                  auth: rawSub.keys.auth,
                },
              });
            }
          }
        } catch (_err) {
          // Push unsupported or permission denied
        }
      });
    }
  }, [userId]);

  const markRead = useCallback(async (id: string) => {
    await notificationService.markNotificationRead(id);
  }, []);

  const markAllRead = useCallback(async () => {
    await notificationService.markAllNotificationsRead();
  }, []);

  const removeNotification = useCallback(async (id: string) => {
    await notificationService.deleteNotification(id);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        markRead,
        markAllRead,
        removeNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
