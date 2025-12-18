import { useEffect, useState } from "react";
import { type ProjectMember, getMyInvitations, acceptInvitation, rejectInvitation } from "../api/projectMembers";
import { useNavigate } from "react-router-dom";
import { useProject } from "../context/ProjectContext";

export default function InvitationsPage() {
    const [invitations, setInvitations] = useState<ProjectMember[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { setActiveProjectId } = useProject();

    const loadInvitations = async () => {
        setLoading(true);
        try {
            const data = await getMyInvitations();
            setInvitations(data || []);
        } catch (error) {
            console.error("Failed to load invitations", error);
            setInvitations([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadInvitations();
    }, []);

    const handleAccept = async (projectId: string, projectName: string) => {
        try {
            await acceptInvitation(projectId);
            alert(`You are now a member of "${projectName}"!`);
            setActiveProjectId(projectId); // Set as active project
            navigate("/app/v1/team"); // Go to team page to see yourself as member
        } catch (err: any) {
            alert(err.response?.data?.error || "Failed to accept invitation");
        }
    };

    const handleReject = async (projectId: string, projectName: string) => {
        if (!window.confirm(`Are you sure you want to reject the invitation to join "${projectName}"?`)) return;

        try {
            await rejectInvitation(projectId);
            alert(`Invitation to join "${projectName}" rejected.`);
            loadInvitations(); // Refresh list
        } catch (err: any) {
            alert(err.response?.data?.error || "Failed to reject invitation");
        }
    };

    return (
        <>
            <header style={{ marginBottom: "2rem" }}>
                <h2 style={{ marginBottom: "0.2rem" }}>Project Invitations</h2>
                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                    {invitations?.length || 0} pending invitation{(invitations?.length || 0) !== 1 ? 's' : ''}
                </p>
            </header>

            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                {loading ? (
                    <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
                        Loading invitations...
                    </div>
                ) : (!invitations || invitations.length === 0) ? (
                    <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
                        <p>No pending invitations</p>
                        <p style={{ fontSize: "0.9rem", marginTop: "0.5rem" }}>When someone invites you to a project, it will appear here.</p>
                    </div>
                ) : (
                    invitations.map(inv => (
                        <div
                            key={inv.id}
                            style={{
                                padding: "1.5rem",
                                borderBottom: "1px solid var(--border)",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center"
                            }}
                        >
                            <div>
                                <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.1rem" }}>
                                    Join "{inv.project?.name || "Unknown Project"}"
                                </h3>
                                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: "0 0 0.3rem 0" }}>
                                    You've been invited to collaborate as a <strong>Member</strong>
                                </p>
                                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: 0 }}>
                                    Invited {new Date(inv.invited_at).toLocaleDateString()}
                                </p>
                            </div>
                            <div style={{ display: "flex", gap: "0.75rem" }}>
                                <button
                                    onClick={() => handleReject(inv.project_id, inv.project?.name || "this project")}
                                    style={{
                                        background: "transparent",
                                        border: "1px solid #e74c3c",
                                        color: "#e74c3c",
                                        padding: "0.75rem 1.5rem",
                                        borderRadius: "8px",
                                        cursor: "pointer",
                                        fontWeight: 600,
                                        transition: "all 0.2s"
                                    }}
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.background = "rgba(231, 76, 60, 0.1)";
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.background = "transparent";
                                    }}
                                >
                                    ✕ Reject
                                </button>
                                <button
                                    onClick={() => handleAccept(inv.project_id, inv.project?.name || "this project")}
                                    style={{
                                        background: "#27ae60",
                                        border: "none",
                                        color: "white",
                                        padding: "0.75rem 1.5rem",
                                        borderRadius: "8px",
                                        cursor: "pointer",
                                        fontWeight: 600,
                                        transition: "all 0.2s"
                                    }}
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.background = "#229954";
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.background = "#27ae60";
                                    }}
                                >
                                    ✓ Accept
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </>
    );
}
