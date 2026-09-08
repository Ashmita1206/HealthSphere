import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { NotificationDropdown } from './NotificationDropdown';
import { useNotifications } from '@/context/NotificationContext';
import type { AppNotification } from '@/services/notificationService';

interface NotificationBellProps {
  className?: string;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ className = '' }) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const {
    notifications,
    unreadCount,
    loading,
    markRead,
    markAllRead,
    removeNotification,
  } = useNotifications();

  const handleSelectNotification = (notif: AppNotification) => {
    const id = notif.id || notif._id;
    if (id) {
      markRead(id);
    }
    setOpen(false);
    if (notif.route) {
      navigate(notif.route);
    }
  };

  const handleDeleteNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeNotification(id);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setOpen(!open)}
          className={`relative text-slate-600 hover:bg-slate-100 rounded-xl w-10 h-10 flex items-center justify-center transition-colors ${className}`}
          aria-label={`Open notifications (${unreadCount} unread)`}
          aria-expanded={open}
        >
          <Bell className="w-5 h-5 text-slate-700" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-teal-600 text-white text-[9px] font-bold shadow-xs">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
              <span className="relative">{unreadCount > 99 ? '99+' : unreadCount}</span>
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="p-0 border-none bg-transparent shadow-none"
      >
        <NotificationDropdown
          notifications={notifications}
          unreadCount={unreadCount}
          loading={loading}
          onSelectNotification={handleSelectNotification}
          onMarkAllRead={markAllRead}
          onDeleteNotification={handleDeleteNotification}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
