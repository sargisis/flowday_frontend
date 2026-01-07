import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getMe } from "../api/auth";

interface User {
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
}

interface UserContextType {
    user: User | null;
    loading: boolean;
    reloadUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const reloadUser = async () => {
        try {
            const userData = await getMe();
            setUser(userData);
        } catch (err) {
            console.error("Failed to fetch user", err);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        reloadUser();
    }, []);

    return (
        <UserContext.Provider value={{ user, loading, reloadUser }}>
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
