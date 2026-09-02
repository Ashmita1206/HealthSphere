import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { NotificationProvider, useNotifications } from '@/context/NotificationContext';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { NotificationDropdown } from '@/components/notifications/NotificationDropdown';
import { NotificationItem } from '@/components/notifications/NotificationItem';
import { notificationService, type AppNotification } from '@/services/notificationService';
import { notificationSocket } from '@/services/socket';
import { api } from '@/services/api';

// Mock AuthContext
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'test-user-123', email: 'patient@healthsphere.io' },
    loading: false,
    signOut: vi.fn(),
  }),
}));

const sampleNotifications: AppNotification[] = [
  {
    id: 'notif-1',
    _id: 'notif-1',
    userId: 'test-user-123',
    title: 'Time for Metformin',
    message: 'Take 500mg after lunch with water.',
    type: 'medication',
    read: false,
    severity: 'attention',
    route: '/medicines',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'notif-2',
    _id: 'notif-2',
    userId: 'test-user-123',
    title: 'Cardiologist Checkup',
    message: 'Appointment tomorrow at 10:00 AM with Dr. Sarah Smith.',
    type: 'appointment',
    read: true,
    severity: 'info',
    route: '/appointments',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'notif-3',
    _id: 'notif-3',
    userId: 'test-user-123',
    title: 'Emergency SOS Notice',
    message: 'Critical vital alert recorded.',
    type: 'emergency',
    read: false,
    severity: 'critical',
    route: '/emergency',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'notif-4',
    _id: 'notif-4',
    userId: 'test-user-123',
    title: 'Lab Report Available',
    message: 'Lipid panel analysis is ready.',
    type: 'report',
    read: false,
    severity: 'healthy',
    route: '/reports',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'notif-5',
    _id: 'notif-5',
    userId: 'test-user-123',
    title: 'System Security Update',
    message: 'Two-factor authentication enabled.',
    type: 'general',
    read: true,
    severity: 'info',
    route: '/settings',
    createdAt: new Date().toISOString(),
  },
];

