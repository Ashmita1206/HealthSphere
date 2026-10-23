import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NotificationDialog } from './NotificationDialog';
import { useNotifications } from '@/context/NotificationContext';

interface NotificationBellProps {
  className?: string;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ className = '' }) => {
  const [open, setOpen] = useState(false);
  const { unreadCount } = useNotifications();

  // Global listener for "open-notification-dialog" events
  useEffect(() => {
    const handleOpenNotificationDialog = () => {
      setOpen(true);
    };

    window.addEventListener('open-notification-dialog', handleOpenNotificationDialog);
    return () => {
      window.removeEventListener('open-notification-dialog', handleOpenNotificationDialog);
    };
  }, []);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen((prev) => !prev)}
        className={`relative text-slate-600 hover:bg-slate-100 rounded-xl w-10 h-10 flex items-center justify-center transition-colors ${className}`}
        aria-label={`Open notifications (${unreadCount} unread)`}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <Bell className="w-5 h-5 text-slate-700" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-teal-600 text-white text-[9px] font-bold shadow-xs">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
            <span className="relative">{unreadCount > 99 ? '99+' : unreadCount}</span>
          </span>
        )}
      </Button>

      <NotificationDialog open={open} onOpenChange={setOpen} />
    </>
  );
};
