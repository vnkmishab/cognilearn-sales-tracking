'use client';

import { useState, useEffect } from 'react';
import { fetchMyNotifications } from '@/lib/api';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export default function EmployeeNotificationsList() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    try {
      const data = await fetchMyNotifications();
      setNotifications(data);
    } catch (e) {
      console.error('Failed to load employee notifications:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-zinc-900/40 backdrop-blur-md rounded-2xl border border-zinc-800 p-6 mb-8 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
        <h2 className="text-xl font-medium text-zinc-100 mb-4">Notifications from Admin</h2>
        <div className="text-zinc-500 text-sm text-center py-6">Loading notifications...</div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900/40 backdrop-blur-md rounded-2xl border border-zinc-800 p-6 mb-8 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
      <h2 className="text-xl font-medium text-zinc-100 mb-6 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
        Notifications from Admin
      </h2>
      
      <div className="space-y-4">
        {notifications.length > 0 ? (
          notifications.map((n) => (
            <div 
              key={n.id} 
              className={`flex justify-between items-start gap-4 border-b border-zinc-800/50 pb-4 last:border-0 last:pb-0 transition-colors p-3 rounded-xl ${
                !n.isRead ? 'bg-amber-500/5 border border-amber-500/10' : 'hover:bg-zinc-800/10 border border-transparent'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className={`w-2 h-2 rounded-full mt-2 shrink-0 ${!n.isRead ? 'bg-amber-500 animate-pulse' : 'bg-zinc-700'}`}></span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-zinc-200">{n.title}</span>
                    {!n.isRead && (
                      <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 bg-amber-500/20 text-amber-500 rounded border border-amber-500/10 tracking-widest">
                        New
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-zinc-400 mt-1 leading-relaxed">{n.message}</p>
                </div>
              </div>
              <span className="text-xs text-zinc-550 font-mono shrink-0 whitespace-nowrap">
                {new Date(n.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}{' '}
                {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))
        ) : (
          <p className="text-zinc-500 text-sm text-center py-6">No notifications received from the administrator.</p>
        )}
      </div>
    </div>
  );
}
