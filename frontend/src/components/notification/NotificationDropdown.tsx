import { Bell, CheckCircle2, AlertTriangle, Clock, Check, Info } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { getNotifications, markNotificationRead, type Notification } from '../../api/notifications';
import { useNavigate } from 'react-router-dom';

export default function NotificationDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (isOpen) {
            loadNotifications();
        }
    }, [isOpen]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const loadNotifications = async () => {
        try {
            const data = await getNotifications();
            setNotifications(data);
        } catch (err) {
            console.error("Failed to load notifications", err);
        }
    };

    const formatRelativeTime = (dateStr: string): string => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return `${diffDays}d ago`;
    };

    const handleMarkAsRead = async (notificationId: string) => {
        try {
            await markNotificationRead(notificationId);
            setNotifications(prev => prev.map(n =>
                n.id === notificationId ? { ...n, read: true } : n
            ));
        } catch (err) {
            console.error("Failed to mark as read", err);
        }
    };

    const markAllAsRead = async () => {
        // Optimistically mark all as read
        const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
        const oldState = [...notifications];

        setNotifications(prev => prev.map(n => ({ ...n, read: true })));

        try {
            await Promise.all(unreadIds.map(id => markNotificationRead(id)));
        } catch (err) {
            console.error("Failed to mark all as read", err);
            setNotifications(oldState); // Revert on failure
        }
    };

    const getIcon = (type: Notification['type']) => {
        switch (type) {
            case 'error':
                return <AlertTriangle size={16} className="text-red-400" />;
            case 'warning':
                return <Clock size={16} className="text-orange-400" />;
            case 'success':
                return <CheckCircle2 size={16} className="text-emerald-400" />;
            case 'info':
            default:
                return <Info size={16} className="text-indigo-400" />;
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/10 hover:border-white/20"
            >
                <Bell size={20} className="text-zinc-400" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center animate-pulse">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 top-14 w-96 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden animate-in slide-in-from-top-5 duration-200 z-50">
                    {/* Header */}
                    <div className="p-4 border-b border-white/10 flex items-center justify-between">
                        <div>
                            <h3 className="text-white font-semibold">Notifications</h3>
                            <p className="text-xs text-zinc-500 mt-0.5">
                                {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
                            </p>
                        </div>
                        {notifications.length > 0 && unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                            >
                                Mark all read
                            </button>
                        )}
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center">
                                <Bell size={32} className="text-zinc-700 mx-auto mb-3" />
                                <p className="text-zinc-500 text-sm">No notifications</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-white/5">
                                {notifications.map(notif => (
                                    <div
                                        key={notif.id}
                                        className={`p-4 hover:bg-white/5 transition-colors ${notif.read ? 'opacity-50' : ''}`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="mt-0.5">
                                                {getIcon(notif.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-white text-sm font-medium truncate">
                                                    {notif.title}
                                                </p>
                                                <p className="text-zinc-500 text-xs mt-0.5">
                                                    {notif.message}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-zinc-600 whitespace-nowrap">
                                                    {formatRelativeTime(notif.created_at)}
                                                </span>
                                                {!notif.read && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleMarkAsRead(notif.id);
                                                        }}
                                                        className="p-1 rounded hover:bg-white/10 transition-colors"
                                                        title="Mark as read"
                                                    >
                                                        <Check size={14} className="text-zinc-500 hover:text-emerald-400" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="p-3 border-t border-white/10">
                            <button
                                onClick={() => {
                                    setIsOpen(false);
                                    navigate('/notifications'); // Assuming a dedicated page exists or will exist
                                }}
                                className="w-full text-center text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                            >
                                View All Notifications
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
