import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Bell, Palette, Shield, LogOut, Mail, Slack, Monitor, Moon, LayoutGrid } from "lucide-react";

import { useUser } from "../context/UserContext";

export default function SettingsPage() {
    const navigate = useNavigate();
    const { user } = useUser();
    const [activeTab, setActiveTab] = useState("general");

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
