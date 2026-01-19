import { useState, useEffect, useRef, lazy, Suspense } from "react";
import { MessageCircle, X, Send, Sparkles, Zap, Lock, ChevronDown, Bot } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import { chatWithAI, getChatHistory, getQuotaStatus, type Message } from "../../api/ai";
import { toast } from "sonner";

// Lazy load ReactMarkdown (heavy library)
const ReactMarkdown = lazy(() => import('react-markdown'));

export default function FlowBotWidget() {
    const { user } = useUser();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);

    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [quota, setQuota] = useState<{ allowed: boolean; remaining: number } | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Initial Load
    useEffect(() => {
        if (isOpen && user) {
            loadHistory();
            checkQuota();
        }
    }, [isOpen, user]);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    const loadHistory = async () => {
        try {
            const res = await getChatHistory();
            setMessages(res.history || []);
        } catch (err) {
            console.error("Failed to load history", err);
        }
    };

    const checkQuota = async () => {
        try {
            const data = await getQuotaStatus();
            setQuota(data);
        } catch (err) {
            console.error("Failed to check quota", err);
        }
    };

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputValue.trim() || isLoading) return;

        // Optimistic Update
        const userMsg: Message = { role: "user", content: inputValue, timestamp: new Date().toISOString() };
        setMessages(prev => [...prev, userMsg]);
        setInputValue("");
        setIsLoading(true);

        try {
            const res = await chatWithAI(userMsg.content);
            const aiMsg: Message = { role: "assistant", content: res.reply, timestamp: new Date().toISOString() };
            setMessages(prev => [...prev, aiMsg]);
            checkQuota(); // Update quota after message
        } catch (err: any) {
            if (err.response?.status === 429) {
                toast.error("Daily usage limit reached");
                checkQuota(); // Refresh to ensure UI shows limit state
            } else {
                toast.error("Failed to send message");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const isQuotaExceeded = quota && !quota.allowed;

    if (location.pathname.includes("/messages")) return null;

    return (
        <div className={`fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4 font-[Inter]`}>

            {/* Chat Window */}
            {isOpen && (
                <div className="w-[380px] h-[600px] bg-[#0A0A0A]/95 backdrop-blur-xl border border-white/10 rounded-[2rem] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 zoom-in-95 duration-300 origin-bottom-right ring-1 ring-white/5">

                    {/* Header */}
                    <div className="p-5 border-b border-white/5 bg-gradient-to-r from-indigo-500/10 to-transparent flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                                <Bot size={20} />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-white leading-tight">FlowBot AI</h3>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="relative flex h-1.5 w-1.5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                                    </span>
                                    <span className="text-[10px] text-emerald-400 font-medium uppercase tracking-wider">Online</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {/* Quota Badge */}
                            {user?.plan !== 'pro' && quota && (
                                <div className={`px-2 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${isQuotaExceeded
                                    ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                                    : 'bg-zinc-800 border-white/5 text-zinc-400'
                                    }`}>
                                    <Zap size={10} className={isQuotaExceeded ? 'fill-rose-400' : 'fill-zinc-400'} />
                                    {isQuotaExceeded ? '0/10' : `${quota.remaining}/10`}
                                </div>
                            )}
                            <button
                                onClick={() => setIsOpen(false)}
                                className="h-8 w-8 rounded-full hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
                            >
                                <ChevronDown size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div
                        ref={scrollRef}
                        className="flex-1 overflow-y-auto p-5 custom-scrollbar space-y-6"
                    >
                        {messages.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-50">
                                <div className="h-16 w-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4 text-zinc-500">
                                    <Sparkles size={32} />
                                </div>
                                <p className="text-sm font-medium text-white mb-2">How can I help you flow today?</p>
                                <p className="text-xs text-zinc-500">Ask me to break down tasks, give advice, or just chat.</p>
                            </div>
                        )}

                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                <div className={`
                                    shrink-0 h-8 w-8 rounded-full flex items-center justify-center border
                                    ${msg.role === 'assistant'
                                        ? 'bg-indigo-600 border-indigo-500/50 text-white'
                                        : 'bg-zinc-800 border-white/10 text-zinc-400'}
                                `}>
                                    {msg.role === 'assistant' ? <Sparkles size={14} /> : <div className="text-xs font-bold">You</div>}
                                </div>
                                <div className={`
                                    max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed border
                                    ${msg.role === 'user'
                                        ? 'bg-white/10 border-white/5 text-white rounded-tr-none'
                                        : 'bg-black/40 border-white/10 text-zinc-300 rounded-tl-none'}
                                `}>
                                    {msg.role === 'assistant'
                                        ? <div className="markdown prose prose-invert prose-xs max-w-none">
                                            <Suspense fallback={<div className="text-zinc-400 italic">Loading...</div>}>
                                                <ReactMarkdown>{msg.content}</ReactMarkdown>
                                            </Suspense>
                                          </div>
                                        : msg.content
                                    }
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex gap-3">
                                <div className="shrink-0 h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center border border-indigo-500/50 text-white">
                                    <Sparkles size={14} />
                                </div>
                                <div className="bg-black/40 border border-white/10 rounded-2xl px-4 py-3 rounded-tl-none flex items-center gap-1.5">
                                    <div className="h-1.5 w-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                    <div className="h-1.5 w-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                    <div className="h-1.5 w-1.5 bg-zinc-500 rounded-full animate-bounce" />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <div className="p-4 border-t border-white/10 bg-black/40 backdrop-blur-md">
                        {isQuotaExceeded ? (
                            <div className="flex flex-col items-center justify-center py-4 gap-3 bg-gradient-to-br from-rose-500/5 to-rose-500/0 rounded-xl border border-rose-500/10">
                                <div className="p-2 rounded-full bg-rose-500/10 text-rose-400">
                                    <Lock size={18} />
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-bold text-white">Daily Limit Reached</p>
                                    <p className="text-xs text-zinc-400 mt-1">Upgrade to PRO for unlimited flow.</p>
                                </div>
                                <button className="px-4 py-2 bg-white text-black text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-zinc-200 transition-colors">
                                    Upgrade Now
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSend} className="relative flex items-end gap-2">
                                <textarea
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder="Type your message..."
                                    rows={1}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSend();
                                        }
                                    }}
                                    className="w-full bg-zinc-900/50 border border-white/10 rounded-xl pl-4 pr-12 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 resize-none custom-scrollbar"
                                    style={{ minHeight: '44px', maxHeight: '120px' }}
                                />
                                <button
                                    type="submit"
                                    disabled={!inputValue.trim() || isLoading}
                                    className="absolute right-2 bottom-2 p-1.5 rounded-lg bg-indigo-600 text-white disabled:opacity-50 disabled:bg-zinc-800 disabled:text-zinc-600 transition-all hover:bg-indigo-500"
                                >
                                    <Send size={16} />
                                </button>
                            </form>
                        )}
                    </div>

                </div>
            )}

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    h-14 w-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 relative group
                    ${isOpen
                        ? 'bg-zinc-800 text-zinc-400 rotate-90 hover:text-white'
                        : 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white hover:scale-110 hover:shadow-indigo-500/40'}
                `}
            >
                {isOpen ? <X size={24} /> : <MessageCircle size={28} className="fill-white/20" />}

                {/* Ping Animation for closed state */}
                {!isOpen && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-zinc-950"></span>
                    </span>
                )}
            </button>
        </div>
    );
}
