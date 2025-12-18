import { useNavigate } from "react-router-dom";

export default function SettingsPage() {
    const navigate = useNavigate();

    const handleLogout = () => {
        if (confirm("Are you sure you want to log out?")) {
            localStorage.removeItem("token");
            navigate("/app/v1/login");
        }
    };

    return (
        <div style={{ maxWidth: "600px" }}>
            <header style={{ marginBottom: "2rem" }}>
                <h2 style={{ marginBottom: "0.2rem" }}>Settings</h2>
                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Workspace and notification settings</p>
            </header>

            <div className="card" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                <div>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", color: "var(--text-muted)" }}>
                        Workspace Name
                    </label>
                    <input
                        className="input-field"
                        defaultValue="Flowday Engineering"
                    />
                </div>

                <div>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", color: "var(--text-muted)" }}>
                        Mark task as stale after (days)
                    </label>
                    <input
                        className="input-field"
                        type="number"
                        defaultValue={5}
                        style={{ width: "100px" }}
                    />
                </div>

                <div>
                    <h4 style={{ fontSize: "0.9rem", color: "var(--text-main)", marginBottom: "1rem" }}>Notifications</h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
                        <label style={{ display: "flex", gap: "0.8rem", alignItems: "center", cursor: "pointer" }}>
                            <input type="checkbox" defaultChecked />
                            <div>
                                <div style={{ color: "var(--text-main)", fontSize: "0.9rem" }}>Email notifications</div>
                                <div style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>Receive task updates via email</div>
                            </div>
                        </label>
                        <label style={{ display: "flex", gap: "0.8rem", alignItems: "center", cursor: "pointer" }}>
                            <input type="checkbox" />
                            <div>
                                <div style={{ color: "var(--text-main)", fontSize: "0.9rem" }}>Slack notifications</div>
                                <div style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>Send notifications to Slack workspace</div>
                            </div>
                        </label>
                    </div>
                </div>

                <div style={{ paddingTop: "1rem", borderTop: "1px solid var(--border)" }}>
                    <button className="btn">Save changes</button>
                </div>
            </div>

            {/* Account Actions */}
            <div className="card" style={{ marginTop: "2rem", padding: "1.5rem" }}>
                <h3 style={{ fontSize: "1rem", marginBottom: "1rem", color: "var(--text-main)" }}>Account</h3>
                <button
                    onClick={handleLogout}
                    style={{
                        background: "#e74c3c",
                        border: "none",
                        color: "white",
                        padding: "0.75rem 1.5rem",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontWeight: 600,
                        fontSize: "0.9rem",
                        transition: "all 0.2s"
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.background = "#c0392b";
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.background = "#e74c3c";
                    }}
                >
                    🚪 Log Out
                </button>
            </div>
        </div>
    );
}
