import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../api/auth";
import { toast } from "sonner";
import { z } from "zod";

const registerSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate input
        const result = registerSchema.safeParse({ name, email, password });
        if (!result.success) {
            const errorMsg = result.error.issues[0].message;
            toast.error(errorMsg);
            return;
        }

        try {
            await register(name, email, password);
            toast.success("Registration successful! Please login.");
            navigate("/app/v1/login");
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Registration failed");
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
