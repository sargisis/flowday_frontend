import { useState, useEffect } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { notificationManager } from '../../utils/notificationManager';

export default function NotificationPermissionBanner() {
    const [permission, setPermission] = useState<NotificationPermission>('default');
    const [isDismissed, setIsDismissed] = useState(false);

    useEffect(() => {
        setPermission(Notification.permission);
        // Check if user previously dismissed
        const dismissed = localStorage.getItem('notification-banner-dismissed');
        setIsDismissed(dismissed === 'true');
    }, []);

    const handleEnableNotifications = async () => {
        const granted = await notificationManager.requestPermission();
        if (granted) {
            setPermission('granted');
            setIsDismissed(true);
            localStorage.setItem('notification-banner-dismissed', 'true');
            // Show test notification
            notificationManager.notify('🎉 Notifications Enabled!', {
                body: 'You\'ll now receive reminders for your tasks',
            });
        }
    };

    const handleDismiss = () => {
        setIsDismissed(true);
        localStorage.setItem('notification-banner-dismissed', 'true');
    };

    // Don't show if already granted or dismissed
    if (permission === 'granted' || isDismissed) {
        return null;
    }

    return (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-5 duration-500">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-2xl shadow-indigo-500/30 p-4 max-w-md">
                <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-white/10">
                        <Bell size={20} className="text-white" />
                    </div>

                    <div className="flex-1">
                        <h3 className="text-white font-semibold text-sm mb-1">
                            Enable Notifications
                        </h3>
                        <p className="text-white/80 text-xs leading-relaxed">
                            Get reminders for upcoming tasks and focus sessions
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleEnableNotifications}
                            className="px-4 py-2 bg-white text-indigo-600 rounded-lg text-xs font-semibold hover:bg-white/90 transition-colors"
                        >
                            Enable
                        </button>
                        <button
                            onClick={handleDismiss}
                            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                            title="Dismiss"
                        >
                            <BellOff size={16} className="text-white/60" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
