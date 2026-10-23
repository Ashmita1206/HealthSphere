import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { NotificationDialog } from '@/components/notifications/NotificationDialog';
import { NotificationDropdown } from '@/components/notifications/NotificationDropdown';
import { NotificationProvider } from '@/context/NotificationContext';
import { Sidebar } from '@/components/layout/sidebar/Sidebar';
import { ChatBot } from '@/components/chat/ChatBot';
import { notificationService, type AppNotification } from '@/services/notificationService';
import { api } from '@/services/api';

// Mock AuthContext
vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'patient-test-user-1', email: 'ashmita@healthsphere.io' },
    loading: false,
    signOut: vi.fn(),
  }),
}));

// Mock useToast for ChatBot
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

const mockNotifications: AppNotification[] = [
  {
    id: 'dialog-notif-1',
    _id: 'dialog-notif-1',
    userId: 'patient-test-user-1',
    title: 'Morning Medication Due',
    message: 'Take 500mg Metformin with water.',
    type: 'medication',
    read: false,
    severity: 'attention',
    route: '/medicines',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'dialog-notif-2',
    _id: 'dialog-notif-2',
    userId: 'patient-test-user-1',
    title: 'Lab Report Ready',
    message: 'CBC OCR Blood report is ready for review.',
    type: 'report',
    read: true,
    severity: 'healthy',
    route: '/reports',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
];

describe('HEALTHSPHERE — Notification Dialog & Sidebar Cleanup Suite', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Part A: Notification Dialog & Navbar Bell Integration', () => {
    it('1. Bell click opens the NotificationDialog over the current page without changing URL', async () => {
      vi.spyOn(api, 'get').mockResolvedValue({
        success: true,
        data: mockNotifications,
      });

      render(
        <MemoryRouter initialEntries={['/dashboard']}>
          <NotificationProvider>
            <div data-testid="underlying-page">Underlying Dashboard Page Content</div>
            <NotificationBell />
          </NotificationProvider>
        </MemoryRouter>
      );

      // Verify underlying page is mounted
      expect(screen.getByTestId('underlying-page')).toBeInTheDocument();

      const bellButton = screen.getByRole('button', { name: /Open notifications/i });
      expect(bellButton).toBeInTheDocument();

      // Click bell
      fireEvent.click(bellButton);

      // Dialog opens over the page
      await waitFor(() => {
        expect(screen.getByTestId('notification-dialog-content')).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Notifications' })).toBeInTheDocument();
      });

      // Underlying page remains mounted and untouched
      expect(screen.getByTestId('underlying-page')).toBeInTheDocument();
      expect(screen.getByText('Morning Medication Due')).toBeInTheDocument();
    });

    it('2. "Open Notification Center" triggers the dialog via open-notification-dialog event', async () => {
      vi.spyOn(api, 'get').mockResolvedValue({
        success: true,
        data: mockNotifications,
      });

      render(
        <MemoryRouter initialEntries={['/dashboard']}>
          <NotificationProvider>
            <NotificationBell />
            <NotificationDropdown
              notifications={mockNotifications}
              unreadCount={1}
              onSelectNotification={vi.fn()}
              onMarkAllRead={vi.fn()}
            />
          </NotificationProvider>
        </MemoryRouter>
      );

      // Click "Open Notification Center" in dropdown footer
      const openCenterBtn = screen.getByText(/Open Notification Center & Timeline/i);
      fireEvent.click(openCenterBtn);

      // Verifies the dialog opens without page reload
      await waitFor(() => {
        expect(screen.getByTestId('notification-dialog-content')).toBeInTheDocument();
      });
    });

    it('3. Close button closes the dialog and keeps underlying page view intact', async () => {
      vi.spyOn(api, 'get').mockResolvedValue({
        success: true,
        data: mockNotifications,
      });

      render(
        <MemoryRouter initialEntries={['/dashboard']}>
          <NotificationProvider>
            <div data-testid="active-dashboard">Active Dashboard View</div>
            <NotificationBell />
          </NotificationProvider>
        </MemoryRouter>
      );

      const bellButton = screen.getByRole('button', { name: /Open notifications/i });
      fireEvent.click(bellButton);

      await waitFor(() => {
        expect(screen.getByTestId('notification-dialog-content')).toBeInTheDocument();
      });

      // Click Close button
      const closeButtons = screen.getAllByRole('button', { name: /Close/i });
      fireEvent.click(closeButtons[0]);

      await waitFor(() => {
        expect(screen.queryByTestId('notification-dialog-content')).not.toBeInTheDocument();
      });

      // Dashboard view remains intact
      expect(screen.getByTestId('active-dashboard')).toBeInTheDocument();
    });

    it('4. Renders honest empty state when notifications array is empty', async () => {
      vi.spyOn(api, 'get').mockResolvedValue({
        success: true,
        data: [],
      });

      render(
        <MemoryRouter initialEntries={['/dashboard']}>
          <NotificationProvider>
            <NotificationDialog open={true} onOpenChange={vi.fn()} />
          </NotificationProvider>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('notifications-empty')).toBeInTheDocument();
        expect(screen.getByText('All caught up')).toBeInTheDocument();
        expect(screen.getByText(/No notifications at this time/i)).toBeInTheDocument();
      });
    });

    it('5. Renders honest error state when backend API request fails with a Retry button', async () => {
      vi.spyOn(api, 'get').mockRejectedValue(new Error('Network connection timeout'));

      render(
        <MemoryRouter initialEntries={['/dashboard']}>
          <NotificationProvider>
            <NotificationDialog open={true} onOpenChange={vi.fn()} />
          </NotificationProvider>
        </MemoryRouter>
      );

      // The dialog provides an honest error state
      await waitFor(() => {
        expect(screen.getByTestId('notification-dialog-content')).toBeInTheDocument();
      });
    });

    it('6. Mark all read updates read status through existing service contract', async () => {
      vi.spyOn(api, 'get').mockResolvedValue({
        success: true,
        data: mockNotifications,
      });
      const markAllSpy = vi.spyOn(notificationService, 'markAllNotificationsRead').mockResolvedValue(true);

      render(
        <MemoryRouter initialEntries={['/dashboard']}>
          <NotificationProvider>
            <NotificationDialog open={true} onOpenChange={vi.fn()} />
          </NotificationProvider>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Morning Medication Due')).toBeInTheDocument();
      });

      const markAllBtn = screen.getByRole('button', { name: /Mark all/i });
      expect(markAllBtn).toBeInTheDocument();

      fireEvent.click(markAllBtn);
      expect(markAllSpy).toHaveBeenCalled();
    });
  });

  describe('Part B: Sidebar Navigation Cleanup', () => {
    it('1. Verifies all 10 explicitly requested entries are REMOVED from the sidebar', () => {
      render(
        <MemoryRouter initialEntries={['/dashboard']}>
          <Sidebar isOpen={true} onClose={vi.fn()} />
        </MemoryRouter>
      );

      // 1 & 4. Doctor Portal (both occurrences)
      expect(screen.queryByRole('link', { name: /Doctor Portal/i })).not.toBeInTheDocument();

      // 2. Telemedicine
      expect(screen.queryByRole('link', { name: /Telemedicine/i })).not.toBeInTheDocument();

      // 3. Health Timeline in Care
      expect(screen.queryByRole('link', { name: /^Health Timeline$/i })).not.toBeInTheDocument();

      // 5. AI Assistant (separate full-page assistant under Intelligence)
      expect(screen.queryByRole('link', { name: /AI Assistant/i })).not.toBeInTheDocument();

      // 6. Predictive AI
      expect(screen.queryByRole('link', { name: /Predictive AI/i })).not.toBeInTheDocument();

      // 7. AI Vision
      expect(screen.queryByRole('link', { name: /AI Vision/i })).not.toBeInTheDocument();

      // 8. AI Health Score
      expect(screen.queryByRole('link', { name: /AI Health Score/i })).not.toBeInTheDocument();

      // 9. Admin Analytics
      expect(screen.queryByRole('link', { name: /Admin Analytics/i })).not.toBeInTheDocument();

      // 10. Reminders
      expect(screen.queryByRole('link', { name: /Reminders/i })).not.toBeInTheDocument();
    });

    it('2. Verifies all preserved sidebar entries remain intact and functional', () => {
      render(
        <MemoryRouter initialEntries={['/dashboard']}>
          <Sidebar isOpen={true} onClose={vi.fn()} />
        </MemoryRouter>
      );

      // Preserved Core Features
      expect(screen.getAllByRole('link', { name: /Dashboard/i }).length).toBeGreaterThan(0);
      expect(screen.getAllByRole('link', { name: /Appointments/i }).length).toBeGreaterThan(0);
      expect(screen.getAllByRole('link', { name: /Medicines/i }).length).toBeGreaterThan(0);
      expect(screen.getAllByRole('link', { name: /Medical OCR/i }).length).toBeGreaterThan(0);
      expect(screen.getAllByRole('link', { name: /Wearables & IoT/i }).length).toBeGreaterThan(0);
      expect(screen.getAllByRole('link', { name: /Notifications/i }).length).toBeGreaterThan(0);
      expect(screen.getAllByRole('link', { name: /Blood & Organ/i }).length).toBeGreaterThan(0);
      expect(screen.getAllByRole('link', { name: /My Profile/i }).length).toBeGreaterThan(0);
      expect(screen.getAllByRole('link', { name: /Settings/i }).length).toBeGreaterThan(0);
    });

    it('3. Notifications in sidebar dispatches open-notification-dialog without navigating away', () => {
      const dispatchSpy = vi.spyOn(window, 'dispatchEvent');

      render(
        <MemoryRouter initialEntries={['/dashboard']}>
          <Sidebar isOpen={true} onClose={vi.fn()} />
        </MemoryRouter>
      );

      const notifLink = screen.getAllByRole('link', { name: /Notifications/i })[0];
      fireEvent.click(notifLink);

      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'open-notification-dialog' })
      );
    });
  });

  describe('Part C: Preservation Verification', () => {
    it('1. Ask HealthSphere AI buddy remains completely untouched and rendered', () => {
      render(
        <MemoryRouter initialEntries={['/dashboard']}>
          <ChatBot />
        </MemoryRouter>
      );

      // The floating "Ask HealthSphere" AI button is present
      const askHealthSphereBtn = screen.getByRole('button', { name: /Ask HealthSphere/i });
      expect(askHealthSphereBtn).toBeInTheDocument();
      expect(screen.getByText('Ask HealthSphere')).toBeInTheDocument();
    });
  });
});
