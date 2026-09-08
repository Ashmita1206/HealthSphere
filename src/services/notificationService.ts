import { api } from './api';
import { notificationSocket } from './socket';

export interface AppNotification {
  id: string;
  _id?: string;
  userId?: string;
  type: 'medication' | 'medicine' | 'appointment' | 'health' | 'report' | 'emergency' | 'system' | 'security' | 'general';
  title: string;
  message: string;
  timestamp?: string;
  read: boolean;
  severity?: 'info' | 'healthy' | 'attention' | 'critical' | 'low' | 'normal' | 'high';
  priority?: 'low' | 'normal' | 'high' | 'critical' | 'info' | 'healthy' | 'attention';
  route: string;
}

// Initial mock notifications for initial state
const initialNotifications: AppNotification[] = [
  {
    id: 'notif-1',
    type: 'report',
    title: 'Lab Analysis Baseline Ready',
    message: 'Your Blood Panel CBC OCR report has been analyzed by HealthSphere AI.',
    timestamp: '10 mins ago',
    read: false,
    severity: 'info',
    route: '/reports',
  },
  {
    id: 'notif-2',
    type: 'medication',
    title: 'Medicine Reminder',
    message: 'Time for Metformin 500mg (Post Lunch). Take with 250ml water.',
    timestamp: '1 hour ago',
    read: false,
    severity: 'attention',
    route: '/medicines',
  },
  {
    id: 'notif-3',
    type: 'appointment',
    title: 'Upcoming Appointment',
    message: 'Dr. Sarah Jenkins consultation scheduled for tomorrow at 10:00 AM.',
    timestamp: '3 hours ago',
    read: true,
    severity: 'info',
    route: '/appointments',
  },
];

type NotificationListener = (notifications: AppNotification[]) => void;
type ConnectionListener = (connected: boolean) => void;

class NotificationService {
  private notifications: AppNotification[] = [];
  private listeners: NotificationListener[] = [];
  private connectionListeners: ConnectionListener[] = [];
  private isConnected = false;
  private pushSubscribed = false;

  constructor() {
    this.initSocketListeners();
    this.registerServiceWorker();
  }

  // Socket management
  private initSocketListeners() {
    notificationSocket.off('connect');
    notificationSocket.off('disconnect');
    notificationSocket.off('notification:new');

    notificationSocket.on('connect', () => {
      this.isConnected = true;
      this.notifyConnectionState(true);
    });

    notificationSocket.on('disconnect', () => {
      this.isConnected = false;
      this.notifyConnectionState(false);
    });

    notificationSocket.on('notification:new', (newNotif: AppNotification) => {
      this.addNotification(newNotif);
      this.triggerBrowserNotification(newNotif.title, newNotif.message, newNotif.route);
    });
  }

