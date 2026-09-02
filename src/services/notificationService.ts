import { notificationSocket } from './socket';

export interface AppNotification {
  id: string;
  userId?: string;
  type: 'medication' | 'appointment' | 'health' | 'report' | 'emergency' | 'system' | 'security';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  severity: 'info' | 'healthy' | 'attention' | 'critical';
  route: string;
}

// Notifications are populated via Socket.IO realtime events.
// No mock/seed data — empty until backend delivers real notifications.

type NotificationListener = (notifications: AppNotification[]) => void;
type ConnectionListener = (connected: boolean) => void;

class NotificationService {
  private notifications: AppNotification[] = [];
  private listeners: NotificationListener[] = [];
  private connectionListeners: ConnectionListener[] = [];
  private isConnected = false;

  constructor() {
    this.initSocketListeners();
    this.registerServiceWorker();
  }

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

  // Service Worker Registration
  public async registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if ('serviceWorker' in navigator) {
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
    if (!('Notification' in window)) return 'unsupported';
    return Notification.permission as 'granted' | 'denied' | 'default';
  }

  // Request Browser Notification Permission
  public async requestBrowserPermission(): Promise<'granted' | 'denied' | 'unsupported'> {
    if (!('Notification' in window)) return 'unsupported';

    try {
      const permission = await Notification.requestPermission();
      return permission as 'granted' | 'denied';
    } catch (_err) {
      return 'denied';
    }
  }

  // Display browser notification if permitted
  public triggerBrowserNotification(title: string, body: string, route = '/dashboard') {
    if (this.getBrowserPermissionState() === 'granted') {
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

  // Get current notifications list
  public getNotifications(): AppNotification[] {
    return [...this.notifications];
  }

  // Subscribe to notification updates
  public subscribe(listener: NotificationListener): () => void {
    this.listeners.push(listener);
    listener(this.getNotifications());
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  // Subscribe to socket connection status updates
  public subscribeConnection(listener: ConnectionListener): () => void {
    this.connectionListeners.push(listener);
    listener(this.isConnected);
    return () => {
      this.connectionListeners = this.connectionListeners.filter((l) => l !== listener);
    };
  }

  public addNotification(notif: AppNotification) {
    if (this.notifications.some((n) => n.id === notif.id)) return;
    this.notifications = [notif, ...this.notifications];
    this.notifyListeners();
  }

  public markAsRead(id: string) {
    this.notifications = this.notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n,
    );
    this.notifyListeners();
  }

  public markAllAsRead() {
    this.notifications = this.notifications.map((n) => ({ ...n, read: true }));
    this.notifyListeners();
  }

  public getUnreadCount(): number {
    return this.notifications.filter((n) => !n.read).length;
  }

  public connectSocket(token?: string) {
    const activeToken = token || localStorage.getItem('healthsphere_token');
    if (activeToken) {
      notificationSocket.auth = { token: activeToken };
    }
    if (!notificationSocket.connected) {
      notificationSocket.connect();
    }
  }

  private notifyListeners() {
    const list = this.getNotifications();
    this.listeners.forEach((l) => l(list));
  }

  private notifyConnectionState(connected: boolean) {
    this.connectionListeners.forEach((l) => l(connected));
  }
}

export const notificationService = new NotificationService();
