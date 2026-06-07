import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Bell, User, Settings, FileText, Check, Trash2, Sparkles, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/context/authStore';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface SystemNotification {
  type: string;
  message: string;
  timestamp: string;
  data?: any;
  unread: boolean;
}

export default function Header() {
  const { user } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Persistent WebSocket reference
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    setMounted(true);
    connectWebSocket();

    // Close dropdown on clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const connectWebSocket = () => {
    try {
      const wsUrl = 'ws://localhost:8000/ws/notifications';
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('Real-time notification socket connected successfully.');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const newNotif: SystemNotification = {
            type: data.type || 'info',
            message: data.message || 'System update received.',
            timestamp: data.timestamp || new Date().toISOString(),
            data: data.data || {},
            unread: true
          };

          // Append to state
          setNotifications(prev => [newNotif, ...prev]);

          // Trigger dynamic animated toast notification
          toast.custom((t) => (
            <div
              className={`${
                t.visible ? 'animate-enter' : 'animate-leave'
              } max-w-md w-full bg-white dark:bg-slate-800 shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-black/5 border border-slate-100 dark:border-slate-700`}
            >
              <div className="flex-1 w-0 p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 pt-0.5">
                    {newNotif.type === 'resume_upload' ? (
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
                        <FileText size={20} />
                      </span>
                    ) : (
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400">
                        <Sparkles size={20} />
                      </span>
                    )}
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                      {newNotif.type === 'resume_upload' ? 'Resume Uploaded' : 'Match Results Ready'}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {newNotif.message}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex border-l border-slate-100 dark:border-slate-700">
                <button
                  onClick={() => toast.dismiss(t.id)}
                  className="w-full border border-transparent rounded-none rounded-r-2xl p-4 flex items-center justify-center text-xs font-bold text-blue-600 hover:text-blue-500 focus:outline-none"
                >
                  Dismiss
                </button>
              </div>
            </div>
          ), { duration: 6000 });

        } catch (err) {
          console.error('Failed to parse websocket message payload:', err);
        }
      };

      ws.onclose = () => {
        console.log('Notification socket closed. Retrying connection in 5 seconds...');
        setTimeout(() => connectWebSocket(), 5000);
      };

      ws.onerror = (err) => {
        console.error('WebSocket connection error encountered:', err);
        ws.close();
      };

    } catch (error) {
      console.error('Failed to initialize WebSocket handshake:', error);
    }
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    toast.success('All notifications marked as read.');
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    toast.success('Notification tray cleared.');
  };

  return (
    <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between">
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Welcome, {mounted ? (user?.name || 'User') : 'User'}
        </h2>
        <p className="text-xs font-bold text-slate-550 dark:text-slate-400">
          {mounted ? new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }) : ''}
        </p>
      </div>

      <div className="flex items-center gap-4 relative">
        {/* Notification Dropdown Trigger */}
        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className={`p-2 rounded-lg transition-all relative border border-transparent ${
              showDropdown 
                ? 'bg-slate-100 dark:bg-slate-700/80 text-blue-600' 
                : 'hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-400'
            }`}
            aria-label="Notifications"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
              </span>
            )}
          </button>

          {/* Interactive Dropdown Panel */}
          <AnimatePresence>
            {showDropdown && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl z-55 overflow-hidden backdrop-blur-md bg-opacity-95 dark:bg-opacity-95"
              >
                {/* Header */}
                <div className="flex justify-between items-center px-4 py-3 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                  <h4 className="text-xs font-extrabold text-slate-850 dark:text-white uppercase tracking-wider">
                    Notifications ({notifications.length})
                  </h4>
                  {notifications.length > 0 && (
                    <div className="flex gap-2">
                      <button
                        onClick={markAllAsRead}
                        className="text-[10px] text-blue-600 hover:underline font-extrabold flex items-center gap-0.5"
                        title="Mark all as read"
                      >
                        <Check size={12} />
                        Read
                      </button>
                      <button
                        onClick={clearAllNotifications}
                        className="text-[10px] text-red-500 hover:underline font-extrabold flex items-center gap-0.5"
                        title="Clear tray"
                      >
                        <Trash2 size={12} />
                        Clear
                      </button>
                    </div>
                  )}
                </div>

                {/* List Body */}
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-750">
                  {notifications.length > 0 ? (
                    notifications.map((notif, idx) => (
                      <div
                        key={idx}
                        className={`p-4 flex gap-3 transition-colors ${
                          notif.unread
                            ? 'bg-blue-50/20 dark:bg-blue-950/10'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-900/40'
                        }`}
                      >
                        {/* Icon */}
                        <div className="mt-0.5">
                          {notif.type === 'resume_upload' ? (
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
                              <FileText size={14} />
                            </span>
                          ) : (
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400">
                              <Sparkles size={14} />
                            </span>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 space-y-1">
                          <p className={`text-xs text-slate-800 dark:text-slate-200 leading-relaxed ${notif.unread ? 'font-bold' : 'font-medium'}`}>
                            {notif.message}
                          </p>
                          <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                            {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-8 text-center text-slate-450 dark:text-slate-500 flex flex-col items-center gap-2">
                      <AlertCircle size={24} className="text-slate-350" />
                      <p className="text-xs font-semibold">No recent system notifications</p>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-center">
                  <button
                    onClick={() => setShowDropdown(false)}
                    className="text-[10px] font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  >
                    Close Tray Panel
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Link href="/settings" passHref>
          <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all text-slate-600 dark:text-slate-400" aria-label="Settings">
            <Settings size={20} />
          </button>
        </Link>

        <Link href="/profile" passHref>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center cursor-pointer shadow border border-white/20 dark:border-slate-700" aria-label="Profile">
            <User size={20} className="text-white" />
          </div>
        </Link>
      </div>
    </header>
  );
}