  // REST API Client Methods
  public async getNotifications(): Promise<AppNotification[]> {
    try {
      const response = await api.get<{ success: boolean; data: AppNotification[] }>('/notifications');
      const items = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response)
          ? (response as unknown as AppNotification[])
          : [];

      this.notifications = items;
      this.notifyListeners();
      return items;
    } catch (_err) {
      return this.notifications;
    }
  }

  public async markNotificationRead(id: string): Promise<AppNotification | null> {
    try {
      const res = await api.put<{ success: boolean; data: AppNotification }>(`/notifications/${id}/read`);
      this.notifications = this.notifications.map((n) =>
        (n.id === id || n._id === id) ? { ...n, read: true } : n
      );
      this.notifyListeners();
      return res?.data || null;
    } catch (_err) {
      // Optimistic local fallback
      this.notifications = this.notifications.map((n) =>
        (n.id === id || n._id === id) ? { ...n, read: true } : n
      );
      this.notifyListeners();
      return null;
    }
  }

  public async markAllNotificationsRead(): Promise<boolean> {
    try {
      await api.put<{ success: boolean; message: string }>('/notifications/read-all');
      this.notifications = this.notifications.map((n) => ({ ...n, read: true }));
      this.notifyListeners();
      return true;
    } catch (_err) {
      // Optimistic fallback
      this.notifications = this.notifications.map((n) => ({ ...n, read: true }));
      this.notifyListeners();
      return false;
    }
  }

  public async deleteNotification(id: string): Promise<boolean> {
    try {
      await api.delete<{ success: boolean; message: string }>(`/notifications/${id}`);
      this.notifications = this.notifications.filter((n) => n.id !== id && n._id !== id);
      this.notifyListeners();
      return true;
    } catch (_err) {
      this.notifications = this.notifications.filter((n) => n.id !== id && n._id !== id);
      this.notifyListeners();
      return false;
    }
  }

  public async subscribePushNotification(subscription: PushSubscriptionPayload): Promise<boolean> {
    if (this.pushSubscribed) return true;
    try {
      await api.post<{ success: boolean; message: string }>('/notifications/subscribe', subscription);
      this.pushSubscribed = true;
      return true;
    } catch (err) {
      console.warn('Push subscription failed:', err);
      return false;
    }
  }

  // Service Worker Registration
  public async registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/service-worker.js', {
          scope: '/',
        });
        return registration;
      } catch (err) {
        console.warn('Service Worker registration failed:', err);
        return null;
      }
    }
    return null;
  }

  // Browser Permission Query
  public getBrowserPermissionState(): 'granted' | 'denied' | 'default' | 'unsupported' {
    if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
    return Notification.permission as 'granted' | 'denied' | 'default';
  }

  // Request Browser Notification Permission
  public async requestBrowserPermission(): Promise<'granted' | 'denied' | 'unsupported'> {
    if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';

    try {
      const permission = await Notification.requestPermission();
      return permission as 'granted' | 'denied';
    } catch (_err) {
      return 'denied';
    }
  }

  // Display browser notification if permitted
  public triggerBrowserNotification(title: string, body: string, route = '/dashboard') {
    if (this.getBrowserPermissionState() === 'granted' && typeof window !== 'undefined') {
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then((reg) => {
          reg.showNotification(title, {
            body,
            icon: '/favicon.ico',
            data: { route },
          });
        });
      } else {
        new Notification(title, { body, icon: '/favicon.ico' });
      }
    }
  }

  // In-Memory state accessors & listeners
  public getLocalNotifications(): AppNotification[] {
    return [...this.notifications];
  }

  public subscribe(listener: NotificationListener): () => void {
    this.listeners.push(listener);
    listener(this.getLocalNotifications());
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  public subscribeConnection(listener: ConnectionListener): () => void {
    this.connectionListeners.push(listener);
    listener(this.isConnected);
    return () => {
      this.connectionListeners = this.connectionListeners.filter((l) => l !== listener);
    };
  }

  public addNotification(notif: AppNotification) {
    const id = notif.id || notif._id;
    if (this.notifications.some((n) => (n.id === id || n._id === id))) return;
    this.notifications = [notif, ...this.notifications];
    this.notifyListeners();
  }

  public markAsRead(id: string) {
    return this.markNotificationRead(id);
  }

  public markAllAsRead() {
    return this.markAllNotificationsRead();
  }

  public getUnreadCount(): number {
    return this.notifications.filter((n) => !n.read).length;
  }

  public connectSocket(token?: string) {
    if (typeof window === 'undefined') return;
    const activeToken = token || localStorage.getItem('healthsphere_token');
    if (activeToken) {
      notificationSocket.auth = { token: activeToken };
    }
    if (!notificationSocket.connected) {
      notificationSocket.connect();
    }
  }

  private notifyListeners() {
    const list = this.getLocalNotifications();
    this.listeners.forEach((l) => l(list));
  }

  private notifyConnectionState(connected: boolean) {
    this.connectionListeners.forEach((l) => l(connected));
  }
}

export const notificationService = new NotificationService();
