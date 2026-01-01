import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function ResetPassword() {
    const location = useLocation();
    const navigate = useNavigate();

    // Get email from previous page navigation state
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [step, setStep] = useState(1);

    useEffect(() => {
        if (location.state?.email) {
            setEmail(location.state.email);
        }
    }, [location]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (newPassword.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setIsLoading(true);

        try {
            await api.post("/auth/reset-password", {
                email,
                code,
                new_password: newPassword
            });
            setSuccess(true);
            setTimeout(() => {
                navigate("/app/v1/login");
            }, 2000);
        } catch (err: any) {
            setError(err.response?.data?.error || "Failed to reset password. Code may be invalid or expired.");
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="container" style={{ alignItems: 'center', justifyContent: 'center' }}>
                <div className="card" style={{ width: "100%", maxWidth: "400px", textAlign: "center" }}>
                    <div style={{ color: "var(--status-done)", fontSize: "3rem", marginBottom: "1rem" }}>✓</div>
                    <h2>Password Reset!</h2>
                    <p style={{ color: "var(--text-muted)", marginBottom: "2rem" }}>
                        Your password has been successfully updated. Redirecting to login...
                    </p>
                    <Link to="/app/v1/login" className="btn btn-primary" style={{ display: "inline-block", width: "100%" }}>
                        Go to Login Now
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            background: "radial-gradient(circle at 50% 10%, rgba(249, 115, 22, 0.05), transparent 40%)"
        }}>
            <div className="card" style={{ width: "100%", maxWidth: "420px", padding: "2.5rem", position: "relative", overflow: "hidden" }}>
                {/* Decorative glow */}
                <div style={{ position: "absolute", top: "-50%", left: "-50%", width: "200%", height: "200%", background: "radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 60%)", pointerEvents: "none" }} />

                <h2 style={{ textAlign: "center", marginBottom: "0.5rem", fontSize: "1.75rem", fontWeight: "600" }}>Secure Reset</h2>
                <p style={{ textAlign: "center", color: "var(--text-muted)", marginBottom: "2rem", fontSize: "0.95rem" }}>
                    Enter the code sent to your email and set a new password.
                </p>

                {error && (
                    <div style={{
                        background: "rgba(231, 76, 60, 0.1)",
                        border: "1px solid rgba(231, 76, 60, 0.2)",
                        color: "#ff6b6b",
                        padding: "0.75rem",
                        borderRadius: "12px",
                        marginBottom: "1.5rem",
                        textAlign: "center",
                        fontSize: "0.9rem"
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                    {/* Read-only Email Field */}
                    <div style={{ opacity: 0.7 }}>
                        <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.85rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Email Address</label>
                        <div style={{
                            padding: "0.75rem 1rem",
                            background: "rgba(255,255,255,0.03)",
                            borderRadius: "10px",
                            border: "1px solid rgba(255,255,255,0.05)",
                            color: "var(--text-muted)",
                            fontSize: "0.95rem",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem"
                        }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                            {email || "No email provided"}
                        </div>
                    </div>

                    {/* Step 1: Verification Code */}
                    {step === 1 && (
                        <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">
                            <div>
                                <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.85rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Security Code</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    required
                                    style={{
                                        width: "100%",
                                        letterSpacing: "0.25em",
                                        textAlign: "center",
                                        fontSize: "1.5rem",
                                        fontWeight: "600",
                                        padding: "1rem"
                                    }}
                                />
                            </div>
                            <div style={{ marginTop: "1.5rem" }}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (code.length < 3) {
                                            setError("Please enter a valid code");
                                            return;
                                        }
                                        setError("");
                                        setStep(2);
                                    }}
                                    className="btn btn-primary"
                                    style={{ width: "100%", padding: "0.875rem", fontSize: "1rem" }}
                                >
                                    Verify Code
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 2: New Password */}
                    {step === 2 && (
                        <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">

                            <div style={{ height: "1px", background: "rgba(255,255,255,0.1)", margin: "0 0" }} />

                            <div>
                                <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.85rem", color: "var(--text-muted)" }}>New Password</label>
                                <input
                                    type="password"
                                    className="input-field"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    placeholder="Minimum 6 characters"
                                    style={{ width: "100%" }}
                                />
                            </div>

                            <div style={{ marginTop: "1rem" }}>
                                <input
                                    type="password"
                                    className="input-field"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    placeholder="Confirm new password"
                                    style={{ width: "100%" }}
                                />
                            </div>

                            <div className="flex gap-3" style={{ marginTop: "2.5rem" }}>
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="btn"
                                    style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.1)", width: "30%" }}
                                >
                                    Back
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={isLoading}
                                    style={{ width: "70%", padding: "0.875rem", fontSize: "1rem" }}
                                >
                                    {isLoading ? "Updating..." : "Reset Password"}
                                </button>
                            </div>
                        </div>
                    )}
                </form>

                <div style={{ marginTop: "2rem", textAlign: "center" }}>
                    <Link to="/app/v1/login" style={{ fontSize: "0.9rem", color: "var(--text-muted)", textDecoration: "none", transition: "color 0.2s" }} onMouseOver={(e) => e.currentTarget.style.color = "white"} onMouseOut={(e) => e.currentTarget.style.color = "var(--text-muted)"}>
                        ← Return to Login
                    </Link>
                </div>
            </div>
        </div>
    );

}
