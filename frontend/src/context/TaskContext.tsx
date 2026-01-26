import React, { createContext, useContext, useState, useCallback } from "react";
import { type Task, createTask as apiCreateTask, updateTask as apiUpdateTask, deleteTask as apiDeleteTask, decomposeTask as apiDecomposeTask, enrichTask as apiEnrichTask } from "../api/tasks";
import { useProject } from "./ProjectContext";
import { useUser } from "./UserContext";

interface TaskContextType {
    // State
    isCreateModalOpen: boolean;
    initialDate: string | undefined; // Added
    selectedTask: Task | null;

    // Actions
    openCreateModal: (initialDate?: string) => void;
    closeCreateModal: () => void;
    openDetailsModal: (task: Task) => void;
    closeDetailsModal: () => void;

    // CRUD Handlers
    handleCreateTask: (title: string, priority: string, dueDate?: string) => Promise<void>;
    handleUpdateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
    handleDeleteTask: (taskId: string) => Promise<void>;
    handleDecomposeTask: (taskId: string) => Promise<void>;
    handleEnrichTask: (taskId: string) => Promise<{ description: string; subtasks?: Task['subtasks'] } | string>;
    refreshTrigger: number;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: React.ReactNode }) {
    const { activeProjectId } = useProject();
    const { reloadUser } = useUser();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [initialDate, setInitialDate] = useState<string | undefined>(undefined);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const triggerRefresh = () => setRefreshTrigger(prev => prev + 1);

    const openCreateModal = useCallback((date?: string) => {
        setInitialDate(date);
        setIsCreateModalOpen(true);
    }, []);

    const closeCreateModal = useCallback(() => {
        setIsCreateModalOpen(false);
        setInitialDate(undefined);
    }, []);

    const openDetailsModal = useCallback((task: Task) => {
        setSelectedTask(task);
    }, []);

    const closeDetailsModal = useCallback(() => {
        setSelectedTask(null);
    }, []);

    const handleCreateTask = useCallback(async (title: string, priority: string, dueDate?: string) => {
        if (!activeProjectId) return;
        try {
            await apiCreateTask({
                title,
                priority,
                project_id: activeProjectId,
                due_date: dueDate ? new Date(dueDate).toISOString() : null
            });
            triggerRefresh();
        } catch (error) {
            console.error("Task creation failed", error);
            throw error;
        }
    }, [activeProjectId]);

    const handleUpdateTask = useCallback(async (taskId: string, updates: Partial<Task>) => {
        try {
            await apiUpdateTask(taskId, updates);
            triggerRefresh();

            // Update selected task if it's the one being updated
            if (selectedTask?.id === taskId) {
                setSelectedTask(prev => prev ? { ...prev, ...updates } : null);
            }

            // If task was completed, refresh user to update XP/Level
            if (updates.status?.toLowerCase() === 'done') {
                try {
                    await reloadUser();
                } catch (err) {
                    console.warn("Failed to reload user after task completion, retrying...", err);
                    setTimeout(() => {
                        reloadUser().catch(retryErr => {
                            console.error("Failed to reload user after retry:", retryErr);
                        });
                    }, 1000);
                }
            }
        } catch (error) {
            console.error("Task update failed", error);
            throw error;
        }
    }, [selectedTask, reloadUser]);

    const handleDeleteTask = useCallback(async (taskId: string) => {
        try {
            await apiDeleteTask(taskId);
            triggerRefresh();
            if (selectedTask?.id === taskId) {
                setSelectedTask(null);
            }
        } catch (error) {
            console.error("Task deletion failed", error);
            throw error;
        }
    }, [selectedTask]);

    const handleDecomposeTask = useCallback(async (taskId: string) => {
        try {
            await apiDecomposeTask(taskId);
            triggerRefresh();
        } catch (error) {
            console.error("Task decomposition failed", error);
            throw error;
        }
    }, []);

    const handleEnrichTask = useCallback(async (taskId: string) => {
        try {
            const res = await apiEnrichTask(taskId);
            triggerRefresh();
            return res;
        } catch (error) {
            console.error("Task enrichment failed", error);
            throw error;
        }
    }, []);

    return (
        <TaskContext.Provider value={{
            isCreateModalOpen,
            initialDate,
            selectedTask,
            openCreateModal,
            closeCreateModal,
            openDetailsModal,
            closeDetailsModal,
            handleCreateTask,
            handleUpdateTask,
            handleDeleteTask,
            handleDecomposeTask,
            handleEnrichTask,
            refreshTrigger
        }}>
            {children}
        </TaskContext.Provider>
    );
}

export function useTasks() {
    const context = useContext(TaskContext);
    if (context === undefined) {
        throw new Error("useTasks must be used within a TaskProvider");
    }
    return context;
}
