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
        <div style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem"
        }}>
            <div className="card" style={{ width: "100%", maxWidth: "400px" }}>
                <h2 style={{ textAlign: "center", marginBottom: "1rem" }}>Forgot Password</h2>
                <p style={{ textAlign: "center", color: "var(--text-muted)", marginBottom: "2rem" }}>
                    Enter your email and we'll send you a code to reset your password.
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
                            style={{ width: "100%" }}
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={isLoading}>
                        {isLoading ? "Sending Code..." : "Send Reset Code"}
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
