import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import {
    ArrowRight,
    Zap,
    Play,
    CheckCircle2,
    Brain,
    Coffee,
    Timer,
    BarChart3,
    Bot,
    Layers,
    Pause,
    RotateCcw
} from "lucide-react";
import "../index.css"
import LogoImage from "../assets/Gemini_Generated_Image_55paui55paui55pa-removebg-preview.png";

// Prefetch critical routes on hover for faster navigation
const prefetchRoute = (path: string) => {
    if (path === '/app/v1/register') {
        import("../pages/Register");
    } else if (path === '/app/v1/login') {
        import("../pages/Login");
    } else if (path === '/app/v1/dashboard') {
        import("../pages/Dashboard");
    }
};

export default function LandingPage() {
    const navigate = useNavigate();
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const heroRef = useRef<HTMLDivElement>(null);

    // Prefetch login and register routes after initial load
    useEffect(() => {
        const timer = setTimeout(() => {
            prefetchRoute('/app/v1/login');
            prefetchRoute('/app/v1/register');
        }, 2000);
        return () => clearTimeout(timer);
    }, []);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (heroRef.current) {
            const { left, top } = heroRef.current.getBoundingClientRect();
            setMousePosition({ x: e.clientX - left, y: e.clientY - top });
        }
    };

    return (
        <div className="landing-page-scope landing-page-wrapper dark min-h-screen selection:bg-indigo-500/30 overflow-x-hidden relative bg-[#09090b] text-white">
            {/* Global Background Gradient */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full mix-blend-screen animate-blob-bounce" />
                <div className="absolute top-[20%] right-[-10%] w-[30%] h-[50%] bg-purple-600/10 blur-[120px] rounded-full mix-blend-screen animate-blob-bounce" style={{ animationDelay: '2s' }} />
                <div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] bg-blue-600/5 blur-[120px] rounded-full mix-blend-screen animate-blob-bounce" style={{ animationDelay: '4s' }} />
            </div>

            {/* Navigation */}
            <nav className="fixed top-0 inset-x-0 z-50 backdrop-blur-md border-b border-white/5 bg-[#09090b]/80">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <img src={LogoImage} alt="Flowday" className="h-8 w-auto object-contain" />
                        <span className="text-lg font-bold tracking-tight">Flowday</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/app/v1/login')}
                            onMouseEnter={() => prefetchRoute('/app/v1/login')}
                            className="text-sm font-medium text-zinc-400 hover:text-white transition-colors px-4 py-2 hover:bg-white/5 rounded-full"
                        >
                            Sign In
                        </button>
                        <button
                            onClick={() => navigate('/app/v1/register')}
                            onMouseEnter={() => prefetchRoute('/app/v1/register')}
                            className="hidden sm:block px-5 py-2 bg-white text-black hover:bg-zinc-200 text-sm font-semibold rounded-full transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                        >
                            Get Started
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section
                ref={heroRef}
                onMouseMove={handleMouseMove}
                className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 z-10 w-full overflow-hidden flex flex-col items-center"
            >
                {/* Spotlight effect */}
                <div
                    className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100"
                    style={{
                        background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255,255,255,0.06), transparent 40%)`,
                    }}
                />

                <div className="max-w-4xl mx-auto text-center relative z-10">


                    <h1 className="text-5xl md:text-8xl font-bold tracking-tight leading-[1.1] mb-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        Focus is the new<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 animate-shimmer bg-[length:200%_auto]">Superpower</span>.
                    </h1>

                    <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                        Transform your workflow with a neuroscience-first approach to productivity.
                        Block distractions, enter deep work, and ship faster.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
                        <button
                            onClick={() => navigate('/app/v1/register')}
                            onMouseEnter={() => prefetchRoute('/app/v1/register')}
                            className="group h-12 px-8 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-base flex items-center gap-2 shadow-[0_0_30px_rgba(79,70,229,0.3)] hover:shadow-[0_0_40px_rgba(79,70,229,0.5)] transition-all hover:-translate-y-0.5 duration-300"
                        >
                            Start for Free
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button className="h-12 px-8 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white font-medium text-base transition-all flex items-center gap-2 group backdrop-blur-md">
                            <Play size={14} fill="currentColor" className="text-zinc-400 group-hover:text-white transition-colors" />
                            Watch Demo
                        </button>
                    </div>
                </div>

                {/* 3D Mockup Container */}
                <div className="w-full max-w-6xl mx-auto mt-24 relative perspective-[2000px] group">
                    {/* Glow behind mockup */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-indigo-500/20 blur-[100px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                    <div
                        className="relative rounded-xl border border-white/10 bg-[#09090b] shadow-2xl overflow-hidden aspect-[16/10] md:aspect-[21/9] ring-1 ring-white/5 transform transition-transform duration-700 hover:rotate-x-2 hover:scale-[1.02] origin-center"
                        style={{ transformStyle: 'preserve-3d', transform: 'rotateX(5deg)' }}
                    >
                        {/* Fake UI Header */}
                        <div className="h-12 border-b border-white/5 bg-white/[0.02] flex items-center px-4 justify-between">
                            <div className="flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/30" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/30" />
                                <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/30" />
                            </div>
                            <div className="flex gap-4 text-xs font-medium text-zinc-600">
                                <span>Dashboard</span>
                                <span>Focus</span>
                                <span>Analytics</span>
                            </div>
                            <div className="w-16" /> {/* spacer */}
                        </div>

                        {/* UI Content Mockup (Abstract) */}
                        <div className="p-8 grid grid-cols-12 gap-8 h-full bg-[#09090b]">
                            {/* Sidebar */}
                            <div className="hidden md:block col-span-2 space-y-6 border-r border-white/5 pr-8">
                                <div className="space-y-3">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="h-8 w-full rounded-lg bg-white/[0.03] animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
                                    ))}
                                </div>
                            </div>

                            {/* Main Area */}
                            <div className="col-span-12 md:col-span-10 space-y-8">
                                <div className="flex gap-6">
                                    <div className="h-32 w-1/3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 p-6 flex flex-col justify-between group/card hover:bg-indigo-500/20 transition-colors cursor-default">
                                        <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                                            <Zap size={20} />
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold text-white mb-1">94%</div>
                                            <div className="text-xs text-indigo-300 uppercase font-bold tracking-wider">Focus Score</div>
                                        </div>
                                    </div>
                                    <div className="h-32 w-1/3 rounded-2xl bg-white/[0.03] border border-white/5 p-6 flex flex-col justify-between">
                                        <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-zinc-400">
                                            <CheckCircle2 size={20} />
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold text-white mb-1">12</div>
                                            <div className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Tasks Done</div>
                                        </div>
                                    </div>
                                    <div className="h-32 w-1/3 rounded-2xl bg-white/[0.03] border border-white/5 p-6 flex flex-col justify-between">
                                        <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-zinc-400">
                                            <Timer size={20} />
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold text-white mb-1">4h 20m</div>
                                            <div className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Deep Work</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="h-16 w-full rounded-xl border border-white/5 bg-white/[0.02] flex items-center px-6 justify-between group/row hover:bg-white/[0.04] transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="w-5 h-5 rounded border border-white/20 group-hover/row:border-indigo-500/50 transition-colors" />
                                                <div className="h-2 w-48 bg-white/10 rounded" />
                                            </div>
                                            <div className="h-2 w-12 bg-white/5 rounded" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Bento Grid Features */}
            <section className="py-32 px-6 relative z-10">
                <div className="max-w-6xl mx-auto">
                    <div className="mb-20">
                        <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">Designed for <span className="text-indigo-400">Flow</span></h2>
                        <p className="text-zinc-400 text-lg max-w-xl">Everything you need to get in the zone and stay there.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-6 h-auto md:h-[600px]">
                        {/* Large Card: Focus Mode */}
                        <div className="md:col-span-2 md:row-span-2 bg-zinc-900/50 rounded-3xl border border-white/10 p-8 relative overflow-hidden group hover:border-indigo-500/30 transition-colors duration-500">
                            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-indigo-600/20 blur-[100px] rounded-full mix-blend-screen opacity-20 group-hover:opacity-40 transition-opacity" />

                            <div className="relative z-10 h-full flex flex-col pointer-events-none">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-6">
                                    <Zap size={24} />
                                </div>
                                <h3 className="text-2xl font-bold mb-2">Immersive Focus Mode</h3>
                                <p className="text-zinc-400 mb-8 max-w-md">Block distractions with a single click. Fullscreen timer, ambient soundscapes, and breathing exercises to keep you zoned in.</p>

                                {/* Interactive Timer UI */}
                                <div className="flex-1 rounded-t-2xl border-t border-l border-r border-white/10 bg-[#09090b] relative overflow-hidden shadow-2xl pointer-events-auto">
                                    <TimerWidget />
                                </div>
                            </div>
                        </div>

                        {/* Medium Card: AI Coach */}
                        <div className="md:col-span-1 md:row-span-1 bg-zinc-900/50 rounded-3xl border border-white/10 p-8 relative overflow-hidden group hover:border-purple-500/30 transition-colors duration-500">
                            <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-purple-600/20 blur-[80px] rounded-full mix-blend-screen opacity-20 group-hover:opacity-40 transition-opacity" />
                            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400 mb-4">
                                <Bot size={24} />
                            </div>
                            <h3 className="text-xl font-bold mb-2">AI Flow Coach</h3>
                            <p className="text-zinc-400 text-sm">Smart suggestions to optimize your routine based on your energy levels.</p>
                        </div>

                        {/* Medium Card: Analytics */}
                        <div className="md:col-span-1 md:row-span-1 bg-zinc-900/50 rounded-3xl border border-white/10 p-8 relative overflow-hidden group hover:border-emerald-500/30 transition-colors duration-500">
                            <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-emerald-600/20 blur-[80px] rounded-full mix-blend-screen opacity-20 group-hover:opacity-40 transition-opacity" />
                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-4">
                                <BarChart3 size={24} />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Productivity Stats</h3>
                            <p className="text-zinc-400 text-sm">Visualize your flow state patterns and improve your consistency over time.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Workflow Section */}
            <section className="py-24 px-6 border-t border-white/5 bg-[#09090b]">
                <div className="max-w-4xl mx-auto text-center mb-16">
                    <h2 className="text-3xl font-bold mb-4">The Flowday Method</h2>
                    <p className="text-zinc-400">A simple loop to maintain peak performance.</p>
                </div>

                <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { icon: <Brain />, title: "Capture", desc: "Dump tasks into your inbox correctly." },
                        { icon: <Coffee />, title: "Clarify", desc: "Plan your day with the Morning Ritual." },
                        { icon: <Layers />, title: "Execute", desc: "Enter Flow Mode and crush your list." }
                    ].map((step, i) => (
                        <div key={i} className="flex flex-col items-center text-center p-6 rounded-2xl hover:bg-white/5 transition-colors">
                            <div className="w-16 h-16 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-300 mb-4 shadow-xl">
                                {step.icon}
                            </div>
                            <h3 className="text-lg font-bold mb-2 text-white">{step.title}</h3>
                            <p className="text-zinc-400 text-sm">{step.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-32 px-6">
                <div className="max-w-5xl mx-auto relative rounded-[2.5rem] overflow-hidden border border-white/10 bg-zinc-900/50">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-purple-500/5 to-transparent opacity-50" />

                    <div className="relative z-10 px-6 py-24 text-center">
                        <h2 className="text-4xl md:text-6xl font-bold mb-6 text-white tracking-tight">Ready to reclaim your attention?</h2>
                        <p className="text-xl text-zinc-400 mb-10 max-w-xl mx-auto">Join the new wave of productive developers.</p>

                        <button
                            onClick={() => navigate('/app/v1/register')}
                            className="px-10 py-4 bg-white text-black text-lg font-bold rounded-full hover:bg-zinc-200 transition-colors shadow-[0_0_40px_rgba(255,255,255,0.2)]"
                        >
                            Get Started Now
                        </button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-6 border-t border-white/5 text-center text-zinc-600 text-sm">
                <p>&copy; {new Date().getFullYear()} Flowday. Crafted for deep work.</p>
            </footer>
        </div>
    );
}

// New Interactive Timer Component
function TimerWidget() {
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        let interval: any;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    const toggleTimer = () => setIsActive(!isActive);
    const resetTimer = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsActive(false);
        setTimeLeft(25 * 60);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const progress = ((25 * 60 - timeLeft) / (25 * 60)) * 100;

    return (
        <div
            className="absolute inset-0 flex items-center justify-center flex-col cursor-pointer hover:bg-white/[0.02] transition-colors"
            onClick={toggleTimer}
        >
            <div className="text-6xl font-bold text-white font-mono tracking-tighter mb-4 tabular-nums relative group">
                {formatTime(timeLeft)}
                {!isActive && timeLeft !== 25 * 60 && (
                    <button
                        onClick={resetTimer}
                        className="absolute -right-12 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 text-zinc-400 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                        title="Reset Timer"
                    >
                        <RotateCcw size={16} />
                    </button>
                )}
            </div>

            <div className="flex gap-2 mb-4">
                <span className="px-3 py-1 rounded-full bg-white/5 text-xs font-medium text-zinc-400 border border-white/5">
                    {isActive ? 'Deep Work' : (timeLeft === 25 * 60 ? 'Click to Start' : 'Paused')}
                </span>
                <span className="px-3 py-1 rounded-full bg-white/5 text-xs font-medium text-zinc-400 border border-white/5">lo-fi beats</span>
            </div>

            {/* Play/Pause Indicator (Subtle) */}
            <div className={`p-3 rounded-full bg-indigo-500/20 text-indigo-400 transition-all duration-300 ${isActive ? 'scale-90 opacity-50' : 'scale-100 opacity-100'}`}>
                {isActive ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
            </div>

            {/* Progress Bar */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-white/10">
                <div
                    className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)] transition-all duration-1000 ease-linear"
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
}