import { useEffect, useState, memo } from "react";
import { Search, User as UserIcon } from "lucide-react";
import { useUser } from "../context/UserContext";
import { useProject } from "../context/ProjectContext";
import { getProjectMembers } from "../api/projectMembers";
import { getAvatarUrl } from "../api/auth";
import NotificationDropdown from "./notification/NotificationDropdown";
import GlobalSearch from "./search/GlobalSearch";

function TopBar() {
    const { user } = useUser();
    const { activeProjectId } = useProject();
    const [displayRole, setDisplayRole] = useState("MEMBER");
    const [isSearchOpen, setIsSearchOpen] = useState(false);

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
        <>
            <div className="flex items-center justify-between py-3 lg:py-4 px-4 lg:px-8 border-b border-white/5 bg-background/80 sticky top-0 z-40 backdrop-blur-md">
                {/* Search Bar */}
                <div
                    className="relative group max-w-xl w-full cursor-pointer hidden sm:block"
                    onClick={() => setIsSearchOpen(true)}
                >
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-zinc-500 group-hover:text-indigo-400 transition-colors" />
                    </div>
                    <div
                        className="block w-full pl-10 pr-4 py-2.5 bg-zinc-900/50 border border-white/10 rounded-xl text-sm text-zinc-500 transition-all hover:bg-zinc-900 hover:border-indigo-500/30 select-none"
                        title="Click to search tasks"
                    >
                        Search tasks...
                    </div>
                </div>

                {/* Mobile Search Button */}
                <button
                    onClick={() => setIsSearchOpen(true)}
                    className="sm:hidden p-2.5 bg-zinc-900/50 border border-white/10 rounded-xl text-zinc-400 hover:bg-zinc-900 transition-all"
                    aria-label="Search"
                >
                    <Search className="h-5 w-5" />
                </button>

                {/* Right Section */}
                <div className="flex items-center gap-3 lg:gap-6">
                    {/* Notification Dropdown */}
                    <NotificationDropdown />

                    {/* Profile Pill */}
                    <div className="flex items-center gap-2 lg:gap-3">
                        <div className="text-right hidden md:block">
                            <p className="text-sm font-medium text-zinc-200">{user?.name || user?.email || "User"}</p>
                            <p className="text-xs font-bold text-indigo-400 tracking-wider">{displayRole}</p>
                        </div>

                        <button className="relative h-9 w-9 lg:h-10 lg:w-10 rounded-xl overflow-hidden ring-2 ring-white/10 hover:ring-indigo-500/50 transition-all flex items-center justify-center bg-zinc-800 text-zinc-400">
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

            {/* Global Search Modal */}
            <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        </>
    );
}

// Memoize TopBar to prevent unnecessary re-renders
export default memo(TopBar);

