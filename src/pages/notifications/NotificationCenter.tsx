import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Pill,
  Calendar,
  FileText,
  Activity,
  Trash2,
  CheckCheck,
  Search,
  Filter,
  ArrowRight,
  Radio,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  category: 'emergency' | 'medication' | 'appointment' | 'report' | 'vitals' | 'system';
  priority: 'critical' | 'high' | 'normal' | 'low';
  read: boolean;
  createdAt: string;
  route?: string;
  actionLabel?: string;
}

export interface ActivityFeedItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  actor: string;
  type: 'log' | 'consult' | 'prescription' | 'analysis';
}

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Critical Emergency Triage Dispatched',
    message: 'EMS and tele-triage Dr. Anita Verma alerted for elevated heart rate threshold.',
    category: 'emergency',
    priority: 'critical',
    read: false,
    createdAt: '5m ago',
    route: '/emergency',
    actionLabel: 'Open Emergency Center',
  },
  {
    id: 'notif-2',
    title: 'Medication Due: Metformin 500mg',
    message: 'Time to take your morning dose with breakfast to maintain glycemic balance.',
    category: 'medication',
    priority: 'high',
    read: false,
    createdAt: '30m ago',
    route: '/medicines',
    actionLabel: 'Mark Taken',
  },
  {
    id: 'notif-3',
    title: 'Diagnostic Report Analyzed',
    message: 'Comprehensive Metabolic Panel (CMP-14) extracted 13 clinical biomarkers with 2 elevated values.',
    category: 'report',
    priority: 'normal',
    read: true,
    createdAt: '2h ago',
    route: '/medical-reports',
    actionLabel: 'View Report Intelligence',
  },
  {
    id: 'notif-4',
    title: 'Upcoming Telemedicine Consultation',
    message: 'Scheduled follow-up with Dr. Sarah Mitchell starts in 45 minutes.',
    category: 'appointment',
    priority: 'high',
    read: false,
    createdAt: '3h ago',
    route: '/telemedicine',
    actionLabel: 'Enter Waiting Room',
  },
  {
    id: 'notif-5',
    title: 'Vitals Sync Confirmed',
    message: 'Continuous heart rate and SpO2 telemetry recorded from connected wearable.',
    category: 'vitals',
    priority: 'low',
    read: true,
    createdAt: '5h ago',
    route: '/dashboard',
    actionLabel: 'View Health Dashboard',
  },
  {
    id: 'notif-6',
    title: 'Predictive Care Model Recalibrated',
    message: 'Longitudinal Digital Twin updated with latest 90-day lab trends.',
    category: 'system',
    priority: 'low',
    read: true,
    createdAt: '1d ago',
    route: '/predictive',
    actionLabel: 'View Predictive AI',
  },
];

export const INITIAL_ACTIVITIES: ActivityFeedItem[] = [
  {
    id: 'act-1',
    title: 'Prescription Digital Signature',
    description: 'Dr. Sarah Mitchell digitally signed your Metformin and Lisinopril prescription.',
    timestamp: 'Today, 10:15 AM',
    actor: 'Dr. Sarah Mitchell',
    type: 'prescription',
  },
  {
    id: 'act-2',
    title: 'Lab Report Uploaded & Processed',
    description: 'Blood chemistry OCR scan completed with automated reference range checks.',
    timestamp: 'Today, 08:30 AM',
    actor: 'HealthSphere AI OCR',
    type: 'analysis',
  },
  {
    id: 'act-3',
    title: 'Vitals Logged via Wearable',
    description: 'Blood pressure recorded at 138/88 mmHg. Status tagged as elevated.',
    timestamp: 'Yesterday, 09:45 PM',
    actor: 'HealthSphere Sync',
    type: 'log',
  },
  {
    id: 'act-4',
    title: 'Telemedicine Session Completed',
    description: '15-minute video consultation with Cardiology specialist.',
    timestamp: 'Aug 24, 2026',
    actor: 'Dr. Rajesh Patel',
    type: 'consult',
  },
];

