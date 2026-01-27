import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getMe } from "../api/auth";
import { useNavigate } from "react-router-dom";
import { useWebSocketContext } from "./WebSocketContext";

// User Interface Definition
export interface User {
    id: string;
    name: string;
    email: string;
    bio?: string;
    avatar_url?: string;
    workspace_name?: string;
    status?: string;
    velocity?: number;
    xp?: number;
    level?: number;
    plan?: 'free' | 'pro';
    ai_quota_used?: number;
    email_notifications?: boolean;
    slack_webhook_url?: string;
    slack_team_id?: string;
    slack_team_name?: string;
    slack_user_id?: string;
    slack_channel_id?: string;
    slack_connected?: boolean;
}

interface UserContextType {
    user: User | null;
    loading: boolean;
    reloadUser: () => Promise<void>;
    logout: () => void;
}

// Custom event for auth failures (fired from axios interceptor)
export const AUTH_LOGOUT_EVENT = 'auth:logout';

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const reloadUser = async () => {
        try {
            const userData = await getMe();
            setUser(userData);
            setLoading(false);
        } catch (err: any) {
            // Don't clear user on 401 - axios interceptor will handle token refresh
            // Only log error without resetting user to prevent UI flicker
            if (err?.response?.status !== 401) {
                console.error("Failed to fetch user", err);
            }
            // Don't set user to null on error - keep existing user data
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
        navigate("/app/v1/login", { replace: true });
    };

    // Listen for logout events from axios interceptor
    useEffect(() => {
        const handleAuthLogout = () => {
            logout();
        };

        window.addEventListener(AUTH_LOGOUT_EVENT, handleAuthLogout);
        return () => window.removeEventListener(AUTH_LOGOUT_EVENT, handleAuthLogout);
    }, [navigate]);

    // Listen for real-time user updates
    const { subscribe } = useWebSocketContext();

    useEffect(() => {
        const unsubscribe = subscribe('user_update', (message) => {
            console.log('User update received:', message);
            // Optionally merge optimistic updates here, but reloading is safer
            reloadUser();

            // Show toast if plan updated
            if (message.payload?.plan === 'pro') {
                // We can import toast from sonner if we want to notify
                // toast.success("You are now a PRO member! 🎉");
            }
        });

        return () => {
            unsubscribe();
        };
    }, [subscribe]);

    useEffect(() => {
        reloadUser();
    }, []);

    return (
        <UserContext.Provider value={{ user, loading, reloadUser, logout }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
}
