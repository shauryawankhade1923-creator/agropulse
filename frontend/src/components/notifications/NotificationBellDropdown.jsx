import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, 
  Smartphone, 
  MessageSquare, 
  CheckCheck, 
  Send, 
  Sparkles, 
  ExternalLink, 
  Check, 
  Trash2, 
  Clock,
  Coins,
  QrCode,
  Scale,
  Truck,
  AlertCircle
} from 'lucide-react';
import { api } from '../../api';
import { useLanguage } from '../../i18n/LanguageContext';

export default function NotificationBellDropdown({ 
  onOpenSendSMS, 
  onOpenFullHub,
  setActiveTab 
}) {
  const { t, language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [activeChannel, setActiveChannel] = useState('ALL'); // 'ALL', 'APP', 'SMS', 'WHATSAPP'
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const data = await api.getNotificationLogs(activeChannel === 'ALL' ? null : activeChannel, 30);
      setNotifications(data || []);

      const unreadData = await api.getUnreadNotificationCount();
      setUnreadCount(unreadData?.unread_count || 0);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, [activeChannel]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  const handleMarkAllRead = async () => {
    try {
      await api.markNotificationsRead({ mark_all: true });
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error("Failed to mark read:", err);
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.is_read) {
      try {
        await api.markNotificationsRead({ notification_id: notif.id, mark_all: false });
        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (err) {
        console.error(err);
      }
    }

    if (setActiveTab) {
      if (notif.event_type.includes('BID')) {
        setActiveTab('incoming-bids');
      } else if (notif.event_type.includes('TOKEN')) {
        setActiveTab('tokens');
      } else if (notif.event_type.includes('QUEUE')) {
        setActiveTab('queue');
      } else if (notif.event_type.includes('PAYMENT')) {
        setActiveTab('payments');
      } else if (notif.event_type.includes('FREIGHT')) {
        setActiveTab('freight');
      }
      setIsOpen(false);
    }
  };

  const getEventIcon = (eventType, channel) => {
    if (channel === 'SMS') return <Smartphone className="w-3.5 h-3.5 text-blue-400" />;
    if (channel === 'WHATSAPP') return <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />;
    if (eventType.includes('PAYMENT')) return <Coins className="w-3.5 h-3.5 text-emerald-400" />;
    if (eventType.includes('TOKEN')) return <QrCode className="w-3.5 h-3.5 text-amber-400" />;
    if (eventType.includes('QUEUE')) return <Scale className="w-3.5 h-3.5 text-blue-400" />;
    if (eventType.includes('FREIGHT')) return <Truck className="w-3.5 h-3.5 text-purple-400" />;
    return <Bell className="w-3.5 h-3.5 text-slate-400" />;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition cursor-pointer flex items-center justify-center shadow-sm"
        title="Mandi Alerts & Push Notifications"
        aria-label="View notifications"
      >
        <Bell className="w-4 h-4 text-slate-300 hover:text-emerald-400 transition" />
        
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-red-600 text-[10px] font-extrabold text-white shadow-md animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown Card */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50 animate-fade-in flex flex-col max-h-[500px]">
          
          {/* Header */}
          <div className="p-3.5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white">
                  {t('notif_center_title')}
                </h3>
                <span className="text-[10px] text-slate-400 font-mono">
                  {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="px-2 py-1 rounded text-[11px] font-medium text-slate-400 hover:text-emerald-400 hover:bg-slate-850 transition cursor-pointer flex items-center space-x-1"
                title={t('btn_mark_all_read')}
              >
                <Check className="w-3 h-3" />
                <span className="hidden sm:inline">{t('btn_mark_all_read')}</span>
              </button>
            </div>
          </div>

          {/* Quick Action Top Bar: Send SMS / App Alert */}
          <div className="px-3 py-2 bg-slate-850/70 border-b border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={() => { onOpenSendSMS(); setIsOpen(false); }}
              className="w-full py-1.5 px-3 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition flex items-center justify-center space-x-2 shadow cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{t('btn_send_custom_sms')}</span>
            </button>
          </div>

          {/* Channel Filters */}
          <div className="px-3 py-2 border-b border-slate-800 bg-slate-950/60 flex items-center space-x-1 overflow-x-auto no-scrollbar">
            {['ALL', 'APP', 'SMS', 'WHATSAPP'].map((ch) => (
              <button
                key={ch}
                onClick={() => setActiveChannel(ch)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap transition cursor-pointer ${
                  activeChannel === ch
                    ? 'bg-slate-800 text-emerald-400 border border-slate-700 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {ch === 'ALL' && t('notif_tab_all')}
                {ch === 'APP' && t('notif_tab_app')}
                {ch === 'SMS' && t('notif_tab_sms')}
                {ch === 'WHATSAPP' && t('notif_tab_whatsapp')}
              </button>
            ))}
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-850 max-h-[300px]">
            {notifications.length === 0 ? (
              <div className="py-10 text-center text-slate-500 text-xs px-4 space-y-1">
                <Bell className="w-6 h-6 mx-auto text-slate-600 opacity-50 mb-1" />
                <p>{t('no_notifications')}</p>
                <p className="text-[10px] text-slate-600">Send an instant SMS or trigger an alert above!</p>
              </div>
            ) : (
              notifications.map((notif) => {
                const isUnread = !notif.is_read;
                const isSMS = notif.channel === 'SMS';
                const isApp = notif.channel === 'APP';

                return (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`p-3 text-xs transition cursor-pointer hover:bg-slate-800/80 flex items-start space-x-2.5 ${
                      isUnread ? 'bg-slate-850/90 border-l-2 border-emerald-500' : 'bg-slate-900/60 opacity-85'
                    }`}
                  >
                    <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 shrink-0 mt-0.5">
                      {getEventIcon(notif.event_type, notif.channel)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold truncate ${isUnread ? 'text-white' : 'text-slate-300'}`}>
                          {notif.title}
                        </span>
                        <span className="text-[9px] text-slate-500 font-mono shrink-0 ml-1">
                          {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2 leading-tight font-sans">
                        {notif.message_content.replace(/\*/g, '')}
                      </p>

                      <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                        <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono ${
                          isSMS ? 'bg-blue-950 text-blue-400 border border-blue-800' :
                          (isApp ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-950 text-slate-400')
                        }`}>
                          {notif.channel}
                        </span>
                        <span className="font-mono text-[9px] text-slate-500">
                          {notif.recipient_phone}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer View All Link */}
          <div className="p-2.5 border-t border-slate-800 bg-slate-950 text-center">
            <button
              type="button"
              onClick={() => { onOpenFullHub(); setIsOpen(false); }}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition flex items-center justify-center space-x-1 mx-auto cursor-pointer"
            >
              <span>Open Full SMS & Notification Simulator</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
