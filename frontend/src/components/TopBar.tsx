import { useEffect, useState } from "react";
import { Search, Bell, Command, User } from "lucide-react";

import { useUser } from "../context/UserContext";
import { useProject } from "../context/ProjectContext";
import { getProjectMembers } from "../api/projectMembers";

export default function TopBar() {
    const { user } = useUser();
    const { activeProjectId } = useProject();
    const [displayRole, setDisplayRole] = useState("MEMBER");

    useEffect(() => {
        const fetchRole = async () => {
            if (!activeProjectId || !user) return;

            try {
                const members = await getProjectMembers(activeProjectId);
                const myMember = members.find(m => m.user_id === user.id);

                if (myMember) {
                    if (myMember.role === "owner") {
                        setDisplayRole("PROJECT LEAD");
                    } else if (myMember.role === "member") {
                        setDisplayRole("MEMBER");
                    } else {
                        setDisplayRole(myMember.role.toUpperCase());
                    }
                } else {
                    setDisplayRole("MEMBER");
                }
            } catch (err) {
                console.error("Failed to fetch role", err);
                setDisplayRole("MEMBER");
            }
        };

        fetchRole();
    }, [activeProjectId, user]);

    return (
        <div className="flex items-center justify-between py-4 px-8 border-b border-white/5 bg-background sticky top-0 z-40 backdrop-blur-md bg-opacity-80">
            {/* Search Bar */}
            <div className="relative group max-w-xl w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-zinc-500 group-focus-within:text-purple-400 transition-colors" />
                </div>
                <input
                    type="text"
                    className="block w-full pl-10 pr-12 py-2.5 bg-zinc-900/50 border border-white/10 rounded-xl text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all text-zinc-200"
                    placeholder="Search anything..."
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                    <kbd className="inline-flex items-center border border-white/10 rounded px-2 text-xs font-mono font-medium text-zinc-500 bg-white/5">
                        <Command size={10} className="mr-1" /> K
                    </kbd>
                </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-6">
                {/* Notification Bell */}
                <button className="relative p-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors group">
                    <Bell className="h-5 w-5 text-zinc-400 group-hover:text-zinc-200" />
                    <span className="absolute top-2.5 right-3 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-zinc-950 animate-pulse" />
                </button>

                {/* Profile Pill */}
                <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium text-zinc-200">{user?.name || user?.email || "User"}</p>
                        <p className="text-xs font-bold text-indigo-400 tracking-wider">{displayRole}</p>
                    </div>

                    <button className="relative h-10 w-10 rounded-xl overflow-hidden ring-2 ring-white/10 hover:ring-indigo-500/50 transition-all flex items-center justify-center bg-zinc-800 text-zinc-400">
                        <User size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
}
