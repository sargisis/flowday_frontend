import { useEffect, useState } from "react";
import { useProject } from "../context/ProjectContext";
import { type ProjectMember, getProjectMembers, inviteMember, removeMember, updateMemberRole } from "../api/projectMembers";
import { getMe } from "../api/auth";
import { MessageSquare, Zap, MoreVertical, Plus, User as UserIcon, Trash2, Shield, X, Check } from "lucide-react";

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
            <div className="flex items-center justify-center h-full text-zinc-500">
                Select a project to manage team
            </div>
        );
    }

    const projectOwner = members.find(m => m.role === "owner");
    const isCurrentUserOwner = projectOwner && projectOwner.user_id === currentUserId;

    return (
        <div className="space-y-8 relative">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
                        <p className="text-xs font-medium text-emerald-500 tracking-wider">SYSTEM ONLINE</p>
                    </div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                        Team Hub
                    </h1>
                    <p className="text-zinc-400 mt-2">
                        Coordinate with {members.length} active contributors.
                    </p>
                </div>

                {isCurrentUserOwner && (
                    <button
                        onClick={() => setShowInvite(!showInvite)}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2"
                    >
                        <Plus size={18} />
                        Invite Member
                    </button>
                )}
            </div>

            {/* Invite Form */}
            {showInvite && (
                <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6 backdrop-blur-sm animate-in fade-in slide-in-from-top-4">
                    <h3 className="text-lg font-semibold text-white mb-4">Invite New Member</h3>
                    <form onSubmit={handleInvite} className="flex gap-4">
                        <input
                            type="email"
                            className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="colleague@example.com"
                            required
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-medium transition-all disabled:opacity-50"
                        >
                            {loading ? "Sending..." : "Send Invite"}
                        </button>
                    </form>
                    {error && <p className="text-rose-400 mt-2 text-sm">{error}</p>}
                </div>
            )}

            {/* Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {members.map((m, index) => {
                    const isOwner = m.role === "owner";
                    const status = index % 3 === 0 ? "Deep Work" : index % 3 === 1 ? "Online" : "In Meeting";
                    const statusColor = index % 3 === 0 ? "text-indigo-400" : index % 3 === 1 ? "text-emerald-400" : "text-amber-400";
                    const velocity = 85 + (index * 3) % 15;

                    return (
                        <div key={m.id} className="group relative bg-zinc-900/40 border border-white/5 rounded-3xl p-6 hover:bg-zinc-900/60 hover:border-white/10 transition-all duration-300">

                            {/* Actions Menu (Three Dots) - Only for Owner and not for self */}
                            {isCurrentUserOwner && !isOwner && (
                                <div className="absolute top-4 right-4 z-10">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveMenuId(activeMenuId === m.id ? null : m.id);
                                        }}
                                        className="p-2 hover:bg-white/10 rounded-lg text-zinc-500 hover:text-white transition-colors"
                                    >
                                        <MoreVertical size={20} />
                                    </button>

                                    {/* Dropdown Menu */}
                                    {activeMenuId === m.id && (
                                        <div className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-white/10 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 origin-top-right">
                                            <button
                                                onClick={() => {
                                                    setEditingMember(m);
                                                    setActiveMenuId(null);
                                                }}
                                                className="w-full text-left px-4 py-3 hover:bg-white/5 text-zinc-300 hover:text-white flex items-center gap-2"
                                            >
                                                <Shield size={16} /> Change Role
                                            </button>
                                            <button
                                                onClick={() => handleRemove(m.user_id, m.user?.email || "")}
                                                className="w-full text-left px-4 py-3 hover:bg-rose-500/10 text-rose-400 hover:text-rose-500 flex items-center gap-2"
                                            >
                                                <Trash2 size={16} /> Remove User
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Header: Avatar + Info */}
                            <div className="flex items-start justify-between mb-8">
                                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/5 flex items-center justify-center text-zinc-500 overflow-hidden shadow-inner">
                                    <UserIcon size={32} />
                                </div>
                            </div>

                            {/* Name & Role */}
                            <div className="mb-6">
                                <h3 className="text-xl font-bold text-white mb-1">
                                    {m.user?.name || m.user?.email?.split('@')[0] || "Unknown User"}
                                </h3>
                                <p className="text-xs font-bold tracking-widest text-zinc-500 uppercase">
                                    {m.role === "owner" ? "PROJECT LEAD" : m.role}
                                </p>
                            </div>

                            {/* Status & Velocity Grid */}
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-black/20 rounded-xl p-3 border border-white/5">
                                    <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold mb-1">STATUS</p>
                                    <div className="flex items-center gap-2">
                                        <span className={`h-1.5 w-1.5 rounded-full ${statusColor} bg-current`}></span>
                                        <span className="text-sm font-medium text-zinc-200">{status}</span>
                                    </div>
                                </div>
                                <div className="bg-black/20 rounded-xl p-3 border border-white/5">
                                    <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold mb-1">VELOCITY</p>
                                    <div className="flex items-center gap-1.5">
                                        <Zap size={14} className="text-amber-400 fill-amber-400/20" />
                                        <span className="text-sm font-medium text-zinc-200">{velocity}%</span>
                                    </div>
                                </div>
                            </div>

                            {/* Message Button */}
                            <button className="w-full py-3 rounded-xl border border-white/10 hover:bg-white/5 text-zinc-400 hover:text-white transition-colors flex items-center justify-center gap-2 text-sm font-medium group-hover:border-white/20">
                                <MessageSquare size={16} />
                                <span>Message</span>
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Role Selection Modal */}
            {editingMember && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 scale-100">
                        <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-white">Change Role</h3>
                            <button
                                onClick={() => setEditingMember(null)}
                                className="text-zinc-500 hover:text-white p-1 rounded-lg hover:bg-white/10"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-2 max-h-[60vh] overflow-y-auto custom-scrollbar">
                            <p className="px-4 py-2 text-sm text-zinc-500">
                                Assign a new role to <span className="text-white font-bold">{editingMember.user?.name || editingMember.user?.email}</span>
                            </p>
                            <div className="space-y-1 mt-2">
                                {ROLES.map(role => (
                                    <button
                                        key={role}
                                        onClick={() => handleRoleUpdate(role)}
                                        className={`w-full text-left px-4 py-3 rounded-xl flex items-center justify-between transition-colors ${editingMember.role === role
                                                ? "bg-indigo-600/20 text-indigo-400"
                                                : "text-zinc-300 hover:bg-white/5 hover:text-white"
                                            }`}
                                    >
                                        <span className="font-medium">{role}</span>
                                        {editingMember.role === role && <Check size={16} />}
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
