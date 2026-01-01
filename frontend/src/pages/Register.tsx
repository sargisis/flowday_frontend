import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../api/auth";
import { toast } from "sonner";
import { z } from "zod";
import { User, Mail, Lock, ArrowRight, ShieldCheck, Hexagon } from "lucide-react";

const registerSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});



export default function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState<Record<string, string>>({});
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        const result = registerSchema.safeParse({ name, email, password });
        if (!result.success) {
            const newErrors: Record<string, string> = {};
            result.error.issues.forEach(issue => {
                const path = issue.path[0] as string;
                newErrors[path] = issue.message;
            });
            setErrors(newErrors);
            toast.error("Please refine your mission details");
            return;
        }

        try {
            await register(name, email, password);
            toast.success("Account verified. Welcome to the elite.");
            navigate("/app/v1/login");
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Registration aborted");
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-6 bg-zinc-950 relative overflow-hidden auth-mesh-bg">
            {/* Ambient Glows */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full -ml-32 -mt-32" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full -mr-32 -mb-32" />

            <div className="w-full max-w-[460px] relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                <div className="flex flex-col items-center mb-10">
                    <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center border border-white/10 shadow-2xl mb-6 group transition-all duration-500 hover:scale-110 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <Hexagon className="text-blue-400 logo-animate relative z-10" size={40} strokeWidth={1.5} />
                    </div>
                    <h1 className="text-4xl font-bold text-white tracking-tight font-outfit">Join the Flow</h1>
                    <p className="text-zinc-500 mt-2 font-medium">Initialize your performance workspace</p>
                </div>

                <form onSubmit={handleSubmit} className="glass-auth-card p-10 space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Identity</label>
                        <div className="relative group">
                            <User className="absolute left-5 top-[50%] -translate-y-[50%] text-zinc-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                            <input
                                className={`premium-input w-full ${errors.name ? 'border-rose-500/50 bg-rose-500/5' : ''}`}
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        {errors.name && <p className="text-xs text-rose-500 mt-1 ml-1 font-medium">{errors.name}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Neural Bridge (Email)</label>
                        <div className="relative group">
                            <Mail className="absolute left-5 top-[50%] -translate-y-[50%] text-zinc-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                            <input
                                className={`premium-input w-full ${errors.email ? 'border-rose-500/50 bg-rose-500/5' : ''}`}
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        {errors.email && <p className="text-xs text-rose-500 mt-1 ml-1 font-medium">{errors.email}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Access Key</label>
                        <div className="relative group">
                            <Lock className="absolute left-5 top-[50%] -translate-y-[50%] text-zinc-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                            <input
                                className={`premium-input w-full ${errors.password ? 'border-rose-500/50 bg-rose-500/5' : ''}`}
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        {errors.password && <p className="text-xs text-rose-500 mt-1 ml-1 font-medium">{errors.password}</p>}
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                        <div className="mt-0.5">
                            <ShieldCheck className="text-emerald-500" size={16} />
                        </div>
                        <p className="text-[10px] text-zinc-500 leading-relaxed font-medium uppercase tracking-wider">
                            By initializing, you agree to the <span className="text-zinc-400">Tactical Terms of Service</span> and <span className="text-zinc-400">Privacy Protocol</span>.
                        </p>
                    </div>

                    <button type="submit" className="premium-btn w-full flex items-center justify-center gap-2 group">
                        Initialize Access
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>

                    <div className="pt-4 text-center">
                        <p className="text-zinc-500 text-sm font-medium">
                            Already part of the fleet?{' '}
                            <Link to="/app/v1/login" className="text-white hover:text-indigo-400 underline underline-offset-4 decoration-zinc-700 transition-all">
                                Return to Base
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}
