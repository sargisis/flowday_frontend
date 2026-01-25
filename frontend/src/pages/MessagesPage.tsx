import { useState, useEffect, useRef, type JSX } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Search, Send, User, MoreHorizontal, Phone, Video, Info, Paperclip, Smile, CheckCheck, Check, X, FileText } from "lucide-react";
import api from "../api/axios";
import { getConversations, getMessages, sendMessage, uploadAttachment, type Message, type Conversation } from "../api/messages";
import { getAvatarUrl, getMe, getFileUrl } from "../api/auth";
import { toast } from "sonner";
import { MessagesSkeleton } from "../components/MessagesSkeleton";
import { RichMessageInput } from "./RichMessageInput";
import { useWebSocketContext } from "../context/WebSocketContext";

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
    const [uploading, setUploading] = useState(false);
    const [attachment, setAttachment] = useState<{ url: string; type: string } | null>(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [activeEmojiCategory, setActiveEmojiCategory] = useState("smileys");

    const ANIMATED_EMOJI_MAP: Record<string, string> = {
        "😂": "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Face%20with%20Tears%20of%20Joy.png",
        "😍": "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Smiling%20Face%20with%20Heart-Eyes.png",
        "🔥": "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Telegram-Animated-Emojis/main/Animals%20and%20Nature/Fire.webp",
        "🚀": "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Telegram-Animated-Emojis/main/Travel%20and%20Places/Rocket.webp",
        "🤩": "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Star-Struck.png",
        "🥳": "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Partying%20Face.png",
        "🤯": "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Exploding%20Head.png",
        "💀": "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Skull.png",
        "💯": "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Hundred%20Points.png",
        "😁": "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Beaming%20Face%20with%20Smiling%20Eyes.png",
        "✨": "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Activities/Sparkles.png",
        "👏": "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Telegram-Animated-Emojis/main/People/Clapping%20Hands.webp",
        "🙌": "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Telegram-Animated-Emojis/main/People/Raising%20Hands.webp",
        "👍": "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Telegram-Animated-Emojis/main/People/Thumbs%20Up.webp",
    };

    const emojiCategories: Record<string, { icon: string, emojis: string[] }> = {
        premium: {
            icon: "✨",
            emojis: Object.keys(ANIMATED_EMOJI_MAP)
        },
        smileys: {
            icon: "😀",
            emojis: ["😀", "😃", "😁", "😆", "😅", "😂", "🤣", "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰", "😋", "😛", "😜", "🤪", "🤨", "🧐", "😎", "😏", "😒", "😞", "😔", "😟", "😕", "🙁", "😣", "😖", "😫", "😩", "🥺", "😢", "😭", "😤", "😠", "😡", "🤯", "😳", "🥵", "🥶", "😱", "😨", "😰", "😥", "😓", "🤗", "🤔", "🤭", "🤫", "🤥", "😶", "😐", "😑", "🙄", "😯", "😴", "🤤", "😪", "😵", "🤐", "🥴", "🤢", "🤮", "🤧", "😷", "🤒", "🤕", "🤑", "🤠", "😈", "👿", "👹", "👺", "🤡", "💩", "👻", "💀", "👽", "👾", "🤖"]
        },
        people: {
            icon: "👋",
            emojis: ["🤚", "✋", "🤏", "✌️", "🤞", "🤟", "🤘", "🤙", "👈", "👉", "👆", "🖕", "👇", "☝️", "👍", "✊", "👊", "🤛", "🤜", "👏", "🙌", "👐", "🤲", "🤝", "🙏", "✍️", "💅", "🤳", "💪", "🦾", "🦵", "🦿", "🦶", "👂", "🦻", "👃", "🧠", "🦷", "🦴", "👀", "👁", "👅", "👄", "💋", "🩸"]
        },
        nature: {
            icon: "🐶",
            emojis: ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐮", "🐷", "🐽", "🐸", "🐵", "🐔", "🐧", "🐦", "🐤", "🐣", "🐥", "🦆", "🦅", "🦉", "🦇", "🐺", "🐗", "🐴", "🦄", "🐝", "🐛", "🦋", "🐌", "🐞", "🐜", "🦟", "🦗", "🕷", "🕸", "🦂", "🐢", "🐍", "🦎", "🦖", "🦕", "🐙", "🦑", "🦐", "🦞", "🦀", "🐡", "🐠", "🐟", "🐬", "🐳", "🐋", "🦈", "🐊", "🐅", "🐆", "🦓", "🦍", "🦧", "🐘", "🦛", "🦏", "🐪", "🐫", "🦒", "🦘", "🐃", "🐂", "🐄", "🐎", "🐖", "🐏", "🐑", "🦙", "🐐", "🦌", "🐕", "🐩", "🐈", "🐓", "🦃", "🦚", "🦜", "🦢", "🦩", "🕊", "🐇", "🦝", "🦨", "🦡", "🦦", "🦥", "🐁", "🦔", "🐾", "🐉", "🐲", "🌵", "🎄", "🌲", "🌳", "🌴", "🌱", "🌿", "☘️", "🍀", "🎍", "🎋", "🍃", "🍂", "🍁", "🍄", "🌾", "💐", "🌷", "🌹", "🥀", "🌺", "🌸", "🌼", "🌻", "🌞", "🌝", "🌛", "🌛", "🌚", "🌕", "🌖", "🌗", "🌘", "🌑", "🌒", "🌓", "🌔", "🌙", "🌎", "🌍", "🌏", "🪐", "💫", "⭐️", "🌟", "✨", "⚡️", "☄️", "💥", "🔥", "🌪", "🌈", "☀️", "🌤", "⛅️", "🌥", "☁️", "🌦", "🌧", "⛈", "🌩", "🌨", "❄️", "☃️", "⛄️", "🌬", "💨", "💧", "💦", "☔️", "☂️", "🌊"]
        },
        food: {
            icon: "🍎",
            emojis: ["🍏", "🍎", "🍐", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🍈", "🍒", "🍑", "🥭", "🍍", "🥥", "🥝", "🍅", "🍆", "🥦", "🥬", "🥒", "🌶", "🌽", "🥕, 🧄", "🧅", "🥔", "🍠", "🥐", "🥯", "🍞", "🥖", "🥨", "🧀", "🥚", "🍳", "🥞", "🧇", "🥓", "🥩", "🍗", "🍖", "🌭", "🍔", "🍟", "🍕", "🥪", "🥙", "🧆", "🌮", "🌯", "🥗", "🥘", "🥫", "🍝", "🍜", "🍲", "🍱", "🥟", "🦪", "🍤", "🍙", "🍚", "🎂", "🍰", "🧁", "🥧", "🍫", "🍬", "🍭", "🍮", "🍯", "🍼", "🥛", "☕️", "🍵", "🍶", "🍾", "🍷", "🍸", "🍹", "🍻", "🥂", "🥃", "🥤, 🧃", "🧉", "🧊"]
        },
        activities: {
            icon: "⚽️",
            emojis: ["⚽️", "🏀", "", "⚾️", "🥎", "", "🏐", "🏉", "🎱", "🏓", "🏸", "🥅", "🏒", "🏑", "🏏", "⛳️", "🏹", "🤿", "🥋", "🛷", "🎯", "🪀", "🎮", "🕹", "🎰", "🧩", "🧸", "♠️", "♥️", "♣️", "♦️", "🃏", "🀄️", "🎴", "🎭", "🖼", "🎨", "🧵", "🧶", "🎤", "🎧", "🎼", "🎹", "🥁", "🎷", "🎺", "🎸", "🪕"]
        }
    };


    const renderMessageContent = (content: string) => {
        if (!content) return null;

        let elements: (string | JSX.Element)[] = [content];

        // Iterate through maps to replace characters with images
        Object.entries(ANIMATED_EMOJI_MAP).forEach(([emoji, url]) => {
            const newElements: (string | JSX.Element)[] = [];
            elements.forEach(el => {
                if (typeof el === 'string') {
                    // Split string by the emoji character
                    const split = el.split(emoji);
                    split.forEach((part, i) => {
                        if (part) newElements.push(part);
                        if (i < split.length - 1) {
                            newElements.push(
                                <img
                                    key={`${emoji}-${i}-${Math.random()}`} // Random key to ensure uniqueness re-renders
                                    src={url}
                                    alt={emoji}
                                    className="inline-block h-10 w-10 mx-0.5 align-middle animate-in zoom-in duration-300"
                                />
                            );
                        }
                    });
                } else {
                    newElements.push(el);
                }
            });
            elements = newElements;
        });

        return elements;
    };

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const emojiPickerRef = useRef<HTMLDivElement>(null);

    // ✅ REAL-TIME: WebSocket connection for real-time messages
    // Use global WebSocket provider to avoid reconnections on page navigation
    const { isConnected: wsConnected, subscribe } = useWebSocketContext();

    // Subscribe to message events
    useEffect(() => {
        const unsubscribe = subscribe('message', (wsMessage) => {
            const messageData = wsMessage.payload;
            console.log('[MessagesPage] 🎯 onMessageReceived called with:', messageData);
            
            // Convert WebSocket message format to Message format
            const newMessage: Message = {
                id: messageData.id,
                sender_id: messageData.sender_id,
                receiver_id: messageData.receiver_id,
                content: messageData.content || "",
                attachment_url: messageData.attachment_url || "",
                attachment_type: messageData.attachment_type || "",
                created_at: messageData.created_at || new Date().toISOString(),
                is_read: messageData.is_read || false,
            };

            // Get current user ID - reload if not available
            const currentUserId = currentUser?.id;
            console.log('[MessagesPage] Current user ID:', currentUserId, 'Current user:', currentUser, 'WS Connected:', wsConnected);
            
            // If current user not loaded, try to reload and process message after
            if (!currentUserId) {
                console.warn('[MessagesPage] ⚠️ Current user not loaded, trying to reload...');
                getMe().then(user => {
                    console.log('[MessagesPage] ✅ Reloaded user:', user);
                    setCurrentUser(user);
                    // Re-process the message with loaded user
                    if (user?.id) {
                        processIncomingMessage(newMessage, String(user.id));
                    }
                }).catch(err => {
                    console.error('[MessagesPage] ❌ Failed to reload user:', err);
                });
                return;
            }
            
            processIncomingMessage(newMessage, String(currentUserId));
        });

        return unsubscribe;
    }, [subscribe, currentUser, wsConnected]);

    // ✅ Helper function to process incoming WebSocket messages
    const processIncomingMessage = (newMessage: Message, currentUserIdStr: string) => {
        const senderIdStr = String(newMessage.sender_id);
        const receiverIdStr = String(newMessage.receiver_id);
        
        const isIncomingMessage = receiverIdStr === currentUserIdStr;
        const isOutgoingMessage = senderIdStr === currentUserIdStr;
        
        console.log('[MessagesPage] 🔍 Message analysis:', {
            currentUserId: currentUserIdStr,
            senderId: senderIdStr,
            receiverId: receiverIdStr,
            isIncomingMessage,
            isOutgoingMessage,
            chatId: chatId ? String(chatId) : null,
        });
        
        // Check if message is for current chat
        // Message is for current chat if:
        // - We're viewing this chat (chatId matches the other participant)
        // - And we're either receiving (incoming) or sending (outgoing) the message
        let isCurrentChat = false;
        if (chatId) {
            const chatIdStr = String(chatId);
            if (isIncomingMessage) {
                // We're receiving: check if chatId matches sender (we're chatting with sender)
                isCurrentChat = chatIdStr === senderIdStr;
                console.log('[MessagesPage] 📥 Incoming message check:', { chatIdStr, senderIdStr, isCurrentChat });
            } else if (isOutgoingMessage) {
                // We're sending: check if chatId matches receiver (we're chatting with receiver)
                isCurrentChat = chatIdStr === receiverIdStr;
                console.log('[MessagesPage] 📤 Outgoing message check:', { chatIdStr, receiverIdStr, isCurrentChat });
            }
        } else {
            console.log('[MessagesPage] ⚠️ No chatId, message not for current chat');
        }

        console.log('[MessagesPage] ✅ Final decision:', {
            messageId: newMessage.id,
            content: newMessage.content,
            isCurrentChat,
            willAddToMessages: isCurrentChat,
        });

        // If message is for current chat, add it to messages list
        if (isCurrentChat) {
            setMessages(prev => {
                // Check if message already exists (avoid duplicates)
                const exists = prev.some(m => String(m.id) === String(newMessage.id));
                if (exists) {
                    console.log('[MessagesPage] ⏭️ Message already exists, skipping. Current messages:', prev.length);
                    return prev;
                }
                console.log('[MessagesPage] ✨ Adding new message to chat! Previous count:', prev.length);
                const updated = [...prev, newMessage];
                console.log('[MessagesPage] ✨ New message count:', updated.length);
                return updated;
            });
        } else {
            console.log('[MessagesPage] ❌ Message not for current chat, not adding to messages');
        }

        // Update conversations list
        setConversations(prev => {
            // For incoming messages, update conversation with sender
            // For outgoing messages, update conversation with receiver
            const conversationUserId = isIncomingMessage ? String(newMessage.sender_id) : String(newMessage.receiver_id);
            const existingConv = prev.find(c => String(c.user_id) === conversationUserId);
            
            if (existingConv) {
                // Update existing conversation
                return prev.map(c =>
                    String(c.user_id) === conversationUserId
                        ? {
                            ...c,
                            last_message: newMessage.content || (newMessage.attachment_url ? "Attachment" : ""),
                            last_message_time: "Just now",
                            // Increment unread count only for incoming messages not in current chat
                            unread_count: (isIncomingMessage && !isCurrentChat) ? (c.unread_count + 1) : c.unread_count,
                        }
                        : c
                ).sort((a, b) => {
                    // Sort by last message time (most recent first)
                    if (a.user_id === conversationUserId) return -1;
                    if (b.user_id === conversationUserId) return 1;
                    return 0;
                });
            } else if (isOutgoingMessage) {
                // New conversation from us - refresh conversations to get user info
                getConversations().then(refreshed => {
                    setConversations(refreshed);
                });
                return prev;
            }
            return prev;
        });

        // Show notification for incoming messages not in current chat
        if (isIncomingMessage && !isCurrentChat) {
            const senderName = conversations.find(c => String(c.user_id) === String(newMessage.sender_id))?.user_name || "Someone";
            toast.info(`New message from ${senderName}`, {
                description: newMessage.content || "Attachment",
            });
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
                setShowEmojiPicker(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

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

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const res = await uploadAttachment(file);
            setAttachment({ url: res.attachment_url, type: res.attachment_type });
            toast.success("File uploaded successfully");
        } catch (err) {
            console.error("Upload failed:", err);
            toast.error("Failed to upload file");
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleRemoveAttachment = () => {
        setAttachment(null);
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatId) return;
        if (!newMessage.trim() && !attachment) return;

        try {
            const sent = await sendMessage(
                chatId as string,
                newMessage,
                attachment?.url,
                attachment?.type
            );
            setMessages([...messages, sent]);
            setNewMessage("");
            setAttachment(null);

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
        return <MessagesSkeleton />;
    }

    return (
        <div className="h-full flex p-4 lg:p-6 overflow-hidden animate-in fade-in duration-700">
            <div className="flex-1 flex bg-zinc-50 dark:bg-white/[0.02] border border-zinc-300 dark:border-white/5 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-sm">

                {/* Conversations Sidebar */}
                <aside className={`w-full md:w-80 border-r border-zinc-300 dark:border-white/5 flex flex-col ${chatId ? 'hidden md:flex' : 'flex'}`}>
                    <div className="p-4 border-b border-zinc-300 dark:border-white/5">
                        <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-4">Messages</h2>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                            <input
                                type="text"
                                placeholder="Search everything..."
                                className="w-full bg-white dark:bg-black/20 border border-zinc-300 dark:border-white/5 rounded-lg py-2 pl-10 pr-4 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-500 dark:placeholder:text-zinc-600 focus:outline-none focus:border-blue-500/30 dark:focus:border-indigo-500/30"
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
                                        className={`w-full flex items-center gap-3 p-4 hover:bg-zinc-100 dark:hover:bg-white/[0.03] transition-colors border-b border-zinc-200 dark:border-zinc-900/50 ${chatId === conv.user_id ? 'bg-blue-50 dark:bg-indigo-500/5' : ''}`}
                                    >
                                        <div className="relative shrink-0">
                                            <div className="h-10 w-10 rounded-lg bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-white/5 flex items-center justify-center overflow-hidden">
                                                {conv.user_avatar ? (
                                                    <img src={getAvatarUrl(conv.user_avatar) || ""} alt="" className="h-full w-full object-cover" loading="lazy" decoding="async" />
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
                                                <h4 className="text-sm font-bold text-zinc-900 dark:text-white truncate">{conv.user_name}</h4>
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
                        <div className="mt-4 border-t border-zinc-300 dark:border-white/5">
                            <h3 className="px-4 py-3 text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Connect with Team</h3>
                            {teamMembers
                                .filter(m => m.user_id !== currentUser?.id && !conversations.find(c => c.user_id === m.user_id))
                                .map((member) => (
                                    <button
                                        key={member.user_id}
                                        onClick={() => navigate(`/app/v1/messages/${member.user_id}`)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-white/[0.03] transition-colors ${chatId === member.user_id ? 'bg-indigo-500/5' : ''}`}
                                    >
                                        <div className="h-8 w-8 rounded-lg bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-white/5 flex items-center justify-center overflow-hidden shrink-0">
                                            {member.user?.avatar_url ? (
                                                <img src={getAvatarUrl(member.user.avatar_url) || ""} alt="" className="h-full w-full object-cover" loading="lazy" decoding="async" />
                                            ) : (
                                                <User size={16} className="text-zinc-500" />
                                            )}
                                        </div>
                                        <div className="flex-1 text-left min-w-0">
                                            <h4 className="text-xs font-bold text-zinc-900 dark:text-white truncate">{member.user?.name || member.email}</h4>
                                            <p className="text-[10px] text-zinc-600 truncate">{member.role}</p>
                                        </div>
                                    </button>
                                ))
                            }
                        </div>
                    </div>
                </aside>

                {/* Chat Area */}
                <main className={`flex-1 flex flex-col bg-zinc-50 dark:bg-black/20 ${!chatId ? 'hidden md:flex' : 'flex'}`}>
                    {chatId && activeChat ? (
                        <>
                            {/* Chat Header */}
                            <header className="p-4 border-b border-zinc-300 dark:border-white/5 flex items-center justify-between bg-zinc-50 dark:bg-white/[0.01]">
                                <div className="flex items-center gap-3">
                                    <button onClick={() => navigate('/app/v1/messages')} className="md:hidden text-zinc-600 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white mr-2">
                                        <MoreHorizontal size={20} className="rotate-90" />
                                    </button>
                                    <div className="relative">
                                        <div className="h-10 w-10 rounded-lg bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-white/5 flex items-center justify-center overflow-hidden">
                                            {activeChat.user_avatar ? (
                                                <img src={getAvatarUrl(activeChat.user_avatar) || ""} alt="" className="h-full w-full object-cover" loading="lazy" decoding="async" />
                                            ) : (
                                                <User size={20} className="text-zinc-500" />
                                            )}
                                        </div>
                                        <div className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-black ${activeChat.status.toLowerCase() === 'online' ? 'bg-emerald-500' : 'bg-zinc-500'}`} />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-zinc-900 dark:text-white leading-tight">{activeChat.user_name}</h3>
                                        <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">{activeChat.status}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button className="p-2 text-zinc-600 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-white/5 rounded-lg transition-colors"><Phone size={18} /></button>
                                    <button className="p-2 text-zinc-600 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-white/5 rounded-lg transition-colors"><Video size={18} /></button>
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
                                                    {msg.attachment_url && (
                                                        <div className="mb-2 max-w-full overflow-hidden rounded-lg border border-white/5 bg-black/20">
                                                            {msg.attachment_type === 'image' ? (
                                                                <img
                                                                    src={getFileUrl(msg.attachment_url) || ''}
                                                                    alt="attachment"
                                                                    className="max-h-60 w-full object-contain cursor-pointer transition-transform hover:scale-[1.02]"
                                                                    onClick={() => window.open(getFileUrl(msg.attachment_url) || '', '_blank')}
                                                                    loading="lazy"
                                                                    decoding="async"
                                                                />
                                                            ) : (
                                                                <a
                                                                    href={getFileUrl(msg.attachment_url) || ''}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="flex items-center gap-2 p-3 text-indigo-400 hover:text-indigo-300 transition-colors"
                                                                >
                                                                    <FileText size={18} />
                                                                    <span className="truncate max-w-[200px] text-xs font-medium">Download Attachment</span>
                                                                </a>
                                                            )}
                                                        </div>
                                                    )}
                                                    {renderMessageContent(msg.content)}
                                                </div>
                                                {isLastInGroup && (
                                                    <div className={`flex items-center gap-1 mt-1.5 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                        <span className="text-[10px] text-zinc-600 font-medium">
                                                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                        {isMe && (
                                                            msg.is_read
                                                                ? <CheckCheck size={12} className="text-indigo-400 translate-y-[0.5px]" />
                                                                : <Check size={12} className="text-zinc-500 translate-y-[0.5px]" />
                                                        )}
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
                                {attachment && (
                                    <div className="mb-3 flex items-center gap-3 p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl animate-in slide-in-from-bottom-2">
                                        <div className="h-12 w-12 rounded-lg bg-zinc-800 border border-white/5 flex items-center justify-center overflow-hidden shrink-0">
                                            {attachment.type === 'image' ? (
                                                <img src={getFileUrl(attachment.url) || ''} alt="preview" className="h-full w-full object-cover" loading="lazy" decoding="async" />
                                            ) : (
                                                <FileText className="text-indigo-400" size={24} />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-white truncate">Ready to send</p>
                                            <p className="text-[10px] text-zinc-500 uppercase tracking-widest">{attachment.type}</p>
                                        </div>
                                        <button
                                            onClick={handleRemoveAttachment}
                                            className="p-2 text-zinc-500 hover:text-white transition-colors"
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>
                                )}
                                {/* Preview Box Removed */}
                                <form onSubmit={handleSend} className="flex items-center gap-3">
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        onChange={handleFileChange}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={uploading}
                                        className={`p-2 text-zinc-500 hover:text-zinc-300 transition-colors ${uploading ? 'animate-pulse' : ''}`}
                                    >
                                        <Paperclip size={18} />
                                    </button>
                                    <div className="flex-1 relative">
                                        <RichMessageInput
                                            value={newMessage}
                                            onChange={setNewMessage}
                                            onSend={() => handleSend({ preventDefault: () => { } } as any)}
                                            loading={uploading}
                                            animatedEmojiMap={ANIMATED_EMOJI_MAP}
                                        />
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                            {showEmojiPicker && (
                                                <div
                                                    ref={emojiPickerRef}
                                                    className="absolute bottom-full right-0 mb-4 bg-zinc-900/95 border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200 z-50 w-72 overflow-hidden"
                                                >
                                                    {/* Category Tabs */}
                                                    <div className="flex items-center gap-1 p-2 border-b border-white/5 bg-white/[0.02]">
                                                        {Object.entries(emojiCategories).map(([id, cat]) => (
                                                            <button
                                                                key={id}
                                                                type="button"
                                                                onClick={() => setActiveEmojiCategory(id)}
                                                                className={`flex-1 h-9 flex items-center justify-center rounded-lg transition-all ${activeEmojiCategory === id ? 'bg-indigo-500/20 text-white shadow-inner' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'}`}
                                                                title={id.charAt(0).toUpperCase() + id.slice(1)}
                                                            >
                                                                <span className="text-lg">{cat.icon}</span>
                                                            </button>
                                                        ))}
                                                    </div>

                                                    {/* Emoji Grid */}
                                                    <div className="p-3 max-h-60 overflow-y-auto custom-scrollbar grid grid-cols-6 gap-1">
                                                        {emojiCategories[activeEmojiCategory].emojis.map((emoji, idx) => {
                                                            const isPremium = activeEmojiCategory === 'premium';
                                                            const displayEmoji = isPremium ? ANIMATED_EMOJI_MAP[emoji] : emoji;

                                                            return (
                                                                <button
                                                                    key={`${activeEmojiCategory}-${idx}`}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setNewMessage(prev => prev + emoji);
                                                                    }}
                                                                    className="h-10 w-10 flex items-center justify-center hover:bg-white/10 rounded-lg transition-all hover:scale-110 active:scale-90"
                                                                >
                                                                    {isPremium ? (
                                                                        <img src={displayEmoji as string} alt={emoji} className="h-8 w-8 object-contain" />
                                                                    ) : (
                                                                        <span className="text-xl">{emoji}</span>
                                                                    )}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>

                                                    <div className="p-2 border-t border-white/5 bg-black/20 text-[10px] text-zinc-500 text-center uppercase tracking-widest font-bold">
                                                        {activeEmojiCategory}
                                                    </div>
                                                </div>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                                className={`text-zinc-500 hover:text-zinc-300 transition-colors ${showEmojiPicker ? 'text-indigo-400' : ''}`}
                                            >
                                                <Smile size={18} />
                                            </button>
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={(!newMessage.trim() && !attachment) || uploading}
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
        </div >
    );
}
