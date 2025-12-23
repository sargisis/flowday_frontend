import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Bell, Palette, Shield, LogOut } from "lucide-react";

export default function SettingsPage() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("general");

    const handleLogout = () => {
        if (confirm("Are you sure you want to log out?")) {
            localStorage.removeItem("token");
            navigate("/app/v1/login");
        }
    };

    return (
        <div className="settings-container">
            <header className="settings-header">
                <h1 className="settings-title">Settings</h1>
                <p className="settings-subtitle">Manage your workspace preferences and account details.</p>
            </header>

            {/* Tabs */}
            <div className="settings-tabs">
                <button
                    className={`settings-tab ${activeTab === 'general' ? 'active' : ''}`}
                    onClick={() => setActiveTab('general')}
                >
                    General
                </button>
                <button
                    className={`settings-tab ${activeTab === 'notifications' ? 'active' : ''}`}
                    onClick={() => setActiveTab('notifications')}
                >
                    Notifications
                </button>
                <button
                    className={`settings-tab ${activeTab === 'appearance' ? 'active' : ''}`}
                    onClick={() => setActiveTab('appearance')}
                >
                    Appearance
                </button>
                <button
                    className={`settings-tab ${activeTab === 'account' ? 'active' : ''}`}
                    onClick={() => setActiveTab('account')}
                >
                    Account
                </button>
            </div>

            {/* Content */}
            {activeTab === 'general' && (
                <div className="settings-section">
                    <div className="section-title">
                        <Shield size={20} className="text-blue-400" />
                        <span>Workspace General</span>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Workspace Name</label>
                        <input className="input-field" defaultValue="Flowday Engineering" />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Task Stale Age (Days)</label>
                        <input className="input-field" type="number" defaultValue={7} style={{ width: '120px' }} />
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                            Tasks inactive for this long will be marked as stale.
                        </p>
                    </div>

                    <button className="btn">Save Changes</button>
                </div>
            )}

            {activeTab === 'notifications' && (
                <div className="settings-section">
                    <div className="section-title">
                        <Bell size={20} className="text-yellow-400" />
                        <span>Notification Preferences</span>
                    </div>

                    <div className="setting-item">
                        <div className="setting-info">
                            <h4>Email Notifications</h4>
                            <p>Receive daily summaries and high priority alerts.</p>
                        </div>
                        <label className="toggle-switch">
                            <input type="checkbox" defaultChecked />
                            <span className="toggle-slider"></span>
                        </label>
                    </div>

                    <div className="setting-item">
                        <div className="setting-info">
                            <h4>Slack Integration</h4>
                            <p>Forward task updates to your team Slack channel.</p>
                        </div>
                        <label className="toggle-switch">
                            <input type="checkbox" />
                            <span className="toggle-slider"></span>
                        </label>
                    </div>
                </div>
            )}

            {activeTab === 'appearance' && (
                <div className="settings-section">
                    <div className="section-title">
                        <Palette size={20} className="text-purple-400" />
                        <span>Interface Customization</span>
                    </div>

                    <div className="setting-item">
                        <div className="setting-info">
                            <h4>Dark Mode</h4>
                            <p>Use a dark color scheme for the interface (Default).</p>
                        </div>
                        <label className="toggle-switch">
                            <input type="checkbox" defaultChecked disabled />
                            <span className="toggle-slider"></span>
                        </label>
                    </div>

                    <div className="setting-item">
                        <div className="setting-info">
                            <h4>Compact View</h4>
                            <p>Reduce spacing in task lists to show more data.</p>
                        </div>
                        <label className="toggle-switch">
                            <input type="checkbox" />
                            <span className="toggle-slider"></span>
                        </label>
                    </div>
                </div>
            )}

            {activeTab === 'account' && (
                <>
                    <div className="settings-section">
                        <div className="section-title">
                            <User size={20} className="text-green-400" />
                            <span>My Profile</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
                            <div style={{
                                width: '80px', height: '80px', borderRadius: '50%',
                                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '2rem', fontWeight: 'bold'
                            }}>
                                U
                            </div>
                            <div>
                                <button className="btn" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>Change Avatar</button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <input className="input-field" defaultValue="user@example.com" disabled />
                        </div>
                    </div>

                    <div className="settings-section danger-zone">
                        <div className="section-title" style={{ color: '#fca5a5' }}>
                            <LogOut size={20} />
                            <span>Danger Zone</span>
                        </div>
                        <p style={{ color: '#fca5a5', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                            Logging out will end your current session. You will need to log in again to access your projects.
                        </p>
                        <button onClick={handleLogout} className="danger-btn">
                            Log Out
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
