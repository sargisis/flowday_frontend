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
            const from = location.state?.from?.pathname || "/app/v1/dashboard";
            navigate(from);
        } catch (error: any) {
            alert(error.response?.data?.error || "Login failed. Please check your credentials.");
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 bg-background">
            <form onSubmit={handleSubmit} className="card w-full max-w-md">
                <h1 className="text-center text-3xl font-bold mb-8 font-outfit">Welcome Back</h1>

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

                <div className="text-right -mt-4 mb-6">
                    <Link to="/app/v1/forgot-password" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                        Forgot Password?
                    </Link>
                </div>

                <button type="submit" className="btn w-full">
                    Sign In
                </button>

                <p className="text-center mt-6 text-muted-foreground">
                    Don't have an account?{' '}
                    <Link to="/app/v1/register" className="font-medium text-foreground hover:underline">Create one</Link>
                </p>
            </form>
        </div>
    );
}
