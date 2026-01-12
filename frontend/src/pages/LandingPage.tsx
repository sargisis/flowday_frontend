import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import {
    ArrowRight,
    Zap,
    Shield,
    Play,
    CircleCheck,
    Brain,
    Coffee,
    LayoutDashboard
} from "lucide-react";
import "../index.css"

// Prefetch critical routes on hover for faster navigation
const prefetchRoute = (path: string) => {
    // Prefetch route module by dynamically importing it
    // This helps React Router preload the chunk before navigation
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

    // Prefetch login and register routes after initial load
    useEffect(() => {
        // Prefetch critical routes after a short delay (non-blocking)
        const timer = setTimeout(() => {
            prefetchRoute('/app/v1/login');
            prefetchRoute('/app/v1/register');
        }, 2000); // Prefetch after 2 seconds

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="landing-page-scope landing-page-wrapper dark min-h-screen selection:bg-indigo-500/30 overflow-x-hidden relative">
            {/* Global Background Gradient */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-indigo-600/20 blur-[120px] rounded-full mix-blend-screen opacity-20" />
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/10 blur-[120px] rounded-full mix-blend-screen opacity-20" />
            </div>

            {/* Navigation */}
            <nav className="fixed top-0 inset-x-0 z-50 backdrop-blur-xl border-b border-border bg-background/80">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold shadow-lg shadow-primary/20">
                            F
                        </div>
                        <span className="text-xl font-bold tracking-tight text-foreground">Flowday</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/app/v1/login')}
                            onMouseEnter={() => prefetchRoute('/app/v1/login')}
                            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-4 py-2 hover:bg-muted rounded-full"
                        >
                            Sign In
                        </button>
                        <button
                            onClick={() => navigate('/app/v1/register')}
                            onMouseEnter={() => prefetchRoute('/app/v1/register')}
                            className="hidden sm:block px-6 py-2 bg-primary text-primary-foreground hover:opacity-90 text-sm font-semibold rounded-full transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                        >
                            Get Started
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            {/* FIX: Increased top padding to pt-32 (mobile) and pt-48 (desktop) */}
            <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 z-10 w-full overflow-hidden">

                {/* Hero Glows */}
                <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-indigo-500/20 blur-[120px] rounded-full opacity-40 pointer-events-none" />

                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-card/60 backdrop-blur-sm mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        <span className="text-xs font-medium text-muted-foreground">Flow State OS v1.0</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-8 bg-clip-text text-foreground animate-in fade-in slide-in-from-bottom-8 duration-700">
                        The Operating System<br />
                        for <span className="text-primary">Deep Work</span>.
                    </h1>

                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                        Stop managing tasks. Start managing your attention.
                        Flowday combines project management with neuro-science based focus tools.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
                        <button
                            onClick={() => navigate('/app/v1/register')}
                            onMouseEnter={() => prefetchRoute('/app/v1/register')}
                            className="group h-12 px-8 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base flex items-center gap-2 shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:shadow-[0_0_30px_rgba(79,70,229,0.6)] transition-all hover:-translate-y-0.5 duration-300"
                        >
                            Start for Free
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button className="h-12 px-8 rounded-full border border-border bg-card/5 hover:bg-card/10 text-muted-foreground group-hover:text-foreground font-medium text-base transition-all flex items-center gap-2 group backdrop-blur-md">
                            <Play size={14} fill="currentColor" className="text-muted-foreground group-hover:text-foreground transition-colors" />
                            Watch Demo
                        </button>
                    </div>
                </div>

                {/* Hero Image / UI Preview */}
                <div className="max-w-6xl mx-auto mt-20 relative animate-in fade-in zoom-in-95 duration-1000 delay-500">
                    <div className="absolute -inset-1 bg-gradient-to-b from-indigo-500/20 via-purple-500/5 to-transparent blur-2xl opacity-50 rounded-[32px]" />

                    {/* FIX: Improved Mockup Visibility */}
                    <div className="relative rounded-xl border border-border bg-card shadow-2xl shadow-primary/10 overflow-hidden aspect-[16/10] md:aspect-[16/9] ring-1 ring-white/5">

                        {/* Fake UI Header */}
                        <div className="h-10 border-b border-border bg-muted/5 flex items-center px-4 gap-2">
                            <div className="flex gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30" />
                                <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30" />
                                <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30" />
                            </div>
                        </div>

                        {/* UI Placeholder Content */}
                        <div className="p-6 grid grid-cols-12 gap-6 h-full">
                            {/* Sidebar Mockup */}
                            <div className="hidden md:block col-span-3 space-y-4 border-r border-border pr-6 opacity-60">
                                <div className="h-8 w-24 bg-muted-foreground/20 rounded-md" />
                                <div className="space-y-3 pt-4">
                                    <div className="h-4 w-full bg-muted-foreground/10 rounded" />
                                    <div className="h-4 w-3/4 bg-muted-foreground/10 rounded" />
                                    <div className="h-4 w-5/6 bg-muted-foreground/10 rounded" />
                                </div>
                            </div>

                            {/* Main Content Mockup */}
                            <div className="col-span-12 md:col-span-9 space-y-6">
                                <div className="h-8 w-48 bg-muted-foreground/20 rounded-lg mb-8" />

                                <div className="space-y-3">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="h-14 w-full border border-border rounded-lg bg-muted/50 flex items-center px-4 justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-5 h-5 rounded-full border border-muted-foreground/30" />
                                                <div className="h-3 w-32 md:w-64 bg-muted-foreground/20 rounded" />
                                            </div>
                                            <div className="w-12 h-2 bg-muted-foreground/20 rounded-full" />
                                        </div>
                                    ))}
                                </div>

                                {/* Focus Card Popping Out */}
                                <div className="absolute bottom-6 right-6 md:bottom-10 md:right-10 w-64 p-4 rounded-xl border border-primary/40 bg-card shadow-[0_0_50px_-10px_rgba(var(--primary),0.3)] z-20">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                                            <Zap size={16} fill="currentColor" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-semibold text-foreground">Deep Focus</div>
                                            <div className="text-xs text-primary font-mono">24:59</div>
                                        </div>
                                    </div>
                                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                        <div className="h-full w-[80%] bg-primary" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid - FIX: Improved Card Visibility */}
            <section className="py-24 px-6 relative z-10">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">Designed for the <span className="text-primary">Flow State</span></h2>
                        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Most tools distract you. Flowday is designed to disappear so you can do your best work.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                        <FeatureCard
                            icon={<Zap className="text-primary" size={24} />}
                            title="Immersive Focus"
                            description="Block out distractions with a single click. Fullscreen mode, ambient soundscapes, and breathing timers."
                        />
                        <FeatureCard
                            icon={<Shield className="text-primary" size={24} />}
                            title="Ritual Based"
                            description="Start every day with intention. The Morning Ritual forces you to prioritize before you dive in."
                        />
                        <FeatureCard
                            icon={<CircleCheck className="text-primary" size={24} />}
                            title="Instant Feedback"
                            description="Optimistic UI means zero latency. Interact with your tasks as fast as you can think."
                        />
                    </div>
                </div>
            </section>

            {/* NEW SECTION: How it Works (Steps) */}
            <section className="py-32 px-6 relative z-10 overflow-hidden border-t border-border bg-background">
                {/* Background Glow for this section */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 blur-[150px] rounded-full pointer-events-none" />

                <div className="max-w-6xl mx-auto relative">
                    <div className="text-center mb-20">
                        <h2 className="text-3xl md:text-5xl font-bold mb-6 text-foreground">Your path to <span className="text-primary">Peak Performance</span></h2>
                        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">A simple, science-backed workflow to regain control of your time.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                        {/* Connecting Line (Desktop only) */}
                        <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent z-0" />

                        {/* Step 1 */}
                        <div className="relative z-10 flex flex-col items-center text-center group">
                            <div className="w-24 h-24 rounded-3xl bg-card border border-border flex items-center justify-center mb-8 shadow-2xl shadow-primary/5 group-hover:border-primary/50 group-hover:scale-105 transition-all duration-300">
                                <Brain className="text-primary" size={32} />
                                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-border border border-background flex items-center justify-center text-sm font-bold text-foreground">1</div>
                            </div>
                            <h3 className="text-xl font-bold text-foreground mb-3">Capture Everything</h3>
                            <p className="text-muted-foreground leading-relaxed text-sm">Clear your mind. Dump every task, idea, and worry into the inbox so you don't forget.</p>
                        </div>

                        {/* Step 2 */}
                        <div className="relative z-10 flex flex-col items-center text-center group">
                            <div className="w-24 h-24 rounded-3xl bg-card border border-border flex items-center justify-center mb-8 shadow-2xl shadow-primary/5 group-hover:border-primary/50 group-hover:scale-105 transition-all duration-300">
                                <Coffee className="text-primary" size={32} />
                                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-border border border-background flex items-center justify-center text-sm font-bold text-foreground">2</div>
                            </div>
                            <h3 className="text-xl font-bold text-foreground mb-3">Set Daily Intentions</h3>
                            <p className="text-muted-foreground leading-relaxed text-sm">Don't just start working. Use the Morning Ritual to pick the 1-3 things that actually matter.</p>
                        </div>

                        {/* Step 3 */}
                        <div className="relative z-10 flex flex-col items-center text-center group">
                            <div className="w-24 h-24 rounded-3xl bg-card border border-border flex items-center justify-center mb-8 shadow-2xl shadow-primary/5 group-hover:border-primary/50 group-hover:scale-105 transition-all duration-300">
                                <LayoutDashboard className="text-primary" size={32} />
                                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-border border border-background flex items-center justify-center text-sm font-bold text-foreground">3</div>
                            </div>
                            <h3 className="text-xl font-bold text-foreground mb-3">Enter Deep Work</h3>
                            <p className="text-muted-foreground leading-relaxed text-sm">Go fullscreen. Block distractions. Flowday manages the timer so you can manage your focus.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-24 px-6 border-t border-border bg-background">
                <div className="max-w-4xl mx-auto text-center p-12 rounded-3xl bg-gradient-to-b from-card to-background border border-border relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-primary/5 pointer-events-none" />

                    <h2 className="text-3xl md:text-4xl font-bold mb-6 relative z-10 text-foreground">Ready to find your flow?</h2>
                    <p className="text-muted-foreground mb-8 max-w-xl mx-auto relative z-10">Join thousands of developers and creators who use Flowday to reclaim their attention.</p>

                    <button
                        onClick={() => navigate('/app/v1/register')}
                        onMouseEnter={() => prefetchRoute('/app/v1/register')}
                        className="relative z-10 px-8 py-3 bg-primary text-primary-foreground hover:opacity-90 font-semibold rounded-full transition-colors duration-200"
                    >
                        Get Started for Free
                    </button>
                </div>
            </section>
        </div>
    );
}

// FIX: Updated FeatureCard to have visible background and borders
function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <div className="p-8 rounded-2xl border border-border bg-card/40 backdrop-blur-sm hover:bg-card/60 hover:border-primary/30 transition-all duration-300 group hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5">
            <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center mb-6 group-hover:bg-primary/10 group-hover:text-primary transition-colors duration-300">
                {icon}
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-3">{title}</h3>
            <p className="text-muted-foreground leading-relaxed text-sm">{description}</p>
        </div>
    );
}