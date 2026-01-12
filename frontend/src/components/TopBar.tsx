import { useEffect, useState } from "react";
import { Search, Command, User as UserIcon } from "lucide-react";
import { useUser } from "../context/UserContext";
import { useProject } from "../context/ProjectContext";
import { getProjectMembers } from "../api/projectMembers";
import { getAvatarUrl } from "../api/auth";
import NotificationDropdown from "./notification/NotificationDropdown";

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
            <div
                className="relative group max-w-xl w-full cursor-pointer"
                onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
            >
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-zinc-500 group-focus-within:text-purple-400 transition-colors" />
                </div>
                <div
                    className="block w-full pl-10 pr-12 py-2.5 bg-zinc-900/50 border border-white/10 rounded-xl text-sm text-zinc-500 transition-all hover:bg-zinc-900 select-none"
                    title="Search tasks or navigate (Cmd+K)"
                >
                    Search anything...
                </div>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                    <kbd className="inline-flex items-center border border-white/10 rounded px-2 text-xs font-mono font-medium text-zinc-500 bg-white/5">
                        <Command size={10} className="mr-1" /> K
                    </kbd>
                </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-6">
                {/* Notification Dropdown */}
                <NotificationDropdown />

                {/* Profile Pill */}
                <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium text-zinc-200">{user?.name || user?.email || "User"}</p>
                        <p className="text-xs font-bold text-indigo-400 tracking-wider">{displayRole}</p>
                    </div>

                    <button className="relative h-10 w-10 rounded-xl overflow-hidden ring-2 ring-white/10 hover:ring-indigo-500/50 transition-all flex items-center justify-center bg-zinc-800 text-zinc-400">
                        {user?.avatar_url ? (
                            <img
                                src={getAvatarUrl(user.avatar_url) || ""}
                                alt="Avatar"
                                className="h-full w-full object-cover"
                                loading="lazy"
                                decoding="async"
                            />
                        ) : (
                            <UserIcon size={20} />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
