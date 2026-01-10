import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Search, Send, User, MoreHorizontal, Phone, Video, Info, Paperclip, Smile, CheckCheck } from "lucide-react";
import api from "../api/axios";
import { getConversations, getMessages, sendMessage, type Message, type Conversation } from "../api/messages";
import { getAvatarUrl, getMe } from "../api/auth";

export default function MessagesPage() {
    const { chatId } = useParams();
    const navigate = useNavigate();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [targetedUser, setTargetedUser] = useState<any>(null);
    const [teamMembers, setTeamMembers] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const activeChat = conversations.find(c => c.user_id === chatId) || targetedUser;

    useEffect(() => {
        const loadData = async () => {
            try {
                // Fetch current user first
                const me = await getMe();
                setCurrentUser(me);

                // Fetch conversations
                const convs = await getConversations();
                setConversations(convs);

                // Fetch team members to allow starting new chats
                try {
                    // Try to get projects first
                    const projectsRes = await api.get('/projects');
                    const projects = projectsRes.data;
                    if (projects && projects.length > 0) {
                        const membersRes = await api.get(`/projects/${projects[0].id}/members`);
                        setTeamMembers(membersRes.data || []);
                    }
                } catch (e) {
                    console.error("Failed to load team members:", e);
                }

                if (chatId) {
                    // Fetch messages
                    try {
                        const msgs = await getMessages(chatId);
                        setMessages(msgs);
                    } catch (e) {
                        setMessages([]); // New chat, no history
                    }

                    // If not in conversations, fetch user info to show in header
                    const existing = convs.find(c => c.user_id === chatId);
                    if (!existing) {
                        try {
                            const res = await api.get(`/users/${chatId}`);
                            if (res.data) {
                                setTargetedUser({
                                    user_id: res.data.id,
                                    user_name: res.data.name,
                                    user_avatar: res.data.avatar_url,
                                    status: res.data.status || 'offline'
                                });
                            }
                        } catch (err) {
                            console.error("Failed to fetch targeted user:", err);
                        }
                    }
                }
            } catch (err) {
                console.error("Failed to load data:", err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [chatId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !chatId) return;

        try {
            const sent = await sendMessage(chatId, newMessage);
            setMessages([...messages, sent]);
            setNewMessage("");

            // If it was a new chat, refresh conversations to show it in sidebar
            if (!conversations.find(c => c.user_id === chatId)) {
                const refreshed = await getConversations();
                setConversations(refreshed);
            } else {
                // Update last message in conversations list
                setConversations(prev => prev.map(c =>
                    c.user_id === chatId
                        ? { ...c, last_message: newMessage, last_message_time: "Just now" }
                        : c
                ));
            }
        } catch (err) {
            console.error("Failed to send message:", err);
        }
    };

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
            </div>
        );
    }

    return (
        <div className="h-full flex p-4 lg:p-6 overflow-hidden animate-in fade-in duration-700">
            <div className="flex-1 flex bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-sm">

                {/* Conversations Sidebar */}
                <aside className={`w-full md:w-80 border-r border-white/5 flex flex-col ${chatId ? 'hidden md:flex' : 'flex'}`}>
                    <div className="p-4 border-b border-white/5">
                        <h2 className="text-xl font-bold text-white mb-4">Messages</h2>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                            <input
                                type="text"
                                placeholder="Search everything..."
                                className="w-full bg-black/20 border border-white/5 rounded-lg py-2 pl-10 pr-4 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/30"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {/* Active Conversations Section */}
                        {conversations.length > 0 && (
                            <div className="mt-4">
                                <h3 className="px-4 text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-2">Recent Chats</h3>
                                {conversations.map((conv) => (
                                    <button
                                        key={conv.user_id}
                                        onClick={() => navigate(`/app/v1/messages/${conv.user_id}`)}
                                        className={`w-full flex items-center gap-3 p-4 hover:bg-white/[0.03] transition-colors border-b border-zinc-900/50 ${chatId === conv.user_id ? 'bg-indigo-500/5' : ''}`}
                                    >
                                        <div className="relative shrink-0">
                                            <div className="h-10 w-10 rounded-lg bg-zinc-800 border border-white/5 flex items-center justify-center overflow-hidden">
                                                {conv.user_avatar ? (
                                                    <img src={getAvatarUrl(conv.user_avatar) || ""} alt="" className="h-full w-full object-cover" />
                                                ) : (
                                                    <User size={20} className="text-zinc-500" />
                                                )}
                                            </div>
                                            {conv.status?.toLowerCase() === 'online' && (
                                                <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-black bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                            )}
                                        </div>
                                        <div className="flex-1 text-left min-w-0">
                                            <div className="flex justify-between items-center mb-0.5">
                                                <h4 className="text-sm font-bold text-white truncate">{conv.user_name}</h4>
                                                <span className="text-[10px] text-zinc-600 whitespace-nowrap">{conv.last_message_time}</span>
                                            </div>
                                            <p className="text-xs text-zinc-500 truncate">{conv.last_message || "Start a conversation"}</p>
                                        </div>
                                        {conv.unread_count > 0 && (
                                            <div className="h-5 w-5 rounded-full bg-indigo-500 flex items-center justify-center text-[10px] font-bold text-white shadow-lg">
                                                {conv.unread_count}
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* All Team Members Section (for new chats) */}
                        <div className="mt-4 border-t border-white/5">
                            <h3 className="px-4 py-3 text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Connect with Team</h3>
                            {teamMembers
                                .filter(m => m.user_id !== currentUser?.id && !conversations.find(c => c.user_id === m.user_id))
                                .map((member) => (
                                    <button
                                        key={member.user_id}
                                        onClick={() => navigate(`/app/v1/messages/${member.user_id}`)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-white/[0.03] transition-colors ${chatId === member.user_id ? 'bg-indigo-500/5' : ''}`}
                                    >
                                        <div className="h-8 w-8 rounded-lg bg-zinc-800 border border-white/5 flex items-center justify-center overflow-hidden shrink-0">
                                            {member.user?.avatar_url ? (
                                                <img src={getAvatarUrl(member.user.avatar_url) || ""} alt="" className="h-full w-full object-cover" />
                                            ) : (
                                                <User size={16} className="text-zinc-500" />
                                            )}
                                        </div>
                                        <div className="flex-1 text-left min-w-0">
                                            <h4 className="text-xs font-bold text-white truncate">{member.user?.name || member.email}</h4>
                                            <p className="text-[10px] text-zinc-600 truncate">{member.role}</p>
                                        </div>
                                    </button>
                                ))
                            }
                        </div>
                    </div>
                </aside>

                {/* Chat Area */}
                <main className={`flex-1 flex flex-col bg-black/20 ${!chatId ? 'hidden md:flex' : 'flex'}`}>
                    {chatId && activeChat ? (
                        <>
                            {/* Chat Header */}
                            <header className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                                <div className="flex items-center gap-3">
                                    <button onClick={() => navigate('/app/v1/messages')} className="md:hidden text-zinc-500 hover:text-white mr-2">
                                        <MoreHorizontal size={20} className="rotate-90" />
                                    </button>
                                    <div className="relative">
                                        <div className="h-10 w-10 rounded-lg bg-zinc-800 border border-white/5 flex items-center justify-center overflow-hidden">
                                            {activeChat.user_avatar ? (
                                                <img src={getAvatarUrl(activeChat.user_avatar) || ""} alt="" className="h-full w-full object-cover" />
                                            ) : (
                                                <User size={20} className="text-zinc-500" />
                                            )}
                                        </div>
                                        <div className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-black ${activeChat.status.toLowerCase() === 'online' ? 'bg-emerald-500' : 'bg-zinc-500'}`} />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-white leading-tight">{activeChat.user_name}</h3>
                                        <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">{activeChat.status}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button className="p-2 text-zinc-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors"><Phone size={18} /></button>
                                    <button className="p-2 text-zinc-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors"><Video size={18} /></button>
                                    <button className="p-2 text-zinc-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors"><Info size={18} /></button>
                                </div>
                            </header>

                            {/* Message List */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
                                {messages.map((msg, idx) => {
                                    const isMe = msg.sender_id === currentUser?.id;
                                    const nextMsg = messages[idx + 1];
                                    const isLastInGroup = !nextMsg || nextMsg.sender_id !== msg.sender_id;
                                    return (
                                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-1 ${isLastInGroup ? 'mb-4' : 'mb-1'}`}>
                                            <div className={`max-w-[70%] ${isMe ? 'order-2' : ''}`}>
                                                <div className={`px-4 py-2.5 rounded-2xl text-[13px] leading-relaxed shadow-lg ${isMe ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white/10 text-zinc-200 rounded-tl-none'
                                                    }`}>
                                                    {msg.content}
                                                </div>
                                                {isLastInGroup && (
                                                    <div className={`flex items-center gap-1.5 mt-1.5 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                        <span className="text-[10px] text-zinc-600 font-medium">
                                                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                        {isMe && <CheckCheck size={12} className="text-indigo-400" />}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Message Input */}
                            <footer className="p-4 border-t border-white/5 bg-white/[0.01]">
                                <form onSubmit={handleSend} className="flex items-center gap-3">
                                    <button type="button" className="p-2 text-zinc-500 hover:text-zinc-300 transition-colors"><Paperclip size={18} /></button>
                                    <div className="flex-1 relative">
                                        <input
                                            type="text"
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            placeholder="Type a message..."
                                            className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all"
                                        />
                                        <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"><Smile size={18} /></button>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={!newMessage.trim()}
                                        className="p-2.5 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-indigo-500/20"
                                    >
                                        <Send size={18} />
                                    </button>
                                </form>
                            </footer>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                            <div className="h-16 w-16 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-6">
                                <Send size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Select a member to chat</h3>
                            <p className="text-sm text-zinc-500 max-w-xs mx-auto">Build your team communication in the neural web. Secure, encrypted and ultra-fast.</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
