import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { notificationManager } from "../utils/notificationManager";
import api from "../api/axios";
import { useUser } from "./UserContext";

interface FocusContextType {
    isActive: boolean;
    timeLeft: number;
    taskTitle: string | null;
    taskId: string | null;
    duration: number; // original duration in seconds
    startSession: (title?: string, duration?: number, taskId?: string) => void;
    pauseSession: () => void;
    resumeSession: () => void;
    resetSession: () => void;
}

const FocusContext = createContext<FocusContextType | undefined>(undefined);

export function FocusProvider({ children }: { children: ReactNode }) {
    const { reloadUser } = useUser();
    const [isActive, setIsActive] = useState(false);
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [duration, setDuration] = useState(25 * 60);
    const [taskTitle, setTaskTitle] = useState<string | null>(null);
    const [taskId, setTaskId] = useState<string | null>(null);

    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && isActive) {
            handleSessionComplete();
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    const handleSessionComplete = async () => {
        setIsActive(false);
        notificationManager.notifyFocusComplete(`${duration / 60} minutes`);

        try {
            await api.post('/focus/sessions', {
                task_id: taskId,
                task_title: taskTitle || "Deep Work Session",
                duration: Math.round(duration / 60)
            });
            reloadUser(); // Update XP/Level
        } catch (err) {
            console.error("Failed to save focus session", err);
        }
    };

    const startSession = (title?: string, sessionDuration: number = 25 * 60, tid?: string) => {
        setTaskTitle(title || null);
        setTaskId(tid || null);
        setDuration(sessionDuration);
        setTimeLeft(sessionDuration);
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
                taskId,
                duration,
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