export default function NotificationCenter() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'critical' | 'activity'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);
  const criticalCount = useMemo(
    () => notifications.filter((n) => n.priority === 'critical').length,
    [notifications]
  );

  const handleToggleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    );
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleDeleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      // Tab filter
      if (activeTab === 'unread' && item.read) return false;
      if (activeTab === 'critical' && item.priority !== 'critical') return false;

      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return (
          item.title.toLowerCase().includes(query) ||
          item.message.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [notifications, activeTab, selectedCategory, searchQuery]);

  const getCategoryIcon = (category: NotificationItem['category']) => {
    switch (category) {
      case 'emergency':
        return <AlertTriangle className="w-4 h-4 text-rose-600" />;
      case 'medication':
        return <Pill className="w-4 h-4 text-blue-600" />;
      case 'appointment':
        return <Calendar className="w-4 h-4 text-purple-600" />;
      case 'report':
        return <FileText className="w-4 h-4 text-teal-600" />;
      case 'vitals':
        return <Activity className="w-4 h-4 text-emerald-600" />;
      case 'system':
        return <Sparkles className="w-4 h-4 text-amber-600" />;
    }
  };

  return (
    <div data-testid="notification-center-page" className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-teal-700 text-white">
              <Bell className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 font-heading">
              Notification Center & Real-Time Activity Feed
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time clinical alerts, medication reminders, telemetry milestones, and patient timeline events
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold">
            <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-500" />
            <span>Live Stream Connected</span>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0}
            className="rounded-xl border-slate-200 dark:border-slate-800 text-xs font-bold gap-1.5 cursor-pointer"
          >
            <CheckCheck className="w-4 h-4 text-teal-600" />
            <span>Mark All Read</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleClearAll}
            disabled={notifications.length === 0}
            className="rounded-xl border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 hover:text-rose-600 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 text-xs font-extrabold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'all'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>All Notifications</span>
            <span className="px-1.5 py-0.2 rounded-full bg-teal-800 text-[10px] text-white">
              {notifications.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('unread')}
            className={`px-3.5 py-1.5 text-xs font-extrabold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'unread'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>Unread</span>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-[10px] text-white">
                {unreadCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('critical')}
            className={`px-3.5 py-1.5 text-xs font-extrabold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'critical'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>Critical Alerts</span>
            {criticalCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-white text-rose-600 text-[10px] font-black">
                {criticalCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('activity')}
            className={`px-3.5 py-1.5 text-xs font-extrabold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'activity'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Activity Feed</span>
          </button>
        </div>

        {/* Search Bar */}
        {activeTab !== 'activity' && (
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>
        )}
      </div>

      {/* Filter Category Chips (when on notification tabs) */}
      {activeTab !== 'activity' && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs font-bold text-slate-400 flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>
          {[
            { id: 'all', label: 'All Categories' },
            { id: 'emergency', label: 'Emergencies' },
            { id: 'medication', label: 'Medications' },
            { id: 'appointment', label: 'Appointments' },
            { id: 'report', label: 'Reports' },
            { id: 'vitals', label: 'Vitals' },
            { id: 'system', label: 'System' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1 text-xs font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-700'
                  : 'bg-white dark:bg-slate-900 text-slate-500 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}

      {/* Notifications List or Activity Feed */}
      {activeTab === 'activity' ? (
        /* Activity Feed View */
        <div data-testid="activity-feed-section" className="space-y-4">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Chronological Patient Activity Stream
            </h3>
            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
              {INITIAL_ACTIVITIES.map((act) => (
                <div key={act.id} data-testid={`activity-item-${act.id}`} className="relative group">
                  <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-teal-600 ring-4 ring-white dark:ring-slate-900" />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{act.title}</h4>
                      <span className="text-[10px] font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded-md">
                        {act.actor}
                      </span>
                      <span className="text-[11px] text-slate-400">• {act.timestamp}</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">{act.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Notifications List View */
        <div data-testid="notifications-list-section" className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2">
              <Bell className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No Notifications Found</p>
              <p className="text-xs text-slate-400">All current clinical alerts have been handled or filtered.</p>
            </div>
          ) : (
            filteredNotifications.map((notif) => {
              const isUnread = !notif.read;
              const isCritical = notif.priority === 'critical';

              return (
                <div
                  key={notif.id}
                  data-testid={`notification-card-${notif.id}`}
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs ${
                    isCritical
                      ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/60'
                      : isUnread
                      ? 'bg-teal-50/30 dark:bg-slate-800/60 border-teal-200 dark:border-teal-900/40'
                      : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 opacity-80 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                      {getCategoryIcon(notif.category)}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                          {notif.title}
                        </h4>
                        {isCritical && (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-600 text-white uppercase">
                            CRITICAL
                          </span>
                        )}
                        {isUnread && (
                          <span className="w-2 h-2 rounded-full bg-teal-600 shrink-0" />
                        )}
                        <span className="text-[11px] text-slate-400">• {notif.createdAt}</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
                        {notif.message}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    {notif.route && notif.actionLabel && (
                      <Button
                        size="sm"
                        onClick={() => navigate(notif.route!)}
                        className="h-8 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold gap-1 shadow-2xs cursor-pointer"
                      >
                        <span>{notif.actionLabel}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleToggleRead(notif.id)}
                      className="h-8 px-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                    >
                      {notif.read ? 'Mark Unread' : 'Mark Read'}
                    </Button>

                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDeleteNotification(notif.id)}
                      className="h-8 w-8 text-slate-400 hover:text-rose-600 rounded-xl cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
