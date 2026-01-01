import { useEffect, useState } from "react";
import { type ProjectMember, getMyInvitations, acceptInvitation, rejectInvitation } from "../api/projectMembers";
import { useNavigate } from "react-router-dom";
import { useProject } from "../context/ProjectContext";
import { Check, X, Inbox } from "lucide-react";
import EmptyState from "../components/EmptyState";

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

    const handleAccept = async (projectId: string, _p0: string) => {
        try {
            await acceptInvitation(projectId);
            setActiveProjectId(projectId);
            navigate("/app/v1/team");
        } catch (err: any) {
            alert(err.response?.data?.error || "Failed to accept invitation");
        }
    };

    const handleReject = async (projectId: string, projectName: string) => {
        if (!window.confirm(`Are you sure you want to reject the invitation to join "${projectName}"?`)) return;

        try {
            await rejectInvitation(projectId);
            loadInvitations();
        } catch (err: any) {
            alert(err.response?.data?.error || "Failed to reject invitation");
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-8">
            <header className="mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">Project Invitations</h2>
                <p className="text-zinc-400">
                    {invitations?.length || 0} pending invitation{(invitations?.length || 0) !== 1 ? 's' : ''}
                </p>
            </header>

            <div className="space-y-4">
                {loading ? (
                    <div className="text-center py-12 text-zinc-500">
                        Loading invitations...
                    </div>
                ) : (!invitations || invitations.length === 0) ? (
                    <div className="py-12">
                        <EmptyState
                            icon={Inbox}
                            title="Comms Frequency Quiet"
                            description="No incoming project invitations detected. Your transmission logs are currently empty."
                        />
                    </div>
                ) : (
                    invitations.map(inv => (
                        <div
                            key={inv.id}
                            className="bg-black/40 border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 hover:bg-black/60 transition-colors group"
                        >
                            <div className="flex items-center gap-5">
                                {/* Avatar Placeholder */}
                                <div className="h-14 w-14 rounded-xl bg-zinc-800 flex items-center justify-center text-lg font-bold text-indigo-400 border border-white/5 shadow-inner shrink-0">
                                    {(inv.project?.name?.[0] || "P").toUpperCase()}
                                </div>

                                <div>
                                    <h3 className="text-lg text-zinc-200">
                                        <span className="font-bold text-white">Project Admin</span> invited you to <span className="font-bold text-indigo-400">{inv.project?.name || "Unknown Project"}</span>
                                    </h3>
                                    <div className="flex items-center gap-2 mt-1 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                                        <span>Role: Member</span>
                                        <span>•</span>
                                        <span>{new Date(inv.invited_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 self-end sm:self-auto">
                                <button
                                    onClick={() => handleReject(inv.project_id, inv.project?.name || "")}
                                    className="h-11 w-11 flex items-center justify-center rounded-xl border border-white/10 text-zinc-400 hover:text-white hover:bg-white/5 hover:border-white/20 transition-all"
                                    title="Reject"
                                >
                                    <X size={20} />
                                </button>
                                <button
                                    onClick={() => handleAccept(inv.project_id, inv.project?.name || "")}
                                    className="h-11 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/20"
                                >
                                    <Check size={18} />
                                    <span>Accept</span>
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
