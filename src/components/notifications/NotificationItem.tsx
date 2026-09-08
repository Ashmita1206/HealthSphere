import React from 'react';
import {
  Pill,
  Calendar,
  FileText,
  AlertTriangle,
  Bell,
  CheckCircle2,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import type { AppNotification } from '@/services/notificationService';

interface NotificationItemProps {
  notification: AppNotification;
  onSelect: (notification: AppNotification) => void;
  onDelete?: (id: string, e: React.MouseEvent) => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onSelect,
  onDelete,
}) => {
  const getCategoryConfig = (type: string, severity?: string) => {
    switch (type?.toLowerCase()) {
      case 'medication':
      case 'medicine':
        return {
          icon: Pill,
          bgColor: 'bg-amber-50',
          textColor: 'text-amber-700',
          borderColor: 'border-amber-200',
          badgeText: 'Medicine',
        };
      case 'appointment':
        return {
          icon: Calendar,
          bgColor: 'bg-blue-50',
          textColor: 'text-blue-700',
          borderColor: 'border-blue-200',
          badgeText: 'Appointment',
        };
      case 'report':
        return {
          icon: FileText,
          bgColor: 'bg-teal-50',
          textColor: 'text-teal-700',
          borderColor: 'border-teal-200',
          badgeText: 'Report',
        };
      case 'emergency':
        return {
          icon: AlertTriangle,
          bgColor: 'bg-rose-50',
          textColor: 'text-rose-700',
          borderColor: 'border-rose-200',
          badgeText: 'Emergency',
        };
      default:
        if (severity === 'critical' || severity === 'attention') {
          return {
            icon: AlertTriangle,
            bgColor: 'bg-amber-50',
            textColor: 'text-amber-700',
            borderColor: 'border-amber-200',
            badgeText: 'Notice',
          };
        }
        return {
          icon: Bell,
          bgColor: 'bg-slate-50',
          textColor: 'text-slate-700',
          borderColor: 'border-slate-200',
          badgeText: 'General',
        };
    }
  };

  const config = getCategoryConfig(notification.type, notification.severity);
  const IconComponent = config.icon;
  const notifId = notification.id || notification._id || '';

  const formattedTime = (() => {
    if (notification.timestamp && !notification.timestamp.includes('T')) {
      return notification.timestamp;
    }
    if (notification.createdAt || notification.timestamp) {
      const d = new Date(notification.createdAt || notification.timestamp!);
      if (!isNaN(d.getTime())) {
        const diffMinutes = Math.floor((Date.now() - d.getTime()) / (1000 * 60));
        if (diffMinutes < 1) return 'Just now';
        if (diffMinutes < 60) return `${diffMinutes}m ago`;
        const diffHours = Math.floor(diffMinutes / 60);
        if (diffHours < 24) return `${diffHours}h ago`;
        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays}d ago`;
      }
    }
    return 'Recent';
  })();

  return (
    <div
      onClick={() => onSelect(notification)}
      className={`group relative p-3.5 transition-all duration-150 cursor-pointer flex items-start gap-3 hover:bg-slate-50/80 border-b border-slate-100 last:border-b-0 ${
        !notification.read ? 'bg-[#F0FDFA]/60 hover:bg-[#F0FDFA]/90' : 'bg-white'
      }`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(notification);
        }
      }}
      aria-label={`${notification.title} - ${notification.read ? 'Read' : 'Unread'}`}
    >
      {/* Category Icon */}
      <div
        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 border ${config.bgColor} ${config.textColor} ${config.borderColor} shadow-2xs`}
      >
        <IconComponent className="w-4 h-4" />
      </div>

      {/* Content Area */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <span
              className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-md ${config.bgColor} ${config.textColor}`}
            >
              {config.badgeText}
            </span>
            <p className="text-xs font-bold text-slate-900 truncate">{notification.title}</p>
          </div>
          {!notification.read && (
            <span
              className="w-2 h-2 rounded-full bg-teal-600 shrink-0 shadow-xs ring-2 ring-white"
              title="Unread notification"
            />
          )}
        </div>

        <p className="text-[11px] text-slate-600 mt-1 leading-snug line-clamp-2">
          {notification.message}
        </p>

        <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100/60">
          <span className="text-[10px] text-slate-400 font-medium">{formattedTime}</span>

          <div className="flex items-center gap-1.5 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
            {notification.route && (
              <span className="text-[10px] text-teal-700 font-semibold flex items-center gap-0.5 hover:underline">
                View <ExternalLink className="w-2.5 h-2.5" />
              </span>
            )}

            {onDelete && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(notifId, e);
                }}
                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                title="Delete notification"
                aria-label="Delete notification"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
