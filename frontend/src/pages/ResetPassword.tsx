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
        <div className="container" style={{ alignItems: 'center', justifyContent: 'center' }}>
            <div className="card" style={{ width: "100%", maxWidth: "400px" }}>
                <h2 style={{ textAlign: "center", marginBottom: "1rem" }}>Reset Password</h2>
                <p style={{ textAlign: "center", color: "var(--text-muted)", marginBottom: "2rem" }}>
                    Check your email (and server logs) for the code.
                </p>

                {error && (
                    <div style={{
                        background: "rgba(231, 76, 60, 0.1)",
                        color: "#e74c3c",
                        padding: "0.75rem",
                        borderRadius: "8px",
                        marginBottom: "1rem",
                        textAlign: "center"
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div>
                        <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem" }}>Email Address</label>
                        <input
                            type="email"
                            className="input-field"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="you@example.com"
                            style={{ width: "100%" }}
                        />
                    </div>

                    <div>
                        <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem" }}>Confirmation Code</label>
                        <input
                            type="text"
                            className="input-field"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            required
                            placeholder="123456"
                            style={{ width: "100%", letterSpacing: "2px", textAlign: "center" }}
                        />
                    </div>

                    <div>
                        <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem" }}>New Password</label>
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

                    <div>
                        <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem" }}>Confirm Password</label>
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

                    <button type="submit" className="btn btn-primary" disabled={isLoading}>
                        {isLoading ? "Resetting..." : "Reset Password"}
                    </button>
                </form>

                <div style={{ marginTop: "1.5rem", textAlign: "center", fontSize: "0.9rem" }}>
                    <Link to="/app/v1/login" style={{ color: "var(--text-muted)", textDecoration: "none" }}>
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
}
