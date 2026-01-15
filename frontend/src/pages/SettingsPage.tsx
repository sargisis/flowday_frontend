import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Bell, Palette, Shield, LogOut, Mail as MailIcon, Slack, Monitor, Moon, LayoutGrid, Check, X, CreditCard, ExternalLink, Zap, Lock, Mail } from "lucide-react";

import { useUser } from "../context/UserContext";
import { useTheme } from "../context/ThemeContext";
import { notificationManager } from "../utils/notificationManager";
import { updateProfile, uploadAvatar, requestEmailChange, confirmEmailChange, getAvatarUrl, updateNotificationSettings, testSlackWebhook, initiateSlackOAuth, disconnectSlack, getSlackChannels, updateSlackChannel, testSlackOAuth } from "../api/auth";
import { toast } from "sonner";
import { useRef } from "react";

export default function SettingsPage() {
    const navigate = useNavigate();
    const { user, reloadUser } = useUser();
    const { theme, setTheme, compactView, setCompactView } = useTheme();
    const [activeTab, setActiveTab] = useState("general");
    const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
    const [isSaving, setIsSaving] = useState(false);

    // Profile State
    const [name, setName] = useState("");
    const [bio, setBio] = useState("");
    const [workspaceName, setWorkspaceName] = useState("");
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Email Change State
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const [emailStep, setEmailStep] = useState(1); // 1: Request, 2: Confirm
    const [currentPassword, setCurrentPassword] = useState("");
    const [newEmail, setNewEmail] = useState("");
    const [verificationCode, setVerificationCode] = useState("");
    const [isEmailSubmitting, setIsEmailSubmitting] = useState(false);

    // Email and Slack notification preferences - loaded from user data
    const [emailNotifications, setEmailNotifications] = useState<boolean>(false);
    const [slackWebhookURL, setSlackWebhookURL] = useState<string>(""); // Legacy webhook support
    const [isSavingNotifications, setIsSavingNotifications] = useState(false);
    const [isSlackModalOpen, setIsSlackModalOpen] = useState(false);
    const [slackWebhookInput, setSlackWebhookInput] = useState<string>("");
    const [isTestingWebhook, setIsTestingWebhook] = useState(false);
    
    // Slack OAuth state
    const [slackChannels, setSlackChannels] = useState<Array<{id: string; name: string}>>([]);
    const [isLoadingChannels, setIsLoadingChannels] = useState(false);
    const [isConnectingSlack, setIsConnectingSlack] = useState(false);

    useEffect(() => {
        setNotificationPermission(Notification.permission);
        if (user) {
            setName(user.name || "");
            setBio(user.bio || "");
            setAvatarPreview(user.avatar_url || null);
            setWorkspaceName(user.workspace_name || "");
            // Load notification settings from user data
            setEmailNotifications(user.email_notifications ?? false);
            setSlackWebhookURL(user.slack_webhook_url || "");
            
            // Load Slack channels if OAuth is connected
            if (user.slack_connected) {
                loadSlackChannels();
            }
        }
    }, [user]);
    
    const loadSlackChannels = async () => {
        if (!user?.slack_connected) return;
        setIsLoadingChannels(true);
        try {
            const data = await getSlackChannels();
            setSlackChannels(data.channels || []);
        } catch (error: any) {
            console.error("Failed to load Slack channels:", error);
        } finally {
            setIsLoadingChannels(false);
        }
    };
    
    const handleConnectSlack = async () => {
        setIsConnectingSlack(true);
        try {
            const data = await initiateSlackOAuth();
            // Redirect to Slack OAuth page
            window.location.href = data.oauth_url;
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to initiate Slack connection");
            setIsConnectingSlack(false);
        }
    };
    
    const handleDisconnectSlack = async () => {
        setIsSavingNotifications(true);
        try {
            await disconnectSlack();
            await reloadUser();
            setSlackChannels([]);
            toast.success("Slack disconnected successfully");
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to disconnect Slack");
        } finally {
            setIsSavingNotifications(false);
        }
    };
    
    // Check for OAuth callback success
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('slack_connected') === 'true') {
            toast.success("✅ Slack connected successfully!");
            reloadUser();
            // Clean URL
            window.history.replaceState({}, '', '/settings');
        }
    }, []);

    const handleEnableNotifications = async () => {
        const granted = await notificationManager.requestPermission();
        if (granted) {
            setNotificationPermission('granted');
            notificationManager.notify('🎉 Notifications Enabled!', {
                body: 'You\'ll now receive task reminders and focus session alerts',
            });
        } else {
            setNotificationPermission('denied');
        }
    };

    const handleLogout = () => {
        toast("Log Out", {
            description: "Are you sure you want to log out?",
            action: {
                label: "Log Out",
                onClick: () => {
                    localStorage.removeItem("token");
                    toast.success("Logged out successfully");
                    navigate("/app/v1/login");
                },
            },
            cancel: {
                label: "Cancel",
            },
            duration: 5000,
        });
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveProfile = async () => {
        setIsSaving(true);
        try {
            // 1. Upload Avatar if changed
            if (fileInputRef.current?.files?.[0]) {
                await uploadAvatar(fileInputRef.current.files[0]);
            }

            // 2. Update Profile info
            await updateProfile({ name, bio, workspace_name: workspaceName });

            await reloadUser();
            toast.success("Profile updated successfully");
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to update profile");
        } finally {
            setIsSaving(false);
        }
    };

    const handleRequestEmailChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsEmailSubmitting(true);
        try {
            await requestEmailChange(currentPassword, newEmail);
            setEmailStep(2);
            toast.success("Verification code sent to your new email");
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to request email change");
        } finally {
            setIsEmailSubmitting(false);
        }
    };

    const handleConfirmEmailChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsEmailSubmitting(true);
        try {
            await confirmEmailChange(newEmail, verificationCode);
            await reloadUser();
            setIsEmailModalOpen(false);
            setEmailStep(1);
            setCurrentPassword("");
            setNewEmail("");
            setVerificationCode("");
            toast.success("Email updated successfully");
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to confirm email change");
        } finally {
            setIsEmailSubmitting(false);
        }
    };

    const tabs = [
        { id: "general", label: "General", icon: Shield },
        { id: "notifications", label: "Notifications", icon: Bell },
        { id: "appearance", label: "Appearance", icon: Palette },
        { id: "billing", label: "Billing", icon: CreditCard },
        { id: "account", label: "Account", icon: User },
    ];

    return (
        <div className="min-h-screen p-8 lg:p-12 animate-in fade-in duration-700 space-y-8">
            <header className="space-y-2">
                <h1 className="text-4xl font-bold text-zinc-900 dark:text-white tracking-tight font-[Outfit]">Settings</h1>
                <p className="text-zinc-600 dark:text-zinc-400 text-lg max-w-2xl">Manage your workspace preferences and account details.</p>
            </header>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 p-1.5 bg-zinc-100/50 dark:bg-zinc-800/40 rounded-xl border border-zinc-300/30 dark:border-zinc-700/50 w-fit backdrop-blur-sm">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                                relative px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2
                                ${isActive 
                                    ? 'text-white bg-blue-600 shadow-md shadow-blue-500/20' 
                                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-300 hover:bg-zinc-200/50 dark:hover:bg-zinc-700/50'
                                }
                            `}
                        >
                            <Icon size={16} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Content Area */}
            <div className="max-w-4xl space-y-6">

                {/* General Tab */}
                {activeTab === 'general' && (
                    <div className="space-y-6">
                        <section className="p-6 rounded-xl border border-zinc-300/30 dark:border-zinc-700/50 bg-zinc-100/50 dark:bg-zinc-800/40 backdrop-blur-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2.5 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30">
                                    <User size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Public Profile</h3>
                                    <p className="text-zinc-600 dark:text-zinc-400 text-xs">How you appear to other team members</p>
                                </div>
                            </div>

                            <div className="space-y-8">
                                {/* Avatar Upload Section */}
                                <div className="flex flex-col md:flex-row items-center gap-8">
                                    <div className="relative group">
                                        <div className="h-32 w-32 rounded-full ring-4 ring-zinc-300/20 dark:ring-white/5 overflow-hidden bg-zinc-200 dark:bg-zinc-900 flex items-center justify-center">
                                            {avatarPreview ? (
                                                <img
                                                    src={getAvatarUrl(avatarPreview) || ""}
                                                    alt="Avatar preview"
                                                    className="h-full w-full object-cover"
                                                    loading="lazy"
                                                    decoding="async"
                                                />
                                            ) : (
                                                <span className="text-4xl font-bold text-zinc-700">{name[0]?.toUpperCase() || 'U'}</span>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="absolute inset-0 bg-black/60 dark:bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all rounded-full backdrop-blur-[2px]"
                                        >
                                            <span className="text-xs font-bold text-white dark:text-white uppercase tracking-widest">Change</span>
                                        </button>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleAvatarChange}
                                            className="hidden"
                                            accept="image/*"
                                        />
                                    </div>

                                    <div className="flex-1 w-full space-y-4">
                                        <div className="space-y-1.5">
                                            <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wide">Display Name</label>
                                            <input
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                placeholder="Enter your name"
                                                className="w-full bg-white dark:bg-zinc-900/60 border border-zinc-300/50 dark:border-zinc-700/50 rounded-lg px-3 py-2.5 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder:text-zinc-500 dark:placeholder:text-zinc-600"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wide">Bio / Status</label>
                                            <textarea
                                                value={bio}
                                                onChange={(e) => setBio(e.target.value)}
                                                placeholder="Your bio or current focus..."
                                                rows={2}
                                                className="w-full bg-white dark:bg-zinc-900/60 border border-zinc-300/50 dark:border-zinc-700/50 rounded-lg px-3 py-2.5 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder:text-zinc-500 dark:placeholder:text-zinc-600 resize-none"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-zinc-300/30 dark:border-zinc-700/50 pt-5 space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                                            <Shield size={16} />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-semibold text-zinc-900 dark:text-white uppercase tracking-wide">Workspace</h4>
                                            <p className="text-xs text-zinc-600 dark:text-zinc-400">System-wide configuration</p>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                            <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wide">Workspace Name</label>
                                        <input
                                            value={workspaceName}
                                            onChange={(e) => setWorkspaceName(e.target.value)}
                                            className="w-full bg-white dark:bg-zinc-900/60 border border-zinc-300/50 dark:border-zinc-700/50 rounded-lg px-3 py-2.5 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder:text-zinc-500 dark:placeholder:text-zinc-600"
                                            placeholder="Flowday Engineering"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 pt-5 border-t border-zinc-300/30 dark:border-zinc-700/50 flex justify-end">
                                <button
                                    onClick={handleSaveProfile}
                                    disabled={isSaving}
                                    className={`
                                        px-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white text-sm font-semibold transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2
                                        ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}
                                    `}
                                >
                                    {isSaving ? (
                                        <>
                                            <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Check size={16} />
                                            Save Changes
                                        </>
                                    )}
                                </button>
                            </div>
                        </section>
                    </div>
                )}

                {/* Notifications Tab */}
                {activeTab === 'notifications' && (
                    <div className="space-y-6">
                        <section className="p-6 rounded-xl border border-zinc-300/30 dark:border-zinc-700/50 bg-zinc-100/50 dark:bg-zinc-800/40 backdrop-blur-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                    <Bell size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Notification Preferences</h3>
                                    <p className="text-zinc-600 dark:text-zinc-400 text-xs">Control how and when you get notified</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {/* Browser Notifications */}
                                <div className="p-4 rounded-lg border border-zinc-300/30 dark:border-zinc-700/50 bg-zinc-100/50 dark:bg-zinc-800/30 hover:bg-zinc-100/70 dark:hover:bg-zinc-800/50 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30">
                                                <Bell size={16} />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-semibold text-zinc-900 dark:text-white">Browser Notifications</h4>
                                                <p className="text-xs text-zinc-600 dark:text-zinc-400">Get alerts for task reminders and focus sessions</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {notificationPermission === 'granted' && (
                                                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-500/20 text-green-400 text-xs font-medium border border-green-500/30">
                                                    <Check size={12} />
                                                    Enabled
                                                </div>
                                            )}
                                            {notificationPermission === 'denied' && (
                                                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-500/20 text-red-400 text-xs font-medium border border-red-500/30">
                                                    <X size={12} />
                                                    Blocked
                                                </div>
                                            )}
                                            {notificationPermission === 'default' && (
                                                <button
                                                    onClick={handleEnableNotifications}
                                                    className="px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-all"
                                                >
                                                    Enable
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {notificationPermission === 'denied' && (
                                        <div className="mt-3 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                                            <p className="text-xs text-orange-400">
                                                <strong>Notifications are blocked.</strong> Please enable them in your browser settings:
                                                <br />
                                                <span className="text-orange-300/60">
                                                    Chrome: Settings → Privacy → Site Settings → Notifications
                                                    <br />
                                                    Safari: Preferences → Websites → Notifications
                                                </span>
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Email Notifications */}
                                <div className="p-4 rounded-lg border border-zinc-300/30 dark:border-zinc-700/50 bg-zinc-100/50 dark:bg-zinc-800/30 hover:bg-zinc-100/70 dark:hover:bg-zinc-800/50 transition-colors">
                                    <label className="flex items-center justify-between cursor-pointer group">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-zinc-200/50 dark:bg-zinc-700/50 text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                                                <Mail size={16} />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-semibold text-zinc-900 dark:text-white">Email Notifications</h4>
                                                <p className="text-xs text-zinc-600 dark:text-zinc-400">Receive daily summaries and high priority alerts</p>
                                            </div>
                                        </div>
                                        <div className="relative">
                                            <input 
                                                type="checkbox" 
                                                className="sr-only peer" 
                                                checked={emailNotifications}
                                                disabled={isSavingNotifications}
                                                onChange={async (e) => {
                                                    const newValue = e.target.checked;
                                                    setIsSavingNotifications(true);
                                                    try {
                                                        await updateNotificationSettings({ email_notifications: newValue });
                                                        setEmailNotifications(newValue);
                                                        await reloadUser(); // Refresh user data
                                                        toast.success(newValue ? "Email notifications enabled" : "Email notifications disabled");
                                                    } catch (error: any) {
                                                        toast.error(error.response?.data?.error || "Failed to update email notifications");
                                                        // Revert on error
                                                        setEmailNotifications(!newValue);
                                                    } finally {
                                                        setIsSavingNotifications(false);
                                                    }
                                                }}
                                            />
                                            <div className={`w-10 h-5 rounded-full peer-focus:outline-none peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all ${
                                                emailNotifications ? "bg-blue-600" : "bg-zinc-300 dark:bg-zinc-700"
                                            } ${isSavingNotifications ? "opacity-50" : ""}`}></div>
                                        </div>
                                    </label>
                                </div>

                                {/* Slack OAuth Integration */}
                                <div className="p-4 rounded-lg border border-zinc-300/30 dark:border-zinc-700/50 bg-zinc-100/50 dark:bg-zinc-800/30 hover:bg-zinc-100/70 dark:hover:bg-zinc-800/50 transition-colors">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30">
                                                <Slack size={16} />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-semibold text-zinc-900 dark:text-white">Slack Integration</h4>
                                                <p className="text-xs text-zinc-600 dark:text-zinc-400">Connect your Slack workspace to receive task notifications</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {user?.slack_connected ? (
                                        <div className="mt-3 space-y-3">
                                            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1">
                                                        <p className="text-xs font-semibold text-green-400 mb-1">
                                                            ✅ Connected to {user.slack_team_name || "Slack"}
                                                        </p>
                                                        <div className="space-y-1 mt-2">
                                                            {user.slack_user_id && (
                                                                <p className="text-xs text-green-300/80 flex items-center gap-1">
                                                                    💬 Personal notifications: Enabled
                                                                </p>
                                                            )}
                                                            {user.slack_channel_id ? (
                                                                <p className="text-xs text-green-300/80 flex items-center gap-1">
                                                                    📢 Channel notifications: {slackChannels.find(c => c.id === user.slack_channel_id)?.name ? `#${slackChannels.find(c => c.id === user.slack_channel_id)?.name}` : user.slack_channel_id}
                                                                </p>
                                                            ) : (
                                                                <p className="text-xs text-amber-300/80 flex items-center gap-1">
                                                                    📢 Channel notifications: Not configured (select channel below)
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={handleDisconnectSlack}
                                                        disabled={isSavingNotifications}
                                                        className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 hover:text-red-300 text-xs font-semibold transition-all disabled:opacity-50"
                                                    >
                                                        Disconnect
                                                    </button>
                                                </div>
                                            </div>
                                            
                                            {/* Channel Selection */}
                                            {slackChannels.length > 0 && (
                                                <div className="space-y-2">
                                                    <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wide">
                                                        Channel for Team Notifications
                                                    </label>
                                                    <p className="text-xs text-zinc-500 dark:text-zinc-500 mb-2">
                                                        Notifications will be sent to this channel AND to your personal messages (if available)
                                                    </p>
                                                    <select
                                                        value={user.slack_channel_id || ""}
                                                        onChange={async (e) => {
                                                            setIsSavingNotifications(true);
                                                            try {
                                                                await updateSlackChannel(e.target.value);
                                                                await reloadUser();
                                                                toast.success("Channel updated");
                                                            } catch (error: any) {
                                                                toast.error(error.response?.data?.error || "Failed to update channel");
                                                            } finally {
                                                                setIsSavingNotifications(false);
                                                            }
                                                        }}
                                                        disabled={isSavingNotifications || isLoadingChannels}
                                                        className="w-full bg-white dark:bg-zinc-900/60 border border-zinc-300/50 dark:border-zinc-700/50 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50"
                                                    >
                                                        <option value="">Select a channel...</option>
                                                        {slackChannels.map((channel) => (
                                                            <option key={channel.id} value={channel.id}>
                                                                #{channel.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            )}
                                            
                                            <button
                                                onClick={async () => {
                                                    setIsTestingWebhook(true);
                                                    try {
                                                        await testSlackOAuth();
                                                        toast.success("✅ Test notification sent! Check your Slack channel.");
                                                    } catch (error: any) {
                                                        toast.error(error.response?.data?.error || "Failed to send test notification");
                                                    } finally {
                                                        setIsTestingWebhook(false);
                                                    }
                                                }}
                                                disabled={isTestingWebhook}
                                                className="w-full px-3 py-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:text-blue-300 text-xs font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                            >
                                                {isTestingWebhook ? (
                                                    <>
                                                        <div className="w-3 h-3 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
                                                        Sending...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Zap size={12} />
                                                        Test Notification
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="mt-3">
                                            <button
                                                onClick={handleConnectSlack}
                                                disabled={isConnectingSlack}
                                                className="w-full px-4 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white text-sm font-semibold transition-all shadow-lg shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                            >
                                                {isConnectingSlack ? (
                                                    <>
                                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                        Connecting...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Slack size={16} />
                                                        Connect Slack Workspace
                                                    </>
                                                )}
                                            </button>
                                            <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-2 text-center">
                                                Connect your Slack account to receive task notifications directly in your workspace
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>
                    </div>
                )}

                {/* Appearance Tab */}
                {activeTab === 'appearance' && (
                    <div className="space-y-6">
                        <section className="p-6 rounded-xl border border-zinc-700/50 dark:border-zinc-300/30 bg-zinc-100/50 dark:bg-zinc-800/40 backdrop-blur-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2.5 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30">
                                    <Palette size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Interface Customization</h3>
                                    <p className="text-zinc-600 dark:text-zinc-400 text-xs">Make Flowday feel like home</p>
                                </div>
                            </div>

                            <div className="p-4 rounded-lg border border-zinc-700/50 bg-zinc-800/30">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-700/50 w-fit">
                                        <Moon size={18} className="text-blue-400" />
                                    </div>
                                    <div>
                                        <h4 className="text-white font-semibold text-sm mb-1">Dark Mode</h4>
                                        <p className="text-xs text-zinc-400">Flowday is optimized for dark theme. Perfect for focus and extended use.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-5 pt-5 border-t border-zinc-300/30 dark:border-zinc-700/50">
                                <label className="flex items-center justify-between p-4 rounded-lg border border-zinc-300/30 dark:border-zinc-700/50 bg-zinc-100/50 dark:bg-zinc-800/30 hover:bg-zinc-100/70 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer group">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-zinc-200/50 dark:bg-zinc-700/50 text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                                            <LayoutGrid size={16} />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-semibold text-zinc-900 dark:text-white">Compact View</h4>
                                            <p className="text-xs text-zinc-600 dark:text-zinc-400">Reduce spacing in task lists to show more data</p>
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <input 
                                            type="checkbox" 
                                            className="sr-only peer" 
                                            checked={compactView}
                                            onChange={(e) => setCompactView(e.target.checked)}
                                        />
                                        <div className={`w-10 h-5 rounded-full peer-focus:outline-none peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all ${
                                            compactView 
                                                ? "bg-blue-600" 
                                                : "bg-zinc-300 dark:bg-zinc-700"
                                        }`}></div>
                                    </div>
                                </label>
                            </div>
                        </section>
                    </div>
                )}

                {/* Billing Tab */}
                {activeTab === 'billing' && (
                    <div className="space-y-6">
                        <section className="p-6 rounded-xl border border-zinc-300/30 dark:border-zinc-700/50 bg-zinc-100/50 dark:bg-zinc-800/40 backdrop-blur-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                    <CreditCard size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Subscription & Billing</h3>
                                    <p className="text-zinc-600 dark:text-zinc-400 text-xs">Manage your plan and payment methods</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Free Tier Card */}
                                <div className="p-5 rounded-lg border border-zinc-300/30 dark:border-zinc-700/50 bg-zinc-50 dark:bg-zinc-800/30 space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="text-base font-bold text-zinc-900 dark:text-white">Standard</h4>
                                            <p className="text-zinc-600 dark:text-zinc-400 text-xs">For individual focus</p>
                                        </div>
                                        <span className="px-2 py-1 rounded-md bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-[10px] font-bold uppercase tracking-wide border border-zinc-300 dark:border-zinc-600">Current Plan</span>
                                    </div>
                                    <div className="text-2xl font-bold text-zinc-900 dark:text-white">$0 <span className="text-sm text-zinc-600 dark:text-zinc-400 font-normal">/ month</span></div>
                                    <ul className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                                        <li className="flex items-center gap-2"><Check size={12} className="text-green-400" /> 3 Active Projects</li>
                                        <li className="flex items-center gap-2"><Check size={12} className="text-green-400" /> Basic AI Coach</li>
                                        <li className="flex items-center gap-2"><Check size={12} className="text-green-400" /> Kanban Board</li>
                                    </ul>
                                </div>

                                {/* PRO Tier Card */}
                                <div className="p-5 rounded-lg border-2 border-blue-500/50 bg-blue-500/10 space-y-3 relative overflow-hidden group">
                                    <div className="absolute -top-8 -right-8 w-24 h-24 bg-blue-500/10 blur-2xl group-hover:bg-blue-500/20 transition-all duration-500" />
                                    <div className="flex justify-between items-start relative z-10">
                                        <div>
                                            <h4 className="text-base font-bold text-white flex items-center gap-2">
                                                Flowday PRO
                                                <Zap size={14} className="text-blue-400 fill-blue-400" />
                                            </h4>
                                            <p className="text-blue-300/60 text-xs">For power users</p>
                                        </div>
                                        <span className="px-2 py-1 rounded-md bg-blue-500 text-white text-[10px] font-bold uppercase tracking-wide shadow-md shadow-blue-500/20">Best Value</span>
                                    </div>
                                    <div className="text-2xl font-bold text-white relative z-10">$9.99 <span className="text-sm text-blue-300/60 font-normal">/ month</span></div>
                                    <ul className="space-y-1.5 text-xs text-blue-300/70 relative z-10">
                                        <li className="flex items-center gap-2"><Zap size={12} className="text-amber-400" /> Unlimited Projects</li>
                                        <li className="flex items-center gap-2"><Zap size={12} className="text-amber-400" /> AI Task Decomposition</li>
                                        <li className="flex items-center gap-2"><Zap size={12} className="text-amber-400" /> Premium Soundscapes</li>
                                        <li className="flex items-center gap-2"><Zap size={12} className="text-amber-400" /> Global Task Search</li>
                                    </ul>
                                    <button className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition-all shadow-md shadow-blue-500/20 mt-2 relative z-10">
                                        Upgrade to PRO
                                    </button>
                                </div>
                            </div>
                        </section>

                        <section className="p-5 rounded-lg border border-zinc-300/30 dark:border-zinc-700/50 bg-zinc-50 dark:bg-zinc-800/30 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-zinc-200/50 dark:bg-zinc-700/50 text-zinc-600 dark:text-zinc-400">
                                    <Mail size={16} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-semibold text-zinc-900 dark:text-white">Need something custom?</h4>
                                    <p className="text-xs text-zinc-600 dark:text-zinc-400">Contact us for team licenses and custom enterprise builds</p>
                                </div>
                            </div>
                            <button className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 group">
                                Support Channel
                                <ExternalLink size={12} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                            </button>
                        </section>
                    </div>
                )}

                {/* Account Tab */}
                {activeTab === 'account' && (
                    <div className="space-y-6">
                        <section className="p-6 rounded-xl border border-zinc-300/30 dark:border-zinc-700/50 bg-zinc-100/50 dark:bg-zinc-800/40 backdrop-blur-sm">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-[2px] shadow-lg shadow-blue-500/20">
                                    <div className="h-full w-full rounded-full bg-zinc-900 flex items-center justify-center relative overflow-hidden group">
                                        {user?.avatar_url ? (
                                            <img src={getAvatarUrl(user.avatar_url) || ""} alt="Avatar" className="h-full w-full object-cover" loading="lazy" decoding="async" />
                                        ) : (
                                            <span className="text-2xl font-bold text-white">{user?.name?.[0]?.toUpperCase() || 'U'}</span>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white">{user?.name || 'User Account'}</h3>
                                    <p className="text-zinc-600 dark:text-zinc-400 text-sm">{user?.email || 'user@example.com'}</p>
                                    <div className="flex items-center gap-2 pt-1">
                                        <span className="px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-wide">Flowday Member</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <div className="flex justify-between items-end">
                                        <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wide">Email Address (Primary)</label>
                                        <button
                                            onClick={() => setIsEmailModalOpen(true)}
                                            className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                                        >
                                            Change Address
                                        </button>
                                    </div>
                                    <input className="w-full bg-zinc-100 dark:bg-zinc-900/60 border border-zinc-300/50 dark:border-zinc-700/50 rounded-lg px-3 py-2.5 text-zinc-600 dark:text-zinc-400 text-sm cursor-not-allowed" defaultValue={user?.email || "user@example.com"} disabled />
                                    <p className="text-xs text-zinc-500 dark:text-zinc-500">Email is verified and linked to your account</p>
                                </div>
                            </div>
                        </section>

                        <section className="p-6 rounded-xl border border-red-500/20 bg-red-50/50 dark:bg-red-500/10 backdrop-blur-sm hover:bg-red-100/50 dark:hover:bg-red-500/15 transition-colors">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2.5 rounded-lg bg-red-500/20 text-red-500 dark:text-red-400 border border-red-500/30">
                                    <LogOut size={18} />
                                </div>
                                <h3 className="text-lg font-semibold text-red-600 dark:text-red-200">Danger Zone</h3>
                            </div>
                            <p className="text-red-600/70 dark:text-red-200/60 mb-5 text-sm max-w-lg">
                                Logging out will end your current session. You will need to log in again to access any of your projects.
                            </p>
                            <button
                                onClick={handleLogout}
                                className="px-5 py-2.5 rounded-lg bg-red-100 dark:bg-red-500/10 hover:bg-red-200 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-300 dark:border-red-500/20 text-sm font-semibold transition-all flex items-center gap-2 group"
                            >
                                <LogOut size={16} className="group-hover:-translate-x-0.5 transition-transform" />
                                Log Out Session
                            </button>
                        </section>
                    </div>
                )}
            </div>
            {/* Email Change Modal */}
            {isEmailModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 dark:bg-black/60 backdrop-blur-sm p-4">
                    <div className="absolute inset-0" onClick={() => setIsEmailModalOpen(false)} />

                    <div className="relative w-full max-w-md bg-white dark:bg-zinc-900/95 border border-zinc-300/30 dark:border-zinc-800/50 rounded-2xl p-6 shadow-2xl backdrop-blur-xl">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30">
                                    <MailIcon size={18} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Change Email</h3>
                                    <p className="text-xs text-zinc-600 dark:text-zinc-400">Step {emailStep} of 2</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsEmailModalOpen(false)}
                                className="p-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="space-y-4">

                            {emailStep === 1 ? (
                                <form onSubmit={handleRequestEmailChange} className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wide">Verify Password</label>
                                        <div className="relative">
                                            <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                                            <input
                                                type="password"
                                                required
                                                value={currentPassword}
                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                                className="w-full bg-white dark:bg-zinc-900/60 border border-zinc-300/50 dark:border-zinc-700/50 rounded-lg pl-9 pr-3 py-2.5 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                                                placeholder="Enter current password"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wide">New Email Address</label>
                                        <input
                                            type="email"
                                            required
                                            value={newEmail}
                                            onChange={(e) => setNewEmail(e.target.value)}
                                            className="w-full bg-white dark:bg-zinc-900/60 border border-zinc-300/50 dark:border-zinc-700/50 rounded-lg px-3 py-2.5 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                                            placeholder="new-email@example.com"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isEmailSubmitting}
                                        className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white text-sm font-semibold rounded-lg transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 mt-4"
                                    >
                                        {isEmailSubmitting ? 'Verifying...' : 'Request Change'}
                                    </button>
                                </form>
                            ) : (
                                <form onSubmit={handleConfirmEmailChange} className="space-y-4">
                                    <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20">
                                        <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                                            We've sent a 6-digit code to <span className="text-blue-600 dark:text-blue-400 font-semibold">{newEmail}</span>. Please enter it below to confirm.
                                        </p>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wide">Verification Code</label>
                                        <input
                                            required
                                            maxLength={6}
                                            value={verificationCode}
                                            onChange={(e) => setVerificationCode(e.target.value)}
                                            className="w-full bg-white dark:bg-zinc-900/60 border border-zinc-300/50 dark:border-zinc-700/50 rounded-lg px-4 py-3 text-center text-xl font-bold tracking-[0.3em] text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                                            placeholder="000000"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isEmailSubmitting}
                                        className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white text-sm font-semibold rounded-lg transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
                                    >
                                        {isEmailSubmitting ? 'Syncing...' : 'Update Email'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setEmailStep(1)}
                                        className="w-full text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-300 transition-colors font-medium py-2"
                                    >
                                        Go Back
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Slack Webhook Modal */}
            {isSlackModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="absolute inset-0" onClick={() => setIsSlackModalOpen(false)} />
                    <div className="relative w-full max-w-md bg-white dark:bg-zinc-900/95 border border-zinc-300/30 dark:border-zinc-800/50 rounded-2xl p-6 shadow-2xl backdrop-blur-xl">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30">
                                    <Slack size={18} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Configure Slack Webhook</h3>
                                    <p className="text-xs text-zinc-600 dark:text-zinc-400">Enter your Slack webhook URL</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsSlackModalOpen(false)}
                                className="p-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wide">Webhook URL</label>
                                <input
                                    type="text"
                                    value={slackWebhookInput}
                                    onChange={(e) => setSlackWebhookInput(e.target.value)}
                                    placeholder="https://hooks.slack.com/services/..."
                                    className="w-full bg-white dark:bg-zinc-900/60 border border-zinc-300/50 dark:border-zinc-700/50 rounded-lg px-3 py-2.5 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder:text-zinc-500 dark:placeholder:text-zinc-600"
                                />
                                <p className="text-xs text-zinc-500 dark:text-zinc-500">
                                    Get your webhook URL from{" "}
                                    <a href="https://api.slack.com/apps" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">
                                        api.slack.com/apps
                                    </a>
                                </p>
                            </div>

                            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20">
                                <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                                    <strong className="text-blue-600 dark:text-blue-400">Quick setup:</strong>
                                    <br />
                                    1. Go to{" "}
                                    <a href="https://api.slack.com/apps" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline">
                                        Slack API Apps
                                    </a>
                                    <br />
                                    2. Create app → Incoming Webhooks → Enable
                                    <br />
                                    3. Add webhook to workspace → Copy URL
                                </p>
                            </div>

                            <div className="flex flex-col gap-2">
                                <button
                                    onClick={async () => {
                                        if (!slackWebhookInput.trim()) {
                                            toast.error("Webhook URL is required");
                                            return;
                                        }
                                        setIsTestingWebhook(true);
                                        try {
                                            // Test webhook without saving
                                            await testSlackWebhook(slackWebhookInput.trim());
                                            toast.success("✅ Test notification sent! Check your Slack channel.");
                                        } catch (error: any) {
                                            toast.error(error.response?.data?.error || "Failed to test webhook");
                                        } finally {
                                            setIsTestingWebhook(false);
                                        }
                                    }}
                                    disabled={isTestingWebhook || !slackWebhookInput.trim()}
                                    className="w-full px-4 py-2.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-400 hover:text-purple-300 text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isTestingWebhook ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
                                            Testing...
                                        </>
                                    ) : (
                                        <>
                                            <Zap size={14} />
                                            Test Webhook
                                        </>
                                    )}
                                </button>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => {
                                            setIsSlackModalOpen(false);
                                            setSlackWebhookInput("");
                                        }}
                                        className="flex-1 px-4 py-2.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white text-sm font-semibold transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={async () => {
                                            if (!slackWebhookInput.trim()) {
                                                toast.error("Webhook URL is required");
                                                return;
                                            }
                                            setIsSavingNotifications(true);
                                            try {
                                                await updateNotificationSettings({ slack_webhook_url: slackWebhookInput.trim() });
                                                setSlackWebhookURL(slackWebhookInput.trim());
                                                await reloadUser();
                                                setIsSlackModalOpen(false);
                                                setSlackWebhookInput("");
                                                toast.success("Slack webhook configured successfully");
                                            } catch (error: any) {
                                                toast.error(error.response?.data?.error || "Failed to configure Slack webhook");
                                            } finally {
                                                setIsSavingNotifications(false);
                                            }
                                        }}
                                        disabled={isSavingNotifications || !slackWebhookInput.trim()}
                                        className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white text-sm font-semibold transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSavingNotifications ? "Saving..." : "Save Webhook"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
