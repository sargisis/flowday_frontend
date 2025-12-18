import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { login } from "../api/auth";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const location = useLocation();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const data = await login(email, password);
            localStorage.setItem("token", data.token);

            // Redirect to the page they were trying to access, or dashboard
            const from = (location.state as any)?.from?.pathname || "/app/v1/dashboard";
            navigate(from, { replace: true });
        } catch (error: any) {
            alert(error.response?.data?.error || "Login failed. Please check your credentials.");
        }
    };

    return (
        <div className="container" style={{ alignItems: 'center', justifyContent: 'center' }}>
            <form onSubmit={handleSubmit} className="card" style={{ width: '100%', maxWidth: '400px' }}>
                <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>Welcome Back</h1>

                <div className="input-group">
                    <input
                        className="input-field"
                        placeholder="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                <div className="input-group">
                    <input
                        className="input-field"
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                <div style={{ textAlign: "right", marginTop: "-1rem", marginBottom: "1.5rem" }}>
                    <Link to="/app/v1/forgot-password" style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                        Forgot Password?
                    </Link>
                </div>

                <button type="submit" className="btn" style={{ width: '100%' }}>
                    Sign In
                </button>

                <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-muted)' }}>
                    Don't have an account?{' '}
                    <Link to="/app/v1/register" style={{ fontWeight: 500 }}>Create one</Link>
                </p>
            </form>
        </div>
    );
}
