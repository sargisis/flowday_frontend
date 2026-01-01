import { useEffect, useState } from "react";
import { getNotifications, markNotificationRead, type Notification } from "../api/notifications";
import EmptyState from "../components/EmptyState";
import { Bell, Check, Clock, AlertTriangle, Info, CheckCircle2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadNotifications = async () => {
        setIsLoading(true);
        try {
            const data = await getNotifications();
            setNotifications(data);
        } catch (error) {
            console.error("Failed to load notifications", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadNotifications();
    }, []);

    const handleMarkAsRead = async (id: string) => {
        try {
            await markNotificationRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        } catch (error) {
            console.error("Failed to mark as read", error);
        }
    };

    const handleMarkAllRead = async () => {
        // Optimistic update
        const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));

        try {
            await Promise.all(unreadIds.map(id => markNotificationRead(id)));
        } catch (error) {
            loadNotifications(); // Revert on error
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'success': return <CheckCircle2 className="text-green-500" size={20} />;
            case 'warning': return <AlertTriangle className="text-amber-500" size={20} />;
            case 'error': return <AlertTriangle className="text-red-500" size={20} />;
            default: return <Info className="text-blue-500" size={20} />;
        }
    };

    return (
        <div className="h-full flex flex-col p-8 overflow-hidden max-w-4xl mx-auto w-full">
            <header className="flex items-center justify-between mb-8 shrink-0">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">Notifications</h1>
                    <p className="text-zinc-500 text-sm mt-1">Stay updated with your workspace activity</p>
                </div>
                {notifications.some(n => !n.read) && (
                    <button
                        onClick={handleMarkAllRead}
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-sm font-medium rounded-xl transition-colors border border-white/5"
                    >
                        <Check size={16} />
                        Mark all as read
                    </button>
                )}
            </header>

            <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar space-y-4 pb-20">
                {isLoading ? (
                    <div className="flex items-center justify-center h-40">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
                    </div>
                ) : notifications.length === 0 ? (
                    <EmptyState
                        icon={Bell}
                        title="All caught up"
                        description="You have no notifications at the moment."
                        className="bg-transparent border-none mt-12"
                    />
                ) : (
                    notifications.map((notif) => (
                        <div
                            key={notif.id}
                            className={`group relative flex gap-4 p-5 rounded-2xl border transition-all duration-200 ${notif.read
                                ? "bg-zinc-900/30 border-white/5 opacity-70"
                                : "bg-zinc-900/80 border-white/10 shadow-lg shadow-black/20"
                                }`}
                        >
                            <div className={`mt-1 p-2 rounded-full ${notif.read ? "bg-white/5" : "bg-white/10"}`}>
                                {getIcon(notif.type)}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-4">
                                    <h4 className={`text-base font-semibold ${notif.read ? "text-zinc-400" : "text-white"}`}>
                                        {notif.title}
                                    </h4>
                                    <span className="text-xs text-zinc-500 whitespace-nowrap flex items-center gap-1">
                                        <Clock size={12} />
                                        {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                                    </span>
                                </div>
                                <p className="text-sm text-zinc-500 mt-1 leading-relaxed">
                                    {notif.message}
                                </p>
                            </div>

                            {!notif.read && (
                                <button
                                    onClick={() => handleMarkAsRead(notif.id)}
                                    className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 p-2 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-all"
                                    title="Mark as read"
                                >
                                    <div className="w-2 h-2 bg-indigo-500 rounded-full" />
                                </button>
                            )}

                            {!notif.read && (
                                <div className="absolute top-6 right-6 w-2 h-2 bg-indigo-500 rounded-full pointer-events-none group-hover:opacity-0 transition-opacity" />
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
