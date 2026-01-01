import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { forgotPassword } from "../api/auth";
import { toast } from "sonner";
import { Mail, ArrowRight, Hexagon } from "lucide-react";
import { z } from "zod";

const forgotSchema = z.object({
    email: z.string().email("Invalid email address"),
});

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        // Validate
        const result = forgotSchema.safeParse({ email });
        if (!result.success) {
            const newErrors: Record<string, string> = {};
            result.error.issues.forEach(issue => {
                const path = issue.path[0] as string;
                newErrors[path] = issue.message;
            });
            setErrors(newErrors);
            toast.error("Invalid email format");
            return;
        }

        setIsLoading(true);

        try {
            await forgotPassword(email);
            toast.success("Security code dispatched to your inbox");
            navigate("/app/v1/reset-password", { state: { email } });
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Tactical error: Could not send reset code.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-6 bg-zinc-950 relative overflow-hidden auth-mesh-bg">
            {/* Ambient Glows */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full -mr-64 -mt-64" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/10 blur-[120px] rounded-full -ml-64 -mb-64" />

            <div className="w-full max-w-[440px] relative z-10 animate-in fade-in zoom-in-95 duration-700">
                <div className="flex flex-col items-center mb-10">
                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 shadow-2xl mb-6 group transition-all duration-500 hover:scale-110">
                        <Hexagon className="text-zinc-400 group-hover:text-indigo-400 logo-animate transition-colors" size={32} strokeWidth={1.5} />
                    </div>
                    <h1 className="text-4xl font-bold text-white tracking-tight font-outfit">Reset Access</h1>
                    <p className="text-zinc-500 mt-2 font-medium text-center">We'll send a neural link to verify your identity</p>
                </div>

                <form onSubmit={handleSubmit} className="glass-auth-card p-10 space-y-8">
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

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="premium-btn w-full flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                Dispatch Security Code
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>

                    <div className="pt-2 text-center">
                        <Link to="/app/v1/login" className="text-zinc-500 hover:text-white text-sm font-medium transition-colors inline-flex items-center gap-2 group">
                            Return to Base
                        </Link>
                    </div>
                </form>

                <p className="text-center mt-10 text-[10px] text-zinc-600 uppercase tracking-[0.2em] font-bold">
                    Secure Neural Link Protocol • Flowday OS
                </p>
            </div>
        </div>
    );
}