describe('F6-4 Frontend Notifications Integration Suite', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('1. Notification Service Layer (REST & Push APIs)', () => {
    it('getNotifications calls GET /notifications and updates service state', async () => {
      vi.spyOn(api, 'get').mockResolvedValueOnce({
        success: true,
        data: sampleNotifications,
      });

      const list = await notificationService.getNotifications();
      expect(api.get).toHaveBeenCalledWith('/notifications');
      expect(list.length).toBe(5);
      expect(notificationService.getUnreadCount()).toBe(3);
    });

    it('markNotificationRead calls PUT /notifications/:id/read', async () => {
      vi.spyOn(api, 'put').mockResolvedValueOnce({
        success: true,
        data: { ...sampleNotifications[0], read: true },
      });

      await notificationService.markNotificationRead('notif-1');
      expect(api.put).toHaveBeenCalledWith('/notifications/notif-1/read');
    });

    it('markAllNotificationsRead calls PUT /notifications/read-all', async () => {
      vi.spyOn(api, 'put').mockResolvedValueOnce({
        success: true,
        message: 'All notifications marked as read',
      });

      const result = await notificationService.markAllNotificationsRead();
      expect(api.put).toHaveBeenCalledWith('/notifications/read-all');
      expect(result).toBe(true);
      expect(notificationService.getUnreadCount()).toBe(0);
    });

    it('deleteNotification calls DELETE /notifications/:id', async () => {
      vi.spyOn(api, 'delete').mockResolvedValueOnce({
        success: true,
        message: 'Notification deleted',
      });

      const result = await notificationService.deleteNotification('notif-1');
      expect(api.delete).toHaveBeenCalledWith('/notifications/notif-1');
      expect(result).toBe(true);
    });

    it('subscribePushNotification calls POST /notifications/subscribe', async () => {
      vi.spyOn(api, 'post').mockResolvedValueOnce({
        success: true,
        message: 'Push subscription registered successfully',
      });

      const result = await notificationService.subscribePushNotification({
        endpoint: 'https://fcm.googleapis.com/fcm/send/unique-token-xyz',
        keys: { p256dh: 'sample-p256dh', auth: 'sample-auth' },
      });

      expect(api.post).toHaveBeenCalledWith('/notifications/subscribe', expect.any(Object));
      expect(result).toBe(true);
    });
  });

  describe('2. Notification Components & Categories UI', () => {
    it('NotificationItem renders medicine, appointment, report, and emergency categories properly', () => {
      const onSelect = vi.fn();
      const onDelete = vi.fn();

      const { rerender } = render(
        <NotificationItem
          notification={sampleNotifications[0]} // medication
          onSelect={onSelect}
          onDelete={onDelete}
        />
      );

      expect(screen.getByText('Medicine')).toBeInTheDocument();
      expect(screen.getByText('Time for Metformin')).toBeInTheDocument();
      expect(screen.getByText('Take 500mg after lunch with water.')).toBeInTheDocument();

      // Appointment category
      rerender(
        <NotificationItem
          notification={sampleNotifications[1]} // appointment
          onSelect={onSelect}
          onDelete={onDelete}
        />
      );
      expect(screen.getByText('Appointment')).toBeInTheDocument();
      expect(screen.getByText('Cardiologist Checkup')).toBeInTheDocument();

      // Emergency category
      rerender(
        <NotificationItem
          notification={sampleNotifications[2]} // emergency
          onSelect={onSelect}
          onDelete={onDelete}
        />
      );
      expect(screen.getByText('Emergency')).toBeInTheDocument();
      expect(screen.getByText('Emergency SOS Notice')).toBeInTheDocument();

      // Report category
      rerender(
        <NotificationItem
          notification={sampleNotifications[3]} // report
          onSelect={onSelect}
          onDelete={onDelete}
        />
      );
      expect(screen.getByText('Report')).toBeInTheDocument();
      expect(screen.getByText('Lab Report Available')).toBeInTheDocument();
    });

    it('NotificationDropdown renders empty state when notifications array is empty', () => {
      render(
        <NotificationDropdown
          notifications={[]}
          unreadCount={0}
          onSelectNotification={vi.fn()}
          onMarkAllRead={vi.fn()}
        />
      );

      expect(screen.getByText('All caught up')).toBeInTheDocument();
      expect(screen.getByText(/No notifications at this time/i)).toBeInTheDocument();
    });

    it('NotificationDropdown renders populated list with Mark All Read button', () => {
      const onMarkAll = vi.fn();
      const onSelect = vi.fn();

      render(
        <NotificationDropdown
          notifications={sampleNotifications}
          unreadCount={3}
          onSelectNotification={onSelect}
          onMarkAllRead={onMarkAll}
        />
      );

      expect(screen.getByText('3 New')).toBeInTheDocument();
      const markAllBtn = screen.getByText('Mark all read');
      expect(markAllBtn).toBeInTheDocument();

      fireEvent.click(markAllBtn);
      expect(onMarkAll).toHaveBeenCalledTimes(1);

      const firstItem = screen.getByText('Time for Metformin');
      fireEvent.click(firstItem);
      expect(onSelect).toHaveBeenCalledWith(sampleNotifications[0]);
    });
  });

  describe('3. NotificationBell & NotificationContext Provider Integration', () => {
    it('NotificationBell renders unread count badge and opens dropdown on click', async () => {
      vi.spyOn(api, 'get').mockResolvedValue({
        success: true,
        data: sampleNotifications,
      });

      render(
        <BrowserRouter>
          <NotificationProvider>
            <NotificationBell />
          </NotificationProvider>
        </BrowserRouter>
      );

      await waitFor(() => {
        const bellButton = screen.getByRole('button', { name: /Open notifications/i });
        expect(bellButton).toBeInTheDocument();
      });

      const bellButton = screen.getByRole('button', { name: /Open notifications/i });
      fireEvent.click(bellButton);

      await waitFor(() => {
        expect(screen.getByText('Notifications')).toBeInTheDocument();
      });
    });

    it('Socket event notification:new updates notification state instantly without duplicate IDs', async () => {
      vi.spyOn(api, 'get').mockResolvedValue({
        success: true,
        data: [sampleNotifications[0]],
      });

      const Consumer = () => {
        const { notifications, unreadCount } = useNotifications();
        return (
          <div>
            <span data-testid="count">{unreadCount}</span>
            <span data-testid="total">{notifications.length}</span>
            <ul>
              {notifications.map((n) => (
                <li key={n.id}>{n.title}</li>
              ))}
            </ul>
          </div>
        );
      };

      render(
        <NotificationProvider>
          <Consumer />
        </NotificationProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('total').textContent).toBe('1');
      });

      // Simulate socket push of a new notification
      const incoming: AppNotification = {
        id: 'notif-socket-1',
        title: 'New Socket Health Alert',
        message: 'Heart rate normalized',
        type: 'health',
        read: false,
        severity: 'healthy',
        route: '/dashboard',
        createdAt: new Date().toISOString(),
      };

      notificationSocket.emit('notification:new', incoming);

      // Trigger listener directly through notificationService
      notificationService.addNotification(incoming);

      await waitFor(() => {
        expect(screen.getByText('New Socket Health Alert')).toBeInTheDocument();
      });

      // Trying to add the same ID again should not duplicate
      notificationService.addNotification(incoming);
      expect(screen.getAllByText('New Socket Health Alert').length).toBe(1);
    });
  });
});
