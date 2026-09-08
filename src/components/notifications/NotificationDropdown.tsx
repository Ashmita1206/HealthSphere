import React from 'react';
import { Check, BellOff, Loader2 } from 'lucide-react';
import { NotificationItem } from './NotificationItem';
import type { AppNotification } from '@/services/notificationService';

interface NotificationDropdownProps {
  notifications: AppNotification[];
  unreadCount: number;
  loading?: boolean;
  onSelectNotification: (notification: AppNotification) => void;
  onMarkAllRead: () => void;
  onDeleteNotification?: (id: string, e: React.MouseEvent) => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  notifications,
  unreadCount,
  loading = false,
  onSelectNotification,
  onMarkAllRead,
  onDeleteNotification,
}) => {
  return (
    <div className="w-80 sm:w-96 rounded-2xl border border-slate-200 shadow-xl bg-white overflow-hidden">
      {/* Header */}
      <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-[#FAF9F6]">
        <div className="flex items-center gap-2">
          <h4 className="font-extrabold text-xs text-slate-900 font-heading uppercase tracking-wider">
            Notifications
          </h4>
          {unreadCount > 0 && (
            <span className="text-[10px] text-[#0F766E] font-bold bg-[#F0FDFA] px-2 py-0.5 rounded-full border border-[#CCFBF1]">
              {unreadCount} New
            </span>
          )}
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={onMarkAllRead}
            className="text-[11px] font-semibold text-[#0F766E] hover:text-[#115E59] flex items-center gap-1 transition-colors px-2 py-1 rounded-lg hover:bg-[#F0FDFA]"
          >
            <Check className="w-3 h-3" />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      {/* List / Empty / Loading */}
      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 scrollbar-thin">
        {loading && notifications.length === 0 ? (
          <div className="p-8 flex flex-col items-center justify-center text-slate-400 gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-teal-600" />
            <span className="text-xs">Loading notifications...</span>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center flex flex-col items-center justify-center gap-2">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
              <BellOff className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-slate-700">All caught up</p>
            <p className="text-[11px] text-slate-400 max-w-[200px]">
              No notifications at this time. Health alerts will appear here.
            </p>
          </div>
        ) : (
          notifications.map((notif) => (
            <NotificationItem
              key={notif.id || notif._id}
              notification={notif}
              onSelect={onSelectNotification}
              onDelete={onDeleteNotification}
            />
          ))
        )}
      </div>

      {/* Footer link to full Notification Center */}
      <div className="p-2 border-t border-slate-100 bg-slate-50/60 text-center">
        <a
          href="#/notifications"
          className="text-xs font-bold text-teal-700 hover:text-teal-800 transition-colors inline-block py-1"
        >
          Open Notification Center & Timeline &rarr;
        </a>
      </div>
    </div>
  );
};
