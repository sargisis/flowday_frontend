import { useEffect, useState } from "react";
import { useProject } from "../context/ProjectContext";
import { type ProjectMember, getProjectMembers, inviteMember, removeMember } from "../api/projectMembers";
import { getMe } from "../api/auth";

export default function TeamPage() {
    const { activeProjectId } = useProject();
    const [members, setMembers] = useState<ProjectMember[]>([]);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const loadData = async () => {
        if (!activeProjectId) return;

        try {
            const [membersData, meData] = await Promise.all([
                getProjectMembers(activeProjectId),
                getMe()
            ]);
            setMembers(membersData || []);
            setCurrentUserId(meData.user_id);
        } catch (err) {
            console.error("Failed to load team data", err);
            setError("Failed to load team data");
        }
    };

    useEffect(() => {
        loadData();
    }, [activeProjectId]);

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeProjectId) return;

        setLoading(true);
        setError("");

        try {
            await inviteMember(activeProjectId, email);
            setEmail("");
            alert("Invitation sent successfully!");
            loadData(); // Reload to show pending invitation
        } catch (err: any) {
            setError(err.response?.data?.error || "Failed to send invitation");
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (userId: string, userEmail: string) => {
        if (!activeProjectId) return;
        if (!window.confirm(`Are you sure you want to remove ${userEmail} from the project?`)) return;

        try {
            await removeMember(activeProjectId, userId);
            alert("Member removed successfully");
            loadData(); // Refresh list
        } catch (err: any) {
            alert(err.response?.data?.error || "Failed to remove member");
        }
    };

    if (!activeProjectId) {
        return (
            <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
                <p style={{ color: "var(--text-muted)" }}>Select a project to manage team</p>
            </div>
        );
    }

    const projectOwner = members.find(m => m.role === "owner");
    const isCurrentUserOwner = projectOwner && projectOwner.user_id === currentUserId;

    return (
        <>
            <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <div>
                    <h2 style={{ marginBottom: "0.2rem" }}>Team</h2>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>{members?.length || 0} member{(members?.length || 0) !== 1 ? 's' : ''}</p>
                </div>
            </header>

            {/* Invite Form - Only for owner */}
            {isCurrentUserOwner && (
                <div className="card" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
                    <h3 style={{ margin: "0 0 1rem 0", fontSize: "1rem" }}>Invite colleague by email...</h3>

                    {error && (
                        <div style={{
                            background: "rgba(231, 76, 60, 0.1)",
                            color: "#e74c3c",
                            padding: "0.75rem",
                            borderRadius: "8px",
                            marginBottom: "1rem",
                            fontSize: "0.9rem"
                        }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleInvite} style={{ display: "flex", gap: "1rem" }}>
                        <input
                            type="email"
                            className="input-field"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="colleague@example.com"
                            required
                            style={{ flex: 1 }}
                        />
                        <button
                            type="submit"
                            className="btn"
                            disabled={loading}
                            style={{
                                background: "#3498db",
                                border: "none",
                                color: "white",
                                padding: "0.75rem 1.5rem",
                                borderRadius: "8px",
                                cursor: loading ? "not-allowed" : "pointer",
                                opacity: loading ? 0.6 : 1
                            }}
                        >
                            {loading ? "Sending..." : "Send Invite"}
                        </button>
                    </form>
                </div>
            )}

            {/* Members Table */}
            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                <div style={{ padding: "var(--space-md)", borderBottom: "1px solid var(--border)" }}>
                    <h3 style={{ margin: 0, fontSize: "1rem" }}>Members</h3>
                </div>

                <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
                        <thead>
                            <tr style={{ borderBottom: "1px solid var(--border)", color: "var(--text-muted)", textAlign: "left" }}>
                                <th style={{ padding: "1rem", fontWeight: 500 }}>Email</th>
                                <th style={{ padding: "1rem", fontWeight: 500 }}>Role</th>
                                <th style={{ padding: "1rem", fontWeight: 500 }}>Joined</th>
                                {isCurrentUserOwner && <th style={{ padding: "1rem", fontWeight: 500, textAlign: "right" }}>Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {members && members.length > 0 ? members.map(m => (
                                <tr key={m.id} style={{ borderBottom: "1px solid var(--border)" }}>
                                    <td style={{ padding: "1rem", color: "var(--text-main)" }}>{m.user?.email || "Unknown"}</td>
                                    <td style={{ padding: "1rem", color: "var(--text-muted)" }}>
                                        <span style={{
                                            padding: "0.25rem 0.75rem",
                                            background: m.role === "owner" ? "rgba(231, 76, 60, 0.1)" : "rgba(52, 152, 219, 0.1)",
                                            color: m.role === "owner" ? "#e74c3c" : "#3498db",
                                            borderRadius: "12px",
                                            fontSize: "0.85rem",
                                            fontWeight: 500
                                        }}>
                                            {m.role}
                                        </span>
                                    </td>
                                    <td style={{ padding: "1rem", color: "var(--text-muted)" }}>
                                        {m.accepted_at ? new Date(m.accepted_at).toLocaleDateString() : "Pending"}
                                    </td>
                                    {isCurrentUserOwner && (
                                        <td style={{ padding: "1rem", textAlign: "right" }}>
                                            {m.role !== "owner" && (
                                                <button
                                                    onClick={() => handleRemove(m.user_id, m.user?.email || "this user")}
                                                    style={{
                                                        background: "none",
                                                        border: "none",
                                                        color: "#e74c3c",
                                                        cursor: "pointer",
                                                        fontSize: "0.85rem",
                                                        fontWeight: 500
                                                    }}
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            )) : null}
                            {(!members || members.length === 0) && (
                                <tr>
                                    <td colSpan={isCurrentUserOwner ? 4 : 3} style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)" }}>
                                        No members yet. Invite someone to get started!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}
