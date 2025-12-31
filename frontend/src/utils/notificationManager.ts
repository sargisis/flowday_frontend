// Browser Notification Manager
export class NotificationManager {
    private static instance: NotificationManager;
    private permission: NotificationPermission = 'default';

    private constructor() {
        this.permission = Notification.permission;
    }

    static getInstance(): NotificationManager {
        if (!NotificationManager.instance) {
            NotificationManager.instance = new NotificationManager();
        }
        return NotificationManager.instance;
    }

    async requestPermission(): Promise<boolean> {
        if (!('Notification' in window)) {
            console.warn('This browser does not support notifications');
            return false;
        }

        if (this.permission === 'granted') {
            return true;
        }

        const permission = await Notification.requestPermission();
        this.permission = permission;
        return permission === 'granted';
    }

    canNotify(): boolean {
        return this.permission === 'granted';
    }

    notify(title: string, options?: NotificationOptions) {
        if (!this.canNotify()) {
            console.warn('Notifications not permitted');
            return;
        }

        const notification = new Notification(title, {
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            ...options,
        });

        // Auto-close after 10 seconds
        setTimeout(() => notification.close(), 10000);

        return notification;
    }

    // Task reminder notifications
    notifyTaskDue(taskTitle: string, dueIn: string) {
        return this.notify('⏰ Task Due Soon', {
            body: `"${taskTitle}" is due ${dueIn}`,
            tag: 'task-due',
            requireInteraction: false,
        });
    }

    notifyTaskOverdue(taskTitle: string) {
        return this.notify('🚨 Task Overdue', {
            body: `"${taskTitle}" is past its due date`,
            tag: 'task-overdue',
            requireInteraction: true,
        });
    }

    // Focus session notifications
    notifyFocusComplete(duration: string) {
        return this.notify('✅ Focus Session Complete!', {
            body: `Great work! You focused for ${duration}`,
            tag: 'focus-complete',
            requireInteraction: false,
        });
    }

    notifyFocusBreak() {
        return this.notify('☕ Time for a Break', {
            body: 'You\'ve been working hard. Take a 5-minute break!',
            tag: 'focus-break',
            requireInteraction: false,
        });
    }
}

export const notificationManager = NotificationManager.getInstance();
