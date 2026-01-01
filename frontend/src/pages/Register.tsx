import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../api/auth";

export default function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await register(name, email, password);
            navigate("/app/v1/login");
        } catch (error: any) {
            alert(error.response?.data?.error || "Registration failed");
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 bg-background">
            <form onSubmit={handleSubmit} className="card w-full max-w-md">
                <h1 className="text-center text-3xl font-bold mb-8 font-outfit">Create Account</h1>

                <div className="input-group">
                    <input
                        className="input-field"
                        placeholder="Full Name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>

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

                <button type="submit" className="btn w-full mt-4">
                    Register
                </button>

                <p className="text-center mt-6 text-muted-foreground">
                    Already have an account? <Link to="/app/v1/login" className="font-medium text-foreground hover:underline">Sign in</Link>
                </p>
            </form>
        </div>
    );
}
