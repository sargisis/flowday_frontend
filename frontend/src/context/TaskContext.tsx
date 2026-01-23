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

    const handleCreateTask = async (title: string, priority: string, dueDate?: string) => {
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
    };

    const handleUpdateTask = async (taskId: string, updates: Partial<Task>) => {
        try {
            await apiUpdateTask(taskId, updates);
            triggerRefresh();

            // Update selected task if it's the one being updated
            if (selectedTask?.id === taskId) {
                setSelectedTask(prev => prev ? { ...prev, ...updates } : null);
            }

            // If task was completed, refresh user to update XP/Level (non-blocking)
            if (updates.status?.toLowerCase() === 'done') {
                // Use setTimeout to defer reloadUser and prevent blocking
                // This prevents WebSocket disconnection issues
                setTimeout(() => {
                    reloadUser().catch(err => {
                        // Silently fail - user will be updated on next page refresh
                        console.warn("Failed to reload user after task completion:", err);
                    });
                }, 500);
            }
        } catch (error) {
            console.error("Task update failed", error);
            throw error;
        }
    };

    const handleDeleteTask = async (taskId: string) => {
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
    };

    const handleDecomposeTask = async (taskId: string) => {
        try {
            await apiDecomposeTask(taskId);
            triggerRefresh();
        } catch (error) {
            console.error("Task decomposition failed", error);
            throw error;
        }
    };

    const handleEnrichTask = async (taskId: string) => {
        try {
            const res = await apiEnrichTask(taskId);
            triggerRefresh();
            // Return full result (supports both old string-only and new object format if API changes)
            return res;
        } catch (error) {
            console.error("Task enrichment failed", error);
            throw error;
        }
    };

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
