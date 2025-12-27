import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register, login } from "../api/auth";

export default function Register() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await register(email, password);
            navigate("/app/v1/login");
        } catch (error: any) {
            alert(error.response?.data?.error || "Registration failed");
        }
    };

    return (
        <div className="container" style={{ alignItems: 'center', justifyContent: 'center' }}>
            <form onSubmit={handleSubmit} className="card" style={{ width: '100%', maxWidth: '400px' }}>
                <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>Create Account</h1>

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

                <button type="submit" className="btn" style={{ width: '100%' }}>
                    Register
                </button>

                <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-muted)' }}>
                    Already have an account? <Link to="/app/v1/login" style={{ fontWeight: 500 }}>Sign in</Link>
                </p>
            </form>
        </div>
    );
}
