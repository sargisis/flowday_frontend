import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { resetPassword } from "../api/auth";
import { toast } from "sonner";
import { Lock, Mail, ArrowRight, ShieldCheck, KeyRound, Hexagon } from "lucide-react";
import { z } from "zod";

const resetSchema = z.object({
    code: z.string().min(3, "Security code must be at least 3 characters"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
});

export default function ResetPassword() {
    const location = useLocation();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [step, setStep] = useState(1);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (location.state?.email) {
            setEmail(location.state.email);
        } else {
            // If direct access without email in state, return to base
            navigate("/app/v1/forgot-password");
        }
    }, [location, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        if (newPassword !== confirmPassword) {
            toast.error("Password verification mismatch");
            return;
        }

        const validation = resetSchema.safeParse({ code, newPassword });
        if (!validation.success) {
            const newErrors: Record<string, string> = {};
            validation.error.issues.forEach(issue => {
                const path = issue.path[0] as string;
                newErrors[path] = issue.message;
            });
            setErrors(newErrors);
            toast.error("Validation failed");
            return;
        }

        setIsLoading(true);

        try {
            await resetPassword(email, code, newPassword);
            setSuccess(true);
            toast.success("Identity verified. Password updated.");
            setTimeout(() => {
                navigate("/app/v1/login");
            }, 2500);
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Neural link broken: Reset failed.");
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center p-6 bg-zinc-950 relative overflow-hidden auth-mesh-bg">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-600/10 blur-[120px] rounded-full -mr-64 -mt-64" />
                <div className="w-full max-w-[440px] relative z-10 text-center animate-in fade-in zoom-in-95 duration-700">
                    <div className="w-20 h-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center border border-emerald-500/20 shadow-2xl mx-auto mb-8 animate-bounce">
                        <ShieldCheck className="text-emerald-400" size={40} />
                    </div>
                    <h1 className="text-4xl font-bold text-white tracking-tight font-outfit mb-4">Reset Complete</h1>
                    <p className="text-zinc-500 font-medium mb-10">Your security credentials have been rotated. Returning to base...</p>
                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 animate-[progress_2.5s_ease-in-out]" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-6 bg-zinc-950 relative overflow-hidden auth-mesh-bg">
            {/* Ambient Glows */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full -ml-64 -mt-64" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-600/10 blur-[120px] rounded-full -mr-64 -mb-64" />

            <div className="w-full max-w-[460px] relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                <div className="flex flex-col items-center mb-10">
                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 shadow-2xl mb-6 group transition-all duration-500 hover:scale-110">
                        <Hexagon className="text-zinc-400 group-hover:text-amber-400 logo-animate transition-colors" size={32} strokeWidth={1.5} />
                    </div>
                    <h1 className="text-4xl font-bold text-white tracking-tight font-outfit">Secure Reset</h1>
                    <p className="text-zinc-500 mt-2 font-medium text-center">Verify the neural code to set new credentials</p>
                </div>

                <form onSubmit={handleSubmit} className="glass-auth-card p-10 space-y-6">
                    {/* Read-only Identity Field */}
                    <div className="space-y-2 opacity-60">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Identity (Verified)</label>
                        <div className="relative">
                            <Mail className="absolute left-5 top-[50%] -translate-y-[50%] text-zinc-500" size={18} />
                            <div className="premium-input w-full bg-white/[0.02] border-white/5 cursor-not-allowed">
                                {email || "Awaiting signal..."}
                            </div>
                        </div>
                    </div>

                    {step === 1 ? (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Security Code</label>
                                <div className="relative group">
                                    <KeyRound className="absolute left-5 top-[50%] -translate-y-[50%] text-zinc-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                                    <input
                                        className={`premium-input w-full text-center tracking-[0.5em] text-xl font-bold uppercase ${errors.code ? 'border-rose-500/50 bg-rose-500/5' : ''}`}
                                        type="text"
                                        placeholder=""
                                        maxLength={10}
                                        value={code}
                                        onChange={(e) => setCode(e.target.value)}
                                    />
                                </div>
                                {errors.code && <p className="text-xs text-rose-500 mt-1 ml-1 font-medium">{errors.code}</p>}
                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    if (code.length < 3) {
                                        toast.error("Code too short for verification");
                                        return;
                                    }
                                    setStep(2);
                                }}
                                className="premium-btn w-full flex items-center justify-center gap-2 group"
                            >
                                Verify Identity
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">New Access Key</label>
                                <div className="relative group">
                                    <Lock className="absolute left-5 top-[50%] -translate-y-[50%] text-zinc-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                                    <input
                                        className={`premium-input w-full ${errors.newPassword ? 'border-rose-500/50 bg-rose-500/5' : ''}`}
                                        type="password"
                                        placeholder=""
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                    />
                                </div>
                                {errors.newPassword && <p className="text-xs text-rose-500 mt-1 ml-1 font-medium">{errors.newPassword}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Confirm Access Key</label>
                                <div className="relative group">
                                    <Lock className="absolute left-5 top-[50%] -translate-y-[50%] text-zinc-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                                    <input
                                        className="premium-input w-full"
                                        type="password"
                                        placeholder=""
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="px-6 py-4 rounded-2xl border border-white/5 bg-white/[0.02] text-zinc-400 font-bold text-xs uppercase tracking-widest hover:bg-white/[0.05] transition-colors"
                                >
                                    Back
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="premium-btn flex-1 flex items-center justify-center gap-2 group disabled:opacity-50"
                                >
                                    {isLoading ? (
                                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            Reset Credentials
                                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="pt-2 text-center">
                        <Link to="/app/v1/login" className="text-zinc-500 hover:text-white text-sm font-medium transition-colors inline-flex items-center gap-2 group">
                            Return to Base
                        </Link>
                    </div>
                </form>

                <p className="text-center mt-10 text-[10px] text-zinc-600 uppercase tracking-[0.2em] font-bold">
                    Security Protocol Alpha-9 • Flowday OS
                </p>
            </div>
        </div>
    );
}
