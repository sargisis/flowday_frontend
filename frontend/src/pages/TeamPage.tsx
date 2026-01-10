import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProject } from "../context/ProjectContext";
import { type ProjectMember, getProjectMembers, inviteMember, removeMember, updateMemberRole } from "../api/projectMembers";
import { getMe, getAvatarUrl } from "../api/auth";
import { MessageSquare, Zap, MoreVertical, Plus, User as UserIcon, Trash2, Shield, X, Check, Users } from "lucide-react";
import EmptyState from "../components/state/EmptyState";

const ROLES = [
    "Project Lead",
    "Product Manager",
    "Backend Engineer",
    "Frontend Engineer",
    "Full Stack Engineer",
    "Mobile Engineer",
    "QA Engineer",
    "DevOps Engineer",
    "Data Scientist",
    "ML Engineer",
    "UI/UX Designer",
    "Graphic Designer",
    "Technical Writer",
    "Engineering Manager",
    "Member"
];

export default function TeamPage() {
    const navigate = useNavigate();
    const { activeProjectId } = useProject();
    const [members, setMembers] = useState<ProjectMember[]>([]);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showInvite, setShowInvite] = useState(false);

    // Role Management State
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
    const [editingMember, setEditingMember] = useState<ProjectMember | null>(null);

    const loadData = async () => {
        if (!activeProjectId) return;

        try {
            const [membersData, meData] = await Promise.all([
                getProjectMembers(activeProjectId),
                getMe()
            ]);
            setMembers(membersData || []);
            setCurrentUserId(meData.id);
        } catch (err) {
            console.error("Failed to load team data", err);
            setError("Failed to load team data");
        }
    };

    useEffect(() => {
        loadData();

        // Auto-refresh every 10 seconds
        const interval = setInterval(() => {
            loadData();
        }, 10000);

        return () => clearInterval(interval);
    }, [activeProjectId]);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = () => setActiveMenuId(null);
        window.addEventListener("click", handleClickOutside);
        return () => window.removeEventListener("click", handleClickOutside);
    }, []);

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeProjectId) return;

        setLoading(true);
        setError("");

        try {
            await inviteMember(activeProjectId, email);
            setEmail("");
            alert("Invitation sent successfully!");
            setShowInvite(false);
            loadData();
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
            loadData();
        } catch (err: any) {
            alert(err.response?.data?.error || "Failed to remove member");
        }
    };

    const handleRoleUpdate = async (newRole: string) => {
        if (!activeProjectId || !editingMember) return;

        try {
            await updateMemberRole(activeProjectId, editingMember.user_id, newRole);
            setEditingMember(null);
            loadData();
        } catch (err: any) {
            alert(err.response?.data?.error || "Failed to update role");
        }
    };

    if (!activeProjectId) {
        return (
            <div className="h-full flex items-center justify-center p-8">
                <EmptyState
                    icon={Users}
                    title="Operation Hub Locked"
                    description="Select a project to authorize team access and coordinate with your squad."
                />
            </div>
        );
    }

    const projectOwner = members.find(m => m.role === "owner");
    const isCurrentUserOwner = projectOwner && projectOwner.user_id === currentUserId;

    // Calculate Team Stats
    const stats = {
        total: members.length,
        online: members.filter(m => (m.user?.status || "").toLowerCase() === 'online' || (m.user?.status || "").toLowerCase() === 'deep work').length,
        avgVelocity: members.length > 0 ? Math.round(members.reduce((acc, m) => acc + (m.user?.velocity || 0), 0) / members.length) : 0,
        pending: 0 // Placeholder as it's not clear how pending invites are stored. 
    };

    return (
        <div className="h-full flex flex-col p-4 lg:p-6 overflow-hidden animate-in fade-in duration-700">
            {/* Compact Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                        <Users size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">Team Network</h1>
                        <p className="text-xs text-zinc-500 mt-0.5">{stats.total} nodes active in neural web</p>
                    </div>
                </div>

                {isCurrentUserOwner && (
                    <button
                        onClick={() => setShowInvite(!showInvite)}
                        className="bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-white px-5 py-2.5 rounded-lg text-[10px] font-bold transition-all hover:-translate-y-0.5 flex items-center gap-2.5 uppercase tracking-wider group"
                    >
                        <Plus size={16} className="text-indigo-400" />
                        <span>Invite Member</span>
                    </button>
                )}
            </header>

            {/* Team Stats Bar */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6 shrink-0">
                <div className="p-3 rounded-lg bg-indigo-500/5 border border-indigo-500/10">
                    <div className="flex items-center gap-2 mb-1">
                        <Users size={14} className="text-indigo-400" />
                        <span className="text-[9px] text-zinc-500 uppercase font-bold">Total Members</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{stats.total}</p>
                </div>

                <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        <span className="text-[9px] text-zinc-500 uppercase font-bold">Online Now</span>
                    </div>
                    <p className="text-2xl font-bold text-emerald-400">{stats.online}</p>
                </div>

                <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
                    <div className="flex items-center gap-2 mb-1">
                        <Zap size={14} className="text-amber-400" />
                        <span className="text-[9px] text-zinc-500 uppercase font-bold">Avg Velocity</span>
                    </div>
                    <p className="text-2xl font-bold text-amber-400">{stats.avgVelocity}%</p>
                </div>

                <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/10">
                    <div className="flex items-center gap-2 mb-1">
                        <MessageSquare size={14} className="text-blue-400" />
                        <span className="text-[9px] text-zinc-500 uppercase font-bold">Operations</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-400">Stable</p>
                </div>
            </div>

            {/* Invite Form */}
            {showInvite && (
                <div className="mb-6 bg-white/[0.02] border border-white/10 rounded-xl p-4 animate-in fade-in slide-in-from-top-2 shrink-0">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Invite Squad Member</h3>
                        <button onClick={() => setShowInvite(false)} className="text-zinc-500 hover:text-white transition-colors">
                            <X size={16} />
                        </button>
                    </div>
                    <form onSubmit={handleInvite} className="flex gap-3">
                        <input
                            type="email"
                            className="flex-1 bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 transition-all"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="colleague@example.com"
                            required
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all disabled:opacity-50"
                        >
                            {loading ? "Sending..." : "Invite"}
                        </button>
                    </form>
                    {error && <p className="text-rose-400 mt-2 text-[10px] font-bold uppercase tracking-wider">{error}</p>}
                </div>
            )}

            {/* Members Grid Container */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 pb-6">
                    {members.length === 0 ? (
                        <div className="col-span-full py-20">
                            <EmptyState
                                icon={Users}
                                title="No members found"
                                description="Start building your elite squadron by inviting your first member."
                            />
                        </div>
                    ) : (
                        members.map((m) => {
                            const isOwner = m.role === "owner";
                            const status = m.user?.status || "Online";
                            const velocity = m.user?.velocity || 0;

                            const getStatusColor = (s: string) => {
                                switch (s.toLowerCase()) {
                                    case 'deep work': return 'bg-indigo-500';
                                    case 'online': return 'bg-emerald-500';
                                    case 'away': return 'bg-zinc-500';
                                    case 'in meeting': return 'bg-amber-500';
                                    default: return 'bg-emerald-500';
                                }
                            };

                            const getStatusTextStyles = (s: string) => {
                                switch (s.toLowerCase()) {
                                    case 'deep work': return 'text-indigo-400';
                                    case 'online': return 'text-emerald-400';
                                    case 'away': return 'text-zinc-500';
                                    case 'in meeting': return 'text-amber-400';
                                    default: return 'text-emerald-400';
                                }
                            };

                            const statusBg = getStatusColor(status);
                            const statusText = getStatusTextStyles(status);

                            return (
                                <div key={m.id} className="group relative bg-white/[0.02] border border-white/5 rounded-2xl p-4 hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300">
                                    {/* Top Section: Avatar & Role */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="relative">
                                            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/5 flex items-center justify-center text-zinc-500 shadow-xl group-hover:border-indigo-500/30 transition-all overflow-hidden">
                                                {m.user?.avatar_url ? (
                                                    <img
                                                        src={getAvatarUrl(m.user.avatar_url) || ""}
                                                        alt={m.user?.name || "Member"}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <UserIcon size={24} />
                                                )}
                                            </div>
                                            <div className={`absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-black ${statusBg} shadow-[0_0_8px_rgba(0,0,0,0.5)]`} />
                                        </div>

                                        {isCurrentUserOwner && !isOwner && (
                                            <div className="relative">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setActiveMenuId(activeMenuId === m.id ? null : m.id);
                                                    }}
                                                    className="p-1.5 hover:bg-white/10 rounded-lg text-zinc-500 hover:text-white transition-colors"
                                                >
                                                    <MoreVertical size={16} />
                                                </button>

                                                {/* Dropdown Menu */}
                                                {activeMenuId === m.id && (
                                                    <div className="absolute right-0 mt-2 w-44 bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl z-20 overflow-hidden animate-in fade-in zoom-in-95 origin-top-right">
                                                        <button
                                                            onClick={() => {
                                                                setEditingMember(m);
                                                                setActiveMenuId(null);
                                                            }}
                                                            className="w-full text-left px-4 py-2.5 hover:bg-white/5 text-zinc-300 hover:text-white flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-colors"
                                                        >
                                                            <Shield size={14} /> Role
                                                        </button>
                                                        <button
                                                            onClick={() => handleRemove(m.user_id, m.user?.email || "")}
                                                            className="w-full text-left px-4 py-2.5 hover:bg-rose-500/10 text-rose-400 hover:text-rose-500 flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-colors"
                                                        >
                                                            <Trash2 size={14} /> Remove
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Name & Role */}
                                    <div className="mb-4">
                                        <h3 className="text-base font-bold text-white mb-0.5 truncate">
                                            {m.user?.name || m.user?.email?.split('@')[0] || "Unknown User"}
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            <p className="text-[9px] font-black tracking-widest text-zinc-500 uppercase">
                                                {m.role === "owner" ? "PROJECT LEAD" : m.role}
                                            </p>
                                            {isOwner && <Shield size={10} className="text-indigo-400" />}
                                        </div>
                                    </div>

                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-2 gap-2 mb-4">
                                        <div className="bg-black/30 rounded-lg p-2 border border-white/5">
                                            <p className="text-[8px] uppercase tracking-wider text-zinc-600 font-black mb-0.5">STATUS</p>
                                            <p className={`text-[10px] font-bold truncate ${statusText}`}>{status}</p>
                                        </div>
                                        <div className="bg-black/30 rounded-lg p-2 border border-white/5">
                                            <p className="text-[8px] uppercase tracking-wider text-zinc-600 font-black mb-0.5">VELOCITY</p>
                                            <div className="flex items-center gap-1">
                                                <Zap size={10} className="text-amber-400" />
                                                <p className="text-[10px] font-bold text-zinc-300">{velocity}%</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Message Button */}
                                    <button
                                        onClick={() => navigate(`/app/v1/messages/${m.user_id}`)}
                                        className="w-full py-2 rounded-lg border border-white/5 bg-white/[0.01] hover:bg-white/[0.05] text-zinc-400 hover:text-white transition-all flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest group-hover:border-white/10"
                                    >
                                        <MessageSquare size={14} />
                                        <span>Message</span>
                                    </button>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Role Selection Modal */}
            {editingMember && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in">
                    <div className="bg-[#0c0c0c] border border-white/10 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95">
                        <div className="px-5 py-3 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                            <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Change Designation</h3>
                            <button
                                onClick={() => setEditingMember(null)}
                                className="text-zinc-500 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>
                        <div className="p-2 max-h-[50vh] overflow-y-auto custom-scrollbar">
                            <div className="space-y-1">
                                {ROLES.map(role => (
                                    <button
                                        key={role}
                                        onClick={() => handleRoleUpdate(role)}
                                        className={`w-full text-left px-4 py-2.5 rounded-lg flex items-center justify-between transition-all ${editingMember.role === role
                                            ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                                            : "text-zinc-400 hover:bg-white/5 hover:text-white border border-transparent"
                                            }`}
                                    >
                                        <span className="text-[11px] font-bold uppercase tracking-wider">{role}</span>
                                        {editingMember.role === role && <Check size={14} />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
