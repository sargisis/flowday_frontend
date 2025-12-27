
import { useNavigate } from "react-router-dom";
import { ArrowRight, Zap, Shield, Play, CheckCircle } from "lucide-react";

export default function LandingPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-orange-500/30 overflow-x-hidden">
            {/* Navigation */}
            <nav className="fixed top-0 inset-x-0 z-50 backdrop-blur-md border-b border-white/5 bg-[#050505]/80">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white font-bold">
                            F
                        </div>
                        <span className="text-xl font-bold tracking-tight">Flowday</span>
                    </div>
                    <div className="flex items-center gap-6">
                        <button onClick={() => navigate('/app/v1/login')} className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
                            Sign In
                        </button>
                        <button
                            onClick={() => navigate('/app/v1/register')}
                            className="px-5 py-2.5 bg-white text-black text-sm font-semibold rounded-full hover:bg-zinc-200 transition-colors"
                        >
                            Get Started
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6">
                {/* Background Glows */}
                <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-orange-500/20 blur-[120px] rounded-full opacity-50 pointer-events-none" />
                <div className="absolute top-40 left-1/4 w-[400px] h-[300px] bg-purple-500/20 blur-[100px] rounded-full opacity-30 pointer-events-none" />

                <div className="max-w-5xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                        <span className="text-xs font-medium text-zinc-300">Flow State OS v1.0 is here</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-semibold tracking-tight leading-[1.1] mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        The Operating System<br />
                        for <span className="text-white">Deep Work</span>.
                    </h1>

                    <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                        Stop managing tasks. Start managing your attention.
                        Flowday combines project management with neuro-science based focus tools.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
                        <button
                            onClick={() => navigate('/app/v1/register')}
                            className="group h-14 px-8 rounded-full bg-gradient-to-r from-orange-500 to-amber-600 text-white font-semibold text-lg flex items-center gap-2 shadow-[0_0_40px_rgba(249,115,22,0.3)] hover:shadow-[0_0_60px_rgba(249,115,22,0.5)] transition-all hover:-translate-y-1"
                        >
                            Start for Free
                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button className="h-14 px-8 rounded-full border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-300 font-medium transition-colors flex items-center gap-3 group">
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                                <Play size={14} fill="currentColor" className="ml-0.5" />
                            </div>
                            Watch Demo
                        </button>
                    </div>
                </div>

                {/* Hero Image / UI Preview */}
                <div className="max-w-6xl mx-auto mt-24 relative animate-in fade-in zoom-in-95 duration-1000 delay-500">
                    <div className="absolute -inset-4 bg-gradient-to-b from-orange-500/20 to-purple-500/20 blur-2xl opacity-50 rounded-[32px]" />
                    <div className="relative rounded-2xl border border-white/10 bg-[#0a0a0b] shadow-2xl overflow-hidden aspect-[16/9] group cursor-default">
                        {/* Fake UI Header */}
                        <div className="h-12 border-b border-white/5 bg-white/[0.02] flex items-center px-4 gap-2">
                            <div className="flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500/20" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500/20" />
                                <div className="w-3 h-3 rounded-full bg-green-500/20" />
                            </div>
                        </div>

                        {/* UI Placeholder Content (or Screenshot simulation) */}
                        <div className="p-8 grid grid-cols-12 gap-8 h-full">
                            {/* Sidebar Mockup */}
                            <div className="col-span-3 space-y-4 border-r border-white/5 pr-8 opacity-50">
                                <div className="h-8 w-24 bg-white/10 rounded-lg" />
                                <div className="space-y-2">
                                    <div className="h-4 w-full bg-white/5 rounded" />
                                    <div className="h-4 w-3/4 bg-white/5 rounded" />
                                    <div className="h-4 w-5/6 bg-white/5 rounded" />
                                </div>
                            </div>

                            {/* Main Content Mockup */}
                            <div className="col-span-9 space-y-8">
                                <div className="h-10 w-48 bg-white/10 rounded-lg mb-8" />

                                <div className="space-y-3">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="h-16 w-full border border-white/5 rounded-xl bg-white/[0.02] flex items-center px-6 justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-5 h-5 rounded-full border border-white/20" />
                                                <div className="h-4 w-64 bg-white/10 rounded" />
                                            </div>
                                            <div className="w-20 h-6 bg-white/5 rounded-full" />
                                        </div>
                                    ))}
                                </div>

                                {/* Focus Card Popping Out */}
                                <div className="absolute bottom-12 right-12 w-80 p-6 rounded-2xl border border-orange-500/30 bg-black/90 backdrop-blur-xl shadow-[0_0_50px_rgba(249,115,22,0.2)] group-hover:scale-105 transition-transform duration-500">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400">
                                            <Zap size={20} />
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-white">Focus Mode</div>
                                            <div className="text-xs text-orange-400">25:00 remaining</div>
                                        </div>
                                    </div>
                                    <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                                        <div className="h-full w-2/3 bg-orange-500 animate-pulse" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-32 px-6 border-t border-white/5 bg-[#050505]">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-24">
                        <h2 className="text-3xl md:text-5xl font-semibold mb-6">Designed for the <span className="text-orange-500">Flow State</span></h2>
                        <p className="text-zinc-400 text-lg max-w-2xl mx-auto">Most tools distract you. Flowday is designed to disappear so you can do your best work.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Zap className="text-orange-400" />}
                            title="Immersive Focus"
                            description="Block out distractions with a single click. Fullscreen mode, ambient soundscapes, and breathing timers."
                        />
                        <FeatureCard
                            icon={<Shield className="text-purple-400" />}
                            title="Ritual Based"
                            description="Start every day with intention. The Morning Ritual forces you to prioritize before you dive in."
                        />
                        <FeatureCard
                            icon={<CheckCircle className="text-green-400" />}
                            title="Instant Feedback"
                            description="Optimistic UI means zero latency. Interact with your tasks as fast as you can think."
                        />
                    </div>
                </div>
            </section>
        </div>
    );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <div className="p-8 rounded-3xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-colors group">
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                {icon}
            </div>
            <h3 className="text-xl font-medium text-white mb-3">{title}</h3>
            <p className="text-zinc-400 leading-relaxed">{description}</p>
        </div>
    );
}
