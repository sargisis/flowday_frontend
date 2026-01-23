import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

type Theme = "dark";

interface ThemeContextType {
    theme: Theme;
    compactView: boolean;
    setCompactView: (compact: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
    // Always use dark theme
    const theme: Theme = "dark";

    const [compactView, setCompactViewState] = useState<boolean>(() => {
        const saved = localStorage.getItem("compactView");
        return saved === "true";
    });

    // Always apply dark theme
    useEffect(() => {
        const root = document.documentElement;
        root.classList.remove("light");
        root.classList.add("dark");
    }, []);

    // Initialize compact view on mount
    useEffect(() => {
        const root = document.documentElement;
        if (compactView) {
            root.classList.add("compact-view");
        } else {
            root.classList.remove("compact-view");
        }
    }, []);

    useEffect(() => {
        const root = document.documentElement;
        if (compactView) {
            root.classList.add("compact-view");
        } else {
            root.classList.remove("compact-view");
        }
        localStorage.setItem("compactView", String(compactView));
    }, [compactView]);

    const setCompactView = (compact: boolean) => {
        setCompactViewState(compact);
    };

    return (
        <ThemeContext.Provider value={{ theme, compactView, setCompactView }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
}
