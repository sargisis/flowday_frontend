import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Bell, Palette, Shield, LogOut, Mail, Slack, Monitor, Moon, LayoutGrid, Check, X, CreditCard, ExternalLink, Zap } from "lucide-react";

import { useUser } from "../context/UserContext";
import { notificationManager } from "../utils/notificationManager";

export default function SettingsPage() {
    const navigate = useNavigate();
    const { user } = useUser();
    const [activeTab, setActiveTab] = useState("general");
    const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

    useEffect(() => {
        setNotificationPermission(Notification.permission);
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
        if (confirm("Are you sure you want to log out?")) {
            localStorage.removeItem("token");
            navigate("/app/v1/login");
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
                <h1 className="text-4xl font-bold text-white tracking-tight font-[Outfit]">Settings</h1>
                <p className="text-zinc-400 text-lg max-w-2xl">Manage your workspace preferences and account details.</p>
            </header>

            {/* Premium Tabs */}
            <div className="flex flex-wrap gap-2 p-1.5 bg-white/[0.03] rounded-2xl border border-white/5 w-fit backdrop-blur-sm">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                                relative px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2
                                ${isActive ? 'text-white shadow-lg shadow-indigo-500/20' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'}
                            `}
                        >
                            {isActive && (
                                <div className="absolute inset-0 bg-indigo-600 rounded-xl -z-10 animate-in zoom-in-95 duration-200" />
                            )}
                            <Icon size={16} className={isActive ? 'text-white' : 'text-zinc-500'} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Content Area */}
            <div className="max-w-4xl space-y-6">

                {/* General Tab */}
                {activeTab === 'general' && (
                    <div className="space-y-6 animate-in slide-in-from-bottom-5 duration-500">
                        <section className="p-8 rounded-[1.5rem] border border-white/5 bg-gradient-to-br from-white/[0.03] to-white/[0.01] backdrop-blur-xl hover:border-white/10 transition-colors">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                    <Shield size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-white">Workspace General</h3>
                                    <p className="text-zinc-500 text-sm">Configure your main workspace details.</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs uppercase tracking-wider text-zinc-500 font-bold ml-1">Workspace Name</label>
                                    <input
                                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3.5 text-white outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-zinc-700 hover:bg-black/30"
                                        defaultValue="Flowday Engineering"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs uppercase tracking-wider text-zinc-500 font-bold ml-1">Task Stale Age (Days)</label>
                                    <div className="flex items-center gap-4">
                                        <input
                                            className="w-32 bg-black/20 border border-white/10 rounded-xl px-4 py-3.5 text-white outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-zinc-700 hover:bg-black/30"
                                            type="number"
                                            defaultValue={7}
                                        />
                                        <p className="text-sm text-zinc-500">Tasks inactive for this long will be marked as stale.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-white/5 flex justify-end">
                                <button className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 active:scale-95">
                                    Save Changes
                                </button>
                            </div>
                        </section>
                    </div>
                )}

                {/* Notifications Tab */}
                {activeTab === 'notifications' && (
                    <div className="space-y-6 animate-in slide-in-from-bottom-5 duration-500">
                        <section className="p-8 rounded-[1.5rem] border border-white/5 bg-gradient-to-br from-white/[0.03] to-white/[0.01] backdrop-blur-xl">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                    <Bell size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-white">Notification Preferences</h3>
                                    <p className="text-zinc-500 text-sm">Control how and when you get notified.</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {/* Browser Notifications */}
                                <div className="p-6 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                                                <Bell size={20} />
                                            </div>
                                            <div>
                                                <h4 className="text-base font-medium text-white">Browser Notifications</h4>
                                                <p className="text-sm text-zinc-500">Get alerts for task reminders and focus sessions</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {notificationPermission === 'granted' && (
                                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-medium">
                                                    <Check size={14} />
                                                    Enabled
                                                </div>
                                            )}
                                            {notificationPermission === 'denied' && (
                                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-xs font-medium">
                                                    <X size={14} />
                                                    Blocked
                                                </div>
                                            )}
                                            {notificationPermission === 'default' && (
                                                <button
                                                    onClick={handleEnableNotifications}
                                                    className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-all"
                                                >
                                                    Enable
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {notificationPermission === 'denied' && (
                                        <div className="mt-4 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
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

                                {/* Other notification options */}
                                {[
                                    { title: "Email Notifications", desc: "Receive daily summaries and high priority alerts.", icon: Mail, checked: true },
                                    { title: "Slack Integration", desc: "Forward task updates to your team Slack channel.", icon: Slack, checked: false }
                                ].map((item, i) => (
                                    <label key={i} className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors cursor-pointer group">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 rounded-lg bg-white/5 text-zinc-400 group-hover:text-white transition-colors">
                                                <item.icon size={18} />
                                            </div>
                                            <div>
                                                <h4 className="text-base font-medium text-white">{item.title}</h4>
                                                <p className="text-sm text-zinc-500">{item.desc}</p>
                                            </div>
                                        </div>
                                        <div className="relative">
                                            <input type="checkbox" className="sr-only peer" defaultChecked={item.checked} />
                                            <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </section>
                    </div>
                )}

                {/* Appearance Tab */}
                {activeTab === 'appearance' && (
                    <div className="space-y-6 animate-in slide-in-from-bottom-5 duration-500">
                        <section className="p-8 rounded-[1.5rem] border border-white/5 bg-gradient-to-br from-white/[0.03] to-white/[0.01] backdrop-blur-xl">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                    <Palette size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-white">Interface Customization</h3>
                                    <p className="text-zinc-500 text-sm">Make Flowday feel like home.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 rounded-2xl border-2 border-indigo-500/50 bg-indigo-500/5 relative cursor-pointer group">
                                    <div className="absolute top-4 right-4 h-4 w-4 rounded-full bg-indigo-500 border-2 border-zinc-950 flex items-center justify-center">
                                        <div className="h-1.5 w-1.5 rounded-full bg-white" />
                                    </div>
                                    <div className="p-3 rounded-xl bg-zinc-950 border border-white/10 w-fit mb-4">
                                        <Moon size={20} className="text-indigo-400" />
                                    </div>
                                    <h4 className="text-white font-medium mb-1">Dark Mode</h4>
                                    <p className="text-xs text-indigo-200/60">Easy on the eyes, perfect for focus.</p>
                                </div>

                                <div className="p-4 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors cursor-pointer group hover:border-white/10 opacity-60">
                                    <div className="p-3 rounded-xl bg-zinc-900 border border-white/10 w-fit mb-4 group-hover:bg-zinc-800 transition-colors">
                                        <Monitor size={20} className="text-zinc-400" />
                                    </div>
                                    <h4 className="text-white font-medium mb-1">Light Mode</h4>
                                    <p className="text-xs text-zinc-500">Coming soon.</p>
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t border-white/5">
                                <label className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors cursor-pointer group">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 rounded-lg bg-white/5 text-zinc-400 group-hover:text-white transition-colors">
                                            <LayoutGrid size={18} />
                                        </div>
                                        <div>
                                            <h4 className="text-base font-medium text-white">Compact View</h4>
                                            <p className="text-sm text-zinc-500">Reduce spacing in task lists to show more data.</p>
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <input type="checkbox" className="sr-only peer" />
                                        <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                    </div>
                                </label>
                            </div>
                        </section>
                    </div>
                )}

                {/* Billing Tab */}
                {activeTab === 'billing' && (
                    <div className="space-y-8 animate-in slide-in-from-bottom-5 duration-500">
                        <section className="p-8 rounded-[1.5rem] border border-white/5 bg-gradient-to-br from-white/[0.03] to-white/[0.01] backdrop-blur-xl">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                    <CreditCard size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-white">Subscription & Billing</h3>
                                    <p className="text-zinc-500 text-sm">Manage your plan and payment methods.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Free Tier Card */}
                                <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="text-lg font-bold text-white">Standard</h4>
                                            <p className="text-zinc-500 text-xs">For individual focus</p>
                                        </div>
                                        <span className="px-2 py-1 rounded-md bg-zinc-800 text-zinc-400 text-[10px] font-bold uppercase tracking-widest border border-white/5">Current Plan</span>
                                    </div>
                                    <div className="text-3xl font-bold text-white">$0 <span className="text-sm text-zinc-500 font-normal">/ month</span></div>
                                    <ul className="space-y-2 text-sm text-zinc-400">
                                        <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500" /> 3 Active Projects</li>
                                        <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500" /> Basic AI Coach</li>
                                        <li className="flex items-center gap-2"><Check size={14} className="text-emerald-500" /> Kanban Board</li>
                                    </ul>
                                </div>

                                {/* PRO Tier Card */}
                                <div className="p-6 rounded-2xl border-2 border-indigo-500/50 bg-indigo-500/[0.03] space-y-4 relative overflow-hidden group">
                                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/10 blur-3xl group-hover:bg-indigo-500/20 transition-all duration-500" />
                                    <div className="flex justify-between items-start relative z-10">
                                        <div>
                                            <h4 className="text-lg font-bold text-white flex items-center gap-2">
                                                Flowday PRO
                                                <Zap size={16} className="text-indigo-400 fill-indigo-400" />
                                            </h4>
                                            <p className="text-indigo-200/50 text-xs text-indigo-400">For power users</p>
                                        </div>
                                        <span className="px-2 py-1 rounded-md bg-indigo-500 text-white text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-indigo-500/20 animate-pulse">Best Value</span>
                                    </div>
                                    <div className="text-3xl font-bold text-white relative z-10">$9.99 <span className="text-sm text-indigo-200/50 font-normal text-indigo-400">/ month</span></div>
                                    <ul className="space-y-2 text-sm text-indigo-200/70 relative z-10 text-indigo-400">
                                        <li className="flex items-center gap-2"><Zap size={14} className="text-amber-400" /> Unlimited Projects</li>
                                        <li className="flex items-center gap-2"><Zap size={14} className="text-amber-400" /> AI Task Decomposition</li>
                                        <li className="flex items-center gap-2"><Zap size={14} className="text-amber-400" /> Premium Soundscapes</li>
                                        <li className="flex items-center gap-2"><Zap size={14} className="text-amber-400" /> Global Task Search</li>
                                    </ul>
                                    <button className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/20 mt-2 relative z-10 active:scale-[0.98]">
                                        Upgrade to PRO
                                    </button>
                                </div>
                            </div>
                        </section>

                        <section className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-2 rounded-xl bg-white/5 text-zinc-400">
                                    <Mail size={18} />
                                </div>
                                <div>
                                    <h4 className="text-white font-medium">Need something custom?</h4>
                                    <p className="text-xs text-zinc-500">Contact us for team licenses and custom enterprise builds.</p>
                                </div>
                            </div>
                            <button className="text-sm text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 group">
                                Support Channel
                                <ExternalLink size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                            </button>
                        </section>
                    </div>
                )}

                {/* Account Tab */}
                {activeTab === 'account' && (
                    <div className="space-y-6 animate-in slide-in-from-bottom-5 duration-500">
                        <section className="p-8 rounded-[1.5rem] border border-white/5 bg-gradient-to-br from-white/[0.03] to-white/[0.01] backdrop-blur-xl">
                            <div className="flex items-center gap-6 mb-8">
                                <div className="h-24 w-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 p-[2px] shadow-2xl shadow-indigo-500/20">
                                    <div className="h-full w-full rounded-full bg-zinc-950 flex items-center justify-center relative overflow-hidden group cursor-pointer">
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="text-xs font-bold text-white uppercase">Upload</span>
                                        </div>
                                        <span className="text-3xl font-bold text-white">U</span>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-2xl font-bold text-white">{user?.name || 'User Account'}</h3>
                                    <p className="text-zinc-400">{user?.email || 'user@example.com'}</p>
                                    <div className="flex items-center gap-2 pt-2">
                                        <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase tracking-wide">Early Access</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="form-group space-y-2">
                                    <label className="text-xs uppercase tracking-wider text-zinc-500 font-bold ml-1">Email Address</label>
                                    <input className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3.5 text-zinc-400 cursor-not-allowed" defaultValue={user?.email || "user@example.com"} disabled />
                                </div>
                            </div>
                        </section>

                        <section className="p-8 rounded-[1.5rem] border border-red-500/20 bg-red-500/[0.02] backdrop-blur-xl hover:bg-red-500/[0.04] transition-colors">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 rounded-xl bg-red-500/10 text-red-400">
                                    <LogOut size={24} />
                                </div>
                                <h3 className="text-xl font-semibold text-red-200">Danger Zone</h3>
                            </div>
                            <p className="text-red-200/60 mb-6 max-w-lg">
                                Logging out will end your current session. You will need to log in again to access any of your projects. Ensure you have saved all changes.
                            </p>
                            <button
                                onClick={handleLogout}
                                className="px-6 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-medium transition-all flex items-center gap-2 group"
                            >
                                <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
                                Log Out Session
                            </button>
                        </section>
                    </div>
                )}
            </div>
        </div>
    );
}
