import { useEffect, useState } from "react";
import { getNotifications, markNotificationRead, type Notification } from "../api/notifications";
import EmptyState from "../components/EmptyState";
import { Bell, Check, Clock, AlertTriangle, CheckCircle2, ShieldAlert, Zap, Target } from "lucide-react";
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
        const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
        if (unreadIds.length === 0) return;

        setNotifications(prev => prev.map(n => ({ ...n, read: true })));

        try {
            await Promise.all(unreadIds.map(id => markNotificationRead(id)));
        } catch (error) {
            loadNotifications();
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'success': return <CheckCircle2 className="text-emerald-400" size={20} />;
            case 'warning': return <AlertTriangle className="text-amber-400" size={20} />;
            case 'error': return <ShieldAlert className="text-rose-400" size={20} />;
            case 'info': return <Zap className="text-indigo-400" size={20} />;
            default: return <Target className="text-blue-400" size={20} />;
        }
    };

    const getBadgeColor = (type: string) => {
        switch (type) {
            case 'success': return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
            case 'warning': return "bg-amber-500/10 text-amber-400 border-amber-500/20";
            case 'error': return "bg-rose-500/10 text-rose-400 border-rose-500/20";
            default: return "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
        }
    };

    return (
        <div className="min-h-screen p-8 lg:p-12 space-y-12 animate-in fade-in duration-700 max-w-5xl mx-auto w-full">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                            <Bell size={18} />
                        </div>
                        <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Signal Feed</span>
                    </div>
                    <h1 className="text-4xl font-bold text-white tracking-tight font-[Outfit]">Notifications</h1>
                    <p className="text-zinc-500 text-lg max-w-xl font-medium leading-relaxed">
                        Incoming transmissions from your system and collaborators.
                    </p>
                </div>

                {notifications.some(n => !n.read) && (
                    <button
                        onClick={handleMarkAllRead}
                        className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 text-white text-sm font-bold rounded-2xl transition-all border border-white/5 active:scale-95 group"
                    >
                        <Check size={18} className="group-hover:scale-110 transition-transform" />
                        Acknowledge All
                    </button>
                )}
            </header>

            <div className="space-y-4 pb-24">
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="relative">
                            <div className="h-12 w-12 rounded-full border-t-2 border-r-2 border-indigo-500 animate-spin" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Zap size={16} className="text-indigo-500 animate-pulse" />
                            </div>
                        </div>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="py-12">
                        <EmptyState
                            icon={Bell}
                            title="Signal Clear"
                            description="No pending alerts or systemic transmissions detected in your current sector."
                            className="bg-zinc-900/20"
                        />
                    </div>
                ) : (
                    notifications.map((notif, index) => (
                        <div
                            key={notif.id}
                            onClick={() => !notif.read && handleMarkAsRead(notif.id)}
                            className={`group relative flex gap-6 p-6 rounded-[2rem] border transition-all duration-300 cursor-pointer overflow-hidden animate-in slide-in-from-bottom-${Math.min(index * 2, 10)} ${notif.read
                                ? "bg-zinc-900/20 border-white/5 hover:border-white/10 grayscale-[0.5] opacity-60"
                                : "bg-gradient-to-br from-white/[0.05] to-white/[0.01] border-white/10 shadow-2xl shadow-indigo-500/5 hover:border-white/20 active:scale-[0.99]"
                                }`}
                        >
                            {/* Unread Glow */}
                            {!notif.read && (
                                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.5)]" />
                            )}

                            <div className={`mt-1 p-4 rounded-2xl border transition-all duration-300 ${notif.read ? "bg-white/5 border-white/5" : "bg-white/10 border-white/10 group-hover:scale-110"
                                }`}>
                                {getIcon(notif.type)}
                            </div>

                            <div className="flex-1 min-w-0 space-y-2">
                                <div className="flex flex-wrap items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <h4 className={`text-xl font-bold tracking-tight ${notif.read ? "text-zinc-400" : "text-white"}`}>
                                            {notif.title}
                                        </h4>
                                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${getBadgeColor(notif.type)}`}>
                                            {notif.type}
                                        </span>
                                    </div>
                                    <span className="text-xs text-zinc-500 whitespace-nowrap font-bold uppercase tracking-wider flex items-center gap-2">
                                        <Clock size={14} />
                                        {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                                    </span>
                                </div>
                                <p className={`text-base leading-relaxed ${notif.read ? "text-zinc-600" : "text-zinc-400 font-medium"}`}>
                                    {notif.message}
                                </p>
                            </div>

                            {/* Mark as read button overlay */}
                            {!notif.read && (
                                <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/20">
                                        <Check size={16} />
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
