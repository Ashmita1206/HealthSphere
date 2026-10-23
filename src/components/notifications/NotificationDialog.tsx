import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Bell, BellOff, Check, Loader2, AlertCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/context/NotificationContext';
import { NotificationItem } from './NotificationItem';
import type { AppNotification } from '@/services/notificationService';

export interface NotificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NotificationDialog: React.FC<NotificationDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markRead,
    markAllRead,
    removeNotification,
  } = useNotifications();

  // Fetch real notifications whenever the dialog is opened
  useEffect(() => {
    if (open) {
      fetchNotifications().catch(() => {
        // Handled within context state
      });
    }
  }, [open, fetchNotifications]);

  const handleSelectNotification = async (notif: AppNotification) => {
    const id = notif.id || notif._id;
    if (id && !notif.read) {
      await markRead(id);
    }
    onOpenChange(false);
    if (notif.route) {
      navigate(notif.route);
    }
  };

  const handleDeleteNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await removeNotification(id);
  };

  const handleMarkAllRead = async () => {
    await markAllRead();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-testid="notification-dialog-content"
        className="w-[calc(100vw-2rem)] sm:max-w-lg p-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl gap-0 max-h-[85vh] flex flex-col"
      >
        {/* Header */}
        <DialogHeader className="p-4 sm:p-5 border-b border-slate-100 bg-[#FAF9F6] shrink-0 text-left">
          <div className="flex items-center justify-between pr-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-200/60 flex items-center justify-center text-teal-700">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <DialogTitle className="font-extrabold text-sm sm:text-base text-slate-900 font-heading tracking-tight">
                    Notifications
                  </DialogTitle>
                  {unreadCount > 0 && (
                    <span
                      data-testid="unread-badge"
                      className="text-[10px] text-[#0F766E] font-bold bg-[#F0FDFA] px-2 py-0.5 rounded-full border border-[#CCFBF1]"
                    >
                      {unreadCount} New
                    </span>
                  )}
                </div>
                <DialogDescription className="text-xs text-slate-500 mt-0.5">
                  Real-time health alerts, prescriptions, and schedule notices
                </DialogDescription>
              </div>
            </div>

            {unreadCount > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleMarkAllRead}
                className="text-[11px] font-semibold text-[#0F766E] hover:text-[#115E59] hover:bg-[#F0FDFA] h-8 px-2.5 rounded-lg flex items-center gap-1 transition-colors"
                aria-label="Mark all notifications as read"
              >
                <Check className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Mark all read</span>
              </Button>
            )}
          </div>
        </DialogHeader>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 scrollbar-thin min-h-[160px] max-h-[50vh] sm:max-h-[420px]">
          {loading && notifications.length === 0 ? (
            <div
              data-testid="notifications-loading"
              className="p-10 flex flex-col items-center justify-center text-slate-400 gap-2.5"
            >
              <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
              <span className="text-xs font-medium text-slate-500">
                Loading notifications...
              </span>
            </div>
          ) : error ? (
            <div
              data-testid="notifications-error"
              className="p-8 text-center flex flex-col items-center justify-center gap-2.5"
            >
              <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
                <AlertCircle className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-slate-800">
                Unable to load notifications
              </p>
              <p className="text-[11px] text-slate-500 max-w-xs">{error}</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fetchNotifications()}
                className="mt-1 text-xs text-teal-700 border-teal-200 hover:bg-teal-50"
              >
                Retry
              </Button>
            </div>
          ) : notifications.length === 0 ? (
            <div
              data-testid="notifications-empty"
              className="p-10 text-center flex flex-col items-center justify-center gap-2"
            >
              <div className="w-11 h-11 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <BellOff className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-slate-700">All caught up</p>
              <p className="text-[11px] text-slate-400 max-w-[220px]">
                No notifications at this time. Health alerts will appear here.
              </p>
            </div>
          ) : (
            notifications.map((notif) => (
              <NotificationItem
                key={notif.id || notif._id}
                notification={notif}
                onSelect={handleSelectNotification}
                onDelete={handleDeleteNotification}
              />
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span className="text-[11px] text-slate-400">
            {notifications.length} {notifications.length === 1 ? 'notification' : 'notifications'}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs h-7 px-3 text-slate-600 hover:text-slate-900 border-slate-200"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
