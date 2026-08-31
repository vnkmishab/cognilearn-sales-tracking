'use client';

import { useState, useEffect } from 'react';
import { fetchMyNotifications, markMyNotificationRead } from '@/lib/api';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export default function EmployeeNotificationsTray() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    try {
      const data = await fetchMyNotifications();
      // Only show unread notifications in the warning banners
      setNotifications(data.filter((n: Notification) => !n.isRead));
    } catch (e) {
      console.error('Failed to load employee notifications:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();

    // Poll for notifications every 10 seconds to make it real-time
    const interval = setInterval(loadNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleDismiss = async (id: string) => {
    try {
      await markMyNotificationRead(id);
      // Remove from list to trigger fade-out / collapse
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (e) {
      console.error('Failed to mark notification as read:', e);
    }
  };

  if (loading || notifications.length === 0) return null;

  return (
    <div className="space-y-4 mb-6">
      {notifications.map((n) => (
        <div
          key={n.id}
          className="relative overflow-hidden bg-amber-500/10 backdrop-blur-md border border-amber-500/20 p-5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.15)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all animate-in fade-in slide-in-from-top-4 duration-300"
        >
          {/* Decorative glowing gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/5 to-amber-500/0 pointer-events-none"></div>

          <div className="flex items-start gap-3.5 relative z-10">
            <div className="p-2 bg-amber-500/20 rounded-xl text-amber-500 mt-0.5 shrink-0 flex items-center justify-center animate-pulse">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-zinc-100 text-sm tracking-wide">
                {n.title}
              </h4>
              <p className="text-zinc-350 text-xs mt-1 leading-relaxed max-w-xl font-light">
                {n.message}
              </p>
            </div>
          </div>

          <button
            onClick={() => handleDismiss(n.id)}
            className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-zinc-950 text-xs font-bold rounded-xl shadow-md transition-all shrink-0 hover:shadow-amber-500/10 active:scale-95 relative z-10"
          >
            Mark as Read
          </button>
        </div>
      ))}
    </div>
  );
}
