import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { login } from "../api/auth";
import { Mail, Lock, ArrowRight, Hexagon } from "lucide-react";

import { toast } from "sonner";
import { z } from "zod";

const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
});



export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState<Record<string, string>>({});
    const navigate = useNavigate();
    const location = useLocation();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        const result = loginSchema.safeParse({ email, password });
        if (!result.success) {
            const newErrors: Record<string, string> = {};
            result.error.issues.forEach(issue => {
                const path = issue.path[0] as string;
                newErrors[path] = issue.message;
            });
            setErrors(newErrors);
            toast.error("Form validation failed");
            return;
        }

        try {
            const data = await login(email, password);
            localStorage.setItem("token", data.token);
            const from = location.state?.from?.pathname || "/app/v1/dashboard";
            navigate(from);
            toast.success("Welcome back to your Flow State!");
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Login failed");
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-6 bg-zinc-950 relative overflow-hidden auth-mesh-bg">
            {/* Ambient Glows */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full -mr-64 -mt-64" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/10 blur-[120px] rounded-full -ml-64 -mb-64" />

            <div className="w-full max-w-[440px] relative z-10 animate-in fade-in zoom-in-95 duration-700">
                <div className="flex flex-col items-center mb-10">
                    <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center border border-white/10 shadow-2xl mb-6 group transition-all duration-500 hover:scale-110 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <Hexagon className="text-indigo-400 logo-animate relative z-10" size={40} strokeWidth={1.5} />
                    </div>
                    <h1 className="text-4xl font-bold text-white tracking-tight font-outfit">Welcome Back</h1>
                    <p className="text-zinc-500 mt-2 font-medium">Continue your focus journey</p>
                </div>

                <form onSubmit={handleSubmit} className="glass-auth-card p-10 space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Email Address</label>
                        <div className="relative group">
                            <Mail className="absolute left-5 top-[50%] -translate-y-[50%] text-zinc-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                            <input
                                className={`premium-input w-full ${errors.email ? 'border-rose-500/50 bg-rose-500/5' : ''}`}
                                placeholder=""
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        {errors.email && <p className="text-xs text-rose-500 mt-1 ml-1 font-medium">{errors.email}</p>}
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center ml-1">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Password</label>
                            <Link to="/app/v1/forgot-password" className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
                                Forgot password?
                            </Link>
                        </div>
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

                    <button type="submit" className="premium-btn w-full flex items-center justify-center gap-2 group">
                        Sign In
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>

                    <div className="pt-4 text-center">
                        <p className="text-zinc-500 text-sm font-medium">
                            Don't have an account?{' '}
                            <Link to="/app/v1/register" className="text-white hover:text-indigo-400 underline underline-offset-4 decoration-zinc-700 transition-all">
                                Create one for free
                            </Link>
                        </p>
                    </div>
                </form>

                <p className="text-center mt-10 text-[10px] text-zinc-600 uppercase tracking-[0.2em] font-bold">
                    Secure 256-bit encryption • Flowday OS
                </p>
            </div>
        </div>
    );
}
