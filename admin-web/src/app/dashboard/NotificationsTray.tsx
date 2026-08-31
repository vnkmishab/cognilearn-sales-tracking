'use client';

import { useState, useEffect, useRef } from 'react';
import { fetchNotifications, markNotificationRead } from '@/lib/api';

export default function NotificationsTray() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const loadNotifications = async () => {
    try {
      const data = await fetchNotifications();
      // Filter for unread ones in display count, but keep all in dropdown
      setNotifications(data);
    } catch (e) {
      console.warn('Failed to load notifications:', e);
    }
  };

  useEffect(() => {
    loadNotifications();

    // Poll every 15 seconds for new alerts
    const interval = setInterval(loadNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleDismiss = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (e) {
      console.error('Failed to dismiss notification:', e);
    }
  };

  return (
    <div className="relative px-6 py-2 border-b border-zinc-800/50 bg-zinc-950/20" ref={dropdownRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between cursor-pointer group hover:bg-zinc-800/30 p-2.5 rounded-xl border border-transparent hover:border-zinc-800/50 transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="relative p-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-zinc-400 group-hover:text-amber-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-500 text-zinc-950 text-[9px] font-bold rounded-full w-4.5 h-4.5 flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </div>
          <span className="text-sm font-medium text-zinc-300 group-hover:text-zinc-100 transition-colors">Alerts & Resignations</span>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-zinc-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {isOpen && (
        <div className="absolute left-6 right-6 mt-2 w-[calc(100%-3rem)] bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl z-50 overflow-hidden max-h-80 flex flex-col">
          <div className="p-3 border-b border-zinc-800/80 bg-zinc-900/40 flex justify-between items-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Notifications</span>
            {unreadCount > 0 && (
              <span className="text-[10px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded-full font-semibold">
                {unreadCount} new
              </span>
            )}
          </div>
          
          <div className="overflow-y-auto divide-y divide-zinc-900 flex-1">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`p-3 text-xs transition-colors hover:bg-zinc-900/40 relative ${
                    notification.isRead ? 'opacity-60' : 'bg-amber-500/[0.02]'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <span className="font-semibold text-zinc-200">{notification.title}</span>
                    <span className="text-[9px] text-zinc-600 font-medium">
                      {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-zinc-400 leading-relaxed font-light mb-1">{notification.message}</p>
                  
                  {!notification.isRead && (
                    <button
                      onClick={(e) => handleDismiss(notification.id, e)}
                      className="text-[10px] text-amber-500 hover:text-amber-400 font-semibold transition-colors mt-2"
                    >
                      Dismiss Alert
                    </button>
                  )}
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-zinc-600 text-xs">
                No alerts at this time.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
