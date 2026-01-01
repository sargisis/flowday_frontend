import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { notificationManager } from "../utils/notificationManager";

interface FocusContextType {
    isActive: boolean;
    timeLeft: number;
    taskTitle: string | null;
    startSession: (title?: string, duration?: number) => void;
    pauseSession: () => void;
    resumeSession: () => void;
    resetSession: () => void;
}

const FocusContext = createContext<FocusContextType | undefined>(undefined);

export function FocusProvider({ children }: { children: ReactNode }) {
    const [isActive, setIsActive] = useState(false);
    const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes default
    const [taskTitle, setTaskTitle] = useState<string | null>(null);

    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && isActive) {
            setIsActive(false);
            // Notify user that Focus session is complete
            notificationManager.notifyFocusComplete('25 minutes');
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    const startSession = (title?: string, duration: number = 25 * 60) => {
        setTaskTitle(title || null);
        setTimeLeft(duration);
        setIsActive(true);
    };

    const pauseSession = () => {
        setIsActive(false);
    };

    const resumeSession = () => {
        setIsActive(true);
    };

    const resetSession = () => {
        setIsActive(false);
        setTimeLeft(25 * 60);
        setTaskTitle(null);
    };

    return (
        <FocusContext.Provider
            value={{
                isActive,
                timeLeft,
                taskTitle,
                startSession,
                pauseSession,
                resumeSession,
                resetSession,
            }}
        >
            {children}
        </FocusContext.Provider>
    );
}

export function useFocus() {
    const context = useContext(FocusContext);
    if (!context) {
        throw new Error("useFocus must be used within FocusProvider");
    }
    return context;
}
