import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            await api.post("/auth/forgot-password", { email });
            // Navigate to reset page with email pre-filled
            navigate("/app/v1/reset-password", { state: { email } });
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to send reset code. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 bg-background">
            <div className="card w-full max-w-md">
                <h2 className="text-center text-2xl font-bold mb-4 font-outfit">Forgot Password</h2>
                <p className="text-center text-muted-foreground mb-8">
                    Enter your email and we'll send you a code to reset your password.
                </p>

                {error && (
                    <div className="bg-destructive/10 text-destructive p-3 rounded-lg mb-6 text-center text-sm border border-destructive/20">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label className="block mb-2 text-sm font-medium text-foreground">Email Address</label>
                        <input
                            type="email"
                            className="input-field"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="btn w-full" disabled={isLoading}>
                        {isLoading ? "Sending Code..." : "Send Reset Code"}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm">
                    <Link to="/app/v1/login" className="text-muted-foreground hover:text-foreground transition-colors">
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
}
